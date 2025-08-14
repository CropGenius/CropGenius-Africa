# Design Document

## Overview

The AI Input Integration feature will replace the existing basic input field in the CropGenius chat interface with a modern, animated component that provides enhanced user experience through visual effects, file upload capabilities, and voice recording functionality. The component will be positioned strategically above the bottom navigation bar to maintain optimal mobile usability.

## Architecture

### Component Structure
```
AIInputField (Main Component)
├── File Upload Section (Conditional)
│   ├── File Display Cards
│   └── Remove File Buttons
├── Main Input Container
│   ├── Left Action Buttons
│   │   ├── File Upload Button (Paperclip)
│   │   └── Voice Recording Button (Microphone)
│   ├── Textarea Input (Auto-resizing)
│   └── Send Button
├── Visual Effects Layer
│   ├── Glow Effects
│   ├── Animated Sparkles
│   └── Focus Indicators
└── Recording Indicator (Conditional)
```

### Integration Points
- **Chat Page**: Replace existing input Card component
- **Mobile Layout**: Position above UnifiedNavigation component
- **State Management**: Integrate with existing chat message handling
- **File Handling**: Extend current message structure to support file attachments

## Components and Interfaces

### AIInputField Component

**Props Interface:**
```typescript
interface AIInputFieldProps {
  onSendMessage: (message: string, files?: FileUpload[]) => void;
  onVoiceInput?: (transcript: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}
```

**State Management:**
```typescript
interface AIInputState {
  message: string;
  isRecording: boolean;
  uploadedFiles: FileUpload[];
  isFocused: boolean;
}
```

### Visual Design System

**Animation Framework:**
- **Focus Animations**: Scale transform (105%) with glow effects
- **Glow Effects**: Gradient backgrounds with blur and opacity transitions
- **Sparkle Animations**: Positioned absolute elements with bounce/pulse animations
- **Recording Feedback**: Pulsing red animations with "Listening..." indicator

**Color Palette:**
- **Primary Gradients**: Blue to purple for active states
- **Neutral Tones**: Slate colors for inactive states
- **Success States**: Green gradients for enabled actions
- **Error States**: Red gradients for recording/error states

**Responsive Breakpoints:**
- **Mobile**: Full width with optimized touch targets
- **Tablet**: Constrained max-width with centered layout
- **Desktop**: Maximum 4xl width with enhanced visual effects

## Data Models

### Extended Message Structure
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  files?: FileUpload[];
  timestamp: Date;
  voiceInput?: boolean;
}
```

### File Upload Validation
```typescript
interface FileValidation {
  maxSize: number; // 10MB default
  allowedTypes: string[];
  maxFiles: number; // 5 files default
}
```

## Error Handling

### File Upload Errors
- **File Size Validation**: Display toast notification for oversized files
- **File Type Validation**: Show error for unsupported file types
- **Upload Limit**: Prevent adding more than maximum allowed files

### Voice Recording Errors
- **Browser Compatibility**: Fallback message for unsupported browsers
- **Permission Denied**: User-friendly error for microphone access
- **Network Issues**: Retry mechanism for voice processing

### Input Validation
- **Empty Message**: Disable send button when no content
- **Character Limits**: Optional character count with warnings
- **Network Connectivity**: Offline state handling

## Testing Strategy

### Unit Tests
- **Component Rendering**: Verify all UI elements render correctly
- **State Management**: Test state updates for all user interactions
- **File Handling**: Validate file upload, display, and removal
- **Voice Recording**: Mock speech recognition API interactions

### Integration Tests
- **Chat Integration**: Test message sending with files and voice input
- **Mobile Layout**: Verify positioning above navigation bar
- **Responsive Design**: Test across different screen sizes

### Visual Regression Tests
- **Animation States**: Capture screenshots of all animation states
- **Focus States**: Verify visual feedback for focus/blur events
- **Loading States**: Test visual indicators during processing

### Accessibility Tests
- **Keyboard Navigation**: Ensure all functions accessible via keyboard
- **Screen Reader**: Test ARIA labels and announcements
- **Color Contrast**: Verify sufficient contrast ratios
- **Touch Targets**: Validate minimum touch target sizes (44px)

## Implementation Phases

### Phase 1: Core Component Creation
1. Create AIInputField component in `/src/components/ui/`
2. Implement basic text input with auto-resize functionality
3. Add file upload mechanism with validation
4. Integrate voice recording with browser Speech API

### Phase 2: Visual Enhancement
1. Implement gradient backgrounds and glow effects
2. Add focus animations and sparkle effects
3. Create recording indicator with pulsing animations
4. Apply responsive design patterns

### Phase 3: Chat Integration
1. Replace existing input in Chat.tsx
2. Extend message handling for file attachments
3. Integrate voice input with existing chat flow
4. Update mobile layout positioning

### Phase 4: Testing and Optimization
1. Implement comprehensive test suite
2. Optimize animations for performance
3. Add accessibility enhancements
4. Conduct cross-browser testing

## Technical Considerations

### Performance Optimization
- **Animation Performance**: Use CSS transforms and GPU acceleration
- **File Processing**: Implement lazy loading for file previews
- **Memory Management**: Clean up file objects and event listeners

### Browser Compatibility
- **Speech Recognition**: Graceful degradation for unsupported browsers
- **File API**: Polyfills for older browser versions
- **CSS Features**: Fallbacks for advanced CSS properties

### Mobile Optimization
- **Touch Interactions**: Optimize button sizes and touch responses
- **Keyboard Handling**: Proper viewport adjustments for virtual keyboards
- **Performance**: Minimize reflows and repaints during animations