// src/pages/Form.js
import React, { useState } from "react";
import EditableForm from "../EditableForm";
import UploadReport from "../UploadReport";
import '../styles/Form.css';  // Import the CSS file
import PatientSel from "../PatientSel";


export default function Form() 
{

  const backgroundStyle = {
    backgroundImage: "url('https://thumbs.dreamstime.com/z/informational-flyer-nursing-home-building-flat-poster-group-elderly-people-walks-near-banner-meet-visitors-street-cartoon-154355370.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh', // Adjust height as needed
    position: 'relative',
    zIndex: 0,
  };

  const blurOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(6px)', // Apply blur to the overlay
    zIndex: -1,
  };
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reportData, setReportData] = useState(null);

  const handlePatientSelect = (patientId) => {
    setSelectedPatientId(patientId); // Update selectedPatientId in Form.js
    console.log('Selected Patient ID in Form:', patientId); // Verify patientId is received here
  };

  const handleReportData = (data) => {
    setReportData(data);
  };

  return (
    <div style={backgroundStyle}>
      <div className="container d-flex justify-content-center align-items-center h-100">
        <div style={blurOverlayStyle}></div>
        <div className="form-container text-center mx-1">
          {/* <UploadReport onReportData={setReportData} />
          {reportData && <EditableForm initialData={reportData} />} */}
           <div>
        {selectedPatientId === '' ? (
          <PatientSel onSelectPatient={handlePatientSelect} />
        ) : reportData ? (
          <EditableForm initialData={reportData} selectedPatientId={selectedPatientId} />
        ) : (
          <UploadReport selectedPatientId={selectedPatientId} onReportData={handleReportData} />
        )}
      </div>
        </div>

      </div>
    </div>
  );
}
