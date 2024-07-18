import React, { useState } from 'react';
import axios from 'axios';

const DiagnosisForm = () => {
    const [content, setContent] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setDiagnosis('');

        try {
            const response = await axios.post('http://localhost:5000/diagnose', { content });
            setDiagnosis(response.data.diagnosis);
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div>
            <h1>Get Diagnosis</h1>
            <form onSubmit={handleSubmit}>
                <textarea 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    placeholder="Enter medical report here..." 
                    required
                />
                <button type="submit">Submit</button>
            </form>
            {diagnosis && <h2>Diagnosis: {diagnosis}</h2>}
            {error && <h2 style={{ color: 'red' }}>Error: {error}</h2>}
        </div>
    );
};

export default DiagnosisForm;
