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
const jwtSecret = "your-secret-key"; // Change this to a strong secret
const jwt = require("jsonwebtoken"); // Import JWT library


const db = mysql.createPool({
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

//?Routing
// Set the views directory

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let staticPath = path.join(__dirname, "public");
app.set("views", path.join(staticPath, "views"));

// Set the view engine to EJS
app.set("view engine", "ejs");
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

//?DB

db.getConnection((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

//? Subscription Service

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
  db.getConnection((err, connection) => {
    if (err) {
      throw err;
    }
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
  })
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

//? Registration/Login System

function generateUniqueCouponCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const codeLength = 8; // You can adjust the length as needed
  let couponCode = "";

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    couponCode += characters.charAt(randomIndex);
  }

  return couponCode;
}
function calculateExpirationDate() {
  const currentDate = new Date();
  const expirationDate = new Date(currentDate);
  expirationDate.setDate(currentDate.getDate() + 30); // Add 30 days

  // Format the expiration date as a MySQL-friendly date string (YYYY-MM-DD)
  const year = expirationDate.getFullYear();
  const month = (expirationDate.getMonth() + 1).toString().padStart(2, "0");
  const day = expirationDate.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Handle registration (Step 5)
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting a database connection:", err);
    }
  connection.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashedPassword],
    (err, result) => {
      if (err) {
        console.error("Registration failed:", err);
        res.status(408).send("Error")
      } else {
        // Generate a coupon for the registered user
        const couponCode = generateUniqueCouponCode();
        const discountPercentage = 10;
        const userId = result.insertId; // Get the user's ID from the registration result
        const expirationDate = calculateExpirationDate(); // Implement this function

        // Insert the coupon into the database
        connection.query(
          "INSERT INTO coupons (coupon_code, discount_percentage, user_id, expiration_date, status) VALUES (?, ?, ?, ?, ?)",
          [couponCode, discountPercentage, userId, expirationDate, "unused"],
          (couponErr) => {
            if (couponErr) {
              console.error("Coupon generation failed:", couponErr);
            } else {
              console.log("Coupon generated and stored successfully.");
            }
          }
        );

        res.redirect("/login");
        connection.release(); // Release the connection back to the pool

      }
    }
  );
});

});

app.post("/check-profile", (req, res) => {
  const token = req.cookies.token;
if(token) {
  jwt.verify(token, jwtSecret, (err, decoded) => {

    const { userId } = decoded;
    if (userId) {
      res.status(200).send("Success");
    }
  })
} else {
  res.status(404).send("Error");
}


});

// Login form (HTML)
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

// Handle login (Step 6)
app.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting a database connection:", err);
    }

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Login failed:", err);
        connection.release(); // Release the connection back to the pool

        res.status(500).send("Internal Server Error");
      } else if (results.length === 0) {
        connection.release(); // Release the connection back to the pool

        // User does not exist
        res.status(405).send("User Not Found");
      } else {
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
          // Set the session cookie maxAge based on the "Remember Me" checkbox
          const userId = user.id;
          const expiresIn = rememberMe ? "30d" : "1d";
          const token = jwt.sign({ userId }, jwtSecret, { expiresIn });

          res.cookie("token", token, { httpOnly: true });
          connection.release(); // Release the connection back to the pool

          res.redirect("/profile");

        } else {
          connection.release(); // Release the connection back to the pool

          // Email and password do not match
          res.status(401).send("Unauthorized");

        }
      }
    }
  );
});

});


