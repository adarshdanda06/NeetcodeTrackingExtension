chrome.webRequest.onBeforeRequest.addListener((details) => {
      if (details.url.includes("https://us-central1-neetcode-dd170.cloudfunctions.net/executeCodeFunction")) {
        const requestBody = details.requestBody;
        const buffer = requestBody.raw[0].bytes;
        const uint8Array = new Uint8Array(buffer);
        const decoder = new TextDecoder('utf-8');
        const decodedString = decoder.decode(uint8Array);
        const data = JSON.parse(decodedString);
        const title = data.data.problemId;
        const code = data.data.rawCode;

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'CODE_DATA',
                title: title,
                code: code
            });
        });
      }
    },
    { urls: ["https://us-central1-neetcode-dd170.cloudfunctions.net/*"] },
    ["requestBody"]
);