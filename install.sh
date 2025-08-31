#!/bin/bash

echo "========================================"
echo "AI Thumbnail Generator - Installation"
echo "========================================"
echo

echo "Installing server dependencies..."
npm install

echo
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo
echo "Creating environment file..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "Environment file created! Please edit .env with your API keys."
else
    echo "Environment file already exists."
fi

echo
echo "========================================"
echo "Installation Complete!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Edit .env file with your API keys:"
echo "   - OPENAI_API_KEY=your_openai_api_key"
echo "   - GEMINI_API_KEY=your_gemini_api_key"
echo
echo "2. Start the development server:"
echo "   npm run dev"
echo
echo "3. Open http://localhost:3000 in your browser"
echo
