import express from "express";
import axios from "axios";
import querystring from "querystring";

const base = "other";
const router = express.Router();

// Get multiple articles
router.get(`/${base}`, async (req, res) => {
    const queryParams = querystring.stringify(req.query);
    let options = {
        method: "GET",
        url: `${res.locals.base_url}/api/${base}?${queryParams}`,
    }
    let result = null
    try {
        result = await axios(options);
    } catch (e) {}

    res.render("pages/back-end/others/list.njk", {
        list_others: result.data,
    });
});

export default router;