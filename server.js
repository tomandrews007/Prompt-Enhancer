import express from 'express';
    import cors from 'cors';
    import dotenv from 'dotenv';
    import { fileURLToPath } from 'url';
    import { dirname, join } from 'path';
    import { GoogleGenerativeAI } from '@google/generative-ai';

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    dotenv.config();

    const app = express();
    const port = 3000;

    app.use(cors());
    app.use(express.json());

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in .env file');
      process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const briefPrompt = "Analyze the context and intent of the seed prompt. Correct grammatical mistakes and improve clarity. Add specificity where needed while keeping the enhancement concise and actionable. Retain the original focus and ensure the final output is optimized for generating a relevant response. Limit the enhanced prompt to under 70 words, focusing on delivering clear, precise, and purposeful guidance for the LLM:";
    const maxPrompt = "Take the following seed prompt and enhance it into its most detailed version. Begin by understanding the context, intent, and subject matter. Correct errors, identify implicit details, and expand comprehensively to include background information, relevant parameters, examples, and clarifying questions. Ensure the enhancement provides clear purpose, key concepts, and assumptions while addressing ambiguities. Structure it logically for an LLM to generate a thorough and accurate response, ensuring it remains under 700 words: ";

    app.post('/enhance', async (req, res) => {
      const { seedPrompt, option } = req.body;
      
      if (!seedPrompt) {
        return res.status(400).json({ error: 'Seed prompt is required' });
      }

      let enhancedPrompt = option === 'brief' ? briefPrompt : maxPrompt;
      enhancedPrompt += seedPrompt;

      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: enhancedPrompt }]}],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1024,
          }
        });

        const response = await result.response;
        const text = response.text();

        res.json({ enhancedPrompt: text });
      } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({
          error: 'Failed to enhance prompt',
          details: error.message
        });
      }
    });

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static('dist'));
    }

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${port}`);
    });
