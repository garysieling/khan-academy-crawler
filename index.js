const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./topics.json'));
fs.writeFileSync('topics_formatted.json', JSON.stringify(data, null, 2));
