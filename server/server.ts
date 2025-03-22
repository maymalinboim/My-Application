import appPromise from "./app";
import { Express } from "express";

const PORT = process.env.PORT || 3000;

appPromise.then((app: Express) => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
