const axios = require('axios');

async function sendEmail(to, subject, htmlContent) {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: "Hungry Peeps", email: "sarveshkumar9176@gmail.com" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending email via Brevo:", error.response?.data || error.message);
    throw new Error("Failed to send email");
  }
}

module.exports = {
  sendEmail
};
