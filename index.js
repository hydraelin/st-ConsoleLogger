// 导入必要的模块
import { eventSource, event_types } from "../../../../script.js";

// 定义插件对象
const ConsoleLoggerPlugin = {
    // 插件初始化方法
    init() {
        // 监听新消息接收事件
        eventSource.on(event_types.MESSAGE_RECEIVED, this.handleMessageReceived.bind(this));
        
        // 可选：监听其他事件
        eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, this.handleMessageRendered.bind(this));
    },

    // 处理消息接收事件
    handleMessageReceived(messageId, type) {
        // 获取消息内容
        const message = window.chat[messageId];
        if (!message) return;

        // 提取消息文本和相关信息
        const messageText = message.mes || '';
        const messageLength = messageText.length;
        const sender = message.is_user ? 'User' : (message.name || 'AI');

        // 输出到控制台
        console.log(`[logger消息接收] 发送者: ${sender}, 类型: ${type}`);
        console.log(`[logger消息内容] ${messageText}`);
        console.log(`[logger消息长度] ${messageLength} 字符`);
        console.log('----------------------------------------');
    },

    // 处理消息渲染完成事件
    handleMessageRendered(messageId, type) {
        const message = window.chat[messageId];
        if (!message) return;
        
        console.log(`[logger消息渲染完成] ID: ${messageId}, 类型: ${type}, 长度: ${(message.mes || '').length}`);
    }
};

// 在DOM加载完成后初始化插件
jQuery(() => {
    ConsoleLoggerPlugin.init();
    console.log('[logger]Console Logger Plugin 已初始化');
});
