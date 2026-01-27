import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';



const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz"; 
const supabase = createClient(supabaseUrl, supabaseKey);

// On ajoute les nouveaux éléments de confirmation au dictionnaire
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
    // Nouveaux éléments pour l'étape intermédiaire
    confStep: document.getElementById('confirmation-step'),
    confBtn: document.getElementById('confirm-access-btn')
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

document.getElementById('to-login').onclick = (e) => { e.preventDefault(); showView('log'); };
document.getElementById('to-register').onclick = (e) => { e.preventDefault(); showView('reg'); };

// --- CHARGEMENT TIMEWALL ---
function loadTimeWall(userId) {
    const offerWallId = "9c481747da9d5015";
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
        // Au lieu de loadTimeWall, on prépare l'étape de confirmation
        authenticatedUserId = data.user.id;
        showView('none'); // Cache tout
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

// --- INITIALISATION & TEST DB ---
async function initApp() {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Si déjà connecté, on demande quand même de cliquer sur le bouton
    if (session) {
        authenticatedUserId = session.user.id;
        showView('none');
        elements.confStep.style.display = 'block';
    } else {
        showView('reg');
    }

    try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (!error || error.code === 'PGRST116') {
            elements.dbStatus.classList.add('status-online'); // Utilise votre classe CSS
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
