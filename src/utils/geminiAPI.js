const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.');
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
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
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    let htmlContent = data.candidates[0].content.parts[0].text;
    
    // Clean up the response - remove markdown code blocks if present
    htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Ensure it starts with <!DOCTYPE html>
    if (!htmlContent.toLowerCase().startsWith('<!doctype')) {
      console.warn('Response does not start with DOCTYPE, adding it...');
      htmlContent = '<!DOCTYPE html>\n' + htmlContent;
    }
    
    return htmlContent;
    
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

export async function transformFileToPresentation(file, userSettings) {
  try {
    // 1. Validate file
    validateFile(file);
    
    // 2. Read file content
    const { readFileContent } = await import('./fileReaders');
    const fileContent = await readFileContent(file);
    
    // 3. Build prompt
    const { buildPrompt } = await import('./promptBuilder');
    const prompt = buildPrompt(fileContent, userSettings);
    
    // 4. Call Gemini API
    const htmlContent = await callGeminiAPI(prompt);
    
    return htmlContent;
    
  } catch (error) {
    console.error('Transformation failed:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('API key')) {
      throw new Error('API key is not configured. Please check your environment variables.');
    } else if (error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later or check your Gemini API limits.');
    } else if (error.message.includes('Unsupported')) {
      throw error; // Pass through validation errors
    } else {
      throw new Error(`Failed to generate presentation: ${error.message}`);
    }
  }
}
