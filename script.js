import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabase = createClient("https://jexaklhwoiaufzshzlcg.supabase.co", "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz");

let authenticatedUserId = null;

const elements = {
    regCont: document.getElementById('register-container'),
    logCont: document.getElementById('login-container'),
    twCont: document.getElementById('timewall-container'),
    confStep: document.getElementById('confirmation-step'),
    forgotCont: document.getElementById('forgot-password-container'),
    newPwdCont: document.getElementById('new-password-container'),
    iframe: document.getElementById('timewall-iframe'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    userEmail: document.getElementById('user-email-display')
};

function showView(view) {
    // 1. On cache tout
    [elements.regCont, elements.logCont, elements.twCont, elements.confStep, elements.forgotCont, elements.newPwdCont].forEach(c => {
        if(c) c.style.display = 'none';
    });
    
    // 2. On affiche la vue demandée
    if(view === 'reg') elements.regCont.style.display = 'block';
    if(view === 'log') elements.logCont.style.display = 'block';
    if(view === 'tw') elements.twCont.style.display = 'flex';
    if(view === 'conf') elements.confStep.style.display = 'block';
    if(view === 'forgot') elements.forgotCont.style.display = 'block';
    
    if(view === 'newpwd') {
        elements.newPwdCont.style.display = 'block';
        // Reset Turnstile pour forcer l'affichage si le bloc était caché
        if (typeof turnstile !== 'undefined') { turnstile.reset(); }
    }
}

function updateStatus(isOnline) {
    if (isOnline) {
        document.getElementById('db-status').classList.add('status-online');
        elements.statusText.innerText = "EuroShared Connecté";
    } else {
        document.getElementById('db-status').classList.remove('status-online');
        elements.statusText.innerText = "En attente de connexion";
    }
}

async function initApp() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        authenticatedUserId = session.user.id;
        elements.userEmail.innerText = session.user.email;
        showView('conf');
        updateStatus(true);
    } else {
        showView('reg');
        updateStatus(false);
    }
}

// Détection du jeton de récupération
if (window.location.hash.includes('type=recovery')) {
    window.addEventListener('load', () => showView('newpwd'));
}

// Inscription
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const siteUrl = "https://euroshared.github.io/euroshared/"; 
    const { error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        options: { emailRedirectTo: siteUrl }
    });
    if (error) alert(error.message); 
    else alert("Vérifiez vos emails !");
};

// Connexion
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('email-login').value,
        password: document.getElementById('password-login').value
    });
    if (error) alert(error.message); else location.reload();
};

// Reset Password (Envoi email)
document.getElementById('send-recovery-btn').onclick = async () => {
    const email = document.getElementById('email-recovery-confirm').value;
    const resetUrl = "https://euroshared.github.io/euroshared/";    
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: resetUrl });
    if (error) alert(error.message); 
    else { alert("Lien envoyé !"); showView('log'); }
};

// Enregistrement Nouveau Mot de Passe
if (document.getElementById('save-new-password-btn')) {
    document.getElementById('save-new-password-btn').onclick = async () => {
        const newPassword = document.getElementById('new-password-input').value;
        
        // Vérification Turnstile
        const turnstileRes = document.querySelector('[name="cf-turnstile-response"]');
        if (turnstileRes && !turnstileRes.value) return alert("Veuillez valider le captcha.");

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) alert(error.message);
        else {
            alert("Mot de passe mis à jour !");
            window.location.hash = "";
            showView('log');
        }
    };
}

// TimeWall
document.getElementById('confirm-access-btn').onclick = () => {
    const wallUrl = `https://timewall.io/users/login?oid=9c481747da9d5015&uid=${authenticatedUserId}&tab=tasks`;
    elements.iframe.src = wallUrl;
    showView('tw');
};

// Toggle Password (👁️)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = document.getElementById(this.getAttribute('data-target'));
            input.type = (input.type === 'password') ? 'text' : 'password';
            this.textContent = (input.type === 'password') ? '👁️' : '🙈';
        });
    });
});

// Navigation
document.getElementById('to-login').onclick = () => showView('log');
document.getElementById('to-register').onclick = () => showView('reg');
document.getElementById('forgot-password').onclick = () => showView('forgot');
document.getElementById('back-to-login').onclick = () => showView('log');
document.getElementById('back-to-dash').onclick = () => showView('conf');
document.getElementById('cancel-auth').onclick = async () => { await supabase.auth.signOut(); location.reload(); };
document.getElementById('logout-button').onclick = async () => { await supabase.auth.signOut(); location.reload(); };

document.addEventListener('DOMContentLoaded', initApp);

// Diagnostic Supabase
async function checkSupabaseLink() {
    const dot = document.getElementById('checker-dot');
    const label = document.getElementById('checker-label');
    try {
        await supabase.auth.getSession();
        dot.classList.add('online');
        label.innerText = "Supabase Connecté";
    } catch (e) {
        dot.classList.add('offline');
        label.innerText = "Supabase Déconnecté";
    }
}
checkSupabaseLink();
