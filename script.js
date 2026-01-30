import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabase = createClient("https://jexaklhwoiaufzshzlcg.supabase.co", "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz");

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
    [elements.regCont, elements.logCont, elements.twCont, elements.confStep, elements.forgotCont].forEach(c => c.style.display = 'none');
    if(view === 'reg') elements.regCont.style.display = 'block';
    if(view === 'log') elements.logCont.style.display = 'block';
    if(view === 'tw') elements.twCont.style.display = 'flex';
    if(view === 'conf') elements.confStep.style.display = 'block';
    if(view === 'forgot') elements.forgotCont.style.display = 'block';
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

// Actions confirmation email
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const { data, error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    });

    if (error) {
        alert(error.message);
    } else {
        // CORRECTION ICI : On valide la session immédiatement
        authenticatedUserId = data.user.id; 
        elements.userEmail.innerText = data.user.email;
        
        alert("Inscription réussie ! Vous pouvez accéder aux offres.");
        showView('conf'); // On saute l'étape "Vérifiez vos emails"
        updateStatus(true);
    }
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
// Acceder aux sites offerwalls
document.getElementById('confirm-access-btn').onclick = async () => {
    // 1. Double vérification de la session pour être SÛR d'avoir l'ID
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert("Session expirée. Veuillez vous reconnecter.");
        showView('log');
        return;
    }
    // 2. On récupère le VRAI ID de la session actuelle
    const userId = session.user.id;
    const offerWallId = "9c481747da9d5015";
    // 3. On génère l'URL avec le bon UID
    const wallUrl = `https://timewall.io/users/login?oid=${offerWallId}&uid=${authenticatedUserId}&tab=tasks`;
    console.log("Ouverture TimeWall pour ID:", userId); // Pour tes tests
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

document.addEventListener('DOMContentLoaded', () => {
    const btnGoogle = document.getElementById('btn-google');

    if (btnGoogle) {
        btnGoogle.addEventListener('click', () => {
            // Ouvre Google dans un nouvel onglet
            window.open('https://www.google.com', '_blank');
            
            // OU pour ouvrir dans la même fenêtre, utilise :
            // window.location.href = 'https://www.google.com';
        });
    }
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
