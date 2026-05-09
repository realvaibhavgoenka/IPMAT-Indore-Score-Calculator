const fs = require('fs');
const html = fs.readFileSync('data.html', 'utf8');
fs.writeFileSync('preview.txt', html.substring(0, 1000));
