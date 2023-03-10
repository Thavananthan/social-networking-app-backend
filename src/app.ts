import express, { Express } from "express";
import { ChServer } from "./setupServer";
import databaseConnection from "./setupDatabase";
import { config } from "./config";

class Application {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: Express = express();
    const server: ChServer = new ChServer(app);
    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
  }
}

//initializing application class here

const application: Application = new Application();
application.initialize();
