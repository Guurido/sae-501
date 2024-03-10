import axios from 'axios'
const form = document.querySelector("[data-form='contact']");
 
form.addEventListener("submit",async (e)=>{
e.preventDefault();
 
const formData = new FormData(e.target);
 
const formValues = Object.fromEntries(formData);
console.log(formValues);
 
try {
    const response = await axios.post("http://localhost:3000/api/messages", formValues);
    console.log(await response);
    alert("Votre message a été envoyé avec succès.");
    e.target.reset();
  } catch (e) {
    console.error(e);
    alert("Une erreur s'est produite lors de l'envoi du message.");
  }
 
})