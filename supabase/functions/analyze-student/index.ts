
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student, historicalData } = await req.json();
    
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key");
    }

    // Prepare the prompt for the Gemini model
    const prompt = `
    As an educational advisor, analyze this student's performance:
    
    ${JSON.stringify(student)}
    
    ${historicalData ? `Historical data: ${JSON.stringify(historicalData)}` : ''}
    
    Provide:
    1. Analysis of the student's current academic standing
    2. Strengths and areas that need improvement
    3. Personalized recommendations for this student
    4. Suggested interventions if performance is below expectations
    
    Keep your response concise and focus on actionable advice.
    `;

    // Call the Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    // Extract the response text
    const analysis = data.candidates[0].content.parts[0].text;
    
    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in analyze-student function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to analyze student performance" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
