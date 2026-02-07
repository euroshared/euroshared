document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. INITIALISATION DES ÉLÉMENTS FIXES ---
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("accept-cookies");
    const burgerBtn = document.getElementById('burgerBtn');
    const navLinks = document.getElementById('navLinks');
    const chatWindow = document.getElementById('chatWindow');
    const dateEl = document.querySelector('.current-date');

    // --- 2. LOGIQUE AUTOMATIQUE ---
    if (cookieBanner && !localStorage.getItem("cookiesAccepte")) {
        setTimeout(() => cookieBanner.classList.add("show"), 1000);
    }

    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('fr-FR', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    // --- 3. GESTIONNAIRE DE CLICS UNIQUE (Délégation) ---
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Bouton Cookies
        if (target === acceptBtn) {
            localStorage.setItem("cookiesAccepte", "true");
            cookieBanner.classList.remove("show");
        }

        // Menu Hamburger
        if (target.closest('#burgerBtn')) {
            burgerBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        }

        // Fermeture menu au clic sur un lien
        if (target.closest('.nav-links a')) {
            burgerBtn.classList.remove('active');
            navLinks.classList.remove('active');
        }

        // Chat
        if (target.closest('#chatBtn')) chatWindow.classList.toggle('active');
        if (target.closest('#closeChat')) chatWindow.classList.remove('active');

        // --- SECTION PARTAGE ET CARTE ---
        const currentCard = target.closest('.card');

        // A. Ouverture/Fermeture de la modale de partage
        const shareTrigger = target.closest('.share-trigger');
        if (shareTrigger && currentCard) {
            e.stopPropagation();
            const modal = currentCard.querySelector('.share-modal');
            document.querySelectorAll('.share-modal.active').forEach(m => {
                if (m !== modal) m.classList.remove('active');
            });
            modal.classList.toggle('active');
        }

        // B. Actions à l'intérieur de la modale (Facebook, Telegram, Copie)
        if (currentCard) {
            // On récupère le lien d'affiliation depuis le bouton "Accéder au site"
            const urlToShare = currentCard.querySelector('.btn_consult').href;

            // Partage Facebook
            const fbBtn = target.closest('.icon.fb');
            if (fbBtn) {
                e.preventDefault();
                console.log("Partage Facebook pour :", urlToShare);
                const quote = encodeURIComponent("Découvert sur EuroShared - Offerwall et affiliation");
                const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}&quote=${quote}`;
                window.open(fbShareUrl);
            }

            // Partage Telegram
            const tgBtn = target.closest('.icon.tg');
            if (tgBtn) {
                e.preventDefault();
                console.log("Partage Telegram pour :", urlToShare);
                const quote = encodeURIComponent("Découvert sur EuroShared - Offerwall et affiliation");
                const tgShareUrl = `https://t.me/sharer/sharer.php?url=${encodeURIComponent(urlToShare)}&quote=${quote}`;
                window.open(tgShareUrl, '_blank');
            }

            // Copier le lien
            const copyBtn = target.closest('.copy-link');
            if (copyBtn) {
                console.log("Lien copié :", urlToShare);
                navigator.clipboard.writeText(urlToShare).then(() => {
                    const originalText = copyBtn.innerText;
                    copyBtn.innerText = "Lien copié !";
                    setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
                });
            }
        }

        // C. Fermeture des modales au clic extérieur
        if (!target.closest('.share-modal') && !target.closest('.share-trigger')) {
            document.querySelectorAll('.share-modal.active').forEach(m => m.classList.remove('active'));
        }
    });
});

const dot = document.getElementById('connect-checker-dot');
const label = document.getElementById('connect-checker-label');

function updateStatus() {
  if (navigator.onLine) {
    dot.classList.add('online');
    label.textContent = "Connecté";
    label.style.color = "#2ecc71";
  } else {
    dot.classList.remove('online');
    label.textContent = "Hors ligne";
    label.style.color = "#e74c3c"; // Rouge pour l'erreur
  }
}

// Vérification immédiate au chargement
window.addEventListener('load', updateStatus);

// Écoute les changements sans recharger la page
window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);
