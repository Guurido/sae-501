import validator from "validator"
 
const form = document.querySelector("[data-form]")
 
form.addEventListener("submit", (e) => {
    // Prevent form to send data directly to back-end in order to catch form's data and use it
    e.preventDefault()
 
    const formData = new FormData(e.target)
    const formValues = Object.fromEntries(formData)
 
    if(validator.isEmpty(formValues.title)) {
        document.querySelector("[data-error-message='title']").classList.remove("hidden")
        // Display error message
        console.log("Erreur message pour titre")
        return;
    }
 
    if(validator.isEmail(formValues.title) === false) { 
        console.log("Ce n'est pas un e-mail")
        return;
    }
 
    console.log(formValues)
    e.target.submit()
})