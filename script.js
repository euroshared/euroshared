import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

// Configuration Supabase (Identifiants d'origine conservés)
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
    statusDot: document.getElementById('status-dot'),
    confirmBtn: document.getElementById('confirm-access-btn')
};

let authenticatedUserId = null;

// --- GESTION DES VUES ---
function showView(view) {
    const containers = [
        elements.regCont, elements.logCont, elements.twCont, 
        elements.confStep, elements.forgotCont, elements.newPassCont
    ];
    containers.forEach(c => { if(c) c.style.display = 'none'; });

    if (view === 'reg') elements.regCont.style.display = 'block';
    if (view === 'log') elements.logCont.style.display = 'block';
    if (view === 'tw') elements.twCont.style.display = 'flex';
    if (view === 'conf') elements.confStep.style.display = 'block';
    if (view === 'forgot') elements.forgotCont.style.display = 'block';
    if (view === 'newpass') elements.newPassCont.style.display = 'block';
}

// --- INITIALISATION & CONNEXION À LA BASE ---
async function initApp() {
    // Vérifier si une session existe déjà
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
        console.error("Erreur de base de données:", sessionError.message);
        elements.statusText.innerText = "Erreur de connexion";
        return;
    }

    if (session) {
        authenticatedUserId = session.user.id;
        elements.userEmailDisplay.innerText = session.user.email;
        showView('conf');
        updateStatus(true);
    } else {
        showView('reg');
        updateStatus(false);
    }
}

function updateStatus(online) {
    if (online) {
        elements.statusDot.parentElement.classList.add('status-online');
        elements.statusText.innerText = "EuroShared Connecté";
    } else {
        elements.statusDot.parentElement.classList.remove('status-online');
        elements.statusText.innerText = "En attente de connexion";
    }
}

// --- INSCRIPTION ---
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
    });

    if (error) alert("Erreur d'inscription: " + error.message);
    else alert("✅ Inscription réussie ! Vérifiez votre email pour confirmer.");
};

// --- CONNEXION ---
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) alert("Erreur: " + error.message);
    else if (data.user) {
        authenticatedUserId = data.user.id;
        elements.userEmailDisplay.innerText = data.user.email;
        showView('conf');
        updateStatus(true);
    }
};

// --- MOT DE PASSE OUBLIÉ ---
document.getElementById('send-recovery-btn').onclick = async () => {
    const email = document.getElementById('email-recovery-confirm').value;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
    });
    if (error) alert(error.message);
    else alert("✅ Email de récupération envoyé !");
};

// --- DÉCLENCHEMENT TIMEWALL ---
if (elements.confirmBtn) {
    elements.confirmBtn.onclick = () => {
        if (!authenticatedUserId) {
            alert("Veuillez vous reconnecter.");
            return;
        }

        const widgetId = "9c481747da9d5015";
        const wallUrl = `https://timewall.io{widgetId}&userId=${authenticatedUserId}`;
        
        showView('tw');
        elements.twCont.classList.remove('iframe-loaded');
        elements.iframe.src = wallUrl;
        
        elements.iframe.onload = () => {
            elements.twCont.classList.add('iframe-loaded');
        };
    };
}

// --- NAVIGATION & DÉCONNEXION ---
document.getElementById('to-login').onclick = (e) => { e.preventDefault(); showView('log'); };
document.getElementById('to-register').onclick = (e) => { e.preventDefault(); showView('reg'); };
document.getElementById('forgot-password').onclick = (e) => { e.preventDefault(); showView('forgot'); };
document.getElementById('back-to-login').onclick = (e) => { e.preventDefault(); showView('log'); };

const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};
document.getElementById('logout-button').onclick = logout;
document.getElementById('cancel-auth').onclick = logout;

// Gestion de l'œil mot de passe
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const input = document.getElementById(this.getAttribute('data-target'));
        input.type = input.type === "password" ? "text" : "password";
        this.innerText = input.type === "password" ? "👁️" : "🙈";
    };
});

document.addEventListener('DOMContentLoaded', initApp);
