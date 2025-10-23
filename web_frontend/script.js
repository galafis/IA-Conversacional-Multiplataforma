/**
 * IA Conversacional - Chat Widget JavaScript
 * Autor: Gabriel Demetrios Lafis
 * Descrição: Lógica do frontend para interação com a IA
 */

// ============================================
// Configurações e Estado Global
// ============================================

const state = {
    apiUrl: localStorage.getItem('apiUrl') || 'http://localhost:3000',
    userId: localStorage.getItem('userId') || generateUserId(),
    channel: localStorage.getItem('channel') || 'web',
    messageCount: 0,
    isLoading: false,
};

// ============================================
// Elementos do DOM
// ============================================

const elements = {
    chatMessages: document.getElementById('chatMessages'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    clearBtn: document.getElementById('clearBtn'),
    apiUrl: document.getElementById('apiUrl'),
    userId: document.getElementById('userId'),
    channel: document.getElementById('channel'),
    generateUserBtn: document.getElementById('generateUserBtn'),
    testConnectionBtn: document.getElementById('testConnectionBtn'),
    apiStatus: document.getElementById('apiStatus'),
    messageCount: document.getElementById('messageCount'),
    lastUpdate: document.getElementById('lastUpdate'),
};

// ============================================
// Funções Utilitárias
// ============================================

/**
 * Gerar um ID de usuário único
 */
function generateUserId() {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', id);
    return id;
}

/**
 * Formatar data e hora
 */
function formatTime(date = new Date()) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Atualizar status da API
 */
function updateStatus(connected) {
    const statusElement = elements.apiStatus;
    if (connected) {
        statusElement.textContent = 'Conectado';
        statusElement.className = 'status-value connected';
    } else {
        statusElement.textContent = 'Desconectado';
        statusElement.className = 'status-value disconnected';
    }
    elements.lastUpdate.textContent = formatTime();
}

/**
 * Atualizar contador de mensagens
 */
function updateMessageCount() {
    state.messageCount++;
    elements.messageCount.textContent = state.messageCount;
}

/**
 * Salvar configurações no localStorage
 */
function saveConfig() {
    state.apiUrl = elements.apiUrl.value;
    state.userId = elements.userId.value;
    state.channel = elements.channel.value;

    localStorage.setItem('apiUrl', state.apiUrl);
    localStorage.setItem('userId', state.userId);
    localStorage.setItem('channel', state.channel);
}

/**
 * Carregar configurações do localStorage
 */
function loadConfig() {
    elements.apiUrl.value = state.apiUrl;
    elements.userId.value = state.userId;
    elements.channel.value = state.channel;
}

// ============================================
// Funções de Chat
// ============================================

/**
 * Adicionar mensagem ao chat
 */
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = formatTime();

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeSpan);

    elements.chatMessages.appendChild(messageDiv);

    // Scroll para o final
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

/**
 * Adicionar indicador de digitação
 */
function addTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.id = 'typingIndicator';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<span class="typing">●</span><span class="typing">●</span><span class="typing">●</span>';

    messageDiv.appendChild(contentDiv);
    elements.chatMessages.appendChild(messageDiv);

    // Scroll para o final
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

/**
 * Remover indicador de digitação
 */
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Enviar mensagem para a API
 */
