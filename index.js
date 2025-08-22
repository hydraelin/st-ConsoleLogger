// 导入必要的模块
import { eventSource, event_types } from "../../../../script.js";

// index.js - 主插件文件
class MessageMonitorPlugin {
    constructor() {
        this.name = "Message Monitor";
        this.version = "1.0.0";
        this.enabled = true;
    }

    // 插件初始化
    async init() {
        console.log(`${this.name} v${this.version} 已初始化`);
        
        // 注册消息事件监听器
        this.registerEventHandlers();
        
        // 创建UI界面（可选）
        this.createUI();
    }

    // 注册事件处理器
    registerEventHandlers() {
        // 监听用户消息
        eventSource.on('user_message_rendered', (data) => {
            this.handleMessage('User', data.message, 'user');
        });

        // 监听AI回复
        eventSource.on('character_message_rendered', (data) => {
            this.handleMessage(data.character_name || 'AI', data.message, 'character');
        });

        // 监听系统消息
        eventSource.on('system_message_rendered', (data) => {
            this.handleMessage('System', data.message, 'system');
        });
    }

    // 处理消息的核心函数
    handleMessage(sender, content, type) {
        try {
            // 清理HTML标签获取纯文本
            const cleanContent = this.stripHtml(content);
            const messageLength = cleanContent.length;
            const timestamp = new Date().toLocaleString();

            // 构建消息信息对象
            const messageInfo = {
                timestamp: timestamp,
                sender: sender,
                type: type,
                content: cleanContent,
                length: messageLength,
                wordCount: this.countWords(cleanContent)
            };

            // 输出消息信息
            this.outputMessageInfo(messageInfo);
            
            // 保存到历史记录（可选）
            this.saveToHistory(messageInfo);

        } catch (error) {
            console.error('处理消息时出错:', error);
        }
    }

    // 输出消息信息
    outputMessageInfo(info) {
        // 控制台输出
        console.log(`
=== 消息监听 ===
时间: ${info.timestamp}
发送人: ${info.sender}
类型: ${info.type}
内容: ${info.content.substring(0, 100)}${info.content.length > 100 ? '...' : ''}
字符长度: ${info.length}
单词数: ${info.wordCount}
===============
        `);

        // 在页面上显示（如果UI已创建）
        this.updateUI(info);
    }

    // 创建UI界面
    createUI() {
        // 创建插件面板
        const panel = $(`
            <div id="message-monitor-panel" class="drawer-content">
                <div class="panelControlBar">
                    <div class="fa-solid fa-eye"></div>
                    <span>消息监听器</span>
                </div>
                <div class="message-monitor-content">
                    <div class="toggle-container">
                        <label>
                            <input type="checkbox" id="monitor-enabled" ${this.enabled ? 'checked' : ''}>
                            启用消息监听
                        </label>
                    </div>
                    <div class="stats-container">
                        <div class="stat-item">
                            <span class="stat-label">总消息数:</span>
                            <span id="total-messages">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">用户消息:</span>
                            <span id="user-messages">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">AI消息:</span>
                            <span id="ai-messages">0</span>
                        </div>
                    </div>
                    <div class="recent-messages">
                        <h4>最近消息:</h4>
                        <div id="recent-messages-list"></div>
                    </div>
                    <button id="clear-history" class="menu_button">清空历史</button>
                </div>
            </div>
        `);

        // 添加到侧边栏
        $('#rightSendForm').after(panel);

        // 绑定事件
        $('#monitor-enabled').on('change', (e) => {
            this.enabled = e.target.checked;
        });

        $('#clear-history').on('click', () => {
            this.clearHistory();
        });

        // 添加CSS样式
        this.addStyles();
    }

