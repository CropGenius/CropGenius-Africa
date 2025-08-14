# Design Document

## Overview

This design transforms the CropGenius AI chat interface from a broken, inconsistent UI into a world-class conversational experience that matches WhatsApp-tier quality. The redesign focuses on visual consistency, optimal performance, and human-like conversation flow while leveraging Gemini 2.5 Flash's speed.

## Architecture

### Component Hierarchy

```
ChatPage
├── ChatContainer (unified design system)
│   ├── ChatHeader (consistent with app shell)
│   ├── MessageList (optimized scrolling)
│   │   ├── MessageBubble (WhatsApp-style)
│   │   ├── TypingIndicator (animated)
│   │   └── PlaceholderBubble (instant feedback)
│   └── ChatInput (compact, responsive)
│       ├── InputField (48px height, expandable)
│       ├── ActionButtons (attachment, voice)
│       └── SendButton (animated state)
└── AnimationEngine (conversation flow)
```

### Design System Integration

The chat interface will adopt the existing CropGenius design tokens:
- **Colors**: Primary green (#10b981), background gradients, consistent shadows
- **Typography**: Same font stack and sizing as other pages
- **Spacing**: 16px grid system matching Home/Scan/Weather pages
- **Border Radius**: 12px-16px consistent with existing cards
- **Elevation**: Shadow system matching LiquidGlassCard component

## Components and Interfaces

### 1. ChatContainer Component

**Purpose**: Main wrapper ensuring visual consistency with app shell

```typescript
interface ChatContainerProps {
  className?: string;
  children: React.ReactNode;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-green-50 to-teal-50", // Match existing pages
      "flex flex-col",
      className
    )}>
      {children}
    </div>
  );
};
```

### 2. MessageBubble Component

**Purpose**: WhatsApp-style message display with proper formatting

```typescript
interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
  isTyping?: boolean;
  onAnimationComplete?: () => void;
}

interface ChatMessage {
  id: string;
  content: string | FormattedContent;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface FormattedContent {
  type: 'formatted';
  sections: ContentSection[];
}

interface ContentSection {
  type: 'text' | 'bullet' | 'heading' | 'emoji';
  content: string;
  level?: number; // for headings
}
```

**Key Features**:
- Maximum width: 280px (mobile-optimized)
- Bullet point formatting for AI responses
- Emoji integration for visual scanning
- Smooth entry animations
- Read receipts and status indicators

### 3. CompactChatInput Component

**Purpose**: Replace oversized input with WhatsApp-tier compact design

```typescript
interface CompactChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const CompactChatInput: React.FC<CompactChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Type your farming question..."
}) => {
  const [message, setMessage] = useState('');
  const [height, setHeight] = useState(48); // Default 48px height
  
  // Auto-expand logic (max 120px)
  // Touch-optimized button sizes (44px minimum)
  // Consistent padding (12px horizontal, 8px vertical)
};
```

### 4. TypingIndicator Component

**Purpose**: Show AI thinking state with animated dots

```typescript
const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 p-3 bg-gray-100 rounded-2xl max-w-20">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
      </div>
      <span className="text-sm text-gray-500 ml-2">CropGenius is thinking...</span>
    </div>
  );
};
```

### 5. PlaceholderBubble Component

**Purpose**: Instant feedback for Gemini 2.5 Flash speed perception

```typescript
const PlaceholderBubble: React.FC<{ onReplace: (content: string) => void }> = ({ onReplace }) => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bg-gray-100 p-3 rounded-2xl max-w-xs animate-pulse">
      <span className="text-gray-600">Let me check{dots}</span>
    </div>
  );
};
```

## Data Models

### Message State Management

```typescript
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  typingIndicator: boolean;
  placeholderBubble: PlaceholderBubble | null;
  scrollPosition: 'bottom' | 'manual';
}

interface PlaceholderBubble {
  id: string;
  text: string;
  startTime: number;
}

// Actions
type ChatAction = 
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SHOW_TYPING' }
  | { type: 'HIDE_TYPING' }
  | { type: 'ADD_PLACEHOLDER'; payload: PlaceholderBubble }
  | { type: 'REPLACE_PLACEHOLDER'; payload: { id: string; message: ChatMessage } }
  | { type: 'AUTO_SCROLL' }
  | { type: 'MANUAL_SCROLL' };
```

### Response Formatting Engine

```typescript
interface ResponseFormatter {
  formatAIResponse(rawText: string): FormattedContent;
  splitLongResponse(content: string): string[];
  addEmojisForScanning(text: string): string;
  createBulletPoints(text: string): ContentSection[];
}

class GeminiResponseFormatter implements ResponseFormatter {
  formatAIResponse(rawText: string): FormattedContent {
    // Split into logical sections
    // Add bullet points for lists
    // Insert relevant emojis (🌱, 🚜, 🌧️, 📊)
    // Create scannable headlines
    // Limit each bubble to ~150 words
  }
}
```

## Error Handling

### Network Resilience

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  errorType: 'network' | 'api' | 'unknown';
  retryCount: number;
}

