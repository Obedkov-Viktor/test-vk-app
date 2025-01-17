import { EventEmitter } from '../utils/EventEmitter';

// Определяем типы для тестов
interface TestEvents {
    'test': {
        data: string | string[] | number | (string | number)[];
    };
    [key: string]: unknown;
}

describe('EventEmitter', () => {
    let emitter: EventEmitter<TestEvents>;
    let defaultEmitter: EventEmitter<TestEvents>;
    const mockErrorHandler = jest.fn();
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        // Очищаем моки перед каждым тестом
        mockErrorHandler.mockClear();
        // Создаем эмиттер с пользовательским обработчиком ошибок
        emitter = new EventEmitter(mockErrorHandler);
        // Создаем эмиттер с дефолтным обработчиком ошибок
        defaultEmitter = new EventEmitter();
        // Мокаем console.error, чтобы он не выводил сообщения в консоль при тестах
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // Восстанавливаем console.error после каждого теста
        consoleSpy.mockRestore();
    });

    // Базовые тесты функциональности
    describe('Базовая функциональность', () => {
        it('должен подписываться на события и вызывать обработчики', () => {
            const listener = jest.fn();
            emitter.on('test', listener);
            emitter.emit('test', { data: 'test data' });
            expect(listener).toHaveBeenCalledWith({ data: 'test data' });
        });

        it('должен поддерживать несколько обработчиков для одного события', () => {
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            emitter.on('test', listener1);
        emitter.on('test', listener2);

            const testData = { data: 'test data' };
            emitter.emit('test', testData);

            expect(listener1).toHaveBeenCalledWith(testData);
            expect(listener2).toHaveBeenCalledWith(testData);
    });

        it('должен корректно удалять обработчики', () => {
        const listener = jest.fn();
        emitter.on('test', listener);
        emitter.off('test', listener);
            emitter.emit('test', { data: 'test data' });
            expect(listener).not.toHaveBeenCalled();
    });

        it('должен игнорировать удаление несуществующего обработчика', () => {
        const listener = jest.fn();
        expect(() => {
                emitter.off('test', listener);
        }).not.toThrow();
    });
});

    // Тесты для подсчета слушателей
    describe('Подсчет слушателей', () => {
        it('должен корректно подсчитывать количество слушателей', () => {
            const listener1 = jest.fn();
            const listener2 = jest.fn();

            expect(emitter.listenerCount('test')).toBe(0);

            emitter.on('test', listener1);
            expect(emitter.listenerCount('test')).toBe(1);

            emitter.on('test', listener2);
            expect(emitter.listenerCount('test')).toBe(2);

            emitter.off('test', listener1);
            expect(emitter.listenerCount('test')).toBe(1);

            emitter.off('test', listener2);
            expect(emitter.listenerCount('test')).toBe(0);
        });

        it('должен удалять событие при удалении последнего слушателя', () => {
            const listener = jest.fn();
            emitter.on('test', listener);
            expect(emitter.listenerCount('test')).toBe(1);

            emitter.off('test', listener);
            expect(emitter.listenerCount('test')).toBe(0);
            expect(Array.from((emitter as any).events.keys()).length).toBe(0);
        });
    });

    // Тесты обработки ошибок
    describe('Обработка ошибок', () => {
        it('должен обрабатывать Error объекты в дефолтном обработчике', () => {
            const errorListener = jest.fn().mockImplementation(() => {
                throw new Error('Test error');
            });
            defaultEmitter.on('test', errorListener);
            defaultEmitter.emit('test', { data: 'test' });

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in listener for event "test":',
                'Test error'
            );
        });

        it('должен обрабатывать строковые ошибки в дефолтном обработчике', () => {
            const errorListener = jest.fn().mockImplementation(() => {
                throw 'String error';
            });
            defaultEmitter.on('test', errorListener);
            defaultEmitter.emit('test', { data: 'test' });

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in listener for event "test":',
                'String error'
            );
        });

        it('должен обрабатывать объектные ошибки в дефолтном обработчике', () => {
            const errorListener = jest.fn().mockImplementation(() => {
                throw { custom: 'error' };
            });
            defaultEmitter.on('test', errorListener);
            defaultEmitter.emit('test', { data: 'test' });

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in listener for event "test":',
                '[object Object]'
            );
        });

        it('должен использовать пользовательский обработчик ошибок', () => {
            const errorListener = jest.fn().mockImplementation(() => {
                throw new Error('Custom handler error');
            });
            emitter.on('test', errorListener);
            emitter.emit('test', { data: 'test' });

            expect(mockErrorHandler).toHaveBeenCalled();
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });

    // Тесты для проверки типов данных
    describe('Поддержка различных типов данных', () => {
        it('должен поддерживать различные типы данных', () => {
            const listener = jest.fn();
            emitter.on('test', listener);

            // Строка
            emitter.emit('test', { data: 'string data' });
            expect(listener).toHaveBeenCalledWith({ data: 'string data' });

            // Массив строк
            emitter.emit('test', { data: ['array', 'data'] });
            expect(listener).toHaveBeenCalledWith({ data: ['array', 'data'] });

            // Число
            emitter.emit('test', { data: 42 });
            expect(listener).toHaveBeenCalledWith({ data: 42 });

            // Смешанный массив
            emitter.emit('test', { data: ['test', 1, 'data', 2] });
            expect(listener).toHaveBeenCalledWith({ data: ['test', 1, 'data', 2] });
        });
    });

    // Тест цепочки вызовов
    describe('Цепочка вызовов', () => {
        it('должен поддерживать цепочку вызовов', () => {
            const listener = jest.fn();

            expect(() => {
                emitter
                    .on('test', listener)
                    .emit('test', { data: 'test' })
                    .off('test', listener);
            }).not.toThrow();

            expect(listener).toHaveBeenCalledWith({ data: 'test' });
        });
    });
});
