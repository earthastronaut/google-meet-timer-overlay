// Create the timer overlay and controls
const timerOverlay = document.createElement('div');
timerOverlay.id = 'meet-timer-overlay';
timerOverlay.style.position = 'absolute';
timerOverlay.style.bottom = '10px';
timerOverlay.style.right = '10px';
timerOverlay.style.padding = '5px 10px';
timerOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
timerOverlay.style.color = 'white';
timerOverlay.style.fontSize = '16px';
timerOverlay.style.borderRadius = '5px';
timerOverlay.style.zIndex = '9999';
timerOverlay.innerHTML = `
  <div id="timer-display">00:00</div>
  <button id="toggle-btn">Start</button>
  <button id="settings-btn">Settings</button>
`;

// Add timer overlay to the video container
const addOverlayToVideo = () => {
  const videoContainers = document.querySelectorAll('video');
  if (videoContainers.length > 0) {
    if (!document.getElementById('meet-timer-overlay')) {
      videoContainers[0].parentNode.style.position = 'relative';
      videoContainers[0].parentNode.appendChild(timerOverlay);

      // Attach event listeners once the elements are in the DOM
      attachEventListeners();
    }
  }
};

// Call addOverlayToVideo initially and observe for changes in the DOM
addOverlayToVideo();
const observer = new MutationObserver(addOverlayToVideo);
observer.observe(document.body, { childList: true, subtree: true });

// Timer logic
let countdown;
let isPaused = true;
let remainingTime = 0;

const updateDisplay = () => {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  document.getElementById('timer-display').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Start countdown
const startCountdown = () => {
  if (countdown) clearInterval(countdown);
  isPaused = false;
  countdown = setInterval(() => {
    if (!isPaused && remainingTime > 0) {
      remainingTime--;
      updateDisplay();
    } else if (remainingTime <= 0) {
      clearInterval(countdown);
      document.getElementById('toggle-btn').textContent = 'Start';
      isPaused = true;
    }
  }, 1000);
};

// Toggle between start and pause
const toggleTimer = () => {
  const toggleButton = document.getElementById('toggle-btn');
  if (isPaused) {
    startCountdown();
    toggleButton.textContent = 'Pause';
  } else {
    isPaused = true;
    toggleButton.textContent = 'Start';
  }
};

// Open settings modal
const openSettingsModal = () => {
  const modal = document.createElement('div');
  modal.id = 'settings-modal';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.backgroundColor = 'white';
  modal.style.padding = '20px';
  modal.style.borderRadius = '5px';
  modal.style.zIndex = '10000';
  modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  modal.innerHTML = `
    <label for="start-minutes">Start Minutes:</label>
    <input type="number" id="start-minutes" min="0" max="120" value="${Math.floor(remainingTime / 60)}">
    <button id="save-settings-btn">Save</button>
    <button id="close-settings-btn">Close</button>
  `;
  document.body.appendChild(modal);

  // Close modal
  document.getElementById('close-settings-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Save new start time
  document.getElementById('save-settings-btn').addEventListener('click', () => {
    const newMinutes = parseInt(document.getElementById('start-minutes').value, 10);
    remainingTime = newMinutes * 60;
    updateDisplay();
    document.body.removeChild(modal);
  });
};

// Function to attach event listeners once elements are added to the DOM
const attachEventListeners = () => {
  document.getElementById('toggle-btn').addEventListener('click', toggleTimer);
  document.getElementById('settings-btn').addEventListener('click', openSettingsModal);
};

// Initial update display
updateDisplay();
