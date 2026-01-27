import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz"; 
const supabase = createClient(supabaseUrl, supabaseKey);

const elements = {
    dbStatus: document.getElementById('db-status'),
    statusText: document.getElementById('status-text'),
    regCont: document.getElementById('register-container'),
    logCont: document.getElementById('login-container'),
    twCont: document.getElementById('timewall-container'),
    iframe: document.getElementById('timewall-iframe'),
    regForm: document.getElementById('register-form'),
    logForm: document.getElementById('login-form'),
    logoutBtn: document.getElementById('logout-button')
};

// --- NAVIGATION ---
function showView(view) {
    elements.regCont.style.display = view === 'reg' ? 'block' : 'none';
    elements.logCont.style.display = view === 'log' ? 'block' : 'none';
    elements.twCont.style.display = view === 'tw' ? 'block' : 'none';
}

document.getElementById('to-login').onclick = () => showView('log');
document.getElementById('to-register').onclick = () => showView('reg');

// --- CHARGEMENT TIMEWALL ---
function loadTimeWall(userId) {
    const offerWallId = "9c481747da9d5015";
    // Correction syntaxe URL 2026
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
    const { data, error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        options: { data: { full_name: document.getElementById('name').value } }
    });

    if (error) alert("Erreur : " + error.message);
    else {
        alert("✅ Inscription réussie ! Vérifiez vos emails.");
        showView('log');
    }
};

// --- CONNEXION ---
elements.logForm.onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('email-login').value,
        password: document.getElementById('password-login').value
    });

    if (error) alert("Erreur : " + error.message);
    else if (data.user) loadTimeWall(data.user.id);
};

// --- INITIALISATION & TEST DB ---
async function initApp() {
    // 1. Vérifier session existante
    const { data: { session } } = await supabase.auth.getSession();
    if (session) loadTimeWall(session.user.id);

    // 2. Test connexion pour passer le voyant au vert
    try {
        // On tente de lire une table (ex: 'profiles' ou 'users')
        const { error } = await supabase.from('users').select('id').limit(1);
        if (!error || error.code === 'PGRST116') { // PGRST116 = Table vide mais accessible
            elements.dbStatus.classList.add('connected');
            elements.statusText.innerText = "Connecté à EuroShared";
        }
    } catch (err) {
        elements.statusText.innerText = "Mode hors-ligne";
    }
}

elements.logoutBtn.onclick = async () => {
    await supabase.auth.signOut();
    window.location.reload();
};

document.addEventListener('DOMContentLoaded', initApp);
