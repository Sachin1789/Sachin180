
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
    const { performanceData, context } = await req.json();
    
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key");
    }

    console.log("Processing request with context:", context);
    console.log("Performance data:", JSON.stringify(performanceData).slice(0, 200) + "...");

    // Prepare the prompt for the Gemini model
    const prompt = `
    As an educational analytics expert, analyze the following student performance data:
    
    ${JSON.stringify(performanceData)}
    
    Context: ${context}
    
    Provide:
    1. Key patterns or trends
    2. Actionable insights for instructors
    3. Specific recommendations for improvement
    
    Keep your response concise and specific to the data provided, focusing on practical advice.
    `;

    // Call the Gemini API with updated endpoint and parameters
    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent", {
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
    console.log("API response status:", response.status);
    
    if (data.error) {
      console.error("Gemini API error:", data.error);
      throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    // Extract the response text
    const insight = data.candidates[0].content.parts[0].text;
    console.log("Successfully generated insight");
    
    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in gemini-insights function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to generate insights" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
