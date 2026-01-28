import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz"; 
const supabase = createClient(supabaseUrl, supabaseKey);

const elements = {
    regCont: document.getElementById('register-container'),
    logCont: document.getElementById('login-container'),
    twCont: document.getElementById('timewall-container'),
    confStep: document.getElementById('confirmation-step'),
    iframe: document.getElementById('timewall-iframe'),
    userEmailDisplay: document.getElementById('user-email-display'),
    confirmBtn: document.getElementById('confirm-access-btn')
};

// --- BOUTON : LANCER TIMEWALL (PILOTÉ PAR LA BASE DE DONNÉES) ---
if (elements.confirmBtn) {
    elements.confirmBtn.onclick = async () => {
        try {
            // 1. Récupérer l'utilisateur actuellement authentifié par Supabase
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Veuillez vous connecter d'abord.");

            // 2. RÉCUPÉRATION DEPUIS LA TABLE SQL (Votre exigence)
            // On va chercher l'ID unique enregistré dans votre table 'users'
            const { data: userData, error } = await supabase
                .from('users')
                .select('id')
                .eq('id', session.user.id)
                .maybeSingle();

            if (error) throw error;
            if (!userData) throw new Error("Profil utilisateur introuvable dans la base de données.");

            // 3. CONSTRUCTION DU LIEN AVEC L'ID UNIQUE SQL
            const offerWallId = "9c481747da9d5015";
            const uniqueId = userData.id; // C'est l'UUID de votre table SQL
            
            // Format EXACT de votre ancien code fonctionnel
            const timeWallUrl = `https://timewall.io/users/login?oid=${offerWallId}&uid=${userId}&tab=tasks`;

            console.log("🚀 Chargement TimeWall pour l'ID Unique SQL :", uniqueId);

            // 4. INJECTION ET AFFICHAGE
            elements.iframe.src = timeWallUrl;
            showView('tw');

        } catch (err) {
            console.error("Erreur d'accès base de données :", err.message);
            alert("Erreur : " + err.message);
        }
    };
}

// --- LOGIQUE DE CONNEXION / INSCRIPTION (SANS CHANGEMENT) ---
function showView(view) {
    const containers = [elements.regCont, elements.logCont, elements.twCont, elements.confStep];
    containers.forEach(c => { if(c) c.style.display = 'none'; });
    if (view === 'reg') elements.regCont.style.display = 'block';
    if (view === 'log') elements.logCont.style.display = 'block';
    if (view === 'tw') elements.twCont.style.display = 'flex';
    if (view === 'conf') elements.confStep.style.display = 'block';
}

document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('email-login').value,
        password: document.getElementById('password-login').value
    });
    if (error) alert(error.message);
    else if (data.user) {
        elements.userEmailDisplay.innerText = data.user.email;
        showView('conf');
    }
};

// ... Reste de votre code (Inscription, initApp, etc.)
