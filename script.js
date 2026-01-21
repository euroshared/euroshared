
    const OID = "9c481747da9d5015";

    function validerEmail() {
        const email = document.getElementById('userEmail').value;
        if (email.includes('@') && email.length > 5) {
            localStorage.setItem('tw_user_email', email);
            afficherMenu(email);
        } else {
            alert("Veuillez entrer une adresse email valide.");
        }
    }

function afficherMenu(email) {
    // 1. Gestion de l'affichage
    document.getElementById('userEmail').style.display = 'none';
    document.getElementById('btnValider').style.display = 'none';
    document.getElementById('displayEmail').innerText = email;
    document.getElementById('menuTravail').style.display = 'flex';

    // 2. Mise à jour du lien TimeWall (Sécurisé avec encodeURIComponent)
    const OID = "9c481747da9d5015";
    const linkSurveys = document.getElementById('linkSurveys');
    linkSurveys.href = `https://www.timewall.io/users/login?oid=9c481747da9d5015&uid=${encodeURIComponent(email)}`;
    

    // 3. Appel au Worker pour afficher le solde
    // REMPLACEZ BIEN l'URL ci-dessous par votre URL de Worker "get-user-balance-timewall"
    const URL_WORKER_SOLDE = "https://get-user-balance-timewall.euroshared.workers.dev/";
    const afficheur = document.getElementById('user-balance'); 

    if (afficheur) {
        fetch(`${URL_WORKER_SOLDE}?uid=${encodeURIComponent(email)}`)
            .then(response => response.json())
            .then(data => {
                // Affiche le solde du KV ou 0 par défaut
                afficheur.innerText = data.balance || "0";
            })
            .catch(err => {
                console.error("Erreur de lecture du solde", err);
                afficheur.innerText = "Non disponible";
            });
    }
}


    function reinitialiser() {
        localStorage.removeItem('tw_user_email');
        location.reload();
    }

    // Vérifier si l'utilisateur est déjà venu
    window.onload = function() {
        const savedEmail = localStorage.getItem('tw_user_email');
        if (savedEmail) {
            afficherMenu(savedEmail);
        }
    };
