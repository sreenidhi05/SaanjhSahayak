const express = require('express');
const https = require('https');
const app = express();
const axios = require('axios');
const allroutes = require('./routes/AllRoutes');
const mongoose = require('mongoose');
const {predictionsModel,reportIdsModel,reportDatasModel}=require("./schemas/allSchemas");
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());
const pdfParse = require('pdf-parse');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");


dotenv.config();
app.use(bodyParser.json());
app.use(cors());
const genAI = new GoogleGenerativeAI(process.env.API_KEY);


const { handleUserQuery } = require('./chatbotHandler'); // Adjust the path as needed
const {
  usersModel,
  patientIdModel,
  careIDsModel,
} = require('./schemas/allSchemas'); 

app.post('/chat', async (req, res) => {
  const { query } = req.body;
  const response = await handleUserQuery(query);
  res.send(response);
});





app.post('/pedict', async (req, res) => {
  const { userId, reportId } = req.body;

  if (!userId || !reportId) {
    return res.status(400).send({ error: 'userId and reportId are required' });
  }

  try {
    // Find the specific report for the user
    const report = await reportDatasModel.findOne({ userId, _id: reportId });

    if (!report || !report.reportPdf) {
      return res.status(404).send({ error: 'Report not found or missing reportPdf data' });
    }

    // Convert the reportPdf object to a string
    let reportText = JSON.stringify(report.reportPdf, null, 2);

    // Prepare data for Gemini
    let prompt = `Analyze the following medical report and provide your prediction. Report:\n${reportText}\n`;
    prompt += " Your response should consist of 2 parts. The first part is the disease/diagnosis you made, justification for it with heading Predicted disease: and the second part is the risk of the person classified as low, medium, or high risk with the heading Risk Prediction: followed by a percentage for risk. Do not include any other text.";

    // Send data to Gemini for prediction
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Log the response text for debugging
    console.log('Gemini API response:', text);

    // Extract the prediction details from the response text
    const [predictedDisease, riskPrediction] = text.split('Risk Prediction:');

    // Check if the response contains the expected parts
    if (!predictedDisease || !riskPrediction) {
      return res.status(500).send({ error: 'Invalid response format from Gemini API' });
    }

    const [diseaseHeading, disease] = predictedDisease.split('Predicted disease:');

    // Extract the numeric risk percentage
    const riskPercentMatch = riskPrediction.match(/(\d+)%/);
    const riskPercent = riskPercentMatch ? parseInt(riskPercentMatch[1], 10) : null;

    if (riskPercent === null) {
      return res.status(500).send({ error: 'Invalid risk percentage format from Gemini API' });
    }

    // Save the prediction in the database
    const newPrediction = new predictionsModel({
      predictionId: new mongoose.Types.ObjectId().toString(),
      userId,
      reportIds: [reportId],
      LLMPrediction: disease ? disease.trim() : 'N/A',
      riskPercent: riskPercent
    });

    await newPrediction.save();

    // Update the reportIdsModel with the new prediction ID
    const reportIds = await reportIdsModel.findOne({ userId });
    reportIds.PredictionID.push(newPrediction.predictionId);
    await reportIds.save();

    // Send the prediction back to the client
    res.send(newPrediction);

  } catch (error) {
    console.error('Error processing diagnosis:', error);
    res.status(500).send({ error: error.message });
  }
});



app.post('/diagnose', async (req, res) => {
  const { userId, reportId } = req.body;

  if (!userId || !reportId) {
    return res.status(400).send({ error: 'userId and reportId are required' });
  }

  try {
    // Find the specific report for the user
    const report = await reportDatasModel.findOne({ userId, _id: reportId });
    console.log(report)
    if (!report || !report.reportPdf) {
      return res.status(404).send({ error: 'Report not found or missing reportPdf data' });
    }


    // working prompt: "based on the given details, what is the possible diagnosis that can be made with the above given details of a patient's medical report? give risk percentage based on the diagnosis you generated. give a detailed analysis as well."

    // Convert the reportPdf object to a string
    let reportText = JSON.stringify(report.reportPdf, null, 2);
    reportText +="based on the given details, what is the possible diagnosis along with health risk percentage that can be made with the above given details of a patient's medical report?";
    // Make the request to the Flask API
    const response = await axios.post('http://localhost:5000/diagnose', {
      content: reportText

    });
    
    const diagnosis = response.data.diagnosis;
    const riskMatch = diagnosis.match(/risk percentage: (\d+)%/i);
    const riskPercent = riskMatch ? parseInt(riskMatch[1], 10) : null;


    // Save the prediction in the database
    const newPrediction = new predictionsModel({
      predictionId: new mongoose.Types.ObjectId().toString(),
      userId,
      reportIds: [reportId],
      LLMPrediction: diagnosis,
      riskPercent: riskPercent
    });

    await newPrediction.save();

    // Update the reportIdsModel with the new prediction ID
    const reportIds = await reportIdsModel.findOne({ userId });
    reportIds.PredictionID.push(newPrediction.predictionId);
    await reportIds.save();

    // Send the prediction back to the client
    res.send(newPrediction);

  } catch (error) {
    console.error('Error processing diagnosis:', error);
    res.status(500).send({ error: error.message });
  }
});





