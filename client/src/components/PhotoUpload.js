import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const PhotoUpload = ({ onPhotoUpload, uploadedFile, onRemovePhoto }) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PNG, JPG, or JPEG file");
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("photo", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        onPhotoUpload(data.file);
        toast.success("Photo uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload photo. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onPhotoUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: false,
  });

  if (uploadedFile) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Uploaded Photo
          </h3>
          <button
            onClick={onRemovePhoto}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove photo">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="relative">
          <img
            src={uploadedFile.url}
            alt="Uploaded"
            className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {uploadedFile.originalName}
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          <p>Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <p>Type: {uploadedFile.mimetype}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500"
        }`}>
        <input {...getInputProps()} />
        <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />

        {isUploading ? (
          <div className="space-y-2">
            <div className="loading-spinner mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragActive ? "Drop your photo here" : "Upload your photo"}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Drag and drop your photo here, or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supports PNG, JPG, JPEG (max 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
