# 🐕 Guia Completo de Instalação e Deploy no Windows Server (Scooby OS)

Este guia orienta passo a passo como configurar o **Scooby OS** em um computador ou servidor dedicado rodando **Windows Server**, **Windows 10 Pro** ou **Windows 11 Pro** para operar 24 horas por dia na rede local da empresa.

---

## 🏛️ 1. Arquitetura da Rede Local

```
                  ┌──────────────────────────────────────────────┐
                  │           SERVIDOR CENTRAL (Loja)            │
                  │  • IP Local Fixo: 192.168.100.50 (Exemplo)   │
                  │  • PostgreSQL 16 (Porta 5432)                │
                  │  • Redis 7 (Porta 6379)                      │
                  │  • Scooby OS Server (Porta 3001)             │
                  └──────────────────────┬───────────────────────┘
                                         │ Rede Local (Cabo / Wi-Fi da Oficina)
             ┌───────────────────────────┼───────────────────────────┐
             ▼                           ▼                           ▼
   ┌────────────────────┐      ┌────────────────────┐      ┌────────────────────┐
   │    ATENDIMENTO     │      │  BANCADA TÉCNICA   │      │    ADMINISTRADOR   │
   │  (Recepção / PDV)  │      │  (Donizete, etc.)  │      │  (Gerência / Dono) │
   │ 192.168.100.50:3001│      │ 192.168.100.50:3001│      │ 192.168.100.50:3001│
   └────────────────────┘      └────────────────────┘      └────────────────────┘
```

---

## 📋 2. Pré-requisitos no Servidor (Instalar 1 única vez)

1. **Node.js (v20 ou superior)**:
   * Download: https://nodejs.org (Versão LTS).
   * Marque a opção de adicionar ao PATH durante a instalação.
2. **Docker Desktop for Windows**:
   * Download: https://www.docker.com/products/docker-desktop/
   * Garanta que o serviço do Docker esteja configurado para iniciar com o Windows.
3. **Git for Windows** (Opcional, mas recomendado para receber atualizações):
   * Download: https://git-scm.com

---

## 🚀 3. Instalação em 1 Clique

1. Baixe ou clone a pasta do projeto no servidor (ex: `C:\Scooby_OS`).
2. Clique com o **botão direito** no arquivo **`INSTALAR_WINDOWS_SERVER.bat`** e selecione **"Executar como Administrador"**.
3. O script executará automaticamente:
   * ✅ Verificação de Node.js e Docker.
   * ✅ Inicialização dos contêineres do **PostgreSQL 16** e **Redis 7**.
   * ✅ Instalação e atualização de todas as dependências (`npm install`).
   * ✅ Sincronização do esquema do banco de dados (`prisma db push`).
   * ✅ Compilação do Frontend integrado para alta performance (`npm run build`).
   * ✅ **Abertura da Porta 3001 no Firewall do Windows** para permitir o acesso de outros computadores da rede.
   * ✅ **Agendamento automático de Backup Diário** (todos os dias às 19:00h).

---

## 📡 4. Como Acessar de Outros Computadores

1. No servidor, verifique o IP Local (o script `INSTALAR_WINDOWS_SERVER.bat` exibe na tela ao final).
   * *Exemplo:* `192.168.100.73`
2. Em qualquer computador, notebook, tablet ou celular conectado no Wi-Fi/cabo da empresa:
   * Abra o navegador (Google Chrome, Edge) e acesse:
     👉 **`http://192.168.100.73:3001`**
3. **Criar Atalho de 1 Clique no Desktop dos Clientes:**
   * No computador do atendente ou técnico, crie um atalho na Área de Trabalho com o endereço acima.

---

## 💾 5. Rotina de Backups e Segurança

* **Backup Automático Diário:** O sistema executa o script `GERAR_BACKUP_BANCO.bat` diariamente às 19:00h e salva o dump `.sql` na pasta `backups/`, mantendo os últimos 30 dias.
* **Backup Manual Instantâneo:** Basta dar um duplo clique em **`GERAR_BACKUP_BANCO.bat`**.
* **Restaurar um Backup:** Dê um duplo clique em **`RESTAURAR_BACKUP_BANCO.bat`**, escolha o arquivo desejado e confirme com `SIM`.

---

## 🔄 6. Como Atualizar o Sistema Sem Perder Nenhum Dado

Quando houver novas atualizações desenvolvidas:
1. No servidor, dê um duplo clique no arquivo **`ATUALIZAR_SISTEMA_SEM_PERDER_DADOS.bat`**.
2. Ele fará o `git pull`, atualizará as tabelas do banco, recompilará o frontend e reiniciará o serviço sem alterar seus dados existentes.
