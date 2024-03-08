import express from "express";

import fs from "fs";

const base = "jpo";
const router = express.Router();

// Chemin vers le fichier JSON
const jsonFilePath = "./src/data/jpo.json";

// Get or create jpo
router.get(`/${base}/`, async (req, res) => {
    fs.readFile(jsonFilePath, "utf8", (err, data) => {
        if (err) {
          console.error("Erreur lors de la lecture du fichier JSON:", err);
          res.status(500).send("Erreur lors de la lecture du fichier JSON");
          return;
        }

    // Conversion des données en objet JavaScript
    const jpoName = JSON.parse(data);
    // Rendre une vue à partir d'un fichier HTML avec les données JSON
    res.render("pages/back-end/jpo/add-edit.njk", { 
        jpoName
    });
    });
});

// Create or update jpo 
router.post(`/${base}/:id`, async (req, res) => {
    let jpo = {
        date: req.body.name,
    }

    try {
        // Convertir les données en objet JavaScript
        const jpoData = JSON.parse(data);
        // Mettre à jour les données de l'élément correspondant à l'ID
        jpoData.date = jpo.date;
        
        // Écrire les données mises à jour dans le fichier JSON
        fs.writeFile(jsonFilePath, JSON.stringify(jpoData), (err) => {
            if (err) {
                console.error("Erreur lors de l'écriture dans le fichier JSON:", err);
                res.status(500).send("Erreur lors de l'écriture dans le fichier JSON");
                return;
            } });
            // Rendre à nouveau la page add-edit.njk avec les données mises à jour
            res.redirect(`${res.locals.admin_url}?`);
                    
    } catch (err) {
        console.error("Erreur lors de la mise à jour des données:", err);
        res.status(500).send("Erreur lors de la mise à jour des données");
    }
});

export default router;