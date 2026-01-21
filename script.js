
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
        // Cacher le champ de saisie
        document.getElementById('userEmail').style.display = 'none';
        document.getElementById('btnValider').style.display = 'none';
        
        // Configurer les liens directs
        document.getElementById('linkSurveys').href = `https://timewall.io/users/login?oid=9c481747da9d5015&uid=${email}`;
        document.getElementById('linkClicks').href = `https://timewall.io/users/login?oid=9c481747da9d5015&uid=${email}&tab=clicks`;
        document.getElementById('linkTasks').href = `https://timewall.io/users/login?oid=9c481747da9d5015&uid=${email}&tab=tasks`;
        document.getElementById('linkGames').href = `https://timewall.io/users/login?oid=9c481747da9d5015&uid=${email}&tab=games`;
        document.getElementById('linkBuypoints').href = `https://timewall.io/users/login?oid=9c481747da9d5015&uid=${email}&tab=buypoints`;
        

        // Afficher le menu
        document.getElementById('displayEmail').innerText = email;
        document.getElementById('menuTravail').style.display = 'flex';
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
