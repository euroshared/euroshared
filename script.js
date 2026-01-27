import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { createClient } from 'https://esm.sh';

const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz"; 
const supabase = createClient(supabaseUrl, supabaseKey);

const elements = {
    regCont: document.getElementById('register-container'),
    logCont: document.getElementById('login-container'),
    twCont: document.getElementById('timewall-container'),
    confStep: document.getElementById('confirmation-step'),
    forgotCont: document.getElementById('forgot-password-container'),
    newPassCont: document.getElementById('new-password-container'),
    iframe: document.getElementById('timewall-iframe'),
    userEmailDisplay: document.getElementById('user-email-display'),
    statusText: document.getElementById('status-text'),
    statusDot: document.getElementById('status-dot')
};

let authenticatedUserId = null;

// --- GESTION DES VUES ---
function showView(view) {
    const containers = [elements.regCont, elements.logCont, elements.twCont, elements.confStep, elements.forgotCont, elements.newPassCont];
    containers.forEach(c => { if(c) c.style.display = 'none'; });

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
document.getElementById('forgot-password').onclick = (e) => { e.preventDefault(); showView('forgot'); };
document.getElementById('back-to-login').onclick = (e) => { e.preventDefault(); showView('log'); };

// --- OEIL PASSWORD ---
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const input = document.getElementById(this.getAttribute('data-target'));
        input.type = input.type === "password" ? "text" : "password";
        this.innerText = input.type === "password" ? "👁️" : "🙈";
    };
});

// --- RECUPERATION MOT DE PASSE ---
document.getElementById('send-recovery-btn').onclick = async () => {
    const email = document.getElementById('email-recovery-confirm').value;
    if (!email) return alert("Veuillez entrer votre email.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
    });
    if (error) alert("Erreur : " + error.message);
    else alert("✅ Lien envoyé ! Vérifiez vos spams.");
};

// --- INSCRIPTION ---
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        options: { data: { full_name: document.getElementById('name').value } }
    });
    if (error) alert(error.message);
    else alert("Inscription réussie ! Vérifiez vos emails.");
};

// --- CONNEXION ---
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

// --- LANCER TIMEWALL ---
document.getElementById('confirm-access-btn').onclick = () => {
    if (!authenticatedUserId) return alert("Session expirée.");
    const widgetId = "9c481747da9d5015";
    const wallUrl = `https://timewall.io{widgetId}&userId=${authenticatedUserId}`;
    
    elements.twCont.classList.remove('iframe-loaded');
    elements.iframe.src = wallUrl;
    showView('tw');
    
    elements.iframe.onload = () => {
        elements.twCont.classList.add('iframe-loaded');
    };
};

// --- INITIALISATION ---
async function initApp() {
    if (window.location.hash.includes("type=recovery")) {
        showView('newpass');
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        authenticatedUserId = session.user.id;
        elements.userEmailDisplay.innerText = session.user.email;
        showView('conf');
    } else {
        showView('reg');
    }
    
    elements.statusDot.parentElement.classList.add('status-online');
    elements.statusText.innerText = "EuroShared 2026 Connecté";
}

// --- LOGOUT ---
const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};
document.getElementById('logout-button').onclick = logout;
document.getElementById('cancel-auth').onclick = logout;

document.addEventListener('DOMContentLoaded', initApp);
