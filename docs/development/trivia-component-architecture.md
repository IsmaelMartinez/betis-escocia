# Trivia Component Architecture

## Overview

The trivia system has been dramatically simplified to use a single consolidated component instead of multiple specialized components. This document outlines the current simplified architecture and component patterns.

## Architecture Summary

### Before: Multi-Component Architecture (Eliminated)
```
┌─────────────────────────────────────────────────────────────┐
│                      TriviaPage                             │
│  ┌─────────────────┐                ┌─────────────────────┐ │
│  │    GameTimer    │                │  TriviaScoreDisplay │ │
│  │                 │                │                     │ │
│  │ • 44 lines      │                │ • 500+ lines       │ │
│  │ • Complex UI    │                │ • API integration   │ │
│  │ • Progress bar  │                │ • Score formatting  │ │
│  │ • Visual states │                │ • Loading states    │ │
│  └─────────────────┘                └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### After: Single Component Architecture (Current)
```
┌───────────────────────────────────────────────────────────┐
│                    TriviaPage                             │
│                                                           │
│ • Simple timer with setTimeout                            │
│ • Inline score display                                    │
│ • 3-variable state management                             │
│ • State machine pattern                                   │
│ • ~400 lines total (vs 1,000+ before)                    │
└───────────────────────────────────────────────────────────┘
```

## Component Structure

### Main Component: TriviaPage

**Location**: `src/app/trivia/page.tsx`  
**Purpose**: Complete trivia game functionality in a single component  
**State Management**: 3-variable simplified system

#### Core State Variables
```typescript
// Simplified 3-variable state system
const [gameState, setGameState] = useState<GameState>('loading');
const [currentData, setCurrentData] = useState<CurrentData>({ /* consolidated data */ });
const [error, setError] = useState<string | null>(null);
```

#### State Types
```typescript
type GameState = 'idle' | 'loading' | 'playing' | 'feedback' | 'completed' | 'error';

interface CurrentData {
  questions: TriviaQuestion[];      // Game questions
  questionIndex: number;            // Current question index
  score: number;                    // Current score
  selectedAnswer: string | null;    // Selected answer ID
  timeLeft: number;                 // Timer countdown
  scoreSubmitted: boolean;          // Submission flag
  totalScore: number | null;        // User's total score
  totalScoreLoading: boolean;       // Total score loading state
}
```

## Eliminated Components

### GameTimer (Removed)

**Previous Location**: `src/components/GameTimer.tsx` (DELETED)  
**Previous Stories**: `src/components/GameTimer.stories.tsx` (DELETED)  
**Replacement**: Simple setTimeout implementation in TriviaPage

**Old Implementation** (44 lines, complex):
```typescript
// ELIMINATED - Previously in GameTimer.tsx
export default function GameTimer({ duration, onTimeUp, resetTrigger }: Props) {
  // Complex useEffect chains
  // Visual progress indicators
  // Multiple state variables
  // Complex cleanup logic
}
```

**New Implementation** (Inline, simple):
```typescript
// NEW - Integrated in TriviaPage
useEffect(() => {
  if (gameState === 'playing' && currentData.timeLeft > 0) {
    const timerId = setTimeout(() => {
      setCurrentData(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
    }, 1000);
    return () => clearTimeout(timerId);
  } else if (gameState === 'playing' && currentData.timeLeft === 0) {
    goToNextQuestion(); // Auto-advance on timeout
  }
}, [gameState, currentData.timeLeft, goToNextQuestion]);
```

**Benefits of Elimination**:
- **44 lines removed** from separate component
- **Simpler timer logic** without complex visual progress
- **No prop drilling** between TriviaPage and GameTimer
- **Reduced bundle size** through component elimination
- **Easier maintenance** with inline implementation

### TriviaScoreDisplay (Removed)

**Previous Location**: `src/components/TriviaScoreDisplay.tsx` (DELETED)  
**Previous Tests**: Associated test files (DELETED)  
**Replacement**: Inline score display in TriviaPage and dashboard

**Old Implementation** (500+ lines, complex):
```typescript
// ELIMINATED - Previously in TriviaScoreDisplay.tsx
export default function TriviaScoreDisplay({ userId }: Props) {
  // Multiple API calls
  // Complex loading states
  // Error handling logic
  // Score formatting
  // Visual components
}
```

**New Implementation** (Inline, simple):
```typescript
// NEW - Integrated in TriviaPage results section
const renderScore = () => (
  <div className="text-center">
    <div className="text-6xl font-bold text-green-600 mb-2">
      {currentData.score}/{totalQuestions}
    </div>
    <div className="text-2xl text-gray-600 mb-4">
      {percentage}% Correct
    </div>
  </div>
);

// NEW - Total score display
const renderTotalScore = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <p className="text-sm font-medium text-gray-600">Puntuación Total Trivia</p>
    {currentData.totalScoreLoading ? (
      <div className="text-2xl font-bold text-betis-green">Cargando...</div>
    ) : (
      <p className="text-3xl font-bold text-betis-green">
        {currentData.totalScore !== null ? currentData.totalScore : 'N/A'}
      </p>
    )}
  </div>
);
```

**Benefits of Elimination**:
- **500+ lines removed** from separate component
- **No additional API calls** - uses data from main game flow
- **Simplified loading states** - unified with main component
- **Reduced complexity** - no component-to-component communication
- **Better performance** - fewer React components in tree

## Component Patterns

### 1. Consolidated Rendering Pattern

Instead of separate components, the TriviaPage uses inline rendering functions:

```typescript
// Pattern: Inline rendering functions
const renderGameStart = () => (
  <div className="bg-white shadow-md rounded-lg p-8 text-center">
    <h1 className="text-3xl font-bold text-green-600 mb-6">Betis & Scotland Trivia</h1>
    <button onClick={handleStartGame}>Comenzar Trivia</button>
  </div>
);

