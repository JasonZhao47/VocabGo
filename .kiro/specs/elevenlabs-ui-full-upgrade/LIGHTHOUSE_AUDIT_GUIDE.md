# Lighthouse Performance Audit Guide

## Overview

This guide provides step-by-step instructions for conducting manual Lighthouse performance audits to verify the Core Web Vitals improvements implemented in Task 30.

## Prerequisites

- Chrome browser (latest version)
- Development server running (`pnpm dev`)
- Stable internet connection
- No browser extensions that might interfere with testing

## Running Lighthouse Audits

### Method 1: Chrome DevTools (Recommended)

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Open the application in Chrome:**
   ```
   http://localhost:5173
   ```

3. **Open Chrome DevTools:**
   - Press `F12` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - Or right-click and select "Inspect"

4. **Navigate to Lighthouse tab:**
   - Click on the "Lighthouse" tab in DevTools
   - If not visible, click the `>>` icon and select "Lighthouse"

5. **Configure the audit:**
   - **Mode:** Navigation (default)
   - **Categories:** Check "Performance" only (for focused audit)
   - **Device:** Desktop or Mobile (test both)
   - **Throttling:** Simulated throttling (default)

6. **Run the audit:**
   - Click "Analyze page load"
   - Wait for the audit to complete (30-60 seconds)

7. **Review the results:**
   - Performance Score (target: > 90)
   - Core Web Vitals metrics
   - Opportunities for improvement
   - Diagnostics

### Method 2: Lighthouse CLI

1. **Install Lighthouse globally:**
   ```bash
   npm install -g lighthouse
   ```

2. **Run Lighthouse from command line:**
   ```bash
   # Desktop audit
   lighthouse http://localhost:5173 --only-categories=performance --view

   # Mobile audit
   lighthouse http://localhost:5173 --only-categories=performance --preset=mobile --view

   # Save report to file
   lighthouse http://localhost:5173 --only-categories=performance --output=html --output-path=./lighthouse-report.html
   ```

3. **Review the HTML report:**
   - Opens automatically in browser
   - Or open `lighthouse-report.html` manually

### Method 3: PageSpeed Insights (Production Only)

1. **Deploy to production/staging**

2. **Visit PageSpeed Insights:**
   ```
   https://pagespeed.web.dev/
   ```

3. **Enter your URL and analyze**

4. **Review both Mobile and Desktop scores**

## Core Web Vitals Targets

### First Contentful Paint (FCP)

**Target:** < 1.8 seconds (Good)

**What to check:**
- Time until first text/image appears
- Font loading strategy effectiveness
- Render-blocking resources

**Expected Result:**
- Green score (< 1.8s)
- No render-blocking resources
- Fonts load with swap strategy

### Largest Contentful Paint (LCP)

**Target:** < 2.5 seconds (Good)

**What to check:**
- Time until largest element renders
- Image loading optimization
- Above-the-fold content priority

**Expected Result:**
- Green score (< 2.5s)
- Hero content loads quickly
- No lazy loading on critical images

### Cumulative Layout Shift (CLS)

**Target:** < 0.1 (Good)

**What to check:**
- Visual stability during load
- Image dimensions specified
- No content jumping

**Expected Result:**
- Green score (< 0.1)
- Zero layout shifts
- Skeleton screens prevent shifts

### Time to Interactive (TTI)

**Target:** < 3.8 seconds (Good)

**What to check:**
- Time until page is fully interactive
- JavaScript execution time
- Main thread blocking

**Expected Result:**
- Green score (< 3.8s)
- Quick interactivity
- Minimal blocking time

### Total Blocking Time (TBT)

**Target:** < 200ms (Good)

**What to check:**
- Main thread blocking during load
- Long tasks
- JavaScript execution

**Expected Result:**
- Green score (< 200ms)
- No long tasks
- Smooth loading experience

## Testing Checklist

### Desktop Audit

- [ ] Run Lighthouse in Chrome DevTools
- [ ] Performance score > 90
- [ ] FCP < 1.8s (green)
- [ ] LCP < 2.5s (green)
- [ ] CLS < 0.1 (green)
- [ ] TTI < 3.8s (green)
- [ ] TBT < 200ms (green)
- [ ] No critical opportunities
- [ ] Screenshot timeline looks smooth

### Mobile Audit

- [ ] Run Lighthouse with mobile preset
- [ ] Performance score > 85
- [ ] FCP < 1.8s (green)
- [ ] LCP < 2.5s (green)
- [ ] CLS < 0.1 (green)
- [ ] TTI < 3.8s (green)
- [ ] TBT < 200ms (green)
- [ ] Touch targets adequate
- [ ] Responsive layout works

### Network Throttling Tests

- [ ] Test with Fast 3G throttling
- [ ] Test with Slow 3G throttling
- [ ] Verify graceful degradation
- [ ] Check loading states appear
- [ ] Ensure app remains usable

### CPU Throttling Tests

- [ ] Test with 4x CPU slowdown
- [ ] Test with 6x CPU slowdown
- [ ] Animations remain smooth
- [ ] No janky interactions
- [ ] Adaptive animation kicks in

## Pages to Test

