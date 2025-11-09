/**
 * Automated Page Testing Script
 * Tests all Grade 9 pages by reading JSON answers and interacting with exercises
 */

const fs = require('fs');
const path = require('path');

// Exercise data mapped from JSON files
const testData = {
  'g9-vocab-city-life': {
    url: 'http://localhost:5502/pages/g9-vocab-city-life.html?test=true',
    dataFile: './data/g9-vocab-city-life.json',
    totalQuestions: 60
  },
  'g9-unit-1-local-community': {
    url: 'http://localhost:5502/pages/g9-unit-1-local-community.html?test=true',
    dataFile: './data/g9-unit-1-local-community.json',
    totalQuestions: 30
  }
  // Add more units...
};

/**
 * Inject this function into the browser to answer questions automatically
 */
const autoAnswerScript = (exerciseData) => `
(async () => {
  const exercises = ${JSON.stringify(exerciseData)};
  let results = {passed: 0, failed: 0, score: 0};

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    await new Promise(r => setTimeout(r, 800));

    try {
      if (ex.type === 'multiple-choice') {
        const labels = document.querySelectorAll('label');
        if (labels[ex.correctIndex]) {
          labels[ex.correctIndex].click();
          await new Promise(r => setTimeout(r, 300));

          const submitBtn = document.querySelector('.btn--primary');
          if (submitBtn && submitBtn.textContent.includes('Nộp')) {
            submitBtn.click();
            results.passed++;
          }
        }
      } else if (ex.type === 'fill-blank') {
        const input = document.querySelector('input[type="text"]');
        if (input) {
          input.value = ex.answer;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise(r => setTimeout(r, 300));

          const submitBtn = document.querySelector('.btn--primary');
          if (submitBtn) {
            submitBtn.click();
            results.passed++;
          }
        }
      }

      // Wait for feedback
      await new Promise(r => setTimeout(r, 800));

      // Check score
      const scoreEl = document.getElementById('current-score');
      if (scoreEl) {
        results.score = parseInt(scoreEl.textContent.match(/\\d+/)[0]);
      }

      // Click next button
      const buttons = document.querySelectorAll('button');
      const nextBtn = Array.from(buttons).find(b =>
        b.textContent.includes('tiếp theo') || b.textContent.includes('Next')
      );
      if (nextBtn) {
        nextBtn.click();
        await new Promise(r => setTimeout(r, 500));
      }

    } catch (e) {
      results.failed++;
      console.error('Error on question', i+1, e);
    }
  }

  return results;
})()
`;

// Log test results
console.log('📝 Automated Testing Script Created');
console.log('Use Puppeteer MCP tools to run this test:');
console.log('1. Navigate to page with ?test=true');
console.log('2. Execute autoAnswerScript with exercise data');
console.log('3. Verify final score matches expected');
