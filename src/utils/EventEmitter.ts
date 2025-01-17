interface BaseEventMap {
    [key: string]: unknown;
}

type EventKey<T extends BaseEventMap> = string & keyof T;
type EventListener<T> = (data: T) => void;
type ErrorHandler = (eventName: string, error: unknown) => void;

export class EventEmitter<T extends BaseEventMap = BaseEventMap> {
    private events: Map<string, Set<EventListener<unknown>>>;
    private errorHandler: ErrorHandler;

    constructor(errorHandler?: ErrorHandler) {
        this.events = new Map();
        this.errorHandler = errorHandler || ((eventName: string, error: unknown) => {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);
            console.error(`Error in listener for event "${eventName}":`, errorMessage);
        });
    }
    /**
     * Подписка на событие
     * @param eventName - Имя события
     * @param listener - Функция-обработчик
     */
    on<K extends EventKey<T>>(eventName: K, listener: EventListener<T[K]>): this {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }
        this.events.get(eventName)!.add(listener as EventListener<unknown>);
        return this;
    }

    /**
     * Испускание события
     * @param eventName - Имя события
     * @param data - Данные события
     */
    emit<K extends EventKey<T>>(eventName: K, data: T[K]): this {
        const listeners = this.events.get(eventName);
        if (listeners) {
            listeners.forEach((listener: EventListener<unknown>) => {
                try {
                    (listener as EventListener<T[K]>)(data);
                } catch (error) {
                    this.errorHandler(eventName, error);
                }
            });
        }
        return this;
    }

    /**
     * Удаление подписки на событие
     * @param eventName - Имя события
     * @param listener - Функция-обработчик для удаления
     */
    off<K extends EventKey<T>>(eventName: K, listener: EventListener<T[K]>): this {
        const listeners = this.events.get(eventName);
        if (listeners) {
            listeners.delete(listener as EventListener<unknown>);
            if (listeners.size === 0) {
                this.events.delete(eventName);
            }
        }
        return this;
    }

    /**
     * Получить количество слушателей для события
     * @param eventName - Имя события
     */
    listenerCount(eventName: string): number {
        return this.events.get(eventName)?.size ?? 0;
    }
}
