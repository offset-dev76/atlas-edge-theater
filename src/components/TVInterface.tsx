
import React, { useState, useEffect, useCallback } from 'react';
import { Play, Mic, MicOff, Settings, Search } from 'lucide-react';
import { AppGrid } from './AppGrid';
import { HeroSection } from './HeroSection';
import { VoiceOverlay } from './VoiceOverlay';
import { NavigationHandler } from './NavigationHandler';

interface TVInterfaceProps {}

export const TVInterface: React.FC<TVInterfaceProps> = () => {
  const [isListening, setIsListening] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [focusedSection, setFocusedSection] = useState<'hero' | 'apps' | 'header'>('hero');
  const [focusedHeaderItem, setFocusedHeaderItem] = useState(0);
  const [recognition, setRecognition] = useState<any>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const startWakeWordDetection = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const newRecognition = new SpeechRecognition();
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      
      newRecognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.toLowerCase().trim();
        
        console.log('Voice detected:', transcript);
        
        if (transcript.includes('hey atlas') || transcript.includes('atlas')) {
          handleWakeWord();
        }
      };

      newRecognition.onstart = () => {
        console.log('Wake word detection started');
        setIsListening(true);
      };

      newRecognition.onerror = (event: any) => {
        console.log('Wake word detection error:', event.error);
        // Restart after error
        setTimeout(() => {
          if (!showVoiceOverlay) {
            startWakeWordDetection();
          }
        }, 1000);
      };

      newRecognition.onend = () => {
        console.log('Wake word detection ended');
        setIsListening(false);
        // Restart if overlay is not showing
        if (!showVoiceOverlay) {
          setTimeout(() => {
            startWakeWordDetection();
          }, 500);
        }
      };

      try {
        newRecognition.start();
        setRecognition(newRecognition);
      } catch (error) {
        console.log('Could not start wake word detection:', error);
      }
    }
  }, [showVoiceOverlay]);

  // Start wake word detection on mount and when overlay closes
  useEffect(() => {
    if (!showVoiceOverlay) {
      startWakeWordDetection();
    } else if (recognition) {
      recognition.stop();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [showVoiceOverlay, startWakeWordDetection]);

  const handleWakeWord = useCallback(() => {
    console.log('Wake word detected!');
    setShowVoiceOverlay(true);
    
    // Stop wake word detection
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command:', command);
    // Commands are now handled in VoiceOverlay component
  };

  const handleVoiceOverlayClose = () => {
    setShowVoiceOverlay(false);
    // Wake word detection will restart automatically via useEffect
  };

  return (
    <div className={`min-h-screen bg-tv-darker relative overflow-hidden ${showVoiceOverlay ? 'voice-listening' : ''}`}>
      {/* Navigation Handler for keyboard controls */}
      <NavigationHandler 
        focusedSection={focusedSection}
        setFocusedSection={setFocusedSection}
        focusedHeaderItem={focusedHeaderItem}
        setFocusedHeaderItem={setFocusedHeaderItem}
      />

      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-gradient-to-r from-tv-darker to-transparent z-10 relative">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-primary">WorkingEDGE</div>
          <div className="text-sm text-gray-400">AI TV</div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-lg font-medium">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-gray-400">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isListening ? 'bg-green-600' : 'bg-gray-600'}`}>
              {isListening ? <Mic size={16} /> : <MicOff size={16} />}
            </div>
            <button className={`p-2 rounded-full transition-colors ${
              focusedSection === 'header' && focusedHeaderItem === 0 
                ? 'bg-primary ring-2 ring-primary/50' 
                : 'bg-gray-700'
            }`}>
              <Search size={16} />
            </button>
            <button className={`p-2 rounded-full transition-colors ${
              focusedSection === 'header' && focusedHeaderItem === 1 
                ? 'bg-primary ring-2 ring-primary/50' 
                : 'bg-gray-700'
            }`}>
              <Settings size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-6">
        {/* Hero Section */}
        <div className="hero-section">
          <HeroSection focused={focusedSection === 'hero'} />
        </div>
        
        {/* Apps Section */}
        <section className="mt-12 apps-section">
          <h2 className="text-2xl font-bold mb-6 text-white">Your Apps</h2>
          <AppGrid focused={focusedSection === 'apps'} />
        </section>
      </main>

      {/* Voice Overlay */}
      {showVoiceOverlay && (
        <VoiceOverlay 
          onCommand={handleVoiceCommand}
          onClose={handleVoiceOverlayClose}
        />
      )}

      {/* Wake word indicator */}
      {showVoiceOverlay && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 border-4 border-primary rounded-lg animate-glow-pulse"></div>
        </div>
      )}
    </div>
  );
};
