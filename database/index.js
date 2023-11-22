import mongoose from "mongoose";
import dotenv from "dotenv";

import Article from './models/article.js'
import SAE from './models/sae.js'


let envFilePath = ".env.prod.local";
if (process.env.NODE_ENV === "development") {
  envFilePath = ".env.dev.local";
}
const envVars = dotenv.config({ path: envFilePath });

// https://www.mongodb.com/try/download/community-kubernetes-operator
// Database Name
const dbName = "sae501";
const port = envVars.MONGODB_PORT || 27017
const url = `mongodb://0.0.0.0:${port}/${dbName}`;

const main = async () => {
  await mongoose.connect(url);

  return `MongoDB Server started on port : ${port}`;
}

export default main;

// node database/index.js --input-type=module
