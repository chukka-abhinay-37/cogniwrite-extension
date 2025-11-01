// This script runs in the background to create the right-click menu item.

// Add a listener for when the extension is first installed
chrome.runtime.onInstalled.addListener(() => {
  // Create the context menu item
  chrome.contextMenus.create({
    id: "cogniwrite-summarize",
    title: "Summarize with CogniWrite",
    contexts: ["selection"] // Only show when text is selected
  });
});

// Add a listener for when the menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Check if our menu item was clicked
  if (info.menuItemId === "cogniwrite-summarize" && info.selectionText) {
    // Send a message to the content script in the active tab
    chrome.tabs.sendMessage(tab.id, {
      action: "summarize-text",
      text: info.selectionText
    });
  }
});
