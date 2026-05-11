const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function extractTextWithSpaces(el) {
  let text = '';
  for (const node of el.childNodes) {
    if (node.nodeType === 3) text += node.textContent + ' ';
    else text += extractTextWithSpaces(node) + ' ';
  }
  return text.trim();
}

const htmlString = fs.readFileSync('indore.html', 'utf8');
const dom = new JSDOM(htmlString);
const doc = dom.window.document;

let questionPanels = Array.from(doc.querySelectorAll('.question-pnl, .questionRowTbl, table.menu-tbl'));
questionPanels = questionPanels.filter(p => !p.parentElement?.closest('.question-pnl, .questionRowTbl, table.menu-tbl'));

const q = questionPanels[7];
console.log(extractTextWithSpaces(q).replace(/\s+/g, ' '));
