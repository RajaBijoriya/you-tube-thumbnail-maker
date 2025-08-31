import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CloudArrowDownIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  ArrowLeftIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Results = () => {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const fetchSessionData = useCallback(async () => {
    try {
      const response = await fetch(`/api/generate/session/${sessionId}`);
      if (!response.ok) {
        throw new Error("Session not found");
      }
      const data = await response.json();
      setSessionData(data.session);
    } catch (error) {
      console.error("Error fetching session:", error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  const handleDownload = async (thumbnailId) => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/download/${thumbnailId}`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thumbnail_${thumbnailId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Thumbnail downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download thumbnail");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/download/all/${sessionId}`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thumbnails_${sessionId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("All thumbnails downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download thumbnails");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyUrl = async (thumbnailId) => {
    try {
      const response = await fetch(`/api/download/copy/${thumbnailId}`);
      if (!response.ok) throw new Error("Failed to get URL");

      const data = await response.json();
      await navigator.clipboard.writeText(data.url);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy URL");
    }
  };

  const handleShare = async (thumbnailId) => {
    try {
      const response = await fetch(`/api/download/share/${thumbnailId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareType: "public" }),
      });

      if (!response.ok) throw new Error("Failed to create share link");

      const data = await response.json();
      await navigator.clipboard.writeText(data.shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to create share link");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading your thumbnails...
          </p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Session Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The thumbnail session you're looking for doesn't exist or has expired.
        </p>
        <Link to="/generator" className="btn-primary">
          Create New Thumbnails
        </Link>
      </div>
    );
  }

  const { thumbnails, userInput, originalFile } = sessionData;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/generator"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Generator
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Generated Thumbnails
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {thumbnails.length} thumbnails generated successfully
            </p>
          </div>

          <button
            onClick={handleDownloadAll}
            disabled={downloading}
            className="btn-primary flex items-center space-x-2">
            <CloudArrowDownIcon className="h-5 w-5" />
            <span>Download All</span>
          </button>
        </div>
      </div>

      {/* Session Info */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Session Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Original Photo
            </h3>
            <img
              src={originalFile.url}
              alt="Original"
              className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            />
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                Video Type:
              </span>
              <span className="ml-2 text-gray-600 dark:text-gray-300 capitalize">
                {userInput.videoType}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                Style:
              </span>
              <span className="ml-2 text-gray-600 dark:text-gray-300 capitalize">
                {userInput.style}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                Mood:
              </span>
              <span className="ml-2 text-gray-600 dark:text-gray-300 capitalize">
                {userInput.mood}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                Photo Placement:
              </span>
              <span className="ml-2 text-gray-600 dark:text-gray-300 capitalize">
                {userInput.photoPlacement}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {thumbnails.map((thumbnail) => (
          <div key={thumbnail.id} className="card group">
            <div className="relative mb-4">
              <img
                src={thumbnail.url}
                alt={`Thumbnail ${thumbnail.id}`}
                className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                onClick={() => setSelectedThumbnail(thumbnail)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                <button
                  onClick={() => setSelectedThumbnail(thumbnail)}
                  className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 p-2 rounded-full transition-all duration-200">
                  <EyeIcon className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {thumbnail.format}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {thumbnail.dimensions.width}x{thumbnail.dimensions.height}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(thumbnail.id)}
                  disabled={downloading}
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-1">
                  <CloudArrowDownIcon className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleCopyUrl(thumbnail.id)}
                  className="btn-secondary text-sm py-2 px-3"
                  title="Copy URL">
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare(thumbnail.id)}
                  className="btn-secondary text-sm py-2 px-3"
                  title="Share">
                  <ShareIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for thumbnail preview */}
      {selectedThumbnail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Thumbnail Preview
                </h3>
                <button
                  onClick={() => setSelectedThumbnail(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <img
                src={selectedThumbnail.url}
                alt="Thumbnail preview"
                className="w-full rounded-lg"
              />
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleDownload(selectedThumbnail.id)}
                  disabled={downloading}
                  className="btn-primary flex items-center space-x-2">
                  <CloudArrowDownIcon className="h-5 w-5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleCopyUrl(selectedThumbnail.id)}
                  className="btn-secondary flex items-center space-x-2">
                  <ClipboardDocumentIcon className="h-5 w-5" />
                  <span>Copy URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
