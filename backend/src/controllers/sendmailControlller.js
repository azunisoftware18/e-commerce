import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import nodemailer from "nodemailer";

const sendMail = asyncHandler(async (req, res) => {
  const { name, email, subject, message, priority } = req.body;

  // Validation
  if (!name || !subject || !message || !email || !priority) {
    return ApiError.send(res, 400, "All fields are required.");
  }

  // Setup Nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // or try 587 for TLS
    secure: false, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER, // Your admin email
      pass: process.env.EMAIL_PASS, // App password
    },
  });

  // Email to YOU (admin)
  const mailOptions = {
    from: `"${name}" <${email}>`, // Customer's name and email
    to: process.env.EMAIL_USER, // ✅ Send to YOU (admin)
    subject: `New Support Request: ${subject} (Priority: ${priority})`,
    html: `
      <h3>New Support Message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <blockquote>${message}</blockquote>
      <br/>
      <p><i>This message was sent from your website support form.</i></p>
    `,
  };

  // Send email
  await transporter.sendMail(mailOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, "Message sent successfully to admin!"));
});

export { sendMail };
