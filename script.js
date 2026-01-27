import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz"; 
const supabase = createClient(supabaseUrl, supabaseKey);

const elements = {
    dbStatus: document.getElementById('db-status'),
    statusText: document.getElementById('status-text'),
    statusDot: document.getElementById('status-dot'),
    regCont: document.getElementById('register-container'),
    logCont: document.getElementById('login-container'),
    twCont: document.getElementById('timewall-container'),
    iframe: document.getElementById('timewall-iframe'),
    regForm: document.getElementById('register-form'),
    logForm: document.getElementById('login-form'),
    logoutBtn: document.getElementById('logout-button'),
    confStep: document.getElementById('confirmation-step'),
    confBtn: document.getElementById('confirm-access-btn'),
    userEmailDisplay: document.getElementById('user-email-display'),
    cancelAuth: document.getElementById('cancel-auth'),
    forgotBtn: document.getElementById('forgot-password'),
    forgotCont: document.getElementById('forgot-password-container'),
    recoveryInput: document.getElementById('email-recovery-confirm'),
    sendRecoveryBtn: document.getElementById('send-recovery-btn'),
    backToLogin: document.getElementById('back-to-login'),
    newPassCont: document.getElementById('new-password-container'),
    newPassInput: document.getElementById('new-password-input'),
    savePassBtn: document.getElementById('save-new-password-btn'),
    loader: document.getElementById('timewall-loader')
};

let authenticatedUserId = null;

// --- GESTION DES VUES ---
function showView(view) {
    const all = [elements.regCont, elements.logCont, elements.twCont, elements.confStep, elements.forgotCont, elements.newPassCont];
    all.forEach(el => { if(el) el.style.display = 'none'; });
    if (view === 'reg') elements.regCont.style.display = 'block';
    if (view === 'log') elements.logCont.style.display = 'block';
    if (view === 'tw') elements.twCont.style.display = 'flex';
    if (view === 'conf') elements.confStep.style.display = 'block';
    if (view === 'forgot') elements.forgotCont.style.display = 'block';
    if (view === 'newpass') elements.newPassCont.style.display = 'block';
}

// --- NAVIGATION ---
document.getElementById('to-login').onclick = (e) => { e.preventDefault(); showView('log'); };
document.getElementById('to-register').onclick = (e) => { e.preventDefault(); showView('reg'); };
elements.backToLogin.onclick = (e) => { e.preventDefault(); showView('log'); };
elements.forgotBtn.onclick = (e) => { e.preventDefault(); showView('forgot'); };

// --- OEIL PASSWORD ---
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const input = document.getElementById(this.getAttribute('data-target'));
        input.type = input.type === "password" ? "text" : "password";
        this.innerText = input.type === "password" ? "👁️" : "🙈";
    };
});

// --- TIMEWALL LOGIC ---
function loadTimeWall(userId) {
    const offerWallId = "9c481747da9d5015";
    const wallUrl = `https://timewall.io{offerWallId}&uid=${userId}&tab=tasks`;
    
    elements.twCont.classList.remove('iframe-loaded');
    elements.iframe.src = wallUrl;
    showView('tw');

    elements.iframe.onload = () => {
        elements.twCont.classList.add('iframe-loaded');
    };
}

// --- AUTH SUPABASE ---
elements.regForm.onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        options: { data: { full_name: document.getElementById('name').value } }
    });
    if (error) alert(error.message);
    else { alert("Vérifiez vos emails pour valider l'inscription."); showView('log'); }
};

elements.logForm.onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('email-login').value,
        password: document.getElementById('password-login').value
    });
    if (error) alert(error.message);
    else if (data.user) {
        authenticatedUserId = data.user.id;
        elements.userEmailDisplay.innerText = data.user.email;
        showView('conf');
    }
};

// --- INITIALISATION ---
async function initApp() {
    // Statut de connexion simplifié pour éviter les erreurs RLS
    const { data: { session } } = await supabase.auth.getSession();
    
    elements.dbStatus.classList.add('status-online');
    elements.statusText.innerText = "EuroShared 2026 Connecté";

    if (session) {
        authenticatedUserId = session.user.id;
        elements.userEmailDisplay.innerText = session.user.email;
        showView('conf');
    } else {
        showView('reg');
    }
}

// --- BOUTONS ACTIONS ---
elements.confBtn.onclick = () => { if(authenticatedUserId) loadTimeWall(authenticatedUserId); };

const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};
elements.logoutBtn.onclick = logout;
elements.cancelAuth.onclick = logout;

document.addEventListener('DOMContentLoaded', initApp);
