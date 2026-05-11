import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, ChevronDown, ExternalLink, User,
  ChevronRight, BookOpen, Target, GraduationCap, 
  Sparkles, Share2, MessageCircle, Users, CheckCircle, XCircle, Circle, Building, Award, Loader2
} from 'lucide-react';

const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbx4Vs8mNi0FJmGqexcoIphPWENDbCWxaxMX0juOBpwpLADgFA-qz0L1fWaWw_TyHusebw/exec';

const mapStandardSection = (rawName) => {
    const lower = rawName.toLowerCase();
    if (lower.includes('verbal') || lower.includes('english') || lower.includes('varc') || lower.includes('comprehension')) return 'Verbal Ability';
    if (lower.includes('sa') || lower.includes('short answer')) return 'Quantitative Ability SA';
    if (lower.includes('qa') || lower.includes('quant') || lower.includes('math') || lower.includes('data interpretation')) return 'Quantitative Ability MCQ';
    return rawName;
};

const calculateProbability = (score, cutoff, k = 0.1) => {
    if (score == null || cutoff == null) return 0;
    // Logistic curve: at score == cutoff, prob is 50%
    const prob = 1 / (1 + Math.exp(-k * (score - cutoff)));
    return Math.max(1, Math.min(99, Math.round(prob * 100)));
};

const EXAM_PROFILES = [
  {
    name: 'IPMAT Indore / Similar UG Exam',
    questionCount: 90,
    marking: { correct: 4, incorrect: -1, unattempted: 0 },
    colleges: [
      { 
        name: 'IIM Indore (IPM)', 
        type: 'sectional', 
        overallCutoffs: null,
        sectionalCutoffs: {
          'General': { 'Quantitative Ability SA': 24, 'Quantitative Ability MCQ': 28, 'Verbal Ability': 112 },
          'EWS': { 'Quantitative Ability SA': 16, 'Quantitative Ability MCQ': 18, 'Verbal Ability': 87 },
          'NC-OBC': { 'Quantitative Ability SA': 12, 'Quantitative Ability MCQ': 15, 'Verbal Ability': 78 },
          'SC': { 'Quantitative Ability SA': 12, 'Quantitative Ability MCQ': 10, 'Verbal Ability': 65 },
          'ST': { 'Quantitative Ability SA': 8, 'Quantitative Ability MCQ': 6, 'Verbal Ability': 48 },
          'PwD': { 'Quantitative Ability SA': 8, 'Quantitative Ability MCQ': 5, 'Verbal Ability': 47 },
        },
        note: 'Sectional cutoffs only',
        url: 'https://www.iimidr.ac.in', img: 'https://upload.wikimedia.org/wikipedia/en/4/4b/IIM_Indore_Logo.svg' 
      },
      { 
        name: 'IIM Ranchi (IPM)', 
        type: 'overall', 
        overallCutoffs: {
          'General': 177,
          'EWS': 138,
          'NC-OBC': 120,
          'SC': 95,
          'ST': 49,
          'PwD': 62
        },
        sectionalCutoffs: null,
        note: 'Overall cutoff',
        url: 'https://iimranchi.ac.in', img: 'https://upload.wikimedia.org/wikipedia/en/6/6f/Indian_Institute_of_Management_Ranchi_Logo.png' 
      },
      {
        name: 'IIM Shillong',
        type: 'sectional',
        sectionalCutoffs: {
          'General': { 'Quantitative Ability SA': 12, 'Quantitative Ability MCQ': 24, 'Verbal Ability': 36 },
          'EWS': { 'Quantitative Ability SA': 12, 'Quantitative Ability MCQ': 24, 'Verbal Ability': 36 },
          'NC-OBC': { 'Quantitative Ability SA': 12, 'Quantitative Ability MCQ': 24, 'Verbal Ability': 36 },
          'SC': { 'Quantitative Ability SA': 8, 'Quantitative Ability MCQ': 18, 'Verbal Ability': 27 },
          'ST': { 'Quantitative Ability SA': 4, 'Quantitative Ability MCQ': 12, 'Verbal Ability': 18 },
          'PwD': { 'Quantitative Ability SA': 4, 'Quantitative Ability MCQ': 12, 'Verbal Ability': 18 },
        },
        note: 'Sectional cutoffs',
      },
      {
         name: 'IIM Amritsar',
         type: 'overall',
         overallCutoffs: {
            'General': 160,
            'EWS': 130,
            'NC-OBC': 115,
            'SC': 90,
            'ST': 50,
            'PwD': 50
         },
         note: 'Estimated overall cutoff',
      },
      {
         name: 'IIM Sirmaur',
         type: 'overall',
         overallCutoffs: {
            'General': 150,
            'EWS': 125,
            'NC-OBC': 110,
            'SC': 85,
            'ST': 45,
            'PwD': 45
         },
         note: 'Estimated overall cutoff',
      },
      {
         name: 'IIM Sambalpur',
         type: 'overall',
         overallCutoffs: {
            'General': 150,
            'EWS': 125,
            'NC-OBC': 110,
            'SC': 85,
            'ST': 45,
            'PwD': 45
         },
         note: 'Estimated overall cutoff',
      },
      { 
        name: 'Nirma University', 
        type: 'both', 
        overallCutoffs: { 'General': 110, 'Default': 80 },
        sectionalCutoffs: { 'General': { 'Quantitative Ability SA': 8, 'Quantitative Ability MCQ': 12, 'Verbal Ability': 85 } },
        note: 'Both sectional and overall required',
        url: 'https://nirmauni.ac.in', img: 'https://upload.wikimedia.org/wikipedia/en/5/52/Nirma_University_Logo.png' 
      },
      {
        name: 'TAPMI (IPM)',
        type: 'overall',
        overallCutoffs: { 'General': 150, 'Default': 130 },
        note: 'Interview compulsory. Safe score: 150',
        url: 'https://www.tapmi.edu.in', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/T_A_Pai_Management_Institute_Logo.jpg/220px-T_A_Pai_Management_Institute_Logo.jpg'
      },
      {
        name: 'TAPMI (BBA Hons)',
        type: 'overall',
        overallCutoffs: { 'General': 100, 'Default': 85 },
        note: 'Interview compulsory. Safe score: 100',
        url: 'https://www.tapmi.edu.in', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/T_A_Pai_Management_Institute_Logo.jpg/220px-T_A_Pai_Management_Institute_Logo.jpg'
      },
      {
        name: 'IFMR Krea University',
        type: 'overall',
        overallCutoffs: { 'General': 115, 'Default': 100 },
        note: 'Interview compulsory. Safe score: 115+',
        url: 'https://krea.edu.in', img: 'https://upload.wikimedia.org/wikipedia/en/2/29/IFMR_GSB_Krea_University_Logo.png'
      }
    ]
  }
];

