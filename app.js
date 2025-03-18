const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const path = require("path");
const multer = require("multer");
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
        else{
        
        res.redirect("/login");
        }
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





// Forgot Password Route
app.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;

  // Check if the user exists in the database
  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
          console.error("Error checking user:", err);
          return res.status(500).json({ error: "Failed to check user existence" });
      }

      if (results.length === 0) {
          return res.status(400).json({ error: "User does not exist. Please sign up first." });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password in the database
      const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
      db.query(updatePasswordQuery, [hashedPassword, email], (err) => {
          if (err) {
              console.error("Error updating password:", err);
              return res.status(500).json({ error: "Failed to update password" });
          }

          res.json({ success: true });
      });
  });
});


// API to submit poll feedback
app.post('/submit-poll', (req, res) => {
  const { voteType, reason } = req.body;

  const query = 'INSERT INTO poll_feedback (vote_type, reason) VALUES (?, ?)';
  db.query(query, [voteType, reason], (err, result) => {
    if (err) throw err;
    res.send({ message: 'Feedback submitted successfully!' });
  });
});

// API to fetch poll counts
app.get('/poll-counts', (req, res) => {
  const query = `
    SELECT 
      SUM(CASE WHEN vote_type = 'like' THEN 1 ELSE 0 END) AS likeCount,
      SUM(CASE WHEN vote_type = 'dislike' THEN 1 ELSE 0 END) AS dislikeCount
    FROM poll_feedback
  `;
  db.query(query, (err, result) => {
    if (err) throw err;
    res.send(result[0]);
  });
});


// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// JWT secret
const JWT_SECRET = "your_jwt_secret";

// Middleware to verify JWT
const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Signup endpoint
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into database
  const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(query, [name, email, hashedPassword], (err, result) => {
    if (err) return res.status(400).json({ message: "Email already exists" });

    // Generate JWT
    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET);
    res.status(201).json({ token });
  });
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0)
      return res.status(400).json({ message: "Invalid email or password" });

    const user = results[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, profile_photo: user.profile_photo } });
  });
});





// Signup endpoint
// Signup endpoint
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const query = "INSERT INTO users_profile (name, email, password) VALUES (?, ?, ?)";
    db.query(query, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(400).json({ message: "Email already exists" });
      }

      // Generate JWT
      const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET);
      res.status(201).json({ token });
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Fetch user profile
app.get("/profile", (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const query = "SELECT name, email, profile_photo FROM users_profile WHERE id = ?";
    db.query(query, [decoded.id], (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ message: "User not found" });

      res.json(results[0]);
    });
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});