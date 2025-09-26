import client from "prom-client";
import type {Express} from "express";

export const requestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total de requisições HTTP",
    labelNames: ["method", "route", "status"]
});

export const errorCounter = new client.Counter({
    name: "http_errors_total",
    help: "Total de respostas de erro HTTP",
    labelNames: ["method", "route", "status"]
});

export const responseTimeHistogram = new client.Histogram({
    name: "http_response_time_seconds",
    help: "Tempo de resposta HTTP em segundos",
    labelNames: ["method", "route", "status"]
});

export function setupMetrics(app: Express) {
    client.collectDefaultMetrics();

    app.use((req, res, next) => {
        const start = process.hrtime();
        res.on("finish", () => {
            const duration = process.hrtime(start);
            const seconds = duration[0] + duration[1] / 1e9;
            requestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
            responseTimeHistogram.observe({ method: req.method, route: req.path, status: res.statusCode }, seconds);
            if (res.statusCode >= 400) {
                errorCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
            }
        });
        next();
    });

    app.get("/metrics", async (req, res) => {
        res.set("Content-Type", client.register.contentType);
        res.end(await client.register.metrics());
    });
}
