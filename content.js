// This script runs on the webpage and handles the AI logic and modal display.

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize-text") {
    // When we get the message, start the summary process
    handleSummarize(request.text);
    return true; // Indicates we will respond asynchronously
  }
});

// Main function to call the AI and display the result
async function handleSummarize(text) {
  // Show a loading modal (this now *creates* the modal)
  createCogniWriteModal("<h3>Summarizing...</h3><p>Please wait while the on-device AI processes your request.</p>");

  try {
    // 1. Check if the Summarizer API is available
    const capabilities = await window.ai.summarizer.capabilities();
    if (capabilities.available === "no") {
      updateCogniWriteModal("<h3>Error</h3><p>On-device AI is not available. Please check your Chrome settings.</p>");
      return;
    }

    // 2. Create the summarizer session
    const summarizer = await window.ai.summarizer.create();

    // 3. Get the summary (we'll replace newlines with <br> for better formatting)
    const result = await summarizer.summarize({ text: text });
    const formattedSummary = result.summary.replace(/\n/g, '<br>');

    // 4. Display the summary (this now *updates* the existing modal)
    updateCogniWriteModal(`<h3>Summary</h3><p>${formattedSummary}</p>`);

    // 5. Clean up the session
    await summarizer.destroy();

  } catch (e) {
    console.error("Error summarizing text:", e);
    updateCogniWriteModal(`<h3>Error</h3><p>An error occurred: ${e.message}</p>`);
  }
}

// Function to CREATE the modal for the first time
function createCogniWriteModal(innerHTML) {
  // Remove any old modal just in case
  removeCogniWriteModal();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'cogniwrite-overlay';
  overlay.onclick = removeCogniWriteModal;
  
  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'cogniwrite-modal';
  
  // Create a container for the content
  const content = document.createElement('div');
  content.id = 'cogniwrite-content';
  content.innerHTML = innerHTML;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.id = 'cogniwrite-close-btn';
  closeButton.innerText = '×';
  closeButton.onclick = removeCogniWriteModal;
  
  modal.appendChild(closeButton);
  modal.appendChild(content);
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Add listener for the Escape key
  window.addEventListener('keydown', handleEscKey);
}

// Function to UPDATE the modal's content
function updateCogniWriteModal(innerHTML) {
  const content = document.getElementById('cogniwrite-content');
  if (content) {
    content.innerHTML = innerHTML;
  }
}

// Function to REMOVE the modal
function removeCogniWriteModal() {
  const modal = document.getElementById('cogniwrite-modal');
  const overlay = document.getElementById('cogniwrite-overlay');
  
  if (modal) {
    modal.remove();
  }
  if (overlay) {
    overlay.remove();
  }
  
  // Remove the Escape key listener to clean up
  window.removeEventListener('keydown', handleEscKey);
}

// Function to handle the Escape key press
function handleEscKey(event) {
  if (event.key === 'Escape') {
    removeCogniWriteModal();
  }
}

