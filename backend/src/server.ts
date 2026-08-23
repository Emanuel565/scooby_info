import http from 'http';
import path from 'path';
import os from 'os';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { initSocket } from './socket.js';
import authRoutes from './routes/auth.routes.js';
import osRoutes from './routes/os.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import publicRoutes from './routes/public.routes.js';
import estoqueRoutes from './routes/estoque.routes.js';
import chatRoutes from './routes/chat.routes.js';
import vendaRoutes from './routes/venda.routes.js';
import { setVendaSocketIO } from './controllers/venda.controller.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Função para obter o IP da máquina na rede local (Wi-Fi / Ethernet)
export const getLocalNetworkIPs = (): string[] => {
  const nets = os.networkInterfaces();
  const results: string[] = [];
  for (const name of Object.keys(nets)) {
    const iface = nets[name];
    if (iface) {
      for (const net of iface) {
        if (net.family === 'IPv4' && !net.internal) {
          results.push(net.address);
        }
      }
    }
  }
  return results;
};

// Middlewares Globais
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '25mb' })); // Limite expandido para mensagens de áudio e planilhas Excel

// Inicializar WebSocket
export const io = initSocket(server, prisma);
setVendaSocketIO(io);

// Rotas da API
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/os', osRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/vendas', vendaRoutes);
app.use('/api/chat', chatRoutes);

// Informações de rede para compartilhamento e conexão de outros computadores
app.get('/api/network-info', (req, res) => {
  const networkIps = getLocalNetworkIPs();
  const primaryIp = networkIps[0] || 'localhost';

  res.json({
    status: 'online',
    port: PORT,
    localIps: networkIps,
    primaryIp,
    serverUrl: `http://${primaryIp}:${PORT}`,
    publicUrl: process.env.PUBLIC_URL || null,
    hostname: os.hostname(),
    osPlatform: os.platform()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Scooby OS Management API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Servir arquivos estáticos do Frontend compilado (quando existir em frontend/dist)
const possibleFrontendPaths = [
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist')
];

let frontendDistPath = possibleFrontendPaths.find(p => fs.existsSync(p));

if (frontendDistPath) {
  console.log(`📦 Servindo Frontend integrado a partir de: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // Fallback SPA para rotas do React Router
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      res.sendFile(path.join(frontendDistPath!, 'index.html'));
    }
  });
}

// Inicialização do Servidor
server.listen(PORT, HOST, () => {
  const networkIps = getLocalNetworkIPs();
  const primaryIp = networkIps[0] || '127.0.0.1';

  console.log(`================================================================`);
  console.log(`🚀 SCOOBY OS - SERVIDOR CENTRAL ATIVO E PRONTO NA REDE!`);
  console.log(`================================================================`);
  console.log(`💻 ACESSO NESTE COMPUTADOR (Servidor):`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log(``);
  console.log(`📡 ACESSO DE OUTROS COMPUTADORES NA MESMA REDE (Wi-Fi / Cabo):`);
  networkIps.forEach(ip => {
    console.log(`   👉 http://${ip}:${PORT}`);
  });
  console.log(``);
  console.log(`💡 Dica: Basta abrir o link acima em qualquer computador da oficina!`);
  console.log(`================================================================`);
});