import app from "./app";

const port: number = Number(process.env.PORT) || 3000;
const host: string = process.env.HOST as string || "127.0.0.1";

app.listen(port, host, (): void => {
    console.log(`Server is running on ${host}:${port} since ${new Date().toLocaleString()}`);
});
