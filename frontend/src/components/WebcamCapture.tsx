import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X } from 'lucide-react';
import { Button } from './ui/button';

interface WebcamCaptureProps {
  onCapture: (file: File) => void;
  onCancel?: () => void;
}

export function WebcamCapture({ onCapture, onCancel }: WebcamCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup function to stop camera stream
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  // Start camera
  const startCamera = async () => {
    setIsCameraStarting(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment', // Prefer back camera on mobile
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsStreaming(true);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera access denied. Please allow camera permissions and try again.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError('Failed to access camera. Please check your browser permissions.');
      }
    } finally {
      setIsCameraStarting(false);
    }
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and then to data URL for preview
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedImage(url);
          stopStream(); // Stop camera after capture
        }
      }, 'image/jpeg', 0.9);
    }
  };

  // Confirm and send captured image to parent
  const confirmCapture = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `webcam-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  };

  // Retake photo
  const retake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    startCamera();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [capturedImage]);

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Camera Not Started */}
      {!isStreaming && !capturedImage && (
        <div className="border-2 border-gray-300 rounded-lg p-8 text-center">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Capture Homework Photo
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Take a clear photo of your homework question
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={startCamera} disabled={isCameraStarting}>
              <Camera className="h-4 w-4 mr-2" />
              {isCameraStarting ? 'Starting Camera...' : 'Start Camera'}
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Live Video Preview */}
      {isStreaming && !capturedImage && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
              style={{ maxHeight: '500px' }}
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <Button
                size="lg"
                onClick={capturePhoto}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="h-5 w-5 mr-2" />
                Capture Photo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  stopStream();
                  onCancel?.();
                }}
                className="bg-white"
              >
                <X className="h-5 w-5 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Position your homework clearly in the frame, then click "Capture Photo"
          </p>
        </div>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="space-y-4">
          <div className="border-2 border-green-300 rounded-lg overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured homework"
              className="w-full h-auto"
              style={{ maxHeight: '500px' }}
            />
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              onClick={confirmCapture}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-5 w-5 mr-2" />
              Use This Photo
            </Button>
            <Button size="lg" variant="outline" onClick={retake}>
              <RefreshCw className="h-5 w-5 mr-2" />
              Retake
            </Button>
          </div>
          <p className="text-sm text-green-600 text-center font-medium">
            Photo captured! Confirm to use this image or retake if needed.
          </p>
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
