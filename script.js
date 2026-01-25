



// script.js
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const birthdate = document.getElementById('birthdate').value;

  // Vérifier si l'utilisateur existe déjà
  const { data: existingUser, error: existingError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);

  if (existingUser.length > 0) {
    alert('Utilisateur déjà inscrit !');
    return;
  }

  // Créer un nouvel utilisateur
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, birthdate }]);

  if (error) {
    console.error(error);
  } else {
    // Rediriger vers la page de connexion
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email-login').value;

  // Vérifier si l'utilisateur existe
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);

  if (data.length === 0) {
    alert('Utilisateur non trouvé !');
    return;
  }

  // Rediriger vers la page TimeWall
  const userId = data[0].id;
  const iframe = document.getElementById('timewall-iframe');
  iframe.src = "https://timewall.io/users/login?oid=9c481747da9d5015&uid=${userId}&tab=tasks";
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('timewall-container').style.display = 'block';
});


const supabaseUrl = "https://jexaklhwoiaufzshzlcg.supabase.co";
const supabaseKey = "sb_publishable_BdPiVVAvGh1u8SZ-sHrtrg_Inesrirz";
const supabase = createClient(supabaseUrl, supabaseKey);

// Test de connexion
async function testConnexion() {
  try {
    const { data, error } = await supabase.from('timewall_postbacks').select('*');
    if (error) {
      console.error(error);
    } else {
      console.log(data);
    }
  } catch (error) {
    console.error(error);
  }
}

testConnexion();

