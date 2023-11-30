import express from "express";
import fs from "fs";
import querystring from "querystring";

import Article from '#models/article.js';
import Author from '#models/author.js';

import upload, { uploadImage, deleteUpload } from "../uploader.js"
import mongoose from "mongoose";

const router = express.Router();

const base = "articles";

/**
 * @openapi
 * /articles:
 *   get:
 *     tags:
 *      - Articles
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
 *        description: List of articles' _id. **Invalid ids will be skipped.**
 *     responses:
 *       200:
 *         description: Returns all articles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListArticles'
 *       400:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(`/${base}`, async (req, res) => {
    const page = Math.max(1, req.query.page || 1);
    let perPage = req.query.per_page || 7;
    perPage = Math.min(Math.max(perPage, 1), 20);

    let listIds = req.query?.id 
    if(req.query.id && !Array.isArray(req.query.id)) {
        listIds = [listIds]
    }    
    listIds = (listIds || []).filter(mongoose.Types.ObjectId.isValid).map((item) => new mongoose.Types.ObjectId(item))
    
    try {
        const listRessources = await getArticles(
            listIds.length ? listIds : [], {page, perPage}, true
        )

        const count = await Article.count(
            (listIds.length ? { _id: { $in: listIds } } : null)
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
 * /articles/{id}:
 *   get:
 *     tags:
 *      - Articles
 *     parameters:
 *      - name: id
 *        in: path
 *        description: article's _id
 *        required: true
 *        schema:
 *          type: string
 *          pattern: '([0-9a-f]{24})'
 *     responses:
 *       200:
 *         description: Returns a specific article
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(`/${base}/:id`, async (req, res) => {
    try {
        const ressource = await getArticles(new mongoose.Types.ObjectId(req.params.id))

        if(ressource?.[0]) {
            return res.status(200).json(ressource[0])
        }
        return res.status(404).json({
            errors: [`L'article "${req.params.id}" n'existe pas`],
        });
    } catch(e) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                errors: [`"${req.params.id}" n'est pas un id valide`],
            });
        }
        return res.status(400).json({errors: ["Quelque chose s'est mal passé"]})
    }
});

/**
 * @openapi
 * /articles:
 *   post:
 *     tags:
 *      - Articles
 *     requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            required: ['title', 'content']
 *            properties:
 *              title:
 *                type: string
 *                description: article's title
 *              abstract:
 *                type: string
 *              content:
 *                type: string
 *              image:
 *                type: string
 *                format: binary
 *              is_active:
 *                type: boolean
 *                default: false
 *              yt_link_id:
 *                type: string
 *                description: article's Youtube link id
 *              author:
 *                type: string
 *                description: author's _id. If the value is not valid or null, the article won't have a author anymore
 *     responses:
 *       201:
 *         description: Creates an article
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(`/${base}`, upload.single("image"), async (req, res) => {
    let imagePayload = {}
    let listErrors =  []
    let targetPath = undefined;

    const uploadedImage = req.body.file || req.file;

    if (uploadedImage) {
        let imageName;
        ({image_path: targetPath, errors: listErrors, image_name: imageName} = uploadImage(uploadedImage, res.locals.upload_dir))
        imagePayload = { image: imageName }
    }

    if(listErrors.length) {
        return res.status(400).json({ 
            errors: listErrors, 
            ressource: req.body 
        })
    }
    
    const computedBody = structuredClone(req.body)
    if(!mongoose.Types.ObjectId.isValid(req.body.author)) {
        delete computedBody.author
    }

    const ressource = new Article({ ...computedBody, ...imagePayload });

    try {
        await ressource.save()
        const ressourceComputed = await getArticles(ressource._id)
        
        if(req.body.author) {
            ressourceComputed[0].author.nb_articles++
            await Author.findOneAndUpdate({ _id: req.body.author }, {"$push": { list_articles: ressource._id } });
        }
        res.status(201).json(ressourceComputed[0])
    } catch (err) {
        res.status(400).json({
            errors: [
                ...listErrors, 
                ...deleteUpload(targetPath), 
                ...Object.values(err?.errors || [{'message': "Il y a eu un problème"}]).map((val) => val.message)
            ]
        })
    }
});

/**
 * @openapi
 * /articles/{id}:
 *   put:
 *     tags:
 *      - Articles
 *     description: |
 *      If the author change, the previous author lose the article
 *     parameters:
 *      - name: id
 *        in: path
 *        description: article's _id
 *        required: true
 *        schema:
 *          type: string
 *          pattern: '([0-9a-f]{24})'
 *     requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            required: ['title', 'content']
 *            properties:
 *              title:
 *                type: string
 *                description: article's title
 *              abstract:
 *                type: string
 *              content:
 *                type: string
 *              image:
 *                type: string
 *                format: binary
 *              is_active:
 *                type: boolean
 *                default: false
 *              yt_link_id:
 *                type: string
 *                description: article's Youtube link id
 *              author:
 *                type: string
 *                description: author's _id. If the value is not valid or null, the article won't have a author anymore
 *     responses:
 *       200:
 *         description: Updates a specific article
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(`/${base}/:id`, upload.single("image"), async (req, res) => {
    let imagePayload = {}
    let listErrors =  []
    let targetPath = undefined;

    const uploadedImage = req.body.file || req.file;
    
    if (uploadedImage) {
        let imageName;
        ({image_path: targetPath, errors: listErrors, image_name: imageName} = uploadImage(uploadedImage, res.locals.upload_dir))
        imagePayload = { image: imageName }
    }

    let oldRessource = {}
    try {
        oldRessource = await Article.findById(req.params.id).lean();
    } catch (error) {
        oldRessource = {}
    }

    if(listErrors.length) {
        return res.status(400).json({ 
            errors: listErrors, 
            ressource: { ...oldRessource, ...req.body }
        })
    }

    try {
        let ressource = await Article.findById(req.params.id)
        
        if(Object.keys(imagePayload).length) {
            ressource.image = imagePayload.image
        }
        if(req.body.author !== ressource.author) {
            // Unlink article with author
            await Author.findOneAndUpdate({ _id: ressource.author }, {"$pull": { list_articles: ressource._id } });
            
            if(req.body.author && mongoose.Types.ObjectId.isValid(req.body.author)) {
                ressource.author = req.body.author;
                await Author.findOneAndUpdate({ _id: req.body.author }, {"$addToSet": { list_articles: ressource._id } });
            } else {
                // Unlink with any author
                ressource.author = null;
            }
        }
        await ressource.save();

        const ressourceComputed = await getArticles(ressource._id)

        res.status(200).json(ressourceComputed[0])
    } catch (err) {
        if (err instanceof mongoose.Error.DocumentNotFoundError) {
            res.status(404).json({
                errors: [`L'article "${req.params.id}" n'existe pas`],
            });
        } else if (err instanceof mongoose.Error.CastError) {
            res.status(400).json({
                errors: [`"${req.params.id}" n'est pas un _id valide`],
            });
        } else {
            res.status(400).json({ 
                errors: [...listErrors, ...Object.values(err?.errors || [{'message': "Il y a eu un problème"}]).map((val) => val.message), ...deleteUpload(targetPath)], 
                ressource: { ...oldRessource, ...req.body }
            })
        }
    }
});

/**
 * @openapi
 * /articles/{id}:
 *   delete:
 *     tags:
 *      - Articles
 *     description: |
 *      On deletion all comments related are deleted
 *     parameters:
 *      - name: id
 *        in: path
 *        description: article's _id
 *        required: true
 *        schema:
 *          type: string
 *          pattern: '([0-9a-f]{24})'
 *     responses:
 *       200:
 *         description: Deletes a specific article
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
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
        const ressource = await Article.findByIdAndDelete(req.params.id)

        if (ressource?.image) {
            const targetPath = `${res.locals.upload_dir}${ressource.image}`;
            fs.unlink(targetPath, (err) => {});
        }

        if(ressource) {
            return res.status(200).json(ressource)
        }
        return res.status(404).json({
            errors: [`L'article "${req.params.id}" n'existe pas`],
        });
    } catch (error) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                errors: [`"${req.params.id}" n'est pas un id valide`],
            });
        } 
        return res.status(400).json({errors: ["Quelque chose s'est mal passé"]})
    }
});

const getArticles = async (id, queryParams = {}, isArray = false) => {
    const ressource = await Article.aggregate([
        ...(isArray ? [
            ...(id.length ? [{ $match: { _id: { $in: id } }}] : [])
        ] : 
            [{ $match: { _id: id } }]
        ),
        ...(isArray ? [{ $sort : { _id : -1 } }] : []),
        ...(isArray ? [{ $skip: Math.max(queryParams.page - 1, 0) * queryParams.perPage }] : []),
        ...(isArray ? [{ $limit: queryParams.perPage }] : []),
        {
            $addFields: {
               nb_comments: { $size: "$list_comments" }
            }
        },
        { $unset: "list_comments" },
        { 
            $lookup: { 
                from: 'authors', 
                localField: 'author', 
                foreignField: '_id', 
                as: 'author',
            } 
        },
        { 
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                "author.nb_articles": {
                    // https://stackoverflow.com/questions/14213636/conditional-grouping-with-exists-inside-cond
                    $cond: [
                        { $not: ["$author.list_articles"] },
                        "$$REMOVE",
                        { $size: "$author.list_articles" }
                    ]
                }
            }
        },
        {
            $set: {
                author: {
                    $cond: [
                        { $not: ["$author.list_articles"] },
                        null,
                        "$author",
                    ]
                }
            }
        },
        { $unset: "author.list_articles" },
    ])

    return ressource;
}

export default router;
