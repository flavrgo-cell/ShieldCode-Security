/**
 * ShieldCode Browser Extension - Popup Script
 * Universal Anti-Phishing Guard v2.2.0
 */

const DEFAULT_CODE = "SECURE2026";

// Storage abstraction (supports chrome.storage and localStorage fallback)
const Storage = {
  get: function(keys, callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, callback);
    } else {
      const res = {};
      keys.forEach(k => {
        try {
          const val = localStorage.getItem('shieldcode_' + k);
          if (val !== null) res[k] = JSON.parse(val);
        } catch (e) {}
      });
      callback(res);
    }
  },
  set: function(obj, callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(obj, callback);
    } else {
      Object.keys(obj).forEach(k => {
        try {
          localStorage.setItem('shieldcode_' + k, JSON.stringify(obj[k]));
        } catch (e) {}
      });
      if (callback) callback();
    }
  }
};

let currentCode = DEFAULT_CODE;
let isProtected = true;
let isShowingCode = false;

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');
  const codeDisplay = document.getElementById('codeDisplay');
  const toggleShowBtn = document.getElementById('toggleShowBtn');
  const editCodeBtn = document.getElementById('editCodeBtn');
  const editForm = document.getElementById('editForm');
  const newCodeInput = document.getElementById('newCodeInput');
  const saveCodeBtn = document.getElementById('saveCodeBtn');
  const editError = document.getElementById('editError');
  const verifyInput = document.getElementById('verifyInput');
  const verifyBtn = document.getElementById('verifyBtn');
  const resultBox = document.getElementById('resultBox');
  const resultIcon = document.getElementById('resultIcon');
  const resultTitle = document.getElementById('resultTitle');
  const resultDesc = document.getElementById('resultDesc');
  const protectionToggle = document.getElementById('protectionToggle');

  // Load state
  Storage.get(['userCode', 'protectionEnabled'], (data) => {
    if (data.userCode) currentCode = data.userCode;
    if (data.protectionEnabled !== undefined) isProtected = data.protectionEnabled;

    updateUI();
  });

  function updateUI() {
    // Status
    if (isProtected) {
      statusPill.classList.remove('disabled');
      statusText.textContent = 'مفعّل';
      protectionToggle.checked = true;
    } else {
      statusPill.classList.add('disabled');
      statusText.textContent = 'معطّل';
      protectionToggle.checked = false;
    }

    // Code Display
    if (isShowingCode) {
      codeDisplay.textContent = currentCode;
    } else {
      codeDisplay.textContent = '••••••••';
    }
  }

  // Toggle show/hide
  toggleShowBtn.addEventListener('click', () => {
    isShowingCode = !isShowingCode;
    toggleShowBtn.textContent = isShowingCode ? '🙈' : '👁️';
    updateUI();
  });

  // Toggle Edit Form
  editCodeBtn.addEventListener('click', () => {
    editForm.classList.toggle('hidden');
    newCodeInput.value = currentCode;
    editError.classList.add('hidden');
  });

  // Save Code
  saveCodeBtn.addEventListener('click', () => {
    const code = (newCodeInput.value || '').trim();
    if (code.length < 4 || code.length > 20) {
      editError.textContent = 'الرمز يجب أن يتكون من 4 إلى 20 خانة';
      editError.classList.remove('hidden');
      return;
    }
    if (!/[A-Za-z\u0621-\u064A]/.test(code) || !/[0-9]/.test(code)) {
      editError.textContent = 'يجب أن يحتوي الرمز على أحرف وأرقام معاً';
      editError.classList.remove('hidden');
      return;
    }

    currentCode = code;
    Storage.set({ userCode: currentCode }, () => {
      editForm.classList.add('hidden');
      isShowingCode = true;
      toggleShowBtn.textContent = '🙈';
      updateUI();
    });
  });

  // Toggle protection
  protectionToggle.addEventListener('change', (e) => {
    isProtected = e.target.checked;
    Storage.set({ protectionEnabled: isProtected }, () => {
      updateUI();
    });
  });

  // Verify message
  verifyBtn.addEventListener('click', () => {
    const text = (verifyInput.value || '').trim();
    if (!text) {
      alert('يرجى لصق نص الرسالة أولاً');
      return;
    }

    const hasCode = text.includes(currentCode);
    resultBox.classList.remove('hidden', 'genuine', 'phishing');

    if (hasCode) {
      resultBox.classList.add('genuine');
      resultIcon.textContent = '✅';
      resultTitle.textContent = 'رسالة أصلية موثقة (VERIFIED)';
      resultDesc.textContent = `تم التحقق بنجاح! الرسالة تحتوي على رمزك السري المعتمد [${currentCode}]. المرسل هو الجهة الحقيقية المصرح لها.`;
    } else {
      resultBox.classList.add('phishing');
      resultIcon.textContent = '🚨';
      resultTitle.textContent = 'تحذير أمني: محاولة تصيد احتيالي!';
      resultDesc.textContent = `الرسالة لا تحتوي على رمز مكافحة التصيد الخاص بك [${currentCode}]. لا تضغط على أي رابط، ولا تشارك أي بيانات سرية!`;
    }
  });
});
