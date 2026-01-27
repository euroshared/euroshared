import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz"; 
const supabase = createClient(supabaseUrl, supabaseKey);

// On ajoute les nouveaux éléments de confirmation et d'affichage au dictionnaire
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
    // Éléments pour l'étape intermédiaire
    confStep: document.getElementById('confirmation-step'),
    confBtn: document.getElementById('confirm-access-btn'),
    userEmailDisplay: document.getElementById('user-email-display'), // Affichage email
    cancelAuth: document.getElementById('cancel-auth')               // Lien déconnexion
};

// Variable globale pour stocker l'ID après auth mais avant clic final
let authenticatedUserId = null;

// --- NAVIGATION ---
function showView(view) {
    elements.regCont.style.display = view === 'reg' ? 'block' : 'none';
    elements.logCont.style.display = view === 'log' ? 'block' : 'none';
    elements.twCont.style.display = view === 'tw' ? 'block' : 'none';
    // On cache l'étape de confirmation par défaut dans les autres vues
    if (elements.confStep) elements.confStep.style.display = 'none';
}

// Sécurité pour les liens de bascule (vérification de l'existence des éléments)
if (document.getElementById('to-login')) {
    document.getElementById('to-login').onclick = (e) => { e.preventDefault(); showView('log'); };
}
if (document.getElementById('to-register')) {
    document.getElementById('to-register').onclick = (e) => { e.preventDefault(); showView('reg'); };
}

// --- CHARGEMENT TIMEWALL ---
function loadTimeWall(userId) {
    const offerWallId = "9c481747da9d5015";
    // URL mise à jour avec le chemin exact v4
    const timeWallUrl = `https://timewall.io/v4/wall?wallId=${offerWallId}&userId=${userId}`;
    
    if (elements.iframe) {
        elements.iframe.src = timeWallUrl;
        showView('tw');
        console.log("✅ TimeWall chargé pour :", userId);
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
            // Redirection automatique vers votre page après confirmation e-mail
            emailRedirectTo: window.location.origin + window.location.pathname 
        }
    });

    if (error) {
        alert("Erreur d'inscription : " + error.message);
    } else {
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

    if (error) {
        alert("Erreur de connexion : " + error.message);
    } else if (data.user) {
        // Préparation de l'étape de confirmation manuelle
        authenticatedUserId = data.user.id;
        
        // Affichage de l'email de l'utilisateur pour confirmation visuelle
        if (elements.userEmailDisplay) {
            elements.userEmailDisplay.innerText = data.user.email;
        }
        
        showView('none'); // Cache les formulaires
        elements.confStep.style.display = 'block'; // Affiche le bouton "Lancer TimeWall"
    }
};

// --- BOUTON DE LANCEMENT FINAL ---
if (elements.confBtn) {
    elements.confBtn.onclick = () => {
        if (authenticatedUserId) {
            elements.confStep.style.display = 'none';
            loadTimeWall(authenticatedUserId);
        }
    };
}

// --- BOUTON DE DECONNEXION DE SECOURS (DANS CONFIRMATION) ---
if (elements.cancelAuth) {
    elements.cancelAuth.onclick = async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        window.location.reload();
    };
}

// --- INITIALISATION & TEST DB ---
async function initApp() {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Si déjà connecté, on affiche l'étape de lancement avec l'email
    if (session) {
        authenticatedUserId = session.user.id;
        if (elements.userEmailDisplay) {
            elements.userEmailDisplay.innerText = session.user.email;
        }
        showView('none');
        elements.confStep.style.display = 'block';
    } else {
        showView('reg');
    }

    // Test de connexion à la base de données pour le voyant
    try {
        const { error } = await supabase.from('users').select('id').limit(1);
        // Code PGRST116 signifie que la table est vide mais accessible
        if (!error || error.code === 'PGRST116') {
            elements.dbStatus.classList.add('status-online'); 
            elements.statusText.innerText = "Connecté à EuroShared";
        } else {
            elements.dbStatus.classList.add('status-offline');
        }
    } catch (err) {
        elements.statusText.innerText = "Serveur en attente";
        elements.dbStatus.classList.add('status-offline');
    }
}

// --- LOGOUT PRINCIPAL ---
elements.logoutBtn.onclick = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};

document.addEventListener('DOMContentLoaded', initApp);
