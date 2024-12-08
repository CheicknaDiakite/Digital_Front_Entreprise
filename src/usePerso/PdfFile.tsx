import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const PdfViewer: React.FC<{ fileUrl: string }> = ({ fileUrl }) => {
  
  return (
    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
      <div style={{ height: '750px' }}>
        <Viewer fileUrl={fileUrl} />
      </div>
    </Worker>
  );
};

export default PdfViewer;