async function sendMessage() {
    const message = elements.messageInput.value.trim();

    if (!message) {
        alert('Por favor, digite uma mensagem');
        return;
    }

    if (state.isLoading) {
        return;
    }

    // Salvar configurações
    saveConfig();

    // Adicionar mensagem do usuário
    addMessage(message, true);
    updateMessageCount();

    // Limpar input
    elements.messageInput.value = '';

    // Mostrar indicador de digitação
    state.isLoading = true;
    addTypingIndicator();

    try {
        // Preparar dados
        const payload = {
            user_id: state.userId,
            channel: state.channel,
            text: message,
        };

        // Fazer requisição
        const response = await fetch(`${state.apiUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        removeTypingIndicator();

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao enviar mensagem');
        }

        const data = await response.json();

        // Adicionar resposta da IA
        addMessage(data.ai_response, false);
        updateMessageCount();
        updateStatus(true);
    } catch (error) {
        removeTypingIndicator();
        console.error('Erro:', error);
        addMessage(
            `Erro ao conectar com a API: ${error.message}. Verifique se o servidor está rodando em ${state.apiUrl}`,
            false
        );
        updateStatus(false);
    } finally {
        state.isLoading = false;
        elements.messageInput.focus();
    }
}

/**
 * Limpar histórico de chat
 */
async function clearChat() {
    if (!confirm('Tem certeza que deseja limpar o histórico de chat?')) {
        return;
    }

    saveConfig();

    try {
        const response = await fetch(
            `${state.apiUrl}/api/conversation/${state.userId}/${state.channel}`,
            {
                method: 'DELETE',
            }
        );

        if (!response.ok) {
            throw new Error('Erro ao limpar histórico');
        }

        // Limpar mensagens do chat
        elements.chatMessages.innerHTML = '';
        addMessage('Histórico de chat limpo. Como posso ajudá-lo?', false);
        updateStatus(true);
    } catch (error) {
        console.error('Erro:', error);
        alert(`Erro ao limpar histórico: ${error.message}`);
        updateStatus(false);
    }
}

/**
 * Testar conexão com a API
 */
async function testConnection() {
    saveConfig();

    try {
        const response = await fetch(`${state.apiUrl}/health`);

        if (!response.ok) {
            throw new Error('API retornou status não OK');
        }

        const data = await response.json();
        updateStatus(true);
        alert(`✓ Conexão bem-sucedida!\n\nServiço: ${data.service}\nStatus: ${data.status}`);
    } catch (error) {
        console.error('Erro:', error);
        updateStatus(false);
        alert(
            `✗ Erro ao conectar com a API:\n${error.message}\n\nVerifique se o servidor está rodando em ${state.apiUrl}`
        );
    }
}

/**
 * Gerar novo ID de usuário
 */
function generateNewUserId() {
    const newId = generateUserId();
    elements.userId.value = newId;
    saveConfig();
    alert(`Novo ID de usuário gerado: ${newId}`);
}

// ============================================
// Event Listeners
// ============================================

// Enviar mensagem ao clicar no botão
elements.sendBtn.addEventListener('click', sendMessage);

// Enviar mensagem ao pressionar Enter
elements.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Limpar chat
elements.clearBtn.addEventListener('click', clearChat);

// Testar conexão
elements.testConnectionBtn.addEventListener('click', testConnection);

// Gerar novo ID
elements.generateUserBtn.addEventListener('click', generateNewUserId);

// Salvar configurações ao mudar
elements.apiUrl.addEventListener('change', saveConfig);
elements.userId.addEventListener('change', saveConfig);
elements.channel.addEventListener('change', saveConfig);

// ============================================
// Inicialização
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Carregar configurações
    loadConfig();

    // Focar no input
    elements.messageInput.focus();

    // Testar conexão automaticamente
    setTimeout(() => {
        testConnection();
    }, 500);

    // Adicionar estilos para o indicador de digitação
    const style = document.createElement('style');
    style.textContent = `
        .typing {
            animation: typing 0.6s infinite;
            margin: 0 2px;
        }
        .typing:nth-child(1) {
            animation-delay: 0s;
        }
        .typing:nth-child(2) {
            animation-delay: 0.2s;
        }
        .typing:nth-child(3) {
            animation-delay: 0.4s;
        }
        @keyframes typing {
            0%, 60%, 100% {
                opacity: 0.3;
            }
            30% {
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    console.log('IA Conversacional - Chat Widget Inicializado');
    console.log(`Configuração: ${state.apiUrl} | Usuário: ${state.userId} | Canal: ${state.channel}`);
});

