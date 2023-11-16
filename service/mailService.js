import nodemailer from "nodemailer";

export async function sendMail(data, email) {
  // Create a transporter for sending the email
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
    },
  });
  console.log("transport", transporter);
  await new Promise((resolve, reject) => {
    // verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });
  // Define the options for the email
  let mailOptions = {
    from: process.env.NEXT_PUBLIC_EMAIL,
    to: email,
    subject:
      "Your Child's Recent YouTube Activity - Insightful Overview and Discussion Topics",
    html: `
        <html>
          <head>
            <style>
              /* Add your custom CSS styles here */
            </style>
          </head>
          <body>
            <h1>Your Child's Recent YouTube Activity</h1>
            <p>Dear Parent,</p>
            <p>${data.introduction}</p>
            
            <h2>Content Analysis</h2>
            <ul>
              ${data.content_analysis
                .map(
                  (analysis) => `
                <li>
                  <h3>${analysis.topic}</h3>
                  <p>${analysis.content}</p>
                </li>
              `
                )
                .join("")}
            </ul>
            
            <h2>Psychological Analysis</h2>
            <p>${data.psych_analysis.overview}</p>
            <h3>Topics to Discuss:</h3>
            <ul>
              ${data.psych_analysis.topics_to_discuss
                .map(
                  (topic) => `
                <li>${topic}</li>
              `
                )
                .join("")}
            </ul>
            
            <p>${data.closing}</p>
            <p>${data.sign_off}</p>
          </body>
        </html>
      `,
  };
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("trahefwef");
        console.log(error);
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info);
      }
    });
  });
}
