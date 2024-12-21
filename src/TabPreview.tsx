import React, { useState } from 'react';

interface TabPreviewProps {
  tabs: chrome.tabs.Tab[];
  onClose: () => void;
  onConfirm: () => void;
}

const TabPreview: React.FC<TabPreviewProps> = ({ tabs: initialTabs, onClose, onConfirm }) => {
  const [tabs, setTabs] = useState(initialTabs);

  const handleRemoveTab = (tabId: number) => {
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
  };

  const handleConfirm = () => {
    if (tabs.length === 0) {
      onClose();
    } else {
      onConfirm();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-lg font-bold mb-4">
          Tabs to be closed ({tabs.length})
        </h2>
        <div className="modal-body mb-4">
          {tabs.map((tab) => (
            <div key={tab.id} className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded group">
              <div className="flex items-center flex-1 min-w-0">
                <img
                  src={tab.favIconUrl || ''}
                  alt=""
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="truncate text-sm">{tab.title}</span>
              </div>
              <button
                onClick={() => handleRemoveTab(tab.id!)}
                className="tab-close-button"
                title="Remove from list"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            disabled={tabs.length === 0}
          >
            Close Tabs
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabPreview;
