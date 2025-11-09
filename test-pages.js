/**
 * Puppeteer Test Script for Grammar Pages
 * Tests all Grade 9 pages to ensure they load correctly
 *
 * Usage: node test-pages.js
 * Requires: npm install puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'file://' + path.resolve(__dirname).replace(/\\/g, '/');
const SCREENSHOT_DIR = './test-screenshots';
const TEST_TIMEOUT = 30000; // 30 seconds

// Pages to test
const PAGES_TO_TEST = [
  { path: 'grammar-g9.html', name: 'Grade 9 Index' },
  { path: 'pages/g9-unit-1-local-community.html', name: 'Unit 1 - Local Community' },
  { path: 'pages/g9-unit-2-city-life.html', name: 'Unit 2 - City Life' },
  { path: 'pages/g9-vocab-city-life.html', name: 'Vocabulary - City Life' },
  { path: 'pages/g9-unit-3-healthy-living.html', name: 'Unit 3 - Healthy Living' },
  { path: 'pages/g9-unit-4-remembering-the-past.html', name: 'Unit 4 - Remembering the Past' },
  { path: 'pages/g9-unit-5-our-experiences.html', name: 'Unit 5 - Our Experiences' },
  { path: 'pages/g9-unit-6-vietnamese-lifestyle.html', name: 'Unit 6 - Vietnamese Lifestyle' },
  { path: 'pages/g9-unit-7-natural-wonders.html', name: 'Unit 7 - Natural Wonders' },
  { path: 'pages/g9-unit-8-tourism.html', name: 'Unit 8 - Tourism' },
  { path: 'pages/g9-unit-9-world-englishes.html', name: 'Unit 9 - World Englishes' },
  { path: 'pages/g9-unit-10-planet-earth.html', name: 'Unit 10 - Planet Earth' },
  { path: 'pages/g9-unit-11-electronic-devices.html', name: 'Unit 11 - Electronic Devices' },
  { path: 'pages/g9-unit-12-career-choices.html', name: 'Unit 12 - Career Choices' }
];

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

/**
 * Create screenshot directory if it doesn't exist
 */
function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

/**
 * Test a single page
 */
async function testPage(browser, page, pageInfo) {
  const url = `${BASE_URL}/${pageInfo.path}?test=true`;
  const consoleMessages = [];
  const errors = [];

  console.log(`\n🔍 Testing: ${pageInfo.name}`);
  console.log(`   URL: ${url}`);

  try {
    // Collect console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });

      if (type === 'error') {
        console.log(`   ❌ Console Error: ${text}`);
        errors.push(text);
      }
    });

    // Collect page errors
    page.on('pageerror', error => {
      console.log(`   ❌ Page Error: ${error.message}`);
      errors.push(error.message);
    });

    // Navigate to page
    const response = await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: TEST_TIMEOUT
    });

    // Check HTTP status
    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }

    // Wait for key elements to load
    await page.waitForSelector('body', { timeout: 5000 });

    // Check for critical elements
    const checks = await page.evaluate(() => {
      return {
        hasTitle: !!document.querySelector('title'),
        hasHeader: !!document.querySelector('header, .game-header'),
        hasMainContent: !!document.querySelector('main, #exercise-container'),
        hasStyles: document.styleSheets.length > 0,
        bodyText: document.body.innerText.substring(0, 100)
      };
    });

    // Take screenshot
    const screenshotPath = path.join(
      SCREENSHOT_DIR,
      `${pageInfo.path.replace(/[\/\\]/g, '_').replace('.html', '')}.png`
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: false
    });

    // Validate results
    const issues = [];

    if (!checks.hasTitle) issues.push('Missing <title>');
    if (!checks.hasHeader) issues.push('Missing header');
    if (!checks.hasMainContent) issues.push('Missing main content');
    if (!checks.hasStyles) issues.push('No styles loaded');
    if (errors.length > 0) issues.push(`${errors.length} JavaScript errors`);

    if (issues.length === 0 && errors.length === 0) {
      console.log(`   ✅ PASSED - All checks successful`);
      results.passed.push(pageInfo.name);
    } else if (errors.length > 0) {
      console.log(`   ❌ FAILED - ${issues.join(', ')}`);
      results.failed.push({
        name: pageInfo.name,
        issues,
        errors
      });
    } else {
      console.log(`   ⚠️  WARNING - ${issues.join(', ')}`);
      results.warnings.push({
        name: pageInfo.name,
        issues
      });
    }

  } catch (error) {
    console.log(`   ❌ FAILED - ${error.message}`);
    results.failed.push({
      name: pageInfo.name,
      issues: [error.message],
      errors: []
    });
  }
}

/**
 * Generate test report
 */
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST REPORT');
  console.log('='.repeat(60));

  const total = PAGES_TO_TEST.length;
  const passed = results.passed.length;
  const warnings = results.warnings.length;
  const failed = results.failed.length;

  console.log(`\n✅ Passed:  ${passed}/${total}`);
  console.log(`⚠️  Warnings: ${warnings}/${total}`);
  console.log(`❌ Failed:  ${failed}/${total}`);

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(item => {
      console.log(`   - ${item.name}`);
      item.issues.forEach(issue => {
        console.log(`     • ${issue}`);
      });
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ FAILURES:');
    results.failed.forEach(item => {
      console.log(`   - ${item.name}`);
      item.issues.forEach(issue => {
        console.log(`     • ${issue}`);
      });
      if (item.errors.length > 0) {
        console.log(`     Errors:`);
        item.errors.forEach(err => {
          console.log(`       - ${err}`);
        });
      }
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}/`);
  console.log('='.repeat(60) + '\n');

  return failed === 0;
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting Puppeteer Page Tests');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Pages to test: ${PAGES_TO_TEST.length}`);

  ensureScreenshotDir();

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Test each page
    for (const pageInfo of PAGES_TO_TEST) {
      await testPage(browser, page, pageInfo);
    }

    await browser.close();

    // Generate report
    const success = generateReport();

    // Exit with appropriate code
    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

// Run tests
runTests();
