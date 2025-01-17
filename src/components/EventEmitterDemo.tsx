import React, { useEffect, useState } from 'react';
import { EventEmitter } from '../utils/EventEmitter';
import { Button, Space, Input, message } from 'antd';

interface MessageData {
    message: string;
    timestamp: string;
}

interface DemoEvents {
    'data': MessageData;
    [key: string]: unknown;
}

const emitter = new EventEmitter<DemoEvents>();

const EventEmitterDemo: React.FC = () => {
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const messageHandler = (data: MessageData) => {
            console.log('Received message:', data); // Добавим для отладки
            setMessages(prev => [...prev, data]);
        };

        emitter.on('data', messageHandler);

        return () => {
            emitter.off('data', messageHandler);
        };
    }, []);

    const handleEmitMessage = async () => {
        if (!inputValue.trim()) return;

        const messageData = {
            message: inputValue,
            timestamp: new Date().toISOString()
        };

        console.log('Emitting message:', messageData); // Добавим для отладки
        emitter.emit('data', messageData);
        setInputValue('');
        await message.success('Событие отправлено!');
    };

    const handleClearMessages = async () => {
        setMessages([]);
        await message.info('Сообщения очищены');
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Демонстрация EventEmitter</h2>
            
            <Space.Compact style={{ width: '100%', marginBottom: '20px' }}>
                <Input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Введите сообщение"
                    onPressEnter={handleEmitMessage}
                />
                <Button
                    type="primary"
                    onClick={handleEmitMessage}
                    disabled={!inputValue.trim()}
                >
                    Отправить событие
                </Button>
            </Space.Compact>

            <div style={{ marginBottom: '20px' }}>
                <Button
                    onClick={handleClearMessages}
                    disabled={messages.length === 0}
                        >
                    Очистить сообщения
                </Button>
            </div>
            <div style={{
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                padding: '10px',
                minHeight: '200px',
                maxHeight: '400px',
                overflowY: 'auto'
            }}>
                {messages.length === 0 ? (
                    <div style={{ color: '#999', textAlign: 'center' }}>
                        Нет сообщений. Отправьте событие!
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '12px',
                                margin: '8px 0',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px'
                            }}
                        >
                            <div style={{ marginBottom: '4px' }}>
                                <strong>Сообщение:</strong> {msg.message}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: '#666'
                            }}>
                                {formatDate(msg.timestamp)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EventEmitterDemo;