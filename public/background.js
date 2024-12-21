let tabOpenTimes = {};

chrome.tabs.onCreated.addListener((tab) => {
  tabOpenTimes[tab.id] = Date.now();
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabOpenTimes[tabId];
});

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
    const openTime = tabOpenTimes[tab.id] || now;
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
        (tabOpenTimes[tabId] < tabOpenTimes[oldest] ? tabId : oldest), tabIds[0]);
      const oldestTabInfo = await chrome.tabs.get(oldestTab);
      chrome.tabGroups.update(group, { title: oldestTabInfo.title });
    }
  });
}

