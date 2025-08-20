import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { Play, X, CheckCircle, ArrowRight, Clock, Star } from 'lucide-react';
import { useTour } from '../contexts/TourContext';

export default function GuidedTour({ isFirstTimeUser = false }) {
  const { 
    isRunning, 
    isCompleted, 
    hasConsented, 
    startTour, 
    stopTour, 
    completeTour, 
    setConsent 
  } = useTour();
  
  const [showConsent, setShowConsent] = useState(false);
  
  // Check if we're on mobile (for tour target visibility)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); // lg breakpoint
  
  // Update mobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Show consent for first-time users who haven't given consent
    // But don't show consent if tour is already running (restart scenario)
    if (isFirstTimeUser && !isCompleted && !hasConsented && !isRunning) {
      setShowConsent(true);
    }
  }, [isFirstTimeUser, isCompleted, hasConsented, isRunning]);



  const handleConsent = (accepted) => {
    setConsent(accepted);
    setShowConsent(false);
    
    if (accepted) {
      startTour();
    }
  };

  const handleTourCallback = (data) => {
    const { status } = data;
    
    // Only handle completion statuses
    if (status === STATUS.FINISHED) {
      stopTour();
      completeTour();
    } else if (status === STATUS.SKIPPED) {
      stopTour();
      completeTour();
    } else if (status === STATUS.ERROR) {
      stopTour();
    }
    // Don't handle other statuses like INIT, READY, etc.
  };

  // Create responsive tour steps based on device type
  const steps = React.useMemo(() => {
    const baseSteps = [
      {
        target: 'body',
        content: (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">🏠 Welcome to LifeDash!</h3>
            <p>Let's take a quick tour of your new life tracking command center!</p>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="w-4 h-4" />
              <span>This will only take 2 minutes</span>
            </div>
          </div>
        ),
        placement: 'center',
        disableBeacon: true,
      },
    ];

    // Navigation step - different target based on device
    const navigationStep = {
      target: isMobile ? '.tour-home-tab' : '.tour-home-nav',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">🏠 Home Dashboard</h3>
          <p>This is your command center! Here you'll see an overview of your daily progress, recent stats, and quick actions.</p>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Clock className="w-4 h-4" />
            <span>Quick overview of your day</span>
          </div>
        </div>
      ),
      placement: isMobile ? 'bottom' : 'right',
      disableBeacon: true,
    };

    // FAB step
    const fabStep = {
      target: '.tour-fab',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">⚡ Quick Log</h3>
          <p>Tap the floating action button to quickly log stats, habits, or todos without navigating to different screens.</p>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Star className="w-4 h-4" />
            <span>Super fast logging</span>
          </div>
        </div>
      ),
      placement: 'left',
    };

    // Stats step
    const statsStep = {
      target: isMobile ? '.tour-stats-tab' : '.tour-stats-nav',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">📊 Stats Tracking</h3>
          <p>Track anything important in your life - steps, water intake, mood, productivity, or custom metrics.</p>
          <div className="bg-blue-50 p-2 rounded-lg">
            <p className="text-sm text-blue-800">💡 Tip: Create stats for things you want to improve or monitor daily</p>
          </div>
        </div>
      ),
      placement: isMobile ? 'top' : 'right',
    };

    // Habits step
    const habitsStep = {
      target: isMobile ? '.tour-habits-tab' : '.tour-habits-nav',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">✅ Habits</h3>
          <p>Build positive habits and break bad ones. Check off your daily habits and track your streaks.</p>
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <CheckCircle className="w-4 h-4" />
            <span>Build lasting habits</span>
          </div>
        </div>
      ),
      placement: isMobile ? 'top' : 'right',
    };

    // Todos step
    const todosStep = {
      target: isMobile ? '.tour-todos-tab' : '.tour-todos-nav',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">📝 Todos</h3>
          <p>Manage your daily tasks and to-dos. Organize them by priority and mark them complete.</p>
          <div className="bg-green-50 p-2 rounded-lg">
            <p className="text-sm text-green-800">🎯 Stay organized and productive</p>
          </div>
        </div>
      ),
      placement: isMobile ? 'top' : 'right',
    };

    // Focus step
    const focusStep = {
      target: isMobile ? '.tour-focus-tab' : '.tour-focus-nav',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">⏱️ Focus Sessions</h3>
          <p>Use the Pomodoro technique to stay focused and productive. Track your deep work sessions.</p>
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <ArrowRight className="w-4 h-4" />
            <span>Boost your productivity</span>
          </div>
        </div>
      ),
      placement: isMobile ? 'top' : 'right',
    };

    // Analytics step
    const analyticsStep = {
      target: isMobile ? '.tour-analytics-tab' : '.tour-analytics-nav',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">📈 Analytics & Insights</h3>
          <p>View detailed analytics, trends, and AI-powered insights about your progress and habits.</p>
          <div className="bg-purple-50 p-2 rounded-lg">
            <p className="text-sm text-purple-800">🤖 Get AI-powered recommendations</p>
          </div>
        </div>
      ),
      placement: isMobile ? 'top' : 'right',
    };

    // AI Chat step
    const aiChatStep = {
      target: '.tour-ai-chat',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">🤖 AI Assistant</h3>
          <p>Chat with our AI assistant for personalized advice, habit suggestions, and progress insights.</p>
          <div className="flex items-center gap-2 text-sm text-indigo-600">
            <Star className="w-4 h-4" />
            <span>Get personalized guidance</span>
          </div>
        </div>
      ),
      placement: 'left',
    };

    // Settings step
    const settingsStep = {
      target: isMobile ? '.tour-settings' : '.tour-settings-nav',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">⚙️ Settings</h3>
          <p>Customize your experience, manage your account, and access additional features.</p>
          <div className="bg-gray-50 p-2 rounded-lg">
            <p className="text-sm text-gray-800">🔧 Personalize your LifeDash experience</p>
          </div>
        </div>
      ),
      placement: isMobile ? 'left' : 'right',
    };

    // Completion step
    const completionStep = {
      target: 'body',
      content: (
        <div className="space-y-3 text-center">
          <h3 className="font-semibold text-lg">🎉 You're All Set!</h3>
          <p>You now know how to use all the main features of LifeDash. Start tracking your progress and building better habits!</p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              💡 <strong>Pro tip:</strong> The more you use LifeDash, the better insights you'll get about your progress!
            </p>
          </div>
        </div>
      ),
      placement: 'center',
    };

    return [
      ...baseSteps,
      navigationStep,
      fabStep,
      statsStep,
      habitsStep,
      todosStep,
      focusStep,
      analyticsStep,
      aiChatStep,
      settingsStep,
      completionStep,
    ];
  }, [isMobile]);

  const tourStyles = {
    options: {
      primaryColor: '#3b82f6',
      zIndex: 10000,
      arrowColor: '#ffffff',
      backgroundColor: '#ffffff',
      textColor: '#374151',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
    },
    tooltip: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e5e7eb',
    },
    tooltipTitle: {
      color: '#1f2937',
      fontSize: '18px',
      fontWeight: '600',
    },
    tooltipContent: {
      color: '#374151',
      fontSize: '14px',
      lineHeight: '1.5',
    },
    buttonNext: {
      backgroundColor: '#3b82f6',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '500',
      border: 'none',
      color: '#ffffff',
    },
    buttonBack: {
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid #d1d5db',
      color: '#374151',
    },
    buttonSkip: {
      color: '#6b7280',
      fontSize: '14px',
    },
    buttonClose: {
      color: '#6b7280',
    },
  };

  // Don't render if completed and not running (normal case)
  // But allow rendering if tour is running (restart scenario)
  if (isCompleted && !isRunning) {
    return null;
  }

  return (
    <>
      {/* Consent Modal */}
      {showConsent && (
                 <div className="fixed inset-0 z-1000 flex items-center justify-center p-4  backdrop-blur-[2px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Welcome to LifeDash! 🎉
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300">
                Would you like a quick 2-minute tour to learn how to use all the features?
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Only 2 minutes required</span>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleConsent(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => handleConsent(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Joyride Tour */}
      <Joyride
        steps={steps}
        run={isRunning}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={handleTourCallback}
        styles={tourStyles}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
        disableOverlayClose={true}
        disableScrolling={false}
        scrollToFirstStep={true}
      />
    </>
  );
}
