// Initial default values
let defaultSeconds = 120; // 2 minutes in seconds
let startingTime = defaultSeconds; // Save initial start time in seconds for reset
let remainingTime = startingTime;
let selectedSound = 'chime'; // Default sound key
let defaultPosition = 'top-left'; // Default timer position

// Quick select options in seconds
const quickSelect1Min = 60;    // 1 minute
const quickSelect2Min = 120;   // 2 minutes
const quickSelect5Min = 300;   // 5 minutes
const quickSelect10Min = 600;  // 10 minutes

// Preload audio elements
const sounds = {
  chime: new Audio(chrome.runtime.getURL('audio/chime.mp3')),
  beep: new Audio(chrome.runtime.getURL('audio/beep.mp3')),
  alarm: new Audio(chrome.runtime.getURL('audio/alarm.mp3'))
};


// Function to play the selected sound
const playCompletionSound = () => {
  if (sounds[selectedSound]) {
    sounds[selectedSound].play();
  }
};

// Function to apply position to the timer overlay
const setPosition = (position) => {
  timerOverlay.style.top = timerOverlay.style.bottom = timerOverlay.style.left = timerOverlay.style.right = 'auto';
  timerOverlay.style.transform = '';

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

// Retrieve saved timer position and sound selection on load
chrome.storage.sync.get(['timerPosition', 'completionSound'], (result) => {
  defaultPosition = result.timerPosition || defaultPosition; // Use saved position or default to "top-left"
  setPosition(defaultPosition); // Apply the position to the timer overlay

  selectedSound = result.completionSound || selectedSound; // Use saved sound or default to "chime"
  Object.values(sounds).forEach((sound) => {
    sound.volume = savedVolume; // Use the saved volume
  });
});

// Create the timer overlay and controls
const timerOverlay = document.createElement('div');
timerOverlay.id = 'meet-timer-overlay';
timerOverlay.style.position = 'absolute';
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

      // Attach event listeners after the overlay is added
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

// Convert seconds to display format (MM:SS)
const updateDisplay = () => {
  const timerDisplay = document.getElementById('timer-display');
  if (!timerDisplay) return; // Exit if timer-display is not found

  const isNegative = remainingTime < 0;
  const absTime = Math.abs(remainingTime);
  const minutes = Math.floor(absTime / 60);
  const seconds = absTime % 60;
  timerDisplay.textContent = `${isNegative ? '-' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Start countdown
const startCountdown = () => {
  if (countdown) clearInterval(countdown);
  isPaused = false;
  countdown = setInterval(() => {
    if (!isPaused) {
      remainingTime--;
      updateDisplay();
      if (remainingTime === 0) {
        playCompletionSound();
      }
    }
  }, 1000);
};

// Function to stop all sounds
const stopAllSounds = () => {
  Object.values(sounds).forEach((sound) => {
    sound.pause();
    sound.currentTime = 0;
  });
};

// Modify toggleTimer to stop sound when pausing
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
    stopAllSounds(); // Stop sound on pause
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

// Function to set the timer time immediately based on quick select (in seconds)
const setQuickSelectTime = (seconds) => {
  remainingTime = seconds;
  updateDisplay();
};


// Function to close the settings modal
const closeSettingsModal = () => {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    document.body.removeChild(modal);
  }
};


// Open settings modal
const openSettingsModal = () => {
  stopAllSounds(); // Stop sound when settings are opened

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
    <div>
      <label for="start-minutes">Minutes:</label>
      <input type="number" id="start-minutes" min="0" max="120" value="${Math.floor(startingTime / 60)}">
      <label for="start-seconds">Seconds:</label>
      <input type="number" id="start-seconds" min="0" max="59" value="${startingTime % 60}">
    </div>
    <div>
      <label>Quick Select Timer:</label>
      <div>
        <button id="quick-select-1min">1 Minute</button>
        <button id="quick-select-2min">2 Minutes</button>
        <button id="quick-select-5min">5 Minutes</button>
        <button id="quick-select-10min">10 Minutes</button>
      </div>
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
    <div>
      <label for="sound-select">Completion Sound:</label>
      <select id="sound-select">
        <option value="chime">Chime</option>
        <option value="beep">Beep</option>
        <option value="alarm">Alarm</option>
      </select>
    </div>
    <button id="save-settings-btn">Save</button>
    <button id="close-settings-btn">Close</button>
  `;
  document.body.appendChild(modal);

  // Set default values in settings
  document.getElementById('timer-position').value = defaultPosition;
  document.getElementById('sound-select').value = selectedSound;
  // Event listeners for quick select buttons to set time and close modal
  document.getElementById('quick-select-1min').addEventListener('click', () => {
    setQuickSelectTime(quickSelect1Min);
    closeSettingsModal();
  });
  document.getElementById('quick-select-2min').addEventListener('click', () => {
    setQuickSelectTime(quickSelect2Min);
    closeSettingsModal();
  });
  document.getElementById('quick-select-5min').addEventListener('click', () => {
    setQuickSelectTime(quickSelect5Min);
    closeSettingsModal();
  });
  document.getElementById('quick-select-10min').addEventListener('click', () => {
    setQuickSelectTime(quickSelect10Min);
    closeSettingsModal();
  });

  // Event listeners for saving and closing settings
  document.getElementById('close-settings-btn').addEventListener('click', closeSettingsModal);

  // Save settings
  document.getElementById('save-settings-btn').addEventListener('click', () => {
    const newMinutes = parseInt(document.getElementById('start-minutes').value, 10);
    const newSeconds = parseInt(document.getElementById('start-seconds').value, 10);
    startingTime = newMinutes * 60 + newSeconds;
    remainingTime = startingTime;
    updateDisplay();

    // Update timer position based on selected option and save it as the default position
    defaultPosition = document.getElementById('timer-position').value;
    setPosition(defaultPosition);
    chrome.storage.sync.set({ timerPosition: defaultPosition });

    // Update selected sound
    selectedSound = document.getElementById('sound-select').value;
    chrome.storage.sync.set({ completionSound: selectedSound });

    document.body.removeChild(modal);
  });
};

// Function to attach event listeners once elements are added to the DOM
const attachEventListeners = () => {
  const toggleButton = document.getElementById('toggle-btn');
  const resetButton = document.getElementById('reset-btn');
  const settingsButton = document.getElementById('settings-btn');
  const timerDisplay = document.getElementById('timer-display');

  // Check that each element exists before adding event listeners or updating properties
  if (toggleButton) toggleButton.addEventListener('click', toggleTimer);
  if (resetButton) resetButton.addEventListener('click', resetTimer);
  if (settingsButton) settingsButton.addEventListener('click', openSettingsModal);

  // Call updateDisplay to set the initial timer display
  if (timerDisplay) updateDisplay();
};

// Initial display setup and apply saved position
updateDisplay();
