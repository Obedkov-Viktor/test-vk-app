import { makeAutoObservable, runInAction } from 'mobx';
import { fetchRepositories, Repository } from '../services/githubApi';

class RepositoryStore {
  repositories: Repository[] = [];
  isLoading: boolean = false;
  hasMore: boolean = true;
  page: number = 1;
  query: string = 'javascript';
  sort: string = 'stars';
  order: string = 'desc';
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setSort(sort:string){
    this.sort = sort;
    this.resetRepositories();
    this.loadRepositories();
  }
  setOrder(order: string) {
    this.order = order;
    this.resetRepositories();
  }

  resetRepositories() {
    this.repositories = [];
    this.page = 1;
    this.hasMore = true;
  }

  // Метод принимает аргумент query
  loadRepositories = async (query: string = this.query) => {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    try {
      const data = await fetchRepositories(query, this.page, this.sort, this.order);
      runInAction(() => {
        this.repositories = [...this.repositories, ...data.items];
        this.hasMore = data.items.length > 0;
        this.page += 1;
      });
    } catch (error) {
      console.error('Ошибка при загрузке репозиториев:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  deleteRepository = (id: number) => {
    runInAction(() => {
    this.repositories = this.repositories.filter((repo) => repo.id !== id);
    });
  };

  editRepository = (id: number, updatedData: Partial<Repository>) => {
    runInAction(() => {
      this.repositories = this.repositories.map((repo) =>
        repo.id === id ? { ...repo, ...updatedData } : repo
      );
    });
  };
}

export const repositoryStore = new RepositoryStore();