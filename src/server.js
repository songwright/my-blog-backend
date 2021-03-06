import express from 'express'; // This is the original line from the tutorial.
// const express = require("express"); // This is the usual way to bring in express.
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path'; // Needed for static build

const app = express();

app.use(express.static(path.join(__dirname, '/build'))); // Where to serve 
//static files. Needed for static build.
app.use(bodyParser.json()); // Parse the object body from requests.

const withDB = async (operations, res) => {
  // Perform database functions
  try {
    // Connect to MongoDB client
    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
    // Get MongoDB database
    const db = client.db('my-blog');

    // This connects to an endpoint function.
    await operations(db);

    // Close database client
    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to database', error});
  }
}

app.get('/api/articles/:name', async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;

    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    res.status(200).json(articleInfo);
  }, res);
});

app.post('/api/articles/:name/upvote', async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;
    
    // Database query
    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    await db.collection('articles').updateOne({ name: articleName }, {
      // MongoDB syntax for incrementing the upvote property
      '$set': {
        upvotes: articleInfo.upvotes +1,
      }
    });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
    
    res.status(200).json(updatedArticleInfo);
  }, res);
});

app.post('/api/articles/:name/add-comment', (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;

  withDB(async (db) => {
    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    await db.collection('articles').updateOne({ name: articleName }, {
      '$set': {
        comments: articleInfo.comments.concat({ username, text })
      }
    });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
    res.status(200).json(updatedArticleInfo);
  }, res); // Pass response object to withDB.
});

// This app.get is needed for the static build.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html')); // All requests
  // not caught by other API routes should be passed on to our app (in build).
})

app.listen(8000, () => console.log('Listening on port 8000'));

// app.get('/hello', (req, res) => res.send('Hello!'));
// app.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}`));
// app.post('/hello', (req, res) => res.send(`Hello ${req.body.name}!`));

// const articlesInfo = {
//   'learn-react': {
//     upvotes: 0,
//     comments: []
//   },
//   'learn-node': {
//     upvotes: 0,
//     comments: []
//   },
//   'my-thoughts-on-resumes': {
//     upvotes: 0,
//     comments: []
//   }
// }
