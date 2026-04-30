// ========================================
// MATH PRACTICE ARENA - WORKING VERSION
// ========================================

let currentUser = null;
let currentProblems = [];
let currentSetId = null;
let userAnswers = [];
let allProblemSets = [];

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    generateAllProblemSets();
    loadUsers();
    loadScores();
    checkForSavedSession();
});

// Generate 100 problem sets
function generateAllProblemSets() {
    allProblemSets = [];
    for (let setNum = 1; setNum <= 100; setNum++) {
        const problems = [];
        for (let i = 0; i < 10; i++) {
            problems.push(generateRandomProblem());
        }
        allProblemSets.push({ setId: setNum, problems: problems });
    }
    console.log("Generated 100 problem sets");
}

function generateRandomProblem() {
    const operators = ['+', '-', '*', '/'];
    const num1 = Math.floor(Math.random() * 20) + 1;
    let num2 = Math.floor(Math.random() * 20) + 1;
    const op = operators[Math.floor(Math.random() * operators.length)];
    let answer, expression;
    
    if (op === '+') { answer = num1 + num2; expression = `${num1} + ${num2}`; }
    else if (op === '-') { answer = num1 - num2; expression = `${num1} - ${num2}`; }
    else if (op === '*') { answer = num1 * num2; expression = `${num1} × ${num2}`; }
    else {
        num2 = Math.max(1, num2);
        num1 = num1 * num2;
        answer = num1 / num2;
        expression = `${num1} ÷ ${num2}`;
    }
    return { expression, answer };
}

// Start New Game
function startNewGame() {
    console.log("START NEW GAME CALLED");
    
    // Get random problem set
    const randomIndex = Math.floor(Math.random() * allProblemSets.length);
    const problemSet = allProblemSets[randomIndex];
    currentSetId = problemSet.setId;
    currentProblems = [...problemSet.problems];
    userAnswers = new Array(10).fill(null);
    
    // SHOW the active game area
    const activeGameArea = document.getElementById('activeGameArea');
    if (activeGameArea) {
        activeGameArea.style.display = 'block';
    }
    
    // Hide results if visible
    const resultsArea = document.getElementById('resultsArea');
    if (resultsArea) {
        resultsArea.style.display = 'none';
    }
    
    // Reset progress bar
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
    // Reset problem display
    const problemSetDiv = document.getElementById('problemSet');
    if (problemSetDiv) {
        problemSetDiv.style.display = 'block';
    }
    
    // Display the problems
    displayProblems();
    
    // Scroll to game area
    activeGameArea.scrollIntoView({ behavior: 'smooth' });
}

function displayProblems() {
    const container = document.getElementById('problemSet');
    if (!container) return;
    
    container.innerHTML = '<h3>📝 Solve these 10 problems:</h3>';
    
    currentProblems.forEach((problem, idx) => {
        const div = document.createElement('div');
        div.className = 'problem-card';
        div.innerHTML = `
            <span>${idx + 1}. ${problem.expression} = ?</span>
            <input type="number" id="answer_${idx}" class="problem-input" placeholder="Your answer">
        `;
        container.appendChild(div);
    });
    
    const submitBtn = document.createElement('button');
    submitBtn.textContent = '📊 Submit Quiz';
    submitBtn.className = 'btn-primary';
    submitBtn.onclick = submitQuiz;
    container.appendChild(submitBtn);
}

function submitQuiz() {
    let score = 0;
    currentProblems.forEach((problem, idx) => {
        const input = document.getElementById(`answer_${idx}`);
        const userAnswer = parseInt(input?.value);
        if (userAnswer === problem.answer) score++;
    });
    
    if (!currentUser?.isGuest) {
        const scores = JSON.parse(localStorage.getItem('scores'));
        scores.push({ 
            userId: currentUser.id, 
            username: currentUser.username, 
            score: score, 
            setId: currentSetId, 
            date: new Date().toISOString() 
        });
        localStorage.setItem('scores', JSON.stringify(scores));
        
        if (score > (currentUser.bestScore || 0)) {
            currentUser.bestScore = score;
            const users = JSON.parse(localStorage.getItem('users'));
            const idx = users.findIndex(u => u.id === currentUser.id);
            if (idx !== -1) users[idx].bestScore = score;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            document.getElementById('bestScore').innerText = score;
            showGameMessage(`🎉 New High Score! ${score}/10 🎉`, 'success');
        } else {
            showGameMessage(`You scored ${score}/10!`, 'success');
        }
    }
    
    showResults(score);
}

function showResults(score) {
    document.getElementById('problemSet').style.display = 'none';
    const resultsArea = document.getElementById('resultsArea');
    if (resultsArea) {
        document.getElementById('finalScore').innerText = `${score}/10`;
        resultsArea.style.display = 'block';
    }
    displayPreviousRecords();
}

function displayPreviousRecords() {
    if (!currentUser || currentUser.isGuest) return;
    const scores = JSON.parse(localStorage.getItem('scores'));
    const userScores = scores.filter(s => s.userId === currentUser.id).slice(-10).reverse();
    const container = document.getElementById('recordsList');
    if (!container) return;
    
    if (userScores.length === 0) {
        container.innerHTML = '<div class="no-records">No records yet. Click "NEW GAME" to start!</div>';
        return;
    }
    
    container.innerHTML = '';
    userScores.forEach(s => {
        const div = document.createElement('div');
        div.className = 'record-item';
        const date = new Date(s.date).toLocaleString();
        div.innerHTML = `
            <span>⭐ Score: ${s.score}/10</span>
            <span>📋 Set #${s.setId}</span>
            <small>📅 ${date}</small>
        `;
        container.appendChild(div);
    });
}

// Auth functions
function loadUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
}

function loadScores() {
    if (!localStorage.getItem('scores')) {
        localStorage.setItem('scores', JSON.stringify([]));
    }
}

function checkForSavedSession() {
    const saved = localStorage.getItem('currentUser');
    if (saved) { 
        currentUser = JSON.parse(saved); 
        showGame(); 
    }
}

function switchTab(tab) {
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    if (tab === 'login') { 
        document.getElementById('loginPanel').classList.add('active'); 
        document.querySelectorAll('.tab-btn')[0].classList.add('active'); 
    } else if (tab === 'register') { 
        document.getElementById('registerPanel').classList.add('active'); 
        document.querySelectorAll('.tab-btn')[1].classList.add('active'); 
    } else { 
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
        password: password,
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
    
    if (!user) {
        showMessage('User not found! Please register first.', 'error');
        return;
    }
    
    currentUser = { ...user };
    delete currentUser.password;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showGame();
}

function guestLogin() {
    currentUser = { 
        id: 'guest_' + Date.now(), 
        username: 'Guest', 
        isGuest: true, 
        bestScore: 0 
    };
    showGame();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('leaderboardSection').style.display = 'none';
}

function showGame() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('gameSection').style.display = 'block';
    document.getElementById('leaderboardSection').style.display = 'none';
    document.getElementById('playerName').innerText = currentUser.username;
    document.getElementById('bestScore').innerText = currentUser.bestScore || 0;
    
    const guestBadge = document.getElementById('guestBadge');
    if (guestBadge) {
        guestBadge.style.display = currentUser.isGuest ? 'inline' : 'none';
    }
    
    // Hide active game area initially
    const activeGameArea = document.getElementById('activeGameArea');
    if (activeGameArea) {
        activeGameArea.style.display = 'none';
    }
    
    const problemSetDiv = document.getElementById('problemSet');
    if (problemSetDiv) {
        problemSetDiv.style.display = 'block';
    }
    
    const resultsArea = document.getElementById('resultsArea');
    if (resultsArea) {
        resultsArea.style.display = 'none';
    }
    
    displayPreviousRecords();
}

function showLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('scores'));
    const best = {};
    scores.forEach(s => { 
        if (!best[s.userId] || s.score > best[s.userId].score) {
            best[s.userId] = { username: s.username, score: s.score };
        }
    });
    const sorted = Object.values(best).sort((a,b) => b.score - a.score).slice(0, 20);
    const container = document.getElementById('leaderboardList');
    if (!container) return;
    
    container.innerHTML = '<h3>🏆 Top Players</h3>';
    if (sorted.length === 0) {
        container.innerHTML += '<p>No scores yet. Be the first to play!</p>';
    } else {
        sorted.forEach((e, i) => {
            let medal = '';
            if (i === 0) medal = '🥇 ';
            else if (i === 1) medal = '🥈 ';
            else if (i === 2) medal = '🥉 ';
            container.innerHTML += `<div class="leaderboard-item ${i < 3 ? 'rank-' + (i+1) : ''}">${medal}${i+1}. ${e.username} - ⭐ ${e.score}/10</div>`;
        });
    }
    
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('leaderboardSection').style.display = 'block';
}

function backToGame() {
    document.getElementById('leaderboardSection').style.display = 'none';
    document.getElementById('gameSection').style.display = 'block';
}

function showMessage(msg, type) {
    const div = document.createElement('div');
    div.className = `message message-${type}`;
    div.innerText = msg;
    const activePanel = document.querySelector('.auth-panel.active');
    if (activePanel) {
        activePanel.insertBefore(div, activePanel.firstChild);
    }
    setTimeout(() => div.remove(), 3000);
}

function showGameMessage(msg, type) {
    const div = document.createElement('div');
    div.className = `message message-${type}`;
    div.innerText = msg;
    div.style.position = 'fixed';
    div.style.top = '20px';
    div.style.left = '50%';
    div.style.transform = 'translateX(-50%)';
    div.style.zIndex = '9999';
    div.style.minWidth = '250px';
    div.style.textAlign = 'center';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function showInstructions() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>📚 How to Play</h3>
            <ul>
                <li>📝 Answer 10 math problems</li>
                <li>➕ Use +, -, ×, ÷</li>
                <li>⭐ Score 1 point per correct answer</li>
                <li>🏆 Beat your personal best!</li>
                <li>🎮 Click "NEW GAME" to start</li>
                <li>📋 100 unique problem sets available</li>
            </ul>
            <button onclick="this.parentElement.parentElement.remove()" class="btn-primary">Got it!</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Make functions global
window.startNewGame = startNewGame;
window.switchTab = switchTab;
window.register = register;
window.login = login;
window.guestLogin = guestLogin;
window.logout = logout;
window.submitQuiz = submitQuiz;
window.showLeaderboard = showLeaderboard;
window.backToGame = backToGame;
window.showInstructions = showInstructions;
