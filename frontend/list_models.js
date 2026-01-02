const https = require('https');

const apiKey = "AIzaSyDfn699IYdHegHXgOm4sBnJe62OhSbDdPo";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log("Available Models:");
        json.models.forEach(model => {
            console.log(`- ${model.name}`);
            console.log(`  Supported methods: ${model.supportedGenerationMethods}`);
        });
      } else {
        console.log("No models found or error:", json);
      }
    } catch (e) {
      console.error("Error parsing response:", e);
      console.log("Raw data:", data);
    }
  });
}).on('error', (e) => {
  console.error("Request error:", e);
});