const BATCHES = [ 
  { name: 'Mentorship Batch IPMAT & JIPMAT 2026', href: 'https://www.entranceug.com/s/pages/mentorship-batch', icon: BookOpen, description: 'Daily Tasks, Accountability & Customized Strategy' }, 
  { name: '1-on-1 Session', href: 'https://pages.razorpay.com/1-on-1-entrance-ug', icon: Target, description: 'Get counselled & be Clear' }, 
  { name: 'Personal Mock Interview', href: 'https://pages.razorpay.com/1-on-1-entrance-ug', icon: GraduationCap, description: '100% Success Rate in Interview Prep' }, 
];

const Navbar = () => { 
  return ( 
    <nav className="eug-nav-wrapper">
      <div className="eug-nav-container"> 
        <a href="https://www.entranceug.com/" className="eug-logo-group"> 
          <span className="eug-logo">Entrance<span> UG</span><sup>®</sup></span> 
        </a> 
        <input type="checkbox" id="eug-mobile-toggle" className="eug-menu-checkbox" /> 
        <label htmlFor="eug-mobile-toggle" className="eug-menu-btn"> 
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#004c6b" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg> 
        </label>
        <ul className="eug-nav-links">
          <li className="eug-has-dropdown"> 
            <a href="/s/store">All Mocks 
              <svg className="eug-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg> 
            </a> 
            {/* Dropdown Starts */}
            <div className="eug-dropdown-menu">
              <div className="eug-dropdown-section">
                <div className="eug-dropdown-header">IPMAT</div> 
                <a href="https://www.entranceug.com/s/store/courses/IPMAT%20Packages/Indore" className="eug-dropdown-item">IPMAT Indore</a> 
                <a href="https://www.entranceug.com/s/store/courses/IPMAT%20Packages/Rohtak" className="eug-dropdown-item">IPMAT Rohtak</a> 
                <a href="https://www.entranceug.com/s/store/courses/IPMAT%20Packages/JIPMAT" className="eug-dropdown-item">JIPMAT</a> 
                <a href="https://www.entranceug.com/s/store/courses/IPMAT%20Packages/IIM%20Kozikode%20BMS" className="eug-dropdown-item">IIM Kozikode BMS</a> 
                <a href="https://www.entranceug.com/s/store/courses/IIM%20Bangalore%20UG%20AT%20Mocks" className="eug-dropdown-item">IIM Bangalore BSc Hons</a> 
                <a href="https://www.entranceug.com/s/store/courses/IIM%20Bangalore%20DBE%20Mocks" className="eug-dropdown-item">IIM Bangalore BBA DBE</a>
              </div>
              <div className="eug-dropdown-section">
                <div className="eug-dropdown-header">CUET</div> 
                <a href="https://www.entranceug.com/s/store/courses/CUET%20Mocks" className="eug-dropdown-item">CUET Mocks</a>
              </div>
              <div className="eug-dropdown-section">
                <div className="eug-dropdown-header">PRACTICE</div> 
                <a href="https://www.entranceug.com/s/store/courses/Free%20Resources" className="eug-dropdown-item">Practice Tests</a>
              </div>
            </div>
          </li>
          <li><a href="https://www.entranceug.com/s/pages/pricing">IPMAT Mocks</a></li>
          <li><a href="/s/pages/cuet-mocks-plans">CUET Mocks</a></li>
          <li><a href="https://www.entranceug.com/products">Free Resources</a></li>
          <li><a href="https://pages.razorpay.com/1-on-1-entrance-ug">1-on-1 Interview</a></li>
          <li><a href="/courses/Reading-Comprehension--68ea3a01f8e35916c1d9d314">Daily RC's</a></li>
          <li>
            <div className="eug-enroll-group"> 
              <span className="eug-status-dot"></span> 
              <a href="https://www.entranceug.com/t/u/activeCourses" className="eug-btn-enroll">Login</a> 
            </div>
          </li>
        </ul>
      </div>
    </nav>
  ); 
};

