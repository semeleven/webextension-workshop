function incrementCount(linesCount) {
  getCount().then((count) => {
    chrome.storage.local.set({
      count: count + linesCount,
    });
  });
}

function getCount() {
  return chrome.storage.local.get("count").then((data) => {
    return data?.count ?? 0;
  });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "copy-all") {
    getCurrentTabId().then((tabId) => {
      chrome.tabs.sendMessage(tabId, { action: "copy-all" }, (code) => {
        incrementCount(getLOC(code));
        sendCodeToVSCode(code);
      });
    });
  }
});

chrome.runtime.onMessage.addListener((message, info, cb) => {
  if (message.action === "send-code") {
    sendCodeToVSCode(message.code);
    incrementCount(getLOC(message.code));
  }
  if (message.action === "get-count") {
    getCount().then((count) => {
      cb(count);
    });
    return true;
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

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("start.html") });

    chrome.runtime.setUninstallURL("http://localhost:4450/leave");
  }
});
