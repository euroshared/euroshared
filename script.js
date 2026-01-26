import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 1. Configuration Supabase 2026
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
    const timeWallUrl = `https://timewall.io/users/login?oid=${offerWallId}&uid=${userId}&tab=tasks`;
    
    if (elements.iframe) {
        elements.iframe.src = timeWallUrl;
        showView('tw');
        if (elements.dbStatus) elements.dbStatus.style.display = 'none';
        console.log("✅ TimeWall chargé pour :", userId);
    }
}

// --- NAVIGATION ---
function showView(view) {
    if (elements.regCont) elements.regCont.style.display = view === 'reg' ? 'block' : 'none';
    if (elements.logCont) elements.logCont.style.display = view === 'log' ? 'block' : 'none';
    if (elements.twCont) elements.twCont.style.display = view === 'tw' ? 'block' : 'none';
}

// --- GESTIONNAIRES D'ÉVÉNEMENTS ---
if (elements.logoutBtn) {
    elements.logoutBtn.onclick = () => {
        localStorage.removeItem('euroshared_userid');
        location.reload();
    };
}

if (elements.loginLink) elements.loginLink.onclick = (e) => { e.preventDefault(); showView('log'); };
if (elements.registerLink) elements.registerLink.onclick = (e) => { e.preventDefault(); showView('reg'); };

// --- INSCRIPTION  ---
if (elements.regForm) {
    elements.regForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        try {
            // 1. Génération d'un ID unique côté client
            const newUserId = crypto.randomUUID(); 

            // 2. Insertion avec l'ID inclus
                const { error } = await supabase
                    .from('users')
                    .upsert([{ 
                        id: newUserId, 
                        name: name, 
                        email: email 
                    }], { onConflict: 'email' }); // Si l'email existe déjà, il met à jour au lieu de créer un doublon

            if (error) throw error;

            alert("Inscription réussie ! Connectez-vous.");
            showView('log');
        } catch (err) {
            alert("Erreur : " + err.message);
        }
    };
}


// --- CONNEXION ---
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
            if (!user) throw new Error("Utilisateur non trouvé.");

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
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        if (elements.dbStatus) elements.dbStatus.className = "status-online";
        if (elements.statusText) elements.statusText.innerText = "Connecté à EuroShared";
    } catch (err) {
        if (elements.dbStatus) elements.dbStatus.className = "status-offline";
        if (elements.statusText) elements.statusText.innerText = "Serveur déconnecté";
    }
}

document.addEventListener('DOMContentLoaded', initApp);


// --- 1. FONCTION VISIBILITÉ DU MOT DE PASSE ---
window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    if (input.type === "password") {
        input.type = "text";
        icon.innerText = "🔒";
    } else {
        input.type = "password";
        icon.innerText = "👁️";
    }
};

// --- 2. INSCRIPTION AVEC VÉRIFICATION D'EMAIL ---
if (elements.regForm) {
    elements.regForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Utilisation de Supabase Auth pour l'inscription
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: name } // Sauvegarde le nom
                }
            });

            if (error) throw error;

            // Si l'inscription réussit, Supabase envoie l'email automatiquement
            alert("✅ Inscription réussie ! Un email de confirmation a été envoyé à " + email + ". Merci de valider votre compte avant de vous connecter.");
            showView('log');
        } catch (err) {
            alert("❌ Erreur d'inscription : " + err.message);
        }
    };
}

// --- 3. CONNEXION SÉCURISÉE ---
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

            // Vérification si l'email a été confirmé
            if (data.user && data.user.confirmed_at === null && data.user.email_confirmed_at === undefined) {
                alert("⚠️ Veuillez confirmer votre adresse email avant d'accéder aux offres.");
                return;
            }

            // Stockage de la session et chargement TimeWall
            localStorage.setItem('euroshared_userid', data.user.id);
            loadTimeWall(data.user.id);
        } catch (err) {
            alert("❌ Erreur de connexion : " + err.message);
        }
    };
}

