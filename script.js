import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';






// Configuration Supabase
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

// --- INITIALISATION ---
async function initApp() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
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
        elements.statusDot.style.backgroundColor = "#00ff00";
        elements.statusText.innerText = "EuroShared Connecté";
    } else {
        elements.statusDot.style.backgroundColor = "#ff0000";
        elements.statusText.innerText = "En attente de connexion";
    }
}

// --- AUTHENTIFICATION ---
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        options: { data: { full_name: document.getElementById('name').value } }
    });
    if (error) alert(error.message);
    else alert("Vérifiez votre email !");
};

document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('email-login').value,
        password: document.getElementById('password-login').value
    });
    if (error) alert(error.message);
    else {
        authenticatedUserId = data.user.id;
        elements.userEmailDisplay.innerText = data.user.email;
        showView('conf');
        updateStatus(true);
    }
};

// --- DÉCLENCHEMENT TIMEWALL (LIEN CORRECT) ---
if (elements.confirmBtn) {
    elements.confirmBtn.onclick = () => {
        if (!authenticatedUserId) return alert("Session expirée");

        // L'identifiant de ton mur
        const offerWallId = "9c481747da9d5015";
        
        // LE LIEN QUI MARCHE (oid / uid)
        const wallUrl = `https://timewall.io/users/login?oid=${offerWallId}&uid=${authenticatedUserId}&tab=tasks`;
        
        console.log("Chargement de TimeWall...");
        
        // Injection et changement de vue
        elements.iframe.src = wallUrl;
        showView('tw');
    };
}

// --- NAVIGATION ---
document.getElementById('back-to-dashboard').onclick = () => showView('conf');
document.getElementById('to-login').onclick = () => showView('log');
document.getElementById('to-register').onclick = () => showView('reg');
document.getElementById('forgot-password').onclick = () => showView('forgot');

const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};
document.getElementById('logout-button').onclick = logout;
document.getElementById('cancel-auth').onclick = logout;

// Toggle Password
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const input = document.getElementById(this.getAttribute('data-target'));
        input.type = input.type === "password" ? "text" : "password";
    };
});

document.addEventListener('DOMContentLoaded', initApp);
