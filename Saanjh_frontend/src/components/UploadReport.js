import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadReport = ({ onReportData }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate(); 


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null); // Reset error when a new file is selected
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8080/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onReportData(response.data.details); // Ensure this is the correct path
      //navigate('/uploaded');
    } catch (error) {
      setError('Error uploading file. Please try again.');
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
      <div>
        <input type="file" onChange={handleFileChange} />
        <div>
          <button
            type="button"
            className="mt-2 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-3 py-2 text-center me-2 mb-2"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Report'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default UploadReport;





// import React, { useState } from 'react';
// import axios from 'axios';

// const UploadReport = ({ onReportData }) => {
//   const [file, setFile] = useState(null);
//   const [error, setError] = useState(null);

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {

//     const formData = new FormData();
//     formData.append('file', file);

//     if (!file) {
//       setError('Please select a file to upload.');
//       return;
//     }
    
//     try {
//       const response = await axios.post('http://localhost:8080/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       onReportData(response.data.details); // Ensure this is the correct path
//     } catch (error) {
//       setError('Error uploading file. Please try again.');
//       console.error('Error uploading file:', error);
//     }
//   };

//   return (
//     <div style={{ display:'flex',justifyContent:'center',marginTop:'3rem' }}>
//       <div>
//         <input type="file" onChange={handleFileChange} />
//         <div>
//           <button
//             type="button"
//             className="mt-2 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg text-s px-3 py-2 text-center me-2 mb-2"
//             onClick={handleUpload}
//           >
//             Upload Report
//           </button>
//           {error && <p style={{ color: 'red' }}>{error}</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UploadReport;