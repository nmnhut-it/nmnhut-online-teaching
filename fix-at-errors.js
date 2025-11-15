const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'output', 'sets', 'set-07.json');

// Read the file
console.log('Reading file:', FILE_PATH);
const fileContent = fs.readFileSync(FILE_PATH, 'utf8');

// Fix "at" followed by digit without space (e.g., "at6" -> "at 6")
const fixedContent = fileContent.replace(/at(\d)/g, 'at $1');

// Count the number of fixes
const matches = fileContent.match(/at(\d)/g);
const fixCount = matches ? matches.length : 0;

console.log(`Found and fixed ${fixCount} error(s):`);
if (matches) {
  matches.forEach(match => console.log(`  - "${match}" -> "${match.replace(/at(\d)/, 'at $1')}"`));
}

// Write the fixed content back
fs.writeFileSync(FILE_PATH, fixedContent, 'utf8');
console.log('\nFile updated successfully!');
