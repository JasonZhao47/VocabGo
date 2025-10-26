# TypeScript Error Diagnosis

## Summary
Total Errors: 47 TypeScript errors across 10 files

## Error Categories

### 1. Type Definition Issues (1 error)

**Location**: `src/components/practice/PracticeQuestion.vue:92`

**Problem**: Accessing `correctAnswer` property on `MultipleChoiceQuestion` type that doesn't exist

**Root Cause**: 
- `MultipleChoiceQuestion` interface has `options` array with `isCorrect` flags
- Code incorrectly assumes a `correctAnswer` string property exists

**Fix**: Determine correct answer from options array:
```typescript
const correctAnswer = question.options.find(opt => opt.isCorrect)?.text
```

---

### 2. Test Implementation Issues (17 errors)

#### A. StudentNicknameEntry.test.ts (7 errors)
**Lines**: 210, 223, 232, 276, 285, 323-332

**Problem**: Tests accessing internal component state not exposed via `defineExpose()`

**Properties accessed but not exposed**:
- `setSubmitting()` - method
- `setError()` - method  
- `isSubmitting` - ref
- `validationError` - ref
- `inputRef.value` - ref

**Fix Options**:
1. Add these to `defineExpose()` in component
2. Refactor tests to test behavior (preferred)

#### B. ProcessingModal.test.ts (3 errors)
**Lines**: 262, 275, 289

**Problem**: Accessing `isActiveProcessing` computed property not exposed

**Fix**: Expose the computed property or test via props/emits

#### C. StudentPracticeView.test.ts (7 errors)
**Lines**: 177, 216, 254, 259-260, 293, 298-299, 302, 331, 336, 386, 424

**Problem**: Accessing internal component state:
- `wordlist` - ref
- `totalQuestions` - computed
- `answeredCount` - ref
- `progressPercentage` - computed
- `personalMistakes` - ref
- `handleNicknameSubmit()` - method
- `showNicknameModal` - ref

**Fix**: Expose these or refactor tests

---

### 3. Toast Composable Type Mismatch (6 errors)

**Locations**:
- `ShareWordlistButton.vue`: 167, 176, 213, 226, 249, 258
- `PracticeDashboard.vue`: 313, 326, 333, 374, 380
- `StudentPracticeView.vue`: 206, 235, 261

**Problem**: Calling `showToast()` with object but signature expects string

**Current (incorrect)**:
```typescript
showToast({
  type: 'success',
  message: 'Done!',
  duration: 3000
})
```

**Correct signatures**:
```typescript
// Option 1: Use shorthand methods
success('Done!', 3000)
error('Failed!', 5000)
info('Info', 3000)

// Option 2: Use full signature
showToast('Done!', 'success', 3000)
```

**Fix**: Replace all object-style calls with correct signature

---

### 4. Readonly Array Assignment (2 errors)

**Location**: `PracticeDashboard.vue:109, 156`

**Problem**: Assigning readonly arrays to mutable types

**Code**:
```typescript
const rows = stats.value.aggregateMistakes.map(m => [...])
// Type: readonly {...}[]
// Expected: {...}[]
```

**Fix**: Add type assertion or create mutable copy:
```typescript
const rows = [...stats.value.aggregateMistakes].map(m => [...])
```

---

### 5. Date vs String Type Mismatch (1 error)

**Location**: `SavedWordlistsPage.vue:635`

**Problem**: 
- `wordlistsState.ts` defines `createdAt: Date`
- `wordlistService.ts` expects `createdAt: string`

**Fix**: Align types - convert Date to string when calling service:
```typescript
await downloadWordlist({
  ...wordlist,
  createdAt: wordlist.createdAt.toISOString()
})
```

---

### 6. Missing Test Imports (6 errors)

**Location**: `tests/accessibility/navigation-list-accessibility.test.ts:51, 156, 383, 396, 405, 419`

**Problem**: Using `vi` mock utility without importing

**Fix**: Add import at top of file:
```typescript
import { describe, it, expect, vi } from 'vitest'
```

---

### 7. Invalid CSS Property Access (2 errors)

**Location**: `tests/cross-browser/elevenlabs-ui-browser.test.ts:103, 107, 108`

**Problem**: Accessing `fontDisplay` on `CSSStyleDeclaration`

**Root Cause**: `font-display` is a `@font-face` descriptor, not a CSS property

**Fix**: Remove or refactor test - cannot test `@font-face` descriptors via element styles:
```typescript
// Remove this test or check differently
// fontDisplay is not accessible via element.style
```

---

## Priority Fixes

### High Priority (Breaks functionality)
1. **Toast composable calls** - 6 files affected, user-facing
2. **PracticeQuestion correctAnswer** - Breaks practice feature

### Medium Priority (Breaks tests)
3. **Test implementation issues** - 17 errors but tests only
4. **Missing vi import** - Easy fix

### Low Priority (Type safety)
5. **Readonly array assignments** - Works at runtime
6. **Date/string mismatch** - May work due to coercion
7. **CSS property test** - Test-only issue

## Recommended Fix Order

1. Fix toast calls (bulk find/replace)
2. Fix PracticeQuestion correctAnswer logic
3. Add vi import to test file
4. Fix or remove fontDisplay test
5. Fix readonly array assignments
6. Fix Date/string type mismatch
7. Refactor test implementation (or expose properties)
