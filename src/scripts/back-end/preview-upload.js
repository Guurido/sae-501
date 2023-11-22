const listUploadFileInput = document.querySelectorAll("[data-upload-file]")

const previewUpload = (e) => {
    const element = e.currentTarget
    const file = element.files[0]
    const uploadName = element.dataset.uploadFile

    const imgRelated = document.querySelector(`[data-preview-upload="${uploadName}"]`)
    if(file && imgRelated) {
        imgRelated.src = URL.createObjectURL(file)
    }
}

listUploadFileInput.forEach((item) => {
    item.addEventListener("change", previewUpload)
})