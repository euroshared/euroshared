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

// FONCTION RÉPARÉE (Celle-ci bloquait tout)
function showView(view) {
    [elements.regCont, elements.logCont, elements.twCont, elements.confStep, elements.forgotCont, elements.newPwdCont].forEach(c => {
        if(c) c.style.display = 'none';
    });
    
    if(view === 'reg') elements.regCont.style.display = 'block';
    if(view === 'log') elements.logCont.style.display = 'block';
    if(view === 'tw') elements.twCont.style.display = 'flex';
    if(view === 'conf') elements.confStep.style.display = 'block';
    if(view === 'forgot') elements.forgotCont.style.display = 'block';
    if(view === 'newpwd') {
        elements.newPwdCont.style.display = 'block';
        if (typeof turnstile !== 'undefined') turnstile.reset();
    }
}

function updateStatus(isOnline) {
    if (isOnline) {
        elements.statusDot.classList.add('status-online');
        elements.statusText.innerText = "EuroShared Connecté";
    } else {
        elements.statusDot.classList.remove('status-online');
        elements.statusText.innerText = "Déconnecté";
    }
}

async function initApp() {
    if (window.location.hash.includes('type=recovery')) {
        showView('newpwd');
        return;
    }
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

// Actions Formulaires
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        options: { emailRedirectTo: "https://euroshared.github.io" }
    });
    if (error) alert(error.message); else alert("Vérifiez vos emails !");
};

document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('email-login').value,
        password: document.getElementById('password-login').value
    });
    if (error) alert(error.message); else location.reload();
};

document.getElementById('send-recovery-btn').onclick = async () => {
    const email = document.getElementById('email-recovery-confirm').value;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://euroshared.github.io"
    });
    if (error) alert(error.message); else { alert("Lien envoyé !"); showView('log'); }
};

document.getElementById('save-new-password-btn').onclick = async () => {
    const token = document.querySelector('[name="cf-turnstile-response"]').value;
    if (!token) return alert("Validez le captcha");
    const { error } = await supabase.auth.updateUser({ 
        password: document.getElementById('new-password-input').value 
    });
    if (error) alert(error.message); else { alert("Succès !"); location.reload(); }
};

// Navigation & Auth
document.getElementById('confirm-access-btn').onclick = () => {
    elements.iframe.src = `https://timewall.io{authenticatedUserId}&tab=tasks`;
    showView('tw');
};

document.getElementById('to-login').onclick = () => showView('log');
document.getElementById('to-register').onclick = () => showView('reg');
document.getElementById('forgot-password').onclick = () => showView('forgot');
document.getElementById('back-to-login').onclick = () => showView('log');
document.getElementById('back-to-dash').onclick = () => showView('conf');
document.getElementById('logout-button').onclick = async () => { await supabase.auth.signOut(); location.reload(); };
document.getElementById('cancel-auth').onclick = async () => { await supabase.auth.signOut(); location.reload(); };

// Password Toggle
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.onclick = function() {
        const input = document.getElementById(this.dataset.target);
        input.type = input.type === 'password' ? 'text' : 'password';
        this.innerText = input.type === 'password' ? '👁️' : '🙈';
    };
});

// Diagnostic
async function checkSupabaseLink() {
    const dot = document.getElementById('checker-dot');
    try {
        await supabase.auth.getSession();
        dot.style.background = "#22c55e"; // Vert
        document.getElementById('checker-label').innerText = "Supabase OK";
    } catch (e) {
        dot.style.background = "#ef4444"; // Rouge
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    checkSupabaseLink();
});
