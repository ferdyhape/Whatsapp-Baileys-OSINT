import baileys from "@whiskeysockets/baileys";

const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  makeInMemoryStore,
  useMultiFileAuthState,
} = baileys;

import { Boom } from "@hapi/boom";
import logger from "../services/loggerService.js";
import { triggers } from "../config/triggers.js";
import qrcode from "qrcode";
import fs from "fs";
import pino from "pino";
import googleOsintController from "./googleOsintController.js";

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

let sock;
let qr;
let soket;

export const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth_info");
  const { version } = await fetchLatestBaileysVersion();
  sock = makeWASocket({
    printQRInTerminal: false,
    auth: state,
    logger: pino({ level: "silent" }),
    version,
    shouldIgnoreJid: (jid) => isJidBroadcast(jid),
  });

  store.bind(sock.ev);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason = new Boom(lastDisconnect.error).output.statusCode;
      switch (reason) {
        case DisconnectReason.badSession:
          logger.warn(`Bad Session File, Please Delete session and Scan Again`);
          deleteAuthData();
          break;
        case DisconnectReason.connectionClosed:
        case DisconnectReason.connectionLost:
        case DisconnectReason.restartRequired:
        case DisconnectReason.timedOut:
          logger.warn("Connection closed, reconnecting....");
          connectToWhatsApp();
          break;
        case DisconnectReason.connectionReplaced:
          logger.warn(
            "Connection Replaced, Please Close Current Session First"
          );
          deleteAuthData();
          connectToWhatsApp();
          break;
        case DisconnectReason.loggedOut:
          logger.warn(
            `Device Logged Out, Please Delete session and Scan Again.`
          );
          deleteAuthData();
          connectToWhatsApp();
          break;
        default:
          logger.error(
            `Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`
          );
      }
    } else if (connection === "open") {
      logger.info("Conncection opened successfully!");
    }
    if (update.qr) {
      qr = update.qr;
      updateQR("qr");
    } else if ((qr = undefined)) {
      updateQR("loading");
    } else if (update.connection === "open") {
      updateQR("qrscanned");
    }
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type === "notify" && !messages[0].key.fromMe) {
      const pesan = messages[0].message.conversation || "";
      const noWa = messages[0].key.remoteJid;

      await sock.readMessages([messages[0].key]);

      const lowerPesan = pesan.toLowerCase();
      const trigger = triggers.find((t) => lowerPesan.startsWith(t));

      if (trigger) {
        logger.info(`🔍 Received request with query ${pesan}`);

        const regex = /"(.*?)"/;
        const match = pesan.match(regex);

        let query = "";
        if (match && match[1]) {
          query = match[1].trim();
        } else {
          query = pesan.substring(trigger.length).trim();
        }

        if (!query) {
          await sock.sendMessage(noWa, {
            text: "Enter the keyword after the command.\nExample: `find “John Doe”`",
          });
          return;
        }

        await sock.sendMessage(
          noWa,
          {
            text: `Searching for "${query}"...`,
          },
          { quoted: messages[0] }
        );

        const response = await googleOsintController(query);
        await sock.sendMessage(
          noWa,
          { text: response },
          { quoted: messages[0] }
        );
      }
    }
  });
};

const deleteAuthData = () => {
  try {
    fs.rmSync("baileys_auth_info", { recursive: true, force: true });
    logger.info("Authentication data deleted.");
  } catch (error) {
    logger.error("Error deleting authentication data:", error);
  }
};

export const isConnected = () => !!sock?.user;

export const updateQR = (data) => {
  switch (data) {
    case "qr":
      qrcode.toDataURL(qr, (err, url) => {
        soket?.emit("qr", url);
        soket?.emit("log", "QR Code received, please scan!");
      });
      break;
    case "connected":
      soket?.emit("qrstatus", "./assets/check.svg");
      soket?.emit("log", "WhatsApp is connected!");
      break;
    case "qrscanned":
      soket?.emit("qrstatus", "./assets/check.svg");
      soket?.emit("log", "Qr Code has been scanned, please wait!");
      break;
    case "loading":
      soket?.emit("qrstatus", "./assets/loader.gif");
      soket?.emit("log", "Registering QR Code, please wait!");
      break;
    default:
      break;
  }
};

export const sendMessage = async (req, res) => {
  const pesankirim = req.body.message;
  const number = req.body.number;

  try {
    if (!number) {
      return res.status(500).json({
        status: false,
        response: "Phone number is required.",
      });
    }

    const numberWA = `62${number.substring(1)}@s.whatsapp.net`;

    if (!isConnected()) {
      return res.status(500).json({
        status: false,
        response: `WhatsApp is not connected. Please wait until the QR code is scanned.`,
      });
    }

    const exists = await sock.onWhatsApp(numberWA);

    if (!exists?.jid && (!exists || !exists[0]?.jid)) {
      return res.status(500).json({
        status: false,
        response: `Phone number ${number} is not registered on WhatsApp.`,
      });
    }

    if (req.files) {
      const file = req.files.file;
      await sock.sendMessage(exists.jid || exists[0].jid, {
        image: file.data,
        caption: pesankirim,
      });
      return res.status(200).json({
        status: true,
        response: "Mesage with image sent successfully.",
      });
    }

    await sock.sendMessage(exists.jid || exists[0].jid, { text: pesankirim });
    return res.status(200).json({
      status: true,
      response: "Message sent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      response: error.message,
    });
  }
};

export const getQR = () => qr;

export const setSocket = (socket) => {
  soket = socket;
};
