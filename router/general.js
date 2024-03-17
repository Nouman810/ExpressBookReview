const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // Registering a new user
  const { username, password } = req.body;
  // Check if username already exists
  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }
  // Add the new user
  users[username] = { username, password };
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Sending the list of books
  return res.status(200).json(books); 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  console.log('Requested ISBN:', isbn);
  const book = books[isbn];
  console.log('Found Book:', book);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book);
});

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const authorBooks = Object.values(books).filter(book => book.author === author);
  if (authorBooks.length === 0) {
    return res.status(404).json({ message: "Books by author not found" });
  }
  return res.status(200).json(authorBooks);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const titleBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
  if (titleBooks.length === 0) {
    return res.status(404).json({ message: "Books with title not found" });
  }
  return res.status(200).json(titleBooks);
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  console.log('Requested ISBN:', isbn); // Log the requested ISBN
  const book = books[isbn];
  console.log('Found book:', book); // Log the book object found
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  const reviews = book.reviews || {}; // Check if reviews exist, if not, return an empty object
  return res.status(200).json({ reviews });
});



module.exports.general = public_users;

