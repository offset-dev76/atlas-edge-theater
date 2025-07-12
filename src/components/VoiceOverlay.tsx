
import React, { useState, useEffect } from 'react';
import { Mic, Volume2, X, Loader } from 'lucide-react';

interface VoiceOverlayProps {
  onCommand: (command: string) => void;
  onClose: () => void;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ onCommand, onClose }) => {
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const [suggestions] = useState([
    'Open Netflix',
    'Open YouTube',
    'Play music',
    'Show weather',
    'What can you do?'
  ]);

  useEffect(() => {
    let recognition: any;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        setTranscript(transcript);
        
        if (event.results[last].isFinal) {
          handleCommand(transcript);
        }
      };

      recognition.onend = () => {
        if (!isProcessing) {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.log('Voice recognition error:', event.error);
        if (!isProcessing) {
          setIsListening(false);
        }
      };

      if (isListening && !isProcessing) {
        recognition.start();
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, isProcessing]);

  const handleCommand = async (command: string) => {
    setIsProcessing(true);
    const lowerCommand = command.toLowerCase().trim();
    
    // Check for app opening commands
    if (lowerCommand.includes('open netflix') || lowerCommand.includes('netflix')) {
      window.open('https://www.netflix.com', '_blank');
      setResponse('Opening Netflix for you!');
      setTimeout(() => {
        onClose();
      }, 2000);
      return;
    }
    
    if (lowerCommand.includes('open youtube') || lowerCommand.includes('youtube')) {
      window.open('https://www.youtube.com', '_blank');
      setResponse('Opening YouTube for you!');
      setTimeout(() => {
        onClose();
      }, 2000);
      return;
    }
    
    if (lowerCommand.includes('open prime') || lowerCommand.includes('prime video')) {
      window.open('https://www.primevideo.com', '_blank');
      setResponse('Opening Prime Video for you!');
      setTimeout(() => {
        onClose();
      }, 2000);
      return;
    }
    
    if (lowerCommand.includes('open disney') || lowerCommand.includes('disney+')) {
      window.open('https://www.disneyplus.com', '_blank');
      setResponse('Opening Disney+ for you!');
      setTimeout(() => {
        onClose();
      }, 2000);
      return;
    }
    
    if (lowerCommand.includes('open spotify') || lowerCommand.includes('music')) {
      window.open('https://open.spotify.com', '_blank');
      setResponse('Opening Spotify for you!');
      setTimeout(() => {
        onClose();
      }, 2000);
      return;
    }

    // For other queries, use Gemini AI
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyCbaPuzoxV_CIicJ-ZpgKKNyeTLj8g-FWo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Atlas, an AI assistant for a smart TV. Keep responses short (2-3 lines max). User asked: ${command}`
            }]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t process that request.';
      setResponse(aiResponse);
      
      setTimeout(() => {
        onClose();
      }, 4000);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setResponse('Sorry, I\'m having trouble connecting right now.');
      setTimeout(() => {
        onClose();
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleCommand(suggestion);
  };

  return (
    <div className="voice-overlay">
      <div className="max-w-4xl mx-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Voice Interface */}
        <div className="text-center mb-8">
          {/* Atlas Branding */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-primary mb-2">Atlas</h1>
            <p className="text-xl text-gray-300">Your AI Assistant</p>
          </div>

          {/* Voice Indicator */}
          <div className="flex justify-center mb-6">
            <div className={`p-6 rounded-full ${isListening ? 'bg-primary' : isProcessing ? 'bg-yellow-600' : 'bg-gray-600'} transition-all duration-300`}>
              {isProcessing ? (
                <Loader size={32} className="animate-spin" />
              ) : isListening ? (
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-8 bg-white rounded-full animate-voice-wave" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-6 bg-white rounded-full animate-voice-wave" style={{ animationDelay: '100ms' }}></div>
                  <div className="w-1 h-10 bg-white rounded-full animate-voice-wave" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-1 h-4 bg-white rounded-full animate-voice-wave" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-1 h-7 bg-white rounded-full animate-voice-wave" style={{ animationDelay: '400ms' }}></div>
                </div>
              ) : (
                <Mic size={32} />
              )}
            </div>
          </div>

          {/* Status Text */}
          <div className="mb-8">
            {isProcessing ? (
              <p className="text-lg text-yellow-400">Processing your request...</p>
            ) : isListening ? (
              <div>
                <p className="text-lg text-white mb-2">Listening...</p>
                {transcript && (
                  <p className="text-gray-400 italic">"{transcript}"</p>
                )}
              </div>
            ) : response ? (
              <div>
                <p className="text-lg text-green-400 mb-2">Atlas:</p>
                <p className="text-white">{response}</p>
              </div>
            ) : (
              <p className="text-lg text-gray-400">Ready to help</p>
            )}
          </div>
        </div>

        {/* Suggestions - only show if not processing and no response */}
        {!isProcessing && !response && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-full mb-4">
              <h3 className="text-lg font-semibold text-white mb-4">Try saying:</h3>
            </div>
            
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-4 bg-gray-800/60 rounded-lg border border-gray-700/50 transition-all duration-200 text-left"
              >
                <div className="flex items-center">
                  <Volume2 size={16} className="mr-3 text-primary" />
                  <span className="text-white">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Capabilities */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Atlas can help you navigate your TV, open apps, search for content, and answer questions.
          </p>
        </div>
      </div>
    </div>
  );
};
