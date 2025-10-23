# 🤖 IA Conversacional Multiplataforma para Atendimento Automático

**Autor:** Gabriel Demetrios Lafis

Esta solução oferece um **Assistente de IA Conversacional** robusto e flexível, projetado para atender clientes automaticamente em **múltiplos canais**. O projeto é apresentado em duas versões de backend (Python e Node.js/JavaScript) para máxima adaptabilidade, além de um frontend web simples para demonstração.

---

## 🎯 Visão Geral do Projeto

A arquitetura é baseada em uma **API central** que gerencia a lógica de conversação com a IA (utilizando a API do OpenAI) e mantém o contexto de cada usuário. Essa API é o ponto de integração para todos os canais de comunicação.

### 🏗️ Arquitetura

| Componente | Função Principal | Tecnologias |
| :--- | :--- | :--- |
| **Backend (API)** | Processa mensagens, interage com a IA, mantém o histórico de conversação e expõe endpoints para os canais. | **Python (Flask)** ou **Node.js (Express)** |
| **IA (Modelo)** | Gera respostas inteligentes, empáticas e contextuais. | **OpenAI GPT-3.5/GPT-4** (Configurável) |
| **Canais** | Pontos de contato com o cliente. | Web, WhatsApp (via Twilio), Telegram, Instagram/Facebook (via Webhooks) |
| **Frontend** | Interface de demonstração web. | HTML, CSS, JavaScript |

### ✨ Recursos Principais

*   **Multiplataforma:** Suporte nativo para Web, WhatsApp, Telegram, e arquitetura pronta para outros canais (Instagram, Facebook Messenger).
*   **Contexto de Conversa:** A IA mantém o histórico recente da conversa, permitindo interações fluidas e relevantes.
*   **Versatilidade:** Implementações completas em **Python** (com Flask) e **Node.js** (com Express).
*   **Fácil Implantação:** Configuração via variáveis de ambiente (`.env`) e suporte a **Docker** para deploy rápido.

---

## 🚀 Configuração e Instalação

Para rodar o projeto, você precisará de:

1.  **Chave de API do OpenAI:** Necessária para o funcionamento da IA.
2.  **Docker** (Recomendado para deploy rápido) ou **Python 3.11+** / **Node.js 20+** (Para desenvolvimento local).

### 1. Clonar o Repositório

