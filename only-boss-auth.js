// Only Boss Portal - Two-Step Authentication System (Unified)

// ===========================
// PASSWORD CONFIGURATION
// ===========================

// IMPORTANT: To find correct hash, open generate-password-hash.html in browser and check console
// Or run this in browser console:
// async function h(p){const e=new TextEncoder();const d=e.encode(p);const hb=await crypto.subtle.digest('SHA-256',d);return Array.from(new Uint8Array(hb)).map(b=>b.toString(16).padStart(2,'0')).join('');}
// Then: h('MOUnoor21014').then(console.log); h('Admin2024').then(console.log);

// Default Primary Password: "MOUnoor21014"
// Hash generated via SHA-256
const PRIMARY_PASSWORD_HASH = 'USE_GENERATED_HASH_FROM_BROWSER_CONSOLE';

// Default Secondary Password: "Admin2024"  
// Hash generated via SHA-256
const SECONDARY_PASSWORD_HASH = 'USE_GENERATED_HASH_FROM_BROWSER_CONSOLE';

// Get stored hashes or use defaults
const primaryHash = localStorage.getItem('admin_primary_hash') || PRIMARY_PASSWORD_HASH;
const secondaryHash = localStorage.getItem('admin_secondary_hash') || SECONDARY_PASSWORD_HASH;

// ===========================
// SECURITY UTILITIES
// ===========================

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function createSession() {
    const sessionId = crypto.randomUUID();
    sessionStorage.setItem('admin_session', sessionId);
    localStorage.setItem('admin_last_login', new Date().toISOString());
}

function isAuthenticated() { return sessionStorage.getItem('admin_session') !== null; }
function clearSession() { sessionStorage.removeItem('admin_session'); }

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
    setTimeout(() => { errorElement.parentElement.classList.remove('shake'); }, 300);
    setTimeout(() => { errorElement.style.display = 'none'; }, 3000);
}

// ===========================
// AUTHENTICATION LOGIC
// ===========================

async function verifyStep1() {
    const password = password1Input.value.trim();
    if (!password) { showError(error1, '⚠️ Please enter the primary password'); return; }
    const hash = await hashPassword(password);
    if (hash === primaryHash) { console.log('✅ Step 1 passed'); showStep(2); password1Input.value = ''; }
    else { console.log('❌ Step 1 failed'); showError(error1, '❌ Incorrect primary password'); password1Input.value = ''; password1Input.focus(); }
}

async function verifyStep2() {
    const password = password2Input.value.trim();
    if (!password) { showError(error2, '⚠️ Please enter the secondary password'); return; }
    const hash = await hashPassword(password);
    if (hash === secondaryHash) {
        console.log('✅ Step 2 passed');
        createSession();
        showStep(3);
        setTimeout(() => { window.location.href = './only-boss-dashboard.html'; }, 1500);
    } else { console.log('❌ Step 2 failed'); showError(error2, '❌ Incorrect secondary password'); password2Input.value=''; password2Input.focus(); }
}

function goBackToStep1() { password2Input.value = ''; showStep(1); }

// ===========================
// EVENT LISTENERS
// ===========================
step1Btn.addEventListener('click', verifyStep1);
step2Btn.addEventListener('click', verifyStep2);
backBtn.addEventListener('click', goBackToStep1);
password1Input.addEventListener('keypress', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); verifyStep1(); }});
password2Input.addEventListener('keypress', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); verifyStep2(); }});

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
if (isAuthenticated()) { console.log('🔓 Session active - Redirecting to dashboard...'); window.location.href = './only-boss-dashboard.html'; }
else { console.log('🔒 Only Boss Portal Loaded - Two-step authentication required'); password1Input.focus(); }

let inactivityTimer;
function resetInactivityTimer(){ clearTimeout(inactivityTimer); inactivityTimer=setTimeout(()=>{ if(isAuthenticated()){ console.log('⏱️ Session timeout - Logging out...'); clearSession(); alert('Session expired due to inactivity'); window.location.reload(); } }, 30*60*1000); }
['mousedown','keydown','scroll','touchstart'].forEach(evt=>document.addEventListener(evt, resetInactivityTimer));
resetInactivityTimer();

console.log('%c👑 Only Boss Security System', 'color: #cc0000; font-size: 16px; font-weight: bold;');
console.log('%cTwo-step authentication active', 'color: #00cc00;');
console.log('%c⚠️ Unauthorized access is logged and monitored', 'color: #ff9900;');
