import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import { Server as SocketIO } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import webRoutes from "./routes/webRoute.js";

import {
  connectToWhatsApp,
  setSocket,
  isConnected,
  getQR,
  updateQR,
} from "./controllers/whatsappController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/assets", express.static(path.join(__dirname, "client/assets")));
app.use("/", webRoutes);

io.on("connection", (socket) => {
  setSocket(socket);
  if (isConnected()) {
    updateQR("connected");
  } else if (getQR()) {
    updateQR("qr");
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectToWhatsApp();
});
