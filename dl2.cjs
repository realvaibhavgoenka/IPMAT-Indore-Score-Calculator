const https = require('https');
https.get('https://cdn.digialm.com//per/g01/pub/1345/touchstone/AssessmentQPHTMLMode1/1345O251/1345O251S1D273/17663252601256340/258010001A11000169_1345O251S1D273E2.html', {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
}, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        console.log(rawData.substring(0, 1000));
    });
});
