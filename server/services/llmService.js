// server/services/llmService.js
import Groq from 'groq-sdk';
import { buildSystemPrompt } from '../prompts/systemPrompt.js';
import dotenv from 'dotenv';

// Force load .env file
dotenv.config();

console.log('🔧 Checking API Key:', process.env.GROQ_API_KEY ? '✅ Key found' : '❌ Key missing');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function getLayoutUpdate(userMessage, currentLayout, history) {
  console.log('📡 Calling Groq API...');
  console.log('Message:', userMessage);
  
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(currentLayout)
        },
        ...(history || []).map(h => ({
          role: h.role,
          content: h.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const text = completion.choices[0]?.message?.content;
    console.log('📥 Groq Response received');
    
    if (!text) {
      throw new Error('No response from Groq');
    }

    // Try to parse JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (e) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    }

    return {
      explanation: parsedResponse.explanation || "Layout updated successfully!",
      updatedLayout: parsedResponse.updatedLayout || currentLayout
    };
    
  } catch (error) {
    console.error('❌ Groq API Error:', error);
    throw error;
  }
}