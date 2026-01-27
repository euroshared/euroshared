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
    forgotBtn: document.getElementById('forgot-password')
};

let authenticatedUserId = null;

function showView(view) {
    elements.regCont.style.display = view === 'reg' ? 'block' : 'none';
    elements.logCont.style.display = view === 'log' ? 'block' : 'none';
    elements.twCont.style.display = view === 'tw' ? 'block' : 'none';
    if (elements.confStep) elements.confStep.style.display = view === 'conf' ? 'block' : 'none';
}

// Navigation
document.getElementById('to-login').onclick = (e) => { e.preventDefault(); showView('log'); };
document.getElementById('to-register').onclick = (e) => { e.preventDefault(); showView('reg'); };

// Gestion de l'œil
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const input = document.getElementById(this.getAttribute('data-target'));
        input.type = input.type === "password" ? "text" : "password";
        this.innerText = input.type === "password" ? "👁️" : "🙈";
    };
});

// Mot de passe oublié
if (elements.forgotBtn) {
    elements.forgotBtn.onclick = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email-login').value;
        if (!email) return alert("Saisissez votre email d'abord.");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.href,
        });
        alert(error ? error.message : "Lien envoyé !");
    };
}

function loadTimeWall(userId) {
    const offerWallId = "9c481747da9d5015";
    elements.iframe.src = `https://timewall.io/v4/wall?wallId=${offerWallId}&userId=${userId}`;
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
    else { alert("Lien de confirmation envoyé !"); showView('log'); }
};

// Connexion
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

// Boutons finaux
if (elements.confBtn) {
    elements.confBtn.onclick = () => {
        if (authenticatedUserId) loadTimeWall(authenticatedUserId);
    };
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
    // Test DB
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
