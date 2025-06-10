import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff, Scan } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export const QRScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const { markAttendance, currentUser, sessions } = useApp();

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      const qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          try {
            const qrData = JSON.parse(result.data);
            if (qrData.sessionId) {
              await handleQRDetection(qrData.sessionId);
            } else {
              toast.error('Invalid QR Code');
            }
          } catch (error) {
            toast.error('Invalid QR Code format');
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      setIsScanning(true);
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setHasCamera(false);
      toast.error('Camera access denied or not available');
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const handleQRDetection = async (sessionId: string) => {
    if (!currentUser) {
      toast.error('Please login first');
      return;
    }

    // Find the session
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      toast.error('Session not found');
      return;
    }

    if (!session.isActive) {
      toast.error('This session is not active');
      return;
    }

    // Check if session is within time bounds
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);

    if (now < startTime) {
      toast.error('Session has not started yet');
      return;
    }

    if (now > endTime) {
      toast.error('Session has ended');
      return;
    }

    const success = await markAttendance(sessionId, currentUser.id);
    if (success) {
      toast.success(`Attendance marked for ${session.title}!`);
      stopScanning();
    } else {
      toast.error('Attendance already marked or error occurred');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="text-center mb-6">
          <Scan className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Scan QR Code</h2>
          <p className="text-white/70">Point your camera at a QR code to mark attendance</p>
        </div>

        <div className="space-y-6">
          {/* Camera Preview */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Camera Preview</p>
                  <p className="text-sm opacity-70">Start scanning to activate camera</p>
                </div>
              </div>
            )}

            {isScanning && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span>Scanning...</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!isScanning ? (
              <button
                onClick={startScanning}
                disabled={!hasCamera}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-purple-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Camera className="w-5 h-5" />
                <span>Start Scanning</span>
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:from-red-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all duration-200"
              >
                <CameraOff className="w-5 h-5" />
                <span>Stop Scanning</span>
              </button>
            )}
          </div>

          {!hasCamera && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-200 text-center">
                Camera access is required to scan QR codes. Please allow camera permissions and refresh the page.
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Instructions:</h3>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Click "Start Scanning" to activate your camera</li>
              <li>• Point your camera at the QR code displayed by your instructor</li>
              <li>• Keep the QR code within the camera frame</li>
              <li>• Your attendance will be marked automatically when detected</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};