const renderGamePlay = () => (
  <div className="container mx-auto p-4">
    {/* Game questions and answers */}
    <div className="text-center mb-4">
      <div className={`text-2xl font-bold ${getTimerColor()}`}>
        {currentData.timeLeft}s
      </div>
    </div>
    {/* Question content */}
  </div>
);

const renderGameResults = () => (
  <div className="bg-white shadow-md rounded-lg p-8 text-center">
    {/* Results display */}
    {renderScore()}
    {renderTotalScore()}
  </div>
);

// Main render based on state machine
if (gameState === 'loading') return <LoadingSpinner />;
if (gameState === 'idle' || gameState === 'error') return renderGameStart();
if (gameState === 'completed') return renderGameResults();
return renderGamePlay(); // playing or feedback states
```

### 2. State-Driven Rendering

Rendering is driven by the simple state machine:

```typescript
// Clear state-driven rendering
switch (gameState) {
  case 'idle':     return <StartScreen />;
  case 'loading':  return <LoadingSpinner />;
  case 'playing':  return <GameQuestion />;
  case 'feedback': return <GameQuestion />; // Same UI, different behavior
  case 'completed': return <GameResults />;
  case 'error':    return <ErrorScreen />;
}
```

### 3. Inline Style Patterns

Visual states are handled through inline conditional classes:

```typescript
// Timer color based on time remaining
const getTimerColor = () => {
  if (currentData.timeLeft <= 5) return 'text-red-500';
  if (currentData.timeLeft <= 10) return 'text-yellow-500';
  return 'text-green-500';
};

// Answer button styling based on state
const getAnswerButtonClass = (answer, isSelected) => {
  let buttonClass = "w-full py-3 px-4 rounded-lg text-left transition-colors duration-300";
  
  if (gameState === 'feedback' && isSelected) {
    buttonClass += answer.is_correct ? " bg-green-500 text-white" : " bg-red-500 text-white";
  } else if (gameState === 'feedback' && answer.is_correct) {
    buttonClass += " bg-green-300";
  } else {
    buttonClass += " bg-gray-200 hover:bg-gray-300";
  }
  
  return buttonClass;
};
```

## Testing Strategy

### Component Testing

Since we have a single component, testing focuses on state transitions:

```typescript
// Test state machine transitions
test('transitions from idle to loading when game starts', () => {
  render(<TriviaPage />);
  
  expect(getGameState()).toBe('idle');
  fireEvent.click(screen.getByText('Comenzar Trivia'));
  expect(getGameState()).toBe('loading');
});

// Test consolidated data updates
test('updates score and advances question atomically', () => {
  setupGameInProgress();
  
  fireEvent.click(screen.getByText('Correct Answer'));
  
  expect(getCurrentData()).toMatchObject({
    questionIndex: 1,
    score: 1,
    selectedAnswer: null,
    timeLeft: 15
  });
});
```

### Storybook Documentation

With components eliminated, Storybook stories have been removed:

```typescript
// REMOVED: GameTimer.stories.tsx
// REMOVED: TriviaScoreDisplay.stories.tsx

