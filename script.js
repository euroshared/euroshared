import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz"; 
const supabase = createClient(supabaseUrl, supabaseKey);

const elements = {
    dbStatus: document.getElementById('db-status'),
    statusText: document.getElementById('status-text'),
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
    // Nouveaux éléments pour la réinitialisation réelle
    newPassCont: document.getElementById('new-password-container'),
    newPassInput: document.getElementById('new-password-input'),
    savePassBtn: document.getElementById('save-new-password-btn')
};

let authenticatedUserId = null;

function showView(view) {
    const allConts = [
        elements.regCont, elements.logCont, elements.twCont, 
        elements.confStep, elements.forgotCont, elements.newPassCont
    ];
    allConts.forEach(el => { if(el) el.style.display = 'none'; });

    if (view === 'reg') elements.regCont.style.display = 'block';
    if (view === 'log') elements.logCont.style.display = 'block';
    if (view === 'tw') elements.twCont.style.display = 'block';
    if (view === 'conf') elements.confStep.style.display = 'block';
    if (view === 'forgot') elements.forgotCont.style.display = 'block';
    if (view === 'newpass') elements.newPassCont.style.display = 'block';
}

// --- NAVIGATION ---
document.getElementById('to-login').onclick = (e) => { e.preventDefault(); showView('log'); };
document.getElementById('to-register').onclick = (e) => { e.preventDefault(); showView('reg'); };
if (elements.backToLogin) elements.backToLogin.onclick = (e) => { e.preventDefault(); showView('log'); };
if (elements.forgotBtn) elements.forgotBtn.onclick = (e) => { e.preventDefault(); showView('forgot'); };

// --- GESTION DE L'OEIL ---
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const input = document.getElementById(this.getAttribute('data-target'));
        input.type = input.type === "password" ? "text" : "password";
        this.innerText = input.type === "password" ? "👁️" : "🙈";
    };
});

// --- RÉCUPÉRATION (ENVOI EMAIL) ---
if (elements.sendRecoveryBtn) {
    elements.sendRecoveryBtn.onclick = async () => {
        const email = elements.recoveryInput.value;
        if (!email) return alert("Veuillez saisir votre email.");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname,
        });
        alert(error ? "Erreur : " + error.message : "✅ Lien envoyé ! Vérifiez vos spams.");
        if (!error) showView('log');
    };
}

// --- MISE À JOUR DU MOT DE PASSE (RETOUR EMAIL) ---
if (elements.savePassBtn) {
    elements.savePassBtn.onclick = async () => {
        const newPassword = elements.newPassInput.value;
        if (newPassword.length < 6) return alert("Minimum 6 caractères.");

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            alert("Erreur : " + error.message);
        } else {
            alert("✅ Mot de passe mis à jour !");
            window.location.href = window.location.origin + window.location.pathname; 
        }
    };
}

// --- CHARGEMENT TIMEWALL ---
function loadTimeWall(userId) {
    const offerWallId = "9c481747da9d5015";
    elements.iframe.src = `https://timewall.io{offerWallId}&userId=${userId}`;
    showView('tw');
}

// --- INSCRIPTION ---
elements.regForm.onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        options: { data: { full_name: document.getElementById('name').value } }
    });
    if (error) alert(error.message);
    else { alert("✅ Inscription réussie ! Vérifiez vos emails."); showView('log'); }
};

// --- CONNEXION ---
elements.logForm.onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('email-login').value,
        password: document.getElementById('password-login').value
    });
    if (error) alert("Erreur : " + error.message);
    else if (data.user) {
        authenticatedUserId = data.user.id;
        elements.userEmailDisplay.innerText = data.user.email;
        showView('conf');
    }
};

// --- INITIALISATION & DÉTECTION LIEN ---
async function initApp() {
    // Détecter l'événement de récupération de mot de passe (Lien cliqué)
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
            showView('newpass');
        }
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // Si session active et pas en cours de récupération
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        if (!urlParams.has('type') || urlParams.get('type') !== 'recovery') {
            authenticatedUserId = session.user.id;
            elements.userEmailDisplay.innerText = session.user.email;
            showView('conf');
        }
    } else {
        showView('reg');
    }

    const { error } = await supabase.from('users').select('id').limit(1);
    if (!error || error.code === 'PGRST116') {
        elements.dbStatus.classList.add('status-online');
        elements.statusText.innerText = "EuroShared Connecté";
    }
}

// --- ACTIONS FINALES ---
if (elements.confBtn) {
    elements.confBtn.onclick = () => { if (authenticatedUserId) loadTimeWall(authenticatedUserId); };
}

if (elements.cancelAuth || elements.logoutBtn) {
    const logoutAction = async (e) => {
        if(e) e.preventDefault();
        await supabase.auth.signOut();
        window.location.href = window.location.origin + window.location.pathname;
    };
    if (elements.cancelAuth) elements.cancelAuth.onclick = logoutAction;
    if (elements.logoutBtn) elements.logoutBtn.onclick = logoutAction;
}

document.addEventListener('DOMContentLoaded', initApp);
