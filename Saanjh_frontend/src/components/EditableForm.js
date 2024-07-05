import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import Modal from 'react-modal';
import axios from 'axios';

const makeRequestAPI = async (prompt) => {
  try {
    const response = await axios.post('http://localhost:8080/diagnose', { prompt });
    return response.data;
  } catch (error) {
    throw new Error(`Error in makeRequestAPI: ${error.message}`);
  }
};

const getWeekNumber = () => {
  const currentDate = new Date();
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const pastDaysOfYear = (currentDate - startOfYear) / 86400000 + 1;
  return Math.ceil(pastDaysOfYear / 7);
};

const EditableForm = ({ selectedPatientId, initialData }) => {
  console.log('EditableForm selectedPatientId:', selectedPatientId);
  const [formData, setFormData] = useState(initialData || {});
  const [originalData, setOriginalData] = useState(initialData || {});
  const [isEditing, setIsEditing] = useState(false);
  const [diagnosisReport, setDiagnosisReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false); // State for save success message
  const [isDataSaved, setIsDataSaved] = useState(false); // State to track if data is already saved
  const reportRef = useRef(null);

  useEffect(() => {
    setFormData(initialData);
    // setOriginalData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [diagnosisReport]);

  const handleInputChange = (e, path) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData };

    let nested = updatedFormData;
    for (let i = 0; i < path.length - 1; i++) {
      nested = nested[path[i]];
    }
    nested[path[path.length - 1]] = value;

    setFormData(updatedFormData);

    console.log('Updated form data:', updatedFormData);
  };

  const renderFields = (data, path = []) => {
    return Object.keys(data).map((key) => {
      const value = data[key];
      const currentPath = [...path, key];

      if (typeof value === 'object' && value !== null) {
        return (
          <div key={key} style={{ display: 'block', marginTop: '10px', marginBottom: '10px' }}>
            <strong>{key}</strong>
            {renderFields(value, currentPath)}
          </div>
        );
      } else {
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ width: '150px', marginRight: '10px' }}>{key}</label>
            {isEditing ? (
              <input
                type="text"
                name={key}
                value={value}
                onChange={(e) => handleInputChange(e, currentPath)}
                style={{ flex: '1', padding: '8px', boxSizing: 'border-box' }}
              />
            ) : (
              <span style={{ flex: '1', padding: '8px', backgroundColor: '#f0f0f0' }}>
                {value}
              </span>
            )}
          </div>
        );
      }
    });
  };

  const mutation = useMutation({
    mutationFn: makeRequestAPI,
    mutationKey: ['gemini-ai-request'],
    onSuccess: (data) => {
      setDiagnosisReport(
        data.replace(/\*+/g, '').split('\n').map((line, index) => <p key={index}>{line}</p>)
      );
      setShowModal(true);
    },
  });

  const handleSubmit = async () => {
    try {
      if (!isDataSaved) { // Check if data is not already saved
        const weekNumber = getWeekNumber();
        const dataToSave = { ...formData, userId: selectedPatientId, week: weekNumber };
        const response = await axios.post('http://localhost:8080/save', dataToSave);
        console.log('Save response:', response.data);
        
        // Show success message
        setSaveSuccess(true);
        setIsDataSaved(true); // Mark data as saved
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        console.log('Data already saved.');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      // Optionally, show an error message if saving fails
      alert('Error: Failed to save data.');
    }
  };

  const handleSave = () => {
    setOriginalData(formData); // Save the current form data as the original data
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(originalData); // Revert to the original data
    setIsEditing(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setDiagnosisReport(null);
  };

  return (
    <div className='flex flex-col min-h-screen p-6' style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h1 className="mb-4 text-2xl font-bold text-blue-600 md:text-4xl lg:text-4xl pb-2 flex items-center">
        Report Details
        <span className="ml-4">
          <img width={30} src="https://res.cloudinary.com/duwadnxwf/image/upload/v1716300380/patient_u29wkb.png" alt="patient icon" />
        </span>
      </h1>

      <div className='flex-grow overflow-auto' style={{ maxHeight: '60vh', paddingRight: '1rem' }}>
        {renderFields(formData)}
      </div>

      <div className='mt-4 flex space-x-2'>
        {!isEditing && (
          <>
            <button
              type="button"
              className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-4 py-2.5 text-center inline-flex items-center"
              onClick={() => setIsEditing(true)}
            >
              <img src="https://res.cloudinary.com/duwadnxwf/image/upload/v1716276383/icons8-edit-24_fpgba3.png" className="h-5 w-5 pb-1" />
              Edit
            </button>
            <button
              type="button"
              className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-4 py-2.5 text-center inline-flex items-center"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </>
        )}

        {isEditing && (
          <>
            <button
              type="button"
              className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-4 py-2.5 text-center inline-flex items-center"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-4 py-2.5 text-center inline-flex items-center"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {mutation.isPending && <p className='text-5xl'>Generating your content</p>}
      {mutation.isError && <p>{mutation.error.message}</p>}
      
      {saveSuccess && (
        <p className="text-green-600 mt-2">Data successfully saved in MongoDB!</p>
      )}

      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          },
          content: {
            maxWidth: '600px',
            margin: 'auto',
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'rgba(220, 220, 220, 0.76)',
            textAlign: 'center',
          },
        }}
      >
        <h2 className='text-2xl font-bold text-dark-800 mb-2'>Diagnosis Report</h2>
        {diagnosisReport && (
          <div className='border border-gray-300 p-4 rounded-md text-dark'>
            {diagnosisReport}
          </div>
        )}
        <button
          onClick={closeModal}
          className='mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg focus:outline-none'
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

export default EditableForm;
