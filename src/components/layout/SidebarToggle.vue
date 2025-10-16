<template>
  <button
    class="sidebar-toggle"
    :class="{ 'sidebar-toggle--open': isOpen }"
    :aria-label="isOpen ? 'Close navigation menu' : 'Open navigation menu'"
    :aria-expanded="isOpen"
    @click="$emit('toggle')"
  >
    <span class="sidebar-toggle__line"></span>
    <span class="sidebar-toggle__line"></span>
    <span class="sidebar-toggle__line"></span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  isOpen?: boolean
}

withDefaults(defineProps<Props>(), {
  isOpen: false,
})

defineEmits<{
  toggle: []
}>()
</script>

<style scoped>
.sidebar-toggle {
  display: none;
  width: 44px;
  height: 44px;
  padding: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 101;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
  transition: background 150ms ease-out;
}

.sidebar-toggle:hover {
  background: #F5F5F5;
}

.sidebar-toggle:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

.sidebar-toggle__line {
  display: block;
  width: 24px;
  height: 2px;
  background: #374151;
  border-radius: 2px;
  transition: all 200ms ease-out;
  transform-origin: center;
}

/* Animated hamburger to X */
.sidebar-toggle--open .sidebar-toggle__line:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.sidebar-toggle--open .sidebar-toggle__line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.sidebar-toggle--open .sidebar-toggle__line:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* Show on mobile only */
@media (max-width: 767px) {
  .sidebar-toggle {
    display: flex;
  }
}
</style>
