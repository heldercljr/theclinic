// ATUALMENTE GERANDO REQUESTS INVÁLIDOS PARA TESTE (SEM TOKEN DE AUTORIZAÇÃO)
// Simula tráfego enviando requisições para vários endpoints em intervalos regulares.
// Útil para testar a resiliência e desempenho de servidores sob carga,
// além de gerar logs para a demonstração do Grafana/Loki.
// Os requests não passam pela autenticação, logo não alteram dados válidos.

import axios from "axios";

const BASE_URL = 'http://localhost:3000';
const ENDPOINTS = [
    { method: "post", url: "/users", data: { username: "user" + Math.floor(Math.random() * 1000), password: "testpass" } },
    { method: "get", url: "/beneficiaries/list" },
    { method: "put", url: "/users", data: { username: "user" + Math.floor(Math.random() * 1000), oldPassword: "oldpass", newPassword: "newpass" } },
    { method: "get", url: "/beneficiaries/1" },
    { method: "delete", url: "/beneficiaries/1" }
];

const INTERVAL_MS = 2000; // 2 seconds
const TOTAL_REQUESTS = 50;
const TOKEN = "Bearer TOKEN_AQUI"; // Placeholder, substitua por um token válido futuramente

function getRandomEndpoint() {
    return ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
}

async function sendRequest() {
    const ep = getRandomEndpoint();
    const config = {
        headers: {
            Authorization: TOKEN,
            "Content-Type": "application/json"
        }
    };
    try {
        if (ep.method === "get" || ep.method === "delete") {
            await axios[ep.method](`${BASE_URL}${ep.url}`, config);
        } else {
            await axios[ep.method](`${BASE_URL}${ep.url}`, ep.data, config);
        }
        console.log(`Sent ${ep.method.toUpperCase()} ${ep.url}`);
    } catch (err) {
        console.log(`Error on ${ep.method.toUpperCase()} ${ep.url}:`, err.response?.status, err.response?.data);
    }
}

let sent = 0;
const interval = setInterval(async () => {
    if (sent >= TOTAL_REQUESTS) {
        clearInterval(interval);
        console.log("Finished sending requests.");
        return;
    }
    await sendRequest();
    sent++;
}, INTERVAL_MS);