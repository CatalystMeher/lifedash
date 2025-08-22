# AI Chat Guide Feature

## Overview
The AI Chat Guide is a specialized tour system designed to introduce users to Dash, the AI Life Coach feature in LifeDash. This guide provides a comprehensive walkthrough of the AI Chat interface and capabilities.

## Features

### 🎯 **User Experience**
- **First-time User Detection**: Automatically shows for new AI Chat users
- **Consent-based**: Users can choose to skip or start the guide
- **Comprehensive**: Covers all major AI Chat features in 7 steps
- **Non-intrusive**: Can be skipped at any time
- **Persistent**: Remembers completion status in localStorage

### 🤖 **Guide Steps**
1. **Welcome Introduction** - Meet Dash, your AI Life Coach
2. **Dash's Capabilities** - Overview of what Dash can help with
3. **Clear Chat History** - How to start fresh conversations
4. **Quick Messages** - Using pre-written message templates
5. **Ask Anything** - How to type custom questions
6. **Send Message** - How to send messages to Dash
7. **Completion** - Ready to start chatting with Dash

### 🔧 **Technical Implementation**

#### Components
- `AIChatGuide.jsx` - Main guide component using react-joyride
- Integrated with existing `TourContext` for state management
- Uses localStorage for persistence

#### CSS Classes
AI Chat elements are marked with specific CSS classes:
- `.ai-chat-header` - Header section with Dash info
- `.ai-chat-clear` - Clear chat button
- `.ai-chat-quick-messages` - Quick message templates
- `.ai-chat-input` - Message input field
- `.ai-chat-send` - Send message button

### 🎨 **Styling**
- **Purple/Blue Theme**: Matches Dash's gradient branding
- **Modern Design**: Rounded corners, shadows, gradients
- **Dark Mode Support**: Full theme compatibility
- **Responsive**: Works on mobile and desktop
- **Smooth Animations**: Professional transitions

### 💾 **Data Persistence**
- `lifedash-ai-chat-guide-completed` - Tracks if AI Chat guide has been completed

### 🚀 **First-Time User Detection**
The guide automatically detects first-time AI Chat users by:
1. Checking if guide has been completed
2. Showing consent modal after 1-second delay
3. Allowing users to start or skip the guide

## Integration

### **With Main Tour System**
- Uses the same `TourContext` for state management
- Consistent styling and behavior with main app tour
- Independent completion tracking

### **With AI Chat Page**
- Automatically integrated into AIChat page
- Shows after page loads for first-time users
- Non-blocking - users can still use AI Chat while guide is active

## Usage

### **For Users**
1. Navigate to AI Chat page
2. Guide appears automatically for first-time users
3. Follow the step-by-step instructions
4. Learn how to use Dash effectively

### **For Developers**
1. Guide is automatically included in AIChat page
2. No additional setup required
3. Guide state is managed independently from main tour
4. Easy to customize steps and content

## Customization

To modify the AI Chat guide:
1. Edit `src/components/AIChatGuide.jsx` to change steps and content
2. Update CSS classes in AIChat page to match tour targets
3. Modify styling in the `tourStyles` object
4. Adjust timing and behavior in the component logic

## Browser Support
- Modern browsers with localStorage support
- Mobile and desktop responsive
- Works with the existing tour system
- Compatible with all LifeDash features
