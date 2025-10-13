// Advanced Multi-Modal AI Chatbot
class AdvancedChatbot {
    constructor() {
        this.apiBase = '/.netlify/functions';
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.conversationHistory = [];
        this.currentContext = 'general';
        this.supportedLanguages = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'hi'];
        this.currentLanguage = 'en';
        this.init();
    }

    init() {
        this.createAdvancedInterface();
        this.bindEvents();
        this.loadConversationHistory();
        this.initializeVoiceRecognition();
    }

    createAdvancedInterface() {
        // Replace the existing chat widget with advanced version
        const existingWidget = document.getElementById('chatWidget');
        if (existingWidget) {
            existingWidget.remove();
        }

        const advancedChatHTML = `
            <div id="advancedChatWidget" class="advanced-chat-widget">
                <button onclick="advancedChat.toggleChat()" class="chat-button">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L1 23l6.71-1.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                    </svg>
                    <div class="notification-badge" id="chatNotification" style="display: none;">●</div>
                </button>

                <div id="advancedChatBox" class="advanced-chat-box">
                    <!-- Chat Header with Mode Selector -->
                    <div class="chat-header">
                        <div class="chat-title">
                            <h3>🤖 AI Career Assistant</h3>
                            <div class="chat-modes">
                                <select id="chatMode" onchange="advancedChat.switchMode(this.value)">
                                    <option value="general">General Chat</option>
                                    <option value="career-advice">Career Advice</option>
                                    <option value="technical-deep-dive">Technical Deep Dive</option>
                                    <option value="leadership-insights">Leadership Insights</option>
                                    <option value="document-analysis">Document Analysis</option>
                                </select>
                            </div>
                        </div>
                        <div class="chat-controls">
                            <button onclick="advancedChat.clearHistory()" class="control-btn" title="Clear History">
                                🗑️
                            </button>
                            <button onclick="advancedChat.exportConversation()" class="control-btn" title="Export">
                                📤
                            </button>
                            <button onclick="advancedChat.toggleSettings()" class="control-btn" title="Settings">
                                ⚙️
                            </button>
                            <button onclick="advancedChat.toggleChat()" class="close-button">×</button>
                        </div>
                    </div>

                    <!-- Settings Panel -->
                    <div id="chatSettings" class="chat-settings hidden">
                        <div class="settings-group">
                            <label>Language:</label>
                            <select id="chatLanguage" onchange="advancedChat.changeLanguage(this.value)">
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                                <option value="zh">中文</option>
                                <option value="ja">日本語</option>
                                <option value="hi">हिन्दी</option>
                            </select>
                        </div>
                        <div class="settings-group">
                            <label>
                                <input type="checkbox" id="voiceEnabled" checked> Enable Voice Features
                            </label>
                        </div>
                        <div class="settings-group">
                            <label>
                                <input type="checkbox" id="suggestionsEnabled" checked> Show Smart Suggestions
                            </label>
                        </div>
                    </div>

                    <!-- Chat Messages -->
                    <div id="chatMessages" class="chat-messages">
                        <div class="ai-message welcome-message">
                            <div class="message-content">
                                <h4>👋 Hello! I'm Ravi's Advanced AI Assistant</h4>
                                <p>I can help you with:</p>
                                <ul>
                                    <li>🎯 <strong>Career Guidance</strong> - Based on 20+ years of tech leadership</li>
                                    <li>🔧 <strong>Technical Insights</strong> - From building platforms serving 600M+ users</li>
                                    <li>👥 <strong>Leadership Advice</strong> - From managing global teams of 100+ people</li>
                                    <li>📄 <strong>Document Analysis</strong> - Resume reviews, job description analysis</li>
                                    <li>🎤 <strong>Voice Conversations</strong> - Speak naturally with me</li>
                                </ul>
                                <p><em>Choose a chat mode above or just start asking questions!</em></p>
                            </div>
                        </div>
                    </div>

                    <!-- Smart Suggestions -->
                    <div id="smartSuggestions" class="smart-suggestions">
                        <div class="suggestions-title">💡 Suggested Questions:</div>
                        <div class="suggestions-list" id="suggestionsList">
                            <button class="suggestion-chip" onclick="advancedChat.sendSuggestion(this.textContent)">
                                How did you scale teams from startup to enterprise?
                            </button>
                            <button class="suggestion-chip" onclick="advancedChat.sendSuggestion(this.textContent)">
                                What are the key challenges in data platform architecture?
                            </button>
                            <button class="suggestion-chip" onclick="advancedChat.sendSuggestion(this.textContent)">
                                How do you drive digital transformation successfully?
                            </button>
                        </div>
                    </div>

                    <!-- File Upload Area -->
                    <div id="fileUploadArea" class="file-upload-area hidden">
                        <div class="upload-zone" onclick="document.getElementById('fileInput').click()">
                            <div class="upload-icon">📄</div>
                            <div class="upload-text">
                                <strong>Drop files here or click to upload</strong>
                                <br><small>Supported: PDF, DOC, TXT (Resume, Job Descriptions)</small>
                            </div>
                        </div>
                        <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.txt" style="display: none;" onchange="advancedChat.handleFileUpload(event)">
                        <div class="uploaded-files" id="uploadedFiles"></div>
                    </div>

                    <!-- Chat Input Container -->
                    <div class="chat-input-container">
                        <div class="input-row">
                            <button class="input-action-btn" onclick="advancedChat.toggleFileUpload()" title="Upload Document">
                                📎
                            </button>
                            <button class="input-action-btn voice-btn" id="voiceButton" onclick="advancedChat.toggleVoiceRecording()" title="Voice Input">
                                🎤
                            </button>
                            <input type="text"
                                   id="chatInput"
                                   placeholder="Ask about Ravi's experience, get career advice, or upload documents..."
                                   onkeypress="advancedChat.handleKeyPress(event)"
                                   autocomplete="off">
                            <button onclick="advancedChat.sendMessage()" class="send-button">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                                </svg>
                            </button>
                        </div>
                        <div class="input-status" id="inputStatus"></div>
                    </div>

                    <!-- Typing Indicator -->
                    <div class="typing-indicator" id="typingIndicator">
                        <div class="typing-text">
                            <span>Ravi's AI is thinking</span>
                            <div class="typing-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', advancedChatHTML);
        this.loadAdvancedStyles();
    }

    loadAdvancedStyles() {
        const styles = `
            <style>
                .advanced-chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 10001;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .chat-button {
                    position: relative;
                    width: 70px;
                    height: 70px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .chat-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
                }

                .notification-badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 18px;
                    height: 18px;
                    background: #ff4757;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }

                .advanced-chat-box {
                    display: none;
                    position: absolute;
                    bottom: 90px;
                    right: 0;
                    width: 420px;
                    height: 650px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 80px rgba(0,0,0,0.15);
                    flex-direction: column;
                    overflow: hidden;
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .chat-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .chat-title h3 {
                    margin: 0 0 10px 0;
                    font-size: 1.2em;
                    font-weight: 600;
                }

                .chat-modes select {
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 8px;
                    color: white;
                    padding: 5px 10px;
                    font-size: 0.9em;
                }

                .chat-modes select option {
                    background: #667eea;
                    color: white;
                }

                .chat-controls {
                    display: flex;
                    gap: 8px;
                    align-items: flex-start;
                }

                .control-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .control-btn:hover {
                    background: rgba(255,255,255,0.3);
                }

                .close-button {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .chat-settings {
                    background: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                    padding: 15px 20px;
                }

                .chat-settings.hidden {
                    display: none;
                }

                .settings-group {
                    margin-bottom: 10px;
                }

                .settings-group label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9em;
                    color: #333;
                }

                .settings-group select {
                    padding: 5px 8px;
                    border-radius: 6px;
                    border: 1px solid #ddd;
                    background: white;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    scroll-behavior: smooth;
                }

                .chat-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chat-messages::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }

                .chat-messages::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 3px;
                }

                .user-message, .ai-message {
                    max-width: 85%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    word-wrap: break-word;
                    line-height: 1.4;
                    position: relative;
                }

                .user-message {
                    align-self: flex-end;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-bottom-right-radius: 6px;
                }

                .ai-message {
                    align-self: flex-start;
                    background: #f8f9fa;
                    color: #333;
                    border-bottom-left-radius: 6px;
                    border-left: 4px solid #667eea;
                }

                .welcome-message {
                    max-width: 95%;
                    background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
                    border-left: 4px solid #667eea;
                }

                .welcome-message h4 {
                    margin: 0 0 10px 0;
                    color: #667eea;
                }

                .welcome-message ul {
                    margin: 10px 0;
                    padding-left: 20px;
                }

                .welcome-message li {
                    margin: 8px 0;
                    color: #555;
                }

                .message-content {
                    position: relative;
                }

                .message-timestamp {
                    font-size: 0.75em;
                    opacity: 0.6;
                    margin-top: 5px;
                }

                .message-actions {
                    display: flex;
                    gap: 5px;
                    margin-top: 8px;
                }

                .action-btn {
                    background: rgba(102, 126, 234, 0.1);
                    border: 1px solid rgba(102, 126, 234, 0.3);
                    color: #667eea;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.8em;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: rgba(102, 126, 234, 0.2);
                }

                .smart-suggestions {
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                    padding: 15px 20px;
                }

                .suggestions-title {
                    font-size: 0.9em;
                    font-weight: 600;
                    color: #666;
                    margin-bottom: 10px;
                }

                .suggestions-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .suggestion-chip {
                    background: white;
                    border: 1px solid #ddd;
                    color: #333;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 0.85em;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 200px;
                }

                .suggestion-chip:hover {
                    background: #667eea;
                    color: white;
                    border-color: #667eea;
                }

                .file-upload-area {
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                    padding: 20px;
                }

                .file-upload-area.hidden {
                    display: none;
                }

                .upload-zone {
                    border: 2px dashed #ddd;
                    border-radius: 10px;
                    padding: 30px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: white;
                }

                .upload-zone:hover {
                    border-color: #667eea;
                    background: #f8f9ff;
                }

                .upload-zone.drag-over {
                    border-color: #667eea;
                    background: #e3f2fd;
                }

                .upload-icon {
                    font-size: 2em;
                    margin-bottom: 10px;
                }

                .upload-text {
                    color: #666;
                }

                .uploaded-files {
                    margin-top: 15px;
                }

                .file-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: white;
                    padding: 10px 15px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    border: 1px solid #e0e0e0;
                }

                .file-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .file-remove {
                    color: #ff4757;
                    cursor: pointer;
                    padding: 5px;
                }

                .chat-input-container {
                    padding: 20px;
                    border-top: 1px solid #e9ecef;
                    background: white;
                }

                .input-row {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .input-action-btn {
                    background: #f8f9fa;
                    border: 1px solid #e0e0e0;
                    color: #666;
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .input-action-btn:hover {
                    background: #667eea;
                    color: white;
                    border-color: #667eea;
                }

                .voice-btn.recording {
                    background: #ff4757;
                    color: white;
                    border-color: #ff4757;
                    animation: pulse-record 1s infinite;
                }

                @keyframes pulse-record {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }

                .chat-input-container input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid #e0e0e0;
                    border-radius: 25px;
                    outline: none;
                    font-size: 1em;
                    transition: border-color 0.2s;
                }

                .chat-input-container input:focus {
                    border-color: #667eea;
                }

                .send-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                }

                .send-button:hover {
                    transform: scale(1.1);
                }

                .input-status {
                    font-size: 0.8em;
                    color: #666;
                    margin-top: 8px;
                    min-height: 16px;
                }

                .typing-indicator {
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                    display: none;
                    align-items: center;
                    gap: 10px;
                }

                .typing-indicator.show {
                    display: flex;
                }

                .typing-text {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #666;
                    font-size: 0.9em;
                }

                .typing-dots {
                    display: flex;
                    gap: 3px;
                }

                .typing-dots span {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #667eea;
                    animation: typing-bounce 1.4s infinite;
                }

                .typing-dots span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-dots span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typing-bounce {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-10px);
                    }
                }

                @media (max-width: 500px) {
                    .advanced-chat-box {
                        width: 90vw;
                        height: 80vh;
                        right: -10px;
                        bottom: 80px;
                    }

                    .chat-header {
                        padding: 15px;
                    }

                    .chat-title h3 {
                        font-size: 1.1em;
                    }

                    .suggestion-chip {
                        max-width: 150px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        // File upload drag and drop
        const uploadZone = document.querySelector('.upload-zone');
        if (uploadZone) {
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('drag-over');
            });

            uploadZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
            });

            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
                const files = Array.from(e.dataTransfer.files);
                this.processFiles(files);
            });
        }

        // Auto-resize input
        const input = document.getElementById('chatInput');
        if (input) {
            input.addEventListener('input', () => {
                // Auto-complete suggestions could be added here
                this.showInputStatus('');
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.toggleChat();
                        break;
                    case 'l':
                        e.preventDefault();
                        this.clearHistory();
                        break;
                }
            }
        });
    }

    toggleChat() {
        const chatBox = document.getElementById('advancedChatBox');
        const notification = document.getElementById('chatNotification');

        if (chatBox.style.display === 'flex') {
            chatBox.style.display = 'none';
        } else {
            chatBox.style.display = 'flex';
            document.getElementById('chatInput').focus();
            if (notification) notification.style.display = 'none';
        }
    }

    switchMode(mode) {
        this.currentContext = mode;
        const fileUploadArea = document.getElementById('fileUploadArea');
        const suggestions = document.getElementById('smartSuggestions');

        // Show file upload for document analysis mode
        if (mode === 'document-analysis') {
            fileUploadArea.classList.remove('hidden');
            suggestions.classList.add('hidden');
        } else {
            fileUploadArea.classList.add('hidden');
            suggestions.classList.remove('hidden');
        }

        // Update suggestions based on mode
        this.updateSuggestions(mode);

        // Add mode transition message
        this.addSystemMessage(`Switched to ${mode.replace('-', ' ')} mode. How can I help you?`);
    }

    updateSuggestions(mode) {
        const suggestionsList = document.getElementById('suggestionsList');

        const suggestions = {
            'general': [
                'Tell me about your career journey',
                'What are your key achievements?',
                'How do you approach technology leadership?'
            ],
            'career-advice': [
                'How do I transition from IC to management?',
                'What skills are needed for executive roles?',
                'How do I negotiate executive compensation?',
                'What are the keys to successful team building?'
            ],
            'technical-deep-dive': [
                'How do you scale systems to handle billions of events?',
                'What are the key patterns for data platform architecture?',
                'How do you implement real-time analytics at scale?',
                'What are best practices for cloud migration?'
            ],
            'leadership-insights': [
                'How do you maintain low turnover in tech teams?',
                'What strategies work for global team management?',
                'How do you drive cultural transformation?',
                'What are your approaches to cross-functional leadership?'
            ],
            'document-analysis': [
                'Upload your resume for detailed feedback',
                'Analyze a job description for fit assessment',
                'Review my LinkedIn profile optimization'
            ]
        };

        const modeSuggestions = suggestions[mode] || suggestions['general'];

        suggestionsList.innerHTML = modeSuggestions.map(suggestion =>
            `<button class="suggestion-chip" onclick="advancedChat.sendSuggestion('${suggestion}')">${suggestion}</button>`
        ).join('');
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        this.addUserMessage(message);
        input.value = '';

        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(message, this.currentContext);
            this.hideTypingIndicator();
            this.addAIMessage(response);

            // Update suggestions based on response
            if (response.suggestions) {
                this.updateDynamicSuggestions(response.suggestions);
            }

        } catch (error) {
            this.hideTypingIndicator();
            this.addAIMessage({
                response: `I'm sorry, I encountered an error: ${error.message}. Please try again or contact support if the issue persists.`,
                suggestions: ['Try asking a different question', 'Clear the chat history', 'Switch to a different mode']
            });
        }
    }

    async getAIResponse(message, context) {
        const response = await fetch(`${this.apiBase}/advanced-chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                type: context === 'general' ? 'text' : context,
                context: context,
                conversation_history: this.conversationHistory.slice(-5) // Send last 5 messages for context
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }

    addUserMessage(message) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';

        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.formatMessage(message)}
                <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        this.saveConversationHistory();
    }

    addAIMessage(response) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message';

        const messageContent = response.response || response.text || 'I apologize, but I couldn\'t generate a response.';

        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.formatMessage(messageContent)}
                <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
                ${this.createMessageActions(response)}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Add to conversation history
        this.conversationHistory.push({
            role: 'assistant',
            content: messageContent,
            timestamp: new Date().toISOString(),
            context: this.currentContext
        });

        this.saveConversationHistory();

        // Show follow-up resources if available
        if (response.resources && response.resources.length > 0) {
            this.addResourcesMessage(response.resources);
        }
    }

    addSystemMessage(message) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message';
        messageDiv.style.opacity = '0.8';
        messageDiv.style.fontStyle = 'italic';

        messageDiv.innerHTML = `
            <div class="message-content">
                ${message}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addResourcesMessage(resources) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message';

        const resourcesList = resources.map(resource => `<li>${resource}</li>`).join('');

        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>📚 Related Resources:</strong>
                <ul>${resourcesList}</ul>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    createMessageActions(response) {
        let actions = '';

        if (response.follow_ups && response.follow_ups.length > 0) {
            const followUps = response.follow_ups.slice(0, 2).map(followUp =>
                `<button class="action-btn" onclick="advancedChat.sendSuggestion('${followUp}')">${followUp}</button>`
            ).join('');
            actions += `<div class="message-actions">${followUps}</div>`;
        }

        return actions;
    }

    formatMessage(message) {
        // Convert markdown-style formatting to HTML
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    sendSuggestion(suggestion) {
        document.getElementById('chatInput').value = suggestion;
        this.sendMessage();
    }

    updateDynamicSuggestions(suggestions) {
        const suggestionsList = document.getElementById('suggestionsList');
        suggestionsList.innerHTML = suggestions.slice(0, 3).map(suggestion =>
            `<button class="suggestion-chip" onclick="advancedChat.sendSuggestion('${suggestion}')">${suggestion}</button>`
        ).join('');
    }

    showTypingIndicator() {
        document.getElementById('typingIndicator').classList.add('show');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator').classList.remove('show');
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    // Voice functionality
    async initializeVoiceRecognition() {
        try {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.speechRecognition = new SpeechRecognition();
                this.speechRecognition.continuous = false;
                this.speechRecognition.interimResults = false;
                this.speechRecognition.lang = this.currentLanguage;

                this.speechRecognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    document.getElementById('chatInput').value = transcript;
                    this.showInputStatus('Voice input received: ' + transcript);
                };

                this.speechRecognition.onerror = (event) => {
                    this.showInputStatus('Voice recognition error: ' + event.error);
                    this.stopVoiceRecording();
                };

                this.speechRecognition.onend = () => {
                    this.stopVoiceRecording();
                };
            }
        } catch (error) {
            console.log('Voice recognition not supported:', error);
        }
    }

    toggleVoiceRecording() {
        const voiceButton = document.getElementById('voiceButton');
        const voiceEnabled = document.getElementById('voiceEnabled').checked;

        if (!voiceEnabled) {
            this.showInputStatus('Voice features are disabled in settings');
            return;
        }

        if (this.isRecording) {
            this.stopVoiceRecording();
        } else {
            this.startVoiceRecording();
        }
    }

    startVoiceRecording() {
        if (this.speechRecognition) {
            this.isRecording = true;
            const voiceButton = document.getElementById('voiceButton');
            voiceButton.classList.add('recording');
            voiceButton.innerHTML = '🔴';

            this.speechRecognition.start();
            this.showInputStatus('Listening... Click the microphone again to stop');
        } else {
            this.showInputStatus('Voice recognition not supported in this browser');
        }
    }

    stopVoiceRecording() {
        if (this.speechRecognition && this.isRecording) {
            this.speechRecognition.stop();
        }

        this.isRecording = false;
        const voiceButton = document.getElementById('voiceButton');
        voiceButton.classList.remove('recording');
        voiceButton.innerHTML = '🎤';

        this.showInputStatus('');
    }

    // File handling
    toggleFileUpload() {
        const fileArea = document.getElementById('fileUploadArea');
        const suggestions = document.getElementById('smartSuggestions');

        if (fileArea.classList.contains('hidden')) {
            fileArea.classList.remove('hidden');
            suggestions.classList.add('hidden');
            // Switch to document analysis mode
            document.getElementById('chatMode').value = 'document-analysis';
            this.switchMode('document-analysis');
        } else {
            fileArea.classList.add('hidden');
            suggestions.classList.remove('hidden');
        }
    }

    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    async processFiles(files) {
        const uploadedFilesContainer = document.getElementById('uploadedFiles');

        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showInputStatus(`File ${file.name} is too large. Maximum size is 10MB.`);
                continue;
            }

            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <span>📄</span>
                    <div>
                        <div>${file.name}</div>
                        <small>${(file.size / 1024).toFixed(1)} KB</small>
                    </div>
                </div>
                <span class="file-remove" onclick="this.parentElement.remove()">✕</span>
            `;

            uploadedFilesContainer.appendChild(fileItem);

            // Process the file
            try {
                const fileContent = await this.readFile(file);
                const fileType = this.determineFileType(file.name, fileContent);

                // Send file analysis request
                this.addSystemMessage(`Analyzing ${file.name}...`);

                const response = await this.getAIResponse(
                    `Please analyze this ${fileType}`,
                    'document-analysis',
                    {
                        filename: file.name,
                        content: fileContent,
                        type: fileType
                    }
                );

                this.addAIMessage(response);

            } catch (error) {
                this.showInputStatus(`Error processing ${file.name}: ${error.message}`);
            }
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    determineFileType(filename, content) {
        const lowerName = filename.toLowerCase();
        const lowerContent = content.toLowerCase();

        if (lowerName.includes('resume') || lowerName.includes('cv') ||
            lowerContent.includes('experience') || lowerContent.includes('education')) {
            return 'resume';
        } else if (lowerContent.includes('job description') || lowerContent.includes('requirements') ||
                   lowerContent.includes('qualifications') || lowerContent.includes('responsibilities')) {
            return 'job_description';
        } else {
            return 'document';
        }
    }

    // Utility functions
    showInputStatus(message) {
        document.getElementById('inputStatus').textContent = message;
        if (message) {
            setTimeout(() => {
                document.getElementById('inputStatus').textContent = '';
            }, 3000);
        }
    }

    clearHistory() {
        document.getElementById('chatMessages').innerHTML = `
            <div class="ai-message welcome-message">
                <div class="message-content">
                    <h4>👋 Chat History Cleared!</h4>
                    <p>How can I help you today?</p>
                </div>
            </div>
        `;
        this.conversationHistory = [];
        this.saveConversationHistory();
    }

    exportConversation() {
        const conversation = this.conversationHistory.map(msg =>
            `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`
        ).join('\n\n');

        const blob = new Blob([conversation], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ravi-ai-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    toggleSettings() {
        const settings = document.getElementById('chatSettings');
        settings.classList.toggle('hidden');
    }

    changeLanguage(language) {
        this.currentLanguage = language;
        if (this.speechRecognition) {
            this.speechRecognition.lang = language;
        }
        this.addSystemMessage(`Language changed to ${language}. I'll respond in this language when possible.`);
    }

    saveConversationHistory() {
        localStorage.setItem('advanced_chat_history', JSON.stringify(this.conversationHistory));
    }

    loadConversationHistory() {
        const saved = localStorage.getItem('advanced_chat_history');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);

            // Reload recent messages if any
            if (this.conversationHistory.length > 0) {
                const recent = this.conversationHistory.slice(-10);
                const messagesContainer = document.getElementById('chatMessages');

                recent.forEach(msg => {
                    if (msg.role === 'user') {
                        this.addUserMessage(msg.content);
                    } else {
                        this.addAIMessage({ response: msg.content });
                    }
                });
            }
        }
    }
}

// Initialize when DOM is loaded
let advancedChat;
document.addEventListener('DOMContentLoaded', () => {
    advancedChat = new AdvancedChatbot();
});