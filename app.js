const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1/library_db', { useNewUrlParser: true, useUnifiedTopology: true });

let db = mongoose.connection;

// Check connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err) => {
    console.error(err);
});

// Book Schema
const bookSchema = new mongoose.Schema({
    bookName: String,
    bookAuthor: String,
    bookPages: Number,
    bookPrice: Number,
    bookState: { type: String, default: "Available" }
});

const Book = mongoose.model('Book', bookSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Home route
app.get("/", async (req, res) => {
    try {
        const books = await Book.find({});
        res.render("home", { data: books });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Add book route
app.post("/", async (req, res) => {
    const newBook = new Book({
        bookName: req.body.bookName,
        bookAuthor: req.body.bookAuthor,
        bookPages: req.body.bookPages,
        bookPrice: req.body.bookPrice
    });

    try {
        await newBook.save();
        res.redirect("/");
    } catch (err) {
        res.status(500).send(err);
    }
});

// Issue book route
app.post('/issue', async (req, res) => {
    try {
        await Book.findOneAndUpdate({ bookName: req.body.bookName }, { bookState: "Issued" });
        res.redirect("/");
    } catch (err) {
        res.status(500).send(err);
    }
});

// Return book route
app.post('/return', async (req, res) => {
    try {
        await Book.findOneAndUpdate({ bookName: req.body.bookName }, { bookState: "Available" });
        res.redirect("/");
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete book route
app.post('/delete', async (req, res) => {
    try {
        await Book.findOneAndDelete({ bookName: req.body.bookName });
        res.redirect("/");
    } catch (err) {
        res.status(500).send(err);
    }
});

// Start the server
app.listen(3000, () => {
    console.log("App is running on port 3000");
});
