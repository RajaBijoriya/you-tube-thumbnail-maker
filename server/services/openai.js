const OpenAI = require("openai");

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async enhancePrompt(userInput) {
    try {
      const { videoType, style, mood, photoPlacement } = userInput;

      const systemPrompt = `You are an expert YouTube thumbnail designer and prompt engineer. Your task is to convert user input into a detailed, professional AI image generation prompt that will create stunning YouTube thumbnails.

Key requirements:
- Create prompts optimized for AI image generation
- Focus on visual elements, composition, and style
- Ensure the prompt will generate professional, eye-catching thumbnails
- Include specific details about lighting, colors, and composition
- Make it suitable for both horizontal (1280x720) and vertical (1080x1920) formats

Format your response as a JSON object with the following structure:
{
  "enhancedPrompt": "detailed prompt for AI generation",
  "styleGuide": "specific style instructions",
  "colorPalette": "recommended colors",
  "composition": "layout and positioning details"
}`;

      const userPrompt = `Create an enhanced AI image generation prompt for a YouTube thumbnail with the following specifications:

Video Type: ${videoType}
Style: ${style}
Mood: ${mood}
Photo Placement: ${photoPlacement}

Please create a detailed prompt that will generate professional, engaging thumbnails that are optimized for YouTube's platform. Include specific details about visual elements, composition, lighting, and style that will make the thumbnail stand out.`;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;

      try {
        return JSON.parse(content);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          enhancedPrompt: content,
          styleGuide: `Style: ${style}, Mood: ${mood}`,
          colorPalette: "Professional YouTube thumbnail colors",
          composition: `Photo placement: ${photoPlacement}`,
        };
      }
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error(`Failed to enhance prompt: ${error.message}`);
    }
  }

  async generateThumbnailPrompt(details) {
    try {
      const systemPrompt = `You are a professional YouTube thumbnail designer. Your task is to create detailed prompts for AI image generation that will result in eye-catching, professional YouTube thumbnails.

Consider these key aspects:
1. Video Type: Different types need different approaches (e.g., gaming vs tutorial)
2. Style: Overall visual aesthetic and design approach
3. Mood: Emotional tone and atmosphere
4. Photo Placement: How to compose the image with the subject

Output a single, comprehensive prompt that will help the AI generate an effective thumbnail.`;

      const userPrompt = `Create a detailed thumbnail generation prompt with these specifications:

Video Type: ${details.type}
Style Preference: ${details.style}
Mood: ${details.mood}
Photo Placement: ${details.placement}

Create a prompt that will generate a professional YouTube thumbnail. Include specific details about:
- Visual hierarchy
- Color schemes
- Text placement and styling
- Photo composition
- Lighting and effects
- Background treatment`;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error(`Failed to generate thumbnail prompt: ${error.message}`);
    }
  }

  async generateMultiplePrompts(basePrompt, count = 3) {
    try {
      const systemPrompt = `You are an expert at creating variations of AI image generation prompts. Create ${count} different variations of the given prompt, each with unique visual elements, styles, or compositions while maintaining the core theme.

Return the response as a JSON array of strings, each containing a complete prompt variation.`;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Create ${count} variations of this prompt: ${basePrompt}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content;

      try {
        return JSON.parse(content);
      } catch (parseError) {
        // Fallback: split content into variations
        const variations = content
          .split("\n")
          .filter((line) => line.trim().length > 0);
        return variations.slice(0, count);
      }
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error(`Failed to generate prompt variations: ${error.message}`);
    }
  }

  async analyzeThumbnailQuality(imageUrl) {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert YouTube thumbnail analyst. Analyze the given thumbnail image and provide feedback on its effectiveness for YouTube.",
          },
          {
            role: "user",
            content: `Analyze this YouTube thumbnail: ${imageUrl}. Provide feedback on:
1. Visual appeal and eye-catching elements
2. Clarity and readability
3. Brand consistency
4. Click-through potential
5. Areas for improvement`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI Analysis Error:", error);
      throw new Error(`Failed to analyze thumbnail: ${error.message}`);
    }
  }
}

module.exports = new OpenAIService();
