// dependencies
const express = require('express')
const serviceAccount = require('./serviceAccountKey.json');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

let inspect = require('util').inspect
const busboy = require('busboy');
let path = require('path');
let os = require('os');
let fs = require('fs');
let UUID = require('uuid-v4');

// config - express
const app = express()
// config - firebase
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'quasagram-573f0.appspot.com'
});

const db = getFirestore();
let bucket = getStorage().bucket();

// endpoint - posts
app.get('/posts', async (req, res) => {
  const posts = []
  const snapshot = await db.collection('posts').orderBy('date', 'desc').get();

  // 允許任何服務都可以取得該 service point
  res.set('Access-Control-Allow-Origin', '*')

  snapshot.forEach((doc) => {
    posts.push(doc.data());
  });

  res.send(posts)
})



// endpoint - create posts
app.post('/createPosts', async (req, res) => {

  // 允許任何服務都可以取得該 service point
  res.set('Access-Control-Allow-Origin', '*')
  let uuid = UUID();

  const bb = busboy({ headers: req.headers });
  let fields = {};
  let fileData = {};

  bb.on('file', (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    console.log(
      `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
      filename,
      encoding,
      mimeType
    );

    let filePath = path.join(os.tmpdir(), filename)

    file.pipe(fs.createWriteStream(filePath))
    fileData = { filePath, mimeType }
  });

  bb.on('field', (name, val, info) => {
    fields[name] = val;
  });

  bb.on('close', () => {
    bucket.upload(
      fileData.filePath,
      {
        uploadType: 'media',
        metadata: {
          metadata: {
            contentType: fileData.mimeType,
            firebaseStorageDownloadTokens: uuid
          }
        },
      },
      (err, uploadedFile) => {
        if (!err) createDocument(uploadedFile)
      }
    )
    // res.writeHead(303, { Connection: 'close', Location: '/' });
  });

  // function
  const createDocument = (uploadedFile) => {
    db.collection('posts').doc(fields.id).set({
      id: fields.id,
      caption: fields.caption,
      location: fields.location,
      date: +fields.date,
      imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`
    })
    .then(() => {
      res.send(`Post added: ${fields.id}`);
    });
  }

  req.pipe(bb);
})

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000/`)
})
