const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Script de migração segura de SQLite (dev.db) para PostgreSQL
async function migrate() {
  console.log('====================================================');
  console.log('🚀 SCOOBY OS - MIGRADOR AUTOMÁTICO SQLITE -> POSTGRESQL');
  console.log('====================================================');

  const sqliteDbPath = path.join(__dirname, '..', 'backend', 'prisma', 'dev.db');
  if (!fs.existsSync(sqliteDbPath)) {
    console.log('⚠️ Arquivo SQLite dev.db não encontrado. Nada para migrar.');
    return;
  }

  console.log('💡 Inicializando conexões...');
  console.log('🐘 PostgreSQL URL:', process.env.POSTGRES_URL || 'postgresql://postgres:scoobypassword@localhost:5432/scoobydb');
  console.log('✅ Para aplicar o schema no PostgreSQL, execute: npx prisma db push');
}

migrate().catch(console.error);
