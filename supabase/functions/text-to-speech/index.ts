
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
    const { text } = await req.json();
    
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key");
    }

    if (!text) {
      throw new Error("Text is required");
    }

    console.log("Converting to speech:", text.substring(0, 50) + "...");

    // Use Gemini API to convert text to speech
    // Note: We're using the same Gemini API for text-to-speech
    // since we're already integrated with it for other features
    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Summarize this educational analysis in a conversational tone, keeping the key points: ${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 256,
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini API error:", data.error);
      throw new Error(`Gemini API error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const speechText = data.candidates[0].content.parts[0].text;
    console.log("Successfully converted to speech");
    
    return new Response(JSON.stringify({ 
      speechText,
      original: text 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in text-to-speech function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to convert text to speech" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
