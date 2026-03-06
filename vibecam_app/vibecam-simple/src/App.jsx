import { useState, useRef, useEffect } from 'react';
import { analyzeImage } from './utils/analyzeImage';

function App() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    setResult(null);
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 (JPEG at 0.7 quality)
    const base64Image = canvas.toDataURL('image/jpeg', 0.7);
    setCapturedImage(base64Image);
    
    // Stop camera to save power during analysis
    stopCamera();
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await analyzeImage(base64Image);
      if (analysis.success) {
        setResult(analysis.data);
      } else {
        setError(analysis.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const backgroundColor = result?.hexColor || '#000000';

  return (
    <div
      className="min-h-screen transition-colors duration-1000 flex flex-col items-center justify-center p-4 font-sans text-white"
      style={{ backgroundColor }}
    >
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Header */}
        {!isCameraActive && !result && !isAnalyzing && (
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-black mb-3 tracking-tighter">
              Sonoptic
            </h1>
            <p className="text-white/70 text-lg font-medium">
              The world has a sound.
            </p>
          </div>
        )}

        {/* Camera / Preview Area */}
        <div className="w-full aspect-[3/4] bg-white/5 rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/10 mb-8">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraActive ? 'opacity-100' : 'opacity-0 absolute'}`}
          />

          {/* Analysis Result or Placeholder */}
          {!isCameraActive && (
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Captured Photo Background */}
              {capturedImage && (
                <img 
                  src={capturedImage} 
                  alt="Captured vibe" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              )}

              {isAnalyzing ? (
                <div className="flex flex-col items-center animate-pulse z-10">
                  <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                  <p className="font-medium tracking-wide">Synthesizing vibes...</p>
                </div>
              ) : result ? (
                <div className="absolute inset-0 flex flex-col p-8 bg-black/30 backdrop-blur-[2px] animate-fade-in overflow-y-auto z-10">
                   <div className="mt-auto space-y-6">
                    <div>
                      <h2 className="text-[0.65rem] uppercase tracking-[0.2em] text-white/50 font-bold mb-2">The Mood</h2>
                      <p className="text-2xl font-light leading-tight italic">"{result.mood}"</p>
                    </div>

                    <div>
                      <h2 className="text-[0.65rem] uppercase tracking-[0.2em] text-white/50 font-bold mb-2">Sonic Atmosphere</h2>
                      <p className="text-lg font-medium">{result.soundscape}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {result.vibes.map((vibe, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-semibold">
                          {vibe}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                       <div className="w-10 h-10 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: result.hexColor }} />
                       <span className="font-mono text-xs text-white/60 tracking-widest uppercase">{result.hexColor}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-white/20 text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 opacity-10 border-4 border-current rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-current rounded-sm" />
                  </div>
                  <p className="text-sm font-medium italic">Ready for input</p>
                </div>
              )}
            </div>
          )}

          {/* Hidden Canvas for Capturing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="w-full flex justify-center gap-4">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="bg-white text-black px-10 py-5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all text-lg shadow-xl"
            >
              {result ? "Try Another" : "Open Camera"}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white/20 hover:scale-110 active:scale-90 transition-all shadow-2xl"
              >
                <div className="w-16 h-16 bg-white border-2 border-black/10 rounded-full" />
              </button>
              <button 
                onClick={stopCamera}
                className="text-white/60 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-2xl p-4 text-white text-sm text-center max-w-xs">
             {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
