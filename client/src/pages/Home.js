import React from "react";
import { Link } from "react-router-dom";
import {
  SparklesIcon,
  PhotoIcon,
  CpuChipIcon,
  CloudArrowDownIcon,
  PlayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  const features = [
    {
      icon: PhotoIcon,
      title: "Upload Your Photo",
      description:
        "Upload your own photo (PNG, JPG, JPEG) and let AI create stunning thumbnails around it.",
    },
    {
      icon: DocumentTextIcon,
      title: "Smart Questionnaire",
      description:
        "Answer a few questions about your video type, style, and mood to get personalized results.",
    },
    {
      icon: CpuChipIcon,
      title: "AI-Powered Generation",
      description:
        "Uses OpenAI GPT-4 for prompt enhancement and Google Gemini 2.5 Flash Image for generation.",
    },
    {
      icon: CloudArrowDownIcon,
      title: "Multiple Formats",
      description:
        "Get thumbnails in both horizontal (1280x720) and vertical (1080x1920) formats for YouTube and Shorts.",
    },
  ];

  const benefits = [
    "Professional quality thumbnails in seconds",
    "No design skills required",
    "Multiple variations to choose from",
    "Optimized for YouTube click-through rates",
    "Dark mode support for comfortable editing",
    "Batch download all thumbnails as ZIP",
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <div className="mb-8">
          <SparklesIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            AI-Powered YouTube
            <span className="text-primary-600 block">Thumbnail Generator</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Create professional, eye-catching YouTube thumbnails in seconds
            using the power of AI. Upload your photo, answer a few questions,
            and watch the magic happen!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/generator"
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2">
              <PlayIcon className="h-5 w-5" />
              <span>Start Creating</span>
            </Link>
            <button className="btn-secondary text-lg px-8 py-3">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <feature.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 px-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose Our AI Thumbnail Generator?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 text-center">
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Create Amazing Thumbnails?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of YouTubers who are already using AI to create
            professional thumbnails that drive more views.
          </p>
          <Link
            to="/generator"
            className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5" />
            <span>Get Started Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
