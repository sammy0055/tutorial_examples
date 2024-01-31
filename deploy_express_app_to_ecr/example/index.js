import express from "express";
import cors from "cors";
import serverless from "serverless-http";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({ data: "welcome to lambda" });
});

app.post("/api", (req, res) => {
  return res
    .status(200)
    .json({ data: "welcome to lambda post", registerData: req.body });
});

app.get("/apples", (req, res) => {
  return res.status(200).json({ data: "welcome to apples route" });
});

app.post("/api/v1/register", (req, res) => {
  return res
    .status(200)
    .json({ data: "register routes", registerData: req.body });
});

export const handler = serverless(app);
