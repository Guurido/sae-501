import express from "express";
import path from "path";
import fs from "fs/promises";
import axios from "axios";
import querystring from "querystring";

// Models
import SAE from "#models/sae.js";

// Routers
import SAERouter from './sae.js'
import ArticleRouter from './article.js'
import AuthorRouter from './author.js'
//import JpoRouter from './jpo.js'
//import MessageRouter from './message.js'

const router = express.Router();

const parseManifest = async () => {
    if (process.env.NODE_ENV !== "production") {
        return {};
    }

    const manifestPath = path.join(
        path.resolve(),
        "dist",
        "backend.manifest.json"
    );
    const manifestFile = await fs.readFile(manifestPath);

    return JSON.parse(manifestFile);
};


router.use(async (_req, res, next) => {
    const originalRender = res.render;
    res.render = async function (view, local, callback) {
        const manifest = {
            manifest: await parseManifest(),
        };

        const args = [view, { ...local, ...manifest }, callback];
        originalRender.apply(this, args);
    };

    next();
});

router.use(SAERouter)
router.use(ArticleRouter)
router.use(AuthorRouter)
//router.use(JpoRouter)
//router.use(MessageRouter)

router.get("/", async (_req, res) => {
    const queryParams = querystring.stringify({ per_page: 5 });

    const listSAEs = await SAE.find().limit(5).sort({ _id: -1 });
    const countSAEs = await SAE.count();

    let optionsArticles = {
        method: "GET",
        url: `${res.locals.base_url}/api/articles?${queryParams}`,
    }

    const listArticles = await axios(optionsArticles);

    res.render("pages/back-end/index.njk", {
        list_saes: {
            data: listSAEs,
            count: countSAEs,
        },
        list_articles: {
            data: listArticles.data.data,
            count: listArticles.data.count,
        },
    });
});

export default router;
