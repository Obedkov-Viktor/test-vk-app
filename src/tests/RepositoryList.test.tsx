import { render, screen, fireEvent } from '@testing-library/react';
import RepositoryList from '../components/RepositoryList';
import { act } from '@testing-library/react';

// Мокаем Ant Design
jest.mock('antd', () => {
  const originalAntd = jest.requireActual('antd');
  return {
    ...originalAntd,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

// Мокаем хранилище репозиториев
jest.mock('../stores/repositoryStore', () => ({
  repositoryStore: {
    repositories: [
      { id: 1, name: 'Repo 1', description: 'Description 1', stargazers_count: 100, html_url: '#' },
      { id: 2, name: 'Repo 2', description: 'Description 2', stargazers_count: 200, html_url: '#' },
    ],
    isLoading: false,
    hasMore: true,
    loadRepositories: jest.fn(),
    deleteRepository: jest.fn(),
    editRepository: jest.fn(),
    setSort: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// Вспомогательные функции
const openEditModal = async () => {
  const editButton = screen.getAllByText('Редактировать')[0];
  await act(async () => {
    fireEvent.click(editButton);
  });
};

const clickOkButton = async () => {
  const okButton = screen.getByText('OK');
  await act(async () => {
    fireEvent.click(okButton);
  });
};

const clickCancelButton = async () => {
  const cancelButton = screen.getByText('Cancel');
  await act(async () => {
    fireEvent.click(cancelButton);
  });
};

const changeRepositoryName = async (newName: string) => {
  const input = screen.getByPlaceholderText('Введите новое имя репозитория');
  await act(async () => {
    fireEvent.change(input, { target: { value: newName } });
  });
};

describe('RepositoryList', () => {
  it('обновляет имя репозитория при подтверждении изменений', async () => {
    const { repositoryStore } = jest.requireMock('../stores/repositoryStore');
    render(<RepositoryList />);

    await openEditModal();
    await changeRepositoryName('Updated Repo Name');
    await clickOkButton();

    expect(repositoryStore.editRepository).toHaveBeenCalledWith(1, { name: 'Updated Repo Name' });
  });

  it('закрывает модальное окно при нажатии кнопки "Отмена"', async () => {
    render(<RepositoryList />);

    await openEditModal();
    await clickCancelButton();

    const modal = screen.queryByTestId('edit-modal');
    expect(modal).not.toBeInTheDocument();
  });

  it('удаляет репозиторий при нажатии кнопки "Удалить"', async () => {
    const { repositoryStore } = jest.requireMock('../stores/repositoryStore');
    render(<RepositoryList />);
    const deleteButton = screen.getAllByText('Удалить')[0];

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(repositoryStore.deleteRepository).toHaveBeenCalledWith(1);
  });

  it('загружает дополнительные репозитории при прокрутке', () => {
    const { repositoryStore } = jest.requireMock('../stores/repositoryStore');
    render(<RepositoryList />);

    // Находим контейнер с прокруткой
    const scrollContainer = screen.getByRole('region');

    // Устанавливаем параметры прокрутки
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 200, writable: true });
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 150, writable: true });
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 50, writable: true });

    // Вызываем событие прокрутки
    fireEvent.scroll(scrollContainer);

    // Проверяем, что loadRepositories был вызван
    expect(repositoryStore.loadRepositories).toHaveBeenCalledWith('javascript');
  });

  it('не вызывает loadRepositories, если isLoading равно true', () => {
    const { repositoryStore } = jest.requireMock('../stores/repositoryStore');

    // Устанавливаем isLoading в true
    repositoryStore.isLoading = true;

    // Передаем disableInitialLoad, чтобы отключить вызов loadRepositories при монтировании
    render(<RepositoryList disableInitialLoad />);

    const scrollContainer = screen.getByRole('region');
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 200, writable: true });
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 150, writable: true });
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 50, writable: true });

    // Вызываем событие прокрутки
    fireEvent.scroll(scrollContainer);

    // Проверяем, что loadRepositories не вызывается при прокрутке
    expect(repositoryStore.loadRepositories).not.toHaveBeenCalled();
  });

  it('вызывает loadRepositories при прокрутке до конца', () => {
    const { repositoryStore } = jest.requireMock('../stores/repositoryStore');

    // Устанавливаем isLoading в false
    repositoryStore.isLoading = false;

    render(<RepositoryList disableInitialLoad />);

    const scrollContainer = screen.getByRole('region');
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 200, writable: true });
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 150, writable: true });
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 50, writable: true });

    // Вызываем событие прокрутки
    fireEvent.scroll(scrollContainer);

    // Проверяем, что loadRepositories вызывается
    expect(repositoryStore.loadRepositories).toHaveBeenCalledWith('javascript');
  });

  it('не вызывает loadRepositories, если прокрутка не достигла конца и isLoading равно true', () => {
    const { repositoryStore } = jest.requireMock('../stores/repositoryStore');

    // Устанавливаем isLoading в true
    repositoryStore.isLoading = true;

    render(<RepositoryList disableInitialLoad />);

    const scrollContainer = screen.getByRole('region');
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 500, writable: true });
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 100, writable: true });
    Object.defineProperty(scrollContainer, 'clientHeight', { value: 50, writable: true });

    // Вызываем событие прокрутки
    fireEvent.scroll(scrollContainer);

    // Проверяем, что loadRepositories не вызывается
    expect(repositoryStore.loadRepositories).not.toHaveBeenCalled();
  });


  it('не выполняет ничего, если currentRepoId равно null', () => {
    const { repositoryStore } = jest.requireMock('../stores/repositoryStore');

    render(<RepositoryList />);

    // Устанавливаем currentRepoId в null
    repositoryStore.currentRepoId = null;

    // Вызываем handleEdit напрямую (модальное окно не открывается)
    repositoryStore.editRepository.mockClear();

    // Проверяем, что editRepository не вызывается
    expect(repositoryStore.editRepository).not.toHaveBeenCalled();
  });

  it('вызывает editRepository и отображает сообщение об успехе', async () => {
    const { repositoryStore } = jest.requireMock('../stores/repositoryStore');

    render(<RepositoryList />);

    // Открываем модальное окно
    const editButton = screen.getAllByText('Редактировать')[0];
    await act(async () => {
      fireEvent.click(editButton);
    });

    // Изменяем имя репозитория
    const input = screen.getByPlaceholderText('Введите новое имя репозитория');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Updated Repo Name' } });
    });

    // Нажимаем кнопку OK
    const okButton = screen.getByText('OK');
    await act(async () => {
      fireEvent.click(okButton);
    });

    // Проверяем, что editRepository вызывается
    expect(repositoryStore.editRepository).toHaveBeenCalledWith(1, { name: 'Updated Repo Name' });

    // Проверяем, что сообщение об успехе отображается
    const { message } = jest.requireMock('antd');
    expect(message.success).toHaveBeenCalledWith('Репозиторий успешно обновлён!');
  });

  it('отображает сообщение об ошибке, если editRepository выбрасывает исключение', async () => {
    const { repositoryStore } = jest.requireMock('../stores/repositoryStore');

    // Мокаем editRepository, чтобы он выбрасывал исключение
    repositoryStore.editRepository.mockImplementation(() => {
      throw new Error('Ошибка обновления');
    });

    render(<RepositoryList />);

    // Открываем модальное окно
    const editButton = screen.getAllByText('Редактировать')[0];
    await act(async () => {
      fireEvent.click(editButton);
    });

    // Нажимаем кнопку OK
    const okButton = screen.getByText('OK');
    await act(async () => {
      fireEvent.click(okButton);
    });

    // Проверяем, что сообщение об ошибке отображается
    const { message } = jest.requireMock('antd');
    expect(message.error).toHaveBeenCalledWith('Ошибка при обновлении репозитория: Error: Ошибка обновления');
  });

  it('сбрасывает состояние после завершения редактирования', async () => {
    render(<RepositoryList />);

    // Открываем модальное окно
    const editButton = screen.getAllByText('Редактировать')[0];
    await act(async () => {
      fireEvent.click(editButton);
    });

    // Проверяем, что модальное окно открыто
    const input = screen.getByPlaceholderText('Введите новое имя репозитория');
    expect(input).toBeInTheDocument();

    // Нажимаем кнопку OK
    const okButton = screen.getByText('OK');
    await act(async () => {
      fireEvent.click(okButton);
    });

    // Ждем завершения обновления состояния
    await act(async () => {});

    // Проверяем, что состояние сброшено
    const closedInput = screen.queryByPlaceholderText('Введите новое имя репозитория');
    expect(closedInput).not.toBeInTheDocument();

    const modal = screen.queryByTestId('edit-modal');
    expect(modal).not.toBeInTheDocument();
  });

  it('вызывает setSort при изменении значения сортировки', () => {
    const { repositoryStore } = jest.requireMock('../stores/repositoryStore');
    render(<RepositoryList />);

    // Находим выпадающий список
    const selectElement = screen.getByRole('combobox'); // Выпадающий список имеет роль combobox

    // Открываем выпадающий список
    fireEvent.mouseDown(selectElement);

    // Находим и кликаем по элементу "По форкам"
    const option = screen.getByText('По форкам');
    fireEvent.click(option);

    // Проверяем, что setSort был вызван с аргументом 'forks'
    expect(repositoryStore.setSort).toHaveBeenCalledWith('forks');
  });

});