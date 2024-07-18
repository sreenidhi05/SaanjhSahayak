import React ,{useState} from 'react';
import { Link , useNavigate} from 'react-router-dom';
import axios from 'axios';

const SignIn = ({setIsLoggedIn}) => {
  
  const [formObj, setFormObj] = useState({ userId: "", password: "" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorLoggingIn, setErrorLoggingIn] = useState('');
  const navigate = useNavigate();

  const changeHandler = (e) => {
    setFormObj({ ...formObj, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formObj);

    try {
      const response = await axios.post('http://localhost:8080/api/users/login', { ...formObj });
      console.log(response);
      if (response.data.success) {
        setLoggedIn(true);
        setErrorLoggingIn('');
        sessionStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
        console.log("Successfully logged in");
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setLoggedIn(false);
        setErrorLoggingIn("Invalid username or password");
      }
    } catch (error) {
      console.log("Error while logging in");
      console.log(error);
      setLoggedIn(false);
      setErrorLoggingIn("Error while logging in");
    }
    
  }

  const Error = () => (
    <div className="alert alert-danger" role="alert">
      {errorLoggingIn}
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
          <h2 className="text-center mb-4">Sign In</h2>
          <form onSubmit={handleSubmit}>
            {errorLoggingIn && <Error />}
            <div className="mb-3">
              <label htmlFor="userId" className="form-label">
                Username
              </label>
              <input 
              type="text" 
              className="form-control" 
              id="userId" 
              name="userId"
              value={formObj.userId}
              onChange={changeHandler}
              />

              {/* <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div> */}
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

            <button type="submit" className="btn btn-primary">
              Submit
            </button>

          </form>

          {loggedIn && <div className="alert alert-success mt-3">Successfully logged in! Redirecting to home...</div>}


        </div>
      </div>
    </div>
  );
}

export default SignIn;





























// import React ,{useState} from 'react';
// import { Link , useNavigate} from 'react-router-dom';
// import axios from 'axios';

// const SignIn = ({ setAuth }) => {
//   const [email, setEmail] = useState('');
//   const[password, setPassword] = useState('');
//   const navigate = useNavigate();


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try{
//       const response = await axios.post('http://localhost:8080/api/users/login', { email, password });

//       if (response.status === 200) {
//         setAuth(true);  // Set authentication state to true
//         navigate('/upload');  
//       }
//     }

//     catch(error)
//     {
//       alert('Invalid Credentials');
//     }
    
//   }


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
//       <div className="container d-flex justify-content-center align-items-center h-100">
//         <div style={blurOverlayStyle}></div>
//         <div className="card p-4 rounded shadow-lg">
//           <h2 className="text-center mb-4">Sign In</h2>
//           <form onSubmit={handleSubmit}>
//             <div className="mb-3">
//               <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
//               <input 
//               type="email" 
//               className="form-control" 
//               id="exampleInputEmail1" 
//               aria-describedby="emailHelp" 
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               />

//               <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
//             </div>
//             <div className="mb-3">
//               <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
//               <input 
//               type="password" 
//               className="form-control" 
//               id="exampleInputPassword1" 
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//             <div className="mb-3 form-check">
//               <input type="checkbox" className="form-check-input" id="exampleCheck1" />
//               <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
//             </div>
//             <button type="submit" className="btn btn-primary">Submit</button>
//           </form>

//           <div className="mt-3 text-center">
//             <span>New user? </span>
//             <Link to="/register">Register here</Link>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SignIn;
