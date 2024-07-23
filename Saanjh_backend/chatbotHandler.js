// // chatbotHandler.js
// const {
//   usersModel,
//   patientIdModel,
//   reportIdsModel,
//   reportDatasModel,
//   careIDsModel,
//   predictionsModel,
// } = require('./schemas/allSchemas'); // Adjust the path as needed

// const handleUserQuery = async (query) => {
//   try {
//     console.log('Received query:', query);

//     if (query.includes('user')) {
//       const username = query.match(/user (.+)/)[1];
//       console.log('Extracted username:', username);
//       const user = await usersModel.findOne({ username: username });
//       if (user) {
//         return `User: ${user.username}, UserType: ${user.userType}`;
//       } else {
//         return 'User not found.';
//       }
//     } else if (query.includes('patient')) {
//       const patientName = query.match(/patient (.+)/)[1];
//       console.log('Extracted patientName:', patientName);
//       const patient = await patientIdModel.findOne({ name: patientName });
//       if (patient) {
//         return `Patient: ${patient.name}, Age: ${patient.age}, Gender: ${patient.gender}`;
//       } else {
//         return 'Patient not found.';
//       }
//     } else if (query.includes('report')) {
//       const userId = query.match(/report for userId (.+)/)[1];
//       console.log('Extracted userId:', userId);
//       const reportIds = await reportIdsModel.findOne({ userId: userId });
//       if (reportIds) {
//         const reports = await reportDatasModel.find({ userId: userId });
//         return `Reports for UserId ${userId}: ${JSON.stringify(reportPdf)}`;
//       } else {
//         return 'Reports not found.';
//       }
//     } else if (query.includes('caretaker')) {
//       const caretakerId = query.match(/caretaker (.+)/)[1];
//       console.log('Extracted caretakerId:', caretakerId);
//       const caretaker = await careIDsModel.findOne({ userId: caretakerId });
//       if (caretaker) {
//         return `Caretaker: ${caretaker.userId}, Patients: ${caretaker.patientIds.join(', ')}`;
//       } else {
//         return 'Caretaker not found.';
//       }
//     } else if (query.includes('prediction')) {
//       const predictionId = query.match(/prediction (.+)/)[1];
//       console.log('Extracted predictionId:', predictionId);
//       const prediction = await predictionsModel.findOne({ predictionId: predictionId });
//       if (prediction) {
//         return `Prediction: ${prediction.LLMPrediction}, Risk Percent: ${prediction.riskPercent}`;
//       } else {
//         return 'Prediction not found.';
//       }
//     }
//     return 'I did not understand your query.';
//   } catch (error) {
//     console.error('Error handling user query:', error);
//     return 'An error occurred while processing your request.';
//   }
// };

// module.exports = { handleUserQuery };

const {
  usersModel,
  patientIdModel,
  reportIdsModel,
  reportDatasModel,
  careIDsModel,
  predictionsModel,
} = require('./schemas/allSchemas'); // Adjust the path as needed

const handleUserQuery = async (query) => {
  try {
    console.log('Received query:', query);

    if (query.includes('user')) {
      const username = query.match(/user (.+)/)[1];
      console.log('Extracted username:', username);
      const user = await usersModel.findOne({ username: username });
      if (user) {
        return `User: ${user.username}, UserType: ${user.userType}`;
      } else {
        return 'User not found.';
      }
    } else if (query.includes('patient')) {
      const patientName = query.match(/patient (.+)/)[1];
      console.log('Extracted patientName:', patientName);
      const patient = await patientIdModel.findOne({ name: patientName });
      if (patient) {
        return `Patient: ${patient.name}, Age: ${patient.age}, Gender: ${patient.gender}`;
      } else {
        return 'Patient not found.';
      }
    } else if (query.includes('report')) {
      const userId = query.match(/report for userId (.+)/)[1];
      console.log('Extracted userId:', userId);
      const reportIds = await reportIdsModel.findOne({ userId: userId });
      if (reportIds) {
        const reports = await reportDatasModel.find({ userId: userId });
        const reportdatas = reports.map(report => ({
          date: report.date,
          reportPdf: report.reportPdf,
          docNote: report.docNote,
          dietPlan: report.dietPlan,
        }));
        return `Reports for UserId ${userId}: ${JSON.stringify(reportdatas)}`;
      } else {
        return 'Reports not found.';
      }
    } else if (query.includes('caretaker')) {
      const caretakerId = query.match(/caretaker (.+)/)[1];
      console.log('Extracted caretakerId:', caretakerId);
      const caretaker = await careIDsModel.findOne({ userId: caretakerId });
      if (caretaker) {
        return `Caretaker: ${caretaker.userId}, Patients: ${caretaker.patientIds.join(', ')}`;
      } else {
        return 'Caretaker not found.';
      }
    } else if (query.includes('prediction')) {
      const predictionId = query.match(/prediction (.+)/)[1];
      console.log('Extracted predictionId:', predictionId);
      const prediction = await predictionsModel.findOne({ predictionId: predictionId });
      if (prediction) {
        return `Prediction: ${prediction.LLMPrediction}, Risk Percent: ${prediction.riskPercent}`;
      } else {
        return 'Prediction not found.';
      }
    }
    return 'I did not understand your query.';
  } catch (error) {
    console.error('Error handling user query:', error);
    return 'An error occurred while processing your request.';
  }
};

module.exports = { handleUserQuery };
