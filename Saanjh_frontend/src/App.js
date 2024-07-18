import React, { useState, useEffect } from 'react';
import {useNavigate } from 'react-router-dom';
import Navbar from "./components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home';
import Profile from './components/pages/Profile';
import SignIn from './components/pages/SignIn';
import Register from './components/pages/Register';
import AboutUs from './components/pages/AboutUs';
import Form from './components/pages/Form';
import Uploaded from './components/Uploaded';
import LLMChatBot from './components/LLMChatBot';
import Admin from './components/Admin';
import AddCare from './components/AddCare';


const App = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [results, setResults] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUploaded = (filePath) => {
    setUploadedFile(filePath);
  };

  useEffect(() => {
    const loginState = sessionStorage.getItem('isLoggedIn');
    if (loginState) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    // assuming you have a `navigate` function imported from `react-router-dom`
    navigate('/login');
  };

  return (
    <div>
      
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home isAuthenticated={isAuthenticated} />} />
        <Route path="/form" element={isLoggedIn && sessionStorage.getItem('userType') === 'Care Taker' ? <Form /> : <Home />} />
        <Route path="/chatbot" element={isLoggedIn && sessionStorage.getItem('userType') === 'doctor' ? <LLMChatBot /> : <Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/uploaded" element={<Uploaded />} />
        <Route path='/admin' element={isLoggedIn && sessionStorage.getItem('userType') === 'admin' ? <Admin /> : <Home />} />  
        <Route path='/addcare' element={isLoggedIn && sessionStorage.getItem('userType') === 'admin' ? <AddCare></AddCare> : <Home />} />   
        </Routes>
    </div>
  );
}

export default App;



// import React, {useState} from 'react'
// import Navbar from "./components/Navbar";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { BrowserRouter as Router, Route,  Routes, Switch} from 'react-router-dom';
// import Home from './components/Home';
// import Profile from './components/Profile';
// import SignIn from './components/SignIn';
// import Register from './components/Register';
// import AboutUs from './components/AboutUs';
// import InputForm from './components/InputForm';
// import PdfUpload from './components/PdfUpload';
// import ResultsForm from './components/ResultsForm';


// const App = () => {
//   const [results, setResults] = useState({});
//   const [auth, setAuth] = useState(false);

//   const handleFileUpload = (data) => {
//     setResults(data);
//   };

//   return (
//   <Router>
//       <Navbar/>
//       <Routes>
//         <Route path="/" element={<Home/>} />
//         <Route path='/home' element={<Home/>}/>
//         <Route path='/profile' element={<Profile/>}/>
//         <Route path='signin' element={<SignIn/>}/>
//         <Route path = '/register' element={<Register/>}/>
//         <Route path='/aboutus' element={<AboutUs/>}/>
//         <Route path ='/inputform' element={<InputForm/>}/>
//         <Route path="/upload" element={<PdfUpload onFileUpload={handleFileUpload} />} />
//         <Route path="/results" element={<ResultsForm results={results} />} />
//         </Routes>

//         {auth && (
//         <div className="container mt-5">
//           <h2>Welcome! You can upload your PDF report here:</h2>
//           <PdfUpload onFileUpload={handleFileUpload} />
//         </div>
//       )}

//     </Router>
//   )
// }

// export default App


