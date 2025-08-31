import React, { useState } from "react";
import { SparklesIcon, PhotoIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Generator = () => {
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [videoDetails, setVideoDetails] = useState({
    type: "",
    style: "",
    mood: "",
    photoPlacement: "center",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);

  const videoTypes = [
    "Tutorial/How-to",
    "Vlog",
    "Gaming",
    "Review",
    "Entertainment",
    "Educational",
  ];

  const styles = [
    "Modern & Clean",
    "Bold & Dramatic",
    "Minimalist",
    "Colorful & Vibrant",
    "Professional",
  ];

  const moods = [
    "Energetic",
    "Professional",
    "Fun & Playful",
    "Serious",
    "Mysterious",
    "Inspirational",
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadedFile(file);
    setStep(2);
  };

  const handleNextStep = () => {
    if (step === 2 && (!videoDetails.type || !videoDetails.style || !videoDetails.mood)) {
      toast.error("Please fill in all fields");
      return;
    }
    setStep(step + 1);
  };

  const handleGenerate = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a photo first");
      return;
    }

    setIsGenerating(true);

    try {
      setIsGenerating(true);
      
      // First, upload the image
      console.log("Uploading image...");
      const formData = new FormData();
      formData.append("image", uploadedFile);

      const uploadResponse = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        console.error("Upload failed:", uploadData);
        throw new Error(uploadData.message || uploadData.error || "Failed to upload image");
      }

      if (!uploadData.imageId) {
        console.error("No imageId in upload response:", uploadData);
        throw new Error("Image upload successful but no ID received");
      }

      console.log("Image uploaded successfully:", uploadData);

      // Then generate thumbnails
      console.log("Starting thumbnail generation...", { 
        imageId: uploadData.imageId, 
        videoDetails 
      });
      
      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: uploadData.imageId,
          videoType: videoDetails.type,
          style: videoDetails.style,
          mood: videoDetails.mood,
          photoPlacement: videoDetails.photoPlacement,
          formats: ["horizontal"], // Only generate horizontal format
          generateCount: 1 // Only generate one thumbnail
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Generation failed:", data);
        throw new Error(data.message || data.error || "Generation failed");
      }

      if (!data.thumbnails || data.thumbnails.length === 0) {
        console.error("No thumbnails in response:", data);
        throw new Error("No thumbnails were generated");
      }

      console.log("Thumbnails generated successfully:", data);
      setThumbnails(data.thumbnails);
      toast.success("Thumbnails generated successfully!");
      setStep(4); // Move to results view
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate thumbnails");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAll = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/download/zip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ thumbnailIds: thumbnails.map(t => t.id) }),
      });

      if (!response.ok) throw new Error("Failed to create zip file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "thumbnails.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download thumbnails");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Thumbnail Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create professional YouTube thumbnails in minutes
        </p>
        
        {/* Progress Steps */}
        <div className="flex justify-center items-center space-x-4 mt-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                s === step
                  ? "bg-primary-600 text-white"
                  : s < step
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {/* Step 1: Upload Photo */}
        {step === 1 && (
          <div className="text-center">
            <label
              htmlFor="photo-upload"
              className="block w-full max-w-md mx-auto p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 cursor-pointer"
            >
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload your photo
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                PNG, JPG up to 5MB
              </span>
            </label>
          </div>
        )}

        {/* Step 2: Video Details */}
        {step === 2 && (
          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Type
              </label>
              <select
                value={videoDetails.type}
                onChange={(e) =>
                  setVideoDetails({ ...videoDetails, type: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select type...</option>
                {videoTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Style
              </label>
              <select
                value={videoDetails.style}
                onChange={(e) =>
                  setVideoDetails({ ...videoDetails, style: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select style...</option>
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mood
              </label>
              <select
                value={videoDetails.mood}
                onChange={(e) =>
                  setVideoDetails({ ...videoDetails, mood: e.target.value })
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select mood...</option>
                {moods.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full btn-primary py-2 flex items-center justify-center space-x-2"
            >
              <span>Next</span>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Step 3: Photo Placement */}
        {step === 3 && (
          <div className="max-w-md mx-auto space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo Placement
              </label>
              <div className="grid grid-cols-3 gap-4">
                {["left", "center", "right"].map((placement) => (
                  <button
                    key={placement}
                    onClick={() =>
                      setVideoDetails({ ...videoDetails, photoPlacement: placement })
                    }
                    className={`p-4 border rounded-md capitalize ${
                      videoDetails.photoPlacement === placement
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200"
                    }`}
                  >
                    {placement}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full btn-primary py-2 flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  <span>Generate Thumbnails</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && result && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold">Thumbnail Analysis</h2>
            
            {/* Original Image */}
            <div>
              <h3 className="text-lg font-medium mb-4">Your Image</h3>
              <img
                src={uploadedFile ? URL.createObjectURL(uploadedFile) : ''}
                alt="Original"
                className="max-w-full h-auto rounded-lg shadow-md mx-auto"
              />
            </div>

            {/* Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium mb-4">AI Analysis</h3>
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{result.analysis}</div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>Generated at: {new Date(result.generatedAt).toLocaleString()}</p>
                <p className="mt-1">Based on your selections:</p>
                <ul className="list-disc ml-4 mt-1">
                  <li>Video Type: {videoDetails.type}</li>
                  <li>Style: {videoDetails.style}</li>
                  <li>Mood: {videoDetails.mood}</li>
                  <li>Photo Placement: {videoDetails.photoPlacement}</li>
                </ul>
              </div>
            </div>

            {/* Copy Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.analysis);
                  toast.success("Analysis copied to clipboard");
                }}
                className="btn-secondary px-4 py-2"
              >
                Copy Analysis to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <SparklesIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            AI-Powered
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Uses OpenAI and Google Gemini for professional thumbnails
          </p>
        </div>

        <div className="card text-center">
          <SparklesIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Multiple Formats
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Get both horizontal (YouTube) and vertical (Shorts) thumbnails
          </p>
        </div>

        <div className="card text-center">
          <SparklesIcon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Easy Download
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Download individual thumbnails or get everything in a ZIP file
          </p>
        </div>
      </div>
    </div>
  );
};

export default Generator;
