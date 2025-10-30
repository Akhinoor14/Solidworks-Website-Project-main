// Only Boss Portal - Simple Two-Step Authentication System
// New Simple Logic - Direct Password Verification

// ===========================
// PASSWORD CONFIGURATION
// ===========================

// Hardcoded passwords - Simple and Direct
const PASSWORDS = {
    primary: "MOUnoor21014",
    secondary: "Admin2024"
};

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

let currentStep = 1;
const step1Element = document.getElementById('step1');
const step2Element = document.getElementById('step2');
const successElement = document.getElementById('successStep');
const stepIndicator1 = document.getElementById('stepIndicator1');
const stepIndicator2 = document.getElementById('stepIndicator2');
const password1Input = document.getElementById('password1');
const password2Input = document.getElementById('password2');
const step1Btn = document.getElementById('step1Btn');
const step2Btn = document.getElementById('step2Btn');
const backBtn = document.getElementById('backBtn');
const error1 = document.getElementById('error1');
const error2 = document.getElementById('error2');

function showStep(stepNumber) {
    step1Element.classList.remove('active');
    step2Element.classList.remove('active');
    successElement.classList.remove('active');
    
    if (stepNumber === 1) {
        step1Element.classList.add('active');
        stepIndicator1.classList.add('active');
        stepIndicator1.classList.remove('completed');
        stepIndicator2.classList.remove('active');
        password1Input.focus();
    } else if (stepNumber === 2) {
        step2Element.classList.add('active');
        stepIndicator1.classList.add('completed');
        stepIndicator1.classList.remove('active');
        stepIndicator2.classList.add('active');
        password2Input.focus();
    } else if (stepNumber === 3) {
        successElement.classList.add('active');
        stepIndicator1.classList.add('completed');
        stepIndicator2.classList.add('completed');
    }
    currentStep = stepNumber;
}

function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.parentElement.classList.add('shake');
    setTimeout(() => { 
        errorElement.parentElement.classList.remove('shake'); 
    }, 300);
    setTimeout(() => { 
        errorElement.style.display = 'none'; 
    }, 3000);
}

// ===========================
// SIMPLE AUTHENTICATION LOGIC
// ===========================

function verifyStep1() {
    const password = password1Input.value.trim();
    
    console.log('🔍 Step 1 Check:');
    console.log('Entered:', password);
    console.log('Expected:', PASSWORDS.primary);
    console.log('Match:', password === PASSWORDS.primary);
    
    if (!password) {
        showError(error1, '⚠️ Please enter the primary password');
        return;
    }
    
    if (password === PASSWORDS.primary) {
        console.log('✅ Step 1 PASSED');
        showStep(2);
        password1Input.value = '';
    } else {
        console.log('❌ Step 1 FAILED');
        showError(error1, '❌ Incorrect primary password');
        password1Input.value = '';
        password1Input.focus();
    }
}

function verifyStep2() {
    const password = password2Input.value.trim();
    
    console.log('🔍 Step 2 Check:');
    console.log('Entered:', password);
    console.log('Expected:', PASSWORDS.secondary);
    console.log('Match:', password === PASSWORDS.secondary);
    
    if (!password) {
        showError(error2, '⚠️ Please enter the secondary password');
        return;
    }
    
    if (password === PASSWORDS.secondary) {
        console.log('✅ Step 2 PASSED - Creating session...');
        createSession();
        showStep(3);
        setTimeout(() => { 
            window.location.href = './only-boss-dashboard.html'; 
        }, 1500);
    } else {
        console.log('❌ Step 2 FAILED');
        showError(error2, '❌ Incorrect secondary password');
        password2Input.value = '';
        password2Input.focus();
    }
}

function goBackToStep1() { 
    password2Input.value = ''; 
    showStep(1); 
}

// ===========================
// EVENT LISTENERS
// ===========================

step1Btn.addEventListener('click', verifyStep1);
step2Btn.addEventListener('click', verifyStep2);
backBtn.addEventListener('click', goBackToStep1);

password1Input.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') { 
        e.preventDefault(); 
        verifyStep1(); 
    }
});

password2Input.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') { 
        e.preventDefault(); 
        verifyStep2(); 
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

if (isAuthenticated()) {
    console.log('🔓 Active session found - Redirecting to dashboard...');
    window.location.href = './only-boss-dashboard.html';
} else {
    console.log('🔒 Only Boss Portal Loaded');
    console.log('📋 Primary Password:', PASSWORDS.primary);
    console.log('📋 Secondary Password:', PASSWORDS.secondary);
    password1Input.focus();
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

console.log('%c👑 Only Boss Security System', 'color: #ffd700; font-size: 18px; font-weight: bold;');
console.log('%c✅ Simple Direct Authentication Active', 'color: #00ff00; font-size: 14px;');
console.log('%c⚠️ Passwords visible in console for debugging', 'color: #ff9900;');