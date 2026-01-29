import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

// 1. CONFIGURATION & CONNEXION (Point de départ stable)
const SUPABASE_URL = "https://jexaklhwoiaufzshzlcg.supabase.co";
const SUPABASE_KEY = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const elements = {
    regCont: document.getElementById('register-container'),
    logCont: document.getElementById('login-container'),
    twCont: document.getElementById('timewall-container'),
    confStep: document.getElementById('confirmation-step'),
    forgotCont: document.getElementById('forgot-password-container'),
    iframe: document.getElementById('timewall-iframe'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    statusServer: document.getElementById('status-server'),
    serverDot: document.getElementById('server-dot'),
    userEmail: document.getElementById('user-email-display'),
    userBalance: document.getElementById('user-balance')
};

let authenticatedUserId = null;

// 2. TA MÉTHODE : CONFIGURATION DYNAMIQUE DES OFFRES
const wallConfigs = {
    timewall: (uid) => `https://timewall.io{uid}&tab=tasks`,
    timewall: (uid) =>  `https://timewall.io/users/login?oid=9c481747da9d5015&uid=${uid}&tab=tasks`;
    monlix: (uid) => `https://offers.monlix.com{uid}`,
    lootably: (uid) => `https://wall.lootably.com{uid}`
};

// 3. TA MÉTHODE : FONCTION UNIQUE DE NAVIGATION DANS L'IFRAME
function switchOfferwall(providerName) {
    if (!authenticatedUserId) {
        alert("Erreur : Vous devez être connecté pour travailler.");
        return;
    }
    const getUrl = wallConfigs[providerName];
    if (getUrl) {
        elements.iframe.src = getUrl(authenticatedUserId);
        showView('tw');
        console.log(`Travail lancé sur : ${providerName}`);
    }
}

// 4. NAVIGATION GÉNÉRALE (PRÉSERVÉE)
function showView(view) {
    const views = [elements.regCont, elements.logCont, elements.twCont, elements.confStep, elements.forgotCont];
    views.forEach(c => { if(c) c.style.display = 'none'; });
    if(view === 'reg') elements.regCont.style.display = 'block';
    if(view === 'log') elements.logCont.style.display = 'block';
    if(view === 'tw') elements.twCont.style.display = 'flex';
    if(view === 'conf') elements.confStep.style.display = 'block';
    if(view === 'forgot') elements.forgotCont.style.display = 'block';
}

// 5. INITIALISATION & DOUBLE CONFIRMATION (SYSTÈME + SESSION)
async function initApp() {
    // A. Confirmation Serveur (Lien Bleu)
    try {
        const { error: netError } = await supabase.from('users').select('id').limit(1);
        if (!netError) {
            elements.statusServer.innerText = "Liaison sécurisée établie";
            elements.statusServer.style.color = "#00d1ff";
            elements.serverDot.style.backgroundColor = "#00d1ff";
        }
    } catch (e) {}

    // B. Confirmation Session (Lien Vert)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        authenticatedUserId = session.user.id;
        elements.userEmail.innerText = session.user.email;
        elements.statusText.innerText = "EuroShared Connecté";
        if(document.getElementById('db-status')) document.getElementById('db-status').classList.add('status-online');
        await loadUserGains();
        showView('conf');
    } else {
        elements.statusText.innerText = "En attente de connexion";
        if(document.getElementById('db-status')) document.getElementById('db-status').classList.remove('status-online');
        showView('reg');
    }
}
// --- CHARGEMENT DU SOLDE AVEC COMMISSION DE 20% (0.2$ pour 1$) ---
async function loadUserGains() {
    if (!authenticatedUserId) return;

    const { data: postbacks, error } = await supabase
        .from('timewall_postbacks')
        .select('amount, provider, created_at')
        .eq('user_id', authenticatedUserId);

    if (error) {
        console.error("Erreur de récupération :", error.message);
        return;
    }

    if (postbacks) {
        // CALCUL DU SOLDE NET (Ce que l'utilisateur voit après ta part de 20%)
        const totalNet = postbacks.reduce((sum, item) => {
            const montantBrut = Number(item.amount);
            const partUtilisateur = montantBrut * 0.8; // On lui laisse 80%, tu gardes 20%
            return sum + partUtilisateur;
        }, 0);

        // AFFICHAGE DANS TON HTML
        if(elements.userBalance) {
            elements.userBalance.innerText = totalNet.toFixed(2) + " $";
        }

        // MISE À JOUR DE L'HISTORIQUE (Optionnel)
        if(elements.gainsHistory) {
            elements.gainsHistory.innerHTML = postbacks.slice(0, 5).map(g => `
                <div class="gain-item">
                    ✅ +${(Number(g.amount) * 0.8).toFixed(2)} $ [${g.provider}]
                </div>
            `).join('');
        }
    }
}



// 7. ACTIONS AUTHENTIFICATION (PRÉSERVÉES : INSCRIPTION / CONNEXION / RÉCUPÉRATION)
document.getElementById('register-form').onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    });
    if (error) alert(error.message); else alert("Vérifiez vos emails !");
};

document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('email-login').value,
        password: document.getElementById('password-login').value
    });
    if (error) alert(error.message); else location.reload();
};

document.getElementById('send-recovery-btn').onclick = async () => {
    const email = document.getElementById('email-recovery-confirm').value;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert(error.message); else { alert("Lien envoyé !"); showView('log'); }
};

// 8. TA MÉTHODE : ÉCOUTEURS DYNAMIQUES POUR LES BOUTONS DE TRAVAIL
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('ow-btn')) {
        const provider = e.target.getAttribute('data-name');
        switchOfferwall(provider);
    }
});

// 9. FONCTIONNALITÉS UI D'ORIGINE (OEIL & GOOGLE - PRÉSERVÉES)
document.addEventListener('DOMContentLoaded', () => {
    // Gestion de l'oeil (Masquer/Afficher)
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.onclick = function() {
            const input = document.getElementById(this.getAttribute('data-target'));
            if (input) {
                input.type = (input.type === 'password') ? 'text' : 'password';
                this.textContent = (input.type === 'password') ? '👁️' : '🙈';
            }
        };
    });

    // Bouton Google
    const btnGoogle = document.getElementById('btn-google');
    if (btnGoogle) btnGoogle.onclick = () => window.open('https://www.google.com', '_blank');
});

// 10. NAVIGATION ENTRE LES VUES (PRÉSERVÉE)
document.getElementById('to-login').onclick = () => showView('log');
document.getElementById('to-register').onclick = () => showView('reg');
document.getElementById('forgot-password').onclick = () => showView('forgot');
document.getElementById('back-to-login').onclick = () => showView('log');
document.getElementById('back-to-dash').onclick = () => showView('conf');

// 11. DÉCONNEXION (PRÉSERVÉE)
const logout = async () => { await supabase.auth.signOut(); location.reload(); };
document.getElementById('logout-button').onclick = logout;
document.getElementById('cancel-auth').onclick = logout;

// DÉMARRAGE
document.addEventListener('DOMContentLoaded', initApp);
