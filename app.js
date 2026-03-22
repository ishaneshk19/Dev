/**
 * ByteLab — vanilla JS wiring for DOM, encoding, JSON, and Web Crypto.
 * Read from top: helpers → tab UI → one small handler per tool.
 */

const $ = (id) => document.getElementById(id);

const toastEl = $("toast");
let toastTimer;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied");
  } catch {
    showToast("Copy failed — select and copy manually");
  }
}

function setStatus(el, text, kind) {
  el.textContent = text;
  el.classList.remove("ok", "err");
  if (kind) el.classList.add(kind);
}

/* ---------- Tabs ---------- */
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.panel;
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("is-active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("is-visible"));
    btn.classList.add("is-active");
    const panel = document.getElementById(`panel-${id}`);
    if (panel) panel.classList.add("is-visible");
  });
});

/* ---------- JSON ---------- */
const jsonIn = $("json-input");
const jsonOut = $("json-output");
const jsonStatus = $("json-status");

$("json-format").addEventListener("click", () => {
  try {
    const obj = JSON.parse(jsonIn.value);
    jsonOut.value = JSON.stringify(obj, null, 2);
    setStatus(jsonStatus, "Valid JSON — formatted.", "ok");
  } catch (e) {
    jsonOut.value = "";
    setStatus(jsonStatus, String(e.message), "err");
  }
});

$("json-minify").addEventListener("click", () => {
  try {
    const obj = JSON.parse(jsonIn.value);
    jsonOut.value = JSON.stringify(obj);
    setStatus(jsonStatus, "Valid JSON — minified.", "ok");
  } catch (e) {
    jsonOut.value = "";
    setStatus(jsonStatus, String(e.message), "err");
  }
});

$("json-copy-out").addEventListener("click", () => copyText(jsonOut.value));

/* ---------- Base64 (UTF-8 safe) ---------- */
const b64In = $("b64-input");
const b64Out = $("b64-output");
const b64Status = $("b64-status");

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

$("b64-encode").addEventListener("click", () => {
  try {
    b64Out.value = utf8ToBase64(b64In.value);
    setStatus(b64Status, "Encoded.", "ok");
  } catch (e) {
    b64Out.value = "";
    setStatus(b64Status, String(e.message), "err");
  }
});

$("b64-decode").addEventListener("click", () => {
  try {
    const raw = b64In.value.replace(/\s/g, "");
    b64Out.value = base64ToUtf8(raw);
    setStatus(b64Status, "Decoded.", "ok");
  } catch (e) {
    b64Out.value = "";
    setStatus(b64Status, "Invalid Base64 or encoding.", "err");
  }
});

$("b64-copy").addEventListener("click", () => copyText(b64Out.value));

/* ---------- URL ---------- */
const urlIn = $("url-input");
const urlOut = $("url-output");
const urlStatus = $("url-status");

$("url-encode").addEventListener("click", () => {
  try {
    urlOut.value = encodeURIComponent(urlIn.value);
    setStatus(urlStatus, "Encoded.", "ok");
  } catch (e) {
    urlOut.value = "";
    setStatus(urlStatus, String(e.message), "err");
  }
});

$("url-decode").addEventListener("click", () => {
  try {
    urlOut.value = decodeURIComponent(urlIn.value);
    setStatus(urlStatus, "Decoded.", "ok");
  } catch (e) {
    urlOut.value = "";
    setStatus(urlStatus, "Invalid percent-encoding.", "err");
  }
});

$("url-copy").addEventListener("click", () => copyText(urlOut.value));

/* ---------- SHA-256 ---------- */
const hashIn = $("hash-input");
const hashOut = $("hash-output");
const hashStatus = $("hash-status");

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(buf);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

$("hash-run").addEventListener("click", async () => {
  if (!window.crypto || !crypto.subtle) {
    setStatus(
      hashStatus,
      "Web Crypto not available. Use https:// or localhost.",
      "err"
    );
    hashOut.textContent = "";
    return;
  }
  try {
    hashOut.textContent = await sha256Hex(hashIn.value);
    setStatus(hashStatus, "SHA-256 (hex, lowercase).", "ok");
  } catch (e) {
    hashOut.textContent = "";
    setStatus(hashStatus, String(e.message), "err");
  }
});

$("hash-copy").addEventListener("click", () => copyText(hashOut.textContent.trim()));

/* ---------- UUID ---------- */
const uuidOut = $("uuid-output");
const uuidStatus = $("uuid-status");

$("uuid-gen").addEventListener("click", () => {
  if (!crypto.randomUUID) {
    setStatus(uuidStatus, "randomUUID() not supported in this browser.", "err");
    uuidOut.textContent = "";
    return;
  }
  uuidOut.textContent = crypto.randomUUID();
  setStatus(uuidStatus, "RFC 4122 random UUID (v4).", "ok");
});

$("uuid-copy").addEventListener("click", () => copyText(uuidOut.textContent.trim()));