    // 更新UI显示
    updateUI(messageInfo) {
        if (!this.enabled) return;

        // 更新统计信息
        const totalCount = parseInt($('#total-messages').text()) + 1;
        $('#total-messages').text(totalCount);

        if (messageInfo.type === 'user') {
            const userCount = parseInt($('#user-messages').text()) + 1;
            $('#user-messages').text(userCount);
        } else if (messageInfo.type === 'character') {
            const aiCount = parseInt($('#ai-messages').text()) + 1;
            $('#ai-messages').text(aiCount);
        }

        // 添加到最近消息列表
        const messageElement = $(`
            <div class="recent-message">
                <div class="message-header">
                    <span class="sender">${messageInfo.sender}</span>
                    <span class="timestamp">${messageInfo.timestamp}</span>
                </div>
                <div class="message-stats">
                    长度: ${messageInfo.length} | 单词: ${messageInfo.wordCount}
                </div>
                <div class="message-preview">
                    ${messageInfo.content.substring(0, 50)}${messageInfo.content.length > 50 ? '...' : ''}
                </div>
            </div>
        `);

        $('#recent-messages-list').prepend(messageElement);

        // 只保留最近10条消息
        $('#recent-messages-list .recent-message').slice(10).remove();
    }

    // 添加CSS样式
    addStyles() {
        const styles = `
            <style id="message-monitor-styles">
                #message-monitor-panel {
                    margin: 10px 0;
                    padding: 10px;
                    border: 1px solid var(--SmartThemeBorderColor);
                    border-radius: 5px;
                    background: var(--SmartThemeBodyColor);
                }
                
                .message-monitor-content {
                    padding: 10px;
                }
                
                .toggle-container {
                    margin-bottom: 15px;
                }
                
                .stats-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 15px;
                    padding: 10px;
                    background: var(--SmartThemeQuoteColor);
                    border-radius: 5px;
                }
                
                .stat-item {
                    text-align: center;
                }
                
                .stat-label {
                    display: block;
                    font-size: 12px;
                    opacity: 0.8;
                }
                
                .recent-messages {
                    margin-top: 15px;
                }
                
                .recent-message {
                    padding: 8px;
                    margin-bottom: 8px;
                    background: var(--SmartThemeQuoteColor);
                    border-radius: 3px;
                    font-size: 12px;
                }
                
                .message-header {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                    margin-bottom: 3px;
                }
                
                .message-stats {
                    color: var(--SmartThemeQuoteColor);
                    font-size: 10px;
                    margin-bottom: 3px;
                }
                
                .message-preview {
                    opacity: 0.8;
                }
                
                .sender {
                    color: var(--SmartThemeQuoteColor);
                }
                
                .timestamp {
                    font-size: 10px;
                    opacity: 0.7;
                }
            </style>
        `;
        $('head').append(styles);
    }

    // 工具函数：清理HTML标签
    stripHtml(html) {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    // 工具函数：计算单词数
    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    // 保存到历史记录
    saveToHistory(messageInfo) {
        let history = JSON.parse(localStorage.getItem('message-monitor-history') || '[]');
        history.unshift(messageInfo);
        
        // 只保留最近100条记录
        history = history.slice(0, 100);
        
        localStorage.setItem('message-monitor-history', JSON.stringify(history));
    }

    // 清空历史记录
    clearHistory() {
        localStorage.removeItem('message-monitor-history');
        $('#recent-messages-list').empty();
        $('#total-messages').text('0');
        $('#user-messages').text('0');
        $('#ai-messages').text('0');
        console.log('消息历史已清空');
    }

    // 插件卸载
    destroy() {
        $('#message-monitor-panel').remove();
        $('#message-monitor-styles').remove();
        console.log('消息监听插件已卸载');
    }
}

// 插件注册
(() => {
    'use strict';
    
    const plugin = new MessageMonitorPlugin();
    
    // 等待SillyTavern加载完成后初始化插件
    jQuery(async () => {
        if (typeof eventSource !== 'undefined') {
            await plugin.init();
            window.messageMonitorPlugin = plugin;
        } else {
            console.error('SillyTavern eventSource not found');
        }
    });
})();
