const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const Review = req.params.review;

    const isbn = req.params.isbn;

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!Array.isArray(book.reviews)) {
        book.reviews = [];
    }

    const username = req.session && req.session.authorization && req.session.authorization.username;
    if (!username) {
        return res.status(400).json({ message: "Username not found in session" });
    }

    const existingReview = book.reviews.find(review => review.username === username);
    if (existingReview) {
        // User has already reviewed, update the review
        existingReview.content = Review;
    } else {
        // New review
        book.reviews.push({
            username: username,
            content: Review
        });
    }

    // Save book changes (this would typically be in a database, but since this is a simple in-memory store, nothing extra is needed)

    // Respond to the client
    res.status(200).json({ message: "Review successfully posted/updated", reviews: book.reviews });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Check if book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Ensure that book.reviews is an array before proceeding
    if (!Array.isArray(book.reviews)) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
    
    // Extract username from the session
    const username = req.session && req.session.authorization && req.session.authorization.username;
    if (!username) {
        return res.status(400).json({ message: "Username not found in session" });
    }

    const initialLength = book.reviews.length;

    // Filter out the reviews written by the session's username
    book.reviews = book.reviews.filter(review => review.username !== username);

    // If no reviews were deleted
    if (initialLength === book.reviews.length) {
        return res.status(404).json({ message: "No reviews found for this user on the specified book" });
    }

    return res.status(200).json({ message: "Successfully deleted the user's review" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
