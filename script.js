import { createClient } from 'https://cdn.jsdelivr.net';

// CONFIGURATION SUPABASE (VÉRIFIÉE)
const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz"; 
const supabase = createClient(supabaseUrl, supabaseKey);

const elements = {
    regCont: document.getElementById('register-container'),
    logCont: document.getElementById('login-container'),
    confStep: document.getElementById('confirmation-step'),
    userEmailDisplay: document.getElementById('user-email-display'),
    statusText: document.getElementById('status-text'),
    statusDot: document.getElementById('status-dot'),
    confirmBtn: document.getElementById('confirm-access-btn')
};

let authenticatedUserId = null;

function showView(view) {
    const containers = [elements.regCont, elements.logCont, elements.confStep];
    containers.forEach(c => { if(c) c.style.display = 'none'; });
    if (view === 'reg') elements.regCont.style.display = 'block';
    if (view === 'log') elements.logCont.style.display = 'block';
    if (view === 'conf') elements.confStep.style.display = 'block';
}

// --- INITIALISATION BASE DE DONNÉES ---
async function initApp() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session) {
        authenticatedUserId = session.user.id;
        elements.userEmailDisplay.innerText = session.user.email;
        showView('conf');
        if(elements.statusDot) elements.statusDot.style.background = "#3ecf8e";
        if(elements.statusText) elements.statusText.innerText = "EuroShared Connecté";
    } else {
        showView('reg');
    }
}

// --- RECTIFICATION DES 4 LIENS (SYNTAXE CORRIGÉE) ---

// 1. TimeWall
if (elements.confirmBtn) {
    elements.confirmBtn.onclick = () => {
        const url = `https://timewall.io{authenticatedUserId}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };
}

// 2. Lootably
const lootBtn = document.getElementById('btn-lootably');
if (lootBtn) {
    lootBtn.onclick = () => {
        const url = `https://wall.lootably.com{authenticatedUserId}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };
}

// 3. CPALead
const cpaBtn = document.getElementById('btn-cpalead');
if (cpaBtn) {
    cpaBtn.onclick = () => {
        const url = `https://www.cpalead.com{authenticatedUserId}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };
}

// 4. Monlix
const monlixBtn = document.getElementById('btn-monlix');
if (monlixBtn) {
    monlixBtn.onclick = () => {
        const url = `https://ads.monlix.com{authenticatedUserId}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };
}

// --- CONNEXION (D'ORIGINE) ---
document.getElementById('login-form').onsubmit = async (e) => {
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

const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};
document.getElementById('cancel-auth').onclick = logout;

// Oeil mot de passe
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const input = document.getElementById(this.getAttribute('data-target'));
        input.type = input.type === "password" ? "text" : "password";
        this.innerText = input.type === "password" ? "👁️" : "🙈";
    };
});

document.addEventListener('DOMContentLoaded', initApp);
