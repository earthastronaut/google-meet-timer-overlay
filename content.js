// Initial default values
let defaultSeconds = 120; // 2 minutes in seconds
let startingTime = defaultSeconds; // Save initial start time in seconds for reset
let remainingTime = startingTime;
let selectedSound = 'crusade'; // Default sound key
let defaultPosition = 'top-left'; // Default timer position

// Quick select options in seconds
const quickSelect1Min = 60;    // 1 minute
const quickSelect2Min = 120;   // 2 minutes
const quickSelect5Min = 300;   // 5 minutes
const quickSelect10Min = 600;  // 10 minutes

// Preload audio elements
const sounds = {
  crusade: new Audio(chrome.runtime.getURL('audio/crusade.mp3')),
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

  // Check if the selected sound exists in the sounds object; fallback to "chime" if it does not
  const defaultSound = Object.keys(sounds)[0];
  selectedSound = result.completionSound && sounds[result.completionSound] ? result.completionSound : defaultSound;

});

const t = {
  play: "⏵",
  pause: "⏸",
  reset: "🔄",
  settings: "⚙️",
};

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
  <button id="toggle-btn" style="background: transparent; color: white; border: none; font-size: 16px;">${t.play}</button>
  <button id="reset-btn" style="background: transparent; color: white; border: none; font-size: 16px;">${t.reset}</button>
  <button id="settings-btn" style="background: transparent; color: white; border: none; font-size: 16px;">${t.settings}</button>
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
    toggleButton.textContent = t.pause;
  } else {
    isPaused = true;
    toggleButton.textContent = t.play;
    stopAllSounds(); // Stop sound on pause
  }
};

// Reset the timer
const resetTimer = () => {
  stopAllSounds();
  isPaused = true;
  clearInterval(countdown);
  remainingTime = startingTime;
  updateDisplay();
  document.getElementById('toggle-btn').textContent = t.play;
};

// Main function to open settings modal
const openSettingsModal = () => {
  stopAllSounds(); // Stop sound when settings are opened

  const modal = createMainModal();

  // Append each section to the modal
  modal.append(createTimerDurationSection(), createSettingsSection(), createActionButtonsSection());

  // Append modal to the document body
  document.body.appendChild(modal);

  // Set default values in settings
  document.getElementById('timer-position').value = defaultPosition;
  document.getElementById('sound-select').value = selectedSound;
};

// Function to create the main modal container
const createMainModal = () => {
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
  return modal;
};

// Function to create the Timer Duration section
const createTimerDurationSection = () => {
  const timerDurationDiv = document.createElement('div');
  const timerDurationHeader = document.createElement('h2');
  timerDurationHeader.textContent = "Select Timer Duration";

  const timerLabel = document.createElement('label');
  timerLabel.textContent = "Timer:";

  const startMinutesInput = document.createElement('input');
  startMinutesInput.type = 'number';
  startMinutesInput.id = 'start-minutes';
  startMinutesInput.min = '0';
  startMinutesInput.max = '120';
  startMinutesInput.value = Math.floor(startingTime / 60);

  const colonLabel = document.createElement('label');
  colonLabel.textContent = ":";

  const startSecondsInput = document.createElement('input');
  startSecondsInput.type = 'number';
  startSecondsInput.id = 'start-seconds';
  startSecondsInput.min = '0';
  startSecondsInput.max = '59';
  startSecondsInput.value = startingTime % 60;

  // Quick Select Buttons for Timer Duration
  const quickSelectDiv = document.createElement('div');
  quickSelectDiv.append(
    createQuickSelectButton('1 Minute', 60),
    createQuickSelectButton('2 Minutes', 120),
    createQuickSelectButton('5 Minutes', 300),
    createQuickSelectButton('10 Minutes', 600)
  );

  // Append elements to the Timer Duration section
  timerDurationDiv.append(timerDurationHeader, timerLabel, startMinutesInput, colonLabel, startSecondsInput, quickSelectDiv);
  return timerDurationDiv;
};

// Helper function to create individual quick-select buttons
const createQuickSelectButton = (text, timeInSeconds) => {
  const button = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', () => {
    setQuickSelectTime(timeInSeconds);
    closeSettingsModal();
  });
  return button;
};

// Function to set the quick-select time immediately
const setQuickSelectTime = (seconds) => {
  remainingTime = seconds;
  updateDisplay();
};

// Function to create the Settings section
const createSettingsSection = () => {
  const settingsDiv = document.createElement('div');
  const settingsHeader = document.createElement('h2');
  settingsHeader.textContent = "Settings";

  // Timer Position dropdown
  const timerPositionDiv = document.createElement('div');
  const positionLabel = document.createElement('label');
  positionLabel.textContent = "Timer Position:";
  const timerPositionSelect = document.createElement('select');
  timerPositionSelect.id = 'timer-position';

  const positionOptions = ["top-left", "top-center", "top-right", "middle-left", "middle-center", "middle-right", "bottom-left", "bottom-center", "bottom-right"];
  positionOptions.forEach(position => {
    const option = document.createElement('option');
    option.value = position;
    option.textContent = position.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize each word
    timerPositionSelect.appendChild(option);
  });

  timerPositionDiv.append(positionLabel, timerPositionSelect);

  // Completion Sound dropdown
  const soundDiv = document.createElement('div');
  const soundLabel = document.createElement('label');
  soundLabel.setAttribute('for', 'sound-select');
  soundLabel.textContent = "Completion Sound:";
  const soundSelect = document.createElement('select');
  soundSelect.id = 'sound-select';

  Object.keys(sounds).forEach(sound => {
    const option = document.createElement('option');
    option.value = sound;
    option.textContent = sound.charAt(0).toUpperCase() + sound.slice(1); // Capitalize first letter
    soundSelect.appendChild(option);
  });

  soundDiv.append(soundLabel, soundSelect);

  // Append elements to the Settings section
  settingsDiv.append(settingsHeader, timerPositionDiv, soundDiv);
  return settingsDiv;
};

// Function to create the Action Buttons section
const createActionButtonsSection = () => {
  const actionDiv = document.createElement('div');
  actionDiv.style.textAlign = 'right';

  const saveButton = document.createElement('button');
  saveButton.id = 'save-settings-btn';
  saveButton.textContent = 'Save';
  saveButton.addEventListener('click', saveSettings);

  const closeButton = document.createElement('button');
  closeButton.id = 'close-settings-btn';
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', closeSettingsModal);

  actionDiv.append(saveButton, closeButton);
  return actionDiv;
};

// Function to close the settings modal
const closeSettingsModal = () => {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    document.body.removeChild(modal);
  }
};

// Function to save settings
const saveSettings = () => {
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

  closeSettingsModal();
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
