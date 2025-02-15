const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // For serving static files
app.use(express.json()); // To parse JSON request bodies

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",         // Replace with your MySQL username
  password: "Rajesh@254", // Replace with your MySQL password
  database: "GuideAspire" // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});

// Route for the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "GuideAspire.htm"));
});

// Route for the signup page
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Signup.htm"));
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  // Simple validation to check if both fields are provided
  if (!email || !password) {
    return res.status(400).send('<script>alert("Both email and password are required."); window.location.href="/signup";</script>');
  }

  // Check for existing user in the database before inserting
  const checkQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).send('<script>alert("An error occurred while checking email."); window.location.href="/signup";</script>');
    }
    if (results.length > 0) {
      return res.send('<script>alert("Email already exists. Please use a different email."); window.location.href="/signup";</script>');
    }

    // Hash the password before inserting
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).send('<script>alert("An error occurred while hashing password."); window.location.href="/signup";</script>');
      }

      const insertQuery = "INSERT INTO users (email, password) VALUES (?, ?)";
      db.query(insertQuery, [email, hashedPassword], (err) => {
        if (err) {
          console.error("Error inserting user into database:", err);
          return res.status(500).send('<script>alert("An error occurred while inserting user."); window.location.href="/signup";</script>');
        }
        res.redirect("/login");
      });
    });
  });
});

// Route for the login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Login.htm"));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).send('<script>alert("Both email and password are required."); window.location.href="/login";</script>');
  }

  // Check if the email exists in the database
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).send('<script>alert("An error occurred while querying the database."); window.location.href="/login";</script>');
    }

    if (results.length > 0) {
      // Compare the hashed password with the stored one
      bcrypt.compare(password, results[0].password, (err, match) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return res.status(500).send('<script>alert("An error occurred while comparing passwords."); window.location.href="/login";</script>');
        }

        if (match) {
          // Store the user's email in localStorage (for frontend use)
          res.send(`<script>localStorage.setItem("userEmail", "${email}"); window.location.href="/course-select";</script>`);
        } else {
          return res.send('<script>alert("Invalid email or password."); window.location.href="/login";</script>');
        }
      });
    } else {
      return res.send('<script>alert("Invalid email or password."); window.location.href="/login";</script>');
    }
  });
});

// Route for the course selection page
app.get("/course-select", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "CourseSelect.htm"));
});

// Routes for specific class levels
app.get("/class1-5", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "class1-5.htm"));
});

app.get("/class6-8", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "class6-8.htm"));
});

app.get("/class9-12", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "class9-12.htm"));
});

app.get("/grad", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "grad.htm"));
});

// Endpoint to fetch progress
app.get('/progress/:email/:classNumber', async (req, res) => {
  const { email, classNumber } = req.params;

  // Check if the user exists in the `users` table
  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ error: 'Failed to check user existence' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'User does not exist. Please sign up first.' });
    }

    // If the user exists, fetch progress
    const fetchProgressQuery = "SELECT day_number FROM user_progress WHERE email = ? AND class_number = ? AND completed = TRUE";
    db.query(fetchProgressQuery, [email, classNumber], (err, results) => {
      if (err) {
        console.error("Error fetching progress:", err);
        return res.status(500).json({ error: 'Failed to retrieve progress' });
      }
      const completedDays = results.map(row => row.day_number); // Extract day numbers
      res.json(completedDays);
    });
  });
});

// Endpoint to save progress
app.post('/progress', async (req, res) => {
  const { email, classNumber, dayNumber } = req.body;

  // Check if the user exists in the `users` table
  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ error: 'Failed to check user existence' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'User does not exist. Please sign up first.' });
    }

    // If the user exists, insert/update progress
    const insertProgressQuery = `
      INSERT INTO user_progress (email, class_number, day_number, completed) 
      VALUES (?, ?, ?, TRUE) 
      ON DUPLICATE KEY UPDATE completed = TRUE
    `;
    db.query(insertProgressQuery, [email, classNumber, dayNumber], (err) => {
      if (err) {
        console.error("Error saving progress:", err);
        return res.status(500).json({ error: 'Failed to save progress' });
      }
      res.sendStatus(200); // Success
    });
  });
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});