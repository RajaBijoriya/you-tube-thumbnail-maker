import React from "react";

const Questionnaire = ({ formData, setFormData }) => {
  const videoTypes = [
    "Gaming",
    "Tutorial",
    "Vlog",
    "Review",
    "Educational",
    "Entertainment",
    "Music",
    "News",
    "Sports",
    "Technology",
    "Cooking",
    "Travel",
    "Fitness",
    "Comedy",
    "Other",
  ];

  const styles = [
    "Minimal",
    "Bold",
    "Cinematic",
    "Colorful",
    "Dark",
    "Vintage",
    "Modern",
    "Retro",
    "Gradient",
    "Neon",
    "Pastel",
    "Monochrome",
    "Abstract",
    "Realistic",
    "Cartoon",
  ];

  const moods = [
    "Fun",
    "Serious",
    "Motivational",
    "Mysterious",
    "Exciting",
    "Calm",
    "Dramatic",
    "Playful",
    "Professional",
    "Casual",
    "Energetic",
    "Relaxed",
    "Intense",
    "Whimsical",
    "Elegant",
  ];

  const photoPlacements = [
    {
      value: "left",
      label: "Left Side",
      description: "Photo on the left side of the thumbnail",
    },
    {
      value: "right",
      label: "Right Side",
      description: "Photo on the right side of the thumbnail",
    },
    {
      value: "center",
      label: "Center",
      description: "Photo in the center of the thumbnail",
    },
    {
      value: "background",
      label: "Background",
      description: "Photo as background element",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Video Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What type of video is this? *
        </label>
        <select
          value={formData.videoType || ""}
          onChange={(e) => handleInputChange("videoType", e.target.value)}
          className="select-field"
          required>
          <option value="">Select video type</option>
          {videoTypes.map((type) => (
            <option key={type} value={type.toLowerCase()}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What style do you prefer? *
        </label>
        <select
          value={formData.style || ""}
          onChange={(e) => handleInputChange("style", e.target.value)}
          className="select-field"
          required>
          <option value="">Select style</option>
          {styles.map((style) => (
            <option key={style} value={style.toLowerCase()}>
              {style}
            </option>
          ))}
        </select>
      </div>

      {/* Mood */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What mood should the thumbnail convey? *
        </label>
        <select
          value={formData.mood || ""}
          onChange={(e) => handleInputChange("mood", e.target.value)}
          className="select-field"
          required>
          <option value="">Select mood</option>
          {moods.map((mood) => (
            <option key={mood} value={mood.toLowerCase()}>
              {mood}
            </option>
          ))}
        </select>
      </div>

      {/* Photo Placement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Where should your photo be placed? *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {photoPlacements.map((placement) => (
            <label
              key={placement.value}
              className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
                formData.photoPlacement === placement.value
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}>
              <input
                type="radio"
                name="photoPlacement"
                value={placement.value}
                checked={formData.photoPlacement === placement.value}
                onChange={(e) =>
                  handleInputChange("photoPlacement", e.target.value)
                }
                className="sr-only"
                required
              />
              <div className="flex flex-col">
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  {placement.label}
                </span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  {placement.description}
                </span>
              </div>
              {formData.photoPlacement === placement.value && (
                <div className="absolute top-2 right-2">
                  <div className="h-4 w-4 bg-primary-600 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Additional Options
        </h3>

        {/* Formats */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thumbnail Formats
          </label>
          <div className="space-y-2">
            {[
              {
                value: "horizontal",
                label: "Horizontal (1280x720) - YouTube Videos",
              },
              {
                value: "vertical",
                label: "Vertical (1080x1920) - Shorts/Reels",
              },
            ].map((format) => (
              <label key={format.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.formats?.includes(format.value) || false}
                  onChange={(e) => {
                    const currentFormats = formData.formats || [];
                    if (e.target.checked) {
                      handleInputChange("formats", [
                        ...currentFormats,
                        format.value,
                      ]);
                    } else {
                      handleInputChange(
                        "formats",
                        currentFormats.filter((f) => f !== format.value)
                      );
                    }
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {format.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Variations (1-5)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={formData.generateCount || 3}
            onChange={(e) =>
              handleInputChange("generateCount", parseInt(e.target.value))
            }
            className="input-field w-24"
          />
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
