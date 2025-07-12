
import React, { useEffect } from 'react';

interface NavigationHandlerProps {
  focusedSection: 'hero' | 'apps';
  setFocusedSection: (section: 'hero' | 'apps') => void;
}

export const NavigationHandler: React.FC<NavigationHandlerProps> = ({
  focusedSection,
  setFocusedSection
}) => {
  useEffect(() => {
    const handleGlobalKeyPress = (event: KeyboardEvent) => {
      // Handle global navigation between sections
      switch (event.key) {
        case 'ArrowUp':
          if (focusedSection === 'apps') {
            event.preventDefault();
            setFocusedSection('hero');
          }
          break;
        case 'ArrowDown':
          if (focusedSection === 'hero') {
            event.preventDefault();
            setFocusedSection('apps');
          }
          break;
        case 'Home':
          event.preventDefault();
          setFocusedSection('hero');
          break;
        case 'Escape':
          event.preventDefault();
          // Could add menu or back functionality here
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyPress, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress, true);
  }, [focusedSection, setFocusedSection]);

  return null; // This component doesn't render anything
};
