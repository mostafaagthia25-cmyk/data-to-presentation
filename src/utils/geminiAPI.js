// src/utils/geminiAPI.js

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Updated to use a currently supported model
const GEMINI_MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validate API key on initialization
if (!GEMINI_API_KEY) {
  console.error('❌ API key is missing! Please set VITE_GEMINI_API_KEY in your environment variables.');
}

// Initialize Gemini AI
let genAI = null;
let model = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_actual_api_key_here') {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ 
    model: GEMINI_MODEL_NAME,
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 8192,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE'
      }
    ]
  });
}

export function validateFile(file) {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/msword', // doc
    'text/plain'
  ];

  const allowedExtensions = ['.xlsx', '.xls', '.csv', '.docx', '.doc', '.txt'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    throw new Error(`Unsupported file type. Please upload: ${allowedExtensions.join(', ')}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  return true;
}

export async function callGeminiAPI(prompt) {
  // Check if API key is configured
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_actual_api_key_here') {
    throw new Error('API key is not configured. Please check your environment variables.');
  }

  if (!model) {
    throw new Error('Gemini model is not initialized. Please check your API key.');
  }

  try {
    console.log('🔑 API Key status:', GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('🤖 Using model:', GEMINI_MODEL_NAME);
    console.log('📡 Calling Gemini API...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini API response received');

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    let htmlContent = text;
    
    // Clean up the response - remove markdown code blocks if present
    htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Ensure it starts with <!DOCTYPE html>
    if (!htmlContent.toLowerCase().startsWith('<!doctype')) {
      console.warn('Response does not start with DOCTYPE, adding it...');
      htmlContent = '<!DOCTYPE html>\n' + htmlContent;
    }
    
    console.log('✅ HTML content cleaned and validated');
    return htmlContent;
    
  } catch (error) {
    console.error('❌ Gemini API call failed:', error);
    
    // Handle specific error types
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Gemini API Error: API key not valid. Please pass a valid API key.');
    }
    
    if (error.message?.includes('not found for API version')) {
      throw new Error(`Gemini API Error: Model "${GEMINI_MODEL_NAME}" is not available. The model may have been retired. Please update to a current model like "gemini-2.0-flash-exp" or "gemini-2.5-flash".`);
    }
    
    throw new Error(`Gemini API Error: ${error.message || 'Unknown error'}`);
  }
}

export async function transformFileToPresentation(file, userSettings) {
  try {
    // 1. Validate file
    validateFile(file);
    
    console.log('📄 File validated:', file.name);
    
    // 2. Read file content
    const { readFileContent } = await import('./fileReaders');
    const fileContent = await readFileContent(file);
    
    console.log('📖 File content read successfully');
    
    // 3. Build prompt
    const { buildPrompt } = await import('./promptBuilder');
    const prompt = buildPrompt(fileContent, userSettings);
    
    console.log('📝 Prompt built successfully');
    
    // 4. Call Gemini API
    const htmlContent = await callGeminiAPI(prompt);
    
    console.log('✅ Transformation successful');
    return htmlContent;
    
  } catch (error) {
    console.error('❌ Transformation failed:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('API key')) {
      throw new Error('API key is not configured. Please check your environment variables.');
    } else if (error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later or check your Gemini API limits.');
    } else if (error.message.includes('Unsupported')) {
      throw error; // Pass through validation errors
    } else if (error.message.includes('not found for API version')) {
      throw new Error('The Gemini model is outdated. Please update VITE_GEMINI_MODEL to "gemini-2.0-flash-exp" or "gemini-2.5-flash" in your .env file.');
    } else {
      throw new Error(`Failed to generate presentation: ${error.message}`);
    }
  }
}

// Export API key status for debugging
export function getAPIKeyStatus() {
  return {
    configured: !!GEMINI_API_KEY && GEMINI_API_KEY !== 'your_actual_api_key_here',
    value: GEMINI_API_KEY ? '***configured***' : 'missing',
    model: GEMINI_MODEL_NAME
  };
}