const ChatErrorBoundary: React.FC = ({ children }) => {
  // Handle Gemini API failures gracefully
  // Show retry options
  // Maintain conversation history
  // Offline state management
};
```

### Graceful Degradation

- **No Internet**: Show cached responses and offline message
- **API Timeout**: Display "Taking longer than usual..." with retry option
- **Rate Limiting**: Queue messages and show estimated wait time
- **Invalid Input**: Provide helpful suggestions

## Testing Strategy

### Performance Testing

1. **Message Rendering**: Test 100+ message conversation scrolling
2. **Animation Performance**: Ensure 60fps on low-end Android devices
3. **Memory Usage**: Monitor for memory leaks in long conversations
4. **Input Responsiveness**: Test typing lag on various devices

### User Experience Testing

1. **Touch Targets**: Verify 44px minimum touch areas
2. **Keyboard Behavior**: Test input field expansion and keyboard handling
3. **Screen Readers**: Ensure accessibility compliance
4. **Dark Mode**: Test visual consistency in dark theme

### Integration Testing

1. **Gemini API**: Test various response formats and edge cases
2. **WhatsApp Integration**: Verify seamless handoff to WhatsApp
3. **File Upload**: Test image and document handling
4. **Voice Input**: Test speech recognition accuracy

## Animation System

### Conversation Flow Animations

```typescript
interface AnimationConfig {
  messageEntry: {
    duration: 300;
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)';
    transform: 'translateY(20px) -> translateY(0)';
    opacity: '0 -> 1';
  };
  
  typingIndicator: {
    duration: 1500;
    easing: 'ease-in-out';
    loop: true;
  };
  
  placeholderReplace: {
    duration: 200;
    easing: 'ease-out';
    transform: 'scale(1) -> scale(1.05) -> scale(1)';
  };
  
  autoScroll: {
    duration: 400;
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  };
}
```

### Performance Optimizations

- **Virtual Scrolling**: For conversations with 50+ messages
- **Intersection Observer**: Lazy load message animations
- **RequestAnimationFrame**: Smooth scroll behavior
- **CSS Transforms**: Hardware-accelerated animations

## Mobile Optimizations

### Touch Interactions

- **Input Field**: Minimum 48px height, comfortable thumb reach
- **Send Button**: 44px touch target with visual feedback
- **Message Bubbles**: Optimized for single-thumb scrolling
- **Voice Button**: Large enough for accurate tapping

### Keyboard Handling

```typescript
const useKeyboardAdjustment = () => {
  useEffect(() => {
    const handleKeyboard = (e: Event) => {
      // Adjust chat container height when keyboard appears
      // Maintain input field visibility
      // Auto-scroll to latest message
    };
    
    window.addEventListener('resize', handleKeyboard);
    return () => window.removeEventListener('resize', handleKeyboard);
  }, []);
};
```

### Network Optimization

- **Message Queuing**: Send messages when connection restored
- **Compression**: Optimize API payloads for slow networks
- **Caching**: Store recent conversations locally
- **Progressive Loading**: Load older messages on demand

## Implementation Phases

### Phase 1: Core Structure (Requirements 1, 2)
- Implement ChatContainer with unified design system
- Create CompactChatInput component
- Establish consistent visual hierarchy

### Phase 2: Message System (Requirements 3, 4)
- Build MessageBubble with formatting engine
- Add TypingIndicator and animations
- Implement auto-scroll behavior

### Phase 3: Performance (Requirements 5, 6)
- Add PlaceholderBubble for instant feedback
- Optimize Gemini API integration
- Implement error handling and retry logic

### Phase 4: Polish (Requirement 7)
- Mobile touch optimizations
- Accessibility improvements
- Performance testing and optimization

## Success Metrics

- **Visual Consistency**: 100% design token compliance with existing pages
- **Performance**: <100ms input response time, 60fps animations
- **User Experience**: <3 second perceived response time for AI
- **Mobile Usability**: 44px minimum touch targets, smooth keyboard handling
- **Conversation Quality**: Formatted responses with bullet points and emojis