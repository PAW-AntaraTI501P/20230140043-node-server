const express = require('express');

const app = express();
const port = 3001;
app.use(express.json());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/contact', (req, res) => {
  res.render('contact'); 
});

//midleware
app.use((req, res) => {
    res.status(404).send('Page not found 404');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});