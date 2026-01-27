import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
/* ==========================================
   EUROSHARED 2026 - LOGIQUE CORE
   ========================================== */

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
    if (elements.regCont) elements.regCont.style.display = view === 'reg' ? 'block' : 'none';
    if (elements.logCont) elements.logCont.style.display = view === 'log' ? 'block' : 'none';
    if (elements.twCont) elements.twCont.style.display = view === 'tw' ? 'block' : 'none';
}

// --- CHARGEMENT TIMEWALL ---
function loadTimeWall(userId) {
    const offerWallId = "9c481747da9d5015";
    // Utilisation de l'UUID immuable pour éviter les doublons sur TimeWall
    const timeWallUrl = `https://timewall.io{offerWallId}&uid=${userId}&tab=tasks`;
    
    if (elements.iframe) {
        elements.iframe.src = timeWallUrl;
        showView('tw');
        if (elements.dbStatus) elements.dbStatus.style.display = 'none';
        console.log("✅ TimeWall connecté avec l'ID immuable :", userId);
    }
}

// --- INSCRIPTION (AUTH SUPABASE) ---
if (elements.regForm) {
    elements.regForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: { data: { full_name: name } }
            });

            if (error) throw error;
            alert("✅ Inscription réussie ! Merci de confirmer votre email avant de vous connecter.");
            showView('log');
        } catch (err) {
            alert("❌ Erreur d'inscription : " + err.message);
        }
    };
}

// --- CONNEXION SÉCURISÉE ---
if (elements.logForm) {
    elements.logForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email-login').value;
        const password = document.getElementById('password-login').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Vérification de la confirmation email (Standard 2026)
            if (data.user && !data.user.email_confirmed_at) {
                alert("⚠️ Votre email n'est pas encore confirmé.");
                return;
            }

            loadTimeWall(data.user.id);
        } catch (err) {
            alert("❌ Erreur de connexion : " + err.message);
        }
    };
}

// --- GESTION DE LA SESSION AU DÉMARRAGE ---
async function initApp() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session && session.user.email_confirmed_at) {
        loadTimeWall(session.user.id);
    } else {
        showView('reg');
    }

    // Test de connexion DB
    try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        if (elements.statusText) elements.statusText.innerText = "Connecté à EuroShared";
    } catch (err) {
        if (elements.statusText) elements.statusText.innerText = "Serveur en attente";
    }
}

// --- DÉCONNEXION ---
if (elements.logoutBtn) {
    elements.logoutBtn.onclick = async () => {
        await supabase.auth.signOut();
        location.reload();
    };
}

document.addEventListener('DOMContentLoaded', initApp);


