import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/api', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
