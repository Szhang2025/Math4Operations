// ========================================
// MATH PRACTICE ARENA - MAIN APPLICATION
// WITH 100 UNIQUE PROBLEM SETS
// ========================================

// Global variables
let currentUser = null;
let currentProblems = [];
let currentSetId = null;
let userAnswers = [];
let currentProblemIndex = 0;

// Store all 100 problem sets
let allProblemSets = [];

// Initialize the app when page loads
window.addEventListener('DOMContentLoaded', () => {
    init();
});

// Initialize application
function init() {
    generateAllProblemSets(); // Generate 100 UNIQUE problem sets
    console.log(`✅ Initialized with ${allProblemSets.length} unique problem sets`);
    loadUsers();
    loadScores();
    checkForSavedSession();
    setupEventListeners();
}

// Generate 100 UNIQUE problem sets (no duplicates)
function generateAllProblemSets() {
    console.log("Generating 100 UNIQUE problem sets...");
    allProblemSets = [];
    
    const usedSetSignatures = new Set(); // Track unique sets
    
    for (let setNum = 1; setNum <= 100; setNum++) {
        let attempts = 0;
        let isUnique = false;
        let newSet = null;
        
        // Keep generating until we find a unique set (max 1000 attempts)
        while (!isUnique && attempts < 1000) {
            const problems = [];
            
            // Generate 10 random problems for this set
            for (let probNum = 1; probNum <= 10; probNum++) {
                const problem = generateRandomProblem();
                problems.push(problem);
            }
            
            // Create a unique signature for this set (string of answers)
            const setSignature = problems.map(p => `${p.expression}|${p.answer}`).join(';;');
            
            // Check if this exact set already exists
            if (!usedSetSignatures.has(setSignature)) {
                usedSetSignatures.add(setSignature);
                newSet = {
                    setId: setNum,
                    problems: problems,
                    difficulty: getDifficultyForSet(setNum)
                };
                isUnique = true;
            }
            
            attempts++;
        }
        
        if (newSet) {
            allProblemSets.push(newSet);
        } else {
            // Fallback: create a deterministic set as last resort
            console.warn(`Could not find unique set for set ${setNum}, using fallback`);
            const fallbackProblems = [];
            for (let i = 1; i <= 10; i++) {
                fallbackProblems.push({
                    expression: `${setNum} + ${i}`,
                    answer: setNum + i
                });
            }
            allProblemSets.push({
                setId: setNum,
                problems: fallbackProblems,
                difficulty: getDifficultyForSet(setNum)
            });
        }
    }
    
    // Verify uniqueness
    const uniqueCheck = new Set();
    let duplicateCount = 0;
    allProblemSets.forEach(set => {
        const sig = set.problems.map(p => `${p.expression}|${p.answer}`).join(';;');
        if (uniqueCheck.has(sig)) duplicateCount++;
        uniqueCheck.add(sig);
    });
    
    console.log(`✅ Generated ${allProblemSets.length} problem sets`);
    console.log(`🔍 Uniqueness check: ${duplicateCount === 0 ? 'PASSED - No duplicates!' : `FAILED - ${duplicateCount} duplicates found`}`);
}

// Generate a truly random problem
function generateRandomProblem() {
    const operators = ['+', '-', '*', '/'];
    const num1 = Math.floor(Math.random() * 20) + 1;
    let num2 = Math.floor(Math.random() * 20) + 1;
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    let expression;
    
    switch(operator) {
        case '+':
            answer = num1 + num2;
            expression = `${num1} + ${num2}`;
            break;
        case '-':
            answer = num1 - num2;
            expression = `${num1} - ${num2}`;
            break;
        case '*':
            answer = num1 * num2;
            expression = `${num1} × ${num2}`;
            break;
        case '/':
            // Ensure clean division with no remainders
            num2 = Math.max(1, num2);
            num1 = num1 * num2;
            answer = num1 / num2;
            expression = `${num1} ÷ ${num2}`;
            break;
    }
    
    // Add parentheses for complexity (20% chance)
    if (Math.random() < 0.2 && operator !== '/') {
        expression = `(${expression})`;
    }
    
    return { expression, answer };
}

