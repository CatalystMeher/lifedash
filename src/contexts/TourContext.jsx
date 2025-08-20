import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const TourContext = createContext();

export function TourProvider({ children }) {
  const [tourState, setTourState] = useState({
    isRunning: false,
    isCompleted: false,
    hasConsented: false,
  });

  useEffect(() => {
    // Check localStorage on mount
    const completed = localStorage.getItem('lifedash-tour-completed') === 'true';
    const consented = localStorage.getItem('lifedash-tour-consent') === 'true';
    
    setTourState({
      isRunning: false,
      isCompleted: completed,
      hasConsented: consented,
    });
  }, []);

  const startTour = () => {
    setTourState(prev => ({
      ...prev,
      isRunning: true,
    }));
    toast.success('Starting the tour!');
  };

  const startTourManually = () => {
    // Clear any existing tour state and start fresh
    localStorage.removeItem('lifedash-tour-completed');
    localStorage.removeItem('lifedash-tour-consent');
    
    // Force a complete state reset with a small delay to ensure proper state update
    setTimeout(() => {
      setTourState({
        isRunning: true,
        isCompleted: false,
        hasConsented: true, // Skip consent for manual start
      });
      
      toast.success('Starting the tour!');
    }, 50);
  };

  const stopTour = () => {
    setTourState(prev => ({
      ...prev,
      isRunning: false,
    }));
  };

  const completeTour = () => {
    localStorage.setItem('lifedash-tour-completed', 'true');
    setTourState(prev => ({
      ...prev,
      isRunning: false,
      isCompleted: true,
    }));
    toast.success('Tour completed! You\'re all set to use LifeDash.');
  };

  const setConsent = (consented) => {
    localStorage.setItem('lifedash-tour-consent', consented.toString());
    setTourState(prev => ({
      ...prev,
      hasConsented: consented,
    }));
  };

  const resetTour = () => {
    localStorage.removeItem('lifedash-tour-completed');
    localStorage.removeItem('lifedash-tour-consent');
    setTourState({
      isRunning: false,
      isCompleted: false,
      hasConsented: false,
    });
    // Start the tour immediately after reset
    setTimeout(() => {
      setTourState(prev => ({
        ...prev,
        isRunning: true,
      }));
      toast.success('Tour restarted! Let\'s go through the features again.');
    }, 100);
  };

  const value = {
    ...tourState,
    startTour,
    startTourManually,
    stopTour,
    completeTour,
    setConsent,
    resetTour,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
