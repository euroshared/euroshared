// 1. CONFIGURATION
const SUPABASE_URL = "https://qhxwbjzmdpzvgmmwxclj.supabase.co";
const SUPABASE_KEY = "sb_publishable_XIgeAxAVCpq0Qv161ZQwEw_fJggWr-F";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let emailActuel = "";

// 2. FONCTION INSCRIPTION (Sign Up)
async function inscrireUtilisateur() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const username = document.getElementById('reg-username').value;
    const statusEl = document.getElementById('status');

    if (!email || !password || !username) return alert("Remplissez tous les champs !");

    statusEl.innerText = "⏳ Création du compte...";

    // A. Création dans le système Auth de Supabase
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (authError) return alert("Erreur Auth : " + authError.message);

    // B. Création dans votre table utlisateursEuroshared
    const { error: dbError } = await supabaseClient
        .from('utlisateursEuroshared')
        .insert([{ email: email, username: username, solde: 0 }]);

    if (dbError) {
        alert("Erreur base de données : " + dbError.message);
    } else {
        alert("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
    }
}

// 3. FONCTION CONNEXION (Sign In)
async function connecterUtilisateur() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const statusEl = document.getElementById('status');

    statusEl.innerText = "⏳ Connexion...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Erreur : " + error.message);
    } else {
        emailActuel = data.user.email;
        // Récupérer les données de la table
        chargerProfilEtAfficher();
    }
}

// 4. CHARGER PROFIL ET HISTORIQUE
async function chargerProfilEtAfficher() {
    const { data: userDB, error } = await supabaseClient
        .from('utlisateursEuroshared')
        .select('*')
        .eq('email', emailActuel)
        .maybeSingle();

    if (userDB) {
        afficherDashboard(userDB);
        chargerHistorique();
    }
}

function afficherDashboard(user) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('username').innerText = user.username;
    document.getElementById('solde').innerText = user.solde || 0;
    document.getElementById('status').innerText = "✅ Connecté en tant que " + user.username;
}

// 5. FONCTION GAGNER (MISE À JOUR SOLDE + TRANS)
async function simulerGain() {
    const soldeEl = document.getElementById('solde');
    let soldeActuel = parseInt(soldeEl.innerText) || 0;
    let nouveauSolde = soldeActuel + 10;

    // Update Solde
    await supabaseClient.from('utlisateursEuroshared').update({ solde: nouveauSolde }).eq('email', emailActuel);
    // Add Transaction
    await supabaseClient.from('transactions').insert([{ user_email: emailActuel, type: 'gain', description: 'Gain manuel', montant: 10 }]);

    soldeEl.innerText = nouveauSolde;
    chargerHistorique();
}

async function chargerHistorique() {
    const listeEl = document.getElementById('liste-transactions');
    const { data } = await supabaseClient.from('transactions').select('*').eq('user_email', emailActuel).order('created_at', { ascending: false }).limit(5);

    listeEl.innerHTML = "";
    if (data) {
        data.forEach(t => {
            const li = document.createElement('li');
            li.innerHTML = `<span>✅ ${t.description}</span> <b>+${t.montant} MGA</b>`;
            listeEl.appendChild(li);
        });
    }
}

async function deconnexion() {
    await supabaseClient.auth.signOut();
    location.reload();
}

// 6. INITIALISATION ET MÉMOIRE (SESSION)
document.addEventListener('DOMContentLoaded', async () => {
    // Vérifie si une session existe déjà (mémoire automatique)
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        emailActuel = session.user.email;
        chargerProfilEtAfficher();
    }

    // Écouteurs
    document.getElementById('btn-register').addEventListener('click', inscrireUtilisateur);
    document.getElementById('btn-login').addEventListener('click', connecterUtilisateur);
    document.getElementById('btn-gagner').addEventListener('click', simulerGain);
    if(document.getElementById('btn-logout')) {
        document.getElementById('btn-logout').addEventListener('click', deconnexion);
    }
});
