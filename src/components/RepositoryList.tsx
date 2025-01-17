import React, {useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {repositoryStore} from '../stores/repositoryStore';
import {List, Spin, Button, Input, message, Select} from 'antd';
import RepositoryEditModal from "./RepositoryEditModal.tsx";

const { Option } = Select;
interface RepositoryListProps {
    disableInitialLoad?: boolean;
}

const RepositoryList: React.FC<RepositoryListProps> = observer(({disableInitialLoad = false}) => {
    const {repositories, isLoading, loadRepositories, deleteRepository, editRepository} = repositoryStore;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentRepoId, setCurrentRepoId] = useState<number | null>(null);
    const [newRepoName, setNewRepoName] = useState<string>('');


    useEffect(() => {
        if (!disableInitialLoad) {
            repositoryStore.loadRepositories();
        }
    }, [disableInitialLoad,repositoryStore.sort]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const {scrollTop, scrollHeight, clientHeight} = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && !isLoading) {
            loadRepositories('javascript');
        }
    };

    const showEditModal = (id: number, currentName: string) => {
        setCurrentRepoId(id);
        setNewRepoName(currentName);
        setIsModalVisible(true);
    };

    const handleEdit = () => {
        if (currentRepoId !== null) {
            try {
                editRepository(currentRepoId, {name: newRepoName});
                message.success('Репозиторий успешно обновлён!');
            } catch (error) {
                message.error(`Ошибка при обновлении репозитория: ${String(error)}`);
            }
        }
        setIsModalVisible(false);
        setNewRepoName('');
        setCurrentRepoId(null);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setNewRepoName('');
        setCurrentRepoId(null);
    };
    return (
        <div>
            {/* Выпадающий список для выбора сортировки */}
            <Select
                defaultValue="stars"
                style={{ marginBottom: '20px', width: '200px' }}
                onChange={(value: string) => repositoryStore.setSort(value)}
            >
                <Option value="stars">По звёздам</Option>
                <Option value="forks">По форкам</Option>
                <Option value="updated">По дате обновления</Option>
            </Select>

            {/* Список репозиториев */}
            <div
                onScroll={handleScroll}
                style={{height: '80vh', overflowY: 'auto'}}
                role="region"
            >
                <div
                    style={{
                        maxWidth: '600px',
                        margin: '0 auto',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <List
                        dataSource={repositories}
                        locale={{emptyText: 'Нет репозиториев для отображения.'}}
                        renderItem={(repo) => (
                            <List.Item
                                key={repo.id}
                                actions={[
                                    <Button onClick={() => deleteRepository(repo.id)}>Удалить</Button>,
                                    <Button onClick={() => showEditModal(repo.id, repo.name)}>Редактировать</Button>,
                                ]}
                            >
                                {repo.name}
                            </List.Item>
                        )}
                    />
                </div>
                {isLoading && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                        }}
                    >
                        <Spin data-testid="loading-spinner"/>
                    </div>
                )}
            </div>

            {/* Модальное окно для редактирования */}
            <RepositoryEditModal
                title="Редактировать репозиторий"
                open={isModalVisible}
                onOk={handleEdit}
                onCancel={handleCancel}
                data-testid="edit-modal"
            >
                <Input
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    placeholder="Введите новое имя репозитория"
                />
            </RepositoryEditModal>
        </div>
    );
});

export default RepositoryList;