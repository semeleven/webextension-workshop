function incrementCounter(count) {
  getCounter().then((counter) => {
    browser.storage.local.set({ counter: counter + count });
  });
}

function getCounter() {
  return browser.storage.local.get("counter").then((data) => {
    return data.counter ?? 0;
  });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "copy-all") {
    getCurrentTabId().then((tabId) => {
      chrome.tabs.sendMessage(tabId, { action: "copy-all" }, (allCode) => {
        sendCodeToVScode(allCode);
        incrementCounter(getLOC(allCode));
      });
    });
  }
});

chrome.runtime.onMessage.addListener((req, info, cb) => {
  if (req.action === "send-code") {
    sendCodeToVScode(req.code);
    incrementCounter(getLOC(req.code));
  }
  if (req.action === "get-count") {
    getCounter().then((counter) => {
      cb(counter);
    });
    return true;
  }
});

function getLOC(code) {
  return code.split("\n").length;
}

async function getCurrentTabId() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.id;
}

function sendCodeToVScode(code) {
  return fetch("http://localhost:4450/copypaste", {
    method: "POST",
    body: JSON.stringify({ code }),
  }).catch((e) => {
    console.log("vscode in not found");
  });
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("welcome.html"),
    });
    chrome.runtime.setUninstallURL("http://localhost:4450/leave");
  }
});
