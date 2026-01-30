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

function showView(view) {
    [elements.regCont, elements.logCont, elements.twCont, elements.confStep, elements.forgotCont, elements.newPwdCont].forEach(c => c.style.display = 'none');
    
    if(view === 'reg') elements.regCont.style.display = 'block';
    if(view === 'log') elements.logCont.style.display = 'block';
    if(view === 'tw') elements.twCont.style.display = 'flex';
    if(view === 'conf') elements.confStep.style.display = 'block';
    if(view === 'forgot') elements.forgotCont.style.display = 'block';
    if(view === 'newpwd') elements.newPwdCont.style.display = 'block'; 
}

function updateStatus(isOnline) {
    if (isOnline) {
        document.getElementById('db-status').classList.add('status-online');
        elements.statusText.innerText = "EuroShared Connecté";
    } else {
        document.getElementById('db-status').classList.remove('status-online');
        elements.statusText.innerText = "En attente de connexion";
    }
}

async function initApp() {
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
// Si l'URL contient le jeton, on change de vue immédiatement après le chargement
if (window.location.hash.includes('type=recovery')) window.addEventListener('load', () => showView('newpwd'));

// Actions confirmation email
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    
    // Remplace par ton URL réelle GitHub Pages
    const siteUrl = "https://euroshared.github.io/euroshared/"; 

    const { error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        options: {
            emailRedirectTo: siteUrl, // FORCE LA REDIRECTION ICI
        }
    });

    if (error) {
        alert(error.message);
    } else {
        alert("Vérifiez vos emails pour confirmer votre compte !");
    }
};

// function login
document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('email-login').value,
        password: document.getElementById('password-login').value
    });
    if (error) alert(error.message); else { location.reload(); }
};

// fonction  reset paswword
document.getElementById('send-recovery-btn').onclick = async () => {
    const email = document.getElementById('email-recovery-confirm').value;
    // 1. Définir explicitement l'URL de redirection (ex: votre page de mise à jour)
    const resetUrl = "https://euroshared.github.io/euroshared/";    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl, // Force la destination après le clic dans l'email
    });
    if (error) {
        alert("Erreur : " + error.message);
    } else {
        alert("Lien envoyé ! Vérifiez votre boîte mail.");
        showView('log');
    }
};

// À mettre à la suite des autres onclick
if (document.getElementById('save-new-password-btn')) {
    document.getElementById('save-new-password-btn').onclick = async () => {
        const newPassword = document.getElementById('new-password-input').value;
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) alert(error.message);
        else {
            alert("Mot de passe mis à jour !");
            window.location.hash = "";
            showView('log');
        }
    };
}


// Acceder aux sites offerwalls
document.getElementById('confirm-access-btn').onclick = () => {
    const offerWallId = "9c481747da9d5015";
  const wallUrl = `https://timewall.io/users/login?oid=9c481747da9d5015&uid=${authenticatedUserId}&tab=tasks`;
    elements.iframe.src = wallUrl;
    showView('tw');
};

// espace activation de visualiser mot de passe
document.addEventListener('DOMContentLoaded', () => {
    // Gestion du clic sur l'icône œil
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = '🙈'; // Change l'icône
            } else {
                input.type = 'password';
                this.textContent = '👁️';
            }
        });
    });
});
// Navigation
document.getElementById('to-login').onclick = () => showView('log');
document.getElementById('to-register').onclick = () => showView('reg');
document.getElementById('forgot-password').onclick = () => showView('forgot');
document.getElementById('back-to-login').onclick = () => showView('log');
document.getElementById('back-to-dash').onclick = () => showView('conf');
document.getElementById('cancel-auth').onclick = async () => { await supabase.auth.signOut(); location.reload(); };
document.getElementById('logout-button').onclick = async () => { await supabase.auth.signOut(); location.reload(); };
document.addEventListener('DOMContentLoaded', initApp);

/**
 * Diagnostic Indépendant de la connexion Supabase
 * Aucun conflit avec le reste du code
 */
async function checkSupabaseLink() {
    const dot = document.getElementById('checker-dot');
    const label = document.getElementById('checker-label');

    try {
        // Un simple appel pour voir si Supabase répond
        const { error } = await supabase.auth.getSession();
        
        // Si on a une réponse (même avec une erreur de session vide), le lien est établi
        dot.classList.add('online');
        label.innerText = "Superbase Connecté";
    } catch (e) {
        // Le lien ne fonctionne pas (problème réseau ou mauvaises clés)
        dot.classList.add('offline');
        label.innerText = "Superbase Déconnecté";
    }
}

// On lance le test tout de suite
checkSupabaseLink();










/** 
 * Module de Validation (Extension)
 * S'ajoute au code existant sans modification
 */
document.addEventListener('DOMContentLoaded', () => {
    const forms = {
        register: document.getElementById('register-form'),
        login: document.getElementById('login-form')
    };

    // 1. Restriction de longueur sur le mot de passe (min 6 caractères pour Supabase)
    const pwdInput = document.getElementById('password');
    if (pwdInput) {
        pwdInput.setAttribute('minLength', '6');
        pwdInput.setAttribute('required', 'true');
    }

    // 2. Validation visuelle avant soumission
    const validateForm = (form) => {
        const email = form.querySelector('input[type="email"]');
        if (email && !email.value.includes('@')) {
            alert("Veuillez entrer une adresse email valide.");
            return false;
        }
        return true;
    };

    // Interception légère pour validation
    if (forms.register) {
        const originalRegister = forms.register.onsubmit;
        forms.register.onsubmit = async (e) => {
            if (validateForm(forms.register)) await originalRegister(e);
            else e.preventDefault();
        };
    }
});









/**
 * GESTIONNAIRE DE RÉCUPÉRATION DE MOT DE PASSE
 * Détecte le type de hash 'recovery' dans l'URL
 */
(async function handlePasswordReset() {
    const hash = window.location.hash;
    
    // Vérifie si l'URL contient les paramètres de récupération de Supabase
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
        
        // Attendre que le DOM soit chargé
        setTimeout(() => {
            // Affiche le conteneur du nouveau mot de passe (id déjà présent dans votre HTML)
            const newPwdCont = document.getElementById('new-password-container');
            if (newPwdCont) {
                // Cache tous les autres containers
                document.querySelectorAll('.container').forEach(c => c.style.display = 'none');
                newPwdCont.style.display = 'block';
            }
        }, 500);

        // Logique du bouton "Enregistrer"
        const saveBtn = document.getElementById('save-new-password-btn');
        const newPwdInput = document.getElementById('new-password-input');

        if (saveBtn && newPwdInput) {
            saveBtn.onclick = async () => {
                const newPassword = newPwdInput.value;
                if (newPassword.length < 6) {
                    alert("Le mot de passe doit faire au moins 6 caractères.");
                    return;
                }

                const { error } = await supabase.auth.updateUser({ password: newPassword });

                if (error) {
                    alert("Erreur : " + error.message);
                } else {
                    alert("Mot de passe mis à jour avec succès !");
                    window.location.hash = ''; // Nettoie l'URL
                    location.reload(); // Redirige vers l'accueil/login
                }
            };
        }
    }
})();


