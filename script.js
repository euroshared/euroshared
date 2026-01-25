

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 1. Configuration et Initialisation
const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz";
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Définition de l'objet "elements"
const elements = {
    dbStatus: document.getElementById('db-status'),
    statusText: document.getElementById('status-text'),
    regCont: document.getElementById('register-container'),
    logCont: document.getElementById('login-container'),
    twCont: document.getElementById('timewall-container'),
    iframe: document.getElementById('timewall-iframe'),
    regForm: document.getElementById('register-form'),
    logForm: document.getElementById('login-form'),
    loginLink: document.getElementById('login-link'),
    registerLink: document.getElementById('register-link'),
    logoutBtn: document.getElementById('logout-button')
};

// --- FONCTION DE CHARGEMENT DE L'IFRAME ---
function loadTimeWall(userId) {
    const offerWallId = "9c481747da9d5015";
    // URL exacte avec /users/login? et les paramètres OID/UID
    const timeWallUrl = `https://timewall.io/users/login?oid=${offerWallId}&uid=${userId}&tab=tasks`;
    
    elements.iframe.src = timeWallUrl;
    showView('tw');
    if (elements.dbStatus) elements.dbStatus.style.display = 'none';
    console.log("🚀 TimeWall chargé dynamiquement pour l'ID :", userId);
}

// --- LOGIQUE DE NAVIGATION ---
function showView(view) {
    elements.regCont.style.display = view === 'reg' ? 'block' : 'none';
    elements.logCont.style.display = view === 'log' ? 'block' : 'none';
    elements.twCont.style.display = view === 'tw' ? 'block' : 'none';
}

// --- GESTION DE LA DÉCONNEXION ---
elements.logoutBtn.onclick = () => {
    localStorage.removeItem('euroshared_userid'); // Efface la session
    location.reload(); // Recharge pour revenir à l'inscription
};

elements.loginLink.onclick = (e) => { e.preventDefault(); showView('log'); };
elements.registerLink.onclick = (e) => { e.preventDefault(); showView('reg'); };

// --- GESTION DE L'INSCRIPTION ---
elements.regForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const birthdate = document.getElementById('birthdate').value;

    try {
        const { data: user } = await supabase.from('users').select('email').eq('email', email).maybeSingle();
        if (user) throw new Error("Cet email est déjà utilisé.");

        const { error } = await supabase.from('users').insert([{ name, email, birthdate }]);
        if (error) throw error;

        alert("Inscription réussie ! Connectez-vous.");
        showView('log');
    } catch (err) {
        alert("Erreur Inscription : " + err.message);
    }
};

// --- GESTION DE LA CONNEXION ---
elements.logForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email-login').value;

    try {
        const { data: user, error } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
        
        if (error) throw error;
        if (!user) throw new Error("Aucun compte trouvé avec cet email.");

        // SAUVEGARDE DE LA SESSION
        localStorage.setItem('euroshared_userid', user.id);
        
        // Chargement immédiat
        loadTimeWall(user.id);
    } catch (err) {
        alert("Erreur de connexion : " + err.message);
    }
};

// --- TEST DE CONNEXION ET VÉRIFICATION SESSION ---
async function initApp() {
    // 1. Vérifier si une session existe déjà dans le navigateur
    const savedUserId = localStorage.getItem('euroshared_userid');
    
    if (savedUserId) {
        console.log("📦 Session retrouvée. Chargement direct...");
        loadTimeWall(savedUserId);
    }

    // 2. Tester la connexion Supabase en arrière-plan
    try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        elements.dbStatus.className = "status-online";
        elements.statusText.innerText = "Serveur EuroShared Connecté";
    } catch (err) {
        elements.dbStatus.className = "status-offline";
        elements.statusText.innerText = "Erreur de liaison Base de données";
    }
}

// LANCEMENT AU CHARGEMENT DE LA PAGE
initApp();
