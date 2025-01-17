import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest', // Используем ts-jest для работы с TypeScript
  testEnvironment: 'jsdom', // Указываем jsdom для тестирования React-компонентов
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Мок для CSS-модулей
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Настройка React Testing Library
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json', // Указываем файл конфигурации для тестов
    },
  },
};

export default config;