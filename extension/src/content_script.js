const preEls = [...document.querySelectorAll("pre")];

preEls.forEach((el) => {
  const parent = document.createElement("div");

  el.style.position = "relative";

  const root = parent.attachShadow({ mode: "open" });

  root.innerHTML = `<link href="${chrome.runtime.getURL(
    "content_script.css"
  )}" rel="stylesheet" ></link`;

  const button = document.createElement("button");
  button.textContent = "Copy";

  button.addEventListener("click", () => {
    const code = el.querySelector("code").innerText;

    navigator.clipboard.writeText(code).then(() => {
      chrome.runtime.sendMessage({ action: "send-code", code: code });
      notify();
    });
  });

  root.appendChild(button);

  el.appendChild(parent);
});

function notify() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("execute.js");

  document.body.appendChild(script);

  script.onload = () => {
    script.remove();
  };
}

chrome.runtime.onMessage.addListener((message, info, sendResponse) => {
  if (message.action === "copy-all") {
    const code = getAllCode();
    navigator.clipboard.writeText(code).then(() => {
      notify();
      sendResponse(code);
    });
    return true;
  }
});

function getAllCode() {
  return preEls
    .map((el) => {
      return el.querySelector("code").innerText;
    })
    .join("");
}
