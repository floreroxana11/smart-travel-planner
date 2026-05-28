import http from "http";
import https from "https";
import fs from "fs";
import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";

import app from "./app.js";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";
import { setWebSocketServerInstance } from "./websocket/wsServer.js";
import { initDatabase } from "./database/init.js";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  await initDatabase();

  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();

  app.use("/graphql", cors(), express.json(), expressMiddleware(apolloServer));

  let server;

  if (isProduction) {
    // Render pune HTTPS automat in fata aplicatiei
    server = http.createServer(app);
  } else {
    // Local/lab: HTTPS cu certificatele tale
    const sslOptions = {
      key: fs.readFileSync("./key.pem"),
      cert: fs.readFileSync("./cert.pem"),
    };

    server = https.createServer(sslOptions, app);
  }

  const wss = new WebSocketServer({ server });
  setWebSocketServerInstance(wss);

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected.");
    ws.on("close", () => console.log("WebSocket client disconnected."));
  });

  server.listen(PORT, "0.0.0.0", () => {
    const protocol = isProduction ? "https" : "https";

    console.log(`Database ready.`);
    console.log(`REST API: ${protocol}://localhost:${PORT}`);
    console.log(`GraphQL: ${protocol}://localhost:${PORT}/graphql`);
  });
}

startServer();