import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import morgan from "morgan";

export const setupSecurity = (app) => {
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(xss());
  app.use(mongoSanitize());
  app.use(compression());
  app.use(morgan("dev"));
};
