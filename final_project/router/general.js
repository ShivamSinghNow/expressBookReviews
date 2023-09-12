const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.json({ message: "User already exists!" });
        }
    }
    return res.json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    let myPromise = new Promise((resolve, rejct) => {
        resolve(books);
    })

    myPromise.then((success) => {
        res.send(JSON.stringify(success, null, 4));
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const ISBN = req.params.isbn;
    let myPromise = new Promise((resolve, reject) => {
        resolve(books[ISBN]);
    })

    myPromise.then((success) => {
        res.send(success);
    })
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const Author = req.params.author;
    let myPromise = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        let filtered_books = [];

        bookKeys.forEach(key => {
            if (books[key].author === Author) {
                filtered_books.push(books[key]);
            }
        });

        if (filtered_books.length === 0) {
            reject('No books were found for this author');
        } else {
            resolve(filtered_books);
        }
    })

    myPromise.then((filtered_books) => {
        res.send(filtered_books);
    }).catch((error) => {
        res.send({ message: error });
    })
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const Title = req.params.title;

    let MyPromise = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        let filtered_books = [];
        bookKeys.forEach(key => {
            if (books[key].title === Title) {
                filtered_books.push(books[key]);
            }
        });

        if (filtered_books.length === 0) {
            reject('No books are found for this author'); 
        }else {
            resolve(filtered_books); 
        }
    })

    MyPromise.then((filtered_books) =>{
        res.send(filtered_books); 
    }).catch((error) => {
        res.send({message: error}); 
    })
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const ISBN = req.params.isbn;
    res.send(books[ISBN].reviews);
});

module.exports.general = public_users;


