# Student Tracking & Sharing System - User Guide

## Overview

The Student Tracking & Sharing System allows teachers to share wordlists with students for practice, track individual student mistakes, and generate targeted practice questions based on common errors. Students can practice without creating accounts, and teachers get valuable insights into learning patterns.

## Table of Contents

- [For Teachers](#for-teachers)
  - [Sharing a Wordlist](#sharing-a-wordlist)
  - [Viewing Practice Statistics](#viewing-practice-statistics)
  - [Generating Targeted Questions](#generating-targeted-questions)
  - [Managing Shared Wordlists](#managing-shared-wordlists)
- [For Students](#for-students)
  - [Accessing a Shared Wordlist](#accessing-a-shared-wordlist)
  - [Entering Your Nickname](#entering-your-nickname)
  - [Practicing with Questions](#practicing-with-questions)
  - [Viewing Your Progress](#viewing-your-progress)
- [Privacy & Data](#privacy--data)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## For Teachers

### Sharing a Wordlist

#### Step 1: Enable Sharing

1. Navigate to **Saved Wordlists** page
2. Find the wordlist you want to share
3. Click the **"Enable Sharing"** button on the wordlist card
4. A unique share link will be generated automatically

#### Step 2: Copy and Share the Link

1. Once sharing is enabled, you'll see a share URL input field
2. Click the **Copy** button (📋 icon) to copy the link to your clipboard
3. Share this link with your students via:
   - Email
   - Learning management system (LMS)
   - Messaging apps
   - QR code (use any QR code generator with the URL)

**Example Share URL:**
```
https://vocabgo.app/practice/abc123xyz789
```

#### Step 3: Monitor Student Activity

1. Click **"View Stats"** button on the shared wordlist
2. You'll be taken to the Practice Dashboard with real-time data

### Viewing Practice Statistics

The Practice Dashboard provides comprehensive insights into student performance.

#### Dashboard Overview

**Stats Cards** (Top of page):
- **Total Students**: Number of unique students who practiced
- **Practice Sessions**: Total number of practice attempts
- **Average Mistakes**: Average mistakes per student

#### Most Challenging Words

This section shows aggregate data across all students:

- **Word & Translation**: The vocabulary pair
- **Difficulty Bar**: Visual representation of mistake frequency
- **Student Count**: How many students struggled with this word
- **Total Mistakes**: Combined mistake count across all students

**Sorting**: Click column headers to sort by difficulty, student count, or alphabetically.

#### Individual Student Performance

Expand any student's row to see:
- Student nickname
- Last active timestamp
- Total mistakes
- Top mistakes with counts

**Anonymous Mode**: If enabled, students appear as "Student 1", "Student 2", etc.

#### Filtering Options

- **Date Range**: Filter by "Last 7 days", "Last 30 days", or "All time"
- **Student Filter**: Search for specific students by nickname
- **Word Filter**: Search for specific words

### Generating Targeted Questions

Create practice questions focused on the most commonly missed words:

1. On the Practice Dashboard, click **"Generate Questions"** button
2. The system will:
   - Identify the top 10 most-missed words
   - Generate new practice questions targeting those words
   - Use various question types (multiple choice, fill-in-blank, matching)
3. Questions are automatically saved and ready for students to practice

**Tip**: Generate new questions weekly to keep practice fresh and targeted.

### Managing Shared Wordlists

#### Disabling Sharing

1. Go to **Saved Wordlists** page
2. Find the shared wordlist
3. Click **"Disable"** button
4. The share link will stop working immediately
5. Existing practice data is preserved

**Note**: Students currently practicing will finish their session, but new students cannot access the wordlist.

#### Exporting Data

1. On the Practice Dashboard, click **"Export CSV"** button
2. Download includes:
   - Student nicknames (or anonymous IDs)
   - Individual mistake breakdowns
   - Aggregate statistics
   - Timestamps

**Use cases**: Grade books, progress reports, parent communications

#### Clearing Practice Data

To remove all practice data for a wordlist:

1. Disable sharing first
2. Contact support or use the admin panel (if available)
3. All student sessions and mistakes will be permanently deleted

**Warning**: This action cannot be undone.

---

## For Students

### Accessing a Shared Wordlist

1. Your teacher will provide a share link
2. Click the link or paste it into your browser
3. The link looks like: `https://vocabgo.app/practice/abc123xyz789`
4. You'll be taken to the practice entry page

**No account needed!** You can start practicing immediately.

### Entering Your Nickname

#### First Visit

1. A welcome modal will appear asking for your name
2. Enter your nickname (2-20 characters)
   - Use your real name, initials, or a nickname
   - Unicode characters supported (中文, emoji, etc.)
   - Examples: "小明", "Amy", "Student_123"
3. Click **"Start Practicing"**

**Privacy Note**: Your nickname will be visible to your teacher but not to other students.

#### Returning Visits

Your nickname is saved in your browser, so you won't need to enter it again on the same device.

**Changing Your Nickname**: Clear your browser data or use a different browser/device to enter a new nickname.

### Practicing with Questions

#### Question Types

You'll encounter three types of questions:

1. **Multiple Choice**
   - Read the English word
   - Select the correct Chinese translation
   - 4 options provided

2. **Fill in the Blank**
   - See the Chinese translation
   - Type the English word
   - Spelling must be exact

3. **Matching**
   - Drag English words to match Chinese translations
   - Match all pairs correctly

#### Answering Questions

1. Read the question carefully
2. Select or type your answer
3. Click **"Submit"** or press Enter
4. Immediate feedback shows if you're correct
5. If wrong, the correct answer is displayed
6. Click **"Next"** to continue

**Tip**: Take your time! Accuracy is more important than speed.

### Viewing Your Progress

#### Progress Indicator

At the top of the practice page:
- **Current Question**: "5 / 20"
- **Completion Percentage**: Visual progress bar

#### Your Mistakes Section

Expand the **"Your Mistakes"** accordion to see:
- Words you got wrong
- How many times you missed each word
- Helps you identify what to review

**Privacy**: Only you and your teacher can see your mistakes.

---

## Privacy & Data

### What Data is Collected?

**From Students**:
- Self-provided nickname
- Device information (browser type, screen size, timezone)
- Practice answers and mistakes
- Timestamps of practice sessions

**NOT Collected**:
- Email addresses
- Phone numbers
- Passwords
- Personal identification numbers
- Location data (beyond timezone)

### How is Data Used?

- **Teachers**: View aggregate and individual student performance
- **Students**: Track personal progress
- **System**: Generate targeted practice questions

### Data Retention

- **Active Sessions**: Data retained while wordlist is shared
- **Inactive Sessions**: Automatically deleted after **90 days** of no activity
- **Deleted Wordlists**: Practice data is preserved for 90 days, then deleted

### Anonymous Mode

Teachers can enable **Anonymous Mode** for privacy:
- Student nicknames are hidden
- Students appear as "Student 1", "Student 2", etc.
- Mistake data is still tracked
- Useful for sensitive classroom environments

### Student Rights

Students (or parents) can request:
- **Data Access**: View all stored data
- **Data Deletion**: Remove all practice data
- **Data Export**: Download practice history

**Contact your teacher** to initiate these requests.

### GDPR & COPPA Compliance

This system is designed to be:
- **GDPR Compliant**: Minimal data collection, clear consent, data portability
- **COPPA Friendly**: No personal information required, parental oversight via teachers

---

## Troubleshooting

### For Teachers

#### "Share link not working"

**Symptoms**: Students see "Invalid share token" error

**Solutions**:
1. Verify sharing is still enabled (check Saved Wordlists page)
2. Ensure the full URL was copied (including the token)
3. Try disabling and re-enabling sharing to generate a new link
4. Check if the wordlist was deleted

#### "No students showing up in dashboard"

**Symptoms**: Dashboard shows 0 students despite sharing link

**Solutions**:
1. Confirm students have actually accessed the link and practiced
2. Check date range filter (expand to "All time")
3. Verify students completed at least one question
4. Refresh the page to load latest data

#### "Dashboard loading slowly"

**Symptoms**: Stats take >5 seconds to load

**Solutions**:
1. Check your internet connection
2. Try a different browser
3. Clear browser cache
4. If 100+ students, expect 2-3 second load time (normal)
5. Contact support if consistently slow

#### "Export CSV not downloading"

**Symptoms**: Click Export but no file downloads

**Solutions**:
1. Check browser's download settings/permissions
2. Disable popup blockers temporarily
3. Try a different browser
4. Ensure you have practice data to export

### For Students

#### "Can't enter nickname"

**Symptoms**: Submit button disabled or error message

**Solutions**:
1. Ensure nickname is 2-20 characters long
2. Avoid special characters (use letters, numbers, spaces)
3. Try a simpler nickname (e.g., "Student1")
4. Clear browser cache and try again

#### "Share link says 'Invalid token'"

**Symptoms**: Error page when clicking teacher's link

**Solutions**:
1. Verify you copied the complete URL
2. Ask teacher to check if sharing is still enabled
3. Try opening link in a different browser
4. Ask teacher to generate a new share link

#### "My progress isn't saving"

**Symptoms**: Nickname prompt appears every time

**Solutions**:
1. Enable cookies in browser settings
2. Don't use private/incognito mode
3. Check if browser is clearing data on exit
4. Try a different browser
5. Use the same device consistently

#### "Questions not loading"

**Symptoms**: Blank screen or infinite loading

**Solutions**:
1. Refresh the page
2. Check internet connection
3. Try a different browser
4. Clear browser cache
5. Ensure JavaScript is enabled
6. Contact teacher if problem persists

#### "Can't submit answers"

**Symptoms**: Submit button not working

**Solutions**:
1. Ensure you've selected/typed an answer
2. For fill-in-blank, check spelling carefully
3. Try clicking directly on the button (not just pressing Enter)
4. Refresh the page and try again
5. Try a different browser

### General Issues

#### "Slow performance on mobile"

**Solutions**:
1. Close other apps/tabs
2. Ensure good internet connection (WiFi preferred)
3. Update browser to latest version
4. Clear browser cache
5. Restart device

#### "Page looks broken/misaligned"

**Solutions**:
1. Refresh the page (Ctrl+R or Cmd+R)
2. Clear browser cache
3. Try a different browser
4. Update browser to latest version
5. Check if browser zoom is set to 100%

---

## FAQ

### For Teachers

**Q: How many students can practice on one wordlist?**  
A: The system supports 1000+ students per wordlist with no performance degradation.

**Q: Can I share the same wordlist with multiple classes?**  
A: Yes! All students use the same share link. Use the dashboard filters to analyze by time period if needed.

**Q: Will students see each other's mistakes?**  
A: No. Students only see their own mistakes. Only teachers see all student data.

**Q: Can I edit a wordlist after sharing it?**  
A: Yes, but changes won't affect students currently practicing. They'll see updates on their next session.

**Q: How do I know if students are actually practicing?**  
A: Check the Practice Dashboard for real-time activity. The "Last Active" timestamp shows recent practice.

**Q: Can I share wordlists with parents?**  
A: The share link is for practice only. Export CSV data to share progress reports with parents.

**Q: What happens if I delete a shared wordlist?**  
A: The share link stops working immediately. Practice data is preserved for 90 days for reporting purposes.

**Q: Can I re-share a wordlist after disabling sharing?**  
A: Yes! Click "Enable Sharing" again. A new share link will be generated. Previous practice data is retained.

### For Students

**Q: Do I need to create an account?**  
A: No! Just enter a nickname and start practicing.

**Q: Can I practice on multiple devices?**  
A: Yes, but you'll need to enter your nickname on each device. Use the same nickname to keep data consistent.

**Q: Will my classmates see my mistakes?**  
A: No. Only you and your teacher can see your mistakes.

**Q: Can I practice the same wordlist multiple times?**  
A: Yes! Practice as many times as you want. Your teacher sees all attempts.

**Q: What if I get a question wrong?**  
A: You'll see the correct answer immediately. The mistake is recorded to help your teacher create better practice questions.

**Q: Can I skip questions?**  
A: Currently, no. Answer each question to proceed. If unsure, make your best guess!

**Q: How long does a practice session last?**  
A: As long as you need! There's no time limit. Take breaks if needed.

**Q: Can I review correct answers?**  
A: Currently, you only see feedback immediately after answering. Check the "Your Mistakes" section for words to review.

### Technical Questions

**Q: What browsers are supported?**  
A: Modern browsers: Chrome, Firefox, Safari, Edge (latest 2 versions). Mobile browsers also supported.

**Q: Does this work offline?**  
A: No. An internet connection is required for practice and data syncing.

**Q: Is my data secure?**  
A: Yes. Data is encrypted in transit (HTTPS) and at rest. We follow industry-standard security practices.

**Q: Can I use this on a school network?**  
A: Yes, but some school firewalls may block certain features. Contact your IT department if issues arise.

**Q: What if I find a bug?**  
A: Report bugs to your teacher or contact support with details (browser, device, steps to reproduce).

---

## Getting Help

### For Teachers

- **Email Support**: support@vocabgo.app
- **Documentation**: https://docs.vocabgo.app
- **Video Tutorials**: https://vocabgo.app/tutorials

### For Students

- **Ask Your Teacher**: They can help with most issues
- **Help Center**: https://help.vocabgo.app
- **Report a Problem**: Use the feedback button in the app

---

## Best Practices

### For Teachers

1. **Share Early**: Enable sharing before class so students can practice at home
2. **Check Weekly**: Review dashboard weekly to identify struggling students
3. **Generate Targeted Questions**: Use the "Generate Questions" feature monthly
4. **Communicate**: Let students know the share link and expectations
5. **Export Data**: Download CSV reports for record-keeping
6. **Privacy First**: Enable anonymous mode if working with sensitive populations

### For Students

1. **Use Your Real Name**: Makes it easier for teachers to help you
2. **Practice Regularly**: Short, frequent sessions are better than long cramming
3. **Review Mistakes**: Check "Your Mistakes" section to focus study time
4. **Ask Questions**: If you don't understand a word, ask your teacher
5. **Same Device**: Use the same device/browser for consistent progress tracking
6. **Take Your Time**: Accuracy matters more than speed

---

## Updates & Changes

**Version 1.0** (January 2025)
- Initial release
- Share wordlists with students
- Track individual mistakes
- Generate targeted questions
- Anonymous mode
- Export CSV data

**Planned Features**:
- Student progress charts
- Leaderboards (opt-in)
- Custom question generation
- Parent access portal
- Mobile app

---

## Glossary

- **Share Token**: Unique code in the share URL that identifies the wordlist
- **Session Token**: Browser-based identifier that tracks student practice
- **Nickname**: Student's self-provided name (2-20 characters)
- **Anonymous Mode**: Privacy setting that hides student nicknames
- **Practice Dashboard**: Teacher view showing student statistics
- **Mistake Tracking**: System that records incorrect answers
- **Targeted Questions**: Practice questions generated from common mistakes
- **Materialized View**: Database optimization for fast statistics loading

---

*Last Updated: January 2025*  
*For technical documentation, see DEVELOPER_GUIDE.md*
