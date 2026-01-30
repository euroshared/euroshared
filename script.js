import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

// Configuration Supabase
const supabase = createClient("https://jexaklhwoiaufzshzlcg.supabase.co", "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz");

// Éléments du DOM
const getEl = (id) => document.getElementById(id);
const elements = {
    regCont: getEl('register-container'),
    logCont: getEl('login-container'),
    twCont: getEl('timewall-container'),
    confStep: getEl('confirmation-step'),
    forgotCont: getEl('forgot-password-container'),
    newPwdCont: getEl('new-password-container'),
    iframe: getEl('timewall-iframe'),
    statusText: getEl('status-text'),
    userEmail: getEl('user-email-display'),
    dbStatus: getEl('db-status')
};

let authenticatedUserId = null;

// Gestion de l'affichage
function showView(view) {
    const views = [elements.regCont, elements.logCont, elements.twCont, elements.confStep, elements.forgotCont, elements.newPwdCont];
    views.forEach(v => { if(v) v.style.display = 'none'; });

    if(view === 'reg' && elements.regCont) elements.regCont.style.display = 'block';
    if(view === 'log' && elements.logCont) elements.logCont.style.display = 'block';
    if(view === 'tw' && elements.twCont) elements.twCont.style.display = 'flex';
    if(view === 'conf' && elements.confStep) elements.confStep.style.display = 'block';
    if(view === 'forgot' && elements.forgotCont) elements.forgotCont.style.display = 'block';
}

// Mise à jour du statut visuel
function updateStatus(isOnline) {
    if (elements.dbStatus) {
        isOnline ? elements.dbStatus.classList.add('status-online') : elements.dbStatus.classList.remove('status-online');
    }
    if (elements.statusText) {
        elements.statusText.innerText = isOnline ? "EuroShared Connecté" : "En attente de connexion";
    }
}

// Initialisation de l'application
async function initApp() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        authenticatedUserId = session.user.id;
        if(elements.userEmail) elements.userEmail.innerText = session.user.email;
        showView('conf');
        updateStatus(true);
    } else {
        showView('reg');
        updateStatus(false);
    }
}

// Inscription
if (getEl('register-form')) {
    getEl('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = getEl('name').value;
        const { error } = await supabase.auth.signUp({
            email: getEl('email').value,
            password: getEl('password').value,
            options: {
                emailRedirectTo: "https://euroshared.github.io/euroshared/",
                data: { full_name: fullName }
            }
        });
        if (error) alert("Erreur : " + error.message);
        else alert("Vérifiez vos emails !");
    });
}

// Connexion
if (getEl('login-form')) {
    getEl('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({
            email: getEl('email-login').value,
            password: getEl('password-login').value
        });
        if (error) alert(error.message);
        else window.location.reload();
    });
}

// Mot de passe oublié
if (getEl('send-recovery-btn')) {
    getEl('send-recovery-btn').onclick = async () => {
        const email = getEl('email-recovery-confirm').value;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.href
        });
        if (error) alert(error.message);
        else alert("Lien envoyé !");
    };
}

// Gestionnaire d'Offerwalls (Correction des URLs)
document.querySelectorAll('.wall-btn').forEach(btn => {
    btn.onclick = () => {
        if (!authenticatedUserId) {
            alert("Veuillez vous connecter.");
            return;
        }
        let rawUrl = btn.getAttribute('data-url');
        // On nettoie les backticks ou guillemets en trop si présents dans le HTML
        let cleanUrl = rawUrl.replace(/[`"']/g, ""); 
        // On remplace le placeholder par l'ID réel
        let finalUrl = cleanUrl.replace("${authenticatedUserId}", authenticatedUserId);
        
        if(elements.iframe) {
            elements.iframe.src = finalUrl;
            showView('tw');
        }
    };
});

// Navigation
const actions = {
    'to-login': () => showView('log'),
    'to-register': () => showView('reg'),
    'forgot-password': () => showView('forgot'),
    'back-to-login': () => showView('log'),
    'back-to-dash': () => showView('conf'),
    'cancel-auth': async () => { await supabase.auth.signOut(); location.reload(); },
    'logout-button': async () => { await supabase.auth.signOut(); location.reload(); }
};

Object.entries(actions).forEach(([id, func]) => {
    const el = getEl(id);
    if(el) el.onclick = (e) => { e.preventDefault(); func(); };
});

// Toggle Password
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const target = getEl(this.getAttribute('data-target'));
        if(target) {
            target.type = target.type === 'password' ? 'text' : 'password';
            this.textContent = target.type === 'password' ? '👁️' : '🙈';
        }
    };
});

// Diagnostic Supabase
async function checkSupabaseLink() {
    const dot = getEl('checker-dot');
    const label = getEl('checker-label');
    try {
        await supabase.auth.getSession();
        if(dot) dot.style.backgroundColor = "green";
        if(label) label.innerText = "Supabase Connecté";
    } catch (e) {
        if(dot) dot.style.backgroundColor = "red";
        if(label) label.innerText = "Erreur de liaison";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    checkSupabaseLink();
});

