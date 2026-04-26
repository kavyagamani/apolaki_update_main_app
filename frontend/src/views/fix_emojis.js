const fs = require('fs');

let content = fs.readFileSync('Dashboard.vue', 'utf-8');

// Replace Monthly Savings icon with 💵
content = content.replace(
  /(<span class="savings-icon">)[^<]*(?=<\/span>\s*<div>\s*<p class="savings-value">\{\{.*?monthlySavingsLocal/s,
  '$1💵'
);

// Replace Yearly Savings icon with 💰
content = content.replace(
  /(<span class="savings-icon">)[^<]*(?=<\/span>\s*<div>\s*<p class="savings-value">\{\{.*?yearlySavingsLocal/s,
  '$1💰'
);

fs.writeFileSync('Dashboard.vue', content, 'utf-8');
console.log('Fixed emojis!');
