import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  const [resultText, setResultText] = useState<string>('');

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-blue-600">Scanner de Code-Barres</h1>

      <div className="w-full aspect-video overflow-hidden rounded-lg border-2 border-blue-100 mb-4 bg-gray-50 relative">
        <Scanner
          onScan={(detectedCodes) => {
            if (detectedCodes.length > 0) {
              const text = detectedCodes[0].rawValue;
              console.log('Code détecté :', text);
              setResultText(text);
              onScan(text);
            }
          }}
          onError={(error) => {
            console.log('Erreur du scanner :', error);
          }}
          constraints={{
            facingMode: 'environment'
          }}
        />
      </div>

      <div className="w-full p-3 bg-gray-50 rounded border border-gray-200">
        <p className="text-gray-700">
          Résultat : <strong className="text-blue-700 break-all">{resultText || 'En attente...'}</strong>
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-4 italic">
        Positionnez le code-barres dans le cadre de la caméra
      </p>
    </div>
  );
};

export default BarcodeScanner;
