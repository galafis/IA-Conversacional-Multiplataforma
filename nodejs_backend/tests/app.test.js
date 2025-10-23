/**
 * Unit and Integration tests for Node.js backend
 */
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock OpenAI before importing app
const mockCreate = jest.fn();
jest.unstable_mockModule('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

// Import app after mocking
const { default: app } = await import('../app.js');

describe('Health Check Endpoint', () => {
  test('GET /health should return 200 and status ok', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('service');
  });
});

describe('Chat Endpoint - Input Validation', () => {
  test('POST /api/chat should return 400 when missing required fields', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/chat should return 400 when missing user_id', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        channel: 'web',
        text: 'Hello',
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('obrigatórios');
  });

  test('POST /api/chat should return 400 when missing channel', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'test123',
        text: 'Hello',
      });
    
    expect(response.status).toBe(400);
  });

  test('POST /api/chat should return 400 when missing text', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'test123',
        channel: 'web',
      });
    
    expect(response.status).toBe(400);
  });

  test('POST /api/chat should return 400 for invalid channel', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'test123',
        channel: 'invalid_channel',
        text: 'Hello',
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('inválido');
  });

  test('POST /api/chat should return 400 for empty message', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'test123',
        channel: 'web',
        text: '   ',
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('vazia');
  });

  test('POST /api/chat should return 400 for message too long', async () => {
    const longMessage = 'x'.repeat(5000);
    const response = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'test123',
        channel: 'web',
        text: longMessage,
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('longa');
  });

  test('POST /api/chat should return 400 for non-string fields', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        user_id: 123,
        channel: 'web',
        text: 'Hello',
      });
    
    expect(response.status).toBe(400);
  });
});

describe('Chat Endpoint - Success Cases', () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Esta é uma resposta de teste da IA',
          },
        },
      ],
    });
  });

  test('POST /api/chat should return 200 with valid data for web channel', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'test123',
        channel: 'web',
        text: 'Hello, how are you?',
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('ai_response');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body.user_id).toBe('test123');
    expect(response.body.channel).toBe('web');
  });

  test('POST /api/chat should work with whatsapp channel', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'whatsapp_user',
        channel: 'whatsapp',
        text: 'Test message',
      });
    
    expect(response.status).toBe(200);
    expect(response.body.channel).toBe('whatsapp');
  });

  test('POST /api/chat should work with telegram channel', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'telegram_user',
        channel: 'telegram',
        text: 'Test message',
      });
    
    expect(response.status).toBe(200);
    expect(response.body.channel).toBe('telegram');
  });
});

describe('Conversation History Endpoints', () => {
  test('GET /api/conversation/:user_id/:channel should return conversation history', async () => {
    const response = await request(app).get('/api/conversation/test_user/web');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('messages');
    expect(response.body).toHaveProperty('total_messages');
    expect(response.body.user_id).toBe('test_user');
    expect(response.body.channel).toBe('web');
    expect(Array.isArray(response.body.messages)).toBe(true);
  });

  test('DELETE /api/conversation/:user_id/:channel should clear conversation', async () => {
    const response = await request(app).delete('/api/conversation/test_user/web');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('limpo');
  });
});

describe('Webhook Endpoints', () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Resposta de teste',
          },
        },
      ],
    });
  });

  test('POST /api/whatsapp/webhook should process WhatsApp messages', async () => {
    const response = await request(app)
      .post('/api/whatsapp/webhook')
      .send({
        From: '+1234567890',
        Body: 'Hello from WhatsApp',
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('response');
  });

  test('POST /api/telegram/webhook should process Telegram messages', async () => {
    const response = await request(app)
      .post('/api/telegram/webhook')
      .send({
        message: {
          from: { id: 123456 },
          text: 'Hello from Telegram',
        },
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('response');
  });

  test('POST /api/telegram/webhook should handle missing message', async () => {
    const response = await request(app)
      .post('/api/telegram/webhook')
      .send({});
    
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});

describe('Error Handling', () => {
  test('404 handler should return error for non-existent route', async () => {
    const response = await request(app).get('/nonexistent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('path');
  });

  test('POST /api/chat should handle OpenAI API errors gracefully', async () => {
    mockCreate.mockRejectedValue(new Error('API Error'));
    
    const response = await request(app)
      .post('/api/chat')
      .send({
        user_id: 'test123',
        channel: 'web',
        text: 'Hello',
      });
    
    expect(response.status).toBe(200);
    expect(response.body.ai_response).toContain('erro');
  });
});

describe('Conversation State Management', () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Test response',
          },
        },
      ],
    });
  });

  test('Should maintain conversation context for same user', async () => {
    const userId = 'context_test_user';
    const channel = 'web';

    // First message
    await request(app)
      .post('/api/chat')
      .send({
        user_id: userId,
        channel: channel,
        text: 'First message',
      });

    // Second message
    await request(app)
      .post('/api/chat')
      .send({
        user_id: userId,
        channel: channel,
        text: 'Second message',
      });

    // Get conversation history
    const response = await request(app).get(`/api/conversation/${userId}/${channel}`);

    expect(response.status).toBe(200);
    expect(response.body.total_messages).toBeGreaterThanOrEqual(4); // 2 user + 2 assistant
  });

  test('Should keep separate contexts for different users', async () => {
    // User 1
    await request(app)
      .post('/api/chat')
      .send({
        user_id: 'user1',
        channel: 'web',
        text: 'Message from user 1',
      });

    // User 2
    await request(app)
      .post('/api/chat')
      .send({
        user_id: 'user2',
        channel: 'web',
        text: 'Message from user 2',
      });

    // Get both histories
    const response1 = await request(app).get('/api/conversation/user1/web');
    const response2 = await request(app).get('/api/conversation/user2/web');

    expect(response1.body.messages).not.toEqual(response2.body.messages);
  });

  test('Should keep separate contexts for different channels', async () => {
    const userId = 'multi_channel_user';

    // Web channel
    await request(app)
      .post('/api/chat')
      .send({
        user_id: userId,
        channel: 'web',
        text: 'Message on web',
      });

    // WhatsApp channel
    await request(app)
      .post('/api/chat')
      .send({
        user_id: userId,
        channel: 'whatsapp',
        text: 'Message on WhatsApp',
      });

    // Get both histories
    const webHistory = await request(app).get(`/api/conversation/${userId}/web`);
    const whatsappHistory = await request(app).get(`/api/conversation/${userId}/whatsapp`);

    expect(webHistory.body.messages).not.toEqual(whatsappHistory.body.messages);
  });
});
