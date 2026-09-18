import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
}

const isExpectedDecodeError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name.includes('NotFoundException') ||
    error.name === 'IndexSizeError' ||
    error.message.includes('No MultiFormat Readers were able to detect the code')
  );
};

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  const [resultText, setResultText] = useState<string>('');
  const [scannerError, setScannerError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
      BarcodeFormat.RSS_14,
      BarcodeFormat.RSS_EXPANDED,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.AZTEC,
      BarcodeFormat.PDF_417,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new BrowserMultiFormatReader(hints);
    let lastValue = '';
    let isUnmounted = false;

    if (!videoRef.current) {
      return;
    }

    const controls = reader.decodeFromConstraints(
      {
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      videoRef.current,
      (result, error) => {
        if (result) {
          const text = result.getText();

          if (text && text !== lastValue) {
            lastValue = text;
            setResultText(text);
            onScanRef.current(text);
          }
        } else if (error && !isExpectedDecodeError(error)) {
          console.error('Erreur du scanner :', error);
        }
      },
    );

    controls.catch((error: unknown) => {
      if (!isUnmounted) {
        const message = error instanceof Error ? error.message : 'Impossible d’accéder à la caméra.';
        setScannerError(message);
        console.error('Impossible de démarrer le scanner :', error);
      }
    });

    return () => {
      isUnmounted = true;
      controls.then((scannerControls) => scannerControls.stop()).catch((error) => {
        console.error("Impossible d'arrêter le scanner :", error);
      });
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-blue-600">Scanner de Code-Barres</h1>

      <div className="w-full aspect-video overflow-hidden rounded-lg border-2 border-blue-100 mb-4 bg-gray-50 relative">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
      </div>

      {scannerError && (
        <p className="w-full mb-3 p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700">
          {scannerError}
        </p>
      )}

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
