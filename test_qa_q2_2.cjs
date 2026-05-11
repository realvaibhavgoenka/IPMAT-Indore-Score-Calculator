const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const htmlString = fs.readFileSync('indore.html', 'utf8');
const dom = new JSDOM(htmlString);
const doc = dom.window.document;

function extractTextWithSpaces(el) {
  let text = '';
  for (const node of el.childNodes) {
    if (node.nodeType === 3) text += node.textContent + ' ';
    else text += extractTextWithSpaces(node) + ' ';
  }
  return text.trim();
}

let questionPanels = Array.from(doc.querySelectorAll('.question-pnl, .questionRowTbl, table.menu-tbl'));
questionPanels = questionPanels.filter(p => !p.parentElement?.closest('.question-pnl, .questionRowTbl, table.menu-tbl'));

for(let i=0; i<5; i++) {
   const q = questionPanels[i];
   const spaced = extractTextWithSpaces(q).replace(/\s+/g, ' ');
   console.log(spaced.substring(0, 500));
   const ansTxt = (spaced.match(/Given Answer\s*:\s*(\S+)/i) || [])[1];
   console.log(`Q${i+1} answer: ${ansTxt}`);
}