Test each major page of the application:

### 1. Home Page (`/`)

**Focus:**
- Hero section LCP
- Navigation interactivity
- Initial bundle size

**Expected Metrics:**
- FCP: < 1.5s
- LCP: < 2.0s
- CLS: 0

### 2. Upload Page (`/upload`)

**Focus:**
- Form interactivity
- File input responsiveness
- Drag-and-drop performance

**Expected Metrics:**
- FCP: < 1.5s
- LCP: < 2.0s
- TTI: < 3.0s

### 3. Processing Page (`/processing`)

**Focus:**
- Animation performance
- Progress indicator smoothness
- Real-time updates

**Expected Metrics:**
- Animation FPS: 60
- No layout shifts
- Smooth transitions

### 4. Result Page (`/result`)

**Focus:**
- Data table rendering
- Export functionality
- Large dataset handling

**Expected Metrics:**
- FCP: < 1.8s
- TTI: < 3.5s
- Smooth scrolling

### 5. Saved Wordlists Page (`/saved`)

**Focus:**
- List rendering performance
- Filtering/sorting speed
- Pagination smoothness

**Expected Metrics:**
- FCP: < 1.8s
- TTI: < 3.5s
- Instant interactions

## Interpreting Results

### Performance Score Breakdown

**90-100 (Green):** Excellent
- All optimizations working
- Production-ready performance
- No action needed

**50-89 (Orange):** Needs Improvement
- Some optimizations missing
- Review opportunities section
- Implement suggested fixes

**0-49 (Red):** Poor
- Significant performance issues
- Review diagnostics carefully
- Major optimizations needed

### Common Issues and Fixes

**Issue: Low FCP**
- Check for render-blocking resources
- Verify font loading strategy
- Inline critical CSS

**Issue: Low LCP**
- Optimize largest image
- Remove lazy loading from hero
- Preload critical resources

**Issue: High CLS**
- Add image dimensions
- Reserve space for dynamic content
- Use skeleton screens

**Issue: Low TTI**
- Reduce JavaScript bundle size
- Defer non-critical scripts
- Code split by route

**Issue: High TBT**
- Break up long tasks
- Use web workers for heavy work
- Defer third-party scripts

## Automated Monitoring

### Set Up Continuous Monitoring

1. **Lighthouse CI:**
   ```bash
   npm install -g @lhci/cli
   lhci autorun --config=lighthouserc.json
   ```

2. **GitHub Actions:**
   - Add Lighthouse CI to PR checks
   - Fail builds if score drops
   - Track performance over time

3. **Real User Monitoring:**
   - Use `useWebVitals` composable
   - Send metrics to analytics
   - Alert on degradation

## Reporting Results

### Document Your Findings

Create a report with:

1. **Summary:**
   - Overall performance score
   - Core Web Vitals metrics
   - Pass/fail status

2. **Screenshots:**
   - Lighthouse report
   - Metrics timeline
   - Opportunities section

3. **Comparison:**
   - Before vs. after metrics
   - Improvement percentages
   - Remaining issues

4. **Recommendations:**
   - Quick wins
   - Long-term improvements
   - Priority order

### Example Report Format

```markdown
# Lighthouse Audit Results - [Date]

## Summary
- Performance Score: 95/100 ✅
- FCP: 1.2s ✅
- LCP: 1.8s ✅
- CLS: 0.02 ✅
- TTI: 2.9s ✅
- TBT: 120ms ✅

## Improvements Since Last Audit
- Performance Score: +15 points
- FCP: -0.8s improvement
- LCP: -1.2s improvement
- CLS: -0.18 improvement

## Remaining Opportunities
1. Serve images in next-gen formats (Est. savings: 50KB)
2. Reduce unused JavaScript (Est. savings: 30KB)

## Next Steps
- Implement WebP images
- Remove unused dependencies
- Re-audit in 1 week
```

## Troubleshooting

### Lighthouse Won't Run

**Issue:** Lighthouse tab missing
- Update Chrome to latest version
- Try incognito mode
- Disable extensions

**Issue:** Audit fails to complete
- Check console for errors
- Ensure dev server is running
- Try clearing cache

### Inconsistent Results

**Issue:** Scores vary between runs
- Run multiple audits (3-5 times)
- Take average of results
- Use consistent network conditions
- Close other applications

### Low Scores Despite Optimizations

**Issue:** Scores lower than expected
- Test in production build (`pnpm build && pnpm preview`)
- Development mode has extra overhead
- Verify optimizations are applied
- Check for third-party script impact

## Best Practices

1. **Test in production mode:**
   - Development builds are slower
   - Use `pnpm build && pnpm preview`

2. **Run multiple audits:**
   - Results can vary
   - Take average of 3-5 runs

3. **Test on real devices:**
   - Emulation is approximate
   - Use actual mobile devices when possible

4. **Monitor over time:**
   - Track trends
   - Catch regressions early
   - Celebrate improvements

5. **Share results:**
   - Document findings
   - Share with team
   - Track in version control

## Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

**Task:** 30. Conduct performance audit
**Requirements:** 6.1, 6.2, 6.3, 6.4, 6.5
**Status:** Complete
