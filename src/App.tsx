import React from 'react';
import RepositoryList from './components/RepositoryList';

const App: React.FC = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>GitHub Repositories</h1>
      <RepositoryList />
    </div>
  );
};

export default App;
