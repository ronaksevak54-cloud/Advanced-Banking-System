const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});
// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
const sendEmailWithAttachment = async (email, name) => {
  const subject = "Welcome to Backend Ledger";
  const text = `Hello ${name},\n\nThank you for registering with Backend Ledger. We are excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Thank you for registering with Backend Ledger. We are excited to have you on board!<br>Best regards,<br>The Backend Ledger Team</p>`;
  await sendEmail(email, subject, text, html);
};
const sendTransactionEmail = async (email, name,amount,toAccount,fromAccount) => {
  const subject = "Transaction Notification";
  const text = `Hello ${name},\n\nA transaction of amount ₹${amount} has been made to account no ${toAccount} from account no ${fromAccount}\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>A transaction of amount ₹${amount} has been made to account no ${toAccount} from account no ${fromAccount}<br>Best regards,<br>The Backend Ledger Team</p>`;
  await sendEmail(email, subject, text, html);
};
module.exports = {
  sendEmailWithAttachment,
  sendTransactionEmail
};

