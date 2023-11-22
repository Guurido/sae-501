const form = document.querySelector("[data-form]")

form.addEventListener("reset", (e) => {
    const listImgs = e.target.querySelectorAll("[data-original-image]")
    listImgs.forEach((item) => {
        const originalImage = item.dataset.originalImage
        item.src = originalImage
    })    
})