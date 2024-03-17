const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  "username": "nouman",
  "password": "123"
}, {
  "username": "Ali",
  "password": "123"

}];

const isValid = (username) => {
  // Check if the username exists in the array of users
  return users.some(user => user.username === username);
}

// Function to check if username and password match the records
const authenticatedUser = (username, password) => {
  // Find the user with the provided username
  const user = users.find(user => user.username === username);
  // If user is not found or password doesn't match, return false
  if (!user || user.password !== password) {
      return false;
  }
  // If username and password match, return true
  return true;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the user exists and if the password is correct
  if (authenticatedUser(username, password)) {
    // Generate JWT token
    const token = jwt.sign({ username }, 'secret_key'); // Replace 'secret_key' with your actual secret key

    // Save user credentials for the session
    users.push({ username, token });

    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header

  // Verify token
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      const username = decoded.username;
      // Find if user has already reviewed the book
      const userReviewIndex = books.findIndex(book => book.isbn === isbn && book.username === username);
      if (userReviewIndex !== -1) {
        // Update existing review
        books[userReviewIndex].review = review;
        return res.status(200).json({ message: "Review updated successfully" });
      } else {
        // Add new review
        books.push({ isbn, username, review });
        return res.status(201).json({ message: "Review added successfully" });
      }
    }
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header

  // Verify token
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      const username = decoded.username;
      // Filter and delete the review based on session username
      const filteredBooks = books.filter(book => !(book.isbn === isbn && book.username === username));
      if (filteredBooks.length === books.length) {
        return res.status(404).json({ message: "Review not found or you are not authorized to delete this review" });
      } else {
        books = filteredBooks;
        return res.status(200).json({ message: "Review deleted successfully" });
      }
    }
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
