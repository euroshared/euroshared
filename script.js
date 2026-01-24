// 1. CONFIGURATION
const SUPABASE_URL = "https://qhxwbjzmdpzvgmmwxclj.supabase.co";
const SUPABASE_KEY = "sb_publishable_XIgeAxAVCpq0Qv161ZQwEw_fJggWr-F";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variable globale pour suivre l'utilisateur actuel
let emailActuel = "";

// 2. FONCTION D'INSCRIPTION / CONNEXION
async function inscrireUtilisateur() {
    const usernameInput = document.getElementById('reg-username').value;
    const emailInput = document.getElementById('reg-email').value;
    const statusEl = document.getElementById('status');

    if (!usernameInput || !emailInput) {
        alert("Veuillez remplir le nom et l'email !");
        return;
    }

    statusEl.innerText = "⏳ Vérification/Inscription...";

    // .upsert ajoute si l'email n'existe pas, ou met à jour s'il existe
    const { data, error } = await supabaseClient
        .from('utlisateursEuroshared')
        .upsert({ username: usernameInput, email: emailInput }, { onConflict: 'email' })
        .select()
        .maybeSingle();

    if (error) {
        console.error("Erreur:", error);
        statusEl.innerText = "❌ Erreur : " + error.message;
    } else if (data) {
        emailActuel = data.email;
        localStorage.setItem('euroshared_email', data.email); // Sauvegarde l'email
        localStorage.setItem('euroshared_username', data.username); // Sauvegarde le nom

        afficherDashboard(data);
    }
}

// 3. FONCTION POUR AFFICHER LE TABLEAU DE BORD
function afficherDashboard(user) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    document.getElementById('username').innerText = user.username;
    // Si le solde est null (nouveau compte), on affiche 0
    document.getElementById('solde').innerText = user.solde !== null ? user.solde : 0;
    document.getElementById('status').innerText = "✅ Bienvenue " + user.username;

    // CHARGEMENT AUTOMATIQUE DE L'HISTORIQUE À LA CONNEXION
    chargerHistorique();
}

// 4. FONCTION POUR GAGNER (MISE À JOUR DU SOLDE)
async function simulerGain() {
    const soldeEl = document.getElementById('solde');
    const statusEl = document.getElementById('status');
    
    let soldeActuel = parseInt(soldeEl.innerText);
    if (isNaN(soldeActuel)) { soldeActuel = 0; }
    
    let gain = 10;
    let nouveauSolde = soldeActuel + gain;

    statusEl.innerText = "⏳ Enregistrement du gain...";

    // ÉTAPE A : Mettre à jour le solde dans la table principale
    const { error: errorUpdate } = await supabaseClient
        .from('utlisateursEuroshared')
        .update({ solde: nouveauSolde })
        .eq('email', emailActuel);

    // ÉTAPE B : Ajouter une ligne dans l'historique (transactions)
    const { error: errorHistory } = await supabaseClient
        .from('transactions')
        .insert([
            { 
                user_email: emailActuel, 
                type: 'gain', 
                description: 'Gain manuel (Simulation)', 
                montant: gain 
            }
        ]);

    if (errorUpdate || errorHistory) {
        console.error("Détails erreur:", errorUpdate || errorHistory);
        statusEl.innerText = "❌ Erreur lors de l'enregistrement";
    } else {
        soldeEl.innerText = nouveauSolde;
        statusEl.innerText = "💰 Gain enregistré et historique mis à jour !";
        // RECHARGER L'AFFICHAGE DE L'HISTORIQUE APRÈS LE GAIN
        chargerHistorique(); 
    }
}

// 5. FONCTION POUR CHARGER ET AFFICHER L'HISTORIQUE
async function chargerHistorique() {
    const listeEl = document.getElementById('liste-transactions');
    if (!listeEl) return;

    const { data, error } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('user_email', emailActuel)
        .order('created_at', { ascending: false }) // Les plus récents en premier
        .limit(5); // On n'affiche que les 5 derniers

    if (error) {
        console.error("Erreur chargement historique:", error);
        return;
    }

    listeEl.innerHTML = ""; // On vide la liste avant de la remplir

    if (data && data.length > 0) {
        data.forEach(trans => {
            const li = document.createElement('li');
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.padding = "8px 0";
            li.style.borderBottom = "1px solid #f0f0f0";
            
            li.innerHTML = `
                <span>✅ ${trans.description}</span>
                <span style="color: #2e7d32; font-weight: bold;">+${trans.montant} MGA</span>
            `;
            listeEl.appendChild(li);
        });
    } else {
        listeEl.innerHTML = "<li style='color: #999; font-style: italic; text-align: center; padding: 10px;'>Aucune activité pour le moment</li>";
    }
}

// 6. ÉCOUTEURS D'ÉVÉNEMENTS
document.addEventListener('DOMContentLoaded', () => {
    // Bouton Inscription
    const btnReg = document.getElementById('btn-register');
    if(btnReg) btnReg.addEventListener('click', inscrireUtilisateur);

    // Bouton Gagner
    const btnGagner = document.getElementById('btn-gagner');
    if(btnGagner) btnGagner.addEventListener('click', simulerGain);

    // Bouton Actualiser (Optionnel selon votre HTML)
    const btnRefresh = document.getElementById('btn-refresh');
    if(btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            chargerHistorique();
            statusEl.innerText = "🔄 Historique actualisé";
        });
    }
});
