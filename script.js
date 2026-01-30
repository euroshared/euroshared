import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabase = createClient("https://jexaklhwoiaufzshzlcg.supabase.co", "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz");

// Gestion des erreurs d'URL
const urlParams = new URLSearchParams(window.location.hash.replace('#', '?'));
if (urlParams.has('error')) {
    alert("Erreur d'authentification : " + urlParams.get('error_description'));
    window.location.hash = '';
}

const elements = {
    regCont: document.getElementById('register-container'),
    logCont: document.getElementById('login-container'),
    twCont: document.getElementById('timewall-container'),
    confStep: document.getElementById('confirmation-step'),
    forgotCont: document.getElementById('forgot-password-container'),
    iframe: document.getElementById('timewall-iframe'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    userEmail: document.getElementById('user-email-display')
};

let authenticatedUserId = null;

function showView(view) {
    const views = [elements.regCont, elements.logCont, elements.twCont, elements.confStep, elements.forgotCont];
    views.forEach(c => { if(c) c.style.display = 'none'; });
    
    if(view === 'reg' && elements.regCont) elements.regCont.style.display = 'block';
    if(view === 'log' && elements.logCont) elements.logCont.style.display = 'block';
    if(view === 'tw' && elements.twCont) elements.twCont.style.display = 'flex';
    if(view === 'conf' && elements.confStep) elements.confStep.style.display = 'block';
    if(view === 'forgot' && elements.forgotCont) elements.forgotCont.style.display = 'block';
}

function updateStatus(isOnline) {
    const dbStatus = document.getElementById('db-status');
    if (dbStatus) {
        if (isOnline) {
            dbStatus.classList.add('status-online');
            if(elements.statusText) elements.statusText.innerText = "EuroShared Connecté";
        } else {
            dbStatus.classList.remove('status-online');
            if(elements.statusText) elements.statusText.innerText = "En attente de connexion";
        }
    }
}

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
const regForm = document.getElementById('register-form');
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const siteUrl = "https://euroshared.github.io/euroshared/"; 
        const fullName = document.getElementById('name').value;

        const { error } = await supabase.auth.signUp({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            options: {
                emailRedirectTo: siteUrl,
                data: { full_name: fullName }
            }
        });

        if (error) alert("Erreur : " + error.message);
        else alert("Vérifiez vos emails pour confirmer votre compte !");
    });
}

// Connexion
const logForm = document.getElementById('login-form');
if (logForm) {
    logForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({
            email: document.getElementById('email-login').value,
            password: document.getElementById('password-login').value
        });
        if (error) alert(error.message); 
        else location.reload();
    });
}

// Mot de passe oublié
const recoveryBtn = document.getElementById('send-recovery-btn');
if (recoveryBtn) {
    recoveryBtn.onclick = async () => {
        const email = document.getElementById('email-recovery-confirm').value;
        const resetUrl = "https://euroshared.github.io/euroshared/";    
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: resetUrl });
        if (error) alert("Erreur : " + error.message);
        else {
            alert("Lien envoyé ! Vérifiez votre boîte mail.");
            showView('log');
        }
    };
}

// Offerwalls
document.querySelectorAll('.wall-btn').forEach(button => {
    button.onclick = () => {
        if (!authenticatedUserId) {
            alert("Session expirée. Veuillez vous reconnecter.");
            return;
        }
        let wallUrl = button.getAttribute('data-url');
        wallUrl = wallUrl.replace('{uid}', authenticatedUserId);
        if(elements.iframe) elements.iframe.src = wallUrl;
        showView('tw');
    };
});

// Toggle Password
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.textContent = '🙈';
                } else {
                    input.type = 'password';
                    this.textContent = '👁️';
                }
            }
        });
    });
});

// Navigation & SignOut
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
    const el = document.getElementById(id);
    if(el) el.onclick = func;
});

document.addEventListener('DOMContentLoaded', initApp);

// Diagnostic Supabase
async function checkSupabaseLink() {
    const dot = document.getElementById('checker-dot');
    const label = document.getElementById('checker-label');
    if (!dot || !label) return;

    try {
        await supabase.auth.getSession();
        dot.classList.add('online');
        label.innerText = "Supabase Connecté";
    } catch (e) {
        dot.classList.add('offline');
        label.innerText = "Supabase Déconnecté";
    }
}
checkSupabaseLink();

// Module de Validation
document.addEventListener('DOMContentLoaded', () => {
    const pwdInput = document.getElementById('password');
    if (pwdInput) {
        pwdInput.setAttribute('minLength', '6');
        pwdInput.setAttribute('required', 'true');
    }

    const validateEmail = (formId) => {
        const form = document.getElementById(formId);
        if (!form) return;
        form.addEventListener('submit', (e) => {
            const email = form.querySelector('input[type="email"]');
            if (email && !email.value.includes('@')) {
                alert("Veuillez entrer une adresse email valide.");
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        });
    };

    validateEmail('register-form');
    validateEmail('login-form');
});
