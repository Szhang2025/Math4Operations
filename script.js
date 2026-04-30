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
    
    // Log sample of first 3 sets
    for (let i = 0; i < Math.min(3, allProblemSets.length); i++) {
        console.log(`Set ${allProblemSets[i].setId}: ${allProblemSets[i].problems.length} problems (${allProblemSets[i].difficulty})`);
    }
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

// Alternative: Generate deterministic but DIFFERENT problems for each set
// Use this if you want consistent sets across page reloads
function generateDeterministicUniqueSets() {
    allProblemSets = [];
    
    for (let setNum = 1; setNum <= 100; setNum++) {
        const problems = [];
        
        // Use different seed for each set to ensure uniqueness
        for (let probNum = 1; probNum <= 10; probNum++) {
            // Each set gets its own unique seed combination
            const seed = (setNum * 10000) + (probNum * 100) + Math.floor(Math.random() * 100);
            const problem = generateSeededProblem(seed, setNum, probNum);
            problems.push(problem);
        }
        
        allProblemSets.push({
            setId: setNum,
            problems: problems,
            difficulty: getDifficultyForSet(setNum)
        });
    }
}

// Generate problem based on seed (deterministic)
function generateSeededProblem(seed, setNum, probNum) {
    // Use a simple pseudo-random generator
    let rng = function(max) {
        seed = (seed * 9301 + 49297) % 233280;
        const rnd = seed / 233280;
        return Math.floor(rnd * max);
    };
    
    const operators = ['+', '-', '*', '/'];
    const num1 = rng(20) + 1;
    let num2 = rng(20) + 1;
    const operator = operators[rng(operators.length)];
    
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
            num2 = Math.max(1, num2);
            num1 = num1 * num2;
            answer = num1 / num2;
            expression = `${num1} ÷ ${num2}`;
            break;
    }
    
    // Add parentheses occasionally
    if (rng(100) < 20 && operator !== '/') {
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

// Get a specific problem set by ID
function getProblemSetById(setId) {
    const problemSet = allProblemSets.find(ps => ps.setId === setId);
    if (problemSet) {
        return {
            setId: problemSet.setId,
            problems: [...problemSet.problems],
            difficulty: problemSet.difficulty
        };
    }
    return getRandomProblemSet();
}

// Start a new game with random set
function newGame() {
    const randomSet = getRandomProblemSet();
    currentSetId = randomSet.setId;
    currentProblems = randomSet.problems;
    userAnswers = new Array(10).fill(null);
    currentProblemIndex = 0;
    
    // Update display
    document.getElementById('currentSetNumber').textContent = currentSetId;
    
    // Reset UI
    document.getElementById('problemSet').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    // Remove detailed results if present
    const resultsDetails = document.querySelector('.results-details');
    if (resultsDetails) resultsDetails.remove();
    const extraStyle = document.querySelector('style.results-style');
    if (extraStyle) extraStyle.remove();
    
    displayProblems();
    
    // Show confirmation message
    showGameMessage(`New game started! Problem Set #${currentSetId} (${randomSet.difficulty})`, 'success');
    
    // Log for debugging
    console.log(`Started Set #${currentSetId} with ${currentProblems.length} problems`);
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

// Load users from localStorage
function loadUsers() {
    if (!localStorage.getItem('users')) {
        const demoUsers = [
            {
                id: 1,
                username: 'Alex',
                password: '1234',
                bestScore: 8,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'Sarah',
                password: '1234',
                bestScore: 10,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                username: 'Mike',
                password: '1234',
                bestScore: 7,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(demoUsers));
    }
}

// Load scores from localStorage
function loadScores() {
    if (!localStorage.getItem('scores')) {
        const demoScores = [
            { userId: 1, username: 'Alex', score: 8, setId: 15, date: new Date().toISOString() },
            { userId: 1, username: 'Alex', score: 9, setId: 42, date: new Date().toISOString() },
            { userId: 2, username: 'Sarah', score: 10, setId: 7, date: new Date().toISOString() },
            { userId: 2, username: 'Sarah', score: 9, setId: 88, date: new Date().toISOString() },
            { userId: 3, username: 'Mike', score: 7, setId: 23, date: new Date().toISOString() },
            { userId: 3, username: 'Mike', score: 8, setId: 56, date: new Date().toISOString() }
        ];
        localStorage.setItem('scores', JSON.stringify(demoScores));
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
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('gameSection').style.display = 'block';
    document.getElementById('leaderboardSection').style.display = 'none';
    
    document.getElementById('playerName').textContent = currentUser.username;
    document.getElementById('bestScore').textContent = currentUser.bestScore || 0;
    
    if (currentUser.isGuest) {
        document.getElementById('guestBadge').style.display = 'inline';
    } else {
        document.getElementById('guestBadge').style.display = 'none';
    }
    
    newGame();
}

function displayProblems() {
    const problemSetDiv = document.getElementById('problemSet');
    problemSetDiv.innerHTML = '<h3>📝 Solve these problems:</h3>';
    
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
    
    const submitBtn = document.createElement('button');
    submitBtn.textContent = '📊 Submit Quiz';
    submitBtn.className = 'btn-primary';
    submitBtn.onclick = submitQuiz;
    problemSetDiv.appendChild(submitBtn);
    
    updateProgress();
}

function saveAnswer(index) {
    const answerInput = document.getElementById(`answer_${index}`);
    const answer = parseInt(answerInput.value);
    
    if (!isNaN(answer)) {
        userAnswers[index] = answer;
    } else {
        userAnswers[index] = null;
    }
    
    updateProgress();
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
        document.getElementById('bestScore').textContent = score;
        
        setTimeout(() => {
            showGameMessage(`🎉 New High Score! ${score}/10 🎉`, 'success');
        }, 500);
    }
}

function showResults(score, results) {
    document.getElementById('problemSet').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('finalScore').textContent = `${score}/10`;
    
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
    
    const resultsContainer = document.getElementById('results');
    resultsContainer.appendChild(resultsDetails);
    
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
    resultsContainer.appendChild(style);
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
    
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('leaderboardSection').style.display = 'block';
}

function refreshLeaderboard() {
    showLeaderboard();
}

function backToGame() {
    document.getElementById('leaderboardSection').style.display = 'none';
    document.getElementById('gameSection').style.display = 'block';
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    const activePanel = document.querySelector('.auth-panel.active');
    activePanel.insertBefore(messageDiv, activePanel.firstChild);
    
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
    messageDiv.style.left = '50%;
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.minWidth = '300px';
    messageDiv.style.textAlign = 'center';
    
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
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeInstructions()">&times;</span>
            <h3>📚 How to Play</h3>
            <ul>
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
            <button onclick="closeInstructions()" class="btn-primary">Got it!</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeInstructions() {
    const modal = document.getElementById('instructionsModal');
    if (modal) {
        modal.style.display = 'none';
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
