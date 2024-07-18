const express = require('express');
const https = require('https');
const app = express();
const allroutes = require('./routes/users');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require("dotenv");
const cohere = require('cohere-ai');  // Ensure you have this import
dotenv.config();
cohere.apiKey = process.env.COHERE_API_KEY;
app.use(express.json());


const { usersModel, patientIdModel, reportIdsModel, reportDatasModel, careIDsModel, predictionsModel } = require('./models/user'); // Adjust the path as necessary


const pdfParse = require('pdf-parse');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

app.use(bodyParser.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);



// Chatbot endpoint
app.post('/diagnose', async (req, res) => {
  let { prompt } = req.body;
  if (!prompt) {
    return res.status(400).send("Prompt is required");
  }
  try {
    prompt= prompt + "Your rsponse should consist of 2 parts. The first part is the disease/ diagnosis you made, justification for it with heading Predicted disease: and second part is the risk of the person classify as low, medium or high risk  with heading Risk Prediction: and give a percentage for risk and do not give any other text";
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.send(text);
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to generate content");
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const filePath = path.join(__dirname, req.file.path);

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

  
    fs.unlinkSync(filePath);

  
    const extractedText = data.text;
    console.log("Extracted Text:", extractedText);

  
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `${extractedText} Generate a nested dictionary from the text  then give a dictionary where the primary keys are Patient Details,test categories (e.g., Blood Group, CBC) and each category contains a dictionary of test names as keys and their values as the test result along with their units as a single string without the range. ignore non whitespaces and give correct json format`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      console.log("Generated Text:", generatedText);

      
      let dictionaryString = generatedText.substring(generatedText.indexOf('{'), generatedText.lastIndexOf('}') + 1);

      
      dictionaryString = dictionaryString.replace(/`/g, '').replace(/[\n\r]/g, '').trim();

      console.log("Cleaned Dictionary String:", dictionaryString);

      let dictionary;
      try {
        dictionary = JSON.parse(dictionaryString);
      } catch (parseError) {
        console.log("First parsing error:", parseError);

        
        dictionaryString = dictionaryString.replace(/[^a-zA-Z0-9:{}\[\],\"\' ]/g, '');
        console.log("Further cleaned Dictionary String:", dictionaryString);

        try {
          dictionary = JSON.parse(dictionaryString);
        } catch (finalParseError) {
          console.log("Final parsing error:", finalParseError);

          const patientDetailsStart = dictionaryString.indexOf('{');
          const testResultsStart = dictionaryString.indexOf('testresults');

          if (patientDetailsStart !== -1 && testResultsStart !== -1) {
            const patientDetailsString = dictionaryString.substring(patientDetailsStart, testResultsStart).trim();
            const testResultsString = dictionaryString.substring(testResultsStart + 'testresults'.length).trim();

            try {
              const patientDetails = JSON.parse(patientDetailsString);
              const testResults = JSON.parse(testResultsString);

              dictionary = {
                patientdetails: patientDetails,
                testresults: testResults,
              };
            } catch (manualParseError) {
              console.log("Manual parsing error:", manualParseError);
              return res.status(500).send("Failed to parse generated dictionary");
            }
          } else {
            return res.status(500).send("Failed to parse generated dictionary");
          }
        }
      }

      console.log("Generated Dictionary:", dictionary);


      res.json({ details: dictionary });
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to generate content");
    }
  } catch (error) {
    console.error("Error processing PDF:", error);

   
    fs.unlinkSync(filePath);

    res.status(500).send('Error processing PDF');
  }
});


app.post("/save", async (req, res) => {
  const { userId, week, ...AllData } = req.body;
  let PD = AllData['Patient Details'];
  if (!PD) {
    PD = {
      'Name': AllData['Patient Information'].Name,
      'Sex/Age': AllData['Patient Information']['Sex/Age'],
      'Blood Group': AllData['Blood Group']
    };
    delete AllData['Patient Information'];
  }
  delete AllData['Patient Details'];
  delete AllData['Blood Group'];
  
  const patientData = PD;
  const reportData = AllData;
  const Prediction = "";
  const DocNote = "";
  const dietPlan = "";

  if (!userId || !week || !AllData) {
    return res.status(400).send("User ID, week number, and report data are required");
  }

  try {
    const updatedReport = await reportsModel.findOneAndUpdate(
      { userId, week },
      { patientData, reportData, Prediction, DocNote, dietPlan },
      { upsert: true, new: true }
    );
    res.send({ success: true, message: "Data saved successfully", report: updatedReport });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Internal Server Error: Failed to save data');
  }
});


//----------------------------------------------------------------------------------------
console.log('MONGO_URI:', process.env.MONGO_URI);

// Ensure MONGO_URI is defined
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined. Please add it to your .env file.');
  process.exit(1); // Exit the application if the URI is not defined
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define routes
app.use('/api/users', require('./routes/users'));


const port = 8080;
app.listen(port, () => {
  console.log(`Server listening on port${port}`);
});




























// const express = require('express');
// const mongoose = require('mongoose');
// const https = require('https');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const multer = require('multer');
// const { spawn } = require("child_process");
// const path = require("path");
// const fs = require("fs");

// const app = express();
// app.use(express.json());

// // const pdfParse = require('pdf-parse');

// const dotenv = require('dotenv');
// dotenv.config();

// // const port = 5000;
// // const MONGO_URI = process.env.MONGO_URI;

// const upload = multer({ dest: 'uploads/' });


// // Middleware
// app.use(bodyParser.json());
// app.use(cors());


// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const genAI = new GoogleGenerativeAI(process.env.API_KEY);


// //chatbot endpoint
// app.post('/diagnose',async(req,res)=>{
//   const{prompt} = req.body;
//   if (!prompt) {
//     return res.status(400).send("Prompt is required");
//   }

//   try{
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     res.send(text);
// }catch(error){
//   console.log(error);
//   res.status(500).send("Failed to generate content");
// }
// })


// app.post('/query', (req, res) => {
//   const data = JSON.stringify(req.body);
//   console.log('Received request:', data);

//   const options = {
//       hostname: 'api-inference.huggingface.co',
//       path: '/models/mistralai/Mistral-7B-Instruct-v0.3',
//       method: 'POST',
//       headers: {
//           'Authorization': 'Bearer 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',
//           'Content-Type': 'application/json',
//           'Content-Length': data.length
//       }
//   };

//   const apiReq = https.request(options, (apiRes) => {
//       let body = '';

//       console.log(`Status Code: ${apiRes.statusCode}`);
//       console.log('Headers:', apiRes.headers);

//       apiRes.on('data', (chunk) => {
//           body += chunk;
//       });

//       apiRes.on('end', () => {
//           console.log('Raw API response:', body);
//           if (apiRes.headers['content-type'] && apiRes.headers['content-type'].includes('application/json')) {
//               try {
//                   const result = JSON.parse(body);
//                   res.json(result);
//               } catch (error) {
//                   console.error('Error parsing JSON:', error);
//                   res.status(500).send('Internal Server Error: Failed to parse JSON');
//               }
//           } else {
//               console.error('Non-JSON response received:', body);
//               res.status(500).send(`Internal Server Error: Non-JSON response received: ${body}`);
//           }
//       });
//   });

//   apiReq.on('error', (error) => {
//       console.error('Error querying the model:', error);
//       res.status(500).send('Internal Server Error: Failed to query the model');
//   });

//   apiReq.write(data);
//   apiReq.end();
// });


// // Upload endpoint
// app.post("/upload", upload.single("file"), (req, res) => {
  
//   const filePath = path.join(__dirname, req.file.path);

//   const pythonProcess = spawn("python", ["main.py", filePath]);

//   pythonProcess.stdout.on("data", (data) => {
//     try {
//       res.json({ details: JSON.parse(data.toString()) });
//     } catch (error) {
//       console.error("Error parsing JSON:", error);
//       res.status(500).send("Error parsing output from Python script");
//     }
//   });


//   pythonProcess.stderr.on("data", (data) => {
//     console.error(`stderr: ${data}`);
//     res.status(500).send(data.toString());
//   });

//   pythonProcess.on("close", (code) => {
//     fs.unlinkSync(filePath); // Clean up the uploaded file
//     console.log(`child process exited with code ${code}`);
//   });
// });


// // Save endpoint
// app.post("/save", (req, res) => {
//   const updatedData = req.body;
//   console.log('Received data to save:', updatedData);
//   res.send({ success: true, message: "Data saved successfully" });
//     // Here you can handle the logic to save the updated data
//   // For example, you might save it to a database or a file
//   // This is a placeholder response
// });


// const port = 8080;
// app.listen(port, () => {
//   console.log(`Server listening on port${port}`);
// });

// //----------------------------------------------------------------------------------------
// console.log('MONGO_URI:', process.env.MONGO_URI);

// // Ensure MONGO_URI is defined
// if (!process.env.MONGO_URI) {
//   console.error('MONGO_URI is not defined. Please add it to your .env file.');
//   process.exit(1); // Exit the application if the URI is not defined
// }


// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// // Define routes
// app.use('/api/users', require('./routes/users'));