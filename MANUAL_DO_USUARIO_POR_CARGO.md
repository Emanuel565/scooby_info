# 📖 Manual do Usuário Scooby OS: Passo a Passo por Cargo

Este documento é o guia oficial de operação do **Scooby OS**, detalhando o passo a passo para cada membro da equipe: **Atendentes**, **Técnicos Especialistas**, **Técnicos de Celular**, **Trainees**, **Gerentes** e **Administradores**.

---

## 📑 Sumário de Módulos:
1. [💼 Perfil: Atendente de Balcão & Recepção](#-1-perfil-atendente-de-balcão--recepção)
2. [🔧 Perfil: Técnico Especialista (Notebook, PC, Impressora)](#-2-perfil-técnico-especialista)
3. [📱 Perfil: Técnico Celulares & Consoles (Híbrido)](#-3-perfil-técnico-celulares--consoles)
4. [🎓 Perfil: Técnico Trainee (Em Treinamento)](#-4-perfil-técnico-trainee-em-treinamento)
5. [🛡️ Perfil: Gerente de Oficina (Triagem & Kanban)](#-5-perfil-gerente-de-oficina-triagem--kanban)
6. [👑 Perfil: Administrador Geral (Gestão, Estoque & Faturamento)](#-6-perfil-administrador-geral)
7. [💬 Recursos Compartilhados: Scooby Chat & Interfone de Voz](#-7-recursos-compartilhados-chat--interfone-de-voz)
8. [📊 Tabela Comparativa de Permissões](#-8-tabela-resumo-de-permissões)

---

## 💼 1. Perfil: Atendente de Balcão & Recepção

### 🎯 Principais Atribuições:
* Recepção do cliente e abertura de chamados técnicos.
* Aplicação do prazo padrão de 3 dias úteis.
* Disparo de orçamentos e avisos de pronto pelo WhatsApp.
* Entrega do equipamento e recebimento de valores.
* Correção de cadastros (Edição e Exclusão de OSs).

### 🚀 Passo a Passo no Balcão:
1. **Abrir Nova Ordem de Serviço:**
   * Faça login e clique no botão **"+ Nova Ordem de Serviço"**.
   * Digite o **Nome** e **Telefone / WhatsApp** do cliente.
   * Selecione o tipo de equipamento (*Notebook, Smartphone, PC Desktop, Console, Impressora*) e modelo.
   * Descreva o defeito informado pelo cliente.
   * **Prazo Automático de 3 Dias:** O sistema já preenche a data para 3 dias úteis. Use os atalhos `⚡ 1 dia`, `⭐ 3 dias`, `🔧 5 dias` ou escolha qualquer data personalizada.
   * Clique em **"Criar Ordem de Serviço"** e imprima a via do cliente com o **QR Code** de rastreio.

2. **Enviar Mensagens de WhatsApp:**
   * Clique em qualquer OS para abrir os detalhes.
   * Utilize os botões com 1 clique:
     * `📋 Enviar Orçamento` (Dispara laudo e valor aprovado)
     * `🎉 Avisar: Pronto!` (Notifica que o aparelho pode ser retirado)
     * `📦 Avisar Peça` (Informa que a peça está em trânsito)

3. **Editar ou Excluir OS:**
   * Se cometeu algum erro na digitação, clique em **"Editar OS"** para alterar cliente, modelo, defeito ou valores.
   * Se o cliente desistir no balcão antes do início, clique em **"Excluir"**.

---

## 🔧 2. Perfil: Técnico Especialista

### 🎯 Principais Atribuições:
* Diagnóstico de hardware, eletrônica de bancada e reparo de placas.
* Elaboração do Laudo Técnico.
* Definição de Mão de Obra e Serviços executados.
* Lançamento de peças utilizadas do estoque.
* Controle de tempo de bancada (Cronômetro).

### 🚀 Passo a Passo na Bancada:
1. **Acessar "Minha Bancada":**
   * Ao fazer login, o sistema abre diretamente na sua fila de trabalho.
2. **Iniciar o Reparo:**
   * Clique no botão **"Bancada"** no cartão do aparelho.
   * Clique em **`▶ Iniciar Cronômetro`** para registrar o tempo de bancada.
3. **Preencher Laudo & Procedimentos:**
   * Escreva o diagnóstico ou clique nas sugestões rápidas (`+ Desoxidação`, `+ Troca de Display`, etc.).
4. **Inserir Serviços & Mão de Obra (Autonomia Completa):**
   * Adicione múltiplos procedimentos (ex: *Troca de Conector R$ 90*, *Limpeza R$ 120*, *Reparo de Placa R$ 250*) ou digite novos serviços com valores livres.
5. **Lançar Peças:**
   * Selecione as peças utilizadas do estoque para dar baixa automática na quantidade.
6. **Finalizar:**
   * Se aguarda retorno do cliente: clique em **"Enviar para Aprovação"**.
   * Se concluído: marque o checklist e clique em **"✅ Finalizar / Pronto"**.

---

## 📱 3. Perfil: Técnico Celulares & Consoles

### 🎯 Principais Atribuições:
* Manutenção rápida de smartphones, tablets, controles e videogames.
* Abertura direta e autoatribuição imediata de OS no balcão híbrido.
* Execução de micro-solda, troca de conectores SMD e telas.

### 🚀 Passo a Passo no Módulo Celulares:
1. Acesse o menu **"Módulo Celulares"** (`/celular-hibrido`).
2. Se o cliente estiver na sua frente, abra a OS marcando **"Iniciar atendimento imediatamente na minha bancada"**.
3. O aparelho entra direto como `EM_ANDAMENTO` na sua bancada sem precisar passar pela fila de triagem.

---

## 🎓 4. Perfil: Técnico Trainee (Em Treinamento)

### 🎯 Principais Atribuições:
* Execução de manutenções de nível inicial sob supervisão (formatação, limpeza preventiva, testes de estresse e troca de periféricos).
* Apoio no balcão e triagem.
* Capacitação contínua e comunicação com técnicos seniores.

### 🚀 Passo a Passo do Trainee:
1. Acesse **"Minha Bancada"** para ver os reparos designados pelo Gerente.
2. Execute o checklist de testes de qualidade antes de liberar o aparelho.
3. Se tiver qualquer dúvida durante o diagnóstico, utilize o **Scooby Chat** ou o **Interfone de Voz** para falar diretamente com o técnico responsável ou gerente.

---

## 🛡️ 5. Gerente de Oficina (Triagem & Kanban)

### 🎯 Principais Atribuições:
* Gestão visual do fluxo de trabalho através do Painel Kanban.
* Distribuição e atribuição de aparelhos aos técnicos e trainees.
* Monitoramento de prazos críticos (SLA) e eliminação de gargalos.

### 🚀 Passo a Passo no Kanban:
1. Acesse o menu **"Painel Triagem (Kanban)"** (`/gerente`).
2. Na coluna **Triagem & Entrada**, clique no botão **"+ Atribuir"** e designe o técnico responsável de acordo com a especialidade.
3. Monitore os cartões com alertas vermelhos de **SLA Crítico** para cobrar prioridade nos testes ou aprovações.

---

## 👑 6. Administrador Geral

### 🎯 Principais Atribuições:
* Apuração de faturamento bruto, custos de estoque e lucro líquido real (Sigilo Exclusivo).
* Cadastro e gestão de equipe (cargos, senhas e permissões).
* Controle de catálogo de peças e estoque.
* Manutenção do servidor, backups e túnel de acesso remoto.

### 🚀 Passo a Passo Administrativo:
1. **Faturamento & Relatórios:** Acesse `/admin/relatorios` para ver a receita total, margem de lucro % e gráficos de desempenho.
2. **Gerenciar Usuários:** Acesse `/admin/usuarios` para criar novos logins, definir cargos (*Admin, Gerente, Atendente, Técnico, Trainee*) e resetar senhas.
3. **Controle de Estoque:** Acesse `/admin/estoque` para cadastrar peças, valores de custo/venda e alertas de estoque mínimo.

---

## 💬 7. Recursos Compartilhados: Chat & Interfone de Voz

* **Onde acessar:** Botão **`💬 Chat & Voz`** presente no canto superior de todas as telas.
* **Canais:**
  * `#GERAL` (avisos gerais para toda a equipe)
  * `#BANCADA` (conversas técnicas entre bancadas e trainees)
* **Recados de Voz:** Segure o botão do microfone para enviar áudios rápidos gravados.
* **Interfone ao Vivo (Ligação de Voz):** Clique no ícone de telefone ao lado do nome do colaborador. O sistema tocará o som de chamada no computador dele e iniciará a conversa por voz via WebRTC.

---

## 📊 8. Tabela Resumo de Permissões

| Funcionalidade | Atendente | Trainee | Técnico | Gerente | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Abrir Novas OSs** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Bancada Técnica & Laudos** | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Editar & Excluir OS** | ✅ Sim | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim |
| **Disparar Mensagens WhatsApp** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Painel Kanban Geral** | ❌ Não | ❌ Não | ❌ Não | ✅ Sim | ✅ Sim |
| **Faturamento & Lucro Real** | ❌ Sigilo | ❌ Sigilo | ❌ Sigilo | ❌ Sigilo | 👑 Exclusivo |
| **Gerenciar Usuários & Senhas** | ❌ Não | ❌ Não | ❌ Não | ❌ Não | 👑 Exclusivo |

---
*Documento gerado e sincronizado com o repositório oficial do Scooby OS.*
