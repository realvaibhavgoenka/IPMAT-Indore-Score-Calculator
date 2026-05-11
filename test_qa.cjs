const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const htmlString = fs.readFileSync('indore.html', 'utf8');
const dom = new JSDOM(htmlString);
const doc = dom.window.document;

let questionPanels = Array.from(doc.querySelectorAll('.question-pnl, .questionRowTbl, table.menu-tbl'));
questionPanels = questionPanels.filter(p => !p.parentElement?.closest('.question-pnl, .questionRowTbl, table.menu-tbl'));

console.log("Panel 1 text:\n", questionPanels[0].textContent.trim().substring(0, 500));
console.log("\n\nHTML:\n", questionPanels[0].outerHTML.substring(0, 1000));
