
import React, { useState, useEffect } from 'react';
import { Search, Settings, Mic, MicOff } from 'lucide-react';
import { AppGrid } from './AppGrid';
import { HeroSection } from './HeroSection';
import { VoiceOverlay } from './VoiceOverlay';
import { NavigationHandler } from './NavigationHandler';
import { useWakeWordDetection } from '../hooks/useWakeWordDetection';

interface TVInterfaceProps {}

export const TVInterface: React.FC<TVInterfaceProps> = () => {
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [focusedSection, setFocusedSection] = useState<'hero' | 'apps' | 'header'>('hero');
  const [focusedHeaderItem, setFocusedHeaderItem] = useState(0);

  // Wake word detection
  const handleWakeWord = () => {
    console.log('Wake word detected!');
    setShowVoiceOverlay(true);
  };

  const { isListening } = useWakeWordDetection({
    onWakeWord: handleWakeWord,
    isActive: !showVoiceOverlay
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleVoiceOverlayClose = () => {
    setShowVoiceOverlay(false);
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
