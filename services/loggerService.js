import pino from "pino";
import { join } from "path";
import { mkdirSync, createWriteStream } from "fs";

// Buat folder logs jika belum ada
mkdirSync("logs", { recursive: true });

const logger = pino({
  level: "info",
  transport: {
    targets: [
      {
        // Tampilkan ke terminal (console) dengan format readable
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
      {
        // Simpan log ke file dengan format readable juga
        target: "pino-pretty",
        options: {
          colorize: false,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          destination: join("logs", "app.log"),
        },
      },
    ],
  },
});

export default logger;
