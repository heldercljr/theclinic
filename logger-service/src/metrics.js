import client from 'prom-client';

export const logCounter = new client.Counter({
  name: 'logger_logs_total',
  help: 'Total de logs recebidos',
  labelNames: ['level', 'service']
});

export const errorCounter = new client.Counter({
  name: 'logger_errors_total',
  help: 'Total de erros no logger-service',
  labelNames: ['service']
});

export const responseTimeHistogram = new client.Histogram({
  name: 'logger_response_time_seconds',
  help: 'Tempo de resposta do logger-service em segundos',
  labelNames: ['service']
});

export function setupMetrics(app) {
  client.collectDefaultMetrics();

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });
}
