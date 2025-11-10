// --- Game Variables ---
let currentProblem = {};
let score = 0;
let problemCount = 0;
const MAX_PROBLEMS = 20;
const POINTS_PER_QUESTION = 5;

const powers = [10, 100, 1000, 0.1, 0.01, 0.001]; 

// --- DOM Elements ---
const gameContainer = document.querySelector('.game-container');
const problemText = document.getElementById('problem-text');
const answerInput = document.getElementById('answer-input');
const checkButton = document.getElementById('check-button');
const nextButton = document.getElementById('next-button');
const feedback = document.getElementById('feedback');

// Score and Question Elements
const scoreDisplay = document.createElement('div');
scoreDisplay.id = 'score-display';
document.querySelector('.game-container').insertBefore(scoreDisplay, problemText.parentElement);

const questionCounter = document.createElement('p');
questionCounter.id = 'question-counter';
document.querySelector('.game-container').insertBefore(questionCounter, scoreDisplay.nextSibling);

// Hint Elements
const hintButton = document.createElement('button');
hintButton.id = 'hint-button';
hintButton.textContent = 'Get Hint';
document.querySelector('.game-container').insertBefore(hintButton, feedback);

const hintDisplay = document.createElement('div');
hintDisplay.id = 'hint-display';
hintDisplay.classList.add('feedback-message', 'hidden');
document.querySelector('.game-container').insertBefore(hintDisplay, feedback);

// --- Game Flow Functions ---

/**
 * Generates and displays a new problem, or ends the game.
 */
function generateProblem() {
    if (problemCount >= MAX_PROBLEMS) {
        endGame();
        return;
    }
    
    // --- Problem Generation Logic (CORRECTED) ---
    const randomNumber = (Math.random() * 99.9 + 0.1).toFixed(Math.floor(Math.random() * 3) + 1);
    const num = parseFloat(randomNumber);
    const powerIndex = Math.floor(Math.random() * powers.length);
    const originalPower = powers[powerIndex]; // The true power (e.g., 0.1 or 10)
    let originalOperation = (Math.random() < 0.5) ? 'x' : '/'; // The true operation

    // 1. CALCULATE THE CORRECT ANSWER based on the true problem
    let correctAnswer;
    if (originalOperation === 'x') {
        correctAnswer = num * originalPower;
    } else {
        correctAnswer = num / originalPower;
    }

    // 2. Determine DISPLAY values (ensuring power shown is always >= 1)
    let displayPower;
    let displayOperation = originalOperation; 

    if (originalPower >= 1) {
        // If the original power is 10, 100, 1000, use it directly.
        displayPower = originalPower;
    } else {
        // If the original power is 0.1, 0.01, 0.001, invert the power AND the operation for display.
        displayPower = 1 / originalPower; 
        displayOperation = (originalOperation === 'x') ? '/' : 'x'; // Flip the operation for display
    }

    currentProblem = {
        number: num,
        power: displayPower,
        operation: displayOperation,
        answer: correctAnswer.toFixed(4)
    };
    problemCount++;

    // Update the display
    problemText.textContent = `${currentProblem.number} ${currentProblem.operation} ${currentProblem.power}`;

    // Reset UI for new problem
    answerInput.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback-message';
    checkButton.classList.remove('hidden');
    nextButton.classList.add('hidden');
    hintButton.classList.remove('hidden'); 
    hintDisplay.classList.add('hidden'); 
    answerInput.disabled = false;
    answerInput.focus();
    
    // Update Score and Counter
    updateScoreDisplay();
}

/**
 * Checks the user's input against the correct answer and updates the score.
 */
function checkAnswer() {
    const userAnswer = parseFloat(answerInput.value.trim());

    if (isNaN(userAnswer)) {
        feedback.textContent = 'Please enter a valid number!';
        feedback.className = 'feedback-message incorrect';
        return;
    }

    const correctAnswer = parseFloat(currentProblem.answer);
    const difference = Math.abs(userAnswer - correctAnswer);
    const isCorrect = difference < 0.001; 

    if (isCorrect) {
        feedback.textContent = '✅ Correct! Well done, 5 points awarded!';
        feedback.className = 'feedback-message correct';
        score += POINTS_PER_QUESTION; 
    } else {
        feedback.textContent = `❌ Incorrect. The correct answer is ${correctAnswer.toFixed(getDecimalPlaces(correctAnswer))}.`;
        feedback.className = 'feedback-message incorrect';
    }
    
    // Update the score display
    updateScoreDisplay();

    // Update UI
    checkButton.classList.add('hidden');
    hintButton.classList.add('hidden');
    nextButton.classList.remove('hidden');
    answerInput.disabled = true;
}

