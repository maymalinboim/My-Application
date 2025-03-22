import appPromise from "./app";
import { Express } from "express";
import http from "http"
import https from "https"
import fs from "fs"

const PORT = process.env.PORT || 3000;

appPromise.then((app: Express) => {
  if (process.env.NODE_ENV !== "production") {
    console.log('development');
    http.createServer(app).listen(PORT);
  }
  else {
    console.log('production');
    const options = {
      key: fs.readFileSync("./client-key.pem"),
      cert: fs.readFileSync("./client-cert.pem")
    };
    https.createServer(options, app).listen(process.env.HTTPS_PORT);
  }
});
