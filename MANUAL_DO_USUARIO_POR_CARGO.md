# 📖 Manual do Usuário Scooby OS: Passo a Passo por Cargo
**Desenvolvido por Emanuel Carvalho** • Scooby Assistência Técnica

Este documento é o guia oficial de operação do **Scooby OS**, detalhando o passo a passo para cada membro da equipe: **Atendentes**, **Técnicos Especialistas**, **Técnicos de Celular**, **Trainees**, **Gerentes** e **Administradores**.

---

## 📑 Sumário de Módulos:
1. [💼 Perfil: Atendente de Balcão & Recepção](#-1-perfil-atendente-de-balcão--recepção)
2. [⚡ Serviços Rápidos de Balcão & PDV Expresso](#-2-serviços-rápidos-de-balcão--pdv-expresso)
3. [🔧 Perfil: Técnico Especialista (Notebook, PC, Impressora)](#-3-perfil-técnico-especialista)
4. [📱 Perfil: Técnico Celulares & Consoles (Híbrido)](#-4-perfil-técnico-celulares--consoles)
5. [🎓 Perfil: Técnico Trainee (Em Treinamento)](#-5-perfil-técnico-trainee-em-treinamento)
6. [🛡️ Perfil: Gerente de Oficina (Triagem & Kanban)](#-6-perfil-gerente-de-oficina-triagem--kanban)
7. [👑 Perfil: Administrador Geral (Gestão, Estoque & Faturamento)](#-7-perfil-administrador-geral)
8. [📊 Relatórios Gerenciais: Atendentes & Tempo de Bancada](#-8-relatórios-gerenciais-avançados)
9. [📸 Galeria de Fotos do Equipamento & Rastreio por QR Code](#-9-galeria-de-fotos-do-equipamento--rastreio-por-qr-code)
10. [🖥️ Instalação no Windows Server & Rotina de Backups](#-10-instalação-no-windows-server--rotina-de-backups)
11. [💬 Recursos Compartilhados: Scooby Chat & Interfone de Voz](#-11-recursos-compartilhados-chat--interfone-de-voz)
12. [📋 Tabela Comparativa de Permissões](#-12-tabela-resumo-de-permissões)

---

## 💼 1. Perfil: Atendente de Balcão & Recepção

### 🎯 Principais Atribuições:
* Recepção do cliente e abertura de chamados técnicos.
* **Digitação Manual / Retroativa de OS:** Opção de manter números sequenciais do Bling ou sistemas antigos com data e hora personalizadas.
* **Registro fotográfico de entrada** do equipamento (avarias, riscos e acessórios).
* Aplicação do prazo padrão de 3 dias úteis.
* Disparo de orçamentos e avisos de pronto pelo WhatsApp.
* Entrega do equipamento e recebimento de valores.
* Correção de cadastros (Edição e Exclusão de OSs).

### 🚀 Passo a Passo no Balcão:
1. **Abrir Nova Ordem de Serviço (Padrão ou Importação Manual):**
   * Faça login e clique no botão **"+ Nova Ordem de Serviço"**.
   * **Importação Manual / Sequencial do Bling (Opcional):** Marque a caixa *"Digitar número de OS manualmente (Importar do Bling)"*. O sistema libera a edição do número da OS (ex: `OS-1045`) e os campos de **Data e Hora Retroativa**.
   * Digite o **Nome** e **Telefone / WhatsApp** do cliente.
   * Selecione o tipo de equipamento (*Notebook, Smartphone, PC Desktop, Console, Impressora*) e modelo.
   * **Anexar Fotos de Entrada (Opcional):** Clique em **`+ Tirar / Anexar Fotos`** para fotografar o aparelho com a câmera do celular/tablet ou enviar imagens da galeria.
   * Descreva o defeito informado pelo cliente.
   * **Prazo Automático de 3 Dias:** O sistema já preenche a data para 3 dias úteis. Use os atalhos `⚡ 1 dia`, `⭐ 3 dias`, `🔧 5 dias` ou escolha qualquer data personalizada.
   * Clique em **"Criar Ordem de Serviço"** e imprima a via do cliente com o **QR Code** de rastreio.

2. **Enviar Mensagens de WhatsApp com 1 Clique:**
   * Clique em qualquer OS para abrir os detalhes.
   * Utilize os botões automáticos:
     * `📋 Enviar Orçamento` (Dispara laudo e valor aprovado)
     * `🎉 Avisar: Pronto!` (Notifica que o aparelho pode ser retirado)
     * `📦 Avisar Peça` (Informa que a peça está em trânsito)
     * `🧪 Avisar Testes` (Informa que o aparelho está na fase final de testes)

3. **Editar ou Excluir OS:**
   * Se cometeu algum erro na digitação, clique em **"Editar OS"** para alterar cliente, modelo, defeito ou valores.
   * Se o cliente desistir no balcão antes do início, clique em **"Excluir"**.

---

## ⚡ 2. Serviços Rápidos de Balcão & PDV Expresso

O **Módulo de Venda Balcão (PDV)** foi projetado para agilidade máxima no atendimento diário da loja:

### 🚀 Recursos do PDV:
1. **Grid de Serviços Rápidos (1 Clique):**
   * Botões instantâneos para:
     * 📄 **Impressão Preto & Branco**
     * 🎨 **Impressão Colorida**
     * 💼 **Elaboração / Impressão de Currículo**
     * 🖼️ **Montagem / Edição de Fotos (3x4)**
     * 📑 **Digitalização / Scanner**
     * 🛡️ **Aplicação de Película**
     * 💾 **Backup de Dados / Pen Drive**
     * 🔌 **Desobstrução / Limpeza de Conector**
2. **Atalhos de Quantidade Rápida:**
   * No carrinho, use os botões `+5`, `+10` e `+20` para somar cópias de impressão rapidamente sem precisar digitar.
3. **Item / Serviço Avulso:**
   * Clique em **`+ Item / Serviço Avulso`** para lançar qualquer produto ou serviço especial na hora, digitando o nome e o valor livremente.
4. **⚙️ Tabela de Preços Fixos Editáveis (Admin / Gerente):**
   * Administradores e Gerentes possuem o botão **`⚙️ Editar Preços Fixos`** no topo do painel para alterar valores de venda, custos e cadastrar novos serviços padrão salvos no banco.
5. **Formas de Pagamento & Comprovante Térmico:**
   * Dinheiro (com cálculo automático de troco), PIX, Cartão Débito e Cartão Crédito.
   * Emissão de comprovante térmico e envio direto no WhatsApp do cliente com discriminação clara de serviços vs. produtos com garantia.

---

## 🔧 3. Perfil: Técnico Especialista

### 🎯 Principais Atribuições:
* Diagnóstico de hardware, eletrônica de bancada e reparo de circuitos.
* **Cronômetro de Bancada:** Registro exato do tempo trabalhado no serviço.
* **Fotos Técnicas:** Registro de evidências de micro-solda, peças oxidadas ou danificadas.
* Elaboração do Laudo Técnico e autonomia na precificação de serviços e mão de obra.
* Lançamento de peças utilizadas do catálogo de estoque.

### 🚀 Passo a Passo na Bancada:
1. **Acessar "Minha Bancada":**
   * Ao fazer login, o sistema abre diretamente na sua fila de trabalho.
2. **Iniciar o Reparo e o Cronômetro:**
   * Clique no botão **"Bancada"** no cartão do aparelho.
   * Clique em **`▶ Iniciar Cronômetro`** para registrar o tempo real de trabalho em bancada.
3. **Preencher Laudo & Procedimentos:**
   * Escreva o diagnóstico ou clique nas sugestões rápidas (`+ Desoxidação`, `+ Troca de Display`, `+ Reballing BGA`, etc.).
4. **Adicionar Fotos Técnicas:**
   * Na seção **"Fotos & Evidências do Aparelho"**, clique em **`+ Adicionar Fotos`** para incluir imagens do circuito, componentes trocados ou antes/depois.
5. **Inserir Serviços & Mão de Obra (Autonomia Completa):**
   * Adicione múltiplos procedimentos (ex: *Troca de Conector R$ 90*, *Limpeza R$ 120*, *Reparo de Placa R$ 250*) ou digite novos serviços com valores livres.
6. **Lançar Peças do Estoque:**
   * Selecione as peças utilizadas para dar baixa automática no estoque da loja.
7. **Finalizar ou Salvar:**
   * Ao salvar, o sistema **grava automaticamente o tempo acumulado no cronômetro** e as evidências fotográficas.
   * Se aguarda retorno do cliente: clique em **"Enviar para Aprovação"**.
   * Se concluído: marque o checklist e clique em **"✅ Finalizar / Pronto"**.

---

## 📱 4. Perfil: Técnico Celulares & Consoles

### 🎯 Principais Atribuições:
* Manutenção rápida de smartphones, tablets, controles e videogames.
* Abertura direta e autoatribuição imediata de OS no balcão híbrido.
* Execução de micro-solda, troca de conectores SMD e telas com registro fotográfico.

### 🚀 Passo a Passo no Módulo Celulares:
1. Acesse o menu **"Módulo Celulares"** (`/celular-hibrido`).
2. Se o cliente estiver na sua frente, abra a OS marcando **"Iniciar atendimento imediatamente na minha bancada"**.
3. O aparelho entra direto como `EM_ANDAMENTO` na sua bancada sem precisar passar pela fila de triagem.
4. Anexe fotos da tela ou conector danificado diretamente na bancada.

---

## 🎓 5. Perfil: Técnico Trainee (Em Treinamento)

### 🎯 Principais Atribuições:
* Execução de manutenções de nível inicial sob supervisão (formatação, limpeza preventiva, troca de periféricos e testes de estresse).
* Apoio no balcão, triagem e controle de tempo de bancada.
* Capacitação contínua e comunicação com técnicos seniores via Chat/Voz.

### 🚀 Passo a Passo do Trainee:
1. Acesse **"Minha Bancada"** para ver os reparos designados pelo Gerente com o crachá especial de Trainee.
2. Inicie o cronômetro para monitorar o seu ritmo de aprendizado em cada tarefa.
3. Execute o checklist de testes de qualidade antes de liberar o aparelho.
4. Se tiver qualquer dúvida durante o diagnóstico, utilize o **Scooby Chat** ou o **Interfone de Voz** para falar diretamente com o técnico sênior ou gerente.

---

## 🛡️ 6. Gerente de Oficina (Triagem & Kanban)

### 🎯 Principais Atribuições:
* Gestão visual do fluxo de trabalho através do Painel Kanban.
* Distribuição e atribuição de aparelhos aos técnicos e trainees.
* Monitoramento de prazos críticos (SLA), tempos de bancada e eliminação de gargalos.

### 🚀 Passo a Passo no Kanban:
1. Acesse o menu **"Painel Triagem (Kanban)"** (`/gerente`).
2. Na coluna **Triagem & Entrada**, clique no botão **"+ Atribuir"** e designe o técnico responsável de acordo com a especialidade.
3. Monitore os cartões com alertas vermelhos de **SLA Crítico** para cobrar prioridade nos testes ou aprovações.
4. Abra os detalhes de qualquer OS para checar as fotos anexadas e o tempo que o técnico já trabalhou nela.

---

## 👑 7. Administrador Geral

### 🎯 Principais Atribuições:
* Apuração de faturamento consolidado, custos de estoque e lucro líquido real (Sigilo Exclusivo).
* **Auditoria de Produtividade & Tempo:** Acompanhamento do tempo que cada técnico dedica a cada chamado e quanto cada atendente vendeu.
* Cadastro e gestão de equipe (cargos, senhas e permissões).
* Controle de catálogo de peças, estoque de novos/usados e serviços com alertas de reposição.
* Manutenção do servidor, rotina de backups e infraestrutura de alta escala.

### 🚀 Passo a Passo Administrativo:
1. **Faturamento & Relatórios:** Acesse `/admin/relatorios` para ver a receita consolidada, lucro real, desempenho de vendas por atendente e produtividade técnica.
2. **Auditoria de Bancada:** Veja no extrato detalhado de cada OS a coluna com o **Tempo Exato Trabalhado em Bancada**.
3. **Gerenciar Usuários:** Acesse `/admin/usuarios` para criar novos logins, definir cargos (*Admin, Gerente, Atendente, Técnico, Trainee*) e resetar senhas.
4. **Estoque de Novos & Usados:** Acesse `/admin/estoque` para cadastrar peças, notebooks seminovos, emitir relatórios e baixar/enviar planilhas Excel.

---

## 📊 8. Relatórios Gerenciais Avançados

O módulo de relatórios (`/admin/relatorios`) traz controle total da operação:

### 🛍️ A. Relatório de Vendas por Atendente:
* Faturamento total e lucro gerado por cada atendente/vendedor no período.
* Botão **"Ver O Que Vendeu"**: abre o detalhamento com a lista exata de quais produtos e serviços cada atendente vendeu, quantidades e valores individuais.

### ⏱️ B. Produtividade Técnica & Tempo de Bancada:
* Tempo total acumulado pelo técnico em horas e minutos.
* Tempo médio por conserto (`ex: 45min / OS`).
* Tempo exato registrado no cronômetro em cada ordem de serviço finalizada.

### 💰 C. Faturamento Consolidado:
* Visão global somando faturamento e lucro líquido de **Ordens de Serviço + Vendas Balcão**.

---

## 📸 9. Galeria de Fotos do Equipamento & Rastreio por QR Code

1. **Galeria de Fotos:**
   * Tanto atendentes quanto técnicos podem anexar até 5 fotos por OS (fotos de entrada, avarias, placas, circuitos e testes).
   * As fotos são compactadas automaticamente para economizar espaço e carregar instantaneamente.
2. **Rastreio por QR Code:**
   * O comprovante impresso contém um QR Code exclusivo para o cliente escanear no celular e acompanhar o status do reparo em tempo real.

---

## 🖥️ 10. Instalação no Windows Server & Rotina de Backups

Para rodar o Scooby OS 24/7 na rede local da empresa:

1. **Instalação em 1 Clique:**
   * Execute o arquivo **`INSTALAR_WINDOWS_SERVER.bat`** como Administrador no servidor.
   * O script configura o banco PostgreSQL 16, Redis 7, compila o frontend, libera a **porta 3001 no Firewall** e agenda backups diários.
2. **Backups Automáticos:**
   * Diariamente às **19:00h**, o script `GERAR_BACKUP_BANCO.bat` salva uma cópia `.sql` na pasta `backups/`, mantendo os últimos 30 dias.
3. **Restauração Rápida:**
   * Em caso de necessidade, execute **`RESTAURAR_BACKUP_BANCO.bat`** e escolha a cópia desejada.
4. **Atualizações Sem Perder Dados:**
   * Execute **`ATUALIZAR_SISTEMA_SEM_PERDER_DADOS.bat`** para baixar melhorias do GitHub sem alterar cadastros ou histórico.

---

## 💬 11. Recursos Compartilhados: Chat & Interfone de Voz

* **Onde acessar:** Botão **`💬 Chat & Voz`** presente no canto superior de todas as telas.
* **Canais:**
  * `#GERAL` (avisos gerais para toda a equipe)
  * `#BANCADA` (conversas técnicas entre bancadas e trainees)
* **Recados de Voz:** Segure o botão do microfone para enviar áudios rápidos gravados.
* **Interfone ao Vivo (Ligação de Voz):** Clique no ícone de telefone ao lado do nome do colaborador. O sistema tocará o som de chamada no computador dele e iniciará a conversa por voz via WebRTC.

---

## 📋 12. Tabela Resumo de Permissões

| Funcionalidade | Atendente | Trainee | Técnico | Técnico Celular | Gerente | Administrador |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Abrir Novas OSs (com Fotos)** | ✅ Sim | ✅ Sim | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim |
| **Digitação Manual / Retroativa de OS** | ✅ Sim | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim |
| **Venda Balcão (PDV Expresso)** | ✅ Sim | ❌ Não | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim |
| **Editar Preços Fixos de Serviços** | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim |
| **Minha Bancada & Cronômetro** | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Anexar Fotos Técnicas** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Painel Kanban Geral (Triagem)** | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim |
| **Auditoria de Tempo de Bancada** | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ✅ Sim | 👑 Completa |
| **Relatórios de Atendentes & Vendas** | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ❌ Não | 👑 Exclusivo |
| **Faturamento & Lucro Real** | ❌ Sigilo | ❌ Sigilo | ❌ Sigilo | ❌ Sigilo | ❌ Sigilo | 👑 Exclusivo |
| **Gerenciar Usuários & Senhas** | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ❌ Não | 👑 Exclusivo |
| **Importar / Exportar Estoque Excel** | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ❌ Não | 👑 Exclusivo |

---
*Documento oficial desenvolvido por Emanuel Carvalho • Scooby Assistência Técnica.*
