require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3001;
const todoRoutes = require("./routes/tododb.js");
const db = require("./database/db");

const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");

app.use("/todos", todoRoutes);

// Halaman EJS
app.get("/", (req, res) => {
  res.render("index", { layout: "layouts/main-layout" });
});

app.get("/contact", (req, res) => {
  res.render("contact", { layout: "layouts/main-layout" });
});

// daftar todos via EJS
app.get("/todos-list", (req, res) => {
  db.query("SELECT * FROM todos", (err, todos) => {
    if (err) {
      console.error("Error fetching todos:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("todos-page", { todos: todos, layout: "layouts/main-layout" });
  });
});

// Halaman todo-view EJS
app.get("/todo-view", (req, res) => {
  db.query("SELECT * FROM todos", (err, todos) => {
    if (err) {
      console.error("Error fetching todos:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("todo", { todos: todos, layout: "layouts/main-layout" });
  });
});


// ================== API ==================

// GET semua todos
app.get("/api/todos", (req, res) => {
  const { search } = req.query;
  let query = "SELECT * FROM todos";
  const params = [];

  if (search) {
    query += " WHERE task LIKE ?";
    params.push(`%${search}%`);
  }

  db.query(query, params, (err, todos) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ todos: todos });
  });
});

// POST tambah todo
app.post("/api/todos", (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: "Task is required" });
  }

  const query = "INSERT INTO todos (task, completed) VALUES (?, ?)";
  db.query(query, [task, false], (err, result) => {
    if (err) {
      console.error("Database insert error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(201).json({
      message: "Todo added successfully",
      id: result.insertId,
      task,
      completed: false,
    });
  });
});

// PUT update todo (bisa task atau completed)
app.put("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  let query = "";
  let params = [];

  if (typeof completed === "boolean") {
    query = "UPDATE todos SET completed = ? WHERE id = ?";
    params = [completed, id];
  } else if (task) {
    query = "UPDATE todos SET task = ? WHERE id = ?";
    params = [task, id];
  } else {
    return res.status(400).json({ error: "No valid fields provided" });
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo updated successfully" });
  });
});

// DELETE todo
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM todos WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database delete error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted successfully" });
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
