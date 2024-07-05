// // FileUploader.js
// import React, { useState } from 'react';
// import axios from 'axios';

// const FileUploader = () => {
//   const [file, setFile] = useState(null);

//   const handleFileChange = (event) => {
//     setFile(event.target.files[0]);
//   };

//   const handleUpload = async () => {
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       const response = await axios.post('/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       console.log('File uploaded successfully:', response.data);
//       // Handle response as per your requirement
//     } catch (error) {
//       console.error('Error uploading file:', error);
//       // Handle error
//     }
//   };

//   return (
//     <div>
//       <input type="file" onChange={handleFileChange} />
//       <button onClick={handleUpload}>Upload Report</button>
//     </div>
//   );
// };

// export default FileUploader;
