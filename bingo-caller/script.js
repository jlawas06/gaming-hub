class BingoCaller {
    constructor() {
        this.calledNumbers = new Set();
        this.availableNumbers = new Set();
        this.currentNumber = null;
        this.lastNumber = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.timeoutId = null;  // Add timeout ID tracking
        this.callSequence = 0;  // Track sequence of called numbers

        // Load settings from localStorage or use defaults
        this.settings = {
            speechRate: parseFloat(localStorage.getItem('speechRate')) || 0.9,
            speechPitch: parseFloat(localStorage.getItem('speechPitch')) || 1,
            speechVolume: parseFloat(localStorage.getItem('speechVolume')) || 1,
            defaultInterval: parseInt(localStorage.getItem('defaultInterval')) || 5
        };
        this.interval = this.settings.defaultInterval * 1000;

        // Initialize available numbers (1-75)
        for (let i = 1; i <= 75; i++) {
            this.availableNumbers.add(i);
        }

        this.initializeElements();
        this.initializeGrid();
        this.initializeEventListeners();
        this.initializeSettings();

        // Test speech synthesis availability
        if ('speechSynthesis' in window) {
            console.log('Speech synthesis is available');
        } else {
            console.log('Speech synthesis is not available');
        }
    }

    initializeElements() {
        this.elements = {
            currentNumber: document.getElementById('currentNumber'),
            currentLetter: document.getElementById('currentLetter'),
            ballDisplay: document.getElementById('ballDisplay'),
            lastCalled: document.getElementById('lastCalled'),
            startPauseBtn: document.getElementById('startPauseBtn'),
            newGameBtn: document.getElementById('newGameBtn'),
            bingoWinnerBtn: document.getElementById('bingoWinnerBtn'),
            intervalSelect: document.getElementById('intervalSelect'),
            muteBtn: document.getElementById('muteBtn'),
            bingoGrid: document.getElementById('bingoGrid'),
            numbersCalledCount: document.getElementById('numbersCalledCount'),
            remainingCount: document.getElementById('remainingCount'),
            confettiContainer: document.getElementById('confettiContainer'),
            callLogsContainer: document.getElementById('callLogsContainer'),
            settingsBtn: document.getElementById('settingsBtn'),
            settingsModal: document.getElementById('settingsModal'),
            closeBtn: document.querySelector('.close-btn'),
            saveSettings: document.getElementById('saveSettings'),
            speechRate: document.getElementById('speechRate'),
            speechPitch: document.getElementById('speechPitch'),
            speechVolume: document.getElementById('speechVolume'),
            defaultInterval: document.getElementById('defaultInterval')
        };
    }

    initializeSettings() {
        // Set initial values in the settings modal
        this.elements.speechRate.value = this.settings.speechRate;
        this.elements.speechPitch.value = this.settings.speechPitch;
        this.elements.speechVolume.value = this.settings.speechVolume;
        this.elements.defaultInterval.value = this.settings.defaultInterval;

        // Update value displays
        this.updateValueDisplay(this.elements.speechRate);
        this.updateValueDisplay(this.elements.speechPitch);
        this.updateValueDisplay(this.elements.speechVolume);

        // Set initial interval select value
        this.elements.intervalSelect.value = this.settings.defaultInterval;
    }

    initializeGrid() {
        const board = this.elements.bingoGrid;
        board.innerHTML = '';

        // Classic flashboard layout: one row per letter, 15 numbers across
        const letters = ['B', 'I', 'N', 'G', 'O'];

        letters.forEach((letter, rowIndex) => {
            const row = document.createElement('div');
            row.className = 'board-row';
            row.dataset.letter = letter;

            const letterTile = document.createElement('div');
            letterTile.className = 'board-letter';
            letterTile.textContent = letter;
            row.appendChild(letterTile);

            for (let i = 1; i <= 15; i++) {
                const number = rowIndex * 15 + i;
                const cell = document.createElement('div');
                cell.className = 'number-cell';
                cell.textContent = number;
                cell.dataset.number = number;
                row.appendChild(cell);
            }

            board.appendChild(row);
        });
    }

    initializeEventListeners() {
        this.elements.startPauseBtn.addEventListener('click', () => this.toggleGame());
        this.elements.newGameBtn.addEventListener('click', () => this.newGame());
        this.elements.bingoWinnerBtn.addEventListener('click', () => this.celebrateWinner());

        this.elements.intervalSelect.addEventListener('change', (e) => {
            this.interval = parseInt(e.target.value) * 1000;
        });

        this.elements.muteBtn.addEventListener('click', () => this.toggleMute());

        // Settings modal event listeners
        this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        this.elements.closeBtn.addEventListener('click', () => this.hideSettings());
        this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        
        // Range input event listeners
        this.elements.speechRate.addEventListener('input', (e) => this.updateValueDisplay(e.target));
        this.elements.speechPitch.addEventListener('input', (e) => this.updateValueDisplay(e.target));
        this.elements.speechVolume.addEventListener('input', (e) => this.updateValueDisplay(e.target));

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.hideSettings();
            }
        });

        // Add click handlers for manual number selection (for testing/manual mode)
        // this.elements.bingoGrid.addEventListener('click', (e) => {
        //     if (e.target.classList.contains('number-cell') && !this.isPlaying) {
        //         const number = parseInt(e.target.dataset.number);
        //         if (!this.calledNumbers.has(number)) {
        //             this.callNumber(number);
        //         }
        //     }
        // });
    }

    updateValueDisplay(input) {
        const display = input.nextElementSibling;
        display.textContent = parseFloat(input.value).toFixed(1);
    }

    showSettings() {
        this.elements.settingsModal.classList.add('show');
    }

    hideSettings() {
        this.elements.settingsModal.classList.remove('show');
    }

    saveSettings() {
        // Update settings object
        this.settings = {
            speechRate: parseFloat(this.elements.speechRate.value),
            speechPitch: parseFloat(this.elements.speechPitch.value),
            speechVolume: parseFloat(this.elements.speechVolume.value),
            defaultInterval: parseInt(this.elements.defaultInterval.value)
        };

        // Save to localStorage
        Object.entries(this.settings).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });

        // Update current interval if not playing
        if (!this.isPlaying) {
            this.interval = this.settings.defaultInterval * 1000;
            this.elements.intervalSelect.value = this.settings.defaultInterval;
        }

        this.hideSettings();
    }

    getLetterForNumber(number) {
        if (number >= 1 && number <= 15) return 'B';
        if (number >= 16 && number <= 30) return 'I';
        if (number >= 31 && number <= 45) return 'N';
        if (number >= 46 && number <= 60) return 'G';
        if (number >= 61 && number <= 75) return 'O';
        return '';
    }

    getRandomNumber() {
        if (this.availableNumbers.size === 0) {
            return null;
        }

        const availableArray = Array.from(this.availableNumbers);
        const randomIndex = Math.floor(Math.random() * availableArray.length);
        return availableArray[randomIndex];
    }

    async callNumber(number) {
        if (!number) return;
        
        // Update last called number
        if (this.currentNumber) {
            this.lastNumber = this.currentNumber;
            this.elements.lastCalled.textContent = `${this.getLetterForNumber(this.lastNumber)}-${this.lastNumber}`;
        }
        
        // Set current number
        this.currentNumber = number;
        this.calledNumbers.add(number);
        this.availableNumbers.delete(number);
        
        // Update display
        const letter = this.getLetterForNumber(number);
        this.elements.currentNumber.textContent = number;
        this.elements.currentLetter.textContent = letter;

        // Color the ball for this letter and replay its entrance
        const ball = this.elements.ballDisplay;
        ball.dataset.letter = letter;
        ball.classList.remove('pop');
        void ball.offsetWidth;
        ball.classList.add('pop');
        
        // Update grid
        this.updateGrid();
        
        // Update statistics
        this.updateStats();
        
        // Add to call log
        this.addToCallLog(letter, number);
        
        // Speak the number and wait for it to complete
        await this.speakNumber(letter, number);
        
        // Check if game is complete
        if (this.availableNumbers.size === 0) {
            this.gameComplete();
        }
    }

    updateGrid() {
        const cells = this.elements.bingoGrid.querySelectorAll('.number-cell');

        cells.forEach(cell => {
            const number = parseInt(cell.dataset.number);

            // Remove all special classes first
            cell.classList.remove('called', 'current');

            if (number === this.currentNumber) {
                cell.classList.add('current');
            } else if (this.calledNumbers.has(number)) {
                cell.classList.add('called');
            }
        });
    }

    updateStats() {
        this.elements.numbersCalledCount.textContent = this.calledNumbers.size;
        this.elements.remainingCount.textContent = this.availableNumbers.size;
    }

    addToCallLog(letter, number) {
        // Remove "no logs" message if it exists
        const noLogsMsg = this.elements.callLogsContainer.querySelector('.no-logs');
        if (noLogsMsg) {
            noLogsMsg.remove();
        }

        // Increment sequence counter
        this.callSequence++;

        // Create log entry
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        // Main number display
        const numberSpan = document.createElement('span');
        numberSpan.className = 'log-number';
        numberSpan.textContent = `${letter}-${number}`;

        // Sequence number display
        const sequenceSpan = document.createElement('span');
        sequenceSpan.className = 'log-sequence';
        sequenceSpan.textContent = `#${this.callSequence}`;
        
        logEntry.appendChild(numberSpan);
        logEntry.appendChild(sequenceSpan);
        
        // Remove highlight from previous latest entry
        const previousLatest = this.elements.callLogsContainer.querySelector('.log-entry.latest');
        if (previousLatest) {
            previousLatest.classList.remove('latest');
        }
        
        // Add highlight to new entry
        logEntry.classList.add('latest');
        
        // Add to top of logs (most recent first)
        this.elements.callLogsContainer.insertBefore(logEntry, this.elements.callLogsContainer.firstChild);
        
        // Auto-scroll to top to show the latest entry
        this.elements.callLogsContainer.scrollTop = 0;
    }

    clearCallLog() {
        this.elements.callLogsContainer.innerHTML = '<div class="no-logs">No numbers called yet</div>';
        this.callSequence = 0; // Reset sequence counter
    }

    speakNumber(letter, number) {
        if (!('speechSynthesis' in window) || this.isMuted) return Promise.resolve();

        // Cancel any ongoing speech
        speechSynthesis.cancel();

        return new Promise((resolve) => {
            // Create utterance
            const utterance = new SpeechSynthesisUtterance(`${letter}, ${number}`);
            utterance.rate = this.settings.speechRate;
            utterance.pitch = this.settings.speechPitch;
            utterance.volume = this.settings.speechVolume;

            // Add event listener for when speech ends
            utterance.onend = () => {
                resolve();
            };

            // Speak
            speechSynthesis.speak(utterance);
        });
    }

    toggleGame() {
        if (this.isPlaying) {
            this.pauseGame();
        } else {
            this.startGame();
        }
    }

    async startGame() {
        if (this.availableNumbers.size === 0) {
            this.showToast('All 75 numbers have been called. Press New game to start over.');
            return;
        }

        this.isPlaying = true;
        this.elements.startPauseBtn.textContent = 'Pause';
        this.elements.startPauseBtn.classList.add('is-playing');

        // Show BINGO button when game starts
        this.elements.bingoWinnerBtn.classList.add('visible');

        // Set up recursive function for subsequent numbers
        const callNextNumber = async () => {
            if (!this.isPlaying) return;

            const nextNumber = this.getRandomNumber();
            if (nextNumber) {
                await this.callNumber(nextNumber);
                // Only schedule next call if still playing
                if (this.isPlaying) {
                    // Speech adds roughly a second; when muted there is no
                    // speech to wait for, so use the full interval
                    const delay = this.isMuted
                        ? this.interval
                        : Math.max(0, this.interval - 1000);
                    this.timeoutId = setTimeout(callNextNumber, delay);
                }
            } else {
                this.pauseGame();
            }
        };

        // Start the recursive calling
        callNextNumber();
    }

    pauseGame() {
        this.isPlaying = false;
        this.elements.startPauseBtn.textContent = 'Start';
        this.elements.startPauseBtn.classList.remove('is-playing');
        
        // Clear any pending timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    newGame() {
        // Stop current game
        this.pauseGame();

        // Reset all game state
        this.calledNumbers.clear();
        this.availableNumbers.clear();
        this.currentNumber = null;
        this.lastNumber = null;
        this.timeoutId = null;  // Reset timeout ID

        // Reinitialize available numbers
        for (let i = 1; i <= 75; i++) {
            this.availableNumbers.add(i);
        }

        // Reset display
        this.elements.currentNumber.textContent = '–';
        this.elements.currentLetter.textContent = '';
        this.elements.lastCalled.textContent = '—';
        this.elements.ballDisplay.dataset.letter = '';
        this.elements.ballDisplay.classList.remove('pop');

        // Hide BINGO button when starting new game
        this.elements.bingoWinnerBtn.classList.remove('visible');

        // Reset grid
        const cells = this.elements.bingoGrid.querySelectorAll('.number-cell');
        cells.forEach(cell => {
            cell.classList.remove('called', 'current');
        });

        // Reset stats
        this.updateStats();

        // Clear call log
        this.clearCallLog();

        // Cancel any ongoing speech
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }

        // Clear any celebration
        this.clearCelebration();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.elements.muteBtn.classList.toggle('muted', this.isMuted);
        this.elements.muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
        this.elements.muteBtn.setAttribute('aria-label',
            this.isMuted ? 'Unmute the caller voice' : 'Mute the caller voice');

        // Stop any call that is mid-announcement
        if (this.isMuted && 'speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }

    gameComplete() {
        this.pauseGame();

        // Speak game complete message
        if ('speechSynthesis' in window) {
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance('Bingo game complete! All numbers have been called.');
                utterance.rate = 0.7;
                speechSynthesis.speak(utterance);
            }, 1000);
        }

        // Show completion message
        setTimeout(() => {
            this.showToast('🎉 All 75 numbers have been called! Press New game to play again.');
        }, 1500);
    }

    showToast(text) {
        const existing = document.querySelector('.hall-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'hall-toast';
        toast.setAttribute('role', 'status');
        toast.textContent = text;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 4000);
    }

    celebrateWinner() {
        // Pause the game if it's running
        if (this.isPlaying) {
            this.pauseGame();
        }

        // Create confetti
        this.createConfetti();

        // Show winner message
        this.showWinnerMessage();

        // Speak congratulations
        this.speakCongratulations();

        // Auto-clear after 5 seconds
        setTimeout(() => {
            this.clearCelebration();
        }, 5000);
    }

    createConfetti() {
        const container = this.elements.confettiContainer;
        container.innerHTML = ''; // Clear existing confetti

        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Create all confetti pieces at once
        const createConfettiBatch = (count, delay = 0) => {
            for (let i = 0; i < count; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                
                // Random properties
                const size = Math.random() * 12 + 4; // 4-16px
                const duration = Math.random() * 3.5 + 1.5; // 1.5-5s
                
                Object.assign(confetti.style, {
                    left: `${Math.random() * 100}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                    transform: `rotate(${Math.random() * 360}deg)`
                });
                
                fragment.appendChild(confetti);
            }
        };

        // Create three batches of confetti with different delays
        createConfettiBatch(300, 0); // Initial burst
        createConfettiBatch(150, 1); // Second burst
        createConfettiBatch(100, 2); // Third burst

        // Add all confetti to the container at once
        container.appendChild(fragment);
    }

    showWinnerMessage() {
        // Remove existing winner message if any
        const existingMessage = document.querySelector('.winner-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create winner message
        const message = document.createElement('div');
        message.className = 'winner-message';
        message.innerHTML = '🎉 BINGO WINNER! 🎉<br><span style="font-size: 1.2rem;">Congratulations!</span>';

        document.body.appendChild(message);
    }

    speakCongratulations() {
        if (!('speechSynthesis' in window)) return;

        // Cancel any ongoing speech
        speechSynthesis.cancel();

        // Create congratulations utterance
        const utterance = new SpeechSynthesisUtterance('Congratulations! We have a BINGO winner! Well done!');
        utterance.rate = 1;
        utterance.pitch = 1.2;
        utterance.volume = 1;

        // Speak
        speechSynthesis.speak(utterance);
    }

    clearCelebration() {
        // Clear confetti
        this.elements.confettiContainer.innerHTML = '';

        // Remove winner message
        const message = document.querySelector('.winner-message');
        if (message) {
            message.remove();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.bingoCaller = new BingoCaller();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!window.bingoCaller) return;

    // Don't hijack keys while typing in the settings form
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

    switch (e.key) {
        case ' ': // Spacebar to start/pause
            e.preventDefault();
            window.bingoCaller.toggleGame();
            break;
        case 'n': // 'n' for new game
        case 'N':
            e.preventDefault();
            window.bingoCaller.newGame();
            break;
        case 'm': // 'm' to mute/unmute
        case 'M':
            e.preventDefault();
            window.bingoCaller.toggleMute();
            break;
        case 'b': // 'b' for BINGO winner
        case 'B':
            e.preventDefault();
            window.bingoCaller.celebrateWinner();
            break;
    }
}); 