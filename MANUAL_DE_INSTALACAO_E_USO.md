# 📖 Manual Passo a Passo: Instalação e Uso do Scooby OS
**Desenvolvido por Emanuel Carvalho** • Scooby Assistência Técnica

Este guia detalha como instalar, configurar e operar o **Scooby OS** no computador Servidor (Central) e nas estações de trabalho da sua assistência técnica (**Windows** e **ChromeOS Flex**), além de cobrir os recursos avançados de **Fotos no QR Code**, **Timer de Bancada**, **Cache de Alta Escala** e perfis de usuário (**Trainee**, **Técnico**, **Atendente**, **Gerente**, **Admin**).

---

## 🏗️ 1. Como a Estrutura Funciona na Loja

* **Computador Servidor (Central):** É o computador principal onde os dados de todas as Ordens de Serviço, históricos, peças e fotos ficam salvos (banco de dados SQLite com índices B-Tree + Cache ultra-rápido).
* **Computadores Clientes (Balcão / Bancadas / Gerência):** Conectam-se ao servidor através do Wi-Fi ou cabo de rede local da loja, abrindo em janela própria como aplicativo nativo.

---

## 🚀 2. Passo a Passo no Computador SERVIDOR (Windows)

1. **Abra a pasta do projeto `scooby`.**
2. **Execute o instalador:**
   - Dê 2 cliques no arquivo [`INSTALADOR_SCOOBY_OS.bat`](file:///c:/Users/manuc/OneDrive/Documentos/scooby/INSTALADOR_SCOOBY_OS.bat).
   - Digite `1` e pressione `Enter` para selecionar **"INSTALAR COMO SERVIDOR PRINCIPAL"**.
3. O instalador irá automaticamente:
   - Verificar o Node.js.
   - Liberar a porta 3001 no Firewall do Windows.
   - Compilar o sistema e inicializar o banco de dados.
   - Criar o atalho **"Scooby OS - Servidor Central"** na Área de Trabalho.
4. **Como Ligar o Servidor:**
   - Basta dar 2 cliques no atalho **"Scooby OS - Servidor Central"** na Área de Trabalho.
   - O servidor iniciará e abrirá automaticamente no navegador em `http://localhost:3001`.

---

## ⚡ 3. Alta Escala & Cache (Redis / In-Memory)

O sistema possui uma camada de aceleração híbrida e resiliente:
* **Modo Padrão (Sem Docker):** O sistema utiliza cache em memória RAM local ultra-rápido de forma 100% automática, sem requerer nenhuma instalação extra.
* **Modo Redis Opcional (Docker):** Para utilizar o Redis com interface gráfica web:
  ```bash
  docker compose up -d
  ```
  O Redis rodará na porta `6379` e a interface de gerenciamento estará disponível em `http://localhost:8081`.

---

## 💻 4. Passo a Passo nas Outras Máquinas com WINDOWS (Clientes)

Você pode instalar o atalho nas outras máquinas com Windows da loja de duas formas:

### Opção A: Usando o Instalador (Mais Rápido)
1. Copie o arquivo [`INSTALAR_ESTACAO_CLIENTE_WINDOWS.bat`](file:///c:/Users/manuc/OneDrive/Documentos/scooby/INSTALAR_ESTACAO_CLIENTE_WINDOWS.bat) para o outro computador (via pendrive ou rede).
2. Dê 2 cliques no arquivo.
3. Digite o IP do servidor (ex: `192.168.100.8`) e pressione `Enter`.
4. Um atalho chamado **"Scooby OS - Oficina"** será criado na Área de Trabalho, abrindo o sistema em **modo janela de aplicativo nativo** (sem barras de navegador).

### Opção B: Direto pelo Navegador (Edge ou Chrome)
1. No outro computador, abra o **Microsoft Edge** ou **Google Chrome**.
2. Digite o endereço do servidor: `http://192.168.100.8:3001`
3. Na barra de endereços, clique no ícone **"Instalar Aplicativo"** (ou menu `...` -> *Aplicativos* -> *Instalar este site como aplicativo*).

---

## 🖥️ 5. Passo a Passo no CHROMEOS FLEX / Chromebooks

1. Conecte o aparelho com ChromeOS Flex no **Wi-Fi da loja**.
2. Abra o navegador **Google Chrome**.
3. Digite o endereço do servidor:
   ```text
   http://192.168.100.8:3001
   ```
4. Na barra de endereços (ao lado do botão de favoritos), clique no botão **"Instalar Scooby OS"** (ícone de computador com seta para baixo ou `+`).
5. Clique em **"Instalar"**. O Scooby OS abrirá imediatamente em janela própria em tela cheia.
6. **Fixar na Barra:** Clique com o botão direito no ícone do Scooby OS na barra inferior (Prateleira) e clique em **"Fixar"**.

---

## 📸 6. Recursos Chave do Sistema

### 1. Fotos no QR Code & Entrada
* Na abertura da OS ou na bancada técnica, atendentes e técnicos podem tirar e anexar fotos do aparelho (arranhões, tela trincada, placas oxidadas e reparo final).
* O cliente tem acesso a todas as fotos ao apontar o celular para o **QR Code** impresso no comprovante.

### 2. Timer de Bancada & Auditoria
* O técnico aciona o cronômetro (`▶ Iniciar / ⏸ Pausar`) durante o reparo.
* O tempo exato é salvo na OS e auditado por Administradores e Gerentes nos relatórios e nos detalhes do chamado.

---

## 🔑 7. Perfis e Senhas de Acesso

| Usuário | Login | Perfil / Cargo | Acesso Principal |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `ADMIN` | Faturamento, lucro real, métricas de tempo, estoque e gestão de equipe |
| **Carlos Silva** | `carlos.gerente` | `GERENTE` | Triagem Kanban, distribuição de OS e auditoria de laudos |
| **Mariana Costa** | `mariana.atendente` | `ATENDENTE` | Balcão, abertura de OS com fotos, edição/exclusão e WhatsApp |
| **Rafael Souza** | `rafael.tecnico` | `TECNICO` | Bancada Note/PC/Impressora com cronômetro e laudos técnicos |
| **Lucas Mendes** | `lucas.celular` | `TECNICO_CELULAR` | Módulo Celulares com autoatribuição imediata no balcão |
| **Trainee** | `trainee` | `TRAINEE` | Técnico em treinamento com supervisão e crachá dourado |

*Senha padrão para todos os usuários:* **`123456`**

---

## ⚙️ 8. Resumo dos Arquivos Executáveis

* [`INSTALADOR_SCOOBY_OS.bat`](file:///c:/Users/manuc/OneDrive/Documentos/scooby/INSTALADOR_SCOOBY_OS.bat) - Assistente principal de instalação com menu gráfico.
* [`INICIAR_SCOOBY_OS.bat`](file:///c:/Users/manuc/OneDrive/Documentos/scooby/INICIAR_SCOOBY_OS.bat) - Inicia o servidor e abre o sistema.
* [`INSTALAR_ESTACAO_CLIENTE_WINDOWS.bat`](file:///c:/Users/manuc/OneDrive/Documentos/scooby/INSTALAR_ESTACAO_CLIENTE_WINDOWS.bat) - Configura atalho de app nativo em estações clientes.
* [`CONFIGURAR_FIREWALL_WINDOWS.bat`](file:///c:/Users/manuc/OneDrive/Documentos/scooby/CONFIGURAR_FIREWALL_WINDOWS.bat) - Libera a porta 3001 no Firewall do Windows.
* [`MANUAL_DO_USUARIO_POR_CARGO.pdf`](file:///c:/Users/manuc/OneDrive/Documentos/scooby/MANUAL_DO_USUARIO_POR_CARGO.pdf) - Manual oficial completo diagramado para impressão.