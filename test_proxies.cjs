const url = "https://cdn.digialm.com//per/g01/pub/1345/touchstone/AssessmentQPHTMLMode1/1345O251/1345O251S1D273/17663252601256340/258010001A11000169_1345O251S1D273E2.html";

const proxies = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?url=",
  "https://thingproxy.freeboard.io/fetch/",
  "https://api.codetabs.com/v1/proxy?quest=",
  "https://cors-anywhere.herokuapp.com/",
];

async function testProxies() {
  for (const proxy of proxies) {
    console.log("Testing:", proxy);
    try {
      const target = proxy + encodeURIComponent(url);
      const res = await fetch(target, { method: 'GET', redirect: 'follow' });
      const text = await res.text();
      console.log("Status:", res.status);
      console.log("Length:", text.length);
      if (text.includes('<table') || text.includes('question')) {
         console.log("SUCCESS");
      }
    } catch (e) {
      console.error("Error:", e.message);
    }
  }
}
testProxies();
