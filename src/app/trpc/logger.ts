import winston from "winston";

const createRequestIdFormat = (requestId?: string) => {
    return winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const reqId = requestId || "no-request-id";
        return `${timestamp} ${level} [${reqId}] ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "" // Add indent for readability
        }`;
    });
};

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        createRequestIdFormat(), // Initial format WITHOUT requestId
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "app.log" }),
    ],
});

export { logger, createRequestIdFormat };