app.post('/chatbot',async(req,res)=>{
  let {prompt} = req.body;
  if (!prompt) {
    return res.status(400).send("Prompt is required");
  }
  try{
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.send(text);
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to generate content");
  }

})


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
      const prompt = `${extractedText} Generate a nested dictionary from the text then give a dictionary where the primary keys are Patient Details, test categories (e.g., Blood Group, CBC) and each category contains a dictionary of test names as keys and their values as the test result along with their units as a single string without the range. Ignore non-whitespaces and give correct JSON format.`;
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
      console.log("Error generating content:", error);
      res.status(500).send("Failed to generate content");
    }

  } catch (error) {
    console.error("Error processing PDF:", error);
    fs.unlinkSync(filePath);
    res.status(500).send('Error processing PDF');
  }
});

app.post("/save", (req, res) => {
  const updatedData = req.body;
  // Handle the logic to save the updated data
  // For example, you might save it to a database or a file
  console.log('Received data to save:', updatedData);
  res.send({ success: true, message: "Data saved successfully" });
});



let db = async () => { 
  try{ 
      console.log(process.env.DBURI);
      await mongoose.connect(process.env.DBURI);
      console.log("connected to database");
  }
  catch(err) {
      console.log('error connecting');
  }
}
db();

app.use('/api', allroutes);
const port = 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
















//==================================================================================
// const express = require('express');
// const https = require('https');
// const app = express();
// const allroutes = require('./routes/AllRoutes');
// const mongoose = require('mongoose');
// const {predictionsModel,reportIdsModel,reportDatasModel}=require("./schemas/allSchemas");
// const cors = require('cors');
// const dotenv = require("dotenv");
// dotenv.config();
// app.use(express.json());
// const pdfParse = require('pdf-parse');

// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
// const bodyParser = require("body-parser");
// const { spawn } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// dotenv.config();
// const genAI = new GoogleGenerativeAI(process.env.API_KEY);


// const { handleUserQuery } = require('./chatbotHandler'); // Adjust the path as needed
// const {
//   usersModel,
//   patientIdModel,
//   careIDsModel,
// } = require('./schemas/allSchemas'); 

// app.post('/chat', async (req, res) => {
//   const { query } = req.body;
//   const response = await handleUserQuery(query);
//   res.send(response);
// });




// app.use(bodyParser.json());
// app.use(cors());


// app.post('/diagnose', async (req, res) => {
//   const { userId, reportId } = req.body;

//   if (!userId || !reportId) {
//     return res.status(400).send({ error: 'userId and reportId are required' });
//   }

//   try {
//     // Find the specific report for the user
//     const report = await reportDatasModel.findOne({ userId, _id: reportId });

//     if (!report || !report.reportPdf) {
//       return res.status(404).send({ error: 'Report not found or missing reportPdf data' });
//     }

//     // Convert the reportPdf object to a string
//     let reportText = JSON.stringify(report.reportPdf, null, 2);

//     // Prepare data for Gemini
//     let prompt = `Analyze the following medical report and provide your prediction. Report:\n${reportText}\n`;
//     prompt += " Your response should consist of 2 parts. The first part is the disease/diagnosis you made, justification for it with heading Predicted disease: and the second part is the risk of the person classified as low, medium, or high risk with the heading Risk Prediction: followed by a percentage for risk. Do not include any other text.";

//     // Send data to Gemini for prediction
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = await response.text();

//     // Log the response text for debugging
//     console.log('Gemini API response:', text);

