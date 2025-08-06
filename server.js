const express = require('express');
const app = express();
const port = 3001;

const { router: todoRouter } = require("./routes/todo");

// Middleware
app.use(express.json());

// View Engine
app.set('view engine', 'ejs');

// Routes
app.use("/todos", todoRouter); // API route

app.get('/', (req, res) => {
  res.render('index'); // views/index.ejs
});

app.get('/contact', (req, res) => {
  res.render('contact'); // views/contact.ejs
});

// Middleware 404
app.use((req, res) => {
  res.status(404).send('Page not found 404');
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
