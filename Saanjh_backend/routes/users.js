const express = require("express");
const { usersModel, patientIdModel,reportsModel,careIDsModel } = require("../models/user");
const allroutes = express.Router();
const multer = require("multer");
const upload = multer();

const generateUniqueUserId = async () => {
  let unique = false;
  let userId;

  while (!unique) {
    userId = Math.floor(1000 + Math.random() * 9000).toString();
    let existingUser = await patientIdModel.findOne({ userId });
    if (!existingUser) {
      unique = true;
    }
  }

  return userId;
};

allroutes.get('/', (req, res) => {
  console.log("Reached root");
  res.send("Backend home");
});

allroutes.get('/userIds', async (req, res) => {
  try {
    const userIds = await patientIdModel.find({}, 'userId  name');
    res.json(userIds);
  } catch (error) {
    console.error('Error fetching userIds:', error);
    res.status(500).send('Internal Server Error: Failed to fetch userIds');
  }
});

allroutes.get('/userReports', async (req, res) => {
  const { userId } = req.query;
  console.log('Fetching reports for userId:', userId);

  if (!userId) {
    return res.status(400).send('userId parameter is required');
  }

  try {
    const reports = await reportsModel.find({ userId });
    console.log('Reports found:', reports); // Log the reports fetched
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).send('Internal Server Error: Failed to fetch reports');
  }
});



allroutes.get('/reports/:userId/:week', async (req, res) => {
  const { userId, week } = req.params;
  console.log('Fetching reports for userId:', userId, 'week:', week);
  try {
    const report = await reportsModel.find({ userId, week });
    res.json(report);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).send('Internal Server Error: Failed to fetch reports');
  }
}
);

allroutes.get('/allreports', async (req, res) => {
  try {
    const reports = await reportsModel.find({});
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).send('Internal Server Error: Failed to fetch reports');
  }
}
);

allroutes.post('/addpatient', upload.none(), async (req, res) => {
  try {
    console.log(req.body);
    const userId = await generateUniqueUserId();

    // Ensure all required fields are present in the request
    const { name, age, gender } = req.body;
    if (!name || !age || !gender) {
      return res.status(400).send('Missing required fields: name, age, gender');
    }

    // Fetch all caretakers
    const caretakers = await careIDsModel.find({});

    if (caretakers.length === 0) {
      throw new Error('No caretakers available');
    }

    // Find the caretaker with the fewest patients
    let minLength = Infinity;
    let assignedCaretaker = null;

    caretakers.forEach(caretaker => {
      if (caretaker.patientIds.length < minLength) {
        minLength = caretaker.patientIds.length;
        assignedCaretaker = caretaker;
      }
    });

    if (!assignedCaretaker) {
      throw new Error('Unable to find a caretaker with minimum patients');
    }

    // Create a new patient
    let newPatient = new patientIdModel({
      userId,
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      caretakerId: assignedCaretaker.userId
    });

    let patientFromDB = await newPatient.save();

    // Update the caretaker's patientIds array
    assignedCaretaker.patientIds.push(userId);
    await assignedCaretaker.save();

    console.log(patientFromDB);
    res.send(patientFromDB);
  } catch (err) {
    console.log("Error while adding patient. Check if it is duplicate.");
    console.log(err);
    res.status(500).send(err);
  }
});


allroutes.post('/register', upload.none(), async (req, res) => {
  try {
    console.log(req.body);
    const userId = await generateUniqueUserId();

    let newUser = new usersModel({
      userId,
      username: req.body.username,
      password: req.body.password,
      userType: "Care Taker"
    });

    let userFromDB = await newUser.save();

    let newCareTaker = new careIDsModel({
      userId,
      patientIds: []
    });

    let careTakerFromDB = await newCareTaker.save();

    console.log(userFromDB);
    console.log(careTakerFromDB);

    res.send(userFromDB);
  } catch (err) {
    console.log("Error while adding user. Check if it is duplicate.");
    console.log(err);
    res.status(500).send(err);
  }
});

