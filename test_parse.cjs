const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function testParse() {
  const htmlString = fs.readFileSync('indore.html', 'utf8');
  const dom = new JSDOM(htmlString);
  const doc = dom.window.document;

  // Emulate processHtmlContent
  let extractedName = null;
  const allTds = Array.from(doc.querySelectorAll('td'));
  for (let i = 0; i < allTds.length; i++) {
        const text = allTds[i].textContent?.trim().toLowerCase() || '';
        if (text === "candidate name" || text === "candidate's name" || text === "applicant name") {
            const nextTd = allTds[i].nextElementSibling;
            if (nextTd && nextTd.tagName.toLowerCase() === 'td') {
                extractedName = nextTd.textContent?.trim();
                break;
            } else if (allTds[i + 1]) {
                extractedName = allTds[i + 1].textContent?.trim();
                break;
            }
        }
  }

  let questionPanels = Array.from(doc.querySelectorAll('.question-pnl, .questionRowTbl, table.menu-tbl'));
  questionPanels = questionPanels.filter(p => !p.parentElement?.closest('.question-pnl, .questionRowTbl, table.menu-tbl'));

  if (questionPanels.length === 0) {
       questionPanels = Array.from(doc.querySelectorAll('table[cellpadding="4"], table[cellspacing="0"]')).filter(p => p.textContent?.toLowerCase().includes('question'));
  }

  console.log("Found panels:", questionPanels.length);
  
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

        const textContent = panel.textContent || '';
        const metadataTable = panel.querySelector('.menu-tbl') || panel;
        const metaText = metadataTable.textContent || '';
        
        let isDropped = false;
        
        const qTypeMatch = metaText.match(/Question Type\s*:\s*([A-Za-z]+)/i) || textContent.match(/Question Type\s*:\s*([A-Za-z]+)/i);
        const qType = qTypeMatch ? qTypeMatch[1].toUpperCase() : '';
        
        let chosenOptIndex = null;
        const chosenMatch = metaText.match(/(?:Chosen Option|Given Answer|Candidate Answer)\s*:\s*([0-9A-Za-z.\-]+)/i);
        if (chosenMatch) chosenOptIndex = chosenMatch[1].trim();
        
        if (!chosenOptIndex || chosenOptIndex === '--' || chosenOptIndex === '-' || chosenOptIndex.toLowerCase() === 'not answered' || chosenOptIndex.toLowerCase() === 'left blank') {
            chosenOptIndex = null;
        }

        const opt1Match = metaText.match(/(?:Option 1 ID|Option1 ID)\s*:\s*(\d+)/i);
        const opt2Match = metaText.match(/(?:Option 2 ID|Option2 ID)\s*:\s*(\d+)/i);
        const opt3Match = metaText.match(/(?:Option 3 ID|Option3 ID)\s*:\s*(\d+)/i);
        const opt4Match = metaText.match(/(?:Option 4 ID|Option4 ID)\s*:\s*(\d+)/i);

        if (chosenOptIndex && chosenOptIndex.length > 2) {
             if (opt1Match && opt1Match[1] === chosenOptIndex) chosenOptIndex = "1";
             else if (opt2Match && opt2Match[1] === chosenOptIndex) chosenOptIndex = "2";
             else if (opt3Match && opt3Match[1] === chosenOptIndex) chosenOptIndex = "3";
             else if (opt4Match && opt4Match[1] === chosenOptIndex) chosenOptIndex = "4";
        }

        let correctOptIndex = null;
        const questionContainer = panel.querySelector('.questionRowTbl') || panel;
        const optionRows = questionContainer.querySelectorAll('tbody > tr > td.rightAns, tbody > tr > td.right-ans, .green-txt, td[style*="green"], td[style*="#008000"]'); 
        
        if (optionRows.length > 0) {
            let rightTd = optionRows[0];
            let txt = rightTd.textContent || '';
            txt = txt.replace(/^\s*Ans\s*/i, '').trim();
            const indexMatch = txt.match(/^([0-9A-Za-z])(?:[.)]|\s)/); 
            if (indexMatch) {
                correctOptIndex = indexMatch[1].trim();
            } else {
                const sibling = rightTd.nextElementSibling;
                if (sibling) {
                    const sibTxt = (sibling.textContent || '').replace(/^\s*Ans\s*/i, '').trim();
                    const sibMatch = sibTxt.match(/^([0-9A-Za-z])(?:[.)]|\s)/); 
                    if (sibMatch) correctOptIndex = sibMatch[1].trim();
                    else correctOptIndex = sibTxt;
                } else if (rightTd.parentElement) {
                    const parTxt = (rightTd.parentElement.textContent || '').replace(/^\s*Ans\s*/i, '').trim();
                    const parMatch = parTxt.match(/^([0-9A-Za-z])(?:[.)]|\s)/); 
                    if (parMatch) correctOptIndex = parMatch[1].trim();
                }
            }
        }

        if (!correctOptIndex || correctOptIndex === 'Correct') {
            const correctIdMatch = textContent.match(/Correct(?: Option)?(?: ID)?\s*:\s*([0-9A-Za-z.\-]+)/i) || textContent.match(/Right(?: Option)?(?: ID)?\s*:\s*([0-9A-Za-z.\-]+)/i);
            if (correctIdMatch) {
                 const targetId = correctIdMatch[1].trim();
                 correctOptIndex = targetId;
                 
                 if (opt1Match && opt1Match[1] === targetId) correctOptIndex = "1";
                 else if (opt2Match && opt2Match[1] === targetId) correctOptIndex = "2";
                 else if (opt3Match && opt3Match[1] === targetId) correctOptIndex = "3";
                 else if (opt4Match && opt4Match[1] === targetId) correctOptIndex = "4";
            }
        }

        if (correctOptIndex && correctOptIndex.length > 2 && correctOptIndex !== 'Dropped') {
             if (opt1Match && opt1Match[1] === correctOptIndex) correctOptIndex = "1";
             else if (opt2Match && opt2Match[1] === correctOptIndex) correctOptIndex = "2";
             else if (opt3Match && opt3Match[1] === correctOptIndex) correctOptIndex = "3";
             else if (opt4Match && opt4Match[1] === correctOptIndex) correctOptIndex = "4";
        }

        if(index < 5 || chosenOptIndex) {
            console.log(`Q${index+1} [${qType}] Sec: ${currentSection} | Chosen: ${chosenOptIndex} | Correct: ${correctOptIndex}`);
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
