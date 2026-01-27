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
    // Nouvel élément pour le mot de passe oublié
    forgotBtn: document.getElementById('forgot-password')
};

let authenticatedUserId = null;

// --- NAVIGATION ---
function showView(view) {
    elements.regCont.style.display = view === 'reg' ? 'block' : 'none';
    elements.logCont.style.display = view === 'log' ? 'block' : 'none';
    elements.twCont.style.display = view === 'tw' ? 'block' : 'none';
    if (elements.confStep) elements.confStep.style.display = 'none';
}

if (document.getElementById('to-login')) {
    document.getElementById('to-login').onclick = (e) => { e.preventDefault(); showView('log'); };
}
if (document.getElementById('to-register')) {
    document.getElementById('to-register').onclick = (e) => { e.preventDefault(); showView('reg'); };
}

// --- VISIBILITÉ DU MOT DE PASSE (L'ŒIL) ---
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const inputId = this.getAttribute('data-target');
        const input = document.getElementById(inputId);
        if (input.type === "password") {
            input.type = "text";
            this.innerText = "🙈"; 
        } else {
            input.type = "password";
            this.innerText = "👁️";
        }
    };
});

// --- MOT DE PASSE OUBLIÉ ---
if (elements.forgotBtn) {
    elements.forgotBtn.onclick = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email-login').value;
        if (!email) {
            alert("Veuillez saisir votre email dans le champ de connexion avant de cliquer sur 'Mot de passe oublié'.");
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname,
        });
        if (error) alert("Erreur : " + error.message);
        else alert("✅ Un lien de réinitialisation a été envoyé à " + email);
    };
}

// --- CHARGEMENT TIMEWALL ---
function loadTimeWall(userId) {
    const offerWallId = "9c481747da9d5015";
    const timeWallUrl = `https://timewall.io/v4/wall?wallId=${offerWallId}&userId=${userId}`;
    if (elements.iframe) {
        elements.iframe.src = timeWallUrl;
        showView('tw');
    }
}

// --- INSCRIPTION ---
elements.regForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { 
            data: { full_name: name },
            emailRedirectTo: window.location.origin + window.location.pathname 
        }
    });

    if (error) alert("Erreur d'inscription : " + error.message);
    else {
        alert("✅ Un lien de confirmation a été envoyé à " + email);
        showView('log');
    }
};

// --- CONNEXION ---
elements.logForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) alert("Erreur de connexion : " + error.message);
    else if (data.user) {
        authenticatedUserId = data.user.id;
        if (elements.userEmailDisplay) elements.userEmailDisplay.innerText = data.user.email;
        showView('none');
        elements.confStep.style.display = 'block';
    }
};

// --- BOUTONS D'ACTION ---
if (elements.confBtn) {
    elements.confBtn.onclick = () => {
        if (authenticatedUserId) {
            elements.confStep.style.display = 'none';
            loadTimeWall(authenticatedUserId);
        }
    };
}

if (elements.cancelAuth) {
    elements.cancelAuth.onclick = async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        window.location.reload();
    };
}

// --- INITIALISATION ---
async function initApp() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        authenticatedUserId = session.user.id;
        if (elements.userEmailDisplay) elements.userEmailDisplay.innerText = session.user.email;
        showView('none');
        elements.confStep.style.display = 'block';
    } else {
        showView('reg');
    }

    try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (!error || error.code === 'PGRST116') {
            elements.dbStatus.classList.add('status-online'); 
            elements.statusText.innerText = "Connecté à EuroShared";
        }
    } catch (err) {
        elements.statusText.innerText = "Serveur en attente";
    }
}

elements.logoutBtn.onclick = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};

document.addEventListener('DOMContentLoaded', initApp);
