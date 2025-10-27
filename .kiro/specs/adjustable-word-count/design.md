# Adjustable Word Count Feature - Design Document

## Overview

This design adds a user-configurable word count slider to the upload page, allowing users to specify how many vocabulary words (10-200) they want extracted from their documents. The preference persists across sessions using localStorage.

## User Experience Flow

```
User visits Upload Page
    ↓
Slider loads with saved preference (or default 40)
    ↓
User adjusts slider (10-200 words)
    ↓
Value saved to localStorage immediately
    ↓
User uploads document
    ↓
Frontend sends maxWords to backend
    ↓
Backend validates and uses maxWords
    ↓
Extraction returns requested word count
    ↓
Results displayed with actual count
```

## Architecture

### Components to Modify

**Frontend (Vue 3):**
- `src/pages/UploadPage.vue` - Add slider UI component
- `src/composables/useUpload.ts` - Handle word count parameter
- `src/services/uploadService.ts` - Pass maxWords to backend

**Backend (Supabase Edge Functions):**
- `supabase/functions/process-document/index.ts` - Accept and validate maxWords
- `supabase/functions/_shared/agents/extractor.ts` - Use maxWords parameter (already supports this)

## Technical Design

### 1. Frontend Slider Component

**Location:** `src/pages/UploadPage.vue`

**UI Structure:**
```vue
<template>
  <div class="bg-gray-50 rounded-lg p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Extraction Settings</h3>
    
    <div class="space-y-4">
      <!-- Slider Control -->
      <div>
        <label for="word-count-slider" class="block text-sm font-medium text-gray-700 mb-2">
          Words to extract: <span class="font-semibold text-blue-600">{{ wordCount }}</span>
        </label>
        
        <div class="relative">
          <input 
            id="word-count-slider"
            type="range" 
            min="10" 
            max="200" 
            v-model.number="wordCount"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <!-- Tick marks -->
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>10</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
          </div>
        </div>
        
        <!-- Helper text with dynamic guidance -->
        <p class="text-sm text-gray-500 mt-2">
          {{ getGuidanceText(wordCount) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const wordCount = ref(40);

// Load saved preference on mount
onMounted(() => {
  const saved = localStorage.getItem('wordlist-word-count');
  if (saved) {
    const parsedCount = parseInt(saved, 10);
    if (parsedCount >= 10 && parsedCount <= 200) {
      wordCount.value = parsedCount;
    }
  }
});

// Save preference when changed
watch(wordCount, (newCount) => {
  localStorage.setItem('wordlist-word-count', newCount.toString());
});

// Dynamic guidance based on word count
const getGuidanceText = (count: number): string => {
  if (count < 30) {
    return '📌 Focused vocabulary - ideal for targeted learning';
  } else if (count <= 80) {
    return '⚖️ Balanced learning - good mix of coverage and manageability';
  } else {
    return '📚 Comprehensive coverage - extensive vocabulary extraction (may take longer)';
  }
};
</script>

<style scoped>
/* Custom slider styling */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: #1d4ed8;
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  background: #1d4ed8;
  transform: scale(1.1);
}

.slider:focus {
  outline: none;
}

.slider:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
}

.slider:focus::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
}
</style>
```

### 2. State Management

**localStorage Schema:**
```typescript
// Key: 'wordlist-word-count'
// Value: string representation of number (e.g., "40", "100")
// Valid range: "10" to "200"
```

**Validation Logic:**
```typescript
const loadWordCount = (): number => {
  const saved = localStorage.getItem('wordlist-word-count');
  if (!saved) return 40; // Default
  
  const parsed = parseInt(saved, 10);
  
  // Validate range
  if (isNaN(parsed) || parsed < 10 || parsed > 200) {
    return 40; // Fallback to default
  }
  
  return parsed;
};

const saveWordCount = (count: number): void => {
  // Clamp to valid range
  const clamped = Math.min(Math.max(count, 10), 200);
  localStorage.setItem('wordlist-word-count', clamped.toString());
};
```

### 3. Frontend Service Integration

