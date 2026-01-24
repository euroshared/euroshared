

// 1. CONFIGURATION (Vérifiée)
const SUPABASE_URL = "https://qhxwbjzmdpzvgmmwxclj.supabase.co";
// Assurez-vous que cette clé est bien la "anon public" du tableau de bord
const SUPABASE_KEY = "sb_publishable_XIgeAxAVCpq0Qv161ZQwEw_fJggWr-F";

// 2. CORRECTION CRITIQUE : Utiliser window.supabase pour éviter le conflit de nom
// Et on change le nom de la variable en 'supabaseClient' pour être 100% sûr
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Fonction pour récupérer les données
async function chargerDonnees() {
    const statusEl = document.getElementById('status');
    
    const { data, error } = await supabaseClient
        .from('utlisateursEuroshared')
        .select('username, solde')
        .eq('email', 'test@gmail.com')
        .maybeSingle();

    if (error) {
        console.error("Erreur détaillée:", error);
        statusEl.innerText = "❌ Erreur : " + error.message;
        statusEl.style.color = "red";
    } else if (data) {
        statusEl.innerText = "✅ Connecté à la base";
        statusEl.style.color = "green";
        
        document.getElementById('username').innerText = data.username || "Utilisateur";
        // FORCE LA VALEUR À 0 SI LE SOLDE EST VIDE DANS LA BASE
        document.getElementById('solde').innerText = data.solde !== null ? data.solde : 0;
    } else {
        statusEl.innerText = "⚠️ Utilisateur non trouvé";
    }
}


// Écouteurs d'événements
document.getElementById('btn-refresh').addEventListener('click', () => {
    document.getElementById('solde').innerText = "...";
    chargerDonnees();
});

window.onload = chargerDonnees;



// .......................................................

// Fonction pour ajouter 10 MGA
async function simulerGain() {
    const statusEl = document.getElementById('status');
    const soldeEl = document.getElementById('solde');
    
    // SÉCURITÉ : On récupère le texte, on remplace les erreurs par 0
    let texteActuel = soldeEl.innerText;
    let soldeActuel = parseInt(texteActuel);

    // Si soldeActuel n'est pas un nombre (NaN), on le force à 0
    if (isNaN(soldeActuel)) {
        soldeActuel = 0;
    }

    let nouveauSolde = soldeActuel + 10;

    statusEl.innerText = "⏳ Envoi du gain...";

    const { error } = await supabaseClient
        .from('utlisateursEuroshared')
        .update({ solde: nouveauSolde })
        .eq('email', 'test@gmail.com');

    if (error) {
        console.error("Erreur:", error);
        statusEl.innerText = "❌ Échec : " + error.message;
    } else {
        statusEl.innerText = "💰 Gain de 10 MGA réussi !";
        soldeEl.innerText = nouveauSolde;
    }
}


// On lie la fonction au bouton HTML
document.getElementById('btn-gagner').addEventListener('click', simulerGain);
