"""
IA Conversacional Multiplataforma - Backend em Python
Autor: Gabriel Demetrios Lafis
Descrição: API Flask para processamento de mensagens com IA em múltiplos canais
"""

import os
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from pydantic import BaseModel, ValidationError
from typing import Optional, List

# Carregar variáveis de ambiente
load_dotenv()

# Inicializar Flask
app = Flask(__name__)
CORS(app)

# Configurar OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Armazenar conversas em memória (em produção, usar banco de dados)
conversations = {}

# Modelos Pydantic para validação
class Message(BaseModel):
    """Modelo para uma mensagem"""
    user_id: str
    channel: str  # 'whatsapp', 'telegram', 'web', 'instagram'
    text: str
    timestamp: Optional[str] = None

class ConversationResponse(BaseModel):
    """Modelo para resposta da IA"""
    user_id: str
    channel: str
    response: str
    timestamp: str


def get_system_prompt():
    """Obter o prompt do sistema para a IA"""
    return os.getenv(
        'AI_SYSTEM_PROMPT',
        'Você é um assistente de atendimento ao cliente amigável e profissional. '
        'Responda de forma clara, concisa e sempre com empatia.'
    )


def get_conversation_history(user_id: str, channel: str) -> List[dict]:
    """Obter histórico de conversa do usuário"""
    key = f"{user_id}_{channel}"
    if key not in conversations:
        conversations[key] = []
    return conversations[key]


def save_message(user_id: str, channel: str, role: str, content: str):
    """Salvar mensagem no histórico"""
    key = f"{user_id}_{channel}"
    if key not in conversations:
        conversations[key] = []
    
    conversations[key].append({
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat()
    })


def generate_ai_response(user_id: str, channel: str, user_message: str) -> str:
    """
    Gerar resposta da IA usando OpenAI
    
    Args:
        user_id: ID único do usuário
        channel: Canal de comunicação (whatsapp, telegram, web, instagram)
        user_message: Mensagem do usuário
    
    Returns:
        Resposta gerada pela IA
    """
    try:
        # Obter histórico de conversa
        history = get_conversation_history(user_id, channel)
        
        # Preparar mensagens para a API OpenAI
        messages = [
            {"role": "system", "content": get_system_prompt()}
        ]
        
        # Adicionar histórico (últimas 10 mensagens para não exceder limite)
        messages.extend(history[-10:])
        
        # Adicionar mensagem atual
        messages.append({"role": "user", "content": user_message})
        
        # Chamar API OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        # Extrair resposta
        ai_response = response.choices[0].message.content.strip()
        
        # Salvar mensagens no histórico
        save_message(user_id, channel, "user", user_message)
        save_message(user_id, channel, "assistant", ai_response)
        
        return ai_response
    
    except Exception as e:
        print(f"Erro ao gerar resposta: {str(e)}")
        return "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde."


