import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceProctoringProps {
  onWarning: (type: 'NO_FACE' | 'MULTIPLE_FACES') => void;
  onCameraError: (error: string) => void;
}

const FaceProctoring: React.FC<FaceProctoringProps> = ({ onWarning, onCameraError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const noFaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        // Use a lighter model for faster loading and performance
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        console.log("Face detection models loaded.");
      } catch (error) {
        console.error("Failed to load face-api models:", error);
        onCameraError("Couldn't load proctoring models.");
      }
    };
    loadModels();
  }, [onCameraError]);

  // Start video stream on component mount
  useEffect(() => {
    const startVideo = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
           onCameraError("Camera access not supported by browser.");
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        onCameraError("Camera access denied.");
      }
    };
    
    startVideo();

    // Cleanup function to stop video stream
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onCameraError]);
  
  const handleVideoPlay = () => {
    setVideoReady(true);
    console.log("Camera stream is ready.");
  };

  // Main detection loop
  useEffect(() => {
    // Only run when both models and video are ready
    if (!videoReady || !modelsLoaded) return;

    console.log("Starting face detection loop.");

    const detectionInterval = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
        );

        if (detections.length === 0) {
          // If no face is detected, start a timeout to issue a warning
          if (!noFaceTimeoutRef.current) {
            noFaceTimeoutRef.current = setTimeout(() => {
              console.warn("WARNING: Face not detected.");
              onWarning('NO_FACE');
            }, 3000); // 3-second grace period
          }
        } else {
          // If face(s) are detected, clear any existing timeout
          if (noFaceTimeoutRef.current) {
            clearTimeout(noFaceTimeoutRef.current);
            noFaceTimeoutRef.current = null;
          }
          
          if (detections.length > 1) {
            console.warn("WARNING: Multiple faces detected.");
            onWarning('MULTIPLE_FACES');
          }
        }
      }
    }, 1500); // Check every 1.5 seconds

    return () => {
      clearInterval(detectionInterval);
      if (noFaceTimeoutRef.current) {
        clearTimeout(noFaceTimeoutRef.current);
      }
    };
  }, [videoReady, modelsLoaded, onWarning]);

  return (
    <div className="relative w-full h-full bg-black">
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline
        onPlay={handleVideoPlay}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', transform: 'scaleX(-1)' }}
      />
      {!modelsLoaded && (
        <div style={overlayStyle}>
          <span className="text-xs">Loading AI...</span>
        </div>
      )}
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '6px'
};

export default React.memo(FaceProctoring);
