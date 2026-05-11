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

function testParse() {
  const htmlString = fs.readFileSync('indore.html', 'utf8');
  const dom = new JSDOM(htmlString);
  const doc = dom.window.document;

  let questionPanels = Array.from(doc.querySelectorAll('.question-pnl, .questionRowTbl, table.menu-tbl'));
  questionPanels = questionPanels.filter(p => !p.parentElement?.closest('.question-pnl, .questionRowTbl, table.menu-tbl'));

  const extractedQuestions = [];
  let currentSection = 'Unknown Section';
  
  questionPanels.forEach((panel, index) => {
        let prev = panel.previousElementSibling;
        let pCnt = 0;
        while (prev && pCnt < 5) {
          if (prev.classList?.contains('section-lbl') || prev.textContent?.includes('Section :') || prev.textContent?.includes('SectionName')) {
            currentSection = prev.textContent?.replace(/Section *:|SectionName *:/, '').trim() || 'Unknown Section';
            break;
          }
          prev = prev.previousElementSibling;
          pCnt++;
        }
        if (currentSection === 'Unknown Section') {
             const secCntntr = panel.closest('.section-cntnr, .section-container, .section');
             if (secCntntr) {
                  const lbl = secCntntr.querySelector('.section-lbl, .GrpHeading');
                  if (lbl) currentSection = lbl.textContent?.replace(/Section *:|SectionName *:/, '').trim() || 'Unknown Section';
             }
        }

        const textContent = extractTextWithSpaces(panel).replace(/\s+/g, ' ');
        const metadataTable = panel.querySelector('.menu-tbl') || panel;
        const metaText = extractTextWithSpaces(metadataTable).replace(/\s+/g, ' ');

        let chosenOptIndex = null;
        let chosenMatch = metaText.match(/(?:Chosen Option|Given Answer|Candidate Answer)\s*:\s*([0-9A-Za-z.\-]+)/i);
        if (!chosenMatch) {
            chosenMatch = textContent.match(/(?:Chosen Option|Given Answer|Candidate Answer)\s*:\s*([0-9A-Za-z.\-]+)/i);
        }
        if (chosenMatch) chosenOptIndex = chosenMatch[1].trim();
        
        if (!chosenOptIndex || chosenOptIndex === '--' || chosenOptIndex === '-' || chosenOptIndex.toLowerCase() === 'not answered' || chosenOptIndex.toLowerCase() === 'left blank') {
            chosenOptIndex = null;
        }

        let correctOptIndex = null;
        const questionContainer = panel.querySelector('.questionRowTbl') || panel;
        const optionRows = questionContainer.querySelectorAll('tbody > tr > td.rightAns, tbody > tr > td.right-ans, .green-txt, td[style*="green"], td[style*="#008000"]'); 
        
        if (optionRows.length > 0) {
            let rightTd = optionRows[0];
            let txt = extractTextWithSpaces(rightTd).replace(/\s+/g, ' ');
            txt = txt.replace(/^\s*Ans\s*/i, '').trim();
            const possibleMatch = txt.match(/Possible Answer\s*:\s*(.+)/i);
            const indexMatch = txt.match(/^([0-9A-Za-z])(?:[.)]|\s)/); 
            if (possibleMatch) {
               correctOptIndex = possibleMatch[1].trim();
            } else if (indexMatch) {
                correctOptIndex = indexMatch[1].trim();
            } else {
                const sibling = rightTd.nextElementSibling;
                if (sibling) {
                    const sibTxt = (extractTextWithSpaces(sibling) || '').replace(/^\s*Ans\s*/i, '').trim();
                    const sibMatch = sibTxt.match(/^([0-9A-Za-z])(?:[.)]|\s)/); 
                    if (sibMatch) correctOptIndex = sibMatch[1].trim();
                    else correctOptIndex = sibTxt;
                } else if (rightTd.parentElement) {
                    const parTxt = (extractTextWithSpaces(rightTd.parentElement) || '').replace(/^\s*Ans\s*/i, '').trim();
                    const parMatch = parTxt.match(/^([0-9A-Za-z])(?:[.)]|\s)/); 
                    if (parMatch) correctOptIndex = parMatch[1].trim();
                }
            }
        }

        if(index < 5 || chosenOptIndex) {
            console.log(`Q${index+1} Sec: ${currentSection} | Chosen: ${chosenOptIndex} | Correct: ${correctOptIndex}`);
        }
        
        extractedQuestions.push({
            id: `q-${index}`, section: currentSection,
            chosenOptionId: chosenOptIndex, correctOptionId: correctOptIndex, 
        });
  });
  
  let attempted = 0;
  let correct = 0;
  extractedQuestions.forEach(q => {
    if(q.chosenOptionId) attempted++;
    if(q.chosenOptionId && q.correctOptionId && q.chosenOptionId.toString() === q.correctOptionId.toString()) correct++;
  });
  console.log(`Attempted: ${attempted}, Correct: ${correct}`);
}
testParse();
