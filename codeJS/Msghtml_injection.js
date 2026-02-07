     
class MsgFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- Fenêtre de Chat Flottante -->
<div id="chatContainer" class="chat-container">
    <!-- La fenêtre de message (cachée au début) -->
    <div id="chatWindow" class="chat-window">
        <div class="chat-header">
            <span>Contactez-nous</span>
            <button id="closeChat">✖</button>
        </div>
        <!-- Remplacez VOTRE_EMAIL par votre adresse réelle -->
        <form action="https://formsubmit.co/nyservices001@gmail.com" method="POST" class="chat-form">
            <input type="text" name="name" placeholder="Votre nom" required>
            <input type="email" name="email" placeholder="Votre email" required>
            <textarea name="message" placeholder="Votre message..." required></textarea>
            
            <!-- Honeypot pour éviter les spams -->
            <input type="text" name="_honey" style="display:none">
            <!-- Redirection après envoi (optionnel) -->
            <input type="hidden" name="_next" value="https://euroshared.github.io/euroshared/">
            
            <button type="submit">Envoyer le message</button>
        </form>
    </div>
    <!-- Le bouton bulle -->
    <button id="chatBtn" class="chat-btn">
        <span id="chatIcon">✉️</span>
    </button>
</div>
<!--  Fin de l'espace footer-->
<!-- Bannière de Cookies -->
 <div id="cookie-banner" class="cookie-container">
    <p>Nous utilisons des cookies pour améliorer votre expérience sur notre site.</p>
    <button id="accept-cookies" class="cookie-btn">Accepter</button>
</div>

        `;
    }
}
customElements.define('msg-footer', MsgFooter);

     
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       


  











