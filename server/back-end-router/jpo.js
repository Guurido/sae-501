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
    res.render("pages/back-end/jpo/list.njk", { 
        jpoName
    });
    });
});

// Create or update jpo 
router.post(`/${base}/:id`, async (req, res) => {
    let jpo = {
        date: req.body.name
    }

    try {
        fs.writeFile(jsonFilePath, JSON.stringify(jpo));
        jpo.name = jpo.date;
      } catch (err) {
        console.log(err);
      }
      
    const jpoName = JSON.parse(data);
    res.render("pages/back-end/jpo/add-edit.njk", {
        jpoName,
    });
});


export default router;