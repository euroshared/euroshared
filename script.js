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
    newPassCont: document.getElementById('new-password-container'),
    newPassInput: document.getElementById('new-password-input'),
    savePassBtn: document.getElementById('save-new-password-btn')
};

let authenticatedUserId = null;

// --- GESTION DES VUES ---
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
if (document.getElementById('to-login')) document.getElementById('to-login').onclick = (e) => { e.preventDefault(); showView('log'); };
if (document.getElementById('to-register')) document.getElementById('to-register').onclick = (e) => { e.preventDefault(); showView('reg'); };
if (elements.backToLogin) elements.backToLogin.onclick = (e) => { e.preventDefault(); showView('log'); };
if (elements.forgotBtn) elements.forgotBtn.onclick = (e) => { e.preventDefault(); showView('forgot'); };

// --- GESTION DE L'OEIL (PASSWORD) ---
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

// --- MISE À JOUR DU MOT DE PASSE (ACTION FINALE) ---
if (elements.savePassBtn) {
    elements.savePassBtn.onclick = async () => {
        const newPassword = elements.newPassInput.value;
        if (newPassword.length < 6) return alert("Minimum 6 caractères.");

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            alert("Erreur : " + error.message);
        } else {
            alert("✅ Mot de passe mis à jour ! Veuillez vous reconnecter.");
            await supabase.auth.signOut();
            window.location.href = window.location.origin + window.location.pathname; 
        }
    };
}

// --- CHARGEMENT TIMEWALL ---
function loadTimeWall(userId) {
    const offerWallId = "9c481747da9d5015";
    // RECTIFICATION : Utilisation de la syntaxe template literal correcte ($)
    // et URL adaptée au format partenaire
    const timeWallUrl = `https://timewall.io{offerWallId}&uid=${userId}`;
    const timeWallUrl = `https://timewall.io/users/login?oid=${offerWallId}&uid=${userId}&tab=tasks`;
    
    if (elements.iframe) {
        elements.iframe.src = timeWallUrl;
        showView('tw');
        console.log("✅ TimeWall chargé pour :", userId);
    }
}

// --- INSCRIPTION ---
elements.regForm.onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        options: { data: { full_name: document.getElementById('name').value } }
    });
    if (error) alert("Erreur d'inscription : " + error.message);
    else { alert("✅ Inscription réussie ! Vérifiez vos emails."); showView('log'); }
};

// --- CONNEXION ---
elements.logForm.onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('email-login').value,
        password: document.getElementById('password-login').value
    });
    if (error) alert("Erreur de connexion : " + error.message);
    else if (data.user) {
        authenticatedUserId = data.user.id;
        if (elements.userEmailDisplay) elements.userEmailDisplay.innerText = data.user.email;
        showView('conf');
    }
};

// --- INITIALISATION & DÉTECTION LIEN ---
async function initApp() {
    // 1. Détecter l'événement de récupération
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
            showView('newpass');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    });

    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        const isRecovery = window.location.hash.includes("type=recovery");
        if (!isRecovery) {
            authenticatedUserId = session.user.id;
            if (elements.userEmailDisplay) elements.userEmailDisplay.innerText = session.user.email;
            showView('conf');
        }
    } else {
        showView('reg');
    }

    // Test Statut DB
    try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (!error || error.code === 'PGRST116') {
            elements.dbStatus.classList.add('status-online');
            elements.statusText.innerText = "EuroShared Connecté";
        }
    } catch (err) {
        elements.statusText.innerText = "Serveur en attente";
    }
}

// --- ACTIONS BOUTONS ---
if (elements.confBtn) {
    elements.confBtn.onclick = () => { if (authenticatedUserId) loadTimeWall(authenticatedUserId); };
}

if (elements.cancelAuth || elements.logoutBtn) {
    const logoutAction = async (e) => {
        if(e) e.preventDefault();
        // SÉCURITÉ : Vider l'iframe avant de quitter
        if (elements.iframe) elements.iframe.src = "about:blank";
        await supabase.auth.signOut();
        window.location.href = window.location.origin + window.location.pathname;
    };
    if (elements.cancelAuth) elements.cancelAuth.onclick = logoutAction;
    if (elements.logoutBtn) elements.logoutBtn.onclick = logoutAction;
}

document.addEventListener('DOMContentLoaded', initApp);
