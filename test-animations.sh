#!/bin/bash
echo "Running animation system tests..."
pnpm test src/utils/gpuAcceleration.test.ts
pnpm test src/utils/performanceMonitor.test.ts
pnpm test src/utils/animationQueue.test.ts
pnpm test src/utils/accessibilityAnnouncer.test.ts
pnpm test src/utils/staggerAnimation.test.ts
pnpm test src/composables/useMotionPreference.test.ts
pnpm test src/composables/usePageTransition.test.ts
pnpm test src/config/animations.test.ts
echo "All animation tests complete!"
