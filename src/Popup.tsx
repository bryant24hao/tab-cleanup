import React, { useState, useEffect } from 'react';
import TabPreview from './TabPreview';

interface TimeOption {
  label: string;
  hours: number;
}

interface TabCounts {
  [key: number]: number;
}

interface CustomTimeInputProps {
  onSubmit: (hours: number) => void;
  onCancel: () => void;
}

const CustomTimeInput: React.FC<CustomTimeInputProps> = ({ onSubmit, onCancel }) => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      alert('Please enter a valid positive number');
      return;
    }
    let hours = numValue;
    if (unit === 'days') {
      hours = numValue * 24;
    } else if (unit === 'minutes') {
      hours = numValue / 60;
    }
    onSubmit(hours);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 w-72">
        <h2 className="text-lg font-bold mb-4">Custom Time Range</h2>
        <div className="mb-4">
          <div className="mb-2">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-64 p-2 border rounded"
              placeholder="Enter time"
              step="0.5"
              min="0.5"
              required
            />
          </div>
          <div>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'minutes' | 'hours' | 'days')}
              className="w-64 p-2 border rounded"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded gradient-button"
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  );
};

const timeOptions: TimeOption[] = [
  { label: '1 hour', hours: 1 },
  { label: '12 hours', hours: 12 },
  { label: '24 hours', hours: 24 },
  { label: '1 week', hours: 24 * 7 }
];

const Popup: React.FC = () => {
  const [tabCount, setTabCount] = useState<number>(0);
  const [cleaning, setCleaning] = useState<boolean>(false);
  const [tabCounts, setTabCounts] = useState<TabCounts>({});
  const [previewTabs, setPreviewTabs] = useState<chrome.tabs.Tab[]>([]);
  const [selectedHours, setSelectedHours] = useState<number | null>(null);
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');

  useEffect(() => {
    updateTabCounts();
  }, []);

  const updateTabCounts = async () => {
    try {
      const tabs = await chrome.tabs.query({});
      setTabCount(tabs.length);
      console.log('Total tabs:', tabs.length);

      const data = await chrome.storage.local.get('tabActivities');
      const activities = data.tabActivities || {};
      console.log('Tab activities:', activities);
      
      const counts: TabCounts = {};
      timeOptions.forEach(option => {
        const cutoffTime = Date.now() - (option.hours * 60 * 60 * 1000);
        const count = tabs.filter(tab => {
          // Skip the extension's own tabs
          if (!tab.id || tab.url?.startsWith('chrome-extension://')) {
            return false;
          }
          
          const lastActivity = activities[tab.id];
          const isOld = lastActivity && lastActivity < cutoffTime;
          
          if (isOld) {
            console.log(`Tab ${tab.id} (${tab.title}) is older than ${option.hours} hours:`, {
              lastActivity: new Date(lastActivity).toISOString(),
              cutoffTime: new Date(cutoffTime).toISOString()
            });
          }
          
          return isOld;
        }).length;
        
        counts[option.hours] = count;
        console.log(`Tabs older than ${option.hours} hours:`, count);
      });
      
      setTabCounts(counts);
    } catch (error) {
      console.error('Error updating tab counts:', error);
    }
  };

  const handlePreview = async (hours: number) => {
    try {
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
      console.log('Preview cutoff time:', new Date(cutoffTime).toISOString());
      
      const tabs = await chrome.tabs.query({});
      const data = await chrome.storage.local.get('tabActivities');
      const activities = data.tabActivities || {};
      console.log('Current tab activities:', activities);
      
      const oldTabs = tabs.filter(tab => {
        if (!tab.id || tab.url?.startsWith('chrome-extension://')) {
          return false;
        }
        
        const lastActivity = activities[tab.id];
        const isOld = lastActivity && lastActivity < cutoffTime;
        
        if (isOld) {
          console.log(`Including tab ${tab.id} (${tab.title}):`, {
            lastActivity: new Date(lastActivity).toISOString(),
            cutoffTime: new Date(cutoffTime).toISOString()
          });
        }
        
        return isOld;
      });

      console.log('Tabs to preview:', oldTabs.length);
      setPreviewTabs(oldTabs);
      setSelectedHours(hours);
    } catch (error) {
      console.error('Error preparing preview:', error);
    }
  };

  const handleCustomTime = (hours: number) => {
    setShowCustomTimeInput(false);
    handlePreview(hours);
  };

  const handleCustomTimeSubmit = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      alert('Please enter a valid positive number');
      return;
    }
    let hours = numValue;
    if (unit === 'days') {
      hours = numValue * 24;
    } else if (unit === 'minutes') {
      hours = numValue / 60;
    }
    handleCustomTime(hours);
  };

  const handleCleanup = async () => {
    if (!selectedHours) return;
    
    setCleaning(true);
    try {
      const tabIds = previewTabs
        .map(tab => tab.id)
        .filter((id): id is number => id !== undefined);

      if (tabIds.length > 0) {
        await chrome.tabs.remove(tabIds);
        await updateTabCounts();
      }
    } catch (error) {
      console.error('Error cleaning tabs:', error);
    } finally {
      setCleaning(false);
      setPreviewTabs([]);
      setSelectedHours(null);
    }
  };

  const handleCustomTimeClick = () => {
    setShowCustomTimeInput(true);
  };

  return (
    <div className="p-4 relative">
      <h1 className="text-lg font-bold mb-4">Tab Cleanup</h1>
      <div className="mb-4">
        <p className="text-sm mb-2">Current tabs: {tabCount}</p>
      </div>
      <div className="grid gap-2">
        {timeOptions.map((option) => (
          <button
            key={option.hours}
            onClick={() => handlePreview(option.hours)}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={cleaning || tabCounts[option.hours] === 0}
          >
            Clean tabs older than {option.label}
            {tabCounts[option.hours] > 0 && ` (${tabCounts[option.hours]})`}
          </button>
        ))}
        <div className="relative">
          <button
            onClick={() => setShowCustomTimeInput(true)}
            className="w-full bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200"
          >
            Custom time range...
          </button>

          {showCustomTimeInput && (
            <div className="custom-time-dropdown">
              <h2 className="text-lg font-bold">Custom Time Range</h2>
              <div className="content">
                <div className="custom-time-input-container" style={{ maxWidth: '260px' }}>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter time"
                    className="custom-input"
                    min="1"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                    className="custom-input custom-select"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
              <div className="buttons">
                <button
                  onClick={() => setShowCustomTimeInput(false)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomTimeSubmit}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {previewTabs.length > 0 && (
        <TabPreview
          tabs={previewTabs}
          onClose={() => {
            setPreviewTabs([]);
            setSelectedHours(null);
          }}
          onConfirm={handleCleanup}
        />
      )}
    </div>
  );
};

export default Popup;
