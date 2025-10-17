<template>
  <button
    ref="toggleButtonRef"
    :class="[
      'sidebar-toggle',
      `sidebar-toggle--${position}`,
      { 'sidebar-toggle--collapsed': collapsed }
    ]"
    :aria-expanded="!collapsed"
    :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
    :aria-controls="ariaControls"
    type="button"
    @click="handleToggle"
    @keydown.enter.prevent="handleToggle"
    @keydown.space.prevent="handleToggle"
  >
    <!-- Icon container with animation -->
    <span class="sidebar-toggle__icon" :class="{ 'sidebar-toggle__icon--collapsed': collapsed }">
      <!-- Hamburger/Menu icon (shown when collapsed) -->
      <svg
        v-if="collapsed"
        class="sidebar-toggle__svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M3 5h14M3 10h14M3 15h14"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      
      <!-- Collapse icon (shown when expanded) -->
      <svg
        v-else
        class="sidebar-toggle__svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M13 3L7 10L13 17"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>

    <!-- Tooltip (shown on hover/focus when collapsed) -->
    <span
      v-if="showTooltip && collapsed"
      class="sidebar-toggle__tooltip"
      role="tooltip"
    >
      {{ tooltipText }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

/**
 * Component props
 */
interface Props {
  collapsed: boolean
  position?: 'sidebar' | 'header'
  ariaControls?: string
  tooltipText?: string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'sidebar',
  ariaControls: 'main-sidebar',
  tooltipText: 'Expand sidebar',
})

/**
 * Component emits
 */
const emit = defineEmits<{
  toggle: []
}>()

/**
 * Template refs
 */
const toggleButtonRef = ref<HTMLButtonElement | null>(null)

/**
 * Show tooltip on hover/focus
 */
const showTooltip = ref(false)

/**
 * Handle toggle action
 */
const handleToggle = () => {
  emit('toggle')
}

/**
 * Expose button ref for parent components
 */
defineExpose({
  toggleButtonRef,
  focus: () => toggleButtonRef.value?.focus(),
})
</script>

<style scoped>
.sidebar-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #6B7280;
  cursor: pointer;
  transition: all 150ms ease-out;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background: #F5F5F5;
  color: #000000;
}

.sidebar-toggle:active {
  background: #E5E7EB;
  transform: scale(0.95);
}

.sidebar-toggle:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Position variants */
.sidebar-toggle--sidebar {
  margin: 8px;
}

.sidebar-toggle--header {
  margin: 0;
}

/* Icon animation */
.sidebar-toggle__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: transform 200ms ease-out;
}

.sidebar-toggle__icon--collapsed {
  transform: rotate(0deg);
}

.sidebar-toggle__svg {
  width: 20px;
  height: 20px;
  transition: opacity 150ms ease-out;
}

/* Tooltip */
.sidebar-toggle__tooltip {
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 12px;
  background: #1F2937;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 150ms ease-out;
  z-index: 1000;
}

.sidebar-toggle:hover .sidebar-toggle__tooltip,
.sidebar-toggle:focus-visible .sidebar-toggle__tooltip {
  opacity: 1;
}

/* Tooltip arrow */
.sidebar-toggle__tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 4px solid transparent;
  border-right-color: #1F2937;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .sidebar-toggle,
  .sidebar-toggle__icon,
  .sidebar-toggle__svg,
  .sidebar-toggle__tooltip {
    transition: none;
  }

  .sidebar-toggle:active {
    transform: none;
  }
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .sidebar-toggle {
    width: 44px;
    height: 44px;
  }

  .sidebar-toggle__icon {
    width: 24px;
    height: 24px;
  }

  .sidebar-toggle__svg {
    width: 24px;
    height: 24px;
  }

  /* Hide tooltip on mobile */
  .sidebar-toggle__tooltip {
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .sidebar-toggle {
    border: 1px solid currentColor;
  }

  .sidebar-toggle:focus-visible {
    outline-width: 3px;
  }
}
</style>
