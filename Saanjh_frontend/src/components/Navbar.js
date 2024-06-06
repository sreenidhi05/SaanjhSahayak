import React from 'react';

function Navbar() {
    return (
      // <nav className="navbar navbar-expand-lg navbar-light fixed-top" style={{backgroundColor: '#42a5f5'}}>
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">

        <div className="container-fluid">
        <a className="navbar-brand" href="#">
            <img src="/logo.png" alt="Saanjh Sahayak Logo" width="50" height="50" /></a>        
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">

              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/home" style={{ fontSize: '18px', fontWeight: 'bold' }}>Home</a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/signin" style={{ fontSize: '18px', fontWeight: 'bold' }}>Sign In</a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/chatbot" style={{ fontSize: '18px', fontWeight: 'bold' }}>Chat Bot</a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/form" style={{ fontSize: '18px', fontWeight: 'bold' }}>Form</a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/profile" style={{ fontSize: '18px', fontWeight: 'bold' }}>Profile</a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/aboutus" style={{ fontSize: '18px', fontWeight: 'bold' }}>About Us</a>
              </li>

              {/* <li className="nav-item">
                <a className="nav-link disabled" aria-disabled="true" style={{ fontSize: '18px', fontWeight: 'bold' }}>Disabled</a>
              </li> */}

            </ul>
          </div>
        </div>
      </nav>
    );
  }
  
  export default Navbar;
  
  
