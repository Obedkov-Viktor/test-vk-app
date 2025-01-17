import axios from 'axios';

const API_URL = 'https://api.github.com/search/repositories';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export interface Repository {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  html_url: string;
}

export interface ApiResponse {
  items: Repository[];
  total_count: number;
}

export const fetchRepositories = async (
    query: string,
    page: number,
    sort: string = 'stars',
    order: string = 'desc',
    perPage: number = 30
): Promise<ApiResponse> => {
  const response = await axios.get(API_URL, {
    params: {
      q: query,
      sort,
      order,
      page,
      per_page: perPage,
      timestamp: new Date().getTime(),
    },
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${GITHUB_TOKEN}`,
    },
  });

  return response.data;
};