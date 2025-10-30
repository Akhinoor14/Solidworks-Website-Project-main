// Only Boss Portal - Simple Two-Step Authentication System
// New Simple Logic - Direct Password Verification

// ===========================
// PASSWORD CONFIGURATION
// ===========================

const PASSWORD_HASH = 'd7a5f8187ceede6c093445dad128e1b4ea2a21d91348a219b947ce2b70416212'; // SHA-256 hash only

// ===========================
// SESSION MANAGEMENT
// ===========================

function createSession() {
    const sessionId = 'boss_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('admin_session', sessionId);  // CHANGED: admin_session to match dashboard
    localStorage.setItem('admin_last_login', new Date().toISOString());  // ADDED: for dashboard display
}

function isAuthenticated() { 
    return sessionStorage.getItem('admin_session') !== null;  // CHANGED: admin_session
}

function clearSession() { 
    sessionStorage.removeItem('admin_session');  // CHANGED: specific removal
}

// ===========================
// UI STATE MANAGEMENT
// ===========================

const passwordInput = document.getElementById('password1');
const loginBtn = document.getElementById('step1Btn');
const errorMsg = document.getElementById('error1');

function showSuccess() {
    window.location.href = './only-boss-dashboard.html';
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    errorMsg.parentElement.classList.add('shake');
    setTimeout(() => { 
        errorMsg.parentElement.classList.remove('shake'); 
    }, 300);
    setTimeout(() => { 
        errorMsg.style.display = 'none'; 
    }, 3000);
}

// ===========================
// SECURE SINGLE-STEP AUTHENTICATION LOGIC
// ===========================

async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyLogin() {
    const password = passwordInput.value.trim();
    if (!password) {
        showError('⚠️ Please enter the password');
        return;
    }
    const enteredHash = await hashPassword(password);
    if (enteredHash === PASSWORD_HASH) {
        createSession();
        showSuccess();
    } else {
        showError('❌ Incorrect password');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function goBackToStep1() { 
    password2Input.value = ''; 
    showStep(1); 
}

// ===========================
// EVENT LISTENERS
// ===========================

loginBtn.addEventListener('click', verifyLogin);
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        verifyLogin();
    }
});

// ===========================
// PASSWORD TOGGLE FUNCTION
// ===========================

window.togglePassword = function(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        button.style.color = '#ffd700';
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        button.style.color = 'rgba(255,255,255,0.6)';
    }
};

// ===========================
// INITIALIZATION
// ===========================

// Always require password unless authenticated in this session
if (isAuthenticated()) {
    window.location.href = './only-boss-dashboard.html';
    // Prevent auto-login after reload by requiring new session each time
    sessionStorage.removeItem('admin_session');
} else {
    passwordInput.focus();
}

// Session timeout - 30 minutes
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (isAuthenticated()) {
            console.log('⏱️ Session timeout');
            clearSession();
            alert('Session expired due to inactivity');
            window.location.reload();
        }
    }, 30 * 60 * 1000);
}

['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => 
    document.addEventListener(evt, resetInactivityTimer)
);
resetInactivityTimer();

// All password-related console logs removed for security.