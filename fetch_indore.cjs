const target = "https://cdn.digialm.com//per/g01/pub/1329/touchstone/AssessmentQPHTMLMode1/1329O261/1329O261S1D190/17780717928565037/AT2609071_1329O261S1D190E1.html";
async function run() {
  const res = await fetch(target, { 
       headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
       }
  });
  const text = await res.text();
  require('fs').writeFileSync('indore.html', text);
  console.log("Done. Length:", text.length);
}
run();
