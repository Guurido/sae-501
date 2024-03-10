import express from "express";
import axios from "axios";
import querystring from "querystring";
import mongoose from "mongoose";

const base = "messages";
const router = express.Router();

// Get Multiple messages
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
    console.log(result);
    res.render("pages/back-end/messages/list.njk", {
        list_messages: result.data,
    });
});

// Get or create message
router.get(`/${base}/:id`, async (req, res) => {
    let options = {
        method: "GET",
        url: `${res.locals.base_url}/api/${base}/${req.params.id}`,
    }
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id)
 
    let result = null
    let listErrors = []
   
        try {
            result = await axios(options);
        } catch (e) {
            listErrors = e.response.data.errors
            result = {}
        }
   
    res.render("pages/front-end/contact.njk", {
        article: result?.data || {},
        list_errors: listErrors,
        is_edit: isEdit,
    });
});

export default router;