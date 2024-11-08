// mailer.js

const nodemailer = require('nodemailer');

// Create a transporter using your email provider's settings
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL, // Your email address (e.g., 'rintureji053_email@gmail.com')
    pass: process.env.EMAIL_PASSWORD, // App password or your email password
  },
});

// Send an email function
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL, // Sender's email address
    to: to, // Recipient's email address
    subject: subject, // Email subject
    text: text, // Email body (plain text)
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = sendEmail;
