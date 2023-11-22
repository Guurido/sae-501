import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import querystring from "querystring";

import Author from "#models/author.js";

import upload, { uploadImage, deleteUpload } from "../uploader.js";

const router = express.Router();

const base = "authors";

/**
 * @openapi
 * /authors:
 *   get:
 *     tags:
 *      - Authors
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
 *        description: Number of items per page.
 *      - in: query
 *        name: id
 *        required: false
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *            pattern: '([0-9a-f]{24})'
 *        description: List of authors' _id. **Invalid ids will be skipped.**
 *     responses:
 *      200:
 *         description: Get all authors
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ListAuthors'
 *      400:
 *         description: Something went wrong
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.get(`/${base}`, async (req, res) => {
    const page = Math.max(1, req.query.page || 1);
    const perPage = req.query.per_page;

    let listIds = req.query?.id 
    if(req.query.id && !Array.isArray(req.query.id)) {
        listIds = [listIds]
    }    

    listIds = (listIds || []).filter(mongoose.Types.ObjectId.isValid).map((item) => new mongoose.Types.ObjectId(item))

    try {
        const listRessources = await Author.aggregate([
            ...(listIds.length ? [{ $match: { _id: { $in: listIds } }}] : []),
            { $sort: { created_at: -1 } },
            ...(perPage ? [{ $skip: Math.max(page - 1, 0) * Number(perPage) }] : []),
            ...(perPage ? [{ $limit: Number(perPage) }] : []),
            {
                $project: {
                    _id: 1,
                    lastname: 1,
                    firstname: 1, 
                    image: 1,
                    bio: 1,
                    nb_articles: { $size: "$list_articles" },
                },
            },
        ]);

        const count = await Author.count(
            (listIds.length ? { _id: { $in: listIds } } : null)
        );
        const total_pages = Math.ceil(count / perPage);

        const queryParam = {...req.query}
        delete queryParam.page

        res.status(200).json({
            data: listRessources,
            total_pages: isFinite(total_pages) ? total_pages : 1,
            count,
            page,
            query_params: querystring.stringify(queryParam),
        });
    } catch (e) {
        res.status(400).json({
            errors: [
                ...Object.values(
                    e?.errors || [{ message: "Il y a eu un problème" }]
                ).map((val) => val.message),
            ],
        });
    }
});

/**
 * @openapi
 * /authors/{id}:
 *   get:
 *     tags:
 *      - Authors
 *     parameters:
 *      - name: id
 *        in: path
 *        description: author's _id
 *        required: true
 *        schema:
 *          type: string
 *          pattern: '([0-9a-f]{24})'
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          example: 1
 *        description: Page's number for author's articles
 *      - in: query
 *        name: per_page
 *        required: false
 *        schema:
 *          type: integer
 *          example: 7
 *        description: Number of items per page for author's articles. Max 20
 *     responses:
 *       200:
 *         description: Returns a specific author
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Author'
 *       400:
 *         description: Something went wrong
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *       404:
 *         description: Ressource not found
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.get(`/${base}/:id`, async (req, res) => {
    const page = Math.max(1, req.query.page || 1);
    let perPage = req.query.per_page || 7;
    perPage = Math.min(Math.max(perPage, 1), 20);

    try {
        const ressource = await Author.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
            {
                $addFields: {
                    nb_articles: { $size: "$list_articles" },
                    page: Number(page),
                    total_pages: {
                        $ceil: {
                            $divide: [{ $size: "$list_articles" }, perPage],
                        },
                    },
                }
            },
            { 
                $lookup: { 
                    from: 'articles', 
                    localField: 'list_articles', 
                    foreignField: '_id', 
                    as: 'list_articles',
                    pipeline: [
                        { $sort: { created_at: -1 } },
                        { $skip: Math.max(page - 1, 0) * perPage},
                        { $limit: perPage }
                    ]
                } 
            },
            { $addFields: { 
                list_articles: {
                    "$map": {
                        input: "$list_articles", 
                        as: "article", 
                        in: {
                            "$mergeObjects": [
                                "$$article",
                                {
                                    nb_comments: { "$size": "$$article.list_comments" },
                                }
                            ]
                        } 
                    } 
                } 
            }},
            { $unset: [ "list_articles.list_comments" ] }
        ]);

        if(!ressource.length) {
            return res.status(404).json({
                errors: [`L'auteur "${req.params.id}" n'existe pas`],
            });
        }
        
        return res.status(200).json(ressource[0]);
    } catch (err) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                errors: [`"${req.params.id}" n'est pas un id valide`],
            });
        }

        return res.status(400).json({
            errors: [
                ...Object.values(
                    err?.errors || [
                        { message: "Quelque chose s'est mal passé" },
                    ]
                ).map((val) => val.message),
            ],
        });
    }
});

/**
 * @openapi
 * /authors:
 *   post:
 *     tags:
 *      - Authors
 *     requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            required: ["lastname", "firstname", "email", "image"]
 *            properties:
 *              lastname:
 *                type: string
 *                description: SAE's title
 *                required: true
 *              firstname:
 *                type: string
 *              email:
 *                type: string
 *              image:
 *                type: string
 *                format: binary
 *              bio:
 *                type: string
 *              color:
 *                type: string
 *                description: Author's **hexadecimal** color used on his page for the bubble in the front. 
 *                default: "#ff0000"
 *     responses:
 *       201:
 *         description: Creates an author
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Author'
 *       400:
 *         description: Something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(`/${base}`, upload.single("image"), async (req, res) => {
    let imagePayload = {};
    let listErrors = [];
    let targetPath = undefined;

    const uploadedImage = req.body.file || req.file;

    if (uploadedImage) {
        let imageName;
        ({
            image_path: targetPath,
            errors: listErrors,
            image_name: imageName,
        } = uploadImage(uploadedImage, res.locals.upload_dir));
        imagePayload = { image: imageName };
    }

    if (listErrors.length) {
        return res.status(400).json({
            errors: listErrors,
            ressource: req.body,
        });
    }

    let ressource = new Author({ ...req.body, ...imagePayload });

    await ressource
        .save()
        .then(() => {
            res.status(201).json(ressource);
        })
        .catch((err) => {
            res.status(400).json({
                errors: [
                    ...listErrors,
                    ...deleteUpload(targetPath),
                    ...Object.values(
                        err?.errors || [
                            { message: "Quelque chose s'est mal passé" },
                        ]
                    ).map((val) => val.message),
                ],
            });
        });
});

/**
 * @openapi
 * /authors/{id}:
 *   put:
 *     tags:
 *      - Authors
 *     parameters:
 *      - name: id
 *        in: path
 *        description: author's _id
 *        required: true
 *        schema:
 *          type: string
 *          pattern: '([0-9a-f]{24})'
 *     requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            required: ["lastname", "firstname", "email", "image"]
 *            properties:
 *              lastname:
 *                type: string
 *                description: SAE's title
 *                required: true
 *              firstname:
 *                type: string
 *              email:
 *                type: string
 *              image:
 *                type: string
 *                format: binary
 *              bio:
 *                type: string
 *              color:
 *                type: string
 *                description: Author's **hexadecimal** color used on his page for the bubble in the front. 
 *                default: "#ff0000"
 *     responses:
 *       200:
 *         description: Updates a specific SAE
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Author'
 *       400:
 *         description: Something went wrong
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.put(`/${base}/:id`, upload.single("image"), async (req, res) => {
    let imagePayload = {};
    let listErrors = [];
    let targetPath = undefined;

    const uploadedImage = req.body.file || req.file;

    if (uploadedImage) {
        let imageName;
        ({
            image_path: targetPath,
            errors: listErrors,
            image_name: imageName,
        } = uploadImage(uploadedImage, res.locals.upload_dir));
        imagePayload = { image: imageName };
    }

    let oldRessource = {};
    try {
        oldRessource = await Author.findById(req.params.id).lean();
    } catch (error) {
        oldRessource = {};
    }

    if (listErrors.length) {
        return res.status(400).json({
            errors: listErrors,
            ressource: { ...oldRessource, ...req.body },
        });
    }

    const ressource = await Author.findOneAndUpdate(
        { _id: req.params.id },
        { ...req.body, _id: req.params.id, ...imagePayload },
        { new: true }
    )
        .orFail()
        .catch((err) => {
            if (err instanceof mongoose.Error.DocumentNotFoundError) {
                res.status(404).json({
                    errors: [`L'auteur "${req.params.id}" n'existe pas`],
                });
            } else if (err instanceof mongoose.Error.CastError) {
                res.status(400).json({
                    errors: [
                        ...listErrors,
                        "Élément non trouvé",
                        ...deleteUpload(targetPath),
                    ],
                });
            } else {
                res.status(400).json({
                    errors: [
                        ...listErrors,
                        ...Object.values(
                            err?.errors || [
                                { message: "Il y a eu un problème" },
                            ]
                        ).map((val) => val.message),
                        ...deleteUpload(targetPath),
                    ],
                    ressource: { ...oldRessource, ...req.body },
                });
            }
        });

    return res.status(200).json(ressource);
});

/**
 * @openapi
 * /authors/{id}:
 *   delete:
 *     description: |
 *      On deletion all articles written lose there author, **they are not deleted**
 *     tags:
 *      - Authors
 *     parameters:
 *      - name: id
 *        in: path
 *        description: author's _id
 *        required: true
 *        schema:
 *          type: string
 *          pattern: '([0-9a-f]{24})'
 *     responses:
 *       200:
 *         description: Deletes a specific author
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Author'
 *       400:
 *         description: Something went wrong
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *       404:
 *         description: Ressource not found
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.delete(`/${base}/:id`, async (req, res) => {
    try {
        const ressource = await Author.findByIdAndDelete(req.params.id);

        if (ressource?.image) {
            const targetPath = `${res.locals.upload_dir}${ressource.image}`;
            fs.unlink(targetPath, (err) => {});
        }

        if (ressource) {
            return res.status(200).json(ressource);
        }
        return res.status(404).json({
            errors: [`L'auteur "${req.params.id}" n'existe pas`],
        });
    } catch (error) {
        return res.status(400).json({
            error: "Quelque chose s'est mal passé, veuillez recommencer",
        });
    }
});

export default router;
