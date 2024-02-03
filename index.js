const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { OpenAI } = require("openai");
const nodemailer = require("nodemailer");
const port = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(
  cors({
    origin: ["https://sop-generator-ai.netlify.app"],
    credentials: true,
  })
);

// const openai = new OpenAI();
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

// node mailer

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: process.env.NODE_MAILER_USER,
    pass: process.env.NODE_MAILER_APP_PASSWORD,
  },
});

app.get("/", (req, res) => {
  res.send("WELCOME TO SOP GENERATOR SERVER");
});
async function run() {
  // Send a ping to confirm a successful connection
  try {
    // Send SOP email
    app.post("/sendSOP", async (req, res) => {
      try {
        // Extract information from the request body
        const {
          fullName,
          email,
          age,
          educationLevel,
          institute,
          fieldOfStudy,
          workExperience,
          admittedInCanada,
          programOfStudyInCanada,
          applyingFromCountry,
          futureGoals,
          englishScoresListening,
          englishScoresReading,
          englishScoresSpeaking,
          englishScoresWriting,
          paidFirstYearTuition,
          tuitionFeePaid,
          didGIC,
          gicAmountPaid,
        } = req.body;
        const formResponse = `
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Age:</strong> ${age}</p>
        <p><strong>Highest Level of Education:</strong> ${educationLevel}</p>
        <p><strong>Institute where you completed your highest level of education:</strong> ${institute}</p>
        <p><strong>What did you study:</strong> ${fieldOfStudy}</p>
        
        <p><strong>Do you have any relevant work experience?</strong> ${workExperience}</p>
        <p><strong>What institute did you get admitted to in Canada?</strong> ${admittedInCanada}</p>
        <p><strong>What is your program of study in Canada?</strong> ${programOfStudyInCanada}</p>
        <p><strong>Which country are you applying from?</strong> ${applyingFromCountry}</p>
        <p><strong>What are your future goals?</strong> ${futureGoals}</p>
        <p><strong>English Scores - Listening:</strong> ${englishScoresListening}</p>
        <p><strong>English Scores - Reading:</strong> ${englishScoresReading}</p>
        <p><strong>English Scores - Speaking:</strong> ${englishScoresSpeaking}</p>
        <p><strong>English Scores - Writing:</strong> ${englishScoresWriting}</p>
        <p><strong>Did you pay your first year tuition?</strong> ${paidFirstYearTuition}</p>
        <p><strong>How much tuition fee did you pay?</strong> ${tuitionFeePaid}</p>
        <p><strong>Did you do a GIC?</strong> ${
          didGIC ? "Yes\nAmount Paid towards GIC: " + gicAmountPaid : "No"
        }</p>
      `;

        // Generate personalized SOP using OpenAI GPT-3
        // const generatedSOP = false;
        // as I don't have premium plan I could not generate sop through openai
        const generatedSOP = await generateSOP({
          fullName,
          email,
          age,
          educationLevel,
          institute,
          fieldOfStudy,
          workExperience,
          admittedInCanada,
          programOfStudyInCanada,
          applyingFromCountry,
          futureGoals,
          englishScoresListening,
          englishScoresReading,
          englishScoresSpeaking,
          englishScoresWriting,
          paidFirstYearTuition,
          tuitionFeePaid,
          didGIC,
          gicAmountPaid,
        });
        if (generatedSOP) {
          // Send email with the generated SOP
          const emailTemplate = `
     <p>Dear ${fullName},</p>
     <p>Thank you for providing the information. Here is your personalized Statement of Purpose:</p>
     <p>${generatedSOP}</p>
     <p>Best regards,</p>
     <p>Customized SOP Generator</p>
   `;

          const mailOptions = {
            from: {
              name: "Customized SOP Generator",
              address: process.env.NODE_MAILER_USER,
            }, // sender address
            to: `${email}`, // list of receivers
            subject: "Your Personalized Statement of Purpose", // Subject line
            html: `${emailTemplate}`, // html body
          };
          const info = await transporter.sendMail(mailOptions);
        } else {
          // Send email with the generated SOP
          const emailTemplate = `
 <p>Dear ${fullName},</p>
 <p>Thank you for providing the information. Here is your personalized Statement of Purpose:</p>
 <p>${formResponse}</p>
 <p>Best regards,</p>
 <p>Customized SOP Generator</p>
`;

          const mailOptions = {
            from: {
              name: "Customized SOP Generator",
              address: process.env.NODE_MAILER_USER,
            }, // sender address
            to: `${email}`, // list of receivers
            subject: "Your Personalized Statement of Purpose", // Subject line
            html: `${emailTemplate}`, // html body
          };
          const info = await transporter.sendMail(mailOptions);
        }

        res.status(200).json({ message: "SOP email sent successfully" });
      } catch (error) {
        console.error("Error sending SOP email:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Function to generate SOP using OpenAI GPT-3
    async function generateSOP({
      fullName,
      age,
      educationLevel,
      institute,
      fieldOfStudy,
      workExperience,
      admittedInCanada,
      programOfStudyInCanada,
      applyingFromCountry,
      futureGoals,
      englishScoresListening,
      englishScoresReading,
      englishScoresSpeaking,
      englishScoresWriting,
      paidFirstYearTuition,
      tuitionFeePaid,
      didGIC,
      gicAmountPaid,
    }) {
      // Construct a prompt for OpenAI GPT-3 using the provided information
      const prompt = `
      write a personalized SOP using this questions and answers.
        Full Name: ${fullName}
        Age: ${age}
        Highest Level of Education: ${educationLevel}
        Institute where you completed your highest level of education: ${institute}
        What did you study: ${fieldOfStudy}
        Do you have any relevant work experience? ${workExperience}
        What institute did you get admitted to in Canada? ${admittedInCanada}
        What is your program of study in Canada? ${programOfStudyInCanada}
        Which country are you applying from? ${applyingFromCountry}
        What are your future goals? ${futureGoals}
        English Scores - Listening: ${englishScoresListening}
        English Scores - Reading: ${englishScoresReading}
        English Scores - Speaking: ${englishScoresSpeaking}
        English Scores - Writing: ${englishScoresWriting}
        Did you pay your first year tuition? ${paidFirstYearTuition}
        How much tuition fee did you pay? ${tuitionFeePaid}
        Did you do a GIC? ${
          didGIC ? "Yes\nAmount Paid towards GIC: " + gicAmountPaid : "No"
        }
      `;

      // Make an API call to OpenAI GPT-3
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });
      //   console.log(response.choices[0].message.content);

      return response.choices[0].message.content;
    }
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
    // console.log("db not connecting");
  }
}
run().catch(console.dir);
app.listen(port, (req, res) => {
  console.log(`Listening at port ${port}`);
});
