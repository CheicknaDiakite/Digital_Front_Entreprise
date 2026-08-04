import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Alert, CircularProgress, Paper, Box } from '@mui/material';

interface PdfViewerProps {
  fileUrl: string;
}

const PDF_WORKER_URL = "https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js";

const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const handleDocumentLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            opacity: 0.75,
            zIndex: 10,
          }}
        >
          <CircularProgress size={40} color="primary" />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      <Worker workerUrl={PDF_WORKER_URL}>
        <Box sx={{ height: 500, bgcolor: 'grey.100' }}>
          <Viewer
            fileUrl={fileUrl}
            plugins={[defaultLayoutPluginInstance]}
            onDocumentLoad={handleDocumentLoad}
          />
        </Box>
      </Worker>
    </Paper>
  );
};

export default PdfViewer;