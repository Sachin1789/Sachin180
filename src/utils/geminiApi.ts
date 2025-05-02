
import { supabase } from '@/integrations/supabase/client';

interface GeminiResponse {
  text: string;
  error?: string;
}

export const generateInsightsWithGemini = async (
  performanceData: any[], 
  context: string = 'general'
): Promise<GeminiResponse> => {
  try {
    // In a production app, this would call a Supabase Edge Function
    // that securely uses the Gemini API key stored in Supabase Secrets
    const { data, error } = await supabase.functions.invoke('gemini-insights', {
      body: { performanceData, context }
    });

    if (error) {
      console.error('Error generating insights:', error);
      return { 
        text: "Unable to generate insights at this time.",
        error: error.message 
      };
    }

    return { text: data.insight };
  } catch (err) {
    console.error('Exception generating insights:', err);
    return { 
      text: "Unable to generate insights at this time.",
      error: err instanceof Error ? err.message : String(err)
    };
  }
};

// Helper function to analyze student performance and get recommendations
export const analyzeStudentPerformance = async (
  student: any, 
  historicalData?: any[]
): Promise<GeminiResponse> => {
  try {
    // In a production app, this would call a Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('analyze-student', {
      body: { student, historicalData }
    });

    if (error) {
      console.error('Error analyzing student performance:', error);
      return { 
        text: "Unable to analyze performance at this time.",
        error: error.message 
      };
    }

    return { text: data.analysis };
  } catch (err) {
    console.error('Exception analyzing student performance:', err);
    return { 
      text: "Unable to analyze performance at this time.",
      error: err instanceof Error ? err.message : String(err)
    };
  }
};
