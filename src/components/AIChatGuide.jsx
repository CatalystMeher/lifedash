import React, { useState } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { Bot, MessageCircle, Sparkles, Brain, Target, TrendingUp, Zap, X } from 'lucide-react';
import { useTour } from '../contexts/TourContext';

const AI_CHAT_GUIDE_KEY = 'lifedash-ai-chat-guide-completed';

export default function AIChatGuide() {
  const [run, setRun] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check if AI Chat guide has been completed and show consent if not
  React.useEffect(() => {
    const completed = localStorage.getItem(AI_CHAT_GUIDE_KEY) === 'true';
    setIsCompleted(completed);
    
    // Show consent modal if not completed
    if (!completed) {
      setShowConsent(true);
    }
  }, []);

  const { startTour, stopTour, completeTour } = useTour();

  const handleStartGuide = () => {
    setRun(true);
    setShowConsent(false);
  };

  const handleConsent = (accepted) => {
    setShowConsent(false);
    if (accepted) {
      handleStartGuide();
    }
  };

  const handleGuideCallback = (data) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      localStorage.setItem(AI_CHAT_GUIDE_KEY, 'true');
      setIsCompleted(true);
      
      if (status === STATUS.FINISHED) {
        // Use the tour context to show completion message
        completeTour();
      }
    }
  };

  const steps = [
    {
      target: 'body',
      content: (
        <div className="space-y-3 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-lg">🤖 Meet Dash - Your AI Life Coach</h3>
          <p>Welcome to your personalized AI assistant! Dash can analyze your data, provide insights, and help you achieve your goals.</p>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              💡 <strong>Pro tip:</strong> Dash has access to all your LifeDash data and can provide personalized advice!
            </p>
          </div>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.ai-chat-header',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">🎯 Dash's Capabilities</h3>
          <p>Dash can help you with:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span>Analyze your habits and progress</span>
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Track your stats and trends</span>
            </li>
            <li className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              <span>Set and achieve goals</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span>Get productivity tips</span>
            </li>
          </ul>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.ai-chat-clear',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">🗑️ Clear Chat History</h3>
          <p>Use this button to start fresh conversations. Your chat history is stored locally for privacy.</p>
          <div className="bg-blue-50 p-2 rounded-lg">
            <p className="text-sm text-blue-800">🔒 Your conversations are private and stored only on your device</p>
          </div>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '.ai-chat-quick-messages',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">⚡ Quick Messages</h3>
          <p>Tap these pre-written messages to quickly ask common questions. Perfect for getting started!</p>
          <div className="space-y-2 text-sm">
            <p><strong>Try these:</strong></p>
            <ul className="space-y-1">
              <li>• "How am I doing with my habits?"</li>
              <li>• "Analyze my stats"</li>
              <li>• "Productivity tips"</li>
              <li>• "Goal suggestions"</li>
            </ul>
          </div>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.ai-chat-input',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">💬 Ask Anything</h3>
          <p>Type your questions here. Dash can help with:</p>
          <div className="space-y-2 text-sm">
            <div className="bg-green-50 p-2 rounded-lg">
              <p className="text-green-800"><strong>Examples:</strong></p>
              <ul className="mt-1 space-y-1">
                <li>• "What's my best performing habit?"</li>
                <li>• "How can I improve my productivity?"</li>
                <li>• "Suggest a new goal based on my data"</li>
                <li>• "Analyze my weekly progress"</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.ai-chat-send',
      content: (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">📤 Send Message</h3>
          <p>Click this button or press Enter to send your message to Dash.</p>
          <div className="bg-purple-50 p-2 rounded-lg">
            <p className="text-sm text-purple-800">🚀 Dash will analyze your data and provide personalized insights!</p>
          </div>
        </div>
      ),
      placement: 'left',
    },
    {
      target: 'body',
      content: (
        <div className="space-y-3 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-lg">🎉 You're Ready to Chat!</h3>
          <p>You now know how to use Dash effectively. Start asking questions and get personalized insights about your life data!</p>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              💡 <strong>Pro tip:</strong> The more you chat with Dash, the better it understands your patterns and goals!
            </p>
          </div>
        </div>
      ),
      placement: 'center',
    },
  ];

  const tourStyles = {
    options: {
      primaryColor: '#8b5cf6',
      zIndex: 10000,
      arrowColor: '#ffffff',
      backgroundColor: '#ffffff',
      textColor: '#374151',
      overlayColor: 'rgba(0, 0, 0, 0.3)',
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
      backgroundColor: '#8b5cf6',
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

  // Don't render if completed
  if (isCompleted) {
    return null;
  }

  return (
    <>
      {/* Consent Modal */}
      {showConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Meet Dash - Your AI Life Coach! 🤖
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300">
                Would you like a quick tour of Dash's features? Learn how to get the most out of your AI assistant.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-4 h-4" />
                <span>Only 2 minutes to master Dash</span>
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
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
        run={run}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={handleGuideCallback}
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
