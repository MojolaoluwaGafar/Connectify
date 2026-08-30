import "dotenv/config";
import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

const PORT = env.PORT;

const startServer = async () => {
  try {
    
  
    app.listen(env.PORT, () => {
      console.log(`Connecti API listening on http://localhost:${env.PORT}`)
    })
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

startServer();

