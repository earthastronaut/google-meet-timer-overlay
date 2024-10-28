// Initial default values
let defaultMinutes = 2;
let defaultSeconds = 0;
let startingTime = defaultMinutes * 60; // Save initial start time to reset to
let remainingTime = startingTime;

// Create the timer overlay and controls
const timerOverlay = document.createElement('div');
timerOverlay.id = 'meet-timer-overlay';
timerOverlay.style.position = 'absolute';
timerOverlay.style.top = '10px';
timerOverlay.style.left = '10px';
timerOverlay.style.padding = '5px 10px';
timerOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
timerOverlay.style.color = 'white';
timerOverlay.style.fontSize = '16px';
timerOverlay.style.borderRadius = '5px';
timerOverlay.style.zIndex = '9999';
timerOverlay.innerHTML = `
  <div id="timer-display">00:00</div>
  <button id="toggle-btn">Play</button>
  <button id="reset-btn" style="display: none;">Reset</button>
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

const updateDisplay = () => {
  const isNegative = remainingTime < 0;
  const absTime = Math.abs(remainingTime);
  const minutes = Math.floor(absTime / 60);
  const seconds = absTime % 60;
  document.getElementById('timer-display').textContent = `${isNegative ? '-' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Start countdown
const startCountdown = () => {
  if (countdown) clearInterval(countdown);
  isPaused = false;
  countdown = setInterval(() => {
    if (!isPaused) {
      remainingTime--;
      updateDisplay();
    }
  }, 1000);
};

// Toggle between play and pause
const toggleTimer = () => {
  const toggleButton = document.getElementById('toggle-btn');
  const resetButton = document.getElementById('reset-btn');
  if (isPaused) {
    startCountdown();
    toggleButton.textContent = 'Pause';
    resetButton.style.display = 'none';
  } else {
    isPaused = true;
    toggleButton.textContent = 'Play';
    resetButton.style.display = 'inline';
  }
};

// Reset the timer
const resetTimer = () => {
  isPaused = true;
  clearInterval(countdown);
  remainingTime = startingTime;
  updateDisplay();
  document.getElementById('toggle-btn').textContent = 'Play';
  document.getElementById('reset-btn').style.display = 'none';
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
    <label for="start-minutes">Minutes:</label>
    <input type="number" id="start-minutes" min="0" max="120" value="${Math.floor(startingTime / 60)}">
    <label for="start-seconds">Seconds:</label>
    <input type="number" id="start-seconds" min="0" max="59" value="${startingTime % 60}">
    <div>
      <button id="quick-1min">1 Minute</button>
      <button id="quick-3min">3 Minutes</button>
      <button id="quick-5min">5 Minutes</button>
      <button id="quick-10min">10 Minutes</button>
    </div>
    <div>
      <label>Timer Position:</label>
      <select id="timer-position">
        <option value="top-left">Top Left</option>
        <option value="top-center">Top Center</option>
        <option value="top-right">Top Right</option>
        <option value="middle-left">Middle Left</option>
        <option value="middle-center">Middle Center</option>
        <option value="middle-right">Middle Right</option>
        <option value="bottom-left">Bottom Left</option>
        <option value="bottom-center">Bottom Center</option>
        <option value="bottom-right">Bottom Right</option>
      </select>
    </div>
    <button id="save-settings-btn">Save</button>
    <button id="close-settings-btn">Close</button>
  `;
  document.body.appendChild(modal);

  // Set default position
  document.getElementById('timer-position').value = 'top-left';

  // Event listeners for quick-select buttons
  document.getElementById('quick-1min').addEventListener('click', () => setQuickTime(1));
  document.getElementById('quick-3min').addEventListener('click', () => setQuickTime(3));
  document.getElementById('quick-5min').addEventListener('click', () => setQuickTime(5));
  document.getElementById('quick-10min').addEventListener('click', () => setQuickTime(10));

  // Set quick time
  const setQuickTime = (minutes) => {
    document.getElementById('start-minutes').value = minutes;
    document.getElementById('start-seconds').value = 0;
  };

  // Close modal
  document.getElementById('close-settings-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Save settings
  document.getElementById('save-settings-btn').addEventListener('click', () => {
    const newMinutes = parseInt(document.getElementById('start-minutes').value, 10);
    const newSeconds = parseInt(document.getElementById('start-seconds').value, 10);
    startingTime = newMinutes * 60 + newSeconds;
    remainingTime = startingTime;
    updateDisplay();

    // Update timer position based on selected option
    const position = document.getElementById('timer-position').value;
    setPosition(position);

    document.body.removeChild(modal);
  });
};

// Set timer position
const setPosition = (position) => {
  // Reset position styles
  timerOverlay.style.top = timerOverlay.style.bottom = timerOverlay.style.left = timerOverlay.style.right = 'auto';
  timerOverlay.style.transform = '';

  // Apply new position styles
  switch (position) {
    case 'top-left':
      timerOverlay.style.top = '10px';
      timerOverlay.style.left = '10px';
      break;
    case 'top-center':
      timerOverlay.style.top = '10px';
      timerOverlay.style.left = '50%';
      timerOverlay.style.transform = 'translateX(-50%)';
      break;
    case 'top-right':
      timerOverlay.style.top = '10px';
      timerOverlay.style.right = '10px';
      break;
    case 'middle-left':
      timerOverlay.style.top = '50%';
      timerOverlay.style.left = '10px';
      timerOverlay.style.transform = 'translateY(-50%)';
      break;
    case 'middle-center':
      timerOverlay.style.top = '50%';
      timerOverlay.style.left = '50%';
      timerOverlay.style.transform = 'translate(-50%, -50%)';
      break;
    case 'middle-right':
      timerOverlay.style.top = '50%';
      timerOverlay.style.right = '10px';
      timerOverlay.style.transform = 'translateY(-50%)';
      break;
    case 'bottom-left':
      timerOverlay.style.bottom = '10px';
      timerOverlay.style.left = '10px';
      break;
    case 'bottom-center':
      timerOverlay.style.bottom = '10px';
      timerOverlay.style.left = '50%';
      timerOverlay.style.transform = 'translateX(-50%)';
      break;
    case 'bottom-right':
      timerOverlay.style.bottom = '10px';
      timerOverlay.style.right = '10px';
      break;
  }
};

// Function to attach event listeners once elements are added to the DOM
const attachEventListeners = () => {
  document.getElementById('toggle-btn').addEventListener('click', toggleTimer);
  document.getElementById('reset-btn').addEventListener('click', resetTimer);
  document.getElementById('settings-btn').addEventListener('click', openSettingsModal);
};

// Initial display setup
updateDisplay();
setPosition('top-left');
