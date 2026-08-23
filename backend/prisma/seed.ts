import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando dados para inicialização de produção...');

  await prisma.itemVenda.deleteMany({}).catch(() => {});
  await prisma.venda.deleteMany({}).catch(() => {});
  await prisma.notificacao.deleteMany({}).catch(() => {});
  await prisma.logHistorico.deleteMany({}).catch(() => {});
  await prisma.mensagemChat.deleteMany({}).catch(() => {});
  await prisma.ordemServico.deleteMany({}).catch(() => {});
  await prisma.itemEstoque.deleteMany({}).catch(() => {});
  await prisma.usuario.deleteMany({}).catch(() => {});

  console.log('👥 Cadastrando equipe oficial...');

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Donizete (ADMIN)
  await prisma.usuario.create({
    data: {
      nome: 'Donizete',
      login: 'donizete',
      senha_hash: passwordHash,
      cargo: 'ADMIN',
      status: 'ONLINE',
      telefone: '(41) 3565-2008',
      especialidades: JSON.stringify(['NOTEBOOK', 'SMARTPHONE', 'IMPRESSORA', 'PC_DESKTOP', 'CONSOLE', 'TABLET'])
    }
  });

  // 2. Juciane (ADMIN)
  await prisma.usuario.create({
    data: {
      nome: 'Juciane',
      login: 'juciane',
      senha_hash: passwordHash,
      cargo: 'ADMIN',
      status: 'ONLINE',
      telefone: '(41) 3565-2008',
      especialidades: JSON.stringify(['NOTEBOOK', 'SMARTPHONE', 'IMPRESSORA', 'PC_DESKTOP', 'CONSOLE', 'TABLET'])
    }
  });

  // 3. Emanuel Carvalho (ADMIN / TÉCNICO ESPECIALISTA)
  await prisma.usuario.create({
    data: {
      nome: 'Emanuel Carvalho',
      login: 'emanuel',
      senha_hash: passwordHash,
      cargo: 'ADMIN',
      status: 'ONLINE',
      telefone: '(41) 3565-2008',
      especialidades: JSON.stringify(['NOTEBOOK', 'SMARTPHONE', 'IMPRESSORA', 'PC_DESKTOP', 'CONSOLE', 'TABLET', 'MACBOOK'])
    }
  });

  // 4. Atendente Balcão
  await prisma.usuario.create({
    data: {
      nome: 'Atendente Recepção',
      login: 'atendente',
      senha_hash: passwordHash,
      cargo: 'ATENDENTE',
      status: 'ONLINE',
      telefone: '(41) 3565-2008',
      especialidades: JSON.stringify(['NOTEBOOK', 'SMARTPHONE'])
    }
  });

  console.log('\n========================================================');
  console.log('✅ BANCO DE DADOS INICIALIZADO COM SUCESSO!');
  console.log('========================================================');
  console.log('👥 USUÁRIOS OFICIAIS (Senha padrão: 123456):');
  console.log('   👑 Emanuel   -> Login: emanuel   (ADMIN)');
  console.log('   👑 Donizete  -> Login: donizete  (ADMIN)');
  console.log('   👑 Juciane   -> Login: juciane   (ADMIN)');
  console.log('   📋 Atendente -> Login: atendente (ATENDENTE)');
  console.log('📦 ESTOQUE LIMPO: 0 produtos cadastrados (Pronto para importar Excel ou cadastrar)');
  console.log('📋 ORDENS DE SERVIÇO: 0 OS');
  console.log('========================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });