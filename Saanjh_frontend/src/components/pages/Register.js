import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Register = () => {
  const [formObj, setFormObj] = useState({ username: "", password: ""});
  const [signedUp, setSignedUp] = useState(false);
  const [errorSigningUp, setErrorSigningUp] = useState('');
  const [userId, setUserId] = useState('');

  const navigate = useNavigate();
 
  const changeHandler = (e) => {
    setFormObj({ ...formObj, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formObj);


    try {
      const response = await axios.post('http://localhost:8080/api/users/register', 
        { ...formObj });

      console.log(response);


      if (response.data) {
        setUserId(response.data.userId);
        setSignedUp(true);
        setErrorSigningUp('');
        console.log("Successfully signed up");
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        setSignedUp(false);
        setErrorSigningUp("Error while registering");
      }
    }

     catch (error) {
      console.log("Error while signing up");
      console.log(error);
      setSignedUp(false);
      setErrorSigningUp("Error while signing up");
    }
  };

  const Error = () => (
    <div className="alert alert-danger" role="alert">
      {errorSigningUp}
    </div>
  );

  const backgroundStyle = {
    backgroundImage: "url('https://thumbs.dreamstime.com/z/informational-flyer-nursing-home-building-flat-poster-group-elderly-people-walks-near-banner-meet-visitors-street-cartoon-154355370.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh', // Adjust height as needed
    position: 'relative',
  };

  const blurOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(6px)', // Apply blur to the overlay
    zIndex: 0,
  };


  return (
    <div style={backgroundStyle}>
    <div className="container d-flex justify-content-center align-items-center h-100">
    <div style={blurOverlayStyle}></div>
      <div className="card p-4 rounded shadow-lg">
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit}>
          {errorSigningUp && <Error />}



            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                value={formObj.username}
                onChange={changeHandler}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formObj.password}
                onChange={changeHandler}
              />
            </div>



          <button type="submit" className="btn btn-primary">Register</button>
        </form>

        {signedUp && <div className="alert alert-success mt-3">Successfully signed up! Your user ID is {userId}. Redirecting to login...</div>}


      </div>
    </div>
    </div>
  );
}

export default Register;











// import React, { useState } from 'react';
// import axios from 'axios';
// import { Modal, Button } from 'react-bootstrap';


// const Register = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:5000/routes/users/register', { name, email, password });
    
//     } catch (error) {
//       alert('Error registering user');
//     }
//   };


  
//   const backgroundStyle = {
//     backgroundImage: "url('https://thumbs.dreamstime.com/z/informational-flyer-nursing-home-building-flat-poster-group-elderly-people-walks-near-banner-meet-visitors-street-cartoon-154355370.jpg')",
//     backgroundSize: 'cover',
//     backgroundPosition: 'center',
//     height: '100vh', // Adjust height as needed
//     position: 'relative',
//   };

//   const blurOverlayStyle = {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: '100%',
//     height: '100%',
//     backdropFilter: 'blur(6px)', // Apply blur to the overlay
//     zIndex: 0,
//   };

//   return (
//     <div style={backgroundStyle}>
//     <div className="container d-flex justify-content-center align-items-center h-100">
//     <div style={blurOverlayStyle}></div>
//       <div className="card p-4 rounded shadow-lg">
//         <h2 className="text-center mb-4">Register</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label htmlFor="name" className="form-label">Name</label>
//             <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} />
//           </div>
//           <div className="mb-3">
//             <label htmlFor="email" className="form-label">Email address</label>
//             <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
//           </div>
//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">Password</label>
//             <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
//           </div>
//           <button type="submit" className="btn btn-primary">Register</button>
//         </form>
//       </div>
//     </div>
//     </div>
//   );
// }

// export default Register;








// // import React, { useState } from 'react';
// // import axios from 'axios';


// // const Register = () => {
// //   const [name, setName] = useState('');
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
  


// //   return (
// //     <div className="container d-flex justify-content-center align-items-center h-100">
// //       <div className="card p-4 rounded shadow-lg">
// //         <h2 className="text-center mb-4">Register</h2>
// //         <form>
// //           <div className="mb-3">
// //             <label htmlFor="name" className="form-label">Name</label>
// //             <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} />
// //           </div>
// //           <div className="mb-3">
// //             <label htmlFor="email" className="form-label">Email</label>
// //             <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
// //           </div>
// //           <div className="mb-3">
// //             <label htmlFor="password" className="form-label">Password</label>
// //             <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
// //           </div>
// //           <button type="submit" className="btn btn-primary">Register</button>
// //         </form>
// //       </div>

// //     </div>
// //   );
// // }

// // export default Register;






























































// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';


// const Register = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:8080/api/users/register', 
//       { name, email, password }
//     );
//       alert(response.data); // Handle the response as needed
//     } catch (error) {
//       alert('Error registering user');
//     }
//   };

//   const backgroundStyle = {
//     backgroundImage: "url('https://thumbs.dreamstime.com/z/informational-flyer-nursing-home-building-flat-poster-group-elderly-people-walks-near-banner-meet-visitors-street-cartoon-154355370.jpg')",
//     backgroundSize: 'cover',
//     backgroundPosition: 'center',
//     height: '100vh', // Adjust height as needed
//     position: 'relative',
//   };

//   const blurOverlayStyle = {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: '100%',
//     height: '100%',
//     backdropFilter: 'blur(6px)', // Apply blur to the overlay
//     zIndex: 0,
//   };


//   return (
//     <div style={backgroundStyle}>
//     <div className="container d-flex justify-content-center align-items-center h-100">
//     <div style={blurOverlayStyle}></div>
//       <div className="card p-4 rounded shadow-lg">
//         <h2 className="text-center mb-4">Register</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label htmlFor="name" className="form-label">Name</label>
//             <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} />
//           </div>
//           <div className="mb-3">
//             <label htmlFor="email" className="form-label">Email address</label>
//             <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
//           </div>
//           <div className="mb-3">
//             <label htmlFor="password" className="form-label">Password</label>
//             <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
//           </div>
//           <button type="submit" className="btn btn-primary">Register</button>
//         </form>
//       </div>
//     </div>
//     </div>
//   );
// }

// export default Register;











// // import React, { useState } from 'react';
// // import axios from 'axios';
// // import { Modal, Button } from 'react-bootstrap';


// // const Register = () => {
// //   const [name, setName] = useState('');
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');


// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const response = await axios.post('http://localhost:5000/routes/users/register', { name, email, password });
    
// //     } catch (error) {
// //       alert('Error registering user');
// //     }
// //   };


  
// //   const backgroundStyle = {
// //     backgroundImage: "url('https://thumbs.dreamstime.com/z/informational-flyer-nursing-home-building-flat-poster-group-elderly-people-walks-near-banner-meet-visitors-street-cartoon-154355370.jpg')",
// //     backgroundSize: 'cover',
// //     backgroundPosition: 'center',
// //     height: '100vh', // Adjust height as needed
// //     position: 'relative',
// //   };

// //   const blurOverlayStyle = {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     width: '100%',
// //     height: '100%',
// //     backdropFilter: 'blur(6px)', // Apply blur to the overlay
// //     zIndex: 0,
// //   };

// //   return (
// //     <div style={backgroundStyle}>
// //     <div className="container d-flex justify-content-center align-items-center h-100">
// //     <div style={blurOverlayStyle}></div>
// //       <div className="card p-4 rounded shadow-lg">
// //         <h2 className="text-center mb-4">Register</h2>
// //         <form onSubmit={handleSubmit}>
// //           <div className="mb-3">
// //             <label htmlFor="name" className="form-label">Name</label>
// //             <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} />
// //           </div>
// //           <div className="mb-3">
// //             <label htmlFor="email" className="form-label">Email address</label>
// //             <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
// //           </div>
// //           <div className="mb-3">
// //             <label htmlFor="password" className="form-label">Password</label>
// //             <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
// //           </div>
// //           <button type="submit" className="btn btn-primary">Register</button>
// //         </form>
// //       </div>
// //     </div>
// //     </div>
// //   );
// // }

// // export default Register;








// // // import React, { useState } from 'react';
// // // import axios from 'axios';


// // // const Register = () => {
// // //   const [name, setName] = useState('');
// // //   const [email, setEmail] = useState('');
// // //   const [password, setPassword] = useState('');
  


// // //   return (
// // //     <div className="container d-flex justify-content-center align-items-center h-100">
// // //       <div className="card p-4 rounded shadow-lg">
// // //         <h2 className="text-center mb-4">Register</h2>
// // //         <form>
// // //           <div className="mb-3">
// // //             <label htmlFor="name" className="form-label">Name</label>
// // //             <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} />
// // //           </div>
// // //           <div className="mb-3">
// // //             <label htmlFor="email" className="form-label">Email</label>
// // //             <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
// // //           </div>
// // //           <div className="mb-3">
// // //             <label htmlFor="password" className="form-label">Password</label>
// // //             <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
// // //           </div>
// // //           <button type="submit" className="btn btn-primary">Register</button>
// // //         </form>
// // //       </div>

// // //     </div>
// // //   );
// // // }

// // // export default Register;