@app.route('/health', methods=['GET'])
def health_check():
    """Verificar saúde da API"""
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "IA Conversacional Multiplataforma"
    }), 200


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Endpoint principal para processar mensagens
    
    Esperado:
    {
        "user_id": "user123",
        "channel": "web",
        "text": "Olá, como você pode me ajudar?"
    }
    """
    try:
        data = request.get_json()
        
        # Validar dados com Pydantic
        try:
            message = Message(**data)
        except ValidationError as e:
            return jsonify({
                "error": "Dados inválidos",
                "details": e.errors()
            }), 400
        
        # Validar canal
        valid_channels = ['whatsapp', 'telegram', 'web', 'instagram', 'facebook']
        if message.channel not in valid_channels:
            return jsonify({
                "error": f"Canal inválido. Canais suportados: {', '.join(valid_channels)}"
            }), 400
        
        # Validar tamanho da mensagem
        if len(message.text) > 4000:
            return jsonify({
                "error": "Mensagem muito longa. Máximo: 4000 caracteres"
            }), 400
        
        if len(message.text.strip()) == 0:
            return jsonify({
                "error": "Mensagem não pode estar vazia"
            }), 400
        
        # Gerar resposta da IA
        ai_response = generate_ai_response(message.user_id, message.channel, message.text)
        
        return jsonify({
            "user_id": message.user_id,
            "channel": message.channel,
            "user_message": message.text,
            "ai_response": ai_response,
            "timestamp": datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        print(f"Erro no endpoint /api/chat: {str(e)}")
        return jsonify({
            "error": "Erro interno do servidor",
            "details": str(e)
        }), 500


@app.route('/api/conversation/<user_id>/<channel>', methods=['GET'])
def get_conversation(user_id, channel):
    """
    Obter histórico de conversa de um usuário
    
    Args:
        user_id: ID do usuário
        channel: Canal de comunicação
    """
    try:
        history = get_conversation_history(user_id, channel)
        
        return jsonify({
            "user_id": user_id,
            "channel": channel,
            "messages": history,
            "total_messages": len(history)
        }), 200
    
    except Exception as e:
        return jsonify({
            "error": "Erro ao obter histórico",
            "details": str(e)
        }), 500


@app.route('/api/conversation/<user_id>/<channel>', methods=['DELETE'])
def clear_conversation(user_id, channel):
    """
    Limpar histórico de conversa de um usuário
    
    Args:
        user_id: ID do usuário
        channel: Canal de comunicação
    """
    try:
        key = f"{user_id}_{channel}"
        if key in conversations:
            del conversations[key]
        
        return jsonify({
            "message": "Histórico de conversa limpo com sucesso",
            "user_id": user_id,
            "channel": channel
        }), 200
    
    except Exception as e:
        return jsonify({
            "error": "Erro ao limpar histórico",
            "details": str(e)
        }), 500


@app.route('/api/whatsapp/webhook', methods=['POST'])
def whatsapp_webhook():
    """
    Webhook para integração com WhatsApp (Twilio)
    """
    try:
        # Extrair dados do Twilio
        from_number = request.form.get('From')
        message_body = request.form.get('Body')
        
        # Gerar resposta
        ai_response = generate_ai_response(from_number, 'whatsapp', message_body)
        
        # Enviar resposta via Twilio (implementação básica)
        # Em produção, usar cliente Twilio para enviar SMS
        
        return jsonify({
            "status": "success",
            "response": ai_response
        }), 200
    
    except Exception as e:
        print(f"Erro no webhook WhatsApp: {str(e)}")
        return jsonify({
            "error": "Erro ao processar mensagem WhatsApp"
        }), 500


@app.route('/api/telegram/webhook', methods=['POST'])
def telegram_webhook():
    """
    Webhook para integração com Telegram
    """
    try:
        data = request.get_json()
        
        if 'message' not in data:
            return jsonify({"ok": True}), 200
        
        message = data['message']
        user_id = str(message['from']['id'])
        text = message.get('text', '')
        
        # Gerar resposta
        ai_response = generate_ai_response(user_id, 'telegram', text)
        
        return jsonify({
            "status": "success",
            "response": ai_response
        }), 200
    
    except Exception as e:
        print(f"Erro no webhook Telegram: {str(e)}")
        return jsonify({
            "error": "Erro ao processar mensagem Telegram"
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Tratador para rotas não encontradas"""
    return jsonify({
        "error": "Rota não encontrada",
        "path": request.path
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Tratador para erros internos"""
    return jsonify({
        "error": "Erro interno do servidor"
    }), 500


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"""
    ╔════════════════════════════════════════════════════════════════╗
    ║  IA Conversacional Multiplataforma - Backend Python            ║
    ║  Iniciando servidor em http://localhost:{port}                    ║
    ║  Endpoints disponíveis:                                        ║
    ║  - GET  /health                                                ║
    ║  - POST /api/chat                                              ║
    ║  - GET  /api/conversation/<user_id>/<channel>                  ║
    ║  - DELETE /api/conversation/<user_id>/<channel>                ║
    ╚════════════════════════════════════════════════════════════════╝
    """)
    
    app.run(host='0.0.0.0', port=port, debug=debug)

