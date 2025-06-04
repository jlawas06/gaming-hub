class DealOrNoDeal {
    constructor() {
        this.cases = [];
        this.playerCase = null;
        this.remainingCases = 26;
        this.currentRound = 1;
        this.rounds = [6, 5, 4, 3, 2, 1, 1, 1, 1];
        this.casesToOpen = this.rounds[0];
        this.gameOver = false;
        this.gameStarted = false;
        this.canMakeDeal = false;
        this.initializeGame();
    }

    initializeGame() {
        // Create array of values with specific high values and the rest between 0.50 and 20.00
        const highValues = [50, 100, 200];
        const regularValues = [];
        
        // Generate regular values between 0.50 and 20.00
        for (let i = 0; i < 23; i++) {
            // Generate random value between 0.50 and 20.00
            const value = 0.50 + Math.random() * 19.50;
            // Round to nearest 0.50
            const roundedValue = Math.round(value * 2) / 2;
            regularValues.push(roundedValue);
        }
        
        // Combine all values and shuffle them
        const values = [...highValues, ...regularValues];
        
        // Shuffle the values
        for (let i = values.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [values[i], values[j]] = [values[j], values[i]];
        }

        // Create cases with values in order (1-26)
        this.cases = Array.from({length: 26}, (_, i) => ({
            number: i + 1,
            value: values[i],
            opened: false
        }));

        this.setupEventListeners();
        this.renderCases();
        this.updateMessage("Select your case to begin!");
    }

    setupEventListeners() {
        const dealBtn = document.getElementById('deal-btn');
        const noDealBtn = document.getElementById('no-deal-btn');

        dealBtn.addEventListener('click', () => this.makeDeal());
        noDealBtn.addEventListener('click', () => this.noDeal());
    }

    renderCases() {
        const casesGrid = document.querySelector('.cases-grid');
        casesGrid.innerHTML = '';

        this.cases.forEach(case_ => {
            const caseElement = document.createElement('div');
            caseElement.className = `case ${case_.opened ? 'opened' : ''} ${case_.number === this.playerCase ? 'selected' : ''}`;
            caseElement.textContent = case_.opened ? `₱${case_.value.toFixed(2)}` : case_.number;
            caseElement.dataset.caseNumber = case_.number;

            if (!case_.opened) {
                if (!this.gameStarted) {
                    caseElement.addEventListener('click', () => this.selectPlayerCase(case_.number));
                } else if (case_.number !== this.playerCase) {
                    caseElement.addEventListener('click', () => this.openCase(case_.number));
                }
            }

            casesGrid.appendChild(caseElement);
        });
    }

    selectPlayerCase(caseNumber) {
        this.playerCase = caseNumber;
        this.gameStarted = true;
        document.getElementById('player-case').textContent = caseNumber;
        this.updateMessage(`You selected case #${caseNumber}. Now open ${this.casesToOpen} cases!`);
        this.renderCases();
    }

    openCase(caseNumber) {
        if (this.gameOver || this.casesToOpen <= 0 || !this.gameStarted) return;
        if (caseNumber === this.playerCase) return;

        const case_ = this.cases.find(c => c.number === caseNumber);
        if (!case_ || case_.opened) return;

        case_.opened = true;
        this.casesToOpen--;
        this.remainingCases--;

        this.updateMessage(`Case ${caseNumber} contains ₱${case_.value.toFixed(2)}!`);
        this.renderCases();

        if (this.casesToOpen === 0) {
            this.canMakeDeal = true;
            this.updateBankerOffer();
            this.highlightDealButtons();
            this.updateMessage("Banker's offer is ready! Deal or No Deal?");
        }
    }

    updateBankerOffer() {
        const unopenedCases = this.cases.filter(c => !c.opened);
        const averageValue = unopenedCases.reduce((sum, c) => sum + c.value, 0) / unopenedCases.length;
        
        // Calculate offer based on remaining cases and round
        let offer;
        if (this.remainingCases <= 2) {
            // When only 2 cases remain, offer is based on the average of remaining values
            offer = averageValue * 0.8; // 80% of the average
        } else {
            // Normal offer calculation
            const roundMultiplier = 0.3 + (this.currentRound * 0.1); // Increases with each round
            offer = averageValue * roundMultiplier;
        }
        
        // Cap the maximum offer at 50
        const cappedOffer = Math.min(offer, 50);
        
        // Round to nearest 50 centavos
        const roundedOffer = Math.round(cappedOffer * 2) / 2;
        
        // Format the offer to 2 decimal places
        const formattedOffer = roundedOffer.toFixed(2);
        document.querySelector('.offer-amount').textContent = `₱${formattedOffer}`;
        return roundedOffer;
    }

    nextRound() {
        this.currentRound++;
        if (this.currentRound <= this.rounds.length) {
            this.casesToOpen = this.rounds[this.currentRound - 1];
            this.canMakeDeal = false;
            this.unhighlightDealButtons();
            this.updateMessage(`Round ${this.currentRound}: Open ${this.casesToOpen} cases`);
        } else {
            this.finalRound();
        }
    }

    finalRound() {
        // When only 2 cases remain, allow the player to switch cases
        const unopenedCases = this.cases.filter(c => !c.opened);
        if (unopenedCases.length === 2) {
            this.updateMessage("Final round! You can switch your case or keep it. Make your decision!");
            // Enable the deal/no deal buttons for the final decision
            document.getElementById('deal-btn').textContent = "KEEP CASE";
            document.getElementById('no-deal-btn').textContent = "SWITCH CASE";
        } else {
            this.endGame();
        }
    }

    makeDeal() {
        if (!this.gameStarted) {
            this.updateMessage("Please select your case first!");
            return;
        }

        const unopenedCases = this.cases.filter(c => !c.opened);
        if (unopenedCases.length === 2) {
            // Final round - keep current case
            this.endGame();
        } else {
            const offer = parseFloat(document.querySelector('.offer-amount').textContent.replace('₱', ''));
            this.gameOver = true;
            
            // Reveal the selected case
            const playerCase = this.cases.find(c => c.number === this.playerCase);
            if (playerCase) {
                playerCase.opened = true;
                this.updateMessage(`Congratulations! You've won ₱${offer.toFixed(2)}! Your case contained ₱${playerCase.value.toFixed(2)}.`);
                this.renderCases();
            } else {
                this.updateMessage(`Congratulations! You've won ₱${offer.toFixed(2)}!`);
            }
            
            this.disableControls();
        }
    }

    noDeal() {
        if (!this.gameStarted) {
            this.updateMessage("Please select your case first!");
            return;
        }

        const unopenedCases = this.cases.filter(c => !c.opened);
        if (unopenedCases.length === 2) {
            // Final round - switch cases
            const otherCase = unopenedCases.find(c => c.number !== this.playerCase);
            this.playerCase = otherCase.number;
            document.getElementById('player-case').textContent = this.playerCase;
            this.renderCases();
            this.endGame();
        } else if (this.casesToOpen > 0) {
            this.updateMessage(`Please open ${this.casesToOpen} more case${this.casesToOpen > 1 ? 's' : ''}`);
        } else {
            this.nextRound();
        }
    }

    endGame() {
        const playerCase = this.cases.find(c => c.number === this.playerCase);
        if (!playerCase) {
            this.updateMessage("Game Over! Something went wrong.");
            return;
        }
        this.gameOver = true;
        
        // Find the other unopened case
        const otherCase = this.cases.find(c => !c.opened && c.number !== this.playerCase);
        
        // Reveal both cases
        playerCase.opened = true;
        if (otherCase) {
            otherCase.opened = true;
            this.updateMessage(`Game Over! Your case contained ₱${playerCase.value.toFixed(2)} and the other case contained ₱${otherCase.value.toFixed(2)}!`);
        } else {
            this.updateMessage(`Game Over! Your case contained ₱${playerCase.value.toFixed(2)}!`);
        }
        
        this.renderCases();
        this.disableControls();
    }

    updateMessage(message) {
        document.querySelector('.game-message').textContent = message;
    }

    disableControls() {
        document.getElementById('deal-btn').disabled = true;
        document.getElementById('no-deal-btn').disabled = true;
    }

    highlightDealButtons() {
        const dealBtn = document.getElementById('deal-btn');
        const noDealBtn = document.getElementById('no-deal-btn');
        dealBtn.classList.add('active');
        noDealBtn.classList.add('active');
    }

    unhighlightDealButtons() {
        const dealBtn = document.getElementById('deal-btn');
        const noDealBtn = document.getElementById('no-deal-btn');
        dealBtn.classList.remove('active');
        noDealBtn.classList.remove('active');
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new DealOrNoDeal();
}); 