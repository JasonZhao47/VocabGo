import { ref, Ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { animationConfig } from '@/config/animations'
import { useMotionPreference } from './useMotionPreference'

interface DragDropAnimationOptions {
  onDrop?: (files: FileList) => void
  onDragEnter?: () => void
  onDragLeave?: () => void
  scaleOnDrag?: number
  highlightColor?: string
}

export function useDragDropAnimation(
  elementRef: Ref<HTMLElement | null>,
  options: DragDropAnimationOptions = {}
) {
  const {
    onDrop,
    onDragEnter,
    onDragLeave,
    scaleOnDrag = 1.02,
    highlightColor = '#000000'
  } = options

  const isDragging = ref(false)
  const { shouldAnimate, getDuration } = useMotionPreference()
  
  let dragCounter = 0 // Track nested drag events

  // Handle drag enter
  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    dragCounter++
    
    if (dragCounter === 1) {
      isDragging.value = true
      onDragEnter?.()
      
      if (shouldAnimate.value && elementRef.value) {
        // Scale up animation
        gsap.to(elementRef.value, {
          scale: scaleOnDrag,
          duration: getDuration(animationConfig.duration.fast) / 1000,
          ease: animationConfig.easing.easeOut
        })
        
        // Add subtle glow effect
        gsap.to(elementRef.value, {
          boxShadow: `0 0 0 2px ${highlightColor}`,
          duration: getDuration(animationConfig.duration.fast) / 1000,
          ease: animationConfig.easing.easeOut
        })
      }
    }
  }

  // Handle drag over
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  // Handle drag leave
  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    dragCounter--
    
    if (dragCounter === 0) {
      isDragging.value = false
      onDragLeave?.()
      
      if (shouldAnimate.value && elementRef.value) {
        // Scale back to normal
        gsap.to(elementRef.value, {
          scale: 1,
          duration: getDuration(animationConfig.duration.fast) / 1000,
          ease: animationConfig.easing.easeOut
        })
        
        // Remove glow effect
        gsap.to(elementRef.value, {
          boxShadow: 'none',
          duration: getDuration(animationConfig.duration.fast) / 1000,
          ease: animationConfig.easing.easeOut
        })
      }
    }
  }

  // Handle drop
  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    dragCounter = 0
    isDragging.value = false
    
    if (shouldAnimate.value && elementRef.value) {
      // Quick scale down then back to normal (drop feedback)
      gsap.timeline()
        .to(elementRef.value, {
          scale: 0.98,
          duration: getDuration(animationConfig.duration.fast) / 2000,
          ease: animationConfig.easing.easeIn
        })
        .to(elementRef.value, {
          scale: 1,
          duration: getDuration(animationConfig.duration.fast) / 1000,
          ease: animationConfig.easing.spring
        })
      
      // Remove glow effect
      gsap.to(elementRef.value, {
        boxShadow: 'none',
        duration: getDuration(animationConfig.duration.fast) / 1000,
        ease: animationConfig.easing.easeOut
      })
    }
    
    // Handle files
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      onDrop?.(files)
    }
  }

  // Attach event listeners
  onMounted(() => {
    if (!elementRef.value) return
    
    const element = elementRef.value
    element.addEventListener('dragenter', handleDragEnter as EventListener)
    element.addEventListener('dragover', handleDragOver as EventListener)
    element.addEventListener('dragleave', handleDragLeave as EventListener)
    element.addEventListener('drop', handleDrop as EventListener)
  })

  // Clean up event listeners
  onUnmounted(() => {
    if (!elementRef.value) return
    
    const element = elementRef.value
    element.removeEventListener('dragenter', handleDragEnter as EventListener)
    element.removeEventListener('dragover', handleDragOver as EventListener)
    element.removeEventListener('dragleave', handleDragLeave as EventListener)
    element.removeEventListener('drop', handleDrop as EventListener)
  })

  // Animate file being dragged (visual feedback)
  const animateFileDrag = (fileElement: HTMLElement) => {
    if (!shouldAnimate.value) return
    
    gsap.fromTo(
      fileElement,
      {
        opacity: 0,
        y: -20,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: getDuration(animationConfig.duration.normal) / 1000,
        ease: animationConfig.easing.spring
      }
    )
  }

  // Animate file removal
  const animateFileRemove = (fileElement: HTMLElement, onComplete?: () => void) => {
    if (!shouldAnimate.value) {
      onComplete?.()
      return
    }
    
    gsap.to(fileElement, {
      opacity: 0,
      x: 20,
      scale: 0.9,
      duration: getDuration(animationConfig.duration.fast) / 1000,
      ease: animationConfig.easing.easeIn,
      onComplete
    })
  }

  return {
    isDragging,
    animateFileDrag,
    animateFileRemove
  }
}
