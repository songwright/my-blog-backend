// import express from 'express'; This is the bad line from the tutorial.
const express = require("express");
const app = express();

app.get('/hello', (req, res) => res.send('Hello!'));

app.listen(8000, () => console.log('Listening on port 8000'));

