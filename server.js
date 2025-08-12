require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const app = express();
const todoRoutes = require("./routes/tododb.js");
const { todos } = require("./routes/todo.js");
const db = require("./database/db.js"); // Import database connection
const port = process.env.PORT || 3001; // Use environment variable or default to 3001

app.use(express.json());
//atur EJS sebagai view engine
app.set("view engine", "ejs");

app.use("/todos", todoRoutes);

app.get("/", (req, res) => {
  res.render("index");//rendering the index.ejs file
});

app.get("/contact", (req, res) => {
  res.render("contact");//rendering the contact.ejs file
});

app.get("/todos-data", (req, res) => {
  res.json(todos);
});

app.get("/todo-view", (req, res) =>{
  db.query("SELECT * FROM todos", (err, todos) =>{
    if (err) return res.status(500).send("Internal Server Error");
    res.render("todo",{
      todos: todos
    })
  });
});

app.get("/todos-list", (req, res) => {
  res.render("todospage", { todos: todos });
});

app.use((req, res, next) => {
  res.status(404).render("404"); 
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});