/**
 * ShieldCode Extension - Background Service Worker
 * Handles storage initialization and message passing.
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['userCode', 'protectionEnabled'], (res) => {
    if (!res.userCode) {
      chrome.storage.local.set({
        userCode: 'SECURE2026',
        protectionEnabled: true,
      });
    }
  });
  console.log('ShieldCode Extension installed and ready.');
});