// Get difficulty level for a set
function getDifficultyForSet(setNum) {
    if (setNum <= 33) return "Easy";
    if (setNum <= 66) return "Medium";
    return "Hard";
}

// Get a random problem set
function getRandomProblemSet() {
    if (allProblemSets.length === 0) {
        generateAllProblemSets();
    }
    const randomIndex = Math.floor(Math.random() * allProblemSets.length);
    const problemSet = allProblemSets[randomIndex];
    return {
        setId: problemSet.setId,
        problems: [...problemSet.problems],
        difficulty: problemSet.difficulty
    };
}

// Start a new game with random set
function newGame() {
    console.log("Starting NEW game...");
    
    // Get random problem set
    const randomSet = getRandomProblemSet();
    currentSetId = randomSet.setId;
    currentProblems = [...randomSet.problems]; // Create a fresh copy
    userAnswers = new Array(10).fill(null);
    currentProblemIndex = 0;
    
    console.log(`NEW Game - Set #${currentSetId} with ${currentProblems.length} problems`);
    
    // Update display
    const setNumberElement = document.getElementById('currentSetNumber');
    if (setNumberElement) {
        setNumberElement.textContent = currentSetId;
    }
    
    // Reset UI - make sure problemSet is visible and results are hidden
    const problemSetDiv = document.getElementById('problemSet');
    const resultsDiv = document.getElementById('results');
    
    if (problemSetDiv) {
        problemSetDiv.style.display = 'block';
        problemSetDiv.innerHTML = ''; // Clear old content
    }
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
        // Remove detailed results if present
        const resultsDetails = document.querySelector('.results-details');
        if (resultsDetails) resultsDetails.remove();
    }
    
    // Remove any extra style elements
    const extraStyle = document.querySelector('style.results-style');
    if (extraStyle) extraStyle.remove();
    
    // Reset progress bar
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
    // Display the problems
    displayProblems();
    
    // Show confirmation message
    showGameMessage(`🎮 New Game! Problem Set #${currentSetId} (${randomSet.difficulty})`, 'success');
}

// Display problems in the UI
function displayProblems() {
    const problemSetDiv = document.getElementById('problemSet');
    if (!problemSetDiv) {
        console.error("ProblemSet div not found!");
        return;
    }
    
    // Clear existing content
    problemSetDiv.innerHTML = '<h3>📝 Solve these problems:</h3>';
    
    if (!currentProblems || currentProblems.length === 0) {
        console.error("No problems loaded!");
        problemSetDiv.innerHTML += '<p>Error loading problems. Please click "New Game".</p>';
        return;
    }
    
    // Display each problem
    currentProblems.forEach((problem, index) => {
        const problemCard = document.createElement('div');
        problemCard.className = 'problem-card';
        problemCard.id = `problem-${index}`;
        problemCard.innerHTML = `
            <span class="problem-text">${index + 1}. ${problem.expression} = ?</span>
            <input 
                type="number" 
                id="answer_${index}" 
                class="problem-input" 
                placeholder="Your answer"
                value="${userAnswers[index] !== null ? userAnswers[index] : ''}"
                onchange="saveAnswer(${index})"
            >
        `;
        problemSetDiv.appendChild(problemCard);
    });
    
    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.textContent = '📊 Submit Quiz';
    submitBtn.className = 'btn-primary';
    submitBtn.onclick = () => submitQuiz();
    problemSetDiv.appendChild(submitBtn);
    
    console.log(`✅ Displayed ${currentProblems.length} problems`);
}

