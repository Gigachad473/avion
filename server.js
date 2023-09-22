const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
require("dotenv").config();
const mysql = require("mysql2");
const schedule = require("node-schedule");
const fs = require("fs");
const nodemailer = require("nodemailer");
const path = require("path");
const app = express();
const port = 3000;
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_TEST}`);
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",

  auth: {
    user: process.env.EMAIL_ACCOUNT,
    pass: process.env.EMAIL_PASSWORD,
  },
});

//Routing

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "129urieodsfoiu2uroikjshohkfskkfdsjfL:@fjgslgksdf",
    resave: false,
    saveUninitialized: false,
  })
);

let staticPath = path.join(__dirname, "public");
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});
app.get("/the-lucy-lamp", (req, res) => {
  res.sendFile(path.join(`${staticPath}/products`, "lamp.html"));
});
app.get("/the-dandy-chair", (req, res) => {
  res.sendFile(path.join(`${staticPath}/products`, "chair.html"));
});
app.get("/rustic-vase-set", (req, res) => {
  res.sendFile(path.join(`${staticPath}/products`, "vaseset.html"));
});
app.get("/the-silky-vase", (req, res) => {
  res.sendFile(path.join(`${staticPath}/products`, "vase.html"));
});
app.get("/checkout", (req, res) => {
  res.sendFile(path.join(staticPath, "checkout.html"));
});
app.get("/unsubscribe", (req, res) => {
  res.sendFile(path.join(staticPath, "unsubscribe.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(staticPath, "login.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(staticPath, "register.html"));
});

//DB

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});
const mailer = async function (title, obj) {
  try {
    const email = "Your static email text here"; // Replace with your static email text
    // const text = replaceHTML(email, obj);

    db.query("SELECT email FROM subscriptions", (err, results) => {
      if (err) {
        console.error("MySQL query error:", err);
      } else {
        results.forEach((row) => {
          const recipientEmail = row.email;

          transporter.sendMail(
            {
              from: `${process.env.contactEmail} <${process.env.contactEmail}>`,
              to: recipientEmail,
              subject: title,
              replyTo: process.env.contactEmail,
              headers: {
                "Mime-Version": "1.0",
                "X-Priority": "3",
                "Content-type": "text/html; charset=iso-8859-1",
              },
              html: email, // Use the static email text here
            },
            (err) => {
              if (err) {
                console.error("Email sending error:", err);
              } else {
                console.log(
                  `Email sent to ${recipientEmail} at ${new Date().toISOString()}`
                );
              }
            }
          );
        });
      }
    });
  } catch (e) {
    console.error("Error reading email template:", e);
  }
};
// Subscription route
app.post("/subscribe/email", async (req, res) => {
  const email = req.body.email;

  // Check if the email exists in the database
  db.query(
    "SELECT * FROM subscriptions WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("MySQL query error:", err);
        res
          .status(500)
          .json({ message: "Error saving your email", code: "02" });
      } else if (results.length === 0) {
        // Email doesn't exist, validate and add to the database
        if (validateEmail(email)) {
          db.query(
            "INSERT INTO subscriptions (email) VALUES (?)",
            [email],
            (err) => {
              if (err) {
                console.error("MySQL query error:", err);
                res
                  .status(500)
                  .json({ message: "Error saving your email", code: "02" });
              } else {
                // Send the "hello" email immediately
                transporter.sendMail({
                  from: `${process.env.contactEmail} <${process.env.contactEmail}>`,
                  to: email,
                  subject: "Welcome email",
                  replyTo: process.env.contactEmail,
                  headers: {
                    "Mime-Version": "1.0",
                    "X-Priority": "3",
                    "Content-type": "text/html; charset=iso-8859-1",
                  },
                  html: `Welcome to our newsletter,
                You can unsubscribe by clicking here: <a href="https://avion-l631.onrender.com/unsubscribe">Unsubscribe</a>`,
                });

                res
                  .status(200)
                  .json({ message: "User has subscribed", code: "03" });
              }
            }
          );
        } else {
          res.status(400).json({ message: "Not a valid email", code: "02" });
        }
      } else {
        res
          .status(201)
          .json({ message: "User Already Subscribed", code: "02" });
      }
    }
  );
});
// Check if an email exists in the database
app.get("/subscribe/check/:email", (req, res) => {
  const email = req.params.email;

  // Perform a database query to check if the email exists
  db.query(
    "SELECT * FROM subscriptions WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("MySQL query error:", err);
        res.status(500).json({ message: "Error checking email", code: "02" });
      } else {
        if (results.length === 0) {
          // Email doesn't exist, return a response indicating it's not found
          res.status(404).json({ message: "Email not found", code: "01" });
        } else {
          // Email exists, return a response indicating it's found
          res.status(200).json({ message: "Email found", code: "03" });
        }
      }
    }
  );
});

// Unsubscribe route
app.post("/unsubscribe", (req, res) => {
  const { email } = req.body;
  console.log(email);
  const query = "SELECT * FROM subscriptions WHERE email = ?";

  db.query(query, [email], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      // User not found in the database
      return res.status(422).json({ error: "User not found" });
    }

    // User found, handle the unsubscribe process
    // ...
    // Send a success response if necessary
    return res.status(200).json({ message: "Unsubscribe successful" });
  });

  // Check if the email exists in the database and delete the row
  const sql = "DELETE FROM subscriptions WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Error unsubscribing:", err);
      res.status(500).send("Error unsubscribing.");
    } else if (result.affectedRows === 0) {
      // Email not found in the database
      res.status(404).send("Email not found in the database.");
    } else {
      res.send(`Unsubscribed email: ${email}`);
    }
  });
});

// Schedule the email sending job
schedule.scheduleJob("00 58 11 * * 3", () => {
  mailer("This is our Subscription Email", {
    content: "Hello, welcome to our email 👋",
  });
});

// Utility function to validate email
const validateEmail = (email) => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

// Utility function to replace placeholders in HTML
const replaceHTML = (html, replacements) => {
  for (const key in replacements) {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, replacements[key]);
  }
  return html;
};

// Handle registration (Step 5)
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashedPassword],
    (err) => {
      if (err) {
        console.error("Registration failed:", err);
        res.redirect("/register");
      } else {
        res.redirect("/login");
      }
    }
  );
});

// Login form (HTML)
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

// Handle login (Step 6)
app.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Login failed:", err);
        res.redirect("/login");
      } else if (results.length > 0) {
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        // Set the session cookie maxAge based on the "Remember Me" checkbox
        if (rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        }

        if (match) {
          req.session.userId = user.id;
          res.redirect("/profile");
        } else {
          res.redirect("/login");
        }
      } else {
        res.redirect("/login");
      }
    }
  );
});

app.get("/profile", (req, res) => {
  if (req.session.userId) {
    const userId = req.session.userId;

    // Fetch user data
    db.query(
      "SELECT email FROM users WHERE id = ?",
      [userId],
      (userErr, userResults) => {
        if (userErr) {
          console.error("Error fetching user data:", userErr);
          res.redirect("/login");
        } else {
          const email = userResults[0].email;

          // Fetch user's orders
          db.query(
            "SELECT order_id, order_date FROM orders2 WHERE user_id = ?",
            [userId],
            (orderErr, orderResults) => {
              if (orderErr) {
                console.error("Error fetching user's orders:", orderErr);
                res.redirect("/login");
              } else {
                const orders = orderResults.map((row) => ({
                  orderId: row.order_id,
                  orderDate: row.order_date,
                }));

                // Render the profile page with user data and orders
                res.render("profile.ejs", { email, orders });
              }
            }
          );
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});


// "Stay Signed In" Feature (Step 8)
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});





app.post("/charge", async (req, res) => {
  const token = req.body.token;
  const amount = req.body.amount; // Add this line to receive the payment amount from the frontend
  console.log(amount);

  try {
    // Create a charge using the token and the received amount
    const charge = await stripe.charges.create({
      amount: amount * 100, // Convert amount to cents (Stripe requires it in cents)
      currency: "usd", // Adjust to your currency
      description: "Sample Charge",
      source: token,
    });

    // Payment succeeded
    res.json({ success: true });
  } catch (error) {
    // Payment failed
    res.json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
