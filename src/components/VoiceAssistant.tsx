
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, PauseCircle, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VoiceAssistantProps {
  content?: string;
  isOpen: boolean;
  onClose: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ content, isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [spokenText, setSpokenText] = useState<string | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Text summary for speech
  const getSpeechSummary = async (text: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });
      
      if (error) {
        console.error("Error getting speech summary:", error);
        toast.error("Could not generate speech summary");
        return null;
      }
      
      return data.speechText;
    } catch (err) {
      console.error("Exception in speech summary:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Listen to user's voice
  const startListening = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setSpokenText(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error("Error with speech recognition");
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
    
    // Store recognition instance in a ref for cleanup
    recognitionRef.current = recognition;
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const recognitionRef = useRef<any>(null);

  // Speak the analysis out loud
  const speakAnalysis = async () => {
    if (!content) {
      toast.error("No content to read");
      return;
    }
    
    try {
      setIsLoading(true);
      const summary = await getSpeechSummary(content);
      
      if (!summary) {
        toast.error("Could not generate speech summary");
        return;
      }
      
      setIsReading(true);
      
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        setIsReading(false);
      };
      
      utterance.onerror = () => {
        setIsReading(false);
        toast.error("Error occurred while speaking");
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error speaking analysis:", error);
      toast.error("Could not speak the analysis");
      setIsReading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 w-72 bg-card border rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-primary">Voice Assistant</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
      </div>
      
      <div className="space-y-4">
        {/* Voice commands section */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Voice commands</p>
          <div className="flex gap-2">
            {!isListening ? (
              <Button 
                size="sm" 
                onClick={startListening}
                className="flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Listen
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={stopListening}
                className="flex items-center gap-2 animate-pulse"
              >
                <MicOff className="w-4 h-4" />
                Stop
              </Button>
            )}
            
            {spokenText && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                "{spokenText}"
              </div>
            )}
          </div>
        </div>
        
        {/* Read content section */}
        {content && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Read analysis</p>
            <div className="flex gap-2">
              {isLoading ? (
                <Button size="sm" disabled className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </Button>
              ) : !isReading ? (
                <Button 
                  size="sm" 
                  onClick={speakAnalysis}
                  className="flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Read Aloud
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={stopSpeaking}
                  className="flex items-center gap-2"
                >
                  <PauseCircle className="w-4 h-4" />
                  Stop Reading
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
