import app from "./app";

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST as string || "127.0.0.1";

app.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port} since ${new Date().toLocaleString()}`);
});
