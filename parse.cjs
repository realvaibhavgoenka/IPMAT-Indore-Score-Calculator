const fs = require('fs');
const html = fs.readFileSync('data.html', 'utf8');
const panels = html.split(/Question ID|Q\. Id/i);
if (panels.length > 1) {
    fs.writeFileSync('panel1.txt', panels[0] + "\n\n----- END 0, START 1 -----\n\n" + panels[1].substring(0, 2000));
}
