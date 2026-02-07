import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

// Configuration Supabase
const supabase = createClient("https://jexaklhwoiaufzshzlcg.supabase.co", "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz");

// Éléments du DOM
const getEl = (id) => document.getElementById(id);
const elements = {
    regCont: getEl('register-container'),
    logCont: getEl('login-container'),
    twCont: getEl('timewall-container'),
    confStep: getEl('confirmation-step'),
    forgotCont: getEl('forgot-password-container'),
    newPwdCont: getEl('new-password-container'),
    iframe: getEl('timewall-iframe'),
    statusText: getEl('status-text'),
    userEmail: getEl('user-email-display'),
    dbStatus: getEl('db-status'),
    withdrawSection: getEl('withdraw-section'),
    withdrawMsg: getEl('withdraw-msg')
};

let authenticatedUserId = null;

// Gestion de l'affichage
function showView(view) {
    const views = [elements.regCont, elements.logCont, elements.twCont, elements.confStep, elements.forgotCont, elements.newPwdCont];
    views.forEach(v => { if(v) v.style.display = 'none'; });
    if(view === 'reg' && elements.regCont) elements.regCont.style.display = 'block';
    if(view === 'log' && elements.logCont) elements.logCont.style.display = 'block';
    if(view === 'tw' && elements.twCont) elements.twCont.style.display = 'flex';
    if(view === 'conf' && elements.confStep) elements.confStep.style.display = 'block';
    if(view === 'forgot' && elements.forgotCont) elements.forgotCont.style.display = 'block';
}

function updateStatus(isOnline) {
    if (elements.dbStatus) {
        isOnline ? elements.dbStatus.classList.add('status-online') : elements.dbStatus.classList.remove('status-online');
    }
    if (elements.statusText) {
        elements.statusText.innerText = isOnline ? "Utilisateur Connecté" : "En attente de connexion";
    }
}
// Diagnostic de liaison (Point Vert)
async function checkSupabaseLink() {
    const dot = document.getElementById('status-dot');
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (dot) dot.style.backgroundColor = "green";
        if (elements.statusText) {
            elements.statusText.innerText = session ? "Utilisateur Connecté" : "Site Connecté (Prêt)";
        }
    } catch (e) {
        if (dot) dot.style.backgroundColor = "red";
    }
}

// --- FONCTION HISTORIQUE DES GAINS ---
async function displayUserHistory() {
    if (!authenticatedUserId) return;
    const historyList = document.getElementById('history-list');

    try {
        const [twRes, otherRes] = await Promise.all([
            supabase.from('timewall_postbacks').select('amount, created_at').eq('user_id', authenticatedUserId).order('created_at', { ascending: false }).limit(5),
            supabase.from('other_offerwalls_postbacks').select('amount, offerwall_name, created_at').eq('user_id', authenticatedUserId).order('created_at', { ascending: false }).limit(5)
        ]);

        let fullHistory = [
            ...(twRes.data || []).map(item => ({ ...item, source: 'TimeWall' })),
            ...(otherRes.data || []).map(item => ({ ...item, source: item.offerwall_name }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

        if (historyList) {
            historyList.innerHTML = fullHistory.length > 0 
                ? fullHistory.map(item => `
                    <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #eee; font-size:0.85rem;">
                        <span><strong>+${parseFloat(item.amount).toFixed(2)}</strong> (${item.source})</span>
                        <span style="color:#888;">${new Date(item.created_at).toLocaleDateString()}</span>
                    </div>`).join('')
                : '<p style="font-size:0.8rem; color:#999; text-align:center;">Aucune activité récente.</p>';
        }
    } catch (err) {
        console.error("Erreur historique:", err);
        if (historyList) historyList.innerText = "Erreur de chargement.";
    }
}

// Initialisation de l'application
async function initApp() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        authenticatedUserId = session.user.id;
        if(elements.userEmail) elements.userEmail.innerText = session.user.email;
        
              try {
            const { data } = await supabase.from('global_user_balance').select('total_points').eq('user_id', authenticatedUserId).single();
            const balanceEl = document.getElementById('balance-value');
            if (balanceEl) {
                const points = data ? data.total_points : 0;
                
                // --- LA CONVERSION MAGIQUE ---
                const conversionRate = 1000; // 1000 pts = 1$
                const dollars = (points / conversionRate).toFixed(2); 
                
                // On affiche les deux pour que l'utilisateur comprenne
                balanceEl.innerText = `${parseFloat(points).toFixed(2)} Points (~${dollars} $)`;
            }
        } catch (err) { 
            console.error("Erreur solde:", err); 
        }

        // Détecter si l'utilisateur revient d'un email de récupération
    supabase.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    showView('forgot'); // Ou une vue spécifique 'new-password'
        // On cache la demande d'email et on montre la saisie du nouveau MDP
    document.getElementById('step-request-email').style.display = 'none';
    document.getElementById('step-new-password').style.display = 'block';
    alert("Vous pouvez maintenant choisir un nouveau mot de passe.");
  }
});

        // APPEL DE L'HISTORIQUE ICI
        displayUserHistory();

        showView('conf');
        updateStatus(true);
          checkSupabaseLink()
    } else {
        showView('reg');
        updateStatus(false);
          checkSupabaseLink();
    }
}

