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
    const diceBounce = dice.map(cube => cube.parentElement);
    const diceScenes = diceBounce.map(bounce => bounce.parentElement);
    const diceShadows = diceScenes.map(scene => scene.querySelector('.die-shadow'));
    const diceContainer = document.getElementById('diceContainer');
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
    
    // 3D dice: cube rotation (rotateX, rotateY) that brings each color's face to the front
    const faceOrientations = {
        red:    { x: 0,   y: 0 },
        blue:   { x: 0,   y: 180 },
        green:  { x: 0,   y: -90 },
        yellow: { x: 0,   y: 90 },
        white:  { x: -90, y: 0 },
        pink:   { x: 90,  y: 0 }
    };

    // Accumulated rotation per die (angles only ever grow so every roll re-animates)
    const diceState = [];

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isRolling = false;

    // Give each die a slightly different idle tilt so the cubes read as 3D
    dice.forEach((cube, i) => {
        diceState[i] = { z: 0, x: -18, y: -30 + i * 22, tx: 0 };
        applyDieTransform(i);
    });

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
        if (isRolling) return;
        isRolling = true;

        // Clear previous result and any leftover highlight
        resultMessage.textContent = 'Rolling...';
        diceScenes.forEach(scene => scene.classList.remove('die-pulse'));

        // Disable roll button during animation
        rollDiceBtn.disabled = true;
        rollDiceBtn.textContent = 'Rolling…';

        // Decide the result FIRST — the animation is purely cosmetic
        diceResults = [];
        for (let i = 0; i < 3; i++) {
            diceResults.push(colors[Math.floor(Math.random() * colors.length)]);
        }

        animateRoll(diceResults, finishRoll);
    }

    function finishRoll() {
        // Update color counts for statistics
        diceResults.forEach(color => colorCounts[color]++);

        // Update total rolls (count as 1 roll)
        totalRolls += 1;

        updateStatistics();
        saveStats();
        displayResult();
        highlightMatches();

        rollDiceBtn.textContent = 'Roll Dice';
        rollDiceBtn.disabled = false;
        isRolling = false;
    }

    function applyDieTransform(i) {
        const s = diceState[i];
        dice[i].style.transform = `rotateZ(${s.z}deg) rotateX(${s.x}deg) rotateY(${s.y}deg)`;
    }

    function animateRoll(results, onDone) {
        let finished = false;
        let fallbackTimer;
        const commitFinals = [];

        function finish() {
            if (finished) return;
            finished = true;
            clearTimeout(fallbackTimer);
            commitFinals.forEach(commit => commit());
            onDone();
        }

        // Reduced motion: quick fade to the result instead of tumbling
        if (reduceMotion.matches) {
            diceContainer.classList.add('fade-out');
            setTimeout(() => {
                results.forEach((color, i) => {
                    const base = faceOrientations[color];
                    diceState[i] = { z: 0, x: base.x, y: base.y, tx: diceState[i].tx };
                    applyDieTransform(i);
                });
                diceContainer.classList.remove('fade-out');
                setTimeout(finish, 250);
            }, 200);
            return;
        }

        let maxEndTime = 0;
        const settlePromises = [];

        results.forEach((color, i) => {
            const cube = dice[i];
            const bounce = diceBounce[i];
            const shadow = diceShadows[i];
            const size = cube.offsetWidth || 100;
            const base = faceOrientations[color];
            const state = diceState[i];

            // Stagger the dice and vary each one's throw so they don't move in lockstep
            const delay = i * 150 + Math.random() * 60;
            const duration = 1350 + Math.random() * 450;

            // Land exactly on the target face: base orientation + whole extra turns
            const spinX = 720 + Math.floor(Math.random() * 3) * 360;
            const spinY = 720 + Math.floor(Math.random() * 3) * 360;
            const targetX = base.x + 360 * Math.ceil((state.x + spinX - base.x) / 360);
            const targetY = base.y + 360 * Math.ceil((state.y + spinY - base.y) / 360);
            const restTilt = Math.random() * 8 - 4;

            // Sideways scatter: each throw drifts a little, staying near center
            const prevTx = state.tx || 0;
            const newTx = Math.max(-14, Math.min(14, prevTx + (Math.random() * 24 - 12)));
            const tx = p => prevTx + (newTx - prevTx) * Math.min(p / 0.88, 1);

            // Toss height and damped bounce heights
            const h1 = size * (0.6 + Math.random() * 0.2);
            const h2 = h1 * 0.4;
            const h3 = h1 * 0.16;
            const h4 = h1 * 0.06;

            const rise = 'cubic-bezier(0.22, 0.61, 0.36, 1)';   // decelerate going up
            const fall = 'cubic-bezier(0.55, 0.06, 0.68, 0.19)'; // accelerate coming down

            const pos = (p, y, sx, sy) =>
                `translate(${tx(p).toFixed(2)}px, ${(-y).toFixed(2)}px) scale(${sx || 1}, ${sy || 1})`;

            // Toss up, drop, three damped bounces, squash on each impact
            const bounceAnim = bounce.animate([
                { offset: 0,    transform: pos(0, 0), easing: rise },
                { offset: 0.15, transform: pos(0.15, h1), easing: fall },
                { offset: 0.34, transform: pos(0.34, 0, 1.09, 0.82), easing: rise },
                { offset: 0.46, transform: pos(0.46, h2), easing: fall },
                { offset: 0.58, transform: pos(0.58, 0, 1.05, 0.9), easing: rise },
                { offset: 0.67, transform: pos(0.67, h3), easing: fall },
                { offset: 0.76, transform: pos(0.76, 0, 1.03, 0.95), easing: rise },
                { offset: 0.82, transform: pos(0.82, h4), easing: fall },
                { offset: 0.88, transform: pos(0.88, 0, 1.01, 0.98), easing: rise },
                { offset: 1,    transform: pos(1, 0) }
            ], { duration, delay, fill: 'both' });

            // Tumble: constant spin while airborne, losing speed at each impact.
            // `share` is how much of the total rotation is done by that moment.
            const rot = (share, z) =>
                `rotateZ(${z.toFixed(2)}deg) ` +
                `rotateX(${(state.x + (targetX - state.x) * share).toFixed(2)}deg) ` +
                `rotateY(${(state.y + (targetY - state.y) * share).toFixed(2)}deg)`;

            const z1 = state.z + (Math.random() * 120 - 60);
            const z2 = restTilt + (Math.random() * 24 - 12);
            const z3 = restTilt + (Math.random() * 8 - 4);

            const cubeAnim = cube.animate([
                { offset: 0,    transform: rot(0, state.z), easing: 'linear' },
                { offset: 0.34, transform: rot(0.62, z1), easing: 'linear' },
                { offset: 0.58, transform: rot(0.85, z2), easing: 'linear' },
                { offset: 0.76, transform: rot(0.95, z3), easing: 'ease-out' },
                { offset: 0.88, transform: rot(1, restTilt) },
                { offset: 1,    transform: rot(1, restTilt) }
            ], { duration, delay, fill: 'both' });

            // Ground shadow: shrinks and fades while the die is in the air
            const sh = (p, s, o) => ({ transform: `translateX(${tx(p).toFixed(2)}px) scale(${s})`, opacity: o });
            const shadowAnim = shadow.animate([
                { offset: 0,    ...sh(0, 1, 0.4), easing: rise },
                { offset: 0.15, ...sh(0.15, 0.55, 0.15), easing: fall },
                { offset: 0.34, ...sh(0.34, 1.06, 0.45), easing: rise },
                { offset: 0.46, ...sh(0.46, 0.75, 0.25), easing: fall },
                { offset: 0.58, ...sh(0.58, 1.03, 0.42), easing: rise },
                { offset: 0.67, ...sh(0.67, 0.87, 0.32), easing: fall },
                { offset: 0.76, ...sh(0.76, 1, 0.4) },
                { offset: 1,    ...sh(1, 1, 0.4) }
            ], { duration, delay, fill: 'both' });

            diceState[i] = { z: restTilt, x: targetX, y: targetY, tx: newTx };

            // On settle: bake final poses into inline styles, then release the animations
            commitFinals.push(() => {
                applyDieTransform(i);
                bounce.style.transform = `translateX(${newTx.toFixed(2)}px)`;
                shadow.style.transform = `translateX(${newTx.toFixed(2)}px)`;
                [bounceAnim, cubeAnim, shadowAnim].forEach(anim => {
                    try { anim.cancel(); } catch (e) { /* already canceled */ }
                });
            });

            maxEndTime = Math.max(maxEndTime, delay + duration);
            settlePromises.push(cubeAnim.finished);
        });

        Promise.all(settlePromises).then(finish).catch(() => {});

        // Fallback in case animation finish never resolves (e.g. hidden tab)
        fallbackTimer = setTimeout(finish, maxEndTime + 400);
    }

    function highlightMatches() {
        const counts = {};
        diceResults.forEach(color => counts[color] = (counts[color] || 0) + 1);

        diceScenes.forEach((scene, i) => {
            if (counts[diceResults[i]] >= 2) {
                scene.classList.add('die-pulse');
                setTimeout(() => scene.classList.remove('die-pulse'), 950);
            }
        });
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
        addToHistory(diceResults);
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
    
    function addToHistory(rollColors) {
        const li = document.createElement('li');

        // One chip per die, in roll order
        const chips = document.createElement('span');
        chips.className = 'roll-chips';
        rollColors.forEach(color => {
            const chip = document.createElement('span');
            chip.className = `chip ${color}`;
            chip.title = color;
            chips.appendChild(chip);
        });
        li.appendChild(chips);

        // Add timestamp
        const timeSpan = document.createElement('span');
        timeSpan.textContent = new Date().toLocaleTimeString();
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