const https = require('https');
const url = 'https://corsproxy.io/?' + encodeURIComponent('https://cdn.digialm.com//per/g01/pub/1345/touchstone/AssessmentQPHTMLMode1/1345O251/1345O251S1D273/17663252601256340/258010001A11000169_1345O251S1D273E2.html');
https.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
}, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        console.log(rawData.substring(0, 500));
    });
});
