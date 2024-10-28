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
let remainingTime = 0;

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
  remainingTime = 0;
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
    <input type="number" id="start-minutes" min="0" max="120" value="${Math.floor(Math.abs(remainingTime) / 60)}">
    <label for="start-seconds">Seconds:</label>
    <input type="number" id="start-seconds" min="0" max="59" value="${Math.abs(remainingTime) % 60}">
    <div>
      <button id="quick-1min">1 Minute</button>
      <button id="quick-3min">3 Minutes</button>
      <button id="quick-5min">5 Minutes</button>
      <button id="quick-10min">10 Minutes</button>
    </div>
    <div>
      <label>Vertical Position:</label>
      <select id="vertical-position">
        <option value="top">Top</option>
        <option value="middle">Middle</option>
        <option value="bottom" selected>Bottom</option>
      </select>
      <label>Horizontal Position:</label>
      <select id="horizontal-position">
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right" selected>Right</option>
      </select>
    </div>
    <button id="save-settings-btn">Save</button>
    <button id="close-settings-btn">Close</button>
  `;
  document.body.appendChild(modal);

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
    remainingTime = newMinutes * 60 + newSeconds;
    updateDisplay();

    // Update timer position based on selected options
    const verticalPos = document.getElementById('vertical-position').value;
    const horizontalPos = document.getElementById('horizontal-position').value;
    timerOverlay.style.top = verticalPos === 'top' ? '10px' : verticalPos === 'middle' ? '50%' : 'auto';
    timerOverlay.style.bottom = verticalPos === 'bottom' ? '10px' : 'auto';
    timerOverlay.style.left = horizontalPos === 'left' ? '10px' : horizontalPos === 'center' ? '50%' : 'auto';
    timerOverlay.style.right = horizontalPos === 'right' ? '10px' : 'auto';
    timerOverlay.style.transform = horizontalPos === 'center' ? 'translateX(-50%)' : verticalPos === 'middle' ? 'translateY(-50%)' : '';

    document.body.removeChild(modal);
  });
};

// Function to attach event listeners once elements are added to the DOM
const attachEventListeners = () => {
  document.getElementById('toggle-btn').addEventListener('click', toggleTimer);
  document.getElementById('reset-btn').addEventListener('click', resetTimer);
  document.getElementById('settings-btn').addEventListener('click', openSettingsModal);
};

// Initial update display
updateDisplay();
