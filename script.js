// ========================================
// MATH PRACTICE ARENA - MAIN APPLICATION
// ========================================

// Global variables
let currentUser = null;
let currentProblems = [];
let userAnswers = [];
let currentProblemIndex = 0;

// Initialize the app when page loads
window.addEventListener('DOMContentLoaded', () => {
    init();
});

// Initialize application
function init() {
    loadUsers();
    loadScores();
    checkForSavedSession();
    setupEventListeners();
}

// Setup event listeners for Enter key presses
function setupEventListeners() {
    // Login with Enter key
    const loginInput = document.getElementById('loginUsername');
    if (loginInput) {
        loginInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }
    
    // Register with Enter key
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
        // Create some demo users for testing
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
        // Create demo scores
        const demoScores = [
            { userId: 1, username: 'Alex', score: 8, date: new Date().toISOString() },
            { userId: 1, username: 'Alex', score: 9, date: new Date().toISOString() },
            { userId: 2, username: 'Sarah', score: 10, date: new Date().toISOString() },
            { userId: 2, username: 'Sarah', score: 9, date: new Date().toISOString() },
            { userId: 3, username: 'Mike', score: 7, date: new Date().toISOString() },
            { userId: 3, username: 'Mike', score: 8, date: new Date().toISOString() }
        ];
        localStorage.setItem('scores', JSON.stringify(demoScores));
    }
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

function switchTab(tab) {
    // Hide all panels
    document.querySelectorAll('.auth-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected panel
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
    
    // Validation
    if (!username) {
        showMessage('Please enter a username', 'error');
        return;
    }
    
    if (!password || password.length < 4) {
        showMessage('Password must be at least 4 characters', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Check if username exists
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        showMessage('Username already exists! Please choose another.', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        username: username,
        password: password, // Note: In production, hash this!
        bestScore: 0,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('Registration successful! Please login.', 'success');
    
    // Clear form
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    
    // Switch to login tab
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
        currentUser = { ...user }; // Copy user object
        currentUser.password = undefined; // Don't store password in memory
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.removeItem('guestMode'); // Clear guest mode if active
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
    
    // Clear forms
    document.getElementById('loginUsername').value = '';
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    
    switchTab('login');
}

// ========================================
// MATH PROBLEM GENERATION
// ========================================

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

function generateProblemSet() {
    const problems = [];
    for (let i = 0; i < 10; i++) {
        problems.push(generateRandomProblem());
    }
    return problems;
}

// ========================================
// GAME FUNCTIONS
// ========================================

function showGame() {
    // Hide auth, show game
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('gameSection').style.display = 'block';
    document.getElementById('leaderboardSection').style.display = 'none';
    
    // Update user info
    document.getElementById('playerName').textContent = currentUser.username;
    document.getElementById('bestScore').textContent = currentUser.bestScore || 0;
    
    // Show/hide guest badge
    if (currentUser.isGuest) {
        document.getElementById('guestBadge').style.display = 'inline';
    } else {
        document.getElementById('guestBadge').style.display = 'none';
    }
    
    // Generate new problems
    currentProblems = generateProblemSet();
    userAnswers = new Array(10).fill(null);
    currentProblemIndex = 0;
    
    displayProblems();
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
    
    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.textContent = '📊 Submit Quiz';
    submitBtn.className = 'btn-primary';
    submitBtn.onclick = submitQuiz;
    problemSetDiv.appendChild(submitBtn);
    
    // Update progress bar
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
    // Check if all questions are answered
    const unanswered = userAnswers.filter(a => a === null).length;
    
    if (unanswered > 0) {
        const confirmSubmit = confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit?`);
        if (!confirmSubmit) {
            return;
        }
    }
    
    // Calculate score
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
    
    // Save score if not guest
    if (!currentUser.isGuest) {
        saveScore(score);
    }
    
    // Show results
    showResults(score, results);
}

function saveScore(score) {
    const scores = JSON.parse(localStorage.getItem('scores'));
    scores.push({
        userId: currentUser.id,
        username: currentUser.username,
        score: score,
        date: new Date().toISOString()
    });
    localStorage.setItem('scores', JSON.stringify(scores));
    
    // Update best score
    if (score > currentUser.bestScore) {
        currentUser.bestScore = score;
        
        // Update in users array
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].bestScore = score;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Update current user
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('bestScore').textContent = score;
        
        // Show congratulation for new high score
        setTimeout(() => {
            showMessage(`🎉 New High Score! ${score}/10 🎉`, 'success');
        }, 500);
    }
}

function showResults(score, results) {
    // Hide problems, show results
    document.getElementById('problemSet').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('finalScore').textContent = `${score}/10`;
    
    // Add detailed results
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
    
    // Add styles for results details
    const style = document.createElement('style');
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

function resetQuiz() {
    // Generate new problems
    currentProblems = generateProblemSet();
    userAnswers = new Array(10).fill(null);
    currentProblemIndex = 0;
    
    // Reset display
    document.getElementById('problemSet').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    // Remove detailed results if present
    const resultsDetails = document.querySelector('.results-details');
    if (resultsDetails) resultsDetails.remove();
    const extraStyle = document.querySelector('style:last-of-type');
    if (extraStyle && extraStyle.textContent.includes('.results-details')) {
        extraStyle.remove();
    }
    
    displayProblems();
}

// ========================================
// LEADERBOARD FUNCTIONS
// ========================================

function showLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('scores'));
    
    // Group scores by user and get best score
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
    
    // Convert to array and sort
    const leaderboardData = Object.values(userBestScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50); // Top 50
    
    const leaderboardDiv = document.getElementById('leaderboardList');
    leaderboardDiv.innerHTML = '';
    
    if (leaderboardData.length === 0) {
        leaderboardDiv.innerHTML = '<p style="text-align:center;">No scores yet. Be the first to play!</p>';
    } else {
        leaderboardData.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = `leaderboard-item ${index < 3 ? `rank-${index + 1}` : ''}`;
            
            // Medal emoji for top 3
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
    
    // Add CSS for leaderboard items
    const leaderboardStyle = document.createElement('style');
    leaderboardStyle.textContent = `
        .leaderboard-rank {
            font-weight: bold;
            min-width: 60px;
        }
        .leaderboard-name {
            flex: 1;
            margin: 0 10px;
        }
        .leaderboard-score {
            font-weight: bold;
        }
        .leaderboard-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    `;
    leaderboardDiv.appendChild(leaderboardStyle);
    
    // Hide game, show leaderboard
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
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Insert at top of active auth panel
    const activePanel = document.querySelector('.auth-panel.active');
    activePanel.insertBefore(messageDiv, activePanel.firstChild);
    
    // Remove after 3 seconds
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
        // Create modal if it doesn't exist
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

// Make functions available globally
window.switchTab = switchTab;
window.register = register;
window.login = login;
window.guestLogin = guestLogin;
window.logout = logout;
window.saveAnswer = saveAnswer;
window.submitQuiz = submitQuiz;
window.resetQuiz = resetQuiz;
window.showLeaderboard = showLeaderboard;
window.refreshLeaderboard = refreshLeaderboard;
window.backToGame = backToGame;
window.showInstructions = showInstructions;
window.closeInstructions = closeInstructions;
