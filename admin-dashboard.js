// Only Boss Dashboard - Management & Security
// Two-step authentication protected

// ===========================
// SECURITY CHECK
// ===========================

function isAuthenticated() {
    return sessionStorage.getItem('admin_session') !== null;
}

// Redirect if not authenticated
if (!isAuthenticated()) {
    console.log('❌ Unauthorized access - Redirecting to login...');
    window.location.href = './admin-portal.html';
}

// ===========================
// PASSWORD HASHING
// ===========================

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// ===========================
// SESSION MANAGEMENT
// ===========================

const logoutBtn = document.getElementById('logoutBtn');
const lastLoginElement = document.getElementById('lastLogin');
const lastPwdChangeElement = document.getElementById('lastPwdChange');

// Display last login time
const lastLogin = localStorage.getItem('admin_last_login');
if (lastLogin) {
    const loginDate = new Date(lastLogin);
    lastLoginElement.textContent = loginDate.toLocaleString();
}

// Display last password change
const lastPwdChange = localStorage.getItem('admin_last_pwd_change');
if (lastPwdChange) {
    const changeDate = new Date(lastPwdChange);
    lastPwdChangeElement.textContent = changeDate.toLocaleDateString();
}

// Logout function
logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 Logging out...');
        sessionStorage.removeItem('admin_session');
        window.location.href = './admin-portal.html';
    }
});

// ===========================
// SECURITY SETTINGS MODAL
// ===========================

const securityCard = document.getElementById('securityCard');
const securityModal = document.getElementById('securityModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');

const currentPrimaryInput = document.getElementById('currentPrimary');
const newPrimaryInput = document.getElementById('newPrimary');
const confirmPrimaryInput = document.getElementById('confirmPrimary');

const currentSecondaryInput = document.getElementById('currentSecondary');
const newSecondaryInput = document.getElementById('newSecondary');
const confirmSecondaryInput = document.getElementById('confirmSecondary');

const savePrimaryBtn = document.getElementById('savePrimaryBtn');
const saveSecondaryBtn = document.getElementById('saveSecondaryBtn');

const successMsg = document.getElementById('successMsg');
const errorMsg = document.getElementById('errorMsg');

// Open modal
securityCard.addEventListener('click', () => {
    securityModal.classList.add('active');
});

// Close modal
closeModal.addEventListener('click', () => {
    securityModal.classList.remove('active');
    clearPasswordInputs();
});

cancelBtn.addEventListener('click', () => {
    securityModal.classList.remove('active');
    clearPasswordInputs();
});

// Clear all password inputs
function clearPasswordInputs() {
    currentPrimaryInput.value = '';
    newPrimaryInput.value = '';
    confirmPrimaryInput.value = '';
    currentSecondaryInput.value = '';
    newSecondaryInput.value = '';
    confirmSecondaryInput.value = '';
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';
}

// Show success message
function showSuccess(message) {
    successMsg.textContent = '✅ ' + message;
    successMsg.style.display = 'block';
    errorMsg.style.display = 'none';
    
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 5000);
}

// Show error message
function showError(message) {
    errorMsg.textContent = '❌ ' + message;
    errorMsg.style.display = 'block';
    successMsg.style.display = 'none';
    
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 5000);
}

// ===========================
// CHANGE PRIMARY PASSWORD
// ===========================

savePrimaryBtn.addEventListener('click', async () => {
    const current = currentPrimaryInput.value.trim();
    const newPass = newPrimaryInput.value.trim();
    const confirm = confirmPrimaryInput.value.trim();

    // Validation
    if (!current || !newPass || !confirm) {
        showError('All primary password fields are required');
        return;
    }

    if (newPass.length < 6) {
        showError('New primary password must be at least 6 characters');
        return;
    }

    if (newPass !== confirm) {
        showError('New primary passwords do not match');
        return;
    }

    // Verify current password
    const currentHash = await hashPassword(current);
    const storedHash = localStorage.getItem('admin_primary_hash') || 
                       '8f4e5d6c2a3b7e9f1d4a8c6b2e5f7a9c3d6e8f1a4b7c9e2f5a8b1d4c7e9f2a5b';

    if (currentHash !== storedHash) {
        showError('Current primary password is incorrect');
        currentPrimaryInput.value = '';
        currentPrimaryInput.focus();
        return;
    }

    // Save new password
    const newHash = await hashPassword(newPass);
    localStorage.setItem('admin_primary_hash', newHash);
    localStorage.setItem('admin_last_pwd_change', new Date().toISOString());

    console.log('✅ Primary password updated successfully');
    showSuccess('Primary password changed successfully!');
    
    // Clear inputs
    currentPrimaryInput.value = '';
    newPrimaryInput.value = '';
    confirmPrimaryInput.value = '';

    // Update last change date
    lastPwdChangeElement.textContent = new Date().toLocaleDateString();
});

// ===========================
// CHANGE SECONDARY PASSWORD
// ===========================

saveSecondaryBtn.addEventListener('click', async () => {
    const current = currentSecondaryInput.value.trim();
    const newPass = newSecondaryInput.value.trim();
    const confirm = confirmSecondaryInput.value.trim();

    // Validation
    if (!current || !newPass || !confirm) {
        showError('All secondary password fields are required');
        return;
    }

    if (newPass.length < 6) {
        showError('New secondary password must be at least 6 characters');
        return;
    }

    if (newPass !== confirm) {
        showError('New secondary passwords do not match');
        return;
    }

    // Verify current password
    const currentHash = await hashPassword(current);
    const storedHash = localStorage.getItem('admin_secondary_hash') || 
                       '3b7a9f2e5c8d1f4a7b9c2e5d8f1a4c7b9e2f5a8c1d4b7e9f2a5c8d1e4f7a9b2c';

    if (currentHash !== storedHash) {
        showError('Current secondary password is incorrect');
        currentSecondaryInput.value = '';
        currentSecondaryInput.focus();
        return;
    }

    // Save new password
    const newHash = await hashPassword(newPass);
    localStorage.setItem('admin_secondary_hash', newHash);
    localStorage.setItem('admin_last_pwd_change', new Date().toISOString());

    console.log('✅ Secondary password updated successfully');
    showSuccess('Secondary password changed successfully!');
    
    // Clear inputs
    currentSecondaryInput.value = '';
    newSecondaryInput.value = '';
    confirmSecondaryInput.value = '';

    // Update last change date
    lastPwdChangeElement.textContent = new Date().toLocaleDateString();
});

// ===========================
// INACTIVITY TIMEOUT
// ===========================

let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        console.log('⏱️ Session timeout due to inactivity');
        alert('Session expired due to inactivity. Please login again.');
        sessionStorage.removeItem('admin_session');
        window.location.href = './admin-portal.html';
    }, 30 * 60 * 1000); // 30 minutes
}

// Track user activity
['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

resetInactivityTimer();

// ===========================
// INITIALIZATION
// ===========================

console.log('👑 Only Boss Dashboard loaded');
console.log('✅ Session authenticated');
console.log('⏱️ Auto-logout in 30 minutes of inactivity');
