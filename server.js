const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
require('dotenv').config()
const mysql = require('mysql2');
const schedule = require('node-schedule');
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path')
const app = express();
const port = 3000;
const stripe = require('stripe')(`${process.env.STRIPE_SECRET_TEST}`);


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})
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
app.use(express.static('public'));
let staticPath = path.join(__dirname, "public")
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"))
})
app.get("/the-lucy-lamp", (req, res) => {
    res.sendFile(path.join(`${staticPath}/products`, "lamp.html"))

})
app.get("/the-dandy-chair", (req, res) => {
    res.sendFile(path.join(`${staticPath}/products`, "chair.html"))

})
app.get("/rustic-vase-set", (req, res) => {
  res.sendFile(path.join(`${staticPath}/products`, "vaseset.html"))
})
app.get("/the-silky-vase", (req, res) => {
  res.sendFile(path.join(`${staticPath}/products`, "vase.html"))
})
app.get("/checkout", (req, res) => {
  res.sendFile(path.join(staticPath, "checkout.html"))
})


//DB


db.connect((err) => {
    if (err) {
      console.error('MySQL connection error:', err);
    } else {
      console.log('Connected to MySQL database');
    }
  });
  const mailer = async function (title, obj) {
    try {
      const email = "Your static email text here"; // Replace with your static email text
      // const text = replaceHTML(email, obj);
  
      db.query('SELECT email FROM subscriptions', (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
        } else {
          results.forEach((row) => {
            const recipientEmail = row.email;
  
            transporter.sendMail(
              {
                from: `${process.env.contactEmail} <${process.env.contactEmail}>`,
                to: recipientEmail,
                subject: title,
                replyTo: process.env.contactEmail,
                headers: { 'Mime-Version': '1.0', 'X-Priority': '3', 'Content-type': 'text/html; charset=iso-8859-1' },
                html: email, // Use the static email text here
              },
              (err) => {
                if (err) {
                  console.error('Email sending error:', err);
                } else {
                  console.log(`Email sent to ${recipientEmail} at ${new Date().toISOString()}`);
                }
              }
            );
          });
        }
      });
    } catch (e) {
      console.error('Error reading email template:', e);
    }
  };
  // Subscription route
app.post('/subscribe/email', async (req, res) => {
    const email = req.body.email;

    // Check if the email exists in the database
    db.query('SELECT * FROM subscriptions WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).json({ message: 'Error saving your email', code: '02' });
      } else if (results.length === 0) {
        // Email doesn't exist, validate and add to the database
        if (validateEmail(email)) {
          db.query('INSERT INTO subscriptions (email) VALUES (?)', [email], (err) => {
            if (err) {
              console.error('MySQL query error:', err);
              res.status(500).json({ message: 'Error saving your email', code: '02' });
            } else {
              // Send the "hello" email immediately
              transporter.sendMail({
                from: `${process.env.contactEmail} <${process.env.contactEmail}>`,
                to: email,
                subject: "Welcome email",
                replyTo: process.env.contactEmail,
                headers: { 'Mime-Version': '1.0', 'X-Priority': '3', 'Content-type': 'text/html; charset=iso-8859-1' },
                html: `Welcome to our newsletter`
              })
              
              res.status(200).json({ message: 'User has subscribed', code: '03' });
            }
          });
        } else {
          res.status(400).json({ message: 'Not a valid email', code: '02' });
        }
      } else {
        res.status(201).json({ message: 'User Already Subscribed', code: '02' });
      }
    });
  });
  // Check if an email exists in the database
app.get('/subscribe/check/:email', (req, res) => {
    const email = req.params.email;
  
    // Perform a database query to check if the email exists
    db.query('SELECT * FROM subscriptions WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).json({ message: 'Error checking email', code: '02' });
      } else {
        if (results.length === 0) {
          // Email doesn't exist, return a response indicating it's not found
          res.status(404).json({ message: 'Email not found', code: '01' });
        } else {
          // Email exists, return a response indicating it's found
          res.status(200).json({ message: 'Email found', code: '03' });
        }
      }
    });
  });
  
  // Unsubscribe route
  app.get('/unsubscribe/:email', (req, res) => {
    const email = req.params.email;
  
    db.query('DELETE FROM subscriptions WHERE email = ?', [email], (err, result) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).json({ message: 'Error unsubscribing', code: '02' });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Email not found', code: '01' });
      } else {
        res.status(200).json({ message: 'Email deleted', code: '00' });
      }
    });
  });
  

  
  
  // Schedule the email sending job
  schedule.scheduleJob('00 58 11 * * 3', () => {
    mailer('This is our Subscription Email', { content: "Hello, welcome to our email 👋" });
  });
  
  
  // Utility function to validate email
  const validateEmail = (email) => {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  };
  
  // Utility function to replace placeholders in HTML
  const replaceHTML = (html, replacements) => {
    for (const key in replacements) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, replacements[key]);
    }
    return html;
  };
  app.post('/charge', async (req, res) => {
    const token = req.body.token;

    try {
        // Create a charge using the token
        const charge = await stripe.charges.create({
            amount: 1000, // Amount in cents (adjust to your needs)
            currency: 'usd', // Adjust to your currency
            description: 'Sample Charge',
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