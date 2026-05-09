const fs = require('fs');
fetch('https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent('https://cdn.digialm.com//per/g01/pub/1345/touchstone/AssessmentQPHTMLMode1/1345O251/1345O251S1D273/17663252601256340/258010001A11000169_1345O251S1D273E2.html'))
.then(r => r.text())
.then(t => {
    fs.writeFileSync('data2.html', t);
    fs.writeFileSync('preview2.txt', t.substring(0, 1000));
})
