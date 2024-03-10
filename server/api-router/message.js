import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import querystring from "querystring";

import message from '#models/message.js';

const router = express.Router();
const base = "messages";

/**
 * @openapi
 * /messages:
 *   get:
 *     tags:
 *      - messages
 *     responses:
 *       200:
 *         description: Returns all messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listmessages'
 *       400:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          example: 1
 *        description: Page's number
 *      - in: query
 *        name: per_page
 *        required: false
 *        schema:
 *          type: integer
 *          example: 7
 *        description: Number of items per page. Max 20
 *      - in: query
 *        name: id
 *        required: false
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *            pattern: '([0-9a-f]{24})'
 *          example: 7
 *        description: List of messages' _id. **Invalid ids will be skipped.**
 */
router.get(`/${base}`, async (req, res) => {
    const page = Math.max(1, req.query.page || 1);
    let perPage = req.query.per_page || 7;
    // Clamps the value between 1 and 20
    perPage = Math.min(Math.max(perPage, 1), 20);
    
    let listIds = req.query?.id 
    if(req.query.id && !Array.isArray(req.query.id)) {
        listIds = [listIds]
    }    

    listIds = (listIds || []).filter(mongoose.Types.ObjectId.isValid).map((item) => new mongoose.Types.ObjectId(item))
    
    try {
        const listRessources = await message.aggregate([
            ...(listIds.length ? [{ $match: { _id: { $in: listIds } }}] : []),
            { $sort : { _id : -1 } },
            { "$skip": Math.max(page - 1, 0) * perPage },
            { "$limit": perPage },
        ])

        const count = await message.count(
            (listIds.length ? {_id: {$in: listIds}} : null)
        );

        const queryParam = {...req.query}
        delete queryParam.page
    
        res.status(200).json({
            data: listRessources,
            total_pages: Math.ceil(count / perPage),
            count,
            page,
            query_params: querystring.stringify(queryParam),
        })
    } catch (e) {
        res.status(400).json({
            errors: [
                ...Object.values(e?.errors || [{'message': "Il y a eu un problème"}]).map((val) => val.message)
            ]
        })
    }
});

/**
 * @openapi
 * /messages/{id}:
 *   get:
 *     tags:
 *      - messages
 *     parameters:
 *      - name: id
 *        in: path
 *        description: message's _id
 *        required: true
 *        schema:
 *          type: string
 *          pattern: '([0-9a-f]{24})'
 *     responses:
 *       200:
 *         description: Returns a specific message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/message'
 *       400:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Ressource not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(`/${base}/:id`, async (req, res) => {
    let listErrors =  []

    const ressource = await message.findOne({ _id: req.params.id }).orFail().catch(() => {
        res.status(404).json({ errors: [...listErrors, "Élément non trouvé"] })
    });

    return res.status(200).json(ressource)
});

/**
 * @swagger
 * /messages:
 *   post:
 *     tags:
 *      - messages
 *     requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            required: ['title']
 *            properties:
 *              title:
 *                type: string
 *                description: message's title
 *                required: true
 *              content:
 *                type: string
 *              image:
 *                type: string
 *                format: binary
 *     responses:
 *       201:
 *         description: Creates a message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/message'
 *       400:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(`/${base}`, async (req, res) => {
    let listErrors =  []
   
    if(listErrors.length) {
        return res.status(400).json({ 
            errors: listErrors, 
            ressource: req.body 
        })
    }

    const ressource = new message({ ...req.body});

    await ressource.save().then(() => {
        res.status(201).json(ressource)
    })
    .catch((err) => {
        res.status(400).json({
            errors: [
                ...listErrors, 
                ...Object.values(err?.errors).map((val) => val.message)
            ]
        })
    })
});



/**
 * @openapi
 * /messages/{id}:
 *   delete:
 *     tags:
 *      - messages
 *     parameters:
 *      - name: id
 *        in: path
 *        description: message's _id
 *        required: true
 *        schema:
 *          type: string
 *          pattern: '([0-9a-f]{24})'
 *     responses:
 *       200:
 *         description: Deletes a specific message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/message'
 *       400:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Ressource not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(`/${base}/:id`, async (req, res) => {
    try {
        const ressource = await message.findByIdAndDelete(req.params.id)

        if (ressource?.image) {
            const targetPath = `${res.locals.upload_dir}${ressource.image}`;
            fs.unlink(targetPath, (err) => {});
        }

        if(ressource) {
            return res.status(200).json(ressource);
        }
        return res.status(404).json({
            errors: [`La message "${req.params.id}" n'existe pas`],
        });
    } catch (error) {
        return res
            .status(400)
            .json({
                error: "Quelque chose s'est mal passé, veuillez recommencer",
            });
    }
});

export default router;