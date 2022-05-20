chrome.runtime.sendMessage({ action: "get-count" }, (count) => {
  render(count);
});

chrome.storage.onChanged.addListener(({ count }) => {
  if (count) {
    render(count.newValue);
  }
});

function render(count) {
  document.querySelector("h1").innerText = `LOC: ${count}`;
}