**Update `src/composables/useUpload.ts`:**
```typescript
export function useUpload(wordCount?: Ref<number>) {
  // ... existing code ...
  
  const processDocument = async () => {
    if (!selectedFile.value) return;
    
    try {
      isProcessing.value = true;
      currentStep.value = 'Extracting text...';
      progress.value = 10;
      
      const result = await uploadService.processDocument(selectedFile.value, {
        maxWords: wordCount?.value || 40, // Pass word count
        onProgress: (step, progressValue, timeEstimate) => {
          currentStep.value = step;
          progress.value = progressValue;
          estimatedTime.value = timeEstimate;
        }
      });
      
      results.value = result;
      showToast('Document processed successfully!', 'success');
    } catch (error) {
      console.error('Processing failed:', error);
      showToast('Failed to process document. Please try again.', 'error');
    } finally {
      isProcessing.value = false;
    }
  };
  
  // ... rest of code ...
}
```

**Update `src/services/uploadService.ts`:**
```typescript
export interface ProcessDocumentOptions {
  maxWords?: number;
  onProgress?: (step: string, progress: number, estimatedTime: number) => void;
}

class UploadService {
  async processDocument(
    file: File, 
    options: ProcessDocumentOptions = {}
  ): Promise<ProcessDocumentResult> {
    const { maxWords, onProgress } = options;
    
    // ... text extraction code ...
    
    // Step 2: Process with AI
    onProgress?.('Processing with AI...', 50, 20000);
    
    const response = await fetch('/functions/v1/process-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        filename: file.name,
        maxWords // Include in request
      })
    });
    
    // ... rest of code ...
  }
}
```

### 4. Backend Parameter Handling

**Update `supabase/functions/process-document/index.ts`:**
```typescript
interface ProcessDocumentRequest {
  text: string;
  filename?: string;
  maxWords?: number; // New parameter
}

serve(async (req: Request) => {
  // ... CORS handling ...
  
  try {
    const { text, filename, maxWords } = await req.json() as ProcessDocumentRequest;
    
    // Validate and clamp maxWords
    const validatedMaxWords = Math.min(Math.max(maxWords || 40, 10), 200);
    console.log(`[Info] Using maxWords: ${validatedMaxWords}`);
    
    // ... text cleaning ...
    
    // Extract words with validated count
    const extractor = new ExtractorAgent();
    const extractorResult = await extractor.extractWords(cleanedText, validatedMaxWords);
    
    // ... translation and response ...
  } catch (error) {
    // ... error handling ...
  }
});
```

### 5. User Guidance System

**Dynamic Helper Text:**
```typescript
const getGuidanceText = (count: number): string => {
  if (count < 30) {
    return '📌 Focused vocabulary - ideal for targeted learning';
  } else if (count <= 80) {
    return '⚖️ Balanced learning - good mix of coverage and manageability';
  } else {
    return '📚 Comprehensive coverage - extensive vocabulary extraction (may take longer)';
  }
};
```

**Visual Feedback:**
- Slider thumb changes color on hover
- Real-time value display updates as user drags
- Helper text updates dynamically based on selection
- Tick marks show key intervals (10, 50, 100, 150, 200)

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Page Load                                                 │
│    - Check localStorage for 'wordlist-word-count'           │
│    - Load saved value or default to 40                      │
│    - Initialize slider with loaded value                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User Adjusts Slider                                       │
│    - Vue reactive updates wordCount ref                     │
│    - Watch triggers localStorage save                       │
│    - Helper text updates based on new value                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User Uploads Document                                     │
│    - processDocument() called with wordCount.value          │
│    - uploadService includes maxWords in API request         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend Processing                                        │
│    - Validate maxWords (clamp to 10-200)                    │
│    - Pass to ExtractorAgent                                 │
│    - Extract up to maxWords vocabulary words                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Results Display                                           │
│    - Show extracted words                                   │
│    - Display actual count vs requested count                │
│    - Indicate if fewer words were found                     │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

### Validation Scenarios