// Setup event listeners for Enter key presses
function setupEventListeners() {
    const loginInput = document.getElementById('loginUsername');
    if (loginInput) {
        loginInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }
    
    const registerUsername = document.getElementById('registerUsername');
    const registerPassword = document.getElementById('registerPassword');
    if (registerUsername) {
        registerUsername.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') register();
        });
    }
    if (registerPassword) {
        registerPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') register();
        });
    }
}

// Check if user was previously logged in
function checkForSavedSession() {
    const savedUser = localStorage.getItem('currentUser');
    const guestMode = localStorage.getItem('guestMode');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showGame();
    } else if (guestMode === 'true') {
        guestLogin();
    }
}

// Load users from localStorage (starts empty - no demo users)
function loadUsers() {
    if (!localStorage.getItem('users')) {
        // Start with empty users array - no demo users
        localStorage.setItem('users', JSON.stringify([]));
    }
}

// Load scores from localStorage (starts empty)
function loadScores() {
    if (!localStorage.getItem('scores')) {
        // Start with empty scores array
        localStorage.setItem('scores', JSON.stringify([]));
    }
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

function switchTab(tab) {
    document.querySelectorAll('.auth-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (tab === 'login') {
        document.getElementById('loginPanel').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tab === 'register') {
        document.getElementById('registerPanel').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    } else if (tab === 'guest') {
        document.getElementById('guestPanel').classList.add('active');
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
    }
}

function register() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    if (!username) {
        showMessage('Please enter a username', 'error');
        return;
    }
    
    if (!password || password.length < 4) {
        showMessage('Password must be at least 4 characters', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        showMessage('Username already exists! Please choose another.', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        bestScore: 0,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('Registration successful! Please login.', 'success');
    
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    
    switchTab('login');
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    
    if (!username) {
        showMessage('Please enter your username', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (user) {
        currentUser = { ...user };
        currentUser.password = undefined;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.removeItem('guestMode');
        showGame();
    } else {
        showMessage('User not found! Please register first.', 'error');
    }
}

function guestLogin() {
    currentUser = {
        id: 'guest_' + Date.now(),
        username: 'Guest',
        isGuest: true,
        bestScore: 0
    };
    localStorage.setItem('guestMode', 'true');
    localStorage.removeItem('currentUser');
    showGame();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('guestMode');
    
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('leaderboardSection').style.display = 'none';
    
    document.getElementById('loginUsername').value = '';
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    
    switchTab('login');
}

// ========================================
// GAME FUNCTIONS
// ========================================

function showGame() {
    console.log("Showing game section...");
    
    // Hide auth, show game
    const authSection = document.getElementById('authSection');
    const gameSection = document.getElementById('gameSection');
    const leaderboardSection = document.getElementById('leaderboardSection');
    
    if (authSection) authSection.style.display = 'none';
    if (gameSection) gameSection.style.display = 'block';
    if (leaderboardSection) leaderboardSection.style.display = 'none';
    
    // Update user info
    const playerNameSpan = document.getElementById('playerName');
    const bestScoreSpan = document.getElementById('bestScore');
    const guestBadge = document.getElementById('guestBadge');
    
    if (playerNameSpan) playerNameSpan.textContent = currentUser.username;
    if (bestScoreSpan) bestScoreSpan.textContent = currentUser.bestScore || 0;
    
    if (guestBadge) {
        if (currentUser.isGuest) {
            guestBadge.style.display = 'inline';
        } else {
            guestBadge.style.display = 'none';
        }
    }
    
    // Start a new game (this will load and display problems)
    newGame();
}

function saveAnswer(index) {
    const answerInput = document.getElementById(`answer_${index}`);
    if (answerInput) {
        const answer = parseInt(answerInput.value);
        
        if (!isNaN(answer)) {
            userAnswers[index] = answer;
        } else {
            userAnswers[index] = null;
        }
        
        updateProgress();
    }
}

function updateProgress() {
    const answeredCount = userAnswers.filter(a => a !== null).length;
    const progressPercent = (answeredCount / 10) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
}

function submitQuiz() {
    const unanswered = userAnswers.filter(a => a === null).length;
    
    if (unanswered > 0) {
        const confirmSubmit = confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit?`);
        if (!confirmSubmit) {
            return;
        }
    }
    
    let score = 0;
    const results = [];
    
    currentProblems.forEach((problem, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === problem.answer;
        if (isCorrect) score++;
        results.push({
            problem: problem.expression,
            correctAnswer: problem.answer,
            userAnswer: userAnswer,
            isCorrect: isCorrect
        });
    });
    
    if (!currentUser.isGuest) {
        saveScore(score);
    }
    
    showResults(score, results);
}

function saveScore(score) {
    const scores = JSON.parse(localStorage.getItem('scores'));
    scores.push({
        userId: currentUser.id,
        username: currentUser.username,
        score: score,
        setId: currentSetId,
        date: new Date().toISOString()
    });
    localStorage.setItem('scores', JSON.stringify(scores));
    
    if (score > currentUser.bestScore) {
        currentUser.bestScore = score;
        
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].bestScore = score;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        const bestScoreSpan = document.getElementById('bestScore');
        if (bestScoreSpan) bestScoreSpan.textContent = score;
        
        setTimeout(() => {
            showGameMessage(`🎉 New High Score! ${score}/10 🎉`, 'success');
        }, 500);
    }
}

function showResults(score, results) {
    const problemSetDiv = document.getElementById('problemSet');
    const resultsDiv = document.getElementById('results');
    
    if (problemSetDiv) problemSetDiv.style.display = 'none';
    if (resultsDiv) {
        // Clear previous results
        const oldDetails = resultsDiv.querySelector('.results-details');
        if (oldDetails) oldDetails.remove();
        
        resultsDiv.style.display = 'block';
    }
    
    const finalScoreSpan = document.getElementById('finalScore');
    if (finalScoreSpan) finalScoreSpan.textContent = `${score}/10`;
    
    const resultsDetails = document.createElement('div');
    resultsDetails.className = 'results-details';
    resultsDetails.innerHTML = '<h4>Detailed Results:</h4>';
    
    results.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
        resultItem.innerHTML = `
            <span>${index + 1}. ${result.problem}</span>
            <span>Your answer: ${result.userAnswer !== null ? result.userAnswer : 'No answer'}</span>
            <span>Correct: ${result.correctAnswer}</span>
            ${!result.isCorrect ? '<span class="wrong-mark">❌</span>' : '<span class="correct-mark">✅</span>'}
        `;
        resultsDetails.appendChild(resultItem);
    });
    
    if (resultsDiv) resultsDiv.appendChild(resultsDetails);
    
    // Add styles if not already present
    if (!document.querySelector('style.results-style')) {
        const style = document.createElement('style');
        style.className = 'results-style';
        style.textContent = `
            .results-details {
                margin-top: 20px;
                max-height: 300px;
                overflow-y: auto;
            }
            .result-item {
                display: grid;
                grid-template-columns: auto 1fr auto auto;
                gap: 15px;
                align-items: center;
                padding: 10px;
                margin: 5px 0;
                border-radius: 8px;
                font-size: 14px;
            }
            .result-item.correct {
                background: #d4edda;
                color: #155724;
            }
            .result-item.incorrect {
                background: #f8d7da;
                color: #721c24;
            }
            .correct-mark {
                font-size: 20px;
            }
            .wrong-mark {
                font-size: 20px;
            }
            @media (max-width: 768px) {
                .result-item {
                    grid-template-columns: 1fr;
                    gap: 5px;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========================================
// LEADERBOARD FUNCTIONS
// ========================================

function showLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('scores'));
    
    const userBestScores = {};
    scores.forEach(score => {
        if (!userBestScores[score.userId] || score.score > userBestScores[score.userId].score) {
            userBestScores[score.userId] = {
                username: score.username,
                score: score.score,
                userId: score.userId
            };
        }
    });
    
    const leaderboardData = Object.values(userBestScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
    
    const leaderboardDiv = document.getElementById('leaderboardList');
    if (!leaderboardDiv) return;
    
    leaderboardDiv.innerHTML = '';
    
    if (leaderboardData.length === 0) {
        leaderboardDiv.innerHTML = '<p style="text-align:center;">No scores yet. Be the first to play!</p>';
    } else {
        leaderboardData.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = `leaderboard-item ${index < 3 ? `rank-${index + 1}` : ''}`;
            
            let medal = '';
            if (index === 0) medal = '🥇 ';
            else if (index === 1) medal = '🥈 ';
            else if (index === 2) medal = '🥉 ';
            
            item.innerHTML = `
                <div class="leaderboard-rank">${medal}#${index + 1}</div>
                <div class="leaderboard-name">${escapeHtml(entry.username)}</div>
                <div class="leaderboard-score">⭐ ${entry.score}/10</div>
            `;
            leaderboardDiv.appendChild(item);
        });
    }
    
    const gameSection = document.getElementById('gameSection');
    const leaderboardSection = document.getElementById('leaderboardSection');
    
    if (gameSection) gameSection.style.display = 'none';
    if (leaderboardSection) leaderboardSection.style.display = 'block';
}

function refreshLeaderboard() {
    showLeaderboard();
}

function backToGame() {
    const gameSection = document.getElementById('gameSection');
    const leaderboardSection = document.getElementById('leaderboardSection');
    
    if (gameSection) gameSection.style.display = 'block';
    if (leaderboardSection) leaderboardSection.style.display = 'none';
    
    // Refresh the game display
    displayProblems();
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    const activePanel = document.querySelector('.auth-panel.active');
    if (activePanel) {
        activePanel.insertBefore(messageDiv, activePanel.firstChild);
    }
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function showGameMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.minWidth = '300px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.padding = '12px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    
    if (type === 'success') {
        messageDiv.style.background = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.style.border = '1px solid #c3e6cb';
    } else {
        messageDiv.style.background = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
    }
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showInstructions() {
    const modal = document.getElementById('instructionsModal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        createInstructionsModal();
    }
}

function createInstructionsModal() {
    const modal = document.createElement('div');
    modal.id = 'instructionsModal';
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';
    
    modal.innerHTML = `
        <div class="modal-content" style="background:white; padding:30px; border-radius:20px; max-width:500px; width:90%;">
            <span class="close" style="float:right; font-size:28px; cursor:pointer;" onclick="closeInstructions()">&times;</span>
            <h3>📚 How to Play</h3>
            <ul style="margin-top:20px;">
                <li>📝 Answer 10 random math problems</li>
                <li>➕ Use addition (+), subtraction (-), multiplication (×), division (÷)</li>
                <li>🧠 Some problems have parentheses for extra challenge</li>
                <li>⭐ Score 1 point for each correct answer</li>
                <li>🏆 Try to beat your personal best!</li>
                <li>📋 100 UNIQUE problem sets available</li>
                <li>🎮 Click "New Game" for a fresh set of problems</li>
                <li>👥 Create an account to save your scores</li>
                <li>🌍 Compete on the global leaderboard</li>
            </ul>
            <button onclick="closeInstructions()" class="btn-primary" style="margin-top:20px; width:100%;">Got it!</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeInstructions() {
    const modal = document.getElementById('instructionsModal');
    if (modal) {
        modal.remove();
    }
}

// ========================================
// EXPORT FUNCTIONS FOR GLOBAL ACCESS
// ========================================

window.switchTab = switchTab;
window.register = register;
window.login = login;
window.guestLogin = guestLogin;
window.logout = logout;
window.saveAnswer = saveAnswer;
window.submitQuiz = submitQuiz;
window.newGame = newGame;
window.showLeaderboard = showLeaderboard;
window.refreshLeaderboard = refreshLeaderboard;
window.backToGame = backToGame;
window.showInstructions = showInstructions;
window.closeInstructions = closeInstructions;
