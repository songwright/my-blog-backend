import express from 'express'; // This is the original line from the tutorial.
// const express = require("express"); // This is the usual way to bring in express.
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const app = express();

app.use(bodyParser.json());

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
    const articleInfo = await db.collection('articles').findOne({ name: articleName});
    await db.collection('articles').updateOne({ name: articleName}, {
      // MongoDB syntax for incrementing the upvote property
      '$set': {
        upvotes: articleInfo.upvotes +1,
      }
    });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName});
    
    res.status(200).json(updatedArticleInfo);
  }, res)
});

app.post('/api/articles/:name/add-comment', (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;

  articlesInfo[articleName].comments.push({ username, text });
  res.status(200).send(articlesInfo[articleName]);
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
