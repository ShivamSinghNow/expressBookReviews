const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    
    if(users[username]){
        return res.json('username already exists'); 
    }

    return res.json({message:'Registration is successful'}); 
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const ISBN = req.params.isbn;
    res.send(books[ISBN]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const Author = req.params.author;
    const bookKeys = Object.keys(books);
    let filtered_books = [];
    bookKeys.forEach(key => {
        if (books[key].author === Author) {
            filtered_books.push(books[key]);
        }
    });

    if (filtered_books.length === 0) {
        return res.status(404).json({ message: 'No books found for this author.' });
    }

    res.send(filtered_books);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const Title = req.params.title;
    const bookKeys = Object.keys(books);
    let filtered_books = [];
    bookKeys.forEach(key => {
        if (books[key].title === Title) {
            filtered_books.push(books[key]);
        }
    });

    if (filtered_books.length === 0) {
        return res.status(404).json({ message: 'No books found for this author.' });
    }

    res.send(filtered_books);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const ISBN = req.params.isbn;
    res.send(books[ISBN].reviews);
});

module.exports.general = public_users;

