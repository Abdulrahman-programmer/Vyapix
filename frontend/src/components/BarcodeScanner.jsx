//Components / BarcodeScanner.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScanner = ({ 
  isOpen, 
  onClose, 
  onScanSuccess, 
  onScanError = null,
  title = "Scan Barcode"
}) => {
  const scannerRef = useRef(null);
  const html5QrcodeRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [scanResult, setScanResult] = useState('');

  // Initialize scanner when modal opens
  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanner();
    } else if (!isOpen && isScanning) {
      stopScanner();
    }

    // Cleanup on unmount
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    if (!scannerRef.current || isScanning) return;

    try {
      const html5QrCode = new Html5Qrcode("barcode-scanner");
      html5QrcodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        (decodedText, decodedResult) => {
          // Prevent multiple scans of the same code
          if (decodedText !== lastScannedCode) {
            setLastScannedCode(decodedText);
            setScanResult(`Scanned: ${decodedText}`);
            
            // Call the success callback
            if (onScanSuccess) {
              onScanSuccess(decodedText, decodedResult);
            }

            // Auto-close after successful scan
            setTimeout(() => {
              handleClose();
            }, 500);
          }
        },
        (errorMessage) => {
          // Only log actual errors, not "no QR code found"
          if (!errorMessage.includes('No QR code found')) {
            console.warn('Scan error:', errorMessage);
            if (onScanError) {
              onScanError(errorMessage);
            }
          }
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      alert('Failed to start camera. Please check permissions and try again.');
      handleClose();
    }
  };

  const stopScanner = async () => {
    if (html5QrcodeRef.current && isScanning) {
      try {
        await html5QrcodeRef.current.stop();
        await html5QrcodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      html5QrcodeRef.current = null;
      setIsScanning(false);
      setScanResult('');
      setLastScannedCode('');
    }
  };

  const handleClose = () => {
    stopScanner();
    if (onClose) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-1000">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <div 
            id="barcode-scanner" 
            ref={scannerRef}
            className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
            style={{ minHeight: '250px' }}
          />
        </div>

        {scanResult && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
            {scanResult}
          </div>
        )}

        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          Position the barcode within the frame to scan
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;