class BingoCaller {
    constructor() {
        this.numbers = new Set();
        this.calledNumbers = new Set();
        this.availableNumbers = new Set();
        this.currentNumber = null;
        this.lastNumber = null;
        this.isPlaying = false;
        this.intervalId = null;
        this.interval = 3000; // 3 seconds default
        this.isMuted = false;
        
        // Initialize available numbers (1-75)
        for (let i = 1; i <= 75; i++) {
            this.availableNumbers.add(i);
        }
        
        this.initializeElements();
        this.initializeGrid();
        this.initializeEventListeners();
        
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
            lastCalled: document.getElementById('lastCalled'),
            startPauseBtn: document.getElementById('startPauseBtn'),
            newGameBtn: document.getElementById('newGameBtn'),
            bingoWinnerBtn: document.getElementById('bingoWinnerBtn'),
            intervalSelect: document.getElementById('intervalSelect'),
            muteBtn: document.getElementById('muteBtn'),
            bingoGrid: document.getElementById('bingoGrid'),
            numbersCalledCount: document.getElementById('numbersCalledCount'),
            remainingCount: document.getElementById('remainingCount'),
            confettiContainer: document.getElementById('confettiContainer')
        };
    }
    
    initializeGrid() {
        const tbody = this.elements.bingoGrid;
        tbody.innerHTML = '';
        
        // Create 15 rows of 5 numbers each (organized by columns B-I-N-G-O)
        for (let row = 0; row < 15; row++) {
            const tr = document.createElement('tr');
            
            for (let col = 0; col < 5; col++) {
                const number = row + 1 + (col * 15);
                const td = document.createElement('td');
                const div = document.createElement('div');
                
                div.className = 'number-cell';
                div.textContent = number;
                div.dataset.number = number;
                
                td.appendChild(div);
                tr.appendChild(td);
            }
            
            tbody.appendChild(tr);
        }
    }
    
    initializeEventListeners() {
        this.elements.startPauseBtn.addEventListener('click', () => this.toggleGame());
        this.elements.newGameBtn.addEventListener('click', () => this.newGame());
        this.elements.bingoWinnerBtn.addEventListener('click', () => this.celebrateWinner());
        
        this.elements.intervalSelect.addEventListener('change', (e) => {
            this.interval = parseInt(e.target.value) * 1000;
        });
        
        this.elements.muteBtn.addEventListener('click', () => this.toggleMute());
        
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
    
    callNumber(number) {
        if (!number) return;
        
        // Update last called number
        if (this.currentNumber) {
            this.lastNumber = this.currentNumber;
            this.elements.lastCalled.textContent = `${this.getLetterForNumber(this.lastNumber)} - ${this.lastNumber}`;
        }
        
        // Set current number
        this.currentNumber = number;
        this.calledNumbers.add(number);
        this.availableNumbers.delete(number);
        
        // Update display
        const letter = this.getLetterForNumber(number);
        this.elements.currentNumber.textContent = number;
        this.elements.currentLetter.textContent = letter;
        
        // Update grid
        this.updateGrid();
        
        // Update statistics
        this.updateStats();
        
        // Speak the number
        this.speakNumber(letter, number);
        
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
    
    speakNumber(letter, number) {
        if (this.isMuted || !('speechSynthesis' in window)) return;
        
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(`${letter}, ${number}`);
        utterance.rate = 0.4;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Speak
        speechSynthesis.speak(utterance);
    }
    
    toggleGame() {
        if (this.isPlaying) {
            this.pauseGame();
        } else {
            this.startGame();
        }
    }
    
    startGame() {
        if (this.availableNumbers.size === 0) {
            alert('No more numbers to call! Start a new game.');
            return;
        }
        
        this.isPlaying = true;
        this.elements.startPauseBtn.textContent = 'PAUSE';
        this.elements.startPauseBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
        
        // Show BINGO button when game starts
        this.elements.bingoWinnerBtn.classList.add('visible');
        
        // Call first number immediately
        const number = this.getRandomNumber();
        if (number) {
            this.callNumber(number);
        }
        
        // Set up interval for subsequent numbers
        this.intervalId = setInterval(() => {
            const nextNumber = this.getRandomNumber();
            if (nextNumber) {
                this.callNumber(nextNumber);
            } else {
                this.pauseGame();
            }
        }, this.interval);
    }
    
    pauseGame() {
        this.isPlaying = false;
        this.elements.startPauseBtn.textContent = 'START';
        this.elements.startPauseBtn.style.background = 'linear-gradient(135deg, #00b09b, #96c93d)';
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
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
        
        // Reinitialize available numbers
        for (let i = 1; i <= 75; i++) {
            this.availableNumbers.add(i);
        }
        
        // Reset display
        this.elements.currentNumber.textContent = 'Ready to Start';
        this.elements.currentLetter.textContent = '';
        this.elements.lastCalled.textContent = 'None';
        
        // Hide BINGO button when starting new game
        this.elements.bingoWinnerBtn.classList.remove('visible');
        
        // Reset grid
        const cells = this.elements.bingoGrid.querySelectorAll('.number-cell');
        cells.forEach(cell => {
            cell.classList.remove('called', 'current');
        });
        
        // Reset stats
        this.updateStats();
        
        // Cancel any ongoing speech
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        
        // Clear any celebration
        this.clearCelebration();
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.elements.muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
        
        if (this.isMuted && 'speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }
    
    gameComplete() {
        this.pauseGame();
        
        // Speak game complete message
        if (!this.isMuted && 'speechSynthesis' in window) {
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance('Bingo game complete! All numbers have been called.');
                utterance.rate = 0.7;
                speechSynthesis.speak(utterance);
            }, 1000);
        }
        
        // Show completion message
        setTimeout(() => {
            alert('🎉 Game Complete! All 75 numbers have been called. Click "NEW GAME" to start over.');
        }, 1500);
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
        
        // Create 300 confetti pieces for more spectacular effect
        for (let i = 0; i < 300; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            
            // Random horizontal position
            confetti.style.left = Math.random() * 100 + '%';
            
            // Random animation duration (1.5-5 seconds for more variety)
            confetti.style.animationDuration = (Math.random() * 3.5 + 1.5) + 's';
            
            // Random delay (0-3 seconds for staggered effect)
            confetti.style.animationDelay = Math.random() * 3 + 's';
            
            // Random size with more variety
            const size = Math.random() * 12 + 4; // 4-16px
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            
            // Add some random rotation for more dynamic effect
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            container.appendChild(confetti);
        }
        
        // Create additional burst of confetti after 1 second
        setTimeout(() => {
            for (let i = 0; i < 150; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                confetti.style.animationDelay = '0s'; // Immediate start for second burst
                
                const size = Math.random() * 10 + 5;
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                
                container.appendChild(confetti);
            }
        }, 1000);
        
        // Create third burst after 2 seconds
        setTimeout(() => {
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.animationDuration = (Math.random() * 2.5 + 1.5) + 's';
                confetti.style.animationDelay = '0s';
                
                const size = Math.random() * 8 + 6;
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                
                container.appendChild(confetti);
            }
        }, 2000);
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
        if (this.isMuted || !('speechSynthesis' in window)) return;
        
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
    
    switch(e.key) {
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