import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import querystring from "querystring";

import upload from "../uploader.js";

const base = "articles";
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

    res.render("pages/back-end/articles/list.njk", {
        list_articles: result.data,
    });
});

// Get or create article
router.get([`/${base}/:id`, `/${base}/add`], async (req, res) => {
    let options = {
        method: "GET",
        url: `${res.locals.base_url}/api/${base}/${req.params.id}`,
    }
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id)

    let result = null
    let listErrors = []
    
    if(isEdit) {
        try {
            result = await axios(options);
        } catch (e) {
            listErrors = e.response.data.errors
            result = {}
        }
    }

    res.render("pages/back-end/articles/add-edit.njk", {
        article: result?.data || {},
        list_errors: listErrors,
        is_edit: isEdit,
    });
});

// Create or update article 
router.post(`/${base}/:id`, upload.single("image"), async (req, res) => {
    let ressource = null;
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id)
    let listErrors = [];
    let options = {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        data: {
            ...req.body,
            file: req.file,
        },
    }

    if(isEdit) {
        options = {
            ...options,
            method: "PUT",
            url: `${res.locals.base_url}/api/${base}/${req.params.id}`,
        }
    } else {
        options = {
            ...options,
            method: "POST",
            url: `${res.locals.base_url}/api/${base}`,
        }
    }
    
    try {
        const result = await axios(options);
        ressource = result.data
    } catch (e) {
        listErrors = e.response.data.errors
        ressource = e.response.data.ressource || {}
    } finally {
        if (listErrors.length || isEdit) {
            res.render("", {
                sae: ressource,
                list_errors: listErrors,
                is_edit: isEdit,
                is_success: listErrors.length === 0
            });
        } else {
            res.redirect(`${res.locals.admin_url}/${base}`);
        }
    }
});

export default router;