app.get("/profile", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
res.redirect("/login")
    return;
  } else {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        console.log("JWT Error")
      }
  
      const { userId } = decoded;
      db.getConnection((err, connection) => {

      // Fetch user data
      connection.query(
        "SELECT email FROM users WHERE id = ?",
        [userId],
        (userErr, userResults) => {
          if (userErr) {
            console.error("Error fetching user data:", userErr);
            connection.release(); // Release the connection back to the pool

            res.status(407).send("User Error")
          } else {
            const email = userResults[0].email;

            // Fetch user orders based on their email
            connection.query(
              "SELECT * FROM orders2 WHERE user_email = ?",
              [email],
              (orderErr, orderResults) => {
                if (orderErr) {
                  console.error("Error fetching user orders:", orderErr);
                  connection.release(); // Release the connection back to the pool

                  res.status(408).send("Orders Error")
  
                } else {
                  // Fetch user coupons
                  connection.query(
                    "SELECT * FROM coupons WHERE user_id = ? AND status = 'unused' ",
                    [userId],
                    (couponErr, couponResults) => {
                      if (couponErr) {
                        console.error("Error fetching user coupons:", couponErr);
                        connection.release(); // Release the connection back to the pool

                        res.status(409).send("Coupons Error")
  
                      } else {
                        connection.release(); // Release the connection back to the pool

                        
                        // Render the profile view and pass user orders and coupons as variables
                        res.render("profile.ejs", {
                          email,
                          orders: orderResults,
                          coupons: couponResults, // Pass the coupons variable here
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    })

  });
  }

});


// "Stay Signed In" Feature (Step 8)
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});
let shouldMarkCouponAsUsed = false; // Initialize the flag
let results2 = []; // Initialize results as an empty array

app.post("/apply-coupon", (req, res) => {
  const { couponCode } = req.body;
  const token = req.cookies.token;
  if(token) {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      const { userId } = decoded;
  
  
    // Check if the coupon exists and is not used
    db.query(
      "SELECT * FROM coupons WHERE coupon_code = ? AND user_id = ? AND status = 'unused'",
      [couponCode, userId],
      (err, results) => {
        if (err) {
          console.error("Coupon validation failed:", err);
          res.json({ success: false, message: "Coupon validation failed" });
        } else if (results.length === 0) {
          res.json({ success: false, message: "Coupon does not exist or is already used" });
        } else {
          // Get the discount percentage from the database results
          const discountPercentage = results[0].discount_percentage;
  
          // Apply the discount logic here if needed
          // Optionally, update the total amount
  
          // Mark the coupon as used
  results2 = results
          shouldMarkCouponAsUsed = true;
  
  
  
          // Include the discount percentage in the response
          res.json({ success: true, discountPercentage });
        }
      }
    );
  })
  } else {
    res.json({ success: false, message: "You are not logged in" });

  }



});

app.post("/if-procceeded", (req, res) => {
  const { trueOrfalse } = req.body;
  if (trueOrfalse === true && shouldMarkCouponAsUsed) {
    console.log(true)
    // Mark the coupon as used
    db.query(
      "UPDATE coupons SET status = 'used' WHERE id = ?",
      [results2[0].id],
      (updateErr) => {
        if (updateErr) {
          console.error("Coupon update failed:", updateErr);
        }
      }
    );
    } else {
      console.log(false)
    }
})
const crypto = require('crypto');

function generateToken(length) {
  // Define the characters that can be used in the token
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // Initialize an empty token
  let token = '';

  // Generate a random character for the token 'length' number of times
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }

  return token;
}

app.get('/forgot-password', (req, res) => {
  res.sendFile(__dirname + '/public/forgot-password.html');
});
// Nodemailer functionality (Step 4)
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  // Generate a unique reset token
  const resetToken = generateToken(8);

  // Store the token in the database for the user
  db.query(
    'UPDATE users SET reset_token = ? WHERE email = ?',
    [resetToken, email],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('An error occurred while updating the reset token.');
      } else if (result.affectedRows === 0) {
        // User not found, handle this case
        res.status(404).send('User not found.');
      } else {
        // Send the password reset email
        const resetLink = `https://avion-l631.onrender.com/reset-password/${resetToken}`;
        const mailOptions = {
          from: 'ilahristoforov88@gmail.com',
          to: email,
          subject: 'Password Reset',
          text: `Click the following link to reset your password: ${resetLink}`,
        };

        // Send the email
        transporter.sendMail(mailOptions, (emailErr) => {
          if (emailErr) {
            console.error(emailErr);
            res.status(500).send('An error occurred while sending the email.');
          } else {
            res.status(200).send('Password reset email sent successfully.');
          }
        });
      }
    }
  );
});

// Handle password reset (Step 2)
app.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  res.sendFile(__dirname + '/public/reset-password.html');
});

// Handle password reset (Step 3)
app.post('/reset-password/:token', async (req, res) => {

  const { newPassword } = req.body;
  const email = req.body.email
  let token
  try {
    // Retrieve the reset_token from the database
    const result = await new Promise((resolve, reject) => {
      db.query('SELECT * from users WHERE email = ?', [email], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (result.length === 0) {
      res.status(404).send('User not found.');
      return;
    }

    token = result[0].reset_token;
    console.log(token);
  } catch (err) {
    console.log(err)
  }

  // Validate the reset token
  db.query(
    'SELECT * FROM users WHERE reset_token = ?',
    [token],
    async (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('An error occurred while checking the reset token.');
      } else if (results.length === 0) {
        // Token not found or expired, handle this case
        res.status(404).send('Invalid or expired reset token.');
      } else {
        // Update the user's password and clear the reset token
        const userId = results[0].id;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.query(
          'UPDATE users SET password = ?, reset_token = NULL WHERE id = ?',
          [hashedPassword, userId],
          (updateErr) => {
            if (updateErr) {
              console.error(updateErr);
              res.status(500).send('An error occurred while resetting the password.');
            } else {
              res.status(200).send('Password reset successfully. You can now <a href="/login">log in.</a>');
            }
          }
        );
      }
    }
  );
});




//? Payments Processing

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

app.post("/store-order", (req, res) => {
  const orderDetails = req.body;
  console.log(orderDetails);
  const userEmail = req.session.userId
    ? req.session.email
    : "guest@example.com";
  console.log(userEmail);

  // Create an array of formatted product entries
  const productEntries = orderDetails.products.map(
    (product) => `${product.productTitle} * ${product.productAmount}`
  );

  // Join the formatted entries with line breaks
  const cartData = productEntries.join("\n");

  // Convert the order date to your local time (GMT+2)
  const orderDate = new Date(orderDetails.orderDate);
  orderDate.setHours(orderDate.getHours() + 2); // Add 2 hours to convert to GMT+2
  const formattedOrderDate = orderDate
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  // Insert orderDetails into the 'orders' table in the MySQL database
  db.query(
    "INSERT INTO orders2 (total, cartData, name, order_date, user_email) VALUES (?, ?, ?, ?, ?)",
    [
      orderDetails.total,
      cartData,
      orderDetails.name,
      formattedOrderDate,
      userEmail,
    ],
    (error, results, fields) => {
      if (error) {
        console.error("Error storing order in MySQL:", error);
        res.status(500).send("Error storing order. Please try again later.");
      } else {
        console.log("Order stored in MySQL:", results);
        // res.send("Order received and stored successfully.");
      }
    }
  );
setTimeout(function() {
  res.redirect("https://avion-l631.onrender.com/")
})
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