| Scenario | Handling | User Impact |
|----------|----------|-------------|
| Invalid localStorage value | Use default (40) | Slider shows 40 |
| Value < 10 | Clamp to 10 | Slider shows 10 |
| Value > 200 | Clamp to 200 | Slider shows 200 |
| Non-numeric value | Use default (40) | Slider shows 40 |
| localStorage unavailable | Use in-memory state | Preference not persisted |
| Backend receives invalid maxWords | Clamp to 10-200 | Extraction uses clamped value |

### Edge Cases

1. **User clears browser data:** Preference resets to default (40)
2. **Multiple tabs open:** Each tab maintains its own state, last save wins
3. **Backend doesn't receive maxWords:** Defaults to 40 for backward compatibility
4. **Document has fewer words than requested:** Returns all available words

## Performance Considerations

### localStorage Performance

- Read: Once on page load (~1ms)
- Write: On every slider change (~1ms)
- Impact: Negligible

### Slider Responsiveness

- Use `v-model.number` for automatic type conversion
- Debounce not needed - localStorage writes are fast
- Smooth animations via CSS transitions

### Backend Impact

- No additional database queries
- Validation is O(1) operation
- ExtractorAgent already supports variable word counts

## Testing Strategy

### Unit Tests

```typescript
describe('Word Count Slider', () => {
  it('should load saved preference from localStorage', () => {
    localStorage.setItem('wordlist-word-count', '100');
    const { wordCount } = setup();
    expect(wordCount.value).toBe(100);
  });
  
  it('should default to 40 when no preference exists', () => {
    localStorage.removeItem('wordlist-word-count');
    const { wordCount } = setup();
    expect(wordCount.value).toBe(40);
  });
  
  it('should clamp invalid values to range', () => {
    localStorage.setItem('wordlist-word-count', '500');
    const { wordCount } = setup();
    expect(wordCount.value).toBe(40); // Falls back to default
  });
  
  it('should save to localStorage on change', async () => {
    const { wordCount } = setup();
    wordCount.value = 150;
    await nextTick();
    expect(localStorage.getItem('wordlist-word-count')).toBe('150');
  });
});
```

### Integration Tests

1. Test slider interaction updates localStorage
2. Verify backend receives maxWords parameter
3. Confirm extraction respects word count limit
4. Test preference persistence across page reloads

### Manual Testing Checklist

- [ ] Slider moves smoothly from 10 to 200
- [ ] Value display updates in real-time
- [ ] Helper text changes at thresholds (30, 80)
- [ ] Preference persists after page reload
- [ ] Backend receives correct maxWords value
- [ ] Extraction returns requested word count (or fewer if document is small)
- [ ] Works in Chrome, Firefox, Safari
- [ ] Works on mobile devices

## Accessibility

### WCAG Compliance

- **Keyboard Navigation:** Slider is keyboard accessible (arrow keys adjust value)
- **Screen Readers:** Label clearly describes slider purpose
- **Focus Indicators:** Visible focus ring on slider thumb
- **Color Contrast:** Text meets WCAG AA standards (4.5:1 ratio)

### ARIA Attributes

```vue
<input 
  id="word-count-slider"
  type="range"
  min="10"
  max="200"
  v-model.number="wordCount"
  aria-label="Number of words to extract"
  aria-valuemin="10"
  aria-valuemax="200"
  :aria-valuenow="wordCount"
  :aria-valuetext="`${wordCount} words`"
  class="slider"
/>
```

## Success Metrics

1. **User Adoption:** > 30% of users adjust slider from default
2. **Preference Persistence:** > 95% of saved preferences load correctly
3. **Backend Compatibility:** 100% of requests with maxWords process successfully
4. **User Satisfaction:** Positive feedback on word count flexibility

## Future Enhancements

1. **Preset Buttons:** Quick select for common values (20, 40, 100)
2. **Smart Defaults:** Suggest word count based on document length
3. **History Tracking:** Show average word count user typically selects
4. **A/B Testing:** Test different default values for optimal user experience
5. **Advanced Mode:** Allow custom ranges beyond 10-200 for power users
