"""
Unit tests for Python backend
"""
import pytest
import os
import json
from unittest.mock import Mock, patch, MagicMock
from app import app, get_system_prompt, get_conversation_history, save_message, generate_ai_response


@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_openai_response():
    """Mock OpenAI API response"""
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Esta é uma resposta de teste da IA"
    return mock_response


class TestSystemPrompt:
    """Test system prompt functions"""
    
    def test_get_system_prompt_default(self):
        """Test getting default system prompt"""
        prompt = get_system_prompt()
        assert isinstance(prompt, str)
        assert len(prompt) > 0
        assert "assistente" in prompt.lower()
    
    def test_get_system_prompt_custom(self, monkeypatch):
        """Test getting custom system prompt from environment"""
        custom_prompt = "Custom AI prompt for testing"
        monkeypatch.setenv('AI_SYSTEM_PROMPT', custom_prompt)
        prompt = get_system_prompt()
        assert prompt == custom_prompt


class TestConversationHistory:
    """Test conversation history functions"""
    
    def test_get_conversation_history_new_user(self):
        """Test getting history for new user"""
        history = get_conversation_history("test_user_123", "web")
        assert isinstance(history, list)
        assert len(history) >= 0
    
    def test_save_message(self):
        """Test saving message to history"""
        user_id = "test_user_456"
        channel = "web"
        save_message(user_id, channel, "user", "Test message")
        history = get_conversation_history(user_id, channel)
        
        assert len(history) > 0
        last_message = history[-1]
        assert last_message['role'] == "user"
        assert last_message['content'] == "Test message"
        assert 'timestamp' in last_message
    
    def test_conversation_history_ordering(self):
        """Test that messages are stored in order"""
        user_id = "test_user_789"
        channel = "web"
        
        save_message(user_id, channel, "user", "First message")
        save_message(user_id, channel, "assistant", "Second message")
        save_message(user_id, channel, "user", "Third message")
        
        history = get_conversation_history(user_id, channel)
        assert len(history) >= 3
        assert history[-3]['content'] == "First message"
        assert history[-2]['content'] == "Second message"
        assert history[-1]['content'] == "Third message"


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        """Test health check endpoint returns 200"""
        response = client.get('/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'ok'
        assert 'timestamp' in data
        assert 'service' in data


class TestChatEndpoint:
    """Test main chat endpoint"""
    
    def test_chat_missing_fields(self, client):
        """Test chat endpoint with missing required fields"""
        response = client.post('/api/chat', 
                              json={},
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_chat_invalid_channel(self, client):
        """Test chat endpoint with invalid channel"""
        response = client.post('/api/chat',
                              json={
                                  "user_id": "test123",
                                  "channel": "invalid_channel",
                                  "text": "Hello"
                              },
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'inválido' in data['error'].lower()
    
    def test_chat_empty_message(self, client):
        """Test chat endpoint with empty message"""
        response = client.post('/api/chat',
                              json={
                                  "user_id": "test123",
                                  "channel": "web",
                                  "text": "   "
                              },
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_chat_message_too_long(self, client):
        """Test chat endpoint with message that's too long"""
        long_message = "x" * 5000
        response = client.post('/api/chat',
                              json={
                                  "user_id": "test123",
                                  "channel": "web",
                                  "text": long_message
                              },
                              content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    @patch('app.client')
    def test_chat_success(self, mock_client, client, mock_openai_response):
        """Test successful chat interaction"""
        mock_client.chat.completions.create.return_value = mock_openai_response
        
        response = client.post('/api/chat',
                              json={
                                  "user_id": "test123",
                                  "channel": "web",
                                  "text": "Hello, how are you?"
                              },
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'ai_response' in data
        assert 'timestamp' in data
        assert data['user_id'] == 'test123'
        assert data['channel'] == 'web'


class TestConversationEndpoints:
    """Test conversation management endpoints"""
    
    def test_get_conversation(self, client):
        """Test getting conversation history"""
        response = client.get('/api/conversation/test_user/web')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'messages' in data
        assert 'total_messages' in data
        assert data['user_id'] == 'test_user'
        assert data['channel'] == 'web'
    
    def test_clear_conversation(self, client):
        """Test clearing conversation history"""
        # First, add some messages
        user_id = "test_clear_user"
        channel = "web"
        save_message(user_id, channel, "user", "Test message")
        
        # Clear the conversation
        response = client.delete(f'/api/conversation/{user_id}/{channel}')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'message' in data
        
        # Verify it's cleared
        history = get_conversation_history(user_id, channel)
        assert len(history) == 0


class TestWebhookEndpoints:
    """Test webhook endpoints"""
    
    @patch('app.client')
    def test_whatsapp_webhook(self, mock_client, client, mock_openai_response):
        """Test WhatsApp webhook endpoint"""
        mock_client.chat.completions.create.return_value = mock_openai_response
        
        response = client.post('/api/whatsapp/webhook',
                              data={
                                  'From': '+1234567890',
                                  'Body': 'Hello from WhatsApp'
                              })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'response' in data
    
    @patch('app.client')
    def test_telegram_webhook(self, mock_client, client, mock_openai_response):
        """Test Telegram webhook endpoint"""
        mock_client.chat.completions.create.return_value = mock_openai_response
        
        response = client.post('/api/telegram/webhook',
                              json={
                                  'message': {
                                      'from': {'id': 123456},
                                      'text': 'Hello from Telegram'
                                  }
                              },
                              content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'response' in data
    
    def test_telegram_webhook_no_message(self, client):
        """Test Telegram webhook with no message"""
        response = client.post('/api/telegram/webhook',
                              json={},
                              content_type='application/json')
        
        assert response.status_code == 200


class TestErrorHandlers:
    """Test error handlers"""
    
    def test_404_handler(self, client):
        """Test 404 error handler"""
        response = client.get('/nonexistent-route')
        assert response.status_code == 404
        
        data = json.loads(response.data)
        assert 'error' in data
        assert 'path' in data
