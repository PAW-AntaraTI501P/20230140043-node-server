require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001; // Menambahkan port default jika tidak ada di .env

// Data dummy (seharusnya dari database, tapi untuk sekarang kita pakai array)
let todos = [
    { id: 1, task: "Belajar Node.js" },
    { id: 2, task: "Membuat API" },
];

// ===================================
//            MIDDLEWARE
// ===================================
// Middleware untuk membaca data JSON (untuk API)
app.use(express.json());
// Middleware untuk membaca data dari form HTML (PENTING!)
app.use(express.urlencoded({ extended: true }));

// Mengatur EJS sebagai View Engine
app.set('view engine', 'ejs');

// ===================================
//          RUTE HALAMAN
// ===================================
// Halaman utama
app.get('/', (req, res) => {
  res.render('index');
});

// Halaman contact
app.get('/contact', (req, res) => {
  res.render('contact');
});

// Halaman untuk menampilkan semua todos
app.get('/todospages', (req, res) => {
  res.render('todospages', { todos: todos }); // Kirim array todos ke EJS
});


// RUTE UNTUK MENAMBAH DATA BARU (CREATE)
app.post('/todos/add', (req, res) => {
    const newId = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
    const newTask = {
        id: newId,
        task: req.body.task
    };
    todos.push(newTask);
    res.redirect('/todospages');
});

// RUTE UNTUK MEMPROSES DATA YANG DIEDIT (UPDATE)
app.post('/todos/update/:id', (req, res) => {
    const idToUpdate = parseInt(req.params.id);
    const todo = todos.find(t => t.id === idToUpdate);

    if (todo) {
        todo.task = req.body.task;
    }
    res.redirect('/todospages');
});

// RUTE UNTUK MENGHAPUS DATA (DELETE)
app.post('/todos/delete/:id', (req, res) => {
    const idToDelete = parseInt(req.params.id);
    todos = todos.filter(t => t.id !== idToDelete);
    res.redirect('/todospages');
});

// ===================================
//       MIDDLEWARE & SERVER
// ===================================
// Middleware 404 (jika halaman tidak ditemukan)
app.use((req, res) => {
  res.status(404).send('Page not found 404');
});

// Menjalankan Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});