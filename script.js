import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

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

async function initApp() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
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

// --- ACTIONS ---
if (elements.confirmBtn) {
    elements.confirmBtn.onclick = () => {
        if (!authenticatedUserId) return alert("Reconnectez-vous");

        // RECTIFICATION : Utilisation de oid/uid pour forcer l'auto-login
        const widgetId = "9c481747da9d5015";
        const wallUrl = `https://timewall.io{widgetId}&uid=${authenticatedUserId}`;
        
        showView('tw');
        
        setTimeout(() => {
            // Nettoyage avant injection
            elements.iframe.src = "about:blank";
            elements.iframe.src = wallUrl;
        }, 150);
    };
}

document.getElementById('btn-google').onclick = () => window.open("https://www.google.com", '_blank');

// --- AUTH ---
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
        updateStatus(true);
    }
};

document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        options: { data: { full_name: document.getElementById('name').value } }
    });
    if (error) alert(error.message);
    else alert("✅ Inscription réussie !");
};

// --- NAV ---
document.getElementById('to-login').onclick = (e) => { e.preventDefault(); showView('log'); };
document.getElementById('to-register').onclick = (e) => { e.preventDefault(); showView('reg'); };
document.getElementById('back-to-login').onclick = (e) => { e.preventDefault(); showView('log'); };

const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};
document.getElementById('logout-button').onclick = logout;
document.getElementById('cancel-auth').onclick = logout;

document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const input = document.getElementById(this.getAttribute('data-target'));
        input.type = input.type === "password" ? "text" : "password";
        this.innerText = input.type === "password" ? "👁️" : "🙈";
    };
});

document.addEventListener('DOMContentLoaded', initApp);
