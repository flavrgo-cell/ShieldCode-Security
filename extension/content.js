/**
 * ShieldCode Extension - Content Script
 * Scans active financial portals and webmail for Anti-Phishing Code verification.
 */

(function () {
  let userCode = null;
  let isProtected = true;

  // Retrieve current code from storage
  function refreshConfig() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['userCode', 'protectionEnabled'], (res) => {
        if (res.userCode) userCode = res.userCode;
        if (res.protectionEnabled !== undefined) isProtected = res.protectionEnabled;
        if (isProtected && userCode) {
          scanPage();
        }
      });
    }
  }

  function scanPage() {
    if (!userCode || !isProtected) return;

    // Look for message containers, email bodies, SMS preview cards, or OTP dialogs
    const textNodes = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          if (!node.parentElement) return NodeFilter.FILTER_REJECT;
          const tag = node.parentElement.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'textarea' || tag === 'input') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      const val = node.nodeValue;
      if (val && val.includes(userCode)) {
        markGenuineNode(node.parentElement);
      }
    }
  }

  function markGenuineNode(element) {
    if (element.getAttribute('data-shieldcode-verified')) return;
    element.setAttribute('data-shieldcode-verified', 'true');

    const badge = document.createElement('span');
    badge.className = 'shieldcode-verified-badge';
    badge.innerHTML = '🛡️ موثق بـ ShieldCode';
    badge.title = `تم التحقق من وجود رمز مكافحة التصيد السري: [${userCode}]`;
    
    element.appendChild(badge);
  }

  refreshConfig();

  // Periodic rescan on dynamic single page applications
  setInterval(() => {
    if (isProtected && userCode) {
      scanPage();
    }
  }, 4000);
})();
