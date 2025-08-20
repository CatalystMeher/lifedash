# Guided Tour Feature

## Overview
LifeDash now includes a comprehensive guided tour for new users that introduces all the main features of the application. The tour is designed to be quick (approximately 2 minutes) and informative, helping users understand how to use the app effectively.

## Features

### 🎯 User Experience
- **Consent-based**: Users are asked for permission before starting the tour
- **Quick**: Only 2 minutes required to complete
- **Comprehensive**: Covers all major features in 10 steps
- **Non-intrusive**: Can be skipped at any time
- **Persistent**: Remembers completion status in localStorage

### 📱 Tour Steps
1. **Home Dashboard** - Overview of the command center
2. **Quick Log (FAB)** - Fast logging functionality
3. **Stats Tracking** - How to track metrics
4. **Habits** - Building and managing habits
5. **Todos** - Task management
6. **Focus Sessions** - Pomodoro technique
7. **Analytics** - Insights and AI recommendations
8. **AI Assistant** - Chat with AI for guidance
9. **Settings** - App customization
10. **Completion** - Final summary and tips

### 🔧 Technical Implementation

#### Components
- `GuidedTour.jsx` - Main tour component using react-joyride with responsive targets
- `TourContext.jsx` - Global tour state management
- `useFirstTimeUser.js` - Hook to detect first-time users

#### Libraries Used
- `react-joyride` - Tour overlay and navigation
- `lucide-react` - Icons for tour content
- `react-hot-toast` - Success notifications

#### CSS Classes
Tour elements are marked with specific CSS classes for both mobile and desktop:

**Mobile (TabBar):**
- `.tour-home-tab`
- `.tour-stats-tab`
- `.tour-habits-tab`
- `.tour-todos-tab`
- `.tour-focus-tab`
- `.tour-analytics-tab`

**Desktop (SideNav):**
- `.tour-home-nav`
- `.tour-stats-nav`
- `.tour-habits-nav`
- `.tour-todos-nav`
- `.tour-focus-nav`
- `.tour-analytics-nav`
- `.tour-settings-nav`

**Common Elements:**
- `.tour-fab`
- `.tour-ai-chat`
- `.tour-settings`

### 🎨 Styling
- Custom styled tooltips with modern design
- Responsive layout for mobile and desktop
- Dark mode support
- Smooth animations and transitions
- Semi-transparent consent modal with backdrop blur
- Device-responsive tour targets and placements

### 💾 Data Persistence
- `lifedash-tour-completed` - Tracks if tour has been completed
- `lifedash-tour-consent` - Stores user consent preference

### 🔄 Tour Management
Users can restart the tour from the Settings page:
1. Go to Settings
2. Click "Restart App Tour" button
3. Refresh the page to see the tour again

### 🚀 First-Time User Detection
The app automatically detects first-time users by:
1. Checking if tour has been completed
2. Verifying if user has any existing data (stats, habits, todos)
3. Showing consent modal for new users

## Installation
The tour feature is automatically included with the main app. No additional setup required.

## Customization
To modify the tour:
1. Edit `src/components/GuidedTour.jsx` to change steps and content
2. Update CSS classes in components to match tour targets
3. Modify styling in the `tourStyles` object
4. Adjust timing and behavior in `TourContext.jsx`

## Browser Support
- Modern browsers with localStorage support
- Mobile and desktop responsive
- Works with the existing PWA functionality
