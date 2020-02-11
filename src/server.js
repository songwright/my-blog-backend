import express from 'express'; // This is the original line from the tutorial.
// const express = require("express"); // This is the usual way to bring in express.
const app = express();

app.get('/hello', (req, res) => res.send('Hello!'));

app.listen(8000, () => console.log('Listening on port 8000'));

