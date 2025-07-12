
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWakeWordDetectionProps {
  onWakeWord: () => void;
  isActive: boolean;
}

export const useWakeWordDetection = ({ onWakeWord, isActive }: UseWakeWordDetectionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startRecognition = useCallback(() => {
    if (!isActive || recognitionRef.current) {
      return;
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Wake word detection started');
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        try {
          const last = event.results.length - 1;
          const transcript = event.results[last][0].transcript.toLowerCase().trim();
          
          if (transcript.includes('hey atlas') || transcript.includes('atlas')) {
            console.log('Wake word detected:', transcript);
            stopRecognition();
            onWakeWord();
          }
        } catch (error) {
          console.log('Error processing speech result:', error);
        }
      };

      recognition.onerror = (event: any) => {
        console.log('Wake word detection error:', event.error);
        setIsListening(false);
        recognitionRef.current = null;
        
        // Only restart if still active and not a fatal error
        if (isActive && event.error !== 'aborted' && event.error !== 'not-allowed') {
          restartTimeoutRef.current = setTimeout(() => {
            if (isActive) {
              startRecognition();
            }
          }, 2000);
        }
      };

      recognition.onend = () => {
        console.log('Wake word detection ended');
        setIsListening(false);
        recognitionRef.current = null;
        
        // Restart if still active
        if (isActive) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isActive) {
              startRecognition();
            }
          }, 1000);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.log('Could not start wake word detection:', error);
      setIsListening(false);
    }
  }, [isActive, onWakeWord, stopRecognition]);

  useEffect(() => {
    if (isActive) {
      startRecognition();
    } else {
      stopRecognition();
    }

    return () => {
      stopRecognition();
    };
  }, [isActive, startRecognition, stopRecognition]);

  return { isListening };
};
