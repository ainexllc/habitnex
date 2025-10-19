# Theme Testing Suite

This directory contains comprehensive tests for the HabitNex application's light/dark theme system.

## Test Files

### `theme-consistency.spec.ts`
Main theme testing suite covering:
- **Basic Theme Functionality**: Toggle, persistence, variables
- **Public Pages**: Homepage, login, signup, forgot password
- **Authenticated Pages**: Dashboard, habits, moods, profile, settings
- **Form Elements**: Habit creation, mood entry, form validation
- **Modal Theme Consistency**: Habit modals, family member modals
- **Navigation Elements**: Header, theme toggle, links
- **Theme Flash Prevention**: No white/black flashing during switches
- **Theme Synchronization**: Firebase sync, logout/login cycles
- **Responsive Testing**: Desktop, tablet, mobile viewports

### `visual-regression.spec.ts`
Visual testing suite with screenshots for:
- **Page Screenshots**: All pages in both light/dark themes
- **Component Screenshots**: Individual components (habit cards, forms, navigation)
- **Modal Screenshots**: All modal dialogs in both themes
- **Form State Screenshots**: Validation states, focus states
- **Interactive State Screenshots**: Button hover states, loading states
- **Responsive Screenshots**: Multiple viewport sizes

### `../helpers/theme-helpers.ts`
Utility functions for theme testing:
- `setTheme(page, theme)`: Switch between light/dark themes
- `verifyThemeConsistency(page, theme)`: Verify theme is properly applied
- `checkColorContrast(element)`: Verify accessibility color contrast
- `testThemePersistence()`: Test theme persistence across navigation
- `testModalTheme()`: Test modal theme consistency
- `takeThemedScreenshot()`: Capture screenshots for visual regression

## Usage

### Run All Theme Tests
```bash
npm run test:theme
```

### Run Specific Test Suites
```bash
# Theme consistency only
npm run test:theme:consistency

# Visual regression only  
npm run test:theme:visual
```

### Run Individual Test Groups
```bash
# Basic functionality tests
npx playwright test tests/theme/theme-consistency.spec.ts --grep "Basic Theme Functionality"

# Public pages tests
npx playwright test tests/theme/theme-consistency.spec.ts --grep "Public Pages"

# Modal tests
npx playwright test tests/theme/theme-consistency.spec.ts --grep "Modal Theme Consistency"

# Visual regression for authenticated pages
npx playwright test tests/theme/visual-regression.spec.ts --grep "Authenticated Pages Screenshots"
```

## Test Coverage

### Pages Tested
- **Public**: `/`, `/login`, `/signup`, `/forgot-password`
- **Authenticated**: `/?tab=overview`, `/?tab=overview`, `/habits`, `/habits/new`, `/moods`, `/moods/new`, `/profile`, `/settings`

### Components Tested  
- Forms (habit creation, mood entry)
- Navigation (header, theme toggle)
- Modals (habit edit, family member management)
- Cards (habit cards, mood cards)
- Interactive elements (buttons, inputs, links)

### Themes Tested
- Light theme consistency
- Dark theme consistency
- Theme switching functionality
- Theme persistence (localStorage + Firebase)
- Theme synchronization across devices

### Accessibility Testing
- Color contrast ratios (WCAG compliance)
- Focus state visibility
- Interactive element contrast
- Text readability in both themes

### Visual Regression
- Screenshots in both themes for all pages
- Component-level visual testing
- Responsive design testing (desktop, tablet, mobile)
- Modal and form state capture

## Screenshots

Screenshots are saved to `tests/screenshots/` with naming convention:
- `theme-{light|dark}-{component-name}.png`
- `theme-{light|dark}-{page-name}-{viewport}.png`

## Configuration

The test suite uses the existing Playwright configuration with:
- Multiple browsers (Chromium, Firefox, WebKit)
- Mobile device testing (iPhone, Android)
- Automatic retry on CI
- Video recording on failures
- Screenshot capture on failures

## Notes

- Tests require the development server to be running (`npm run dev`)
- Some tests require authentication (uses test user from `helpers/auth.ts`)
- Visual regression tests create baseline screenshots on first run
- Tests are designed to be run in parallel safely