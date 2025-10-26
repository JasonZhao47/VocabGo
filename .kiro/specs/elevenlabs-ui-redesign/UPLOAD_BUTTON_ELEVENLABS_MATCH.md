# Upload Button - ElevenLabs Style Match

## Changes Made

### 1. Button Component (`src/components/ui/Button.vue`)

**Secondary Variant Updated:**
- Changed from gray border (`border-[#9CA3AF]`) to **black border** (`border-black`)
- Changed background from `bg-black` (typo) to **`bg-white`**
- Changed text color to **`text-black`**
- Simplified hover state to only `hover:bg-gray-50`
- Updated disabled state to use `disabled:border-gray-300`

**Result:** Matches ElevenLabs "Create folder" button style exactly:
- White background
- Black border (1px solid)
- Black text
- Subtle gray hover effect

### 2. Upload Page (`src/pages/UploadPage.vue`)

**Icon Changed:**
- Replaced upload cloud icon with **folder icon** (matching ElevenLabs)
- Path: `M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z`

**Button Styling:**
- Changed from full-width to **auto-width** with `min-width: 180px`
- Centered button in container with `justify-content: center`
- Reduced icon size from 20px to **16px** (more proportional)
- Maintained 8px gap between icon and text

## Visual Comparison

### Before:
- Gray border button
- Full width
- Upload cloud icon
- Larger icon (20px)

### After (ElevenLabs Match):
- ✅ Black border button
- ✅ Auto-width, centered
- ✅ Folder icon
- ✅ Smaller icon (16px)
- ✅ White background with black text
- ✅ Subtle hover effect

## ElevenLabs Reference

From https://elevenlabs.io/app/productions:
- Button text: "Create folder"
- Style: White bg, black border, folder icon
- Behavior: Subtle hover with light gray background
- No scale transforms, only color transitions

## Testing

To verify the changes:
1. Run `pnpm dev`
2. Navigate to `/upload`
3. Check that the "Upload Document" button matches ElevenLabs style:
   - White background
   - Black border
   - Folder icon on left
   - Centered, auto-width
   - Hover shows subtle gray background
