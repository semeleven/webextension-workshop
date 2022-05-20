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
