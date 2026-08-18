import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando dados de teste e ordens de serviço anteriores...');

  // 1. Limpa ordens, logs e notificações anteriores
  await prisma.notificacao.deleteMany({});
  await prisma.logHistorico.deleteMany({});
  await prisma.ordemServico.deleteMany({});
  await prisma.itemEstoque.deleteMany({});
  await prisma.usuario.deleteMany({});

  console.log('🌱 Cadastrando usuários oficiais: Donizete, Juciane e Emanuel...');

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Donizete (ADMIN)
  const donizete = await prisma.usuario.create({
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
  const juciane = await prisma.usuario.create({
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

  // 3. Emanuel (TÉCNICO ESPECIALISTA)
  const emanuel = await prisma.usuario.create({
    data: {
      nome: 'Emanuel',
      login: 'emanuel',
      senha_hash: passwordHash,
      cargo: 'TECNICO',
      status: 'ONLINE',
      telefone: '(41) 3565-2008',
      especialidades: JSON.stringify(['NOTEBOOK', 'SMARTPHONE', 'IMPRESSORA', 'PC_DESKTOP', 'CONSOLE', 'TABLET'])
    }
  });

  console.log('📦 Cadastrando itens iniciais no estoque com preço de custo e venda...');

  const itensIniciais = [
    { nome: 'SSD 240GB Kingston / Crucial SATA III', categoria: 'SSD', quantidade: 6, estoque_minimo: 2, preco_custo: 150.00, preco_venda: 300.00, localizacao: 'Armário A - Gaveta 1' },
    { nome: 'SSD 480GB Kingston / WD Green SATA III', categoria: 'SSD', quantidade: 5, estoque_minimo: 2, preco_custo: 210.00, preco_venda: 390.00, localizacao: 'Armário A - Gaveta 1' },
    { nome: 'SSD 1TB NVMe M.2 Kingston / Crucial PCIe', categoria: 'SSD', quantidade: 3, estoque_minimo: 1, preco_custo: 360.00, preco_venda: 580.00, localizacao: 'Armário A - Gaveta 2' },
    { nome: 'Memória RAM 8GB DDR4 3200MHz Notebook', categoria: 'MEMORIA', quantidade: 6, estoque_minimo: 2, preco_custo: 120.00, preco_venda: 240.00, localizacao: 'Armário A - Gaveta 3' },
    { nome: 'Memória RAM 16GB DDR4 3200MHz Notebook', categoria: 'MEMORIA', quantidade: 4, estoque_minimo: 2, preco_custo: 220.00, preco_venda: 410.00, localizacao: 'Armário A - Gaveta 3' },
    { nome: 'Memória RAM 8GB DDR4 Desktop 3200MHz', categoria: 'MEMORIA', quantidade: 5, estoque_minimo: 2, preco_custo: 115.00, preco_venda: 230.00, localizacao: 'Armário A - Gaveta 4' },
    { nome: 'Tela Frontal iPhone 11 Incell Premium', categoria: 'TELA', quantidade: 2, estoque_minimo: 1, preco_custo: 160.00, preco_venda: 340.00, localizacao: 'Armário B - Gaveta Telas' },
    { nome: 'Tela Frontal Samsung A10/A20/A30 OLED', categoria: 'TELA', quantidade: 3, estoque_minimo: 1, preco_custo: 140.00, preco_venda: 290.00, localizacao: 'Armário B - Gaveta Telas' },
    { nome: 'Bateria Notebook Dell Inspiron / Vostro', categoria: 'BATERIA', quantidade: 2, estoque_minimo: 1, preco_custo: 140.00, preco_venda: 280.00, localizacao: 'Armário B - Gaveta Baterias' },
    { nome: 'Conector de Carga USB-C Universal (Pacote)', categoria: 'CONECTOR', quantidade: 15, estoque_minimo: 5, preco_custo: 10.00, preco_venda: 90.00, localizacao: 'Gaveta Bancada 1' },
    { nome: 'Pasta Térmica Prata Alta Condutividade 10g', categoria: 'INSUMO', quantidade: 8, estoque_minimo: 2, preco_custo: 25.00, preco_venda: 60.00, localizacao: 'Bancada Manutenção' },
    { nome: 'Tinta Refil Epson T544 / T664 Black 70ml', categoria: 'INSUMO', quantidade: 6, estoque_minimo: 2, preco_custo: 28.00, preco_venda: 65.00, localizacao: 'Prateleira Impressoras' }
  ];

  for (const item of itensIniciais) {
    await prisma.itemEstoque.create({ data: item });
  }

  console.log('\n========================================================');
  console.log('✅ BANCO DE DADOS RESETADO E INICIALIZADO COM SUCESSO!');
  console.log('========================================================');
  console.log('👥 USUÁRIOS OFICIAIS (Senha padrão: 123456):');
  console.log('   👑 Donizete  -> Login: donizete   (ADMIN)');
  console.log('   👑 Juciane   -> Login: juciane    (ADMIN)');
  console.log('   🔧 Emanuel   -> Login: emanuel    (TECNICO)');
  console.log('📦 ESTOQUE INICIAL: 12 itens cadastrados prontos p/ orçamentos');
  console.log('📋 ORDENS DE SERVIÇO: Tabela zerada (0 OS). Pronta para a loja!');
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