const express = require('express')

// config - express
const app = express()

// endpoint - posts
app.get('/posts', (req, res) => {
  const posts = [
    {
      caption: 'Golden Japan man',
      location: 'Japan',
    },
    {
      caption: 'Gate Bridge',
      location: 'San Francisco, United States',
    }
  ]
  res.send(posts)
})

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000/`)
})
