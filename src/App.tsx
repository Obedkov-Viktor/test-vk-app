import React from 'react';
import RepositoryList from './components/RepositoryList';
import EventEmitterDemo from "./components/EventEmitterDemo.tsx";

const App: React.FC = () => {
    return (
        <div>
            <h1 style={{textAlign: 'center'}}>GitHub Repositories</h1>
            <EventEmitterDemo/>
            <hr style={{margin: '20px 0 '}}/>
            <RepositoryList/>
        </div>
    );
};

export default App;
