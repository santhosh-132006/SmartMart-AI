/**
 * SmartMart AI – Copilot View Controller
 * Renders structured evidence cards: Answer, Evidence, Calculation, Recommendation, Assumption.
 */

import { api } from './api.js';

let activeStore = 'ALL';
let activePreset = 'last_30_days';

export function initCopilot(storeId = 'ALL', datePreset = 'last_30_days') {
  activeStore = storeId;
  activePreset = datePreset;

  const feed = document.getElementById('copilot-chat-feed');
  const form = document.getElementById('copilot-form');
  const textInput = document.getElementById('copilot-text-input');

  if (feed && feed.children.length === 0) {
    appendBotMessage({
      answer: "Hello! I am **SmartMart Copilot**, your evidence-based supermarket sales & inventory assistant. Ask me anything about stockout risks, arrivals, sales spikes, branch performance, or reorders.",
      evidence: { "systemStatus": "Online & Ready", "guarantee": "No claim without numbers. No recommendation without evidence." },
      calculation: "Real-time calculation engine active across Karur, Tiruppur, and Coimbatore ledgers.",
      recommendation: "Select a sample question chip above or type your question below.",
      assumption: "Analysis anchored on 200+ unique supermarket SKUs."
    });
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const q = textInput.value.trim();
      if (!q) return;
      textInput.value = '';
      await sendCopilotQuery(q);
    };
  }

  // Handle preset chips
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.onclick = async () => {
      const q = chip.getAttribute('data-query');
      if (q) await sendCopilotQuery(q);
    };
  });
}

export async function sendCopilotQuery(query) {
  appendUserMessage(query);
  showTypingIndicator();

  try {
    const res = await api.queryCopilot(query, activeStore, activePreset);
    hideTypingIndicator();
    appendBotMessage(res);
  } catch (err) {
    hideTypingIndicator();
    appendBotMessage({
      answer: "There is not enough data available to answer this question at the moment.",
      evidence: { error: err.message },
      calculation: "N/A",
      recommendation: "Please retry your query or inspect the Dashboard views.",
      assumption: "Server connection active."
    });
  }
}

function appendUserMessage(text) {
  const feed = document.getElementById('copilot-chat-feed');
  if (!feed) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message user-msg';
  msgDiv.innerHTML = `
    <div class="msg-bubble user-bubble">
      <div class="msg-author">Supermarket Manager</div>
      <div class="msg-text">${escapeHtml(text)}</div>
    </div>
  `;
  feed.appendChild(msgDiv);
  feed.scrollTop = feed.scrollHeight;
}

function appendBotMessage(data) {
  const feed = document.getElementById('copilot-chat-feed');
  if (!feed) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message bot-msg';

  let evidenceHtml = '';
  if (data.evidence && typeof data.evidence === 'object') {
    evidenceHtml = '<div class="evidence-grid">';
    for (const [k, v] of Object.entries(data.evidence)) {
      evidenceHtml += `<div class="evidence-item"><span class="ev-key">${formatKey(k)}:</span> <span class="ev-val">${escapeHtml(String(v))}</span></div>`;
    }
    evidenceHtml += '</div>';
  }

  msgDiv.innerHTML = `
    <div class="msg-bubble bot-bubble">
      <div class="copilot-card-header">
        <span class="copilot-badge">✨ SmartMart Evidence Copilot</span>
      </div>

      <div class="copilot-section">
        <div class="sec-label">📌 ANSWER</div>
        <div class="sec-content font-semibold">${escapeHtml(data.answer || '')}</div>
      </div>

      ${evidenceHtml ? `
      <div class="copilot-section">
        <div class="sec-label">📊 EVIDENCE & DATA</div>
        <div class="sec-content">${evidenceHtml}</div>
      </div>` : ''}

      ${data.calculation ? `
      <div class="copilot-section">
        <div class="sec-label">🧮 CALCULATION BREAKDOWN</div>
        <div class="sec-content code-block"><code>${escapeHtml(data.calculation)}</code></div>
      </div>` : ''}

      ${data.recommendation ? `
      <div class="copilot-section">
        <div class="sec-label">💡 RECOMMENDATION</div>
        <div class="sec-content rec-text">${escapeHtml(data.recommendation)}</div>
      </div>` : ''}

      ${data.assumption ? `
      <div class="copilot-section">
        <div class="sec-label">⚙️ ASSUMPTION</div>
        <div class="sec-content text-xs text-muted">${escapeHtml(data.assumption)}</div>
      </div>` : ''}
    </div>
  `;

  feed.appendChild(msgDiv);
  feed.scrollTop = feed.scrollHeight;
}

function showTypingIndicator() {
  const feed = document.getElementById('copilot-chat-feed');
  if (!feed) return;
  const t = document.createElement('div');
  t.id = 'copilot-typing';
  t.className = 'chat-message bot-msg';
  t.innerHTML = `<div class="msg-bubble bot-bubble"><span class="typing-dots">Calculating evidence...</span></div>`;
  feed.appendChild(t);
  feed.scrollTop = feed.scrollHeight;
}

function hideTypingIndicator() {
  const t = document.getElementById('copilot-typing');
  if (t) t.remove();
}

function formatKey(k) {
  return k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
