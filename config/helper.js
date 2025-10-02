const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

function getISTDate() {
  const date = new Date();
  return date;
}

function generateOTP(length = 6) {
  let otp = "";
  otp = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    alphabets: false,
  });
  return otp;
}

async function sendEmailOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
  });
}

function formatISTDate(dateInput = new Date()) {
  const options = {
    timeZone: "Asia/Kolkata", // IST timezone
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // AM/PM format
  };

  // Returns formatted string like "01-10-2025, 06:32:42 AM"
  let formatted = new Intl.DateTimeFormat("en-GB", options).format(
    new Date(dateInput)
  );

  // Convert "am"/"pm" to uppercase
  formatted = formatted.replace(/am|pm/i, (match) => match.toUpperCase());

  return formatted;
}

function getRandomDeliveryDate() {
  const today = new Date();
  const maxDays = 10;

  // Generate random offset in days (0–10)
  const randomOffset = Math.floor(Math.random() * (maxDays + 1));

  // Calculate delivery date
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + randomOffset);

  // Format options
  const options = { weekday: "long", day: "numeric", month: "short" };

  // Return formatted date string (e.g., "Monday 8 Oct")
  return deliveryDate.toLocaleDateString("en-US", options);
}

// Example usage:
console.log(getRandomDeliveryDate());

const postmanOnlyEndpoints = ["/api/v1/testpostman"];
const bothAccessEndpoints = [
  "/api/wishlist",
  "/decrypt",
  "/api/products/",
  "/api/cart",
];

module.exports = {
  getISTDate,
  generateOTP,
  sendEmailOTP,
  formatISTDate,
  getRandomDeliveryDate,
  postmanOnlyEndpoints,
  bothAccessEndpoints,
};
