# AI-Powered YouTube Thumbnail Generator 🎨

A modern web application that helps YouTubers create professional AI-generated thumbnails using OpenAI and Google Gemini APIs.

## ✨ Features

- **Photo Upload**: Support for PNG, JPG, JPEG with validation
- **Smart Questionnaire**: Video type, style, and mood selection
- **AI-Powered Generation**:
  - OpenAI GPT-4 for prompt rewriting
  - Google Gemini 2.5 Flash Image for thumbnail generation
- **Multiple Formats**: Horizontal (1280x720) and Vertical (1080x1920)
- **Batch Operations**: Download all thumbnails as ZIP
- **Modern UI**: Clean, responsive design with dark mode
- **Real-time Preview**: Instant thumbnail previews

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- OpenAI API key
- Google Gemini API key

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd ai-thumbnail-generator
   npm run install-all
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your API keys:

   ```
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   PORT=5000
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🛠️ Tech Stack

- **Frontend**: React + TailwindCSS
- **Backend**: Node.js + Express
- **AI Services**: OpenAI GPT-4, Google Gemini 2.5 Flash Image
- **File Handling**: Multer, Archiver
- **Styling**: TailwindCSS, HeadlessUI

## 📁 Project Structure

```
ai-thumbnail-generator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── services/          # AI service integrations
│   └── uploads/           # Temporary file storage
├── package.json
└── README.md
```

## 🔧 API Endpoints

- `POST /api/upload` - Upload user photo
- `POST /api/generate` - Generate thumbnails
- `GET /api/download/:id` - Download individual thumbnail
- `GET /api/download-all/:id` - Download all thumbnails as ZIP

## 🎯 Usage Flow

1. **Upload Photo**: Drag & drop or click to upload your photo
2. **Fill Questionnaire**: Select video type, style, and mood
3. **Choose Placement**: Position your photo (left, right, center)
4. **Generate**: AI creates multiple thumbnail variations
5. **Download**: Save individual thumbnails or download all as ZIP

## 🔑 API Keys Setup

### OpenAI API

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add to `.env` file

### Google Gemini API

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Get your API key for Gemini 2.5 Flash Image
3. Add to `.env` file

## 🎨 Customization

- Modify `client/src/components/` for UI changes
- Update AI prompts in `server/services/`
- Adjust thumbnail dimensions in `server/config/`

## 📝 License

MIT License - feel free to use this project for your own YouTube channel!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Happy thumbnail creating! 🎬✨**
