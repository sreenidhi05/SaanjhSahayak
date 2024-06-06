import React from 'react';
import { useNavigate } from 'react-router-dom';


function Home() 
{
  let navigate = useNavigate();
  const handleClick = () => {
    // Redirect to the sign-in page when the button is clicked
    navigate('/signin');
  };

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

  const contentStyle = {
    zIndex: 1, // Ensure content is above the blurred background
    position: 'relative',
    position: 'absolute',
    top: '45%', // Position at the vertical center
    left: '10%', // Position towards the left
    transform: 'translateY(-50%)', // Center vertically
    color: 'black', // Adjust text color for better visibility
    textAlign: 'left',
    fontSize: '100px', // Increase the font size here
    fontWeight:'100px',
    fontFamily: 'Roboto, sans-serif', // Apply Bootstrap font family
    fontWeight: 'bold' // Make the text bold
  };

  const buttonContainerStyle = {
    position: 'absolute',
    top: '50%', // Position at the vertical center
    right: '10%', // Position towards the right
    transform: 'translateY(-50%)', // Center vertically
  };

  return (
    <div style={backgroundStyle}>
      <div style={blurOverlayStyle}></div> {/* Add a separate div for the blur effect */}
      <div style={contentStyle}>
        <p>Saanjh <br/>Sahayak</p>
      </div>
      <div style={buttonContainerStyle}>
        <button className="btn btn-primary" onClick={handleClick}>Continue</button> {/* Apply Bootstrap classes */}
      </div>
    </div>
  );
}

export default Home;
