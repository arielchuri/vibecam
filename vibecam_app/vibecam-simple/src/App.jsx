import { useState, useRef } from 'react';
import { compressImage } from './utils/compressImage';
import { analyzeImage } from './utils/analyzeImage';

function App() {
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    try {
      // Show preview
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      // Compress image
      setIsAnalyzing(true);
      const base64 = await compressImage(file);

      // Analyze with AI
      const analysis = await analyzeImage(base64);

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
      className="min-h-screen transition-colors duration-1000 flex flex-col items-center justify-center p-4"
      style={{ backgroundColor }}
    >
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Synesthesia Camera
          </h1>
          <p className="text-white/80">
            What does your world sound like?
          </p>
        </div>

        {/* Upload Button */}
        <div className="flex justify-center mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all text-lg shadow-lg"
          >
            Capture a Vibe
          </button>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-6 relative">
            <img
              src={imagePreview}
              alt="Your capture"
              className="w-full rounded-lg shadow-2xl"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">
                  Listening to the image...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
            <div className="mb-4">
              <h2 className="text-sm uppercase tracking-wide text-white/60 mb-1">
                The Mood
              </h2>
              <p className="text-lg italic">{result.mood}</p>
            </div>

            <div className="mb-4">
              <h2 className="text-sm uppercase tracking-wide text-white/60 mb-1">
                Sonic Atmosphere
              </h2>
              <p className="text-base">{result.soundscape}</p>
            </div>

            <div className="mb-4">
              <h2 className="text-sm uppercase tracking-wide text-white/60 mb-1">
                Vibes
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.vibes.map((vibe, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white/20 rounded-full text-sm"
                  >
                    {vibe}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-sm uppercase tracking-wide text-white/60">
                Dominant Color
              </h2>
              <div
                className="w-12 h-12 rounded-full border-2 border-white/50"
                style={{ backgroundColor: result.hexColor }}
              />
              <span className="font-mono text-sm">{result.hexColor}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-white">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
