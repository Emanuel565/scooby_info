import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando dados anteriores para inicialização limpa...');

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

  console.log('📦 Cadastrando produtos novos e usados no estoque...');

  const itensIniciais = [
    // PRODUTOS USADOS / SEMINOVOS REVISADOS
    { nome: 'Notebook Dell Latitude Core i5 8GB SSD 256GB (Usado Revisado)', categoria: 'NOTEBOOK', condicao: 'USADO', quantidade: 2, estoque_minimo: 1, preco_custo: 850.00, preco_venda: 1450.00, garantia_meses: 3, detalhes_condicao: 'Bateria 90%, carcaça impecável, acompanha carregador original', localizacao: 'Vitrine 1' },
    { nome: 'Notebook Lenovo ThinkPad Core i7 16GB SSD 512GB (Usado Revisado)', categoria: 'NOTEBOOK', condicao: 'USADO', quantidade: 1, estoque_minimo: 1, preco_custo: 1200.00, preco_venda: 1990.00, garantia_meses: 3, detalhes_condicao: 'Excelente estado, teclado retroiluminado', localizacao: 'Vitrine 1' },
    { nome: 'Placa Mãe Asus H110M LGA 1151 DDR4 (Usada Testada 100%)', categoria: 'PLACA_MAE', condicao: 'USADO', quantidade: 3, estoque_minimo: 1, preco_custo: 180.00, preco_venda: 340.00, garantia_meses: 3, detalhes_condicao: 'Testada em estresse de bancada, todos os slots e saídas 100%', localizacao: 'Prateleira Peças Usadas' },
    { nome: 'Placa de Vídeo GTX 1660 Super 6GB GDDR6 (Usada Revisada)', categoria: 'PLACA_VIDEO', condicao: 'USADO', quantidade: 2, estoque_minimo: 1, preco_custo: 550.00, preco_venda: 890.00, garantia_meses: 3, detalhes_condicao: 'Pasta térmica trocada, ventoinhas novas', localizacao: 'Vitrine 2' },
    { nome: 'Memória RAM 8GB DDR3 Desktop 1600MHz Kingston (Usada)', categoria: 'MEMORIA', condicao: 'USADO', quantidade: 8, estoque_minimo: 2, preco_custo: 40.00, preco_venda: 95.00, garantia_meses: 3, localizacao: 'Gaveta Usados A' },
    { nome: 'SSD 240GB Kingston SATA III (Usado Saudável 100%)', categoria: 'SSD', condicao: 'USADO', quantidade: 5, estoque_minimo: 2, preco_custo: 60.00, preco_venda: 130.00, garantia_meses: 3, detalhes_condicao: 'Saúde CrystalDiskInfo 100%', localizacao: 'Gaveta Usados A' },

    // PRODUTOS NOVOS
    { nome: 'SSD 240GB Kingston / Crucial SATA III (Novo Lacrado)', categoria: 'SSD', condicao: 'NOVO', quantidade: 6, estoque_minimo: 2, preco_custo: 150.00, preco_venda: 300.00, garantia_meses: 12, localizacao: 'Armário A1' },
    { nome: 'SSD 480GB Kingston / WD Green SATA III (Novo Lacrado)', categoria: 'SSD', condicao: 'NOVO', quantidade: 5, estoque_minimo: 2, preco_custo: 210.00, preco_venda: 390.00, garantia_meses: 12, localizacao: 'Armário A1' },
    { nome: 'SSD 1TB NVMe M.2 Kingston NV2 (Novo Lacrado)', categoria: 'SSD', condicao: 'NOVO', quantidade: 3, estoque_minimo: 1, preco_custo: 360.00, preco_venda: 580.00, garantia_meses: 12, localizacao: 'Armário A1' },
    { nome: 'Memória RAM 8GB DDR4 3200MHz Notebook / SODIMM (Nova)', categoria: 'MEMORIA', condicao: 'NOVO', quantidade: 6, estoque_minimo: 2, preco_custo: 120.00, preco_venda: 240.00, garantia_meses: 12, localizacao: 'Gaveta B1' },
    { nome: 'Memória RAM 16GB DDR4 3200MHz Notebook / SODIMM (Nova)', categoria: 'MEMORIA', condicao: 'NOVO', quantidade: 4, estoque_minimo: 1, preco_custo: 220.00, preco_venda: 410.00, garantia_meses: 12, localizacao: 'Gaveta B1' },
    { nome: 'Memória RAM 8GB DDR4 3200MHz Desktop (Nova)', categoria: 'MEMORIA', condicao: 'NOVO', quantidade: 5, estoque_minimo: 2, preco_custo: 115.00, preco_venda: 230.00, garantia_meses: 12, localizacao: 'Gaveta B1' },
    { nome: 'Tela Frontal iPhone 11 Incell Premium', categoria: 'TELA', condicao: 'NOVO', quantidade: 2, estoque_minimo: 1, preco_custo: 160.00, preco_venda: 340.00, garantia_meses: 3, localizacao: 'Gaveta Telas C1' },
    { nome: 'Tela Frontal Samsung A10 / A20 / A30 OLED', categoria: 'TELA', condicao: 'NOVO', quantidade: 3, estoque_minimo: 1, preco_custo: 140.00, preco_venda: 290.00, garantia_meses: 3, localizacao: 'Gaveta Telas C2' },
    { nome: 'Bateria iPhone 11 com Chip', categoria: 'BATERIA', condicao: 'NOVO', quantidade: 3, estoque_minimo: 1, preco_custo: 90.00, preco_venda: 220.00, garantia_meses: 3, localizacao: 'Gaveta Baterias' },
    { nome: 'Conector de Carga USB-C Universal', categoria: 'CONECTOR', condicao: 'NOVO', quantidade: 15, estoque_minimo: 5, preco_custo: 10.00, preco_venda: 90.00, garantia_meses: 3, localizacao: 'Gaveteiro Miudezas' },
    { nome: 'Pasta Térmica Prata Alta Condutividade (Seringa)', categoria: 'INSUMO', condicao: 'NOVO', quantidade: 8, estoque_minimo: 3, preco_custo: 25.00, preco_venda: 60.00, garantia_meses: 12, localizacao: 'Bancada Insumos' },
    { nome: 'Tinta Refil Epson 664 / 544 Black 70ml', categoria: 'INSUMO', condicao: 'NOVO', quantidade: 6, estoque_minimo: 2, preco_custo: 28.00, preco_venda: 65.00, garantia_meses: 12, localizacao: 'Prateleira Impressoras' }
  ];

  for (const item of itensIniciais) {
    await prisma.itemEstoque.create({ data: item });
  }

  console.log('\n========================================================');
  console.log('✅ BANCO DE DADOS INICIALIZADO COM SUCESSO!');
  console.log('========================================================');
  console.log('👥 USUÁRIOS OFICIAIS (Senha padrão: 123456):');
  console.log('   👑 Emanuel   -> Login: emanuel   (ADMIN)');
  console.log('   👑 Donizete  -> Login: donizete  (ADMIN)');
  console.log('   👑 Juciane   -> Login: juciane   (ADMIN)');
  console.log('   📋 Atendente -> Login: atendente (ATENDENTE)');
  console.log('📦 CATÁLOGO DE ESTOQUE: 18 produtos cadastrados (Novos e Usados)');
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