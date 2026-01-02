const https = require('https');

const apiKey = "AIzaSyDfn699IYdHegHXgOm4sBnJe62OhSbDdPo";

function testModel(modelName) {
    console.log(`Testing model: ${modelName}`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const data = JSON.stringify({
        contents: [{
            parts: [{
                text: "Generate a cute cartoon dinosaur sticker image, vector style, white background"
            }]
        }]
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(url, options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            console.log(`Response for ${modelName} (Status: ${res.statusCode}):`);
            try {
                const json = JSON.parse(responseBody);
                if (res.statusCode === 200) {
                     // Check if we got image data
                     if (json.candidates && json.candidates[0].content && json.candidates[0].content.parts) {
                         const parts = json.candidates[0].content.parts;
                         const hasImage = parts.some(p => p.inlineData || p.fileData);
                         console.log("Has Image data:", hasImage);
                         if (!hasImage) {
                             console.log("Returned text instead:", parts[0].text);
                         }
                     } else {
                         console.log("Unexpected structure:", JSON.stringify(json, null, 2));
                     }
                } else {
                    console.log("Error:", JSON.stringify(json, null, 2));
                }
            } catch (e) {
                console.log("Raw response:", responseBody);
            }
            console.log("---------------------------------------------------");
        });
    });

    req.on('error', (e) => {
        console.error(`Request error for ${modelName}:`, e);
    });

    req.write(data);
    req.end();
}

// Test likely candidates for free/experimental image generation
testModel("gemini-2.0-flash-exp"); // Often has tools enabled
testModel("gemini-2.0-flash-exp-image-generation"); // Specific model seen in list
testModel("nano-banana-pro-preview"); // Requested by user