// The main TriviaPage is too complex for Storybook (requires authentication)
// Component patterns are documented here instead
```

## Performance Benefits

### Bundle Size Reduction

- **GameTimer elimination**: 44 lines removed
- **TriviaScoreDisplay elimination**: 500+ lines removed  
- **Dependencies reduced**: Fewer React components in tree
- **Import statements reduced**: Less module loading

### Runtime Performance

- **Fewer components**: Reduced React reconciliation overhead
- **Simplified state**: Fewer state updates and re-renders
- **Inline rendering**: No prop passing between components
- **Consolidated logic**: Better optimization opportunities

### Memory Usage

- **Component tree reduction**: Fewer React fiber nodes
- **State consolidation**: Single state object vs multiple variables
- **Event handler optimization**: useCallback with stable dependencies

## Migration Impact

### For Developers

**Positive Changes**:
- **Single file to understand**: All trivia logic in one place
- **Clear state flow**: State machine pattern is predictable
- **Easier debugging**: No component boundaries to cross
- **Faster development**: Changes don't require component coordination

**Learning Required**:
- **New state patterns**: Understanding the 3-variable system
- **Inline patterns**: Working without separate components
- **State machine**: Understanding state transitions

### For Maintenance

**Simplified Maintenance**:
- **One component to update**: No component synchronization needed
- **Clear boundaries**: State machine provides structure
- **Fewer test files**: Consolidated testing approach

**Enhanced Debugging**:
- **Centralized logging**: All trivia events in one place
- **Clear state inspection**: 3 variables to examine vs 11+
- **Predictable flow**: State machine eliminates complex conditionals

## Best Practices

### 1. Component Structure

Keep the single component organized with clear sections:

```typescript
export default function TriviaPage() {
  // 1. Hooks and state
  const [gameState, setGameState] = useState<GameState>('loading');
  const [currentData, setCurrentData] = useState<CurrentData>({ /* */ });
  const [error, setError] = useState<string | null>(null);
  
  // 2. Event handlers
  const handleStartGame = useCallback(() => { /* */ }, []);
  const handleAnswerClick = useCallback(() => { /* */ }, []);
  
  // 3. Effects
  useEffect(() => { /* timer logic */ }, [gameState, currentData.timeLeft]);
  useEffect(() => { /* initialization */ }, [isLoaded, isSignedIn]);
  
  // 4. Render functions
  const renderGameStart = () => { /* */ };
  const renderGamePlay = () => { /* */ };
  const renderGameResults = () => { /* */ };
  
  // 5. Main render
  if (gameState === 'loading') return <LoadingSpinner />;
  // ... state-driven rendering
}
```

### 2. Adding New Features

When adding features to the trivia system:

**✅ DO: Extend the existing patterns**
```typescript
// Add to CurrentData interface
interface CurrentData {
  // ... existing fields
  newFeature: NewFeatureType;
  newFeatureLoading: boolean;
}

// Add to state machine
type GameState = 'idle' | 'loading' | 'playing' | 'feedback' | 'completed' | 'error' | 'newFeature';

// Add inline render function
const renderNewFeature = () => ( /* JSX */ );
```

**❌ DON'T: Create new components**
```typescript
// Avoid - goes against consolidation
const NewTriviaFeature = ({ data }) => { /* */ };
```

### 3. State Management

Always use the established patterns:

```typescript
// ✅ GOOD: Functional updates
setCurrentData(prev => ({
  ...prev,
  score: prev.score + 1,
  questionIndex: prev.questionIndex + 1
}));

// ❌ BAD: Direct updates
setCurrentData({
  ...currentData, // Race condition risk
  score: currentData.score + 1
});
```

## Conclusion

The simplified component architecture represents a successful elimination of over-engineering while maintaining all functionality. The patterns established here should guide future development:

### Key Principles
1. **Consolidation over separation**: Prefer inline functionality over separate components
2. **State machine clarity**: Use clear state transitions instead of complex conditionals  
3. **Performance focus**: Optimize for fewer components and simpler state management
4. **Maintainability**: Prioritize single file understanding over separation of concerns

### Future Development
- **Follow established patterns** when adding features
- **Resist component proliferation** - inline functionality when possible
- **Maintain state machine clarity** with explicit transitions
- **Document patterns** rather than creating complex component APIs

This architecture provides a template for other complex interactive components in the application, demonstrating that dramatic simplification can improve both developer experience and application performance.