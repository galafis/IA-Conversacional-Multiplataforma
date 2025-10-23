/**
 * IA Conversacional Multiplataforma - Backend em Node.js
 * Autor: Gabriel Demetrios Lafis
 * Descrição: API Express para processamento de mensagens com IA em múltiplos canais
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Armazenar conversas em memória (em produção, usar banco de dados)
const conversations = new Map();

/**
 * Obter o prompt do sistema para a IA
 */
function getSystemPrompt() {
  return (
    process.env.AI_SYSTEM_PROMPT ||
    'Você é um assistente de atendimento ao cliente amigável e profissional. ' +
    'Responda de forma clara, concisa e sempre com empatia.'
  );
}

/**
 * Obter histórico de conversa do usuário
 */
function getConversationHistory(userId, channel) {
  const key = `${userId}_${channel}`;
  if (!conversations.has(key)) {
    conversations.set(key, []);
  }
  return conversations.get(key);
}

/**
 * Salvar mensagem no histórico
 */
function saveMessage(userId, channel, role, content) {
  const key = `${userId}_${channel}`;
  if (!conversations.has(key)) {
    conversations.set(key, []);
  }

  const history = conversations.get(key);
  history.push({
    role,
    content,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Gerar resposta da IA usando OpenAI
 *
 * @param {string} userId - ID único do usuário
 * @param {string} channel - Canal de comunicação (whatsapp, telegram, web, instagram)
 * @param {string} userMessage - Mensagem do usuário
 * @returns {Promise<string>} Resposta gerada pela IA
 */
async function generateAiResponse(userId, channel, userMessage) {
  try {
    // Obter histórico de conversa
    const history = getConversationHistory(userId, channel);

    // Preparar mensagens para a API OpenAI
    const messages = [{ role: 'system', content: getSystemPrompt() }];

    // Adicionar histórico (últimas 10 mensagens para não exceder limite)
    messages.push(...history.slice(-10));

    // Adicionar mensagem atual
    messages.push({ role: 'user', content: userMessage });

    // Chamar API OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extrair resposta
    const aiResponse = response.choices[0].message.content.trim();

    // Salvar mensagens no histórico
    saveMessage(userId, channel, 'user', userMessage);
    saveMessage(userId, channel, 'assistant', aiResponse);

    return aiResponse;
  } catch (error) {
    console.error('Erro ao gerar resposta:', error.message);
    return 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.';
  }
}

/**
 * GET /health - Verificar saúde da API
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'IA Conversacional Multiplataforma',
  });
});

/**
 * POST /api/chat - Endpoint principal para processar mensagens
 *
 * Esperado:
 * {
 *   "user_id": "user123",
 *   "channel": "web",
 *   "text": "Olá, como você pode me ajudar?"
 * }
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { user_id, channel, text } = req.body;

    // Validar dados
    if (!user_id || !channel || !text) {
      return res.status(400).json({
        error: 'Campos obrigatórios: user_id, channel, text',
      });
    }

    // Validar tipos
    if (typeof user_id !== 'string' || typeof channel !== 'string' || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Todos os campos devem ser strings',
      });
    }

    // Validar canal
    const validChannels = ['whatsapp', 'telegram', 'web', 'instagram', 'facebook'];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({
        error: `Canal inválido. Canais suportados: ${validChannels.join(', ')}`,
      });
    }

    // Validar tamanho da mensagem
    if (text.length > 4000) {
      return res.status(400).json({
        error: 'Mensagem muito longa. Máximo: 4000 caracteres',
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        error: 'Mensagem não pode estar vazia',
      });
    }

    // Gerar resposta da IA
    const aiResponse = await generateAiResponse(user_id, channel, text);

    res.json({
      user_id,
      channel,
      user_message: text,
      ai_response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro no endpoint /api/chat:', error.message);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message,
    });
  }
});

/**
 * GET /api/conversation/:user_id/:channel - Obter histórico de conversa
 */
app.get('/api/conversation/:user_id/:channel', (req, res) => {
  try {
    const { user_id, channel } = req.params;
    const history = getConversationHistory(user_id, channel);

    res.json({
      user_id,
      channel,
      messages: history,
      total_messages: history.length,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter histórico',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/conversation/:user_id/:channel - Limpar histórico de conversa
 */
app.delete('/api/conversation/:user_id/:channel', (req, res) => {
  try {
    const { user_id, channel } = req.params;
    const key = `${user_id}_${channel}`;

    if (conversations.has(key)) {
      conversations.delete(key);
    }

    res.json({
      message: 'Histórico de conversa limpo com sucesso',
      user_id,
      channel,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao limpar histórico',
      details: error.message,
    });
  }
});

/**
 * POST /api/whatsapp/webhook - Webhook para integração com WhatsApp (Twilio)
 */
app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    const fromNumber = req.body.From;
    const messageBody = req.body.Body;

    // Gerar resposta
    const aiResponse = await generateAiResponse(fromNumber, 'whatsapp', messageBody);

    res.json({
      status: 'success',
      response: aiResponse,
    });
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error.message);
    res.status(500).json({
      error: 'Erro ao processar mensagem WhatsApp',
    });
  }
});

/**
 * POST /api/telegram/webhook - Webhook para integração com Telegram
 */
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ ok: true });
    }

    const userId = String(message.from.id);
    const text = message.text || '';

    // Gerar resposta
    const aiResponse = await generateAiResponse(userId, 'telegram', text);

    res.json({
      status: 'success',
      response: aiResponse,
    });
  } catch (error) {
    console.error('Erro no webhook Telegram:', error.message);
    res.status(500).json({
      error: 'Erro ao processar mensagem Telegram',
    });
  }
});

/**
 * 404 - Rota não encontrada
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
  });
});

/**
 * Tratador de erros global
 */
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
  });
});

/**
 * Iniciar servidor apenas se não estiver em modo de teste
 */
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  IA Conversacional Multiplataforma - Backend Node.js           ║
║  Iniciando servidor em http://localhost:${PORT}                   ║
║  Endpoints disponíveis:                                        ║
║  - GET  /health                                                ║
║  - POST /api/chat                                              ║
║  - GET  /api/conversation/<user_id>/<channel>                  ║
║  - DELETE /api/conversation/<user_id>/<channel>                ║
╚════════════════════════════════════════════════════════════════╝
    `);
  });
}

export default app;

