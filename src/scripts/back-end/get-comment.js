const getComments = async () => {
    const res = await fetch(commentsApiUrl);
    const resJon = await res.json()

    for (const comment of resJson.list_comments) {
        const tpl = tplListItemRaw.content.cloneNode(true)
        tpl.querySelector("p.titre").textContent = comment.content
        tpl.querySelector("P.titre").classList.add("hello")

        listContainer.append(tpl)
    }
}

getComments()

// On récupère le template et on clone son contenu