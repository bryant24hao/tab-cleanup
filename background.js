// Store tab activity times in memory and storage
let tabActivities = {};

// Helper function to log with timestamp
const debugLog = (message, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data);
};

// Initialize tab activities
const initializeTabActivities = async () => {
  const tabs = await chrome.tabs.query({});
  const time = Date.now();
  debugLog('Initializing tab activities for tabs:', tabs.length);

  // Get existing activities
  const data = await chrome.storage.local.get('tabActivities');
  tabActivities = data.tabActivities || {};

  // Initialize activities for all open tabs
  tabs.forEach(tab => {
    if (tab.id && !tabActivities[tab.id]) {
      tabActivities[tab.id] = time;
    }
  });

  // Save to storage
  await chrome.storage.local.set({ tabActivities });
  debugLog('Tab activities initialized:', tabActivities);
};

// Update tab activity time
const updateTabActivity = async (tabId) => {
  const time = Date.now();
  tabActivities[tabId] = time;
  
  try {
    await chrome.storage.local.set({ tabActivities });
    debugLog(`Updated activity for tab ${tabId}:`, time);
  } catch (error) {
    console.error('Error updating tab activity:', error);
  }
};

// Clean up stored data for closed tabs
const cleanupTabData = async (tabId) => {
  delete tabActivities[tabId];
  
  try {
    await chrome.storage.local.set({ tabActivities });
    debugLog(`Cleaned up data for tab ${tabId}`);
  } catch (error) {
    console.error('Error cleaning up tab data:', error);
  }
};

// Event Listeners
chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.id) {
    debugLog('Tab created:', tab.id);
    await updateTabActivity(tab.id);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  debugLog('Tab removed:', tabId);
  await cleanupTabData(tabId);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  debugLog('Tab activated:', activeInfo.tabId);
  await updateTabActivity(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only update if the tab has completed loading
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    debugLog('Tab updated:', { tabId, url: tab.url });
    await updateTabActivity(tabId);
  }
});

// Initialize on install
chrome.runtime.onInstalled.addListener(initializeTabActivities);

// Initialize on startup
chrome.runtime.onStartup.addListener(initializeTabActivities);

// Initialize when the service worker starts
initializeTabActivities();

// Runtime message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'groupTabs') {
    groupTabs();
  }
});

async function groupTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const { groupInterval } = await chrome.storage.sync.get(['groupInterval']);
  const interval = groupInterval * 60 * 60 * 1000; // convert hours to milliseconds

  const now = Date.now();
  const groups = {};

  tabs.forEach((tab) => {
    const openTime = tabActivities[tab.id] || now;
    const groupIndex = Math.floor((now - openTime) / interval);
    if (!groups[groupIndex]) {
      groups[groupIndex] = [];
    }
    groups[groupIndex].push(tab.id);
  });

  Object.values(groups).forEach(async (tabIds) => {
    if (tabIds.length > 1) {
      const group = await chrome.tabs.group({ tabIds });
      const oldestTab = tabIds.reduce((oldest, tabId) => 
        (tabActivities[tabId] < tabActivities[oldest] ? tabId : oldest), tabIds[0]);
      const oldestTabInfo = await chrome.tabs.get(oldestTab);
      chrome.tabGroups.update(group, { title: oldestTabInfo.title });
    }
  });
}
