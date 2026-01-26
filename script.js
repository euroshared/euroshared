import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 1. Configuration et Initialisation
const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
// Utilisation de la clé publique (Anon Key)
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz"; 
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Récupération sécurisée des éléments (évite les erreurs si un ID manque dans le HTML)
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
    // Construction de l'URL TimeWall
    const timeWallUrl = `https://timewall.io/users/login?oid=${offerWallId}&uid=${userId}&tab=tasks`;
    
    if (elements.iframe) {
        elements.iframe.src = timeWallUrl;
        showView('tw');
        if (elements.dbStatus) elements.dbStatus.style.display = 'none';
        console.log("🚀 TimeWall chargé pour l'ID :", userId);
    }
}

// --- LOGIQUE DE NAVIGATION ---
function showView(view) {
    if (elements.regCont) elements.regCont.style.display = view === 'reg' ? 'block' : 'none';
    if (elements.logCont) elements.logCont.style.display = view === 'log' ? 'block' : 'none';
    if (elements.twCont) elements.twCont.style.display = view === 'tw' ? 'block' : 'none';
}

// --- GESTION DES ÉVÉNEMENTS (NAVIGATION) ---
if (elements.logoutBtn) {
    elements.logoutBtn.onclick = () => {
        localStorage.removeItem('euroshared_userid');
        location.reload();
    };
}

if (elements.loginLink) elements.loginLink.onclick = (e) => { e.preventDefault(); showView('log'); };
if (elements.registerLink) elements.registerLink.onclick = (e) => { e.preventDefault(); showView('reg'); };

// --- GESTION DE L'INSCRIPTION ---
if (elements.regForm) {
    elements.regForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const birthdate = document.getElementById('birthdate').value;

        try {
            // Vérifier si l'utilisateur existe déjà
            const { data: existingUser } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .maybeSingle();

            if (existingUser) throw new Error("Cet email est déjà utilisé.");

            // Insertion du nouvel utilisateur
            const { error } = await supabase
                .from('users')
                .insert([{ name, email, birthdate }]);

            if (error) throw error;

            alert("Inscription réussie ! Connectez-vous.");
            showView('log');
        } catch (err) {
            alert("Erreur Inscription : " + err.message);
        }
    };
}

// --- GESTION DE LA CONNEXION ---
if (elements.logForm) {
    elements.logForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email-login').value;

        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .maybeSingle();
            
            if (error) throw error;
            if (!user) throw new Error("Aucun compte trouvé avec cet email.");

            // Sauvegarde de la session locale
            localStorage.setItem('euroshared_userid', user.id);
            
            // Chargement de l'offre
            loadTimeWall(user.id);
        } catch (err) {
            alert("Erreur de connexion : " + err.message);
        }
    };
}

// --- INITIALISATION DE L'APP ---
async function initApp() {
    const savedUserId = localStorage.getItem('euroshared_userid');
    
    // 1. Vérifier la session existante
    if (savedUserId) {
        console.log("📦 Session retrouvée.");
        loadTimeWall(savedUserId);
    } else {
        showView('reg'); // Afficher l'inscription par défaut
    }

    // 2. Tester la connexion à Supabase
    try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        
        if (elements.dbStatus) elements.dbStatus.className = "status-online";
        if (elements.statusText) elements.statusText.innerText = "Serveur EuroShared Connecté";
    } catch (err) {
        console.error("Erreur de liaison DB:", err.message);
        if (elements.dbStatus) elements.dbStatus.className = "status-offline";
        if (elements.statusText) elements.statusText.innerText = "Erreur de liaison Base de données";
    }
}

// Lancement au chargement du DOM
document.addEventListener('DOMContentLoaded', initApp);
