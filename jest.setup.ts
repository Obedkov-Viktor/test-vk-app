import '@testing-library/jest-dom';

// Мок функции window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Устаревший метод
        removeListener: jest.fn(), // Устаревший метод
        addEventListener: jest.fn(), // Современный метод
        removeEventListener: jest.fn(), // Современный метод
        dispatchEvent: jest.fn(),
    })),
});