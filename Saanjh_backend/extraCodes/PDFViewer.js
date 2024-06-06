// PDFViewer.js
import React from 'react';

const PDFViewer = ({ filePath }) => {
  return (
    <div>
      <embed src={filePath} type="application/pdf" width="100%" height="600px" />
    </div>
  );
};

export default PDFViewer;
