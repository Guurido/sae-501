import express from "express";
import path from "path";
import axios from "axios";
import fs from "fs/promises";

const router = express.Router();

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

const parseManifest = async () => {
    if (process.env.NODE_ENV !== "production") {
        return {};
    }

    const manifestPath = path.join(
        path.resolve(),
        "dist",
        "frontend.manifest.json"
    );
    const manifestFile = await fs.readFile(manifestPath);

    return JSON.parse(manifestFile);
};

router.get("/", async (req, res) => {
    const queryParams = new URLSearchParams(req.query).toString();
    let options = {
        method: "GET",
        url: `${res.locals.base_url}/api/articles?${queryParams}`,
    };
    let result = null;
    try {
        result = await axios(options);
    } catch (e) {}

    res.render("pages/front-end/index.njk", {
        list_articles: result.data,
    });
});

// "(.html)?" makes ".html" optional
router.get("/a-propos(.html)?", async (_req, res) => {
    res.render("pages/front-end/a-propos.njk", {
        //list_saes: result.data,
    });
});

router.get("/lieux-de-vie(.html)?", async (_req, res) => {
    res.render("pages/front-end/lieux-de-vie.njk", {
        // list_saes: result.data,
        // Mettre contenu lieu de vie à la place de list sae
    });
});

router.get("/author(.html)?", async (_req, res) => {
    let options = {
        method: "GET",
        url: `${res.locals.base_url}/api/authors`,
    };
    let result = null;
    try {
        result = await axios(options);
    } catch (e) {}

    
    res.render("pages/front-end/author.njk", {
        list_authors: result.data,
        // Mettre contenu media à la place de list sae
    });
});

router.get("/a-propos(.html)?", async (_req, res) => {
    res.render("pages/front-end/a-propos.njk", {
        //list_saes: result.data,
    });
});

router.get("/sur-les-medias(.html)?", async (_req, res) => {
    res.render("pages/front-end/sur-les-medias.njk", {
        //list_saes: result.data,
    });
});


router.get("/contact(.html)?", async (_req, res) => {
    res.render("pages/front-end/contact.njk", {
        // list_contact: result.data,
        // Mettre contenu contact à la place de list sae
    });
});

router.use((_req, res) => {
    res.status(404).render("pages/front-end/404.njk");
});

export default router;