export default function App() {
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [urlInput, setUrlInput] = useState('');
  
  const [questions, setQuestions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [totalScore, setTotalScore] = useState(null);
  const [detectedExam, setDetectedExam] = useState(null);
  const [maxPossibleScore, setMaxPossibleScore] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('General');
  
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('idle');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [shareBtnText, setShareBtnText] = useState('Share Score');

  const saveDataToBackend = async (payload) => {
    setSaveStatus('saving');
    // Using original mock logic if GAS is not setup
    try {
        await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });
        setSaveStatus('saved');
    } catch (e) {
        console.error("Failed to save", e);
        setSaveStatus('error');
    }
  };

  const fetchAndParse = async () => {
    if (!studentName.trim() || !email.trim() || !phone.trim()) {
        setError("Please fill in your Name, Email, and Phone Number before calculating.");
        return;
    }
    
    const inputStr = urlInput.trim();
    if (!inputStr) {
        setError("Please enter a valid URL or paste HTML source.");
        return;
    }

    setIsProcessing(true);
    setError(null);
    setQuestions([]);
    setSummary([]);
    setTotalScore(null);
    
    if (inputStr.toLowerCase().includes('<html') || inputStr.toLowerCase().includes('</div>') || inputStr.toLowerCase().includes('<table')) {
        setProcessingStage('analyzing');
        try {
            await new Promise(r => setTimeout(r, 100));
            const results = processHtmlContent(inputStr);
            if (results) {
                setProcessingStage('saving');
                await saveDataToBackend({
                    name: studentName, email, phone,
                    totalScore: results.grandTotal,
                    exam: results.examName,
                    responseSheetUrl: urlInput
                });
                setProcessingStage('completed');
            }
        } catch(err) {
            setError(err.message || "Failed to parse HTML.");
            setProcessingStage('idle');
        } finally {
            setIsProcessing(false);
        }
        return;
    }

    try { new URL(inputStr); } catch (_) {
        setError("Invalid URL format. Please ensure it starts with http:// or https://. If blocked, open your link, Right Click -> View Page Source -> Copy all -> Paste here.");
        setIsProcessing(false);
        return;
    }

    setProcessingStage('fetching');

    try {
      const encodedUrl = encodeURIComponent(inputStr);
      const targetUrl = inputStr;
      
      let htmlContent = "";
      try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          const response = await fetch('/api/fetch-url', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: targetUrl }),
              signal: controller.signal 
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
              const data = await response.json();
              htmlContent = data.contents;
          } else {
              const errorData = await response.json().catch(() => ({}));
              console.error("Backend fetch failed", response.status, errorData);
          }
      } catch (e) {
          console.error("Fetch request to backend failed", e);
      }
      
      if (!htmlContent || (!htmlContent.toLowerCase().includes('<table') && !htmlContent.toLowerCase().includes('question'))) {
          throw new Error("Unable to fetch response sheet content from this URL. This can happen if the link has expired or if the exam portal blocks automated requests. Try copying its HTML Source manually and pasting it here instead.");
      }

      setProcessingStage('analyzing');
      const results = processHtmlContent(htmlContent);
      
      if (results) {
        setProcessingStage('saving');
        await saveDataToBackend({
            name: studentName, email, phone,
            totalScore: results.grandTotal,
            exam: results.examName,
            responseSheetUrl: urlInput
        });
        setProcessingStage('completed');
      }
    } catch (err) {
      let displayMsg = err.message || "An unexpected error occurred.";
      setError(displayMsg + " If it keeps failing, try opening the sheet, Right Click -> View Page Source -> Copy All -> Paste here.");
      setProcessingStage('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const processHtmlContent = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    let questionPanels = Array.from(doc.querySelectorAll('.question-pnl, .questionRowTbl, table.menu-tbl'));
    
    // Filter nested question rows if both outer and inner are matched
    questionPanels = questionPanels.filter(p => !p.parentElement?.closest('.question-pnl, .questionRowTbl, table.menu-tbl'));

    if (questionPanels.length === 0) {
       // Support for alternative formats just in case
       questionPanels = Array.from(doc.querySelectorAll('table[cellpadding="4"], table[cellspacing="0"]')).filter(p => p.textContent?.toLowerCase().includes('question'));
    }
    if (questionPanels.length === 0) throw new Error("Invalid Response Sheet: No valid questions found. Please ensure this is a supported response sheet.");

    // Detect Exam
    const totalQs = questionPanels.length;
    let fallbackExam = EXAM_PROFILES[0]; // IPMAT Indore
    setDetectedExam(fallbackExam);

    const markingOpts = fallbackExam.marking;
    let maxMockScore = totalQs * markingOpts.correct;
    setMaxPossibleScore(maxMockScore);

    const extractedQuestions = [];
    let currentSection = 'Unknown Section';
    let grandTotal = 0;

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
        const statusMatch = metaText.match(/Status\s*:\s*([A-Za-z]+)/i);
        if (statusMatch && statusMatch[1].toLowerCase() === 'dropped') {
            isDropped = true;
        } else if (textContent.match(/discrepancy is found.*marks is being awarded/i) || textContent.match(/Note:.*(?:\b(?:question is dropped|ignore this question|question dropped)\b)/i)) {
            // Usually explicitly labelled via a "Note: ..."
            isDropped = true;
        }

        const qIdMatch = metaText.match(/Question ID\s*:\s*(\d+)/i) || metaText.match(/Q\.\s*Id\s*:\s*(\d+)/i);
        const qId = qIdMatch ? qIdMatch[1] : `Unknown-${index}`;
        
        const qTypeMatch = metaText.match(/Question Type\s*:\s*([A-Za-z]+)/i) || textContent.match(/Question Type\s*:\s*([A-Za-z]+)/i);
        const qType = qTypeMatch ? qTypeMatch[1].toUpperCase() : '';
        const mappedSection = mapStandardSection(currentSection);
        const isNumerical = qType === 'SA' || qType === 'SUBJECTIVE' || mappedSection === 'Quantitative Ability SA';
        
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

        // Normalize chosenOptIndex to "1", "2", "3", "4" if it is an Option ID
        if (chosenOptIndex && chosenOptIndex.length > 2) {
             if (opt1Match && opt1Match[1] === chosenOptIndex) chosenOptIndex = "1";
             else if (opt2Match && opt2Match[1] === chosenOptIndex) chosenOptIndex = "2";
             else if (opt3Match && opt3Match[1] === chosenOptIndex) chosenOptIndex = "3";
             else if (opt4Match && opt4Match[1] === chosenOptIndex) chosenOptIndex = "4";
        }

        let correctOptIndex = null;
        // Search inside the question container, excluding the menu-tbl if it's separate
        const questionContainer = panel.querySelector('.questionRowTbl') || panel;
        const optionRows = questionContainer.querySelectorAll('tbody > tr > td.rightAns, tbody > tr > td.right-ans, .green-txt, td[style*="green"], td[style*="#008000"]'); 
        
        if (optionRows.length > 0) {
            // We found the correct option element directly
            let rightTd = optionRows[0];
            let txt = rightTd.textContent || '';
            // If it's an image, maybe we can't extract the number. Try standard extraction first
            txt = txt.replace(/^\s*Ans\s*/i, '').trim();
            const indexMatch = txt.match(/^([0-9A-Za-z])(?:[.)]|\s)/); 
            if (indexMatch) {
                correctOptIndex = indexMatch[1].trim();
            } else {
                // If it's like <td><img src="correct.png"/></td> and sibling is text?
                const sibling = rightTd.nextElementSibling;
                if (sibling) {
                    const sibTxt = (sibling.textContent || '').replace(/^\s*Ans\s*/i, '').trim();
                    const sibMatch = sibTxt.match(/^([0-9A-Za-z])(?:[.)]|\s)/); 
                    if (sibMatch) correctOptIndex = sibMatch[1].trim();
                    else correctOptIndex = sibTxt;
                } else if (rightTd.parentElement) {
                    // Try to extract from the parent row text
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

        // Normalize correctOptIndex if it's still an Option ID
        if (correctOptIndex && correctOptIndex.length > 2 && correctOptIndex !== 'Dropped') {
             if (opt1Match && opt1Match[1] === correctOptIndex) correctOptIndex = "1";
             else if (opt2Match && opt2Match[1] === correctOptIndex) correctOptIndex = "2";
             else if (opt3Match && opt3Match[1] === correctOptIndex) correctOptIndex = "3";
             else if (opt4Match && opt4Match[1] === correctOptIndex) correctOptIndex = "4";
             // If we STILL couldn't normalize, and we don't have a small 1-char answer
             // We might just leave it as the Option ID
        }

        let status = 'Unattempted';
        let marks = 0;

        if (isDropped) {
             status = 'Dropped';
             marks = markingOpts.correct;
             correctOptIndex = 'Dropped';
        } else if (!chosenOptIndex) {
            status = 'Unattempted';
            marks = markingOpts.unattempted;
        } else if (correctOptIndex && chosenOptIndex.toString() === correctOptIndex.toString()) {
            status = 'Correct';
            marks = markingOpts.correct;
        } else if (correctOptIndex) {
            status = 'Incorrect';
            marks = isNumerical ? 0 : markingOpts.incorrect;
        } else {
            status = 'Awaiting Key';
            marks = 0;
        }

        grandTotal += marks;
        extractedQuestions.push({
            id: `q-${index}`, questionId: qId, section: currentSection,
            chosenOptionId: chosenOptIndex, correctOptionId: correctOptIndex, status, marks
        });
    });

    const summaryData = [];
    const sectionMap = new Map();

    extractedQuestions.forEach(q => {
        let sec = sectionMap.get(q.section);
        if (!sec) {
            sec = { name: q.section, totalQuestions: 0, attempted: 0, correct: 0, incorrect: 0, score: 0 };
            sectionMap.set(q.section, sec);
            summaryData.push(sec);
        }
        sec.totalQuestions++;
        if (q.status !== 'Unattempted') sec.attempted++;
        if (q.status === 'Correct') { sec.correct++; sec.score += q.marks; }
        else if (q.status === 'Incorrect') { sec.incorrect++; sec.score += q.marks; }
    });

    setQuestions(extractedQuestions);
    setSummary(summaryData);
    setTotalScore(grandTotal);

    return { grandTotal, summaryData, examName: fallbackExam.name };
  };

  const generateShareText = () => {
    let sectionText = '';
    const userSectionScores = {};
    if (summary && summary.length > 0) {
        sectionText = "\n*Sectional Scores:*\n" + summary.map(sec => `- ${sec.name}: ${sec.score}`).join('\n') + "\n";
        
        summary.forEach(sec => {
            const standardName = mapStandardSection(sec.name);
            userSectionScores[standardName] = (userSectionScores[standardName] || 0) + sec.score;
        });
    }

    let collegesText = '';
    if (detectedExam && detectedExam.colleges) {
        const converts = [];
        detectedExam.colleges.forEach(college => {
            let probability = 0;
            if (college.type === 'overall' || college.type === 'both') {
                const target = college.overallCutoffs?.[selectedCategory] || college.overallCutoffs?.['General'] || college.overallCutoffs?.['Default'] || 100;
                probability = calculateProbability(totalScore, target, 0.05);
            }
            if (college.type === 'sectional' || college.type === 'both') {
                let minSectionProb = 100;
                const sectionalTargetBase = college.sectionalCutoffs?.[selectedCategory] || college.sectionalCutoffs?.['General'] || {};
                Object.entries(sectionalTargetBase).forEach(([secName, targetVal]) => {
                    const target = Number(targetVal);
                    const score = userSectionScores[secName] || 0;
                    const p = calculateProbability(score, target, 0.08);
                    minSectionProb = Math.min(minSectionProb, p);
                });
                if (college.type === 'sectional') {
                    probability = minSectionProb;
                } else {
                    probability = Math.min(probability, minSectionProb);
                }
            }
            
            if (probability >= 50) {
                converts.push(college.name);
            }
        });
        
        if (converts.length > 0) {
            collegesText = `\n*Colleges I might convert:*\n${converts.map(c => `- ${c}`).join('\n')}\n`;
        }
    }

    return `I scored *${totalScore}/${maxPossibleScore}* in ${detectedExam?.name}! 🎯\n${sectionText}${collegesText}\nCheck your score and colleges here: https://calculator.entranceug.com`;
  };

  const handleWhatsAppShare = () => {
      const fullText = generateShareText();
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#Fcfcfc] font-sans pb-20">
      <Navbar />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#003B5C] to-[#015f92] pt-28 pb-36 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            <svg className="absolute top-0 left-0 w-full h-full" width="100%" height="100%">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium border border-white/20 mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#00FF84]" />
            <span>IPMAT Score Calculator is Live</span>
          </div>
          <h1 className="text-5xl md:text-7xl text-white font-extrabold mb-6 tracking-tight">
            Know Your <span className="text-[#00FF84]">IPMAT</span> Score Instantly
          </h1>
          <p className="flex justify-center items-center gap-2 text-blue-100 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">
            Evaluate your competitive edge with our advanced statistical predictor.
          </p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8"
        >
            <div className="p-10">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-800">Calculate Your Score</h2>
                    <p className="text-gray-500 mt-2">Paste your response sheet URL or HTML code to instantly calculate your marks.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Name</label>
                        <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Your Name" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#004c6b] focus:outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#004c6b] focus:outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Phone</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile Number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#004c6b] focus:outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Category</label>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#004c6b] focus:outline-none transition-all"
                        >
                            <option value="General">General</option>
                            <option value="EWS">EWS</option>
                            <option value="NC-OBC">NC-OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="PwD">PwD</option>
                        </select>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Response Sheet URL or HTML Source</label>
                    <div className="flex flex-col md:flex-row gap-3">
                        <textarea 
                            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#004c6b] focus:outline-none transition-all resize-y min-h-[50px] sm:h-[50px]" 
                            placeholder="https://... OR paste your HTML Source Code here" 
                            value={urlInput} 
                            onChange={(e) => setUrlInput(e.target.value)} 
                        />
                        <button onClick={fetchAndParse} disabled={isProcessing} className={`px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#004c6b] hover:bg-[#003B5C] hover:shadow-lg hover:-translate-y-0.5'}`} >
                        {isProcessing ? 'Processing...' : 'Calculate Score'}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {(processingStage !== 'idle' && processingStage !== 'completed') && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white rounded-[32px] shadow-2xl p-8 max-w-sm w-full text-center border-4 border-[#003B5C] relative overflow-hidden"
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 opacity-50"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-50 rounded-full -ml-8 -mb-8 opacity-50"></div>
                                
                                <motion.div
                                    animate={{ 
                                        rotate: [-5, 5, -5],
                                        y: [-5, 5, -5]
                                    }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="text-7xl mb-6 relative z-10 inline-block drop-shadow-lg"
                                >
                                    🎈
                                </motion.div>
                                <h3 className="text-2xl font-black text-gray-800 mb-3 relative z-10 font-sans tracking-tight leading-tight">
                                    Life is more<br/><span className="text-[#004c6b]">than exams!</span>
                                </h3>
                                <p className="text-gray-500 font-medium text-sm mb-8 relative z-10">
                                    Take a deep breath.<br/>We're calculating your score...
                                </p>
                                
                                <div className="flex justify-center relative z-10">
                                    <div className="bg-gray-50 p-4 rounded-full border border-gray-100 shadow-sm inline-flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-[#00FF84] animate-spin" />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-red-800">Calculation Failed</h4>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>

        {totalScore !== null && detectedExam && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
                
                {/* Result Header */}
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="absolute -right-10 -top-10 bg-blue-50 w-64 h-64 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{detectedExam.name}</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{studentName}'s Result</h2>
                        <p className="text-gray-500 font-medium">Out of {maxPossibleScore} maximum possible marks</p>
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                        <div className="bg-[#003B5C] text-white px-8 py-4 rounded-2xl shadow-xl w-full text-center">
                            <h3 className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Total Score</h3>
                            <div className="text-4xl font-extrabold">{totalScore}</div>
                        </div>
                    </div>
                </div>

                {/* College Admissions Section */}
                {detectedExam.colleges.length > 0 && (
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-12">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Target className="w-5 h-5 text-blue-500" /> Admission Chances (Statistical Predictor)</h2>
                                <p className="text-sm text-gray-500 mt-1">Predictions based on section-wise & overall cutoff thresholds.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <select 
                                    value={selectedCategory} 
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 rounded-xl border-gray-300 border bg-white focus:ring hover:border-blue-400 focus:ring-blue-200 outline-none transition-all text-sm font-medium text-gray-700"
                                >
                                    <option value="General">General</option>
                                    <option value="EWS">EWS</option>
                                    <option value="NC-OBC">NC-OBC</option>
                                    <option value="SC">SC</option>
                                    <option value="ST">ST</option>
                                    <option value="PwD">PwD</option>
                                </select>
                                <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 font-medium">Estimated</span>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {detectedExam.colleges.map((college) => {
                                    let probability = 0;
                                    let reqsMetList = [];
                                    
                                    // Pre-map the user's sectional scores
                                    const userSectionScores = {};
                                    summary.forEach(sec => {
                                        const standardName = mapStandardSection(sec.name);
                                        userSectionScores[standardName] = (userSectionScores[standardName] || 0) + sec.score;
                                    });

                                    // For testing UI if a section is entirely missing, assume 0 or estimate. We'll use 0.
                                    
                                    if (college.type === 'overall' || college.type === 'both') {
                                        const target = college.overallCutoffs?.[selectedCategory] || college.overallCutoffs?.['General'] || college.overallCutoffs?.['Default'] || 100;
                                        const p = calculateProbability(totalScore, target, 0.05);
                                        probability = p;
                                        reqsMetList.push({ name: 'Overall', met: totalScore >= target, diff: totalScore - target, score: totalScore, target });
                                    }

                                    if (college.type === 'sectional' || college.type === 'both') {
                                        let minSectionProb = 100;
                                        const sectionalTargetBase = college.sectionalCutoffs?.[selectedCategory] || college.sectionalCutoffs?.['General'] || {};
                                        Object.entries(sectionalTargetBase).forEach(([secName, targetVal]) => {
                                            const target = Number(targetVal);
                                            const score = userSectionScores[secName] || 0;
                                            const p = calculateProbability(score, target, 0.08);
                                            minSectionProb = Math.min(minSectionProb, p);
                                            reqsMetList.push({ name: secName, met: score >= target, diff: score - target, score, target });
                                        });
                                        if (college.type === 'sectional') {
                                            probability = minSectionProb;
                                        } else {
                                            // 'both' -> overall is already calculated, take min of overall and sectional
                                            probability = Math.min(probability, minSectionProb);
                                        }
                                    }

                                    const isTargetMet = probability >= 50; // At least 50% means safe/cleared
                                    const chanceLabel = probability >= 80 ? 'High' : probability >= 50 ? 'Moderate' : 'Low';
                                    const chanceColor = probability >= 80 ? 'text-green-600' : probability >= 50 ? 'text-yellow-600' : 'text-red-500';
                                    const bgColor = probability >= 80 ? 'bg-green-50 border-green-200' : probability >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

                                    return (
                                        <div key={college.name} className={`relative p-6 rounded-2xl border-2 transition-all ${bgColor}`}>
                                            <div className="flex justify-between items-start mb-4 gap-2">
                                                <div className="flex items-center gap-3">
                                                    {college.img && <img src={college.img} alt={college.name} className="h-8 w-8 object-contain rounded-full bg-white shadow-sm p-1" />}
                                                    <h3 className="font-bold text-gray-900 leading-tight">{college.name}</h3>
                                                </div>
                                                <div className={`text-2xl font-black ${chanceColor}`}>{probability}%</div>
                                            </div>
                                            
                                            <div className="space-y-3 mb-4">
                                                {reqsMetList.map((req, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm border-b border-black/5 pb-2 last:border-0 last:pb-0">
                                                        <span className="font-medium text-gray-600">{req.name}</span>
                                                        <span className="font-mono text-xs">
                                                            <span className={req.met ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{req.score}</span>
                                                            <span className="text-gray-400"> / {req.target}</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {college.note && (
                                                <div className="mt-4 pt-4 border-t border-black/10">
                                                    <p className="text-xs font-medium text-gray-600 italic">"{college.note}"</p>
                                                </div>
                                            )}

                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Section Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {summary.map((sec) => (
                        <div key={sec.name} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
                            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 truncate" title={sec.name}>{sec.name}</h3>
                            <div className="flex items-end justify-between mb-6">
                                <span className="text-4xl font-extrabold text-gray-800">{sec.score}</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-medium">Marks</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                                    <span className="text-sm font-medium text-gray-600">Attempted</span>
                                    <span className="font-bold text-gray-900">{sec.attempted} <span className="text-gray-400 font-normal">/ {sec.totalQuestions}</span></span>
                                </div>
                                <div className="flex justify-between items-center bg-green-50/50 px-3 py-2 rounded-lg">
                                    <span className="text-sm font-medium text-green-700">Correct</span>
                                    <span className="font-bold text-green-700">{sec.correct}</span>
                                </div>
                                <div className="flex justify-between items-center bg-red-50/50 px-3 py-2 rounded-lg">
                                    <span className="text-sm font-medium text-red-700">Incorrect</span>
                                    <span className="font-bold text-red-700">{sec.incorrect}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                    <button onClick={handleWhatsAppShare} className="flex items-center justify-center gap-2 bg-[#25D366] text-white w-full sm:w-auto px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#20b858] hover:shadow-lg transition-all">
                        <MessageCircle className="w-5 h-5" /> Share on WhatsApp
                    </button>
                </div>
            </motion.div>
        )}

        {/* Promotional Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <Target className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">IPMAT Mock Test Series</h3>
                        <p className="text-sm text-gray-500 font-medium">Ace the real exam with absolute confidence</p>
                    </div>
                </div>
                <ul className="space-y-3 mb-8 relative z-10">
                    <li className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-[#00FF84]" /> Real Exam Interface & Environment</li>
                    <li className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-[#00FF84]" /> Detailed Sectional Analytics</li>
                    <li className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-[#00FF84]" /> National Level Percentile</li>
                </ul>
                <a href="https://www.entranceug.com/s/pages/pricing" target="_blank" rel="noreferrer" className="relative z-10 inline-flex items-center justify-center w-full px-6 py-4 bg-[#003B5C] text-white rounded-xl font-bold hover:bg-[#002840] transition-colors gap-2 shadow-sm">
                    Explore Mock Tests <ChevronRight className="w-5 h-5" />
                </a>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="bg-gradient-to-br from-[#003B5C] to-[#015f92] rounded-[32px] shadow-md border border-[#004e7a] relative overflow-hidden group flex flex-col"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
                <div className="flex-1 w-full relative">
                    <img src="https://loud-blush-0ssamfkjol.edgeone.app/www.entranceug.com%20(1).png" alt="IPMAT PI Interview Batch" className="w-full h-auto object-cover" />
                </div>
                <div className="p-8 pb-8 pt-6 relative z-10 flex flex-col gap-4">
                    <a href="https://pages.razorpay.com/1-on-1-entrance-ug" target="_blank" rel="noreferrer" className="relative z-10 inline-flex items-center justify-center w-full px-6 py-4 bg-[#00FF84] text-[#003B5C] rounded-xl font-bold hover:bg-[#00e676] transition-colors gap-2 shadow-lg shadow-[#00FF84]/20">
                        Book Interview Slot <ExternalLink className="w-5 h-5" />
                    </a>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}
