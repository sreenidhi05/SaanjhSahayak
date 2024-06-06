const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

const fs = require("fs");

dotenv.config();

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run() {

    // Read details.json file
    const details = fs.readFileSync('details.json', 'utf-8');


    // Create a prompt with the details
  const prompt = `Here are the medical report details: ${details}`;


  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
}

run();