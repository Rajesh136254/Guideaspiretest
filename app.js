const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");

const cors = require("cors");
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Rajesh@254",
  database: "GuideAspire",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});

// JWT Secret
const JWT_SECRET = "your_jwt_secret";

// Route for the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "GuideAspire.htm"));
});

// Route for the signup page
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Signup.htm"));
});

// Consolidated Signup Endpoint (ONLY ONE)
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    // Check if user exists
    const checkQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        console.error("Database error (check):", err);
        return res.status(500).json({ message: "Server error while checking user." });
      }
      if (results.length > 0) {
        return res.status(400).json({ message: "Email already exists." });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const insertQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      db.query(insertQuery, [name, email, hashedPassword], (err) => {
        if (err) {
          console.error("Database error (insert):", err);
          return res.status(500).json({ message: "Server error while saving user." });
        }
        console.log("User created:", { name, email });
        res.status(201).json({ message: "Signup successful!" });
      });
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Route for the login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Login.htm"));
});

// Login Endpoint (Revised - No JWT)
// Login Endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password || email.trim() === "" || password.trim() === "") {
    console.error("Invalid login input:", { email, password });
    return res.status(400).json({ message: "Email and password are required." });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("Invalid email format:", email);
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    // Check if user exists
    const query = "SELECT * FROM users WHERE email = ?";
    const [results] = await db.promise().query(query, [email]);

    if (results.length === 0) {
      console.error("User not found:", email);
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Password mismatch for email:", email);
      return res.status(400).json({ message: "Invalid email or password." });
    }

    console.log("User logged in successfully:", email);
    res.status(200).json({
      message: "Login successful!",
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Fetch Profile Endpoint
app.get("/profile/:email", (req, res) => {
  const { email } = req.params;
  const query = "SELECT * FROM profile WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error." });
    if (results.length === 0) return res.status(404).json({ message: "Profile not found." });
    res.json(results[0]);
  });
});

// Update Profile Endpoint
app.post("/profile/update", (req, res) => {
  const { email, age, bio } = req.body;
  const query = "UPDATE profile SET age = ?, bio = ? WHERE email = ?";
  db.query(query, [age, bio, email], (err) => {
    if (err) return res.status(500).json({ message: "Server error updating profile." });
    res.json({ message: "Profile updated successfully!" });
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

app.get("/class6-10", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "class6-10.htm"));
});

app.get("/summer", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "summer.htm"));
});

app.get("/class11-12", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "class11-12.htm"));
});

app.get("/grad", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "grad.htm"));
});

// Updated progress endpoints in app.js

// Save progress endpoint
app.post("/progress", async (req, res) => {
  const { email, classNumber, dayNumber } = req.body;
  console.log("Received progress data:", { email, classNumber, dayNumber });

  // Validate inputs
  if (!email || email.trim() === "" || !classNumber || !dayNumber) {
    console.error("Invalid input:", { email, classNumber, dayNumber });
    return res.status(400).json({ error: "Valid email, classNumber, and dayNumber are required." });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("Invalid email format:", email);
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    // Check if user exists
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    const [userResults] = await db.promise().query(checkUserQuery, [email]);

    if (userResults.length === 0) {
      console.error("User does not exist:", email);
      return res.status(400).json({ error: "User does not exist." });
    }

    // Get current progress
    const getProgressQuery = "SELECT completed_days FROM user_progress WHERE email = ? AND class_number = ?";
    const [progressResults] = await db.promise().query(getProgressQuery, [email, classNumber]);

    let completedDays = [];
    if (progressResults.length > 0 && progressResults[0].completed_days) {
      try {
        completedDays = JSON.parse(progressResults[0].completed_days);
        if (!Array.isArray(completedDays)) {
          completedDays = [];
        }
      } catch (parseError) {
        console.error("Error parsing completed_days for email:", email, parseError);
        completedDays = [];
      }
    }

    // Add the new day if not already present
    if (!completedDays.includes(dayNumber)) {
      completedDays.push(dayNumber);
      completedDays.sort((a, b) => a - b);
    }

    // Update or insert progress
    const updateProgressQuery = `
      INSERT INTO user_progress (email, class_number, completed_days) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE completed_days = ?
    `;
    const completedDaysStr = JSON.stringify(completedDays);
    await db.promise().query(updateProgressQuery, [email, classNumber, completedDaysStr, completedDaysStr]);

    console.log("Progress saved successfully:", { email, classNumber, completedDays });
    res.sendStatus(200);
  } catch (err) {
    console.error("Error saving progress for email:", email, err);
    res.status(500).json({ error: "Failed to save progress.", details: err.message });
  }
});

// Get progress endpoint
app.get("/progress/:email/:classNumber", async (req, res) => {
  const { email, classNumber } = req.params;
  console.log("Fetching progress for:", { email, classNumber });

  // Validate inputs
  if (!email || email.trim() === "") {
    console.error("Invalid email:", email);
    return res.status(400).json({ error: "Valid email is required." });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("Invalid email format:", email);
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    // Check if user exists
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    const [userResults] = await db.promise().query(checkUserQuery, [email]);

    if (userResults.length === 0) {
      console.error("User does not exist:", email);
      return res.status(400).json({ error: "User does not exist." });
    }

    // Get progress
    const getProgressQuery = "SELECT completed_days FROM user_progress WHERE email = ? AND class_number = ?";
    const [progressResults] = await db.promise().query(getProgressQuery, [email, classNumber]);

    if (progressResults.length === 0 || !progressResults[0].completed_days) {
      console.log("No progress found for:", { email, classNumber });
      return res.json([]);
    }

    let completedDays;
    try {
      completedDays = JSON.parse(progressResults[0].completed_days);
      if (!Array.isArray(completedDays)) {
        completedDays = [];
      }
    } catch (parseError) {
      console.error("Error parsing completed_days for email:", email, parseError);
      completedDays = [];
    }

    console.log("Progress retrieved:", { email, classNumber, completedDays });
    res.json(completedDays);
  } catch (err) {
    console.error("Error fetching progress for email:", email, err);
    res.status(500).json({ error: "Failed to retrieve progress." });
  }
});


// Forgot Password Route
app.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required." });
  }

  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error." });
    if (results.length === 0) return res.status(400).json({ message: "User does not exist." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
    db.query(updatePasswordQuery, [hashedPassword, email], (err) => {
      if (err) return res.status(500).json({ message: "Failed to update password." });
      res.json({ message: "Password reset successful!" });
    });
  });
});

// Poll Feedback Endpoints
app.post("/submit-poll", (req, res) => {
  const { voteType, reason } = req.body;
  const query = "INSERT INTO poll_feedback (vote_type, reason) VALUES (?, ?)";
  db.query(query, [voteType, reason], (err) => {
    if (err) return res.status(500).json({ error: "Failed to submit feedback." });
    res.json({ message: "Feedback submitted successfully!" });
  });
});

app.get("/poll-counts", (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN vote_type = 'like' THEN 1 ELSE 0 END) AS likeCount,
      SUM(CASE WHEN vote_type = 'dislike' THEN 1 ELSE 0 END) AS dislikeCount
    FROM poll_feedback
  `;
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to fetch poll counts." });
    res.json(result[0]);
  });
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});