# Requirements Document

## Introduction

This specification defines the requirements for replicating the exact button styling from ElevenLabs Productions page (https://elevenlabs.io/app/productions) to achieve a 1:1 visual match. The current button implementation uses rounded-full (9999px) borders, but the ElevenLabs reference uses 8px border radius with specific sizing and styling.

## Glossary

- **Button Component**: The reusable Vue component located at `src/components/ui/Button.vue`
- **ElevenLabs Reference**: The production page at https://elevenlabs.io/app/productions
- **Design Tokens**: Configuration values in `src/config/elevenlabsDesignTokens.ts`
- **Upload Page**: The main upload interface at `src/pages/UploadPage.vue`

## Requirements

### Requirement 1: Button Border Radius

**User Story:** As a user, I want buttons to have the exact same border radius as ElevenLabs, so that the visual design matches the reference perfectly.

#### Acceptance Criteria

1. WHEN THE Button_Component renders, THE Button_Component SHALL apply an 8px border radius instead of full rounded (9999px)
2. THE Button_Component SHALL maintain consistent 8px border radius across all button variants (primary, secondary, ghost, destructive)
3. THE Button_Component SHALL maintain consistent 8px border radius across all button sizes (sm, md, lg)

### Requirement 2: Button Typography

**User Story:** As a user, I want button text to match ElevenLabs typography exactly, so that the visual hierarchy and readability are identical.

#### Acceptance Criteria

1. THE Button_Component SHALL use 13px font size for all button variants
2. THE Button_Component SHALL use font-weight 500 (medium) for button text
3. THE Button_Component SHALL use 20px line height for button text
4. THE Button_Component SHALL use Inter font family for button text

### Requirement 3: Button Sizing and Spacing

**User Story:** As a user, I want buttons to have the exact same dimensions and padding as ElevenLabs, so that the layout and spacing are pixel-perfect.

#### Acceptance Criteria

1. WHEN THE Button_Component renders with size "sm", THE Button_Component SHALL have 32px height and 10px horizontal padding
2. WHEN THE Button_Component renders with size "md", THE Button_Component SHALL have 36px height and 12px horizontal padding
3. WHEN THE Button_Component renders with size "lg", THE Button_Component SHALL have 40px height and 16px horizontal padding
4. THE Button_Component SHALL maintain 0px vertical padding (height controlled by height property)

### Requirement 4: Button Color Variants

**User Story:** As a user, I want button colors to match ElevenLabs exactly, so that the visual design is consistent with the reference.

#### Acceptance Criteria

1. WHEN THE Button_Component renders with variant "secondary", THE Button_Component SHALL have white background (rgb(255, 255, 255)) and 1px solid border with rgba(0, 0, 29, 0.1) color
2. WHEN THE Button_Component renders with variant "ghost", THE Button_Component SHALL have transparent background and no border
3. WHEN THE Button_Component renders with variant "primary", THE Button_Component SHALL maintain black background (rgb(0, 0, 0)) and white text
4. THE Button_Component SHALL use rgb(15, 15, 16) for text color on secondary and ghost variants

### Requirement 5: Button Transitions

**User Story:** As a user, I want button hover and active states to have smooth transitions matching ElevenLabs, so that interactions feel polished.

#### Acceptance Criteria

1. THE Button_Component SHALL use 75ms transition duration (0.075s) for all state changes
2. THE Button_Component SHALL use cubic-bezier(0.4, 0, 0.2, 1) easing function for transitions
3. THE Button_Component SHALL transition color, background-color, and border-color properties
4. THE Button_Component SHALL remove scale transforms on hover (no scale-[1.02] effect)

### Requirement 6: Upload Page Button Integration

**User Story:** As a user, I want the Upload page buttons to use the updated button styling, so that the entire page matches the ElevenLabs design.

#### Acceptance Criteria

1. THE Upload_Page SHALL update the "Upload and Process" button to use size "md" instead of "lg"
2. THE Upload_Page SHALL ensure all buttons use the updated Button_Component styling
3. THE Upload_Page SHALL maintain existing button functionality and accessibility features
