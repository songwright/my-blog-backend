import express from 'express'; // This is the original line from the tutorial.
// const express = require("express"); // This is the usual way to bring in express.
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const app = express();

app.use(bodyParser.json());

app.get('/api/articles/:name', async (req, res) => {
  try {
      const articleName = req.params.name;

      const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
      const db = client.db('my-blog');

      const articleInfo = await db.collection('articles').findOne({ name: articleName });
      res.status(200).json(articleInfo);

      client.close();
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to database', error});
  }

})

app.post('/api/articles/:name/upvote', async (req, res) => {
  try {

      const articleName = req.params.name;
      
      const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
      const db = client.db('my-blog');
      
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
      
      client.close();
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to database', error});
  }
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