// --- LOGIQUE D'INSCRIPTION / CONNEXION ---
if (getEl('register-form')) {
    getEl('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signUp({
            email: getEl('email').value,
            password: getEl('password').value,
            options: {
                emailRedirectTo: "https://euroshared.github.io/euroshared/",
                data: { full_name: getEl('name').value }
            }
        });
        if (error) alert("Erreur : " + error.message);
        else alert("Vérifiez vos emails !");
    });
}

if (getEl('login-form')) {
    getEl('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({
            email: getEl('email-login').value,
            password: getEl('password-login').value
        });
        if (error) alert(error.message);
        else window.location.reload();
    });
}

// --- GESTIONNAIRE D'OFFERWALLS ---
document.querySelectorAll('.wall-btn').forEach(btn => {
    btn.onclick = () => {
        if (!authenticatedUserId) return alert("Veuillez vous connecter.");
        let finalUrl = btn.getAttribute('data-url').replace(/[`"']/g, "").replace("${authenticatedUserId}", authenticatedUserId);
        if(elements.iframe) { elements.iframe.src = finalUrl; showView('tw'); }
    };
});

// --- NAVIGATION & ACTIONS ---
const actions = {
    'to-login': () => showView('log'),
    'to-register': () => showView('reg'),
    'forgot-password': () => showView('forgot'),
    'back-to-login': () => showView('log'),
    'back-to-dash': () => showView('conf'),
    'cancel-auth': async () => { await supabase.auth.signOut(); location.reload(); },
    'logout-button': async () => { await supabase.auth.signOut(); location.reload(); }
};

Object.entries(actions).forEach(([id, func]) => {
    const el = getEl(id);
    if(el) el.onclick = (e) => { e.preventDefault(); func(); };
});

// --- LOGIQUE RÉCUPÉRATION MOT DE PASSE (À INSÉRER ICI) ---
const sendRecoveryBtn = getEl('send-recovery-btn');
if (sendRecoveryBtn) {
    sendRecoveryBtn.onclick = async () => {
        const emailInput = getEl('email-recovery-confirm');
        const email = emailInput ? emailInput.value : '';

        if (!email) {
            alert("Veuillez entrer votre adresse email.");
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://euroshared.github.io/euroshared', 
        });

        if (error) {
            alert("Erreur : " + error.message);
        } else {
            alert("📩 Un lien de récupération a été envoyé à votre adresse email !");
            showView('log'); // Retour à la vue connexion
        }
    };
}
// --- ENREGISTRER LE NOUVEAU MOT DE PASSE ---
// À placer dans ton écouteur de clics global ou après le bouton d'envoi
const saveNewPwdBtn = getEl('save-new-password-btn'); // Assure-toi d'avoir cet ID sur ton bouton
if (saveNewPwdBtn) {
    saveNewPwdBtn.onclick = async () => {
        const newPassword = getEl('new-password-input').value; // ID de ton input
        
        if (!newPassword || newPassword.length < 6) {
            return alert("Le mot de passe doit faire au moins 6 caractères.");
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            alert("Erreur : " + error.message);
        } else {
            alert("✅ Mot de passe mis à jour avec succès !");
            showView('log'); // On le renvoie vers la connexion
        }
    };
}


// --- GESTION DU RETRAIT (CORRIGÉ AVEC CONVERSION $) ---
if (getEl('withdraw-trigger')) {
    getEl('withdraw-trigger').onclick = () => {
        if(elements.withdrawSection) elements.withdrawSection.style.display = elements.withdrawSection.style.display === 'none' ? 'block' : 'none';
    };
}

if (getEl('confirm-withdrawal')) {
    getEl('confirm-withdrawal').onclick = async () => {
        // 1. L'utilisateur saisit des Dollars (ex: 0.60)
        const amountUSD = parseFloat(getEl('withdraw-amount').value);
        const method = getEl('payout-method').value;
        const address = getEl('payout-address').value;
        
        if (!amountUSD || !address || amountUSD <= 0) return alert("Données invalides.");

        // 2. CONVERSION : On transforme les $ en Points pour le SQL (0.60 * 1000 = 600)
        const pointsToWithdraw = amountUSD * 1000;

        // 3. VERIFICATION LOCALE (Optionnel mais recommandé)
        if (pointsToWithdraw < 600) {
            elements.withdrawMsg.style.color = "red";
            elements.withdrawMsg.innerText = "❌ Minimum de retrait : 0.60 $ (600 pts)";
            return;
        }

        // 4. ENVOI : On envoie 'pointsToWithdraw' au lieu de 'amount'
        const { error } = await supabase.from('withdrawals').insert([
            { 
                user_id: authenticatedUserId, 
                amount: pointsToWithdraw, // Envoie 600
                method: method, 
                address: address 
            }
        ]);

        if (error) {
            elements.withdrawMsg.style.color = "red";
            // Affiche l'erreur du SQL si le solde est insuffisant
            elements.withdrawMsg.innerText = "❌ " + error.message;
        } else {
            elements.withdrawMsg.style.color = "green";
            elements.withdrawMsg.innerText = "🚀 Succès ! Demande de " + amountUSD + "$ envoyée.";
            
            setTimeout(() => { 
                initApp(); 
                elements.withdrawSection.style.display = 'none';
                getEl('withdraw-amount').value = ""; // Vide le champ
                getEl('payout-address').value = ""; // Vide le champ
                elements.withdrawMsg.innerText = "";
            }, 2500);
        }
    };
}


// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