\`\`\`bash
# Certifique-se de ter o git instalado
git clone https://github.com/galafis/IA-Conversacional-Multiplataforma.git
cd IA-Conversacional-Multiplataforma
\`\`\`

### 2. Configurar Variáveis de Ambiente

Em cada pasta de backend (`python_backend` e `nodejs_backend`), você encontrará um arquivo \`.env.example\`.

1.  Copie o arquivo para \`.env\`:

    \`\`\`bash
    cp python_backend/.env.example python_backend/.env
    cp nodejs_backend/.env.example nodejs_backend/.env
    \`\`\`

2.  Edite o arquivo \`.env\` e adicione sua chave de API do OpenAI:

    \`\`\`bash
    # Exemplo de .env
    OPENAI_API_KEY=sua_chave_aqui
    AI_SYSTEM_PROMPT=Você é um assistente de atendimento ao cliente amigável e profissional...
    # ... outras configurações de canal (Twilio, Telegram)
    \`\`\`

---

## 💻 Opção A: Backend em Python (Flask)

### 1. Instalação

\`\`\`bash
cd python_backend
pip install -r requirements.txt
\`\`\`

### 2. Execução

\`\`\`bash
# O servidor será iniciado na porta 5000 (ou FLASK_PORT no .env)
python app.py
\`\`\`

### 3. Endpoints Principais

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| \`POST\` | \`/api/chat\` | Envia uma mensagem para a IA e recebe a resposta. |
| \`GET\` | \`/health\` | Verifica a saúde da API. |
| \`GET\` | \`/api/conversation/<user_id>/<channel>\` | Retorna o histórico de conversa. |
| \`DELETE\` | \`/api/conversation/<user_id>/<channel>\` | Limpa o histórico de conversa. |

---

## 💻 Opção B: Backend em Node.js (Express)

### 1. Instalação

\`\`\`bash
cd nodejs_backend
npm install
\`\`\`

### 2. Execução

\`\`\`bash
# O servidor será iniciado na porta 3000 (ou PORT no .env)
npm start
\`\`\`

### 3. Endpoints Principais

Os endpoints são os mesmos da versão Python, mas o servidor Node.js é executado por padrão na porta **3000**.

---

## 🌐 Frontend Web (Demonstração)

O frontend é um simples chat widget em HTML, CSS e JavaScript puro, projetado para testar a API de forma visual.

1.  **Inicie um dos Backends** (Python ou Node.js).
2.  Navegue até a pasta \`web_frontend\`.
3.  Abra o arquivo \`index.html\` diretamente no seu navegador.

O chat widget permite:
*   Testar a conexão com a API.
*   Mudar a URL da API (padrão: \`http://localhost:3000\` - mude para \`http://localhost:5000\` se usar Python).
*   Simular diferentes canais (Web, WhatsApp, Telegram) e IDs de usuário.
*   Enviar mensagens e visualizar as respostas da IA.

---

## 🔗 Integração com Canais

A arquitetura da API está pronta para receber webhooks dos principais provedores.

### WhatsApp (via Twilio)

1.  Configure uma conta no **Twilio** e um número de WhatsApp.
2.  No console do Twilio, defina a URL do **Webhook** para a rota \`/api/whatsapp/webhook\` da sua API (ex: \`https://seuservidor.com/api/whatsapp/webhook\`).
3.  Preencha as variáveis de ambiente \`TWILIO_ACCOUNT_SID\`, \`TWILIO_AUTH_TOKEN\` e \`TWILIO_PHONE_NUMBER\` no arquivo \`.env\`.

### Telegram

1.  Crie um novo bot com o **BotFather** no Telegram e obtenha o \`TELEGRAM_BOT_TOKEN\`.
2.  Defina o Webhook do seu bot para a rota \`/api/telegram/webhook\` da sua API:

    \`\`\`bash
    # Exemplo de comando para definir o webhook
    curl -F "url=https://seuservidor.com/api/telegram/webhook" "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook"
    \`\`\`

3.  Preencha a variável de ambiente \`TELEGRAM_BOT_TOKEN\` no arquivo \`.env\`.

---

## 🐳 Implantação com Docker (Recomendado)

O uso de Docker simplifica a instalação e garante que o ambiente de execução seja idêntico ao de desenvolvimento.

### 1. Docker Compose

Crie um arquivo \`docker-compose.yml\` na raiz do projeto (fora das pastas \`python_backend\` e \`nodejs_backend\`) para gerenciar ambos os serviços.

\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  # Exemplo 1: Backend em Python
  python-api:
    build: ./python_backend
    container_name: ia-python-api
    ports:
      - "5000:5000"
    volumes:
      - ./python_backend/.env:/app/.env
    restart: always

  # Exemplo 2: Backend em Node.js
  nodejs-api:
    build: ./nodejs_backend
    container_name: ia-nodejs-api
    ports:
      - "3000:3000"
    volumes:
      - ./nodejs_backend/.env:/app/.env
    restart: always

  # Frontend Web (opcional, para servir o index.html)
  frontend:
    image: nginx:alpine
    container_name: ia-web-frontend
    ports:
      - "80:80"
    volumes:
      - ./web_frontend:/usr/share/nginx/html
    depends_on:
      - nodejs-api # Ou python-api
\`\`\`

### 2. Execução com Docker

\`\`\`bash
# Subir os serviços (escolha apenas um backend para rodar)
docker-compose up -d --build python-api frontend

# OU

docker-compose up -d --build nodejs-api frontend
\`\`\`

Acesse o frontend em \`http://localhost\` e a API em \`http://localhost:5000\` (Python) ou \`http://localhost:3000\` (Node.js).

---

## 📝 Licença

Este projeto está licenciado sob a Licença MIT.
\`\`\`