allroutes.post('/login', upload.none(), async (req, res) => {
  try {
    console.log(req.body);
    let user = await usersModel.findOne({ userId: req.body.userId });

    if (!user) {
      return res.status(400).send('Invalid username or password');
    }

    if (user.password !== req.body.password) {
      return res.status(400).send('Incorrect password');
    }

    res.send({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});


allroutes.post("/save", async (req, res) => {
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


module.exports = allroutes;
  
  // const express = require('express');
  // const bcrypt = require('bcryptjs');
  // const jwt = require('jsonwebtoken');
  // const { usersModel, patientIdModel, userIdModel } = require("../models/user");
  // const multer = require("multer");

  // const upload = multer();
  // require('dotenv').config();
  // const router = express.Router();

  // const generateUniqueUserId = async () => {
  //   let unique = false;
  //   let userId;

  //   while (!unique) {
  //     userId = Math.floor(1000 + Math.random() * 9000).toString();
  //     let existingUser = await userIdModel.findOne({ userId });
  //     if (!existingUser) {
  //       unique = true;
  //     }
  //   }

  //   return userId;
  // };


  // router.get('/userIds', async (req, res) => {
  //   try {
  //     const userIds = await patientIdModel.find({}, 'userId username name');
  //     res.json(userIds);
  //   } catch (error) {
  //     console.error('Error fetching userIds:', error);
  //     res.status(500).send('Internal Server Error: Failed to fetch userIds');
  //   }
  // });

  // router.post('/addpatient', upload.none(), async (req, res) => {
  //   try {
  //     console.log(req.body);
  //     const userId = await generateUniqueUserId();
  
  //     // Ensure all required fields are present in the request
  //     const { name, age, gender } = req.body;
  //     if (!name || !age || !gender) {
  //       return res.status(400).send('Missing required fields: name, age, gender');
  //     }
  
  //     // Fetch all caretakers
  //     const caretakers = await careIDsModel.find({});
  
  //     if (caretakers.length === 0) {
  //       throw new Error('No caretakers available');
  //     }
  
  //     // Find the caretaker with the fewest patients
  //     let minLength = Infinity;
  //     let assignedCaretaker = null;
  
  //     caretakers.forEach(caretaker => {
  //       if (caretaker.patientIds.length < minLength) {
  //         minLength = caretaker.patientIds.length;
  //         assignedCaretaker = caretaker;
  //       }
  //     });
  
  //     if (!assignedCaretaker) {
  //       throw new Error('Unable to find a caretaker with minimum patients');
  //     }
  
  //     // Create a new patient
  //     let newPatient = new patientIdModel({
  //       userId,
  //       name: req.body.name,
  //       age: req.body.age,
  //       gender: req.body.gender,
  //       caretakerId: assignedCaretaker.userId
  //     });
  
  //     let patientFromDB = await newPatient.save();
  
  //     // Update the caretaker's patientIds array
  //     assignedCaretaker.patientIds.push(userId);
  //     await assignedCaretaker.save();
  
  //     console.log(patientFromDB);
  //     res.send(patientFromDB);
  //   } catch (err) {
  //     console.log("Error while adding patient. Check if it is duplicate.");
  //     console.log(err);
  //     res.status(500).send(err);
  //   }
  // });

  // router.post('/register', upload.none(), async (req, res) => {
  //   try {
  //     console.log(req.body);
  //     const userId = await generateUniqueUserId();

  //     let newUser = new usersModel({
  //       userId,
  //       name: req.body.name,
  //       username: req.body.username,
  //       password: req.body.password,
  //       userType: req.body.userType
  //     });

  //     let userFromDB = await newUser.save();

  //     if (req.body.userType === "patient") {
  //       let newUserId = new userIdModel({
  //         username: req.body.username,
  //         userId,
  //         name: req.body.name
  //       });
  //       await newUserId.save();
  //     }

  //     console.log(userFromDB);
  //     res.send(userFromDB);
  //   } catch (err) {
  //     console.log("Error while adding user. Check if it is duplicate.");
  //     console.log(err);
  //     res.status(500).send(err);
  //   }
  // });

  // // Login user
  // router.post('/login', upload.none(), async (req, res) => {
  //   try {
  //     console.log(req.body);
  //     let user = await usersModel.findOne({ username: req.body.username });

  //     if (!user) {
  //       return res.status(400).send('Invalid username or password');
  //     }

  //     if (user.password !== req.body.password) {
  //       return res.status(400).send('Invalid username or password');
  //     }

  //     res.send({ success: true, user });
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).send(err);
  //   }
  // });

  // module.exports = router;


































  // const express = require('express');
  // const bcrypt = require('bcryptjs');
  // const jwt = require('jsonwebtoken');
  // const User = require('../models/user');
  // require('dotenv').config();

  // const router = express.Router();

  // // Register user
  // router.post('/register', async (req, res) => {
  //   const { name, email, password } = req.body;
  //   try {
  //     let user = await User.findOne({ email });
  //     if (user) {
  //       return res.status(400).json({ msg: 'User already exists' });
  //     }

  //     user = new User({ name, email, password });

  //     const salt = await bcrypt.genSalt(10);
  //     user.password = await bcrypt.hash(password, salt);

  //     await user.save();

  //     const payload = { user: { id: user.id } };

  //     jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
  //       if (err) throw err;
  //       res.json({ token });
  //     });
  //   } catch (err) {
  //     console.error(err.message);
  //     res.status(500).send('Server error');
  //   }
  // });

  // // Login user
  // router.post('/login', async (req, res) => {
  //   const { email, password } = req.body;
  //   try {
  //     let user = await User.findOne({ email });
  //     if (!user) {
  //       return res.status(400).json({ msg: 'Invalid credentials' });
  //     }

  //     const isMatch = await bcrypt.compare(password, user.password);
  //     if (!isMatch) {
  //       return res.status(400).json({ msg: 'Invalid credentials' });
  //     }

  //     const payload = { user: { id: user.id } };

  //     // jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
  //     //   if (err) throw err;
  //     //   res.json({ token });
  //     // });
  //   } catch (err) {
  //     console.error(err.message);
  //     res.status(500).send('Server error');
  //   }
  // });

  // module.exports = router;