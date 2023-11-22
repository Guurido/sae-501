import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import querystring from "querystring";

import upload from "../uploader.js";

const base = "saes";
const router = express.Router();

// Get or create SAE
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

    res.render("pages/back-end/saes/list.njk", {
        list_saes: result.data,
    });
});

// Get or create SAE
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

    res.render("pages/back-end/saes/add-edit.njk", {
        sae: result?.data || {},
        list_errors: listErrors,
        is_edit: isEdit,
    });
});

// Create or update SAE 
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
            res.render("pages/back-end/saes/add-edit.njk", {
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