//     // Extract the prediction details from the response text
//     const [predictedDisease, riskPrediction] = text.split('Risk Prediction:');

//     // Check if the response contains the expected parts
//     if (!predictedDisease || !riskPrediction) {
//       return res.status(500).send({ error: 'Invalid response format from Gemini API' });
//     }

//     const [diseaseHeading, disease] = predictedDisease.split('Predicted disease:');

//     // Extract the numeric risk percentage
//     const riskPercentMatch = riskPrediction.match(/(\d+)%/);
//     const riskPercent = riskPercentMatch ? parseInt(riskPercentMatch[1], 10) : null;

//     if (riskPercent === null) {
//       return res.status(500).send({ error: 'Invalid risk percentage format from Gemini API' });
//     }

//     // Save the prediction in the database
//     const newPrediction = new predictionsModel({
//       predictionId: new mongoose.Types.ObjectId().toString(),
//       userId,
//       reportIds: [reportId],
//       LLMPrediction: disease ? disease.trim() : 'N/A',
//       riskPercent: riskPercent
//     });

//     await newPrediction.save();

//     // Update the reportIdsModel with the new prediction ID
//     const reportIds = await reportIdsModel.findOne({ userId });
//     reportIds.PredictionID.push(newPrediction.predictionId);
//     await reportIds.save();

//     // Send the prediction back to the client
//     res.send(newPrediction);

//   } catch (error) {
//     console.error('Error processing diagnosis:', error);
//     res.status(500).send({ error: error.message });
//   }
// });



// app.post('/predict', async (req, res) => {
//   const { userId } = req.body;

//   if (!userId) {
//     return res.status(400).send({ error: 'userId is required' });
//   }

//   try {
//     // Find the reportIds object for the user
//     const reportIds = await reportIdsModel.findOne({ userId });

//     if (!reportIds || !reportIds.ALLreportIDs || reportIds.ALLreportIDs.length === 0) {
//       return res.status(404).send({ error: 'No reports found for the user' });
//     }

//     // Retrieve the last three report IDs
//     const lastThreeReportIds = reportIds.ALLreportIDs.slice(-3);

//     // Fetch the last three reports' data
//     const reportsDataPromises = lastThreeReportIds.map(reportId =>
//       reportDatasModel.findOne({ userId, _id: reportId }).then(report => {
//         if (!report || !report.reportPdf) {
//           console.log(`Report ${reportId} is missing reportPdf data`);
//           return null;
//         }
        
//         // Convert the reportPdf object to a string
//         let reportText = JSON.stringify(report.reportPdf, null, 2);
//         return reportText;
//       })
//     );

//     const reportsTexts = await Promise.all(reportsDataPromises);

//     // Filter out null values
//     const validReportsTexts = reportsTexts.filter(text => text !== null);

//     if (validReportsTexts.length === 0) {
//       return res.status(404).send({ error: 'No valid reports found for the user' });
//     }

//     // Prepare data for Gemini
//     let prompt = 'Analyze the following medical reports and provide your predictions. Reports:\n';
//     validReportsTexts.forEach((text, index) => {
//       prompt += `Report ${index + 1}:\n${text}\n`;
//     });
//     prompt += " Your response should consist of 2 parts. The first part is the disease/diagnosis you made, justification for it with heading Predicted disease: and the second part is the risk of the person classified as low, medium, or high risk with the heading Risk Prediction: followed by a percentage for risk. Do not include any other text.";

//     // Send data to Gemini for prediction
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = await response.text();

//     // Log the response text for debugging
//     console.log('Gemini API response:', text);

//     // Extract the prediction details from the response text
//     const [predictedDisease, riskPrediction] = text.split('Risk Prediction:');

//     // Check if the response contains the expected parts
//     if (!predictedDisease || !riskPrediction) {
//       return res.status(500).send({ error: 'Invalid response format from Gemini API' });
//     }

//     const [diseaseHeading, disease] = predictedDisease.split('Predicted disease:');

//     // Extract the numeric risk percentage
//     const riskPercentMatch = riskPrediction.match(/(\d+)%/);
//     const riskPercent = riskPercentMatch ? parseInt(riskPercentMatch[1], 10) : null;

//     if (riskPercent === null) {
//       return res.status(500).send({ error: 'Invalid risk percentage format from Gemini API' });
//     }

//     // Save the prediction in the database
//     const newPrediction = new predictionsModel({
//       predictionId: new mongoose.Types.ObjectId().toString(),
//       userId,
//       reportIds: lastThreeReportIds,
//       LLMPrediction: disease ? disease.trim() : 'N/A',
//       riskPercent: riskPercent
//     });

//     await newPrediction.save();

//     // Update the reportIdsModel with the new prediction ID
//     reportIds.PredictionID.push(newPrediction.predictionId);
//     await reportIds.save();

//     // Send the prediction back to the client
//     res.send(newPrediction);

//   } catch (error) {
//     console.error('Error processing prediction:', error);
//     res.status(500).send({ error: error.message });
//   }
// });





// app.post('/chatbot',async(req,res)=>{
//   let {prompt} = req.body;
//   if (!prompt) {
//     return res.status(400).send("Prompt is required");
//   }
//   try{
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     res.send(text);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Failed to generate content");
//   }

// })


// app.post('/upload', upload.single('file'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded');
//   }

//   const filePath = path.join(__dirname, req.file.path);

//   try {
//     const dataBuffer = fs.readFileSync(filePath);
//     const data = await pdfParse(dataBuffer);
//     fs.unlinkSync(filePath);

//     const extractedText = data.text;
//     console.log("Extracted Text:", extractedText);

//     try {
//       const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//       const prompt = `${extractedText} Generate a nested dictionary from the text then give a dictionary where the primary keys are Patient Details, test categories (e.g., Blood Group, CBC) and each category contains a dictionary of test names as keys and their values as the test result along with their units as a single string without the range. Ignore non-whitespaces and give correct JSON format.`;
//       const result = await model.generateContent(prompt);
//       const response = await result.response;
//       const generatedText = response.text();

//       console.log("Generated Text:", generatedText);

//       let dictionaryString = generatedText.substring(generatedText.indexOf('{'), generatedText.lastIndexOf('}') + 1);
//       dictionaryString = dictionaryString.replace(/`/g, '').replace(/[\n\r]/g, '').trim();

//       console.log("Cleaned Dictionary String:", dictionaryString);

//       let dictionary;
//       try {
//         dictionary = JSON.parse(dictionaryString);
//       } catch (parseError) {
//         console.log("First parsing error:", parseError);

//         dictionaryString = dictionaryString.replace(/[^a-zA-Z0-9:{}\[\],\"\' ]/g, '');
//         console.log("Further cleaned Dictionary String:", dictionaryString);

//         try {
//           dictionary = JSON.parse(dictionaryString);
//         } catch (finalParseError) {
//           console.log("Final parsing error:", finalParseError);

//           const patientDetailsStart = dictionaryString.indexOf('{');
//           const testResultsStart = dictionaryString.indexOf('testresults');

//           if (patientDetailsStart !== -1 && testResultsStart !== -1) {
//             const patientDetailsString = dictionaryString.substring(patientDetailsStart, testResultsStart).trim();
//             const testResultsString = dictionaryString.substring(testResultsStart + 'testresults'.length).trim();

//             try {
//               const patientDetails = JSON.parse(patientDetailsString);
//               const testResults = JSON.parse(testResultsString);

//               dictionary = {
//                 patientdetails: patientDetails,
//                 testresults: testResults,
//               };
//             } catch (manualParseError) {
//               console.log("Manual parsing error:", manualParseError);
//               return res.status(500).send("Failed to parse generated dictionary");
//             }
//           } else {
//             return res.status(500).send("Failed to parse generated dictionary");
//           }
//         }
//       }

//       console.log("Generated Dictionary:", dictionary);
//       res.json({ details: dictionary });

//     } catch (error) {
//       console.log("Error generating content:", error);
//       res.status(500).send("Failed to generate content");
//     }

//   } catch (error) {
//     console.error("Error processing PDF:", error);
//     fs.unlinkSync(filePath);
//     res.status(500).send('Error processing PDF');
//   }
// });

// app.post("/save", (req, res) => {
//   const updatedData = req.body;
//   // Handle the logic to save the updated data
//   // For example, you might save it to a database or a file
//   console.log('Received data to save:', updatedData);
//   res.send({ success: true, message: "Data saved successfully" });
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
// app.use('/api/users', require('./routes/AllRoutes'));


// const port = 8080;
// app.listen(port, () => {
//   console.log(`Server listening on port${port}`);
// });





//===================================================================================================
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