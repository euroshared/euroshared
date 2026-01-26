import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 1. Configuration et Initialisation
const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz"; 
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Éléments du DOM
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
    // Utilisation de l'URL exacte attendue par TimeWall en 2026
    const timeWallUrl = `https://timewall.io/users/login?oid=${offerWallId}&uid=${userId}&tab=tasks`;
    
    if (elements.iframe) {
        elements.iframe.src = timeWallUrl;
        showView('tw');
        if (elements.dbStatus) elements.dbStatus.style.display = 'none';
        console.log("✅ TimeWall activé pour l'utilisateur :", userId);
    }
}

// --- LOGIQUE DE NAVIGATION ---
function showView(view) {
    if (elements.regCont) elements.regCont.style.display = view === 'reg' ? 'block' : 'none';
    if (elements.logCont) elements.logCont.style.display = view === 'log' ? 'block' : 'none';
    if (elements.twCont) elements.twCont.style.display = view === 'tw' ? 'block' : 'none';
}

// --- GESTION DES ÉVÉNEMENTS ---
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
        // Supabase génère l'UUID automatiquement si on ne l'envoie pas
        
        try {
            const { data: existingUser } = await supabase
                .from('users')
                .select('email')
                .eq('email', email)
                .maybeSingle();

            if (existingUser) throw new Error("Cet email est déjà utilisé.");

            // On laisse Supabase générer l'ID (UUID)
            const { data, error } = await supabase
                .from('users')
                .insert([{ name, email }]) 
                .select()
                .single();

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
            // Important : On récupère l'ID sous forme de TEXT pour correspondre au SQL
            const { data: user, error } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .maybeSingle();
            
            if (error) throw error;
            if (!user) throw new Error("Aucun compte trouvé.");

            // Sauvegarde de l'ID dans le navigateur
            localStorage.setItem('euroshared_userid', user.id);
            
            loadTimeWall(user.id);
        } catch (err) {
            alert("Erreur : " + err.message);
        }
    };
}

// --- INITIALISATION ---
async function initApp() {
    const savedUserId = localStorage.getItem('euroshared_userid');
    
    if (savedUserId) {
        loadTimeWall(savedUserId);
    } else {
        showView('reg');
    }

    try {
        // Test de connexion simple
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        
        if (elements.dbStatus) elements.dbStatus.className = "status-online";
        if (elements.statusText) elements.statusText.innerText = "EuroShared est en ligne";
    } catch (err) {
        if (elements.dbStatus) elements.dbStatus.className = "status-offline";
        if (elements.statusText) elements.statusText.innerText = "Mode hors-ligne";
    }
}

document.addEventListener('DOMContentLoaded', initApp);
