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
    backToLogin: document.getElementById('back-to-login')
};

let authenticatedUserId = null;

function showView(view) {
    [elements.regCont, elements.logCont, elements.twCont, elements.confStep, elements.forgotCont].forEach(el => {
        if(el) el.style.display = 'none';
    });
    if (view === 'reg') elements.regCont.style.display = 'block';
    if (view === 'log') elements.logCont.style.display = 'block';
    if (view === 'tw') elements.twCont.style.display = 'block';
    if (view === 'conf') elements.confStep.style.display = 'block';
    if (view === 'forgot') elements.forgotCont.style.display = 'block';
}

// Navigation basique
document.getElementById('to-login').onclick = (e) => { e.preventDefault(); showView('log'); };
document.getElementById('to-register').onclick = (e) => { e.preventDefault(); showView('reg'); };
if (elements.backToLogin) elements.backToLogin.onclick = (e) => { e.preventDefault(); showView('log'); };
if (elements.forgotBtn) elements.forgotBtn.onclick = (e) => { e.preventDefault(); showView('forgot'); };

// Gestion de l'œil
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const input = document.getElementById(this.getAttribute('data-target'));
        input.type = input.type === "password" ? "text" : "password";
        this.innerText = input.type === "password" ? "👁️" : "🙈";
    };
});

// Récupération de mot de passe
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

function loadTimeWall(userId) {
    const offerWallId = "9c481747da9d5015";
    elements.iframe.src = `https://timewall.io{offerWallId}&userId=${userId}`;
    showView('tw');
}

// Inscription
elements.regForm.onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        options: { data: { full_name: document.getElementById('name').value } }
    });
    if (error) alert(error.message);
    else { alert("✅ Inscription réussie ! Vérifiez vos emails."); showView('log'); }
};

// Connexion
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

// Boutons finaux
if (elements.confBtn) {
    elements.confBtn.onclick = () => { if (authenticatedUserId) loadTimeWall(authenticatedUserId); };
}

if (elements.cancelAuth) {
    elements.cancelAuth.onclick = async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        window.location.reload();
    };
}

async function initApp() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        authenticatedUserId = session.user.id;
        elements.userEmailDisplay.innerText = session.user.email;
        showView('conf');
    } else {
        showView('reg');
    }
    const { error } = await supabase.from('users').select('id').limit(1);
    if (!error || error.code === 'PGRST116') {
        elements.dbStatus.classList.add('status-online');
        elements.statusText.innerText = "EuroShared Connecté";
    }
}

elements.logoutBtn.onclick = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};

document.addEventListener('DOMContentLoaded', initApp);
