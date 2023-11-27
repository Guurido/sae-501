import validator from "validator"
 
const form = document.querySelector("[data-form]")
const formName = e.target.dataset.form;
const formValues = Object.fromEntries(formData)
 
let hasErrors = false

if(formName === "sae"){
    hasErrors = SAEValidator(formValues)
} else if (formName === "article"){
    hasErrors = articleValidator(formValues)
} else if (formName === "author"){
    hasErrors = authorValidator(formValues)
}

if(!hasErrors){
    e.target.submit()
}


const SAEValidator = (formValues) => {
    let hasErrors = false

    if (validator.isEmpty(formValues.title)){
        document.querySelector("[data-error-message='title']").classList.remove("hidden")
        hasErrors = true;
    }

    return hasErrors
}

const articleValidator = (formValues) => {
    let hasErrors = false

    if (validator.isEmpty(formValues.title)){
        document.querySelector("[data-error-message='title']").classList.remove("hidden")
        hasErrors = true;
    }
    if (validator.isEmpty(formValues.author)){
        document.querySelector("[data-error-message='author']").classList.remove("hidden")
        hasErrors = true;
    }
    if (validator.isEmpty(formValues.chapo)){
        document.querySelector("[data-error-message='chapo']").classList.remove("hidden")
        hasErrors = true;
    }

    return hasErrors
}

const authorValidator = (formValues) => {
    let hasErrors = false

    if (validator.isEmpty(formValues.title)){
        document.querySelector("[data-error-message='title']").classList.remove("hidden")
        hasErrors = true;
    }

    return hasErrors
}

form.addEventListener("submit", (e) => {
    // Prevent form to send data directly to back-end in order to catch
    // form's data and use it
    e.preventDefault()
 
    const formData = new FormData(e.target)
 
    if(validator.isEmpty(formValues.title)) {
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