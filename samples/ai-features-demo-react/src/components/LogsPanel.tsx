import React from 'react';

interface LogsPanelProps {
    logs: string[];
    onClear: () => void;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({ logs, onClear }) => {
    return (
        <div className="card">
            <div className="card-header logs-header">
                <h2 className="card-title">Logs</h2>
                <button className="btn btn-flat btn-small" onClick={onClear}>
                    Clear
                </button>
            </div>
            <div className="card-content">
                <pre className="logs-box">
                    {logs.join('\n')}
                </pre>
            </div>
        </div>
    );
};
