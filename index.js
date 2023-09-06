// dependencies
const express = require('express')
const serviceAccount = require('./serviceAccountKey.json');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

// config - express
const app = express()
// config - firebase
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

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
app.get('/createPosts', async (req, res) => {

  // 允許任何服務都可以取得該 service point
  res.set('Access-Control-Allow-Origin', '*')
  res.send('createPosts')
})

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000/`)
})
