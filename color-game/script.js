document.addEventListener('DOMContentLoaded', function() {
    // Game variables
    const colors = ['red', 'green', 'blue', 'yellow', 'white', 'pink'];
    let diceResults = [];
    
    // Statistics tracking
    let totalRolls = 0;
    let colorCounts = {
        red: 0,
        green: 0,
        blue: 0,
        yellow: 0,
        white: 0,
        pink: 0
    };
    
    // DOM Elements
    const dice = [
        document.getElementById('dice1'),
        document.getElementById('dice2'),
        document.getElementById('dice3')
    ];
    const rollDiceBtn = document.getElementById('rollDiceBtn');
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    const resultMessage = document.getElementById('resultMessage');
    const gameHistory = document.getElementById('gameHistory');
    const totalRollsElement = document.getElementById('totalRolls');
    
    // Color percentage elements
    const percentElements = {
        red: document.getElementById('redPercent'),
        green: document.getElementById('greenPercent'),
        blue: document.getElementById('bluePercent'),
        yellow: document.getElementById('yellowPercent'),
        white: document.getElementById('whitePercent'),
        pink: document.getElementById('pinkPercent')
    };
    
    // Load data from localStorage
    loadStats();
    
    // Event Listener for Roll Dice button
    rollDiceBtn.addEventListener('click', function() {
        // Roll the dice
        rollDice();
    });
    
    // Event Listener for Reset Stats button
    resetStatsBtn.addEventListener('click', function() {
        // Confirm reset
        if (confirm('Are you sure you want to reset all statistics?')) {
            resetStats();
        }
    });
    
    // Game functions
    function rollDice() {
        // Clear previous result
        resultMessage.textContent = 'Rolling...';
        
        // Reset dice results
        diceResults = [];
        
        // Disable roll button during animation
        rollDiceBtn.disabled = true;
        
        // Simulate rolling animation
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            // Show random colors during animation
            dice.forEach(die => {
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                die.className = `dice ${randomColor}`;
                die.classList.add('dice-animation');
            });
            
            rollCount++;
            
            if (rollCount >= 10) {
                clearInterval(rollInterval);
                
                // Determine final results
                for (let i = 0; i < 3; i++) {
                    const finalColor = colors[Math.floor(Math.random() * colors.length)];
                    diceResults.push(finalColor);
                    dice[i].className = `dice ${finalColor}`;
                    
                    // Update color counts for statistics
                    colorCounts[finalColor]++;
                }
                
                // Update total rolls (count as 1 roll)
                totalRolls += 1;
                
                // Update statistics display
                updateStatistics();
                
                // Save stats to localStorage
                saveStats();
                
                // Display result
                displayResult();
                
                // Re-enable roll button
                rollDiceBtn.disabled = false;
            }
        }, 200);
    }
    
    function displayResult() {
        // Count occurrences of each color in current roll
        const currentColorCounts = {};
        colors.forEach(color => currentColorCounts[color] = 0);
        
        diceResults.forEach(color => {
            currentColorCounts[color]++;
        });
        
        // Check if all dice are the same
        const allSameColor = diceResults.every(color => color === diceResults[0]);
        
        // Create result message
        let resultText = '';
        if (allSameColor) {
            resultText = `All three dice are ${diceResults[0]}!`;
        } else {
            // Create summary of dice colors
            const colorSummary = colors
                .filter(color => currentColorCounts[color] > 0)
                .map(color => `${currentColorCounts[color]} ${color}`)
                .join(', ');
            
            resultText = `Results: ${colorSummary}`;
        }
        
        resultMessage.textContent = resultText;
        
        // Add to history
        addToHistory(`Roll result: ${diceResults.join(', ')}`);
    }
    
    function updateStatistics() {
        // Update total rolls display
        totalRollsElement.textContent = totalRolls;
        
        // Calculate and update percentages for each color
        const totalDice = Object.values(colorCounts).reduce((sum, count) => sum + count, 0);
        
        colors.forEach(color => {
            let percentage = '0.0';
            
            // Only calculate percentage if we have dice rolls
            if (totalDice > 0) {
                percentage = (colorCounts[color] / totalDice * 100).toFixed(1);
            }
            
            percentElements[color].textContent = `${percentage}%`;
        });
    }
    
    function addToHistory(text) {
        const li = document.createElement('li');
        li.textContent = text;
        
        // Add timestamp
        const timestamp = new Date().toLocaleTimeString();
        const timeSpan = document.createElement('span');
        timeSpan.textContent = ` [${timestamp}]`;
        timeSpan.className = 'timestamp';
        li.appendChild(timeSpan);
        
        // Add at the top of history
        if (gameHistory.firstChild) {
            gameHistory.insertBefore(li, gameHistory.firstChild);
        } else {
            gameHistory.appendChild(li);
        }
        
        // Limit history to 20 items
        while (gameHistory.children.length > 20) {
            gameHistory.removeChild(gameHistory.lastChild);
        }
    }
    
    // LocalStorage functions
    function saveStats() {
        const statsData = {
            totalRolls: totalRolls,
            colorCounts: colorCounts
        };
        
        localStorage.setItem('diceGameStats', JSON.stringify(statsData));
    }
    
    function loadStats() {
        const savedStats = localStorage.getItem('diceGameStats');
        
        if (savedStats) {
            const statsData = JSON.parse(savedStats);
            
            // Update stats variables
            totalRolls = statsData.totalRolls;
            colorCounts = statsData.colorCounts;
            
            // Ensure pink stats exist (in case of black -> pink transition)
            if (colorCounts.black && !colorCounts.pink) {
                colorCounts.pink = colorCounts.black;
                delete colorCounts.black;
            }
            
            // Update display
            updateStatistics();
        } else {
            // Initialize with 0% for all colors
            colors.forEach(color => {
                percentElements[color].textContent = '0.0%';
            });
        }
    }
    
    function resetStats() {
        // Reset all statistics
        totalRolls = 0;
        
        colors.forEach(color => {
            colorCounts[color] = 0;
        });
        
        // Update display
        updateStatistics();
        
        // Clear localStorage
        localStorage.removeItem('diceGameStats');
        
        // Clear history
        gameHistory.innerHTML = '';
        
        // Show message
        resultMessage.textContent = 'Statistics have been reset';
    }
}); 