/**
 * ShieldCode Elements — Framework-Agnostic Drop-in Web Component SDK (v1.0.0)
 *
 * Provides strict Shadow DOM CSS encapsulation (`attachShadow({ mode: "open" })`)
 * so the widget's styles never conflict with the host Bank's CSS.
 * All API calls hit the ShieldCode SaaS backend directly using `Authorization: Bearer <clientSessionToken>`.
 *
 * Usage (HTML Custom Element):
 *   <script src="https://api.shieldcode.io/sdk/shieldcode-widget.js"></script>
 *   <shield-code-widget client-session-token="eyJhbGciOiJIUzI1Ni..."></shield-code-widget>
 *
 * Usage (JavaScript Imperative Mount):
 *   ShieldCode.mount("#bank-security-slot", {
 *     clientSessionToken: "eyJhbGciOiJIUzI1Ni...",
 *     apiBaseUrl: "https://api.shieldcode.io"
 *   });
 */
(function (window, document) {
  "use strict";

  const SHADOW_STYLES = `
    :host {
      all: initial;
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Tajawal", sans-serif;
      color: #f8fafc;
      box-sizing: border-box;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    .sc-card {
      background: linear-gradient(145deg, #0f172a 0%, #020617 100%);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 18px;
      padding: 20px;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 24px 0 rgba(16, 185, 129, 0.08);
      color: #f8fafc;
    }
    .sc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .sc-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sc-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #10b981, #06b6d4);
      color: #020617;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      flex-shrink: 0;
    }
    .sc-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    .sc-subtitle {
      font-size: 12px;
      color: #94a3b8;
      margin: 2px 0 0 0;
    }
    .sc-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid transparent;
    }
    .sc-badge-active {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.35);
    }
    .sc-badge-inactive {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border-color: rgba(245, 158, 11, 0.35);
    }
    .sc-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }
    .sc-form {
      display: flex;
      gap: 10px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .sc-input-wrap {
      position: relative;
      flex: 1;
      min-width: 180px;
    }
    .sc-input {
      width: 100%;
      height: 42px;
      background: #020617;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 0 58px 0 14px;
      color: #34d399;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 14px;
      font-weight: 700;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .sc-input:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }
    .sc-counter {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 11px;
      font-family: monospace;
      color: #64748b;
    }
    .sc-btn {
      height: 42px;
      padding: 0 20px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(90deg, #10b981, #06b6d4);
      color: #020617;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .sc-btn:hover:not(:disabled) {
      opacity: 0.92;
    }
    .sc-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .sc-footer {
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
      flex-wrap: wrap;
      gap: 8px;
    }
    .sc-msg {
      margin-top: 10px;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 12px;
      display: none;
    }
    .sc-msg-ok {
      display: block;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #6ee7b7;
    }
    .sc-msg-err {
      display: block;
      background: rgba(244, 63, 94, 0.12);
      border: 1px solid rgba(244, 63, 94, 0.35);
      color: #fda4af;
    }
  `;

  class ShieldCodeWidgetElement extends HTMLElement {
    static get observedAttributes() {
      return ["client-session-token", "api-base-url"];
    }

    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
      this._state = {
        isEnabled: false,
        maskedCode: null,
        companyName: "Partner Bank",
        loading: false,
        message: null,
        messageType: "ok",
      };
    }

    connectedCallback() {
      this._render();
      this._fetchStatus();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal !== newVal && this.isConnected) {
        this._fetchStatus();
      }
    }

    get clientSessionToken() {
      return this.getAttribute("client-session-token") || "";
    }

    set clientSessionToken(val) {
      this.setAttribute("client-session-token", val);
    }

    get apiBaseUrl() {
      return (this.getAttribute("api-base-url") || "").replace(/\/+$/, "");
    }

    async _fetchStatus() {
      const token = this.clientSessionToken;
      if (!token) return;

      try {
        const res = await fetch(`${this.apiBaseUrl}/api/v1/widget/configure`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          this._state.isEnabled = Boolean(data.is_enabled);
          this._state.maskedCode = data.masked_code || null;
          this._state.companyName = data.company_name || "Partner Bank";
          this._updateDom();
        }
      } catch (_) {}
    }

    async _handleSave(e) {
      e.preventDefault();
      const inputEl = this._shadow.querySelector("#sc-code-input");
      const rawCode = inputEl ? inputEl.value.trim() : "";

      if (!/^[A-Za-z0-9_\-\u0600-\u06FF]{4,20}$/.test(rawCode)) {
        this._state.message =
          "Code must be 4–20 alphanumeric characters (no spaces or special symbols).";
        this._state.messageType = "err";
        this._updateDom();
        return;
      }

      this._state.loading = true;
      this._state.message = null;
      this._updateDom();

      try {
        const res = await fetch(`${this.apiBaseUrl}/api/v1/widget/configure`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.clientSessionToken}`,
          },
          body: JSON.stringify({ anti_phishing_code: rawCode }),
        });
        const data = await res.json();

        if (!res.ok) {
          this._state.message = data.message || "Failed to save security code.";
          this._state.messageType = "err";
        } else {
          this._state.isEnabled = true;
          this._state.maskedCode = data.masked_code;
          this._state.message = `Anti-Phishing Code [${data.masked_code}] encrypted & activated on ShieldCode Vault.`;
          this._state.messageType = "ok";
          this.dispatchEvent(
            new CustomEvent("shieldcode:configured", {
              detail: data,
              bubbles: true,
              composed: true,
            })
          );
        }
      } catch (_) {
        this._state.message = "Network error communicating with ShieldCode SaaS.";
        this._state.messageType = "err";
      } finally {
        this._state.loading = false;
        this._updateDom();
      }
    }

    _updateDom() {
      const badge = this._shadow.querySelector("#sc-status-badge");
      const btn = this._shadow.querySelector("#sc-save-btn");
      const msg = this._shadow.querySelector("#sc-feedback-msg");

      if (badge) {
        badge.className = `sc-badge ${
          this._state.isEnabled ? "sc-badge-active" : "sc-badge-inactive"
        }`;
        badge.innerHTML = `<span class="sc-dot"></span> ${
          this._state.isEnabled
            ? `Active (${this._state.maskedCode})`
            : "Unconfigured"
        }`;
      }

      if (btn) {
        btn.disabled = this._state.loading;
        btn.textContent = this._state.loading
          ? "Encrypting..."
          : "Save ShieldCode";
      }

      if (msg) {
        if (this._state.message) {
          msg.className = `sc-msg ${
            this._state.messageType === "ok" ? "sc-msg-ok" : "sc-msg-err"
          }`;
          msg.textContent = this._state.message;
        } else {
          msg.className = "sc-msg";
          msg.textContent = "";
        }
      }
    }

    _render() {
      this._shadow.innerHTML = `
        <style>${SHADOW_STYLES}</style>
        <div class="sc-card" part="card">
          <div class="sc-header">
            <div class="sc-brand">
              <div class="sc-icon">🛡️</div>
              <div>
                <h4 class="sc-title">Anti-Phishing Security Code</h4>
                <p class="sc-subtitle">Protected by ShieldCode Isolated Shadow-DOM Widget</p>
              </div>
            </div>
            <span id="sc-status-badge" class="sc-badge sc-badge-inactive">
              <span class="sc-dot"></span> Checking...
            </span>
          </div>

          <form id="sc-form" class="sc-form">
            <div class="sc-input-wrap">
              <input
                id="sc-code-input"
                class="sc-input"
                type="text"
                maxlength="20"
                placeholder="Enter 4-20 char code (e.g. Ayoub2026)"
                required
              />
              <span id="sc-char-counter" class="sc-counter">0/20</span>
            </div>
            <button id="sc-save-btn" type="submit" class="sc-btn">
              Save ShieldCode
            </button>
          </form>

          <div id="sc-feedback-msg" class="sc-msg"></div>

          <div class="sc-footer">
            <span>🔒 Direct TLS to ShieldCode Vault API (Zero Bank Backend Exposure)</span>
            <span>Shadow DOM Isolated</span>
          </div>
        </div>
      `;

      const form = this._shadow.querySelector("#sc-form");
      const input = this._shadow.querySelector("#sc-code-input");
      const counter = this._shadow.querySelector("#sc-char-counter");

      if (input && counter) {
        input.addEventListener("input", () => {
          counter.textContent = `${input.value.length}/20`;
        });
      }

      if (form) {
        form.addEventListener("submit", (e) => this._handleSave(e));
      }
    }
  }

  if (!window.customElements.get("shield-code-widget")) {
    window.customElements.define("shield-code-widget", ShieldCodeWidgetElement);
  }

  window.ShieldCode = {
    mount: function (target, options) {
      const container =
        typeof target === "string" ? document.querySelector(target) : target;
      if (!container) {
        throw new Error("ShieldCode.mount: target container not found");
      }
      const el = document.createElement("shield-code-widget");
      if (options && options.clientSessionToken) {
        el.setAttribute("client-session-token", options.clientSessionToken);
      }
      if (options && options.apiBaseUrl) {
        el.setAttribute("api-base-url", options.apiBaseUrl);
      }
      if (options && typeof options.onConfigured === "function") {
        el.addEventListener("shieldcode:configured", (ev) =>
          options.onConfigured(ev.detail)
        );
      }
      container.innerHTML = "";
      container.appendChild(el);
      return el;
    },
  };
})(window, document);
