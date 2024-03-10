import express from "express";
import fs from 'node:fs/promises';

const base = "jpo";
const router = express.Router();


// Get or create 
router.get(`/${base}/`, async (req, res) => {

    let jpo = {
        
    };    
    try {
        const data = await fs.readFile('./src/data/jpo.json', { encoding: 'utf8' });
        const JSONdata = JSON.parse(data);
        jpo.name = JSONdata.name;
        jpo.date = JSONdata.date;
      } catch (err) {
        console.log(err);
      }
    res.render("pages/back-end/jpo/add-edit.njk", {
        jpo : jpo, 

    });
});

// Create or update jpo
router.post(`/${base}`, async (req, res) => {
    console.log(req.body)
    let jpo = {
        name: req.body.name,
        date: req.body.date
    }; 
    
    try {
        await fs.writeFile('./src/data/jpo.json', JSON.stringify(jpo));
        jpo.name = jpo.name;
        jpo.date = jpo.date;
      } 
      
      catch (err) {
        console.log(err);
      }
    
    res.render("pages/back-end/jpo/add-edit.njk", {
        jpo : jpo,
        is_success: true,
    });
    
});

export default router;