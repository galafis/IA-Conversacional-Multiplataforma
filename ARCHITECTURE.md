# Arquitetura do Sistema

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CANAIS DE ENTRADA                       │
│                                                                  │
│  ┌──────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  Web │  │ WhatsApp │  │ Telegram │  │Instagram │  etc.     │
│  └──┬───┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
└─────┼──────────┼──────────────┼──────────────┼─────────────────┘
      │          │              │              │
      │          │              │              │
      ▼          ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        NGINX (Reverse Proxy)                     │
│                      Load Balancer / SSL                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API BACKEND                              │
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Python Backend  │              │ Node.js Backend  │         │
│  │     (Flask)      │      OU      │    (Express)     │         │
│  │                  │              │                  │         │
│  │  • /api/chat     │              │  • /api/chat     │         │
│  │  • /health       │              │  • /health       │         │
│  │  • /api/*        │              │  • /api/*        │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
└───────────┼────────────────────────────────┼───────────────────┘
            │                                │
            │                                │
            ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ARMAZENAMENTO DE ESTADO                       │
│                                                                  │
│              ┌────────────────────────────┐                      │
│              │  In-Memory Storage         │                      │
│              │  (Conversas por usuário)   │                      │
│              │                            │                      │
│              │  Chave: user_id_channel    │                      │
│              │  Valor: Array de mensagens │                      │
│              └────────────────────────────┘                      │
│                                                                  │
│       (Em produção: Redis, PostgreSQL, MongoDB, etc.)           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        OpenAI API                                │
│                                                                  │
│              ┌────────────────────────────┐                      │
│              │     GPT-3.5-turbo          │                      │
│              │  (ou outro modelo GPT)     │                      │
│              └────────────────────────────┘                      │
│                                                                  │
│  • Recebe mensagem + contexto                                   │
│  • Gera resposta inteligente                                    │
│  • Retorna resposta                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

### 1. Mensagem do Usuário

```
Usuário → Canal → API Backend → OpenAI API → Backend → Usuário
```

### 2. Detalhes do Fluxo

```
1. Usuário envia mensagem via canal (Web, WhatsApp, etc.)
   ↓
2. Mensagem chega ao endpoint /api/chat
   ↓
3. Backend valida entrada
   - user_id presente?
   - channel válido?
   - text não vazio e < 4000 chars?
   ↓
4. Backend recupera histórico de conversa
   - Busca por chave: "user_id_channel"
   - Obtém últimas 10 mensagens para contexto
   ↓
5. Backend prepara payload para OpenAI
   - System prompt
   - Histórico (contexto)
   - Nova mensagem
   ↓
6. OpenAI processa e retorna resposta
   ↓
7. Backend salva mensagens no histórico
   - Salva mensagem do usuário
   - Salva resposta da IA
   ↓
8. Backend retorna resposta ao usuário
   ↓
9. Usuário recebe resposta
```

## Componentes Principais

### Backend API
- **Responsabilidades:**
  - Validar entradas
  - Gerenciar histórico de conversas
  - Comunicar com OpenAI API
  - Gerenciar webhooks de canais externos
  - Expor endpoints REST

- **Tecnologias:**
  - Python: Flask, OpenAI SDK, Pydantic
  - Node.js: Express, OpenAI SDK

### Frontend Web
- **Responsabilidades:**
  - Interface de demonstração
  - Enviar mensagens via API
  - Exibir respostas
  - Gerenciar configurações

- **Tecnologias:**
  - HTML5, CSS3, JavaScript Vanilla

### Integrações de Canais
- **WhatsApp (Twilio):**
  - Webhook: `/api/whatsapp/webhook`
  - Recebe POST do Twilio
  
- **Telegram:**
  - Webhook: `/api/telegram/webhook`
  - Recebe atualizações via bot API

## Escalabilidade e Produção

### Recomendações para Produção:

1. **Banco de Dados:**
   ```
   In-Memory → Redis (cache) + PostgreSQL (persistência)
   ```

2. **Load Balancing:**
   ```
   Múltiplas instâncias do backend + Nginx
   ```

3. **Monitoramento:**
   ```
   - Logs centralizados (ELK Stack)
   - Métricas (Prometheus + Grafana)
   - Alertas (PagerDuty, Slack)
   ```

4. **Segurança:**
   ```
   - Rate limiting (Redis)
   - API Gateway (Kong, AWS API Gateway)
   - SSL/TLS
   - Autenticação JWT
   ```

5. **Cache:**
   ```
   - Redis para sessões
   - CDN para frontend estático
   ```

## Estrutura de Diretórios

```
IA-Conversacional-Multiplataforma/
├── python_backend/          # Backend em Python
│   ├── app.py              # Aplicação principal
│   ├── requirements.txt    # Dependências
│   ├── Dockerfile          # Container Python
│   ├── pytest.ini          # Configuração de testes
│   └── tests/              # Testes unitários e integração
│
├── nodejs_backend/          # Backend em Node.js
│   ├── app.js              # Aplicação principal
│   ├── package.json        # Dependências
│   ├── Dockerfile          # Container Node.js
│   └── tests/              # Testes unitários e integração
│
├── web_frontend/           # Frontend Web
│   ├── index.html          # Interface HTML
│   ├── script.js           # Lógica JavaScript
│   └── styles.css          # Estilos CSS
│
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       ├── python-tests.yml
│       └── nodejs-tests.yml
│
├── docker-compose.yml      # Orquestração de containers
├── nginx.conf             # Configuração Nginx
├── README.md              # Documentação principal
├── CONTRIBUTING.md        # Guia de contribuição
├── CHANGELOG.md           # Histórico de mudanças
└── LICENSE                # Licença MIT
```

## Tecnologias Utilizadas

### Backend
- **Python 3.11+**
  - Flask (Framework web)
  - OpenAI SDK
  - Pydantic (Validação)
  - Pytest (Testes)

- **Node.js 20.x+**
  - Express (Framework web)
  - OpenAI SDK
  - Jest (Testes)

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### DevOps
- Docker & Docker Compose
- Nginx
- GitHub Actions

### IA
- OpenAI GPT-3.5-turbo (configurável)

## Variáveis de Ambiente

### Essenciais
```bash
OPENAI_API_KEY=sk-...           # Chave API OpenAI
```

### Python Backend
```bash
FLASK_ENV=development           # Ambiente (development/production)
FLASK_PORT=5000                # Porta do servidor
```

### Node.js Backend
```bash
NODE_ENV=development           # Ambiente
PORT=3000                      # Porta do servidor
```

### Integrações (Opcional)
```bash
# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Telegram
TELEGRAM_BOT_TOKEN=...

# Prompt customizado
AI_SYSTEM_PROMPT="Você é um assistente..."
```

## Segurança e Boas Práticas

### Implementado:
- ✅ Validação de entrada
- ✅ Sanitização de dados
- ✅ Limite de tamanho de mensagem
- ✅ CORS configurável
- ✅ Variáveis de ambiente
- ✅ Tratamento de erros

### Recomendado para Produção:
- 🔲 Rate limiting
- 🔲 Autenticação JWT
- 🔲 HTTPS/SSL
- 🔲 Firewall de aplicação web (WAF)
- 🔲 Logs estruturados
- 🔲 Monitoramento 24/7
- 🔲 Backup automático
