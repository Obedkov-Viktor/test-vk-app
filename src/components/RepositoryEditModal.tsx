import React from 'react';

interface RepositoryEditModalProps {
    title: string;
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    children: React.ReactNode;
    'data-testid'?: string;
}

const RepositoryEditModal: React.FC<RepositoryEditModalProps> = ({ title, open, onOk, onCancel, children, 'data-testid': testId }) => {
    if (!open) return null;

    return (
        <div
            data-testid={testId}
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: '1px solid black',
                padding: '20px',
                backgroundColor: 'white',
                zIndex: 1000,
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
            }}
        >
            <h2>{title}</h2>
            <div>{children}</div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                    onClick={onOk}
                    style={{
                        marginRight: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    OK
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default RepositoryEditModal;