const SUPABASE_URL = "https://qhxwbjzmdpzvgmmwxclj.supabase.co";
const SUPABASE_KEY = "sb_publishable_XIgeAxAVCpq0Qv161ZQwEw_fJggWr-F";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const OID = "9c481747da9d5015";

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Récupérer la session active
    const { data: { session } } = await supabaseClient.auth.getSession();

    // Si pas de session, retour immédiat à l'accueil
    if (!session) {
        window.location.href = "index.html";
        return;
    }

    const email = session.user.email;
    document.getElementById('displayEmail').innerText = email;
    document.getElementById('status').innerText = "✅ Liens de gains générés";

    // 2. Génération automatique des URLs avec votre OID
    const baseUrl = `https://timewall.io{OID}&uid=${encodeURIComponent(email)}`;
    
    document.getElementById('linkSurveys').href = baseUrl;
    document.getElementById('linkClicks').href = `${baseUrl}&tab=clicks`;
    document.getElementById('linkTasks').href = `${baseUrl}&tab=tasks`;
    document.getElementById('linkGames').href = `${baseUrl}&tab=games`;
});
