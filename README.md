# 🤖 IA Conversacional Multiplataforma para Atendimento Automático

[![Python Tests](https://github.com/galafis/IA-Conversacional-Multiplataforma/actions/workflows/python-tests.yml/badge.svg)](https://github.com/galafis/IA-Conversacional-Multiplataforma/actions/workflows/python-tests.yml)
[![Node.js Tests](https://github.com/galafis/IA-Conversacional-Multiplataforma/actions/workflows/nodejs-tests.yml/badge.svg)](https://github.com/galafis/IA-Conversacional-Multiplataforma/actions/workflows/nodejs-tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![Node Version](https://img.shields.io/badge/node-20.x%2B-green.svg)](https://nodejs.org/)

**Autor:** Gabriel Demetrios Lafis

Esta solução oferece um **Assistente de IA Conversacional** robusto e flexível, projetado para atender clientes automaticamente em **múltiplos canais**. O projeto é apresentado em duas versões de backend (Python e Node.js/JavaScript) para máxima adaptabilidade, além de um frontend web simples para demonstração.

---

## 📊 Índice

- [Visão Geral do Projeto](#-visão-geral-do-projeto)
- [Arquitetura](#️-arquitetura)
- [Recursos Principais](#-recursos-principais)
- [Requisitos](#-requisitos)
- [Configuração e Instalação](#-configuração-e-instalação)
- [Backend Python (Flask)](#-backend-python-flask)
- [Backend Node.js (Express)](#-backend-nodejs-express)
- [Frontend Web](#-frontend-web-demonstração)
- [Integração com Canais](#-integração-com-canais)
- [Docker e Deploy](#-implantação-com-docker)
- [Testes](#-testes)
- [API Documentation](#-documentação-da-api)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

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

## 📋 Requisitos

Antes de começar, certifique-se de ter os seguintes requisitos instalados:

### Para desenvolvimento local:
- **Python 3.11+** (para backend Python)
- **Node.js 20.x+** (para backend Node.js)
- **pip** (gerenciador de pacotes Python)
- **npm** (gerenciador de pacotes Node.js)
- **Chave de API do OpenAI** ([obter aqui](https://platform.openai.com/api-keys))

### Para deploy com Docker:
- **Docker 20.x+**
- **Docker Compose 2.x+**

### Opcional (para integrações):
- Conta no **Twilio** (para WhatsApp)
- **Telegram Bot Token** (para Telegram)

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

## 🧪 Testes

O projeto possui suítes de teste completas para ambos os backends, garantindo qualidade e confiabilidade do código.

### Python Backend (Pytest)

```bash
cd python_backend

# Instalar dependências de teste
pip install -r requirements.txt

# Executar todos os testes
pytest tests/ -v

# Executar testes com cobertura
pytest tests/ -v --cov=app --cov-report=html

# Ver relatório de cobertura
open htmlcov/index.html
```

**Cobertura atual:** ~83%

### Node.js Backend (Jest)

```bash
cd nodejs_backend

# Instalar dependências
npm install

# Executar todos os testes
npm test

# Executar testes com cobertura
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

**Status:** ✅ Todos os 22 testes passando

### CI/CD

O projeto utiliza GitHub Actions para executar os testes automaticamente em cada push ou pull request:

- **Python Tests:** Executa em Python 3.11 e 3.12
- **Node.js Tests:** Executa em Node.js 20.x e 22.x

Os badges no topo deste README mostram o status atual dos testes.

---

## 📚 Documentação da API

### Endpoints Disponíveis

#### 1. Health Check
```
GET /health
```
Verifica o status da API.

**Resposta de Sucesso (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "IA Conversacional Multiplataforma"
}
```

#### 2. Enviar Mensagem
```
POST /api/chat
```
Envia uma mensagem para a IA e recebe uma resposta.

**Corpo da Requisição:**
```json
{
  "user_id": "user123",
  "channel": "web",
  "text": "Olá, como você pode me ajudar?"
}
```

**Validações:**
- `user_id`: obrigatório, string
- `channel`: obrigatório, deve ser um de: `web`, `whatsapp`, `telegram`, `instagram`, `facebook`
- `text`: obrigatório, string, máximo 4000 caracteres, não pode estar vazio

**Resposta de Sucesso (200):**
```json
{
  "user_id": "user123",
  "channel": "web",
  "user_message": "Olá, como você pode me ajudar?",
  "ai_response": "Olá! Estou aqui para ajudar...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Erros Comuns:**
- `400`: Campos obrigatórios faltando ou inválidos
- `500`: Erro interno do servidor

#### 3. Obter Histórico de Conversa
```
GET /api/conversation/:user_id/:channel
```
Retorna o histórico de conversa de um usuário em um canal específico.

**Resposta de Sucesso (200):**
```json
{
  "user_id": "user123",
  "channel": "web",
  "messages": [
    {
      "role": "user",
      "content": "Olá",
      "timestamp": "2024-01-01T12:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Olá! Como posso ajudar?",
      "timestamp": "2024-01-01T12:00:01.000Z"
    }
  ],
  "total_messages": 2
}
```

#### 4. Limpar Histórico de Conversa
```
DELETE /api/conversation/:user_id/:channel
```
Remove todo o histórico de conversa de um usuário em um canal específico.

**Resposta de Sucesso (200):**
```json
{
  "message": "Histórico de conversa limpo com sucesso",
  "user_id": "user123",
  "channel": "web"
}
```

#### 5. Webhook WhatsApp (Twilio)
```
POST /api/whatsapp/webhook
```
Endpoint para receber mensagens do Twilio WhatsApp.

#### 6. Webhook Telegram
```
POST /api/telegram/webhook
```
Endpoint para receber atualizações do Telegram.

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

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir com este projeto:

1. **Fork** este repositório
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Diretrizes de Contribuição

- Siga os padrões de código existentes (PEP 8 para Python, Prettier para JavaScript)
- Adicione testes para novas funcionalidades
- Atualize a documentação conforme necessário
- Certifique-se de que todos os testes passam antes de enviar o PR

Para mais detalhes, consulte [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 🛡️ Segurança

Este projeto implementa várias medidas de segurança:

- ✅ Validação rigorosa de entrada em todos os endpoints
- ✅ Sanitização de dados do usuário
- ✅ Limitação de tamanho de mensagem (4000 caracteres)
- ✅ Tratamento adequado de erros sem expor informações sensíveis
- ✅ Suporte a CORS configurável
- ✅ Variáveis de ambiente para informações sensíveis

### Reporte de Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança, por favor, **NÃO** abra uma issue pública. Entre em contato diretamente com o mantenedor do projeto.

---

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

**Gabriel Demetrios Lafis**

- GitHub: [@galafis](https://github.com/galafis)

---

## 🙏 Agradecimentos

- OpenAI pela API GPT
- Comunidade Python e Node.js
- Todos os contribuidores do projeto

---

## 📞 Suporte

Se você tiver dúvidas ou precisar de ajuda:

1. Abra uma [Issue](https://github.com/galafis/IA-Conversacional-Multiplataforma/issues)
2. Consulte a [documentação](README.md)
3. Entre em contato através do GitHub

---

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**

