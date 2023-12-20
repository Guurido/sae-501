import {DateTime} from "luxon";

const listContainer = document.querySelector("[data-list]")
const tplListItemRaw = document.querySelector("[data-tpl='list-item']")

const articleId = "655fe155c5bb1e62ce77f0f9"
const commentsApiUrl = 'http://192.168.0.147:9000/api/articles/${articleId}/comments'



const getComments = async () => {
    const res = await fetch(commentsApiUrl);
    const resJon = await res.json()

    for (const comment of resJson.list_comments) {
        const tpl = tplListItemRaw.content.cloneNode(true)
        tpl.querySelector("p.titre").textContent = comment.content
        tpl.querySelector("P.paragraphe").textContent = luxon.DateTime.fromISO(comment.created_at).toFormat("dd/LL/yyyy")

    }
    listContainer.append(tpl)
}

getComments()

// On récupère le template et on clone son contenu