// fonction de test de securite
function onVerify(token) {
    document.getElementById("status-text").innerText = "Vérification réussie ! Redirection...";
    document.getElementById("status-text").style.color = "green";

    setTimeout(function() {
        window.location.href = "./accueil.html";
    }, 1500);
}



// --- 1. GESTION DES COOKIES ---
document.addEventListener("DOMContentLoaded", function() {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("accept-cookies");

    if (!localStorage.getItem("cookiesAccepte")) {
        setTimeout(() => {
            cookieBanner.classList.add("show");
        }, 1000); 
    }

    acceptBtn.addEventListener("click", function() {
        localStorage.setItem("cookiesAccepte", "true");
        cookieBanner.classList.remove("show");
    });
});


// code menu humberger
document.addEventListener('DOMContentLoaded', () => {
    const burgerBtn = document.getElementById('burgerBtn');
    const navLinks = document.getElementById('navLinks');

    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
});


// sript pour le message chat
document.addEventListener('DOMContentLoaded', () => {
    const chatBtn = document.getElementById('chatBtn');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    chatBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
    });
    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });
});




