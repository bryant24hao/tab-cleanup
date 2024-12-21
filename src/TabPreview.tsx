import React, { useState, useEffect } from 'react';

interface TabPreviewProps {
  tabs: chrome.tabs.Tab[];
  onClose: () => void;
  onConfirm: () => void;
}

const TabPreview: React.FC<TabPreviewProps> = ({ tabs: initialTabs, onClose, onConfirm }) => {
  const [tabs, setTabs] = useState(initialTabs);

  useEffect(() => {
    // 打印出标签页信息以进行调试
    console.log('Tabs info:', tabs.map(tab => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favIconUrl: tab.favIconUrl
    })));
  }, [tabs]);

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

  const getFaviconUrl = (tab: chrome.tabs.Tab) => {
    // 只使用标签页原始的 favIconUrl
    if (tab.favIconUrl && !tab.favIconUrl.startsWith('chrome://')) {
      return tab.favIconUrl;
    }
    return null;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-lg font-bold mb-4">
          Tabs to be closed ({tabs.length})
        </h2>
        <div className="modal-body mb-4 max-h-[400px] overflow-y-auto">
          {tabs.map((tab) => (
            <div key={tab.id} className="tab-preview-item" title={tab.title}>
              <div className="tab-preview-content">
                <div className={`tab-preview-favicon-wrapper ${!getFaviconUrl(tab) ? 'tab-preview-favicon-placeholder' : ''}`}>
                  {getFaviconUrl(tab) && (
                    <img
                      src={getFaviconUrl(tab)!}
                      alt=""
                      className="tab-preview-favicon"
                      onError={(e) => {
                        e.currentTarget.parentElement?.classList.add('tab-preview-favicon-placeholder');
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <span className="tab-preview-title">
                  {tab.title}
                </span>
              </div>
              <button
                onClick={() => handleRemoveTab(tab.id!)}
                className="tab-preview-close"
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
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabPreview;
