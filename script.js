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
}

// 4. FONCTION POUR GAGNER (MISE À JOUR DU SOLDE)
async function simulerGain() {
    const soldeEl = document.getElementById('solde');
    const statusEl = document.getElementById('status');
    
    // Récupération sécurisée du solde actuel
    let soldeActuel = parseInt(soldeEl.innerText);
    if (isNaN(soldeActuel)) { soldeActuel = 0; }

    let nouveauSolde = soldeActuel + 10;
    statusEl.innerText = "⏳ Mise à jour du solde sur Supabase...";

    const { error } = await supabaseClient
        .from('utlisateursEuroshared')
        .update({ solde: nouveauSolde })
        .eq('email', emailActuel);

    if (error) {
        console.error("Erreur:", error);
        statusEl.innerText = "❌ Échec de l'enregistrement";
    } else {
        statusEl.innerText = "💰 +10 MGA enregistrés !";
        soldeEl.innerText = nouveauSolde; // Mise à jour visuelle
    }
}

// 5. ÉCOUTEURS D'ÉVÉNEMENTS
document.addEventListener('DOMContentLoaded', () => {
    // Bouton Inscription
    const btnReg = document.getElementById('btn-register');
    if(btnReg) btnReg.addEventListener('click', inscrireUtilisateur);

    // Bouton Gagner
    const btnGagner = document.getElementById('btn-gagner');
    if(btnGagner) btnGagner.addEventListener('click', simulerGain);
});
