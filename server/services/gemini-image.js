const OpenAI = require('openai');
const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

class GeminiImageService {
  constructor() {
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/rajabezanov",
        "X-Title": "Thumbnail Generator",
      },
    });
    // Using Gemini 2.5 Flash Image Preview model
    this.imageModel = "google/gemini-2.5-flash-image-preview";
    console.log(`🔧 Using ${this.imageModel} via OpenRouter for image generation`);
  }

  async generateThumbnail(prompt, imagePath, format = "horizontal") {
    try {
      const id = uuidv4();
      const dimensions = format === "horizontal" ? "1280x720" : "1080x1920";

      // Create a simple prompt for the image generation
      const generationPrompt = `YouTube thumbnail: ${prompt}. ${format === "horizontal" ? "16:9" : "9:16"} format.`;

      if (!this.openai.apiKey) {
        throw new Error("OpenRouter API key not found. Please set OPENROUTER_API_KEY environment variable.");
      }

      console.log("Making image generation request...");

      // Generate the image using Gemini 2.5 Flash with minimal tokens
      const response = await this.openai.chat.completions.create({
        model: this.imageModel,
        messages: [
          {
            role: "user",
            content: generationPrompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.3,
        response_format: { type: "image_url" }
      });

      if (!response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
        throw new Error("No image URL in response");
      }

      // Get the image URL from the response
      const imageUrl = response.choices[0].message.content;

      // Download the generated image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      // Save the generated image
      const outputFileName = `${id}_${format}.png`;
      const outputPath = path.join(__dirname, "../uploads", outputFileName);
      await fs.writeFile(outputPath, imageBuffer);

      // Return the file path and success status
      return {
        filePath: outputFileName,
        success: true
      };

    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }
}

module.exports = new GeminiImageService();
