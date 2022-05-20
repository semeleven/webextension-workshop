let count = 0;

function incrementCount(linesCount) {
  count += linesCount;
}

function getCount() {
  return count;
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "copy-all") {
    getCurrentTabId().then((tabId) => {
      chrome.tabs.sendMessage(tabId, { action: "copy-all" }, (resp) => {
        sendCodeToVSCode(resp);
      });
    });
  }
});

chrome.runtime.onMessage.addListener((message, info, cb) => {
  if (message.action === "send-code") {
    sendCodeToVSCode(message.code);
  }
});

async function getCurrentTabId() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.id;
}

function sendCodeToVSCode(code) {
  return fetch("http://localhost:4450/copypaste", {
    method: "POST",
    body: JSON.stringify({ code }),
  }).catch((e) => {
    console.log("vs code not found");
  });
}

function getLOC(code) {
  return code.split("\n").length;
}
