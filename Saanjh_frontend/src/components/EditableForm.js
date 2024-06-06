import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

const makeRequestAPI = async (prompt) => {
  const response = await axios.post('http://localhost:8080/diagnose', { prompt });
  return response.data;
};

const EditableForm = ({ initialData }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [isEditing, setIsEditing] = useState(false);
  const [diagnosisReport, setDiagnosisReport] = useState(null);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

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
          <div key={key}>
            <strong style={{ display: 'block', marginTop: '10px', marginBottom: '5px' }}>{key}</strong>
            {renderFields(value, currentPath)}
          </div>
        );
      } else {
        return (
          <div key={key} style={{ display: 'flex', marginBottom: '10px', fontSize: '15px' }}>
            <div style={{ textAlign: 'center', justifyContent: 'center', width: '150px', color: 'black', fontWeight: '400', backgroundColor: 'skyblue', borderRadius: '6px', padding: '4px' }}>
              {key}
            </div>
            <div style={{ flex: 1, paddingLeft: '1rem', backgroundColor: 'ButtonHighlight', borderRadius: '6px', paddingTop: '4px' }}>
              {isEditing ? (
                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={(e) => handleInputChange(e, currentPath)}
                  style={{ width: '800px', backgroundColor: 'ButtonHighlight' }}
                />
              ) : (
                <span>{value}</span>
              )}
            </div>
          </div>
        );
      }
    });
  };

  const mutation = useMutation({
    mutationFn: makeRequestAPI,
    mutationKey: ['gemini-ai-request']
  });

  const submitHandler = (e) => {
    e.preventDefault();
    const prompt = JSON.stringify(formData);
    mutation.mutate(prompt);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post('/save', formData);
      console.log('Save response:', response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <div className='pl-10 pr-10'>
      <h1 className="mb-4 text-3xl font-extrabold text-blue-600 md:text-5xl lg:text-5xl pb-2 flex items-center">
        Report Details
        <span className="ml-4">
          <img width={40} src="https://res.cloudinary.com/duwadnxwf/image/upload/v1716300380/patient_u29wkb.png" alt="patient icon" />
        </span>
      </h1>

      <div style={{ maxHeight: '400px', overflow: 'auto', paddingRight: '1rem' }}>
        {renderFields(formData)}
      </div>

      <button
        type="button"
        className="mt-3 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-4 py-2.5 text-center inline-flex items-center me-2 mb-2"
        onClick={() => setIsEditing(!isEditing)}
      >
        {!isEditing && <img src="https://res.cloudinary.com/duwadnxwf/image/upload/v1716276383/icons8-edit-24_fpgba3.png" className="h-6 w-5 pb-1" />}
        {isEditing ? 'Cancel' : 'Edit'}
      </button>
      {isEditing &&
        <button type="button"
          className="mt-3 mb-5 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-4 py-2.5 text-center inline-flex items-center me-2 mb-2"
          onClick={handleSave}>Save</button>}

      {!isEditing &&
        <form onSubmit={submitHandler}>
          <button
            type="submit"
            className="mt-3 mb-5 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-4 py-2.5 text-center inline-flex items-center me-2 mb-2"
          >
            Diagnose
          </button>
        </form>
      }

      {mutation.isPending && <p>Generating your content</p>}
      {mutation.isError && <p>{mutation.error.message}</p>}
      {mutation.isSuccess && <p>{mutation.data}</p>}
    </div>
  );
};

export default EditableForm;
