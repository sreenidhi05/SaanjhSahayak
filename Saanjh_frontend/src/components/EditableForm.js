import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';


// const makeRequestAPI = async (prompt) => {
//   try {
//     const response = await axios.post('http://localhost:8080/diagnose', { prompt });
//     return response.data;
//   } catch (error) {
//     throw new Error(`Error in makeRequestAPI: ${error.message}`);
//   }
// };

const getWeekNumber = () => {
  const currentDate = new Date();
  return currentDate;
};

const EditableForm = ({ selectedPatientId, initialData }) => {
  console.log('EditableForm selectedPatientId:', selectedPatientId);
  const [formData, setFormData] = useState(initialData || {});
  const [isEditing, setIsEditing] = useState(false);
  const [diagnosisReport, setDiagnosisReport] = useState(null);

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


  const handleSave = async () => {
    try {
      const weekNumber = getWeekNumber();
      const dataToSave = { ...formData, userId: selectedPatientId, date: weekNumber };
      const response = await axios.post('http://localhost:8080/api/save', dataToSave);
      console.log('Save response:', response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving data:', error);
    }
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
              onClick={() => setIsEditing(!isEditing)}
            >
            {!isEditing && <img src="https://res.cloudinary.com/duwadnxwf/image/upload/v1716276383/icons8-edit-24_fpgba3.png" className="h-6 w-5 pb-1" />}
            {isEditing ? 'Cancel' : 'Edit'}
            </button>

            {/* <button
              type="button"
              className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-4 py-2.5 text-center inline-flex items-center"
              onClick={handleSave}
            >
              Submit
            </button> */}
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
            {/* <button
              type="button"
              className="text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-4 py-2.5 text-center inline-flex items-center"
              onClick={handleCancel}
            >
              Cancel
            </button> */}
          </>
        )}
      </div>

      {/* {mutation.isPending && <p className='text-5xl'>Generating your content</p>}
      {mutation.isError && <p>{mutation.error.message}</p>} */}
      
      {/* {saveSuccess && (
        <p className="text-green-600 mt-2">Data successfully saved in MongoDB!</p>
      )} */}


    </div>
  );
};

export default EditableForm;