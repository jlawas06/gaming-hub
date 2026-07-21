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
        this.dealAccepted = false;
        this.acceptedOffer = 0;
        this.defaultHighValues = [50, 100, 200];
        this.defaultRegularValues = Array.from({length: 23}, (_,i) => i + 1);
        // Load settings from localStorage if available
        const savedHigh = localStorage.getItem('deal_highValues');
        const savedRegular = localStorage.getItem('deal_regularValues');
        this.highValues = savedHigh ? JSON.parse(savedHigh) : [...this.defaultHighValues];
        this.regularValues = savedRegular ? JSON.parse(savedRegular) : [...this.defaultRegularValues];
        this.setupEventListeners();
        this.initializeSettings();
        this.initializeGame();
    }

    initializeGame() {
        // Reset grids for a new game
        document.querySelector('.cases-grid').innerHTML = '';
        document.querySelector('.prizes-grid').innerHTML = '';
        
        // Hide restart button, reset controls
        document.getElementById('restart-btn').style.display = 'none';
        document.getElementById('deal-btn').style.display = 'block';
        document.getElementById('no-deal-btn').style.display = 'block';
        this.unhighlightDealButtons();
        document.querySelector('.game-controls').style.display = 'none';
        document.getElementById('player-case').textContent = '?';
        document.querySelector('.offer-amount').textContent = '₱0';

        // Create array of values with specific high values and the rest between 0.50 and 20.00
        const values = [...this.highValues, ...this.regularValues];
        
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

        this.renderCases();
        this.renderPrizes();
        this.updateCasesCounter();
        this.updateMessage("Select your case to begin!");
    }

    setupEventListeners() {
        const dealBtn = document.getElementById('deal-btn');
        const noDealBtn = document.getElementById('no-deal-btn');
        const popupDealBtn = document.getElementById('popup-deal-btn');
        const popupNoDealBtn = document.getElementById('popup-no-deal-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const saveSettingsBtn = document.getElementById('save-settings');
        const cancelSettingsBtn = document.getElementById('cancel-settings');
        const restoreDefaultsBtn = document.getElementById('restore-defaults');
        const restartBtn = document.getElementById('restart-btn');
        const celebrationCloseBtn = document.getElementById('celebration-close-btn');

        dealBtn.addEventListener('click', () => this.makeDeal());
        noDealBtn.addEventListener('click', () => this.noDeal());
        popupDealBtn.addEventListener('click', () => this.makeDeal());
        popupNoDealBtn.addEventListener('click', () => this.noDeal());
        settingsBtn.addEventListener('click', () => this.showSettingsPopup());
        saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        cancelSettingsBtn.addEventListener('click', () => this.hideSettingsPopup());
        restoreDefaultsBtn.addEventListener('click', () => this.restoreDefaults());
        restartBtn.addEventListener('click', () => this.restartGame());
        celebrationCloseBtn.addEventListener('click', () => {
            document.getElementById('celebration-popup').classList.remove('active');
        });
    }

    initializeSettings() {
        // Create regular prize inputs
        const regularPrizesContainer = document.querySelector('.regular-prizes');
        regularPrizesContainer.innerHTML = '';
        
        this.regularValues.forEach((value, index) => {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'prize-input';
            input.value = value;
            input.min = '1';
            regularPrizesContainer.appendChild(input);
        });

        // Set high value prize inputs
        const highValueInputs = document.querySelectorAll('.prize-input-group:not(.regular-prizes) .prize-input');
        this.highValues.forEach((value, index) => {
            highValueInputs[index].value = value;
        });
    }

    showSettingsPopup() {
        if (this.gameStarted) {
            this.updateMessage("Cannot change settings during a game!");
            return;
        }
        const popup = document.getElementById('settings-popup');
        popup.classList.add('active');
    }

    hideSettingsPopup() {
        const popup = document.getElementById('settings-popup');
        popup.classList.remove('active');
    }

    saveSettings() {
        // Get high value prizes
        const highValueInputs = document.querySelectorAll('.prize-input-group:not(.regular-prizes) .prize-input');
        this.highValues = Array.from(highValueInputs).map(input => parseInt(input.value) || 1);

        // Get regular prizes
        const regularInputs = document.querySelectorAll('.regular-prizes .prize-input');
        this.regularValues = Array.from(regularInputs).map(input => parseInt(input.value) || 1);

        // Persist to localStorage
        localStorage.setItem('deal_highValues', JSON.stringify(this.highValues));
        localStorage.setItem('deal_regularValues', JSON.stringify(this.regularValues));

        // Reset game state
        this.playerCase = null;
        this.remainingCases = 26;
        this.currentRound = 1;
        this.casesToOpen = this.rounds[0];
        this.gameOver = false;
        this.gameStarted = false;
        this.canMakeDeal = false;
        this.dealAccepted = false;
        this.acceptedOffer = 0;

        // Reinitialize the game with new values
        this.initializeGame();
        this.hideSettingsPopup();
        this.updateMessage("Settings saved! Select your case to begin!");
    }

    renderCases() {
        const casesGrid = document.querySelector('.cases-grid');
        
        if (casesGrid.children.length === 0) {
            this.cases.forEach(case_ => {
                const caseElement = document.createElement('button');
                caseElement.type = 'button';
                caseElement.className = 'case';
                caseElement.dataset.caseNumber = case_.number;
                
                caseElement.addEventListener('click', () => {
                    if (!this.gameStarted) {
                        this.selectPlayerCase(case_.number);
                    } else {
                        this.openCase(case_.number);
                    }
                });
                
                casesGrid.appendChild(caseElement);
            });
        }

        const caseElements = casesGrid.querySelectorAll('.case');
        caseElements.forEach(caseElement => {
            const caseNumber = parseInt(caseElement.dataset.caseNumber);
            const case_ = this.cases.find(c => c.number === caseNumber);
            
            if (case_.opened) {
                // Keep .revealed if it's there
                const hasRevealed = caseElement.classList.contains('revealed');
                caseElement.className = `case opened ${hasRevealed ? 'revealed' : ''}`;
                caseElement.textContent = `₱${case_.value}`;
                caseElement.disabled = true;
                caseElement.setAttribute('aria-label', `Case ${case_.number}, opened, contained ₱${case_.value}`);
            } else if (case_.number === this.playerCase) {
                caseElement.className = `case selected`;
                caseElement.textContent = case_.number;
                caseElement.disabled = true;
                caseElement.setAttribute('aria-label', `Case ${case_.number}, your case`);
            } else {
                caseElement.className = `case`;
                caseElement.textContent = case_.number;
                caseElement.disabled = false;
                if (!this.gameStarted) {
                    caseElement.setAttribute('aria-label', `Pick case ${case_.number} as your case`);
                } else {
                    caseElement.setAttribute('aria-label', `Open case ${case_.number}`);
                }
            }
        });
    }

    renderPrizes() {
        const prizesGrid = document.querySelector('.prizes-grid');
        const sortedCases = [...this.cases].sort((a, b) => a.value - b.value);

        if (prizesGrid.children.length === 0) {
            sortedCases.forEach((case_, idx) => {
                const prizeElement = document.createElement('div');
                prizeElement.className = 'prize-item unopened';
                const valueElement = document.createElement('div');
                valueElement.className = 'prize-value';
                valueElement.textContent = `₱${case_.value}`;
                prizeElement.appendChild(valueElement);
                prizesGrid.appendChild(prizeElement);
            });
        } else {
            const prizeElements = Array.from(prizesGrid.children);
            sortedCases.forEach((case_, idx) => {
                if (case_.opened) {
                    prizeElements[idx].classList.remove('unopened');
                    prizeElements[idx].classList.add('opened');
                } else {
                    prizeElements[idx].classList.add('unopened');
                    prizeElements[idx].classList.remove('opened');
                }
            });
        }
    }

    updateCasesCounter() {
        document.querySelector('.counter').textContent = this.casesToOpen;
    }

    selectPlayerCase(caseNumber) {
        this.playerCase = caseNumber;
        this.gameStarted = true;
        document.getElementById('player-case').textContent = caseNumber;
        this.updateMessage(`You selected case #${caseNumber}. Now open ${this.casesToOpen} cases!`);
        this.renderCases();
        document.querySelector('.game-controls').style.display = 'none';
    }

    openCase(caseNumber) {
        if (this.gameOver || this.casesToOpen <= 0 || !this.gameStarted) return;
        if (caseNumber === this.playerCase) return;

        const case_ = this.cases.find(c => c.number === caseNumber);
        if (!case_ || case_.opened) return;

        case_.opened = true;
        this.casesToOpen--;
        this.remainingCases--;

        this.updateCasesCounter();
        this.updateMessage(`Case ${caseNumber} contains ₱${case_.value}!`);
        this.renderCases();
        this.renderPrizes();

        // Replay the flip on just this case
        const revealedCase = document.querySelector(`.case[data-case-number="${caseNumber}"]`);
        if (revealedCase) {
            revealedCase.classList.add('revealed');
        }

        // Check if we're down to 2 cases
        const unopenedCases = this.cases.filter(c => !c.opened);
        if (unopenedCases.length === 2) {
            this.finalRound();
        } else if (this.casesToOpen === 0) {
            this.canMakeDeal = true;
            const offer = this.updateBankerOffer();
            // Give the reveal a beat before the banker calls
            if (!this.dealAccepted) {
                setTimeout(() => this.showDealPopup(offer), 900);
            } else {
                setTimeout(() => this.nextRound(), 900);
            }
        }
    }

    updateBankerOffer() {
        const unopenedCases = this.cases.filter(c => !c.opened);
        const averageValue = unopenedCases.reduce((sum, c) => sum + c.value, 0) / unopenedCases.length;
        
        // Calculate offer based on remaining cases and round
        let offer;
        if (this.remainingCases <= 2) {
            // When only 2 cases remain, offer is based on the average of remaining values
            offer = Math.floor(averageValue * 0.8); // 80% of the average
        } else {
            // Normal offer calculation
            const roundMultiplier = 0.3 + (this.currentRound * 0.1); // Increases with each round
            offer = Math.floor(averageValue * roundMultiplier);
        }
        
        const roundedOffer = Math.round(offer);
        
        document.querySelector('.offer-amount').textContent = `₱${roundedOffer}`;
        return roundedOffer;
    }

    nextRound() {
        this.currentRound++;
        if (this.currentRound <= this.rounds.length) {
            this.casesToOpen = this.rounds[this.currentRound - 1];
            this.canMakeDeal = false;
            this.unhighlightDealButtons();
            this.updateCasesCounter();
            
            // Check if we're down to 2 cases
            const unopenedCases = this.cases.filter(c => !c.opened);
            if (unopenedCases.length === 2) {
                this.finalRound();
            } else {
                const prefix = this.dealAccepted ? `You dealt for ₱${this.acceptedOffer}. ` : `Round ${this.currentRound}: `;
                this.updateMessage(`${prefix}Open ${this.casesToOpen} cases`);
            }
        } else {
            this.finalRound();
        }
    }

    finalRound() {
        const unopenedCases = this.cases.filter(c => !c.opened);
        if (unopenedCases.length === 2) {
            if (this.dealAccepted) {
                this.updateMessage(`Final cases! Let's see what was in your case!`);
                setTimeout(() => this.endGame(), 1500);
            } else {
                this.updateMessage("Final round! You can switch your case or keep it. Make your decision!");
                const dealBtn = document.getElementById('deal-btn');
                const noDealBtn = document.getElementById('no-deal-btn');
                
                // Reset button states
                dealBtn.disabled = false;
                noDealBtn.disabled = false;
                dealBtn.textContent = "Keep case";
                noDealBtn.textContent = "Switch case";
                
                // Remove any existing classes and add active class
                dealBtn.className = 'btn deal active';
                noDealBtn.className = 'btn no-deal active';
                document.querySelector('.game-controls').style.display = 'flex';
            }
        } else {
            this.endGame();
        }
    }

    showDealPopup(offer) {
        const popup = document.getElementById('deal-popup');
        const popupOffer = popup.querySelector('.popup-offer');
        const gameControls = document.querySelector('.game-controls');
        
        popupOffer.textContent = `₱${offer}`;
        popup.classList.add('active');
        gameControls.style.display = 'none';
    }

    hideDealPopup() {
        const popup = document.getElementById('deal-popup');
        const gameControls = document.querySelector('.game-controls');
        popup.classList.remove('active');
        // Only show if not game over AND exactly 2 cases left (final round)
        const unopenedCases = this.cases.filter(c => !c.opened);
        if (!this.gameOver && unopenedCases.length === 2) {
            gameControls.style.display = 'flex';
        } else {
            gameControls.style.display = 'none';
        }
    }

    makeDeal() {
        if (!this.gameStarted) {
            this.updateMessage("Please select your case first!");
            return;
        }

        this.hideDealPopup();
        const unopenedCases = this.cases.filter(c => !c.opened);
        if (unopenedCases.length === 2) {
            // Final round - keep current case
            this.endGame();
        } else {
            const offer = parseFloat(document.querySelector('.offer-amount').textContent.replace('₱', ''));
            this.dealAccepted = true;
            this.acceptedOffer = offer;
            this.updateMessage(`You accepted ₱${offer}! Let's play it out.`);
            setTimeout(() => this.nextRound(), 1500);
        }
    }

    noDeal() {
        if (!this.gameStarted) {
            this.updateMessage("Please select your case first!");
            return;
        }

        this.hideDealPopup();
        const unopenedCases = this.cases.filter(c => !c.opened);
        if (unopenedCases.length === 2) {
            // Final round - switch cases
            const otherCase = unopenedCases.find(c => c.number !== this.playerCase);
            this.playerCase = otherCase.number;
            document.getElementById('player-case').textContent = this.playerCase;
            this.renderCases();
            this.endGame();
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
        }

        let title, subtitle, amount, message;

        if (this.dealAccepted) {
            amount = this.acceptedOffer;
            const diff = this.acceptedOffer - playerCase.value;
            if (diff >= 0) {
                title = "Good deal!";
                subtitle = "You took the Banker's offer:";
                message = `Your case only had ₱${playerCase.value}. You made the right choice!`;
            } else {
                title = "Bad deal!";
                subtitle = "You took the Banker's offer:";
                message = `Your case had ₱${playerCase.value}. The banker got you!`;
            }
            this.updateMessage(`${title} ${message}`);
        } else {
            amount = playerCase.value;
            title = "Congratulations!";
            subtitle = "You won what was in your case:";
            if (otherCase) {
                message = `The other case contained ₱${otherCase.value}.`;
                this.updateMessage(`Game Over! Your case contained ₱${playerCase.value} and the other case contained ₱${otherCase.value}!`);
            } else {
                message = "";
                this.updateMessage(`Game Over! Your case contained ₱${playerCase.value}!`);
            }
        }
        
        this.renderCases();
        this.disableControls();

        // Delay popup slightly for suspense
        setTimeout(() => {
            this.showCelebrationPopup(title, subtitle, amount, message);
        }, 1200);
    }

    showCelebrationPopup(title, subtitle, amount, message) {
        const popup = document.getElementById('celebration-popup');
        document.getElementById('celebration-title').textContent = title;
        document.getElementById('celebration-subtitle').textContent = subtitle;
        document.getElementById('celebration-amount').textContent = `₱${amount}`;
        document.getElementById('celebration-message').textContent = message;
        popup.classList.add('active');
    }

    updateMessage(message) {
        document.querySelector('.game-message').textContent = message;
    }

    disableControls() {
        document.getElementById('deal-btn').style.display = 'none';
        document.getElementById('no-deal-btn').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'block';
        document.querySelector('.game-controls').style.display = 'flex';
    }

    restartGame() {
        this.playerCase = null;
        this.remainingCases = 26;
        this.currentRound = 1;
        this.casesToOpen = this.rounds[0];
        this.gameOver = false;
        this.gameStarted = false;
        this.canMakeDeal = false;
        this.dealAccepted = false;
        this.acceptedOffer = 0;
        
        // Reset button texts that might have changed in final round
        const dealBtn = document.getElementById('deal-btn');
        const noDealBtn = document.getElementById('no-deal-btn');
        dealBtn.textContent = "Deal";
        noDealBtn.textContent = "No deal";
        dealBtn.className = 'btn deal';
        noDealBtn.className = 'btn no-deal';
        
        this.initializeGame();
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

    restoreDefaults() {
        // Reset values to defaults
        this.highValues = [...this.defaultHighValues];
        this.regularValues = [...this.defaultRegularValues];
        // Remove from localStorage
        localStorage.removeItem('deal_highValues');
        localStorage.removeItem('deal_regularValues');
        // Update the settings popup inputs
        this.initializeSettings();
        // Reset game state
        this.playerCase = null;
        this.remainingCases = 26;
        this.currentRound = 1;
        this.casesToOpen = this.rounds[0];
        this.gameOver = false;
        this.gameStarted = false;
        this.canMakeDeal = false;
        // Reinitialize the game
        this.initializeGame();
        this.updateMessage("Defaults restored! Select your case to begin!");
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new DealOrNoDeal();
}); 