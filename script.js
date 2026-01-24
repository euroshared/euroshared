// 1. CONFIGURATION
const SUPABASE_URL = "https://qhxwbjzmdpzvgmmwxclj.supabase.co";
const SUPABASE_KEY = "sb_publishable_XIgeAxAVCpq0Qv161ZQwEw_fJggWr-F";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let emailActuel = "";

// 2. INSCRIPTION & CONNEXION
async function inscrireUtilisateur() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const username = document.getElementById('reg-username').value;
    const statusEl = document.getElementById('status');

    if (!email || !password || !username) return alert("Veuillez remplir tous les champs !");

    statusEl.innerText = "⏳ Vérification de l'existence du compte...";

    // A. Vérifier si l'email existe déjà dans votre table publique
    const { data: userExists } = await supabaseClient
        .from('utlisateursEuroshared')
        .select('email')
        .eq('email', email)
        .maybeSingle();

    if (userExists) {
        statusEl.innerText = "❌ Compte déjà existant";
        return alert("Un compte possède déjà cet email. Veuillez utiliser le bouton 'Se connecter'.");
    }

    statusEl.innerText = "⏳ Création du compte sécurisé...";

    // B. Création dans le système Auth de Supabase (Mot de passe)
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (authError) return alert("Erreur d'authentification : " + authError.message);

    // C. Création de la ligne dans votre table de données (Solde)
    const { error: dbError } = await supabaseClient
        .from('utlisateursEuroshared')
        .insert([{ email: email, username: username, solde: 0 }]);

    if (dbError) {
        console.error("Erreur DB:", dbError);
        alert("Compte créé mais erreur de profil. Contactez le support.");
    } else {
        alert("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
        // Nettoyage des champs pour la connexion
        document.getElementById('reg-username').value = "";
        statusEl.innerText = "✅ Inscription réussie. Connectez-vous !";
    }
}

async function connecterUtilisateur() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const statusEl = document.getElementById('status');

    if (!email || !password) return alert("Email et mot de passe requis !");

    statusEl.innerText = "⏳ Connexion en cours...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        statusEl.innerText = "❌ Échec de la connexion";
        alert("Erreur : " + error.message);
    } else {
        emailActuel = data.user.email;
        statusEl.innerText = "✅ Connexion réussie !";
        chargerProfilEtAfficher();
    }
}

// 3. AFFICHAGE ET DASHBOARD
async function chargerProfilEtAfficher() {
    const { data: userDB } = await supabaseClient.from('utlisateursEuroshared').select('*').eq('email', emailActuel).maybeSingle();
    if (userDB) {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('username').innerText = userDB.username;
        document.getElementById('solde').innerText = userDB.solde || 0;
        document.getElementById('status').innerText = "✅ Bienvenue " + userDB.username;
        chargerHistorique();
    }
}

// 4. LOGIQUE DES GAINS (AJOUT)
async function simulerGain() {
    const soldeEl = document.getElementById('solde');
    let soldeActuel = parseInt(soldeEl.innerText) || 0;
    let nouveauSolde = soldeActuel + 10;

    await supabaseClient.from('utlisateursEuroshared').update({ solde: nouveauSolde }).eq('email', emailActuel);
    await supabaseClient.from('transactions').insert([{ user_email: emailActuel, type: 'gain', description: 'Gain manuel', montant: 10 }]);

    soldeEl.innerText = nouveauSolde;
    chargerHistorique();
}

// 5. LOGIQUE DES RETRAITS (SOUSTRACTION) - NOUVEAU
async function effectuerRetrait() {
    const montantInput = document.getElementById('montant-retrait');
    const soldeEl = document.getElementById('solde');
    const montant = parseInt(montantInput.value);
    let soldeActuel = parseInt(soldeEl.innerText) || 0;

    if (isNaN(montant) || montant <= 0) return alert("Montant invalide");
    if (montant > soldeActuel) return alert("Solde insuffisant !");

    let nouveauSolde = soldeActuel - montant;

    const { error } = await supabaseClient.from('utlisateursEuroshared').update({ solde: nouveauSolde }).eq('email', emailActuel);
    await supabaseClient.from('transactions').insert([{ user_email: emailActuel, type: 'retrait', description: 'Demande de retrait', montant: -montant }]);

    if (!error) {
        soldeEl.innerText = nouveauSolde;
        montantInput.value = "";
        alert("Retrait réussi !");
        chargerHistorique();
    }
}

// 6. CHARGER L'HISTORIQUE (AVEC COULEURS)
async function chargerHistorique() {
    const listeEl = document.getElementById('liste-transactions');
    const { data } = await supabaseClient.from('transactions').select('*').eq('user_email', emailActuel).order('created_at', { ascending: false }).limit(5);

    listeEl.innerHTML = "";
    if (data) {
        data.forEach(t => {
            const isGain = t.montant > 0;
            const li = document.createElement('li');
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.innerHTML = `
                <span>${isGain ? '✅' : '💸'} ${t.description}</span>
                <b style="color: ${isGain ? '#2e7d32' : '#d32f2f'}">${isGain ? '+' : ''}${t.montant} MGA</b>
            `;
            listeEl.appendChild(li);
        });
    }
}

// 7. INITIALISATION
document.addEventListener('DOMContentLoaded', async () => {
    // Vérification de la session existante
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        emailActuel = session.user.email;
        chargerProfilEtAfficher();
    }

    // Liaison des boutons
    document.getElementById('btn-register').addEventListener('click', inscrireUtilisateur);
    document.getElementById('btn-login').addEventListener('click', connecterUtilisateur);
    document.getElementById('btn-gagner').addEventListener('click', simulerGain);
    document.getElementById('btn-retirer').addEventListener('click', effectuerRetrait);

    // CORRECTION ICI : Liaison du bouton déconnexion
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.onclick = deconnexion; // Utilisation de .onclick pour plus de stabilité
    }
});


// fonction deconnection
async function deconnexion() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        alert("Erreur lors de la déconnexion : " + error.message);
    } else {
        // Vide aussi la mémoire locale par sécurité
        localStorage.clear();
        // Redirige vers l'accueil
        window.location.reload();
    }
}