/**
 * Calculates and displays the hint for moving the decimal.
 */
function giveHint() {
    const { operation, power } = currentProblem;
    const powerString = power.toString();
    
    // The hint calculation now relies on the displayed power (which is always 10, 100, or 1000)
    // The number of places is one less than the number of digits (e.g., 100 has 3 digits, move 2 places).
    let places = powerString.length - 1; 

    let direction;
    let action;

    // Determine direction based on displayed operation and the fact that displayed power is >= 1
    // Multiplication (x 10, x 100) makes the number larger, moving decimal right.
    // Division (/ 10, / 100) makes the number smaller, moving decimal left.
    if (operation === 'x') {
        direction = 'right';
        action = 'larger';
    } else { // operation === '/'
        direction = 'left';
        action = 'smaller';
    }
    
    hintDisplay.innerHTML = `**Hint:** To ${operation === 'x' ? 'multiply' : 'divide'} by ${power}, you need to make the number **${action}**.<br>Move the decimal point **${direction.toUpperCase()}** by **${places}** place${places > 1 ? 's' : ''}!`;
    hintDisplay.classList.remove('hidden');
    hintButton.classList.add('hidden');
    hintDisplay.classList.add('incorrect'); 

    answerInput.focus();
}

/**
 * Updates the score and question counter display.
 */
function updateScoreDisplay() {
    scoreDisplay.textContent = `Total Score: ${score} / ${MAX_PROBLEMS * POINTS_PER_QUESTION}`;
    questionCounter.textContent = `Question ${problemCount} of ${MAX_PROBLEMS}`;
}

/**
 * Ends the game, shows final score, and offers to restart.
 */
function endGame() {
    // Hide game elements
    problemText.textContent = '';
    answerInput.classList.add('hidden');
    checkButton.classList.add('hidden');
    nextButton.classList.add('hidden');
    hintButton.classList.add('hidden');
    hintDisplay.classList.add('hidden');
    questionCounter.classList.add('hidden');
    
    // Calculate and display final message
    const finalScore = score;
    const maxScore = MAX_PROBLEMS * POINTS_PER_QUESTION;
    const percentage = (finalScore / maxScore) * 100;

    let celebrationMessage = '';
    if (percentage === 100) {
        celebrationMessage = "🎉 PERFECT SCORE! You are a Powers of 10 Master! 🎉";
    } else if (percentage >= 80) {
        celebrationMessage = "🌟 Fantastic effort! Great work on moving those decimals! 🌟";
    } else if (percentage >= 50) {
        celebrationMessage = "👍 Keep practicing! You've got the basics, keep moving that decimal! 👍";
    } else {
        celebrationMessage = "🧠 Good start! Review the rules for multiplying and dividing by powers of 10. 🧠";
    }

    feedback.innerHTML = `<h2>Game Over!</h2>
                          <p>${celebrationMessage}</p>
                          <p>Your Final Score: **${finalScore} out of ${maxScore}**</p>
                          <p>Percentage: **${percentage.toFixed(0)}%**</p>`;
    feedback.className = 'feedback-message correct'; // Use a strong style for the end message
    
    // Add Play Again Button
    const playAgainButton = document.createElement('button');
    playAgainButton.id = 'play-again-button';
    playAgainButton.textContent = 'Play Again!';
    playAgainButton.style.marginTop = '20px';
    gameContainer.appendChild(playAgainButton);
    
    playAgainButton.addEventListener('click', restartGame);
}

/**
 * Resets variables and starts the game over.
 */
function restartGame() {
    score = 0;
    problemCount = 0;
    
    // Remove the Play Again Button
    const playAgainButton = document.getElementById('play-again-button');
    if (playAgainButton) {
        playAgainButton.remove();
    }
    
    // Show hidden elements
    answerInput.classList.remove('hidden');
    questionCounter.classList.remove('hidden');
    
    // Reset UI and start the first problem
    feedback.className = 'feedback-message';
    answerInput.disabled = false;
    generateProblem();
}

/**
 * Helper function to determine decimal places for display.
 */
function getDecimalPlaces(num) {
    // Use the original logic, which attempts to show the answer without trailing zeros
    const answerString = parseFloat(num).toFixed(4).replace(/\.?0+$/, "");
    const parts_clean = answerString.split('.');
    return parts_clean.length > 1 ? parts_clean[1].length : 0;
}


// --- Event Listeners ---
checkButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', generateProblem);
hintButton.addEventListener('click', giveHint);

// Allow pressing Enter key to check answer
answerInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        if (!checkButton.classList.contains('hidden')) {
            checkAnswer();
        } else if (!nextButton.classList.contains('hidden')) {
            generateProblem();
        }
    }
});

// --- Start the Game ---
generateProblem();