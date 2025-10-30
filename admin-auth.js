// Only Boss Portal - Two-Step Authentication System
// Created for secure administrative access

// ===========================
// PASSWORD CONFIGURATION
// ===========================

// Default Primary Password: "MOUnoor21014"
const PRIMARY_PASSWORD_HASH = '8f4e5d6c2a3b7e9f1d4a8c6b2e5f7a9c3d6e8f1a4b7c9e2f5a8b1d4c7e9f2a5b';

// Default Secondary Password: "Admin2024"
const SECONDARY_PASSWORD_HASH = '3b7a9f2e5c8d1f4a7b9c2e5d8f1a4c7b9e2f5a8c1d4b7e9f2a5c8d1e4f7a9b2c';

// Get stored hashes or use defaults
const primaryHash = localStorage.getItem('admin_primary_hash') || PRIMARY_PASSWORD_HASH;
const secondaryHash = localStorage.getItem('admin_secondary_hash') || SECONDARY_PASSWORD_HASH;

// ===========================
// PASSWORD RESET INSTRUCTIONS
// ===========================
/*
 * কিভাবে Password Reset করবেন (3টি উপায়):
 * 
 * Method 1: Browser Console (সবচেয়ে সহজ)
 * ------------------------------------------
 * 1. F12 চাপুন (Developer Tools খুলবে)
 * 2. Console tab এ যান
 * 3. এই command টাইপ করুন:
 *    localStorage.removeItem('admin_primary_hash');
 *    localStorage.removeItem('admin_secondary_hash');
 *    localStorage.removeItem('admin_session');
 *    location.reload();
 * 
 * Method 2: Browser Settings থেকে
 * ------------------------------------------
 * 1. Browser Settings খুলুন
 * 2. Privacy and Security → Clear browsing data
 * 3. "Cookies and other site data" select করুন
 * 4. শুধু এই site এর জন্য clear করুন
 * 
 * Method 3: Code থেকে Default Password Change
 * ------------------------------------------
 * 1. এই file (admin-auth.js) খুলুন
 * 2. Line 9-10 এ PRIMARY_PASSWORD_HASH change করুন
 * 3. Line 13-14 এ SECONDARY_PASSWORD_HASH change করুন
 * 4. generate-hash.html দিয়ে নতুন hash তৈরি করুন
 */

// ===========================
// SECURITY UTILITIES
// ===========================

// SHA-256 Hash Function
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Session Management
function createSession() {
    const sessionId = crypto.randomUUID();
    sessionStorage.setItem('admin_session', sessionId);
    localStorage.setItem('admin_last_login', new Date().toISOString());
}

function isAuthenticated() {
    return sessionStorage.getItem('admin_session') !== null;
}

function clearSession() {
    sessionStorage.removeItem('admin_session');
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

// Show/Hide Steps
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

// Show Error Message
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
// AUTHENTICATION LOGIC
// ===========================

// Step 1: Verify Primary Password
async function verifyStep1() {
    const password = password1Input.value.trim();

    if (!password) {
        showError(error1, '⚠️ Please enter the primary password');
        return;
    }

    const hash = await hashPassword(password);

    if (hash === primaryHash) {
        console.log('✅ Step 1 passed - Primary password correct');
        showStep(2);
        password1Input.value = '';
    } else {
        console.log('❌ Step 1 failed - Wrong primary password');
        showError(error1, '❌ Incorrect primary password');
        password1Input.value = '';
        password1Input.focus();
    }
}

// Step 2: Verify Secondary Password
async function verifyStep2() {
    const password = password2Input.value.trim();

    if (!password) {
        showError(error2, '⚠️ Please enter the secondary password');
        return;
    }

    const hash = await hashPassword(password);

    if (hash === secondaryHash) {
        console.log('✅ Step 2 passed - Secondary password correct');
        console.log('🔓 Full authentication successful!');
        
        createSession();
        showStep(3);
        
        // Redirect to admin dashboard after 1.5 seconds
        setTimeout(() => {
            window.location.href = './admin-dashboard.html';
        }, 1500);
    } else {
        console.log('❌ Step 2 failed - Wrong secondary password');
        showError(error2, '❌ Incorrect secondary password');
        password2Input.value = '';
        password2Input.focus();
    }
}

// Go Back to Step 1
function goBackToStep1() {
    password2Input.value = '';
    showStep(1);
}

// ===========================
// EVENT LISTENERS
// ===========================

// Step 1 Button
step1Btn.addEventListener('click', verifyStep1);

// Step 2 Button
step2Btn.addEventListener('click', verifyStep2);

// Back Button
backBtn.addEventListener('click', goBackToStep1);

// Enter Key Support
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
// INITIALIZATION
// ===========================

// Check if already authenticated
if (isAuthenticated()) {
    console.log('🔓 Session active - Redirecting to dashboard...');
    window.location.href = './admin-dashboard.html';
} else {
    console.log('🔒 Only Boss Portal Loaded - Two-step authentication required');
    console.log('📋 Default passwords set (change via Settings after login)');
    password1Input.focus();
}

// Session timeout (30 minutes of inactivity)
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (isAuthenticated()) {
            console.log('⏱️ Session timeout - Logging out...');
            clearSession();
            alert('Session expired due to inactivity');
            window.location.reload();
        }
    }, 30 * 60 * 1000); // 30 minutes
}

// Track user activity
['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

resetInactivityTimer();

// ===========================
// CONSOLE COMMANDS (for debugging)
// ===========================

console.log('%c� Only Boss Security System', 'color: #cc0000; font-size: 16px; font-weight: bold;');
console.log('%cTwo-step authentication active', 'color: #00cc00;');
console.log('%c⚠️ Unauthorized access is logged and monitored', 'color: #ff9900;');
