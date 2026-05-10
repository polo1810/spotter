// ===========================================
// SPOTTER · Configuration Supabase
// ===========================================
// SUPABASE_URL + SUPABASE_ANON_KEY : Project Settings → API
// ADMIN_EMAIL : email du compte admin créé dans Authentication → Users.
//   Le mot de passe n'est PAS stocké ici : on se connecte via login.html
//   avec ton mot de passe Supabase, et on est automatiquement redirigé sur admin.html.

window.SPOTTER_CONFIG = {
  SUPABASE_URL:      'https://cmbuevzbdtkjynfzopcd.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtYnVldnpiZHRranluZnpvcGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MjI4NTEsImV4cCI6MjA5Mzk5ODg1MX0.21QtMWqK1KJv-md1pcvXqw9igd3hVbb8MhZIdy3Jt5g',

  ADMIN_EMAIL: 'paulgirardecommerce50@gmail.com',
};
