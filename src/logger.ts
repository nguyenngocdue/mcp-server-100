import pino from "pino";
import { config } from "./config";


export const logger = pino({
level: config.env === "production" ? "info" : "debug",
transport: config.env === "production" ? undefined : { target: "pino-pretty" }
});