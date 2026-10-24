/**
 * Decart.ai Lucy VTON 3.5 Realtime WebRTC Client
 */

// Dynamic SDK references (loaded with CDN fallback)
let createDecartClient = null;
let models = null;

// Application State
const state = {
  client: null,
  realtimeClient: null,
  localStream: null,
  remoteStream: null,
  model: null,
  isConnected: false,
  isConnecting: false,
  isSdkLoaded: false,
  isMuted: true,
  isMirrored: true,
  layoutMode: "pip", // "pip" or "side-by-side"
  fastMode: true,
  mirrorMode: "auto",
  selectedCameraId: "",
  activePreset: null,
  presets: [],
  sessionTimerId: null,
  sessionSeconds: 0,
  customGarmentDataUrl: null,
  serverApiKey: "",
  modelName: "lucy-vton-3.6",
};

// DOM Elements
const elements = {
  videoOutput: document.getElementById("video-output"),
  videoLocal: document.getElementById("video-local"),
  stageViewport: document.getElementById("stage-viewport"),
  stagePlaceholder: document.getElementById("stage-placeholder"),
  btnToggleStream: document.getElementById("btn-toggle-stream"),
  btnPlaceholderStart: document.getElementById("btn-placeholder-start"),
  btnStreamLabel: document.getElementById("btn-stream-label"),
  statusDot: document.getElementById("status-dot"),
  statusText: document.getElementById("status-text"),
  telemetrySpeed: document.getElementById("telemetry-speed"),
  telemetryTimer: document.getElementById("telemetry-timer"),
  telemetryIce: document.getElementById("telemetry-ice"),
  activeOutfitPill: document.getElementById("active-outfit-pill"),
  activeOutfitThumb: document.getElementById("active-outfit-thumb"),
  activeOutfitTitle: document.getElementById("active-outfit-title"),
  presetsGrid: document.getElementById("presets-grid"),
  uploadDropzone: document.getElementById("upload-dropzone"),
  fileInput: document.getElementById("file-input"),
  customPreviewWrap: document.getElementById("custom-preview-wrap"),
  customPreviewImg: document.getElementById("custom-preview-img"),
  btnRemovePreview: document.getElementById("btn-remove-preview"),
  customPrompt: document.getElementById("custom-prompt"),
  btnApplyCustom: document.getElementById("btn-apply-custom"),
  btnSnapshot: document.getElementById("btn-snapshot"),
  btnToggleLayout: document.getElementById("btn-toggle-layout"),
  btnToggleMirror: document.getElementById("btn-toggle-mirror"),
  btnToggleAudio: document.getElementById("btn-toggle-audio"),
  btnToggleFullscreen: document.getElementById("btn-toggle-fullscreen"),
  btnOpenSettings: document.getElementById("btn-open-settings"),
  btnCloseSettings: document.getElementById("btn-close-settings"),
  btnCancelSettings: document.getElementById("btn-cancel-settings"),
  btnSaveSettings: document.getElementById("btn-save-settings"),
  modalSettings: document.getElementById("modal-settings"),
  inputApiKey: document.getElementById("input-api-key"),
  serverKeyStatus: document.getElementById("server-key-status"),
  toggleFastMode: document.getElementById("toggle-fast-mode"),
  selectCamera: document.getElementById("select-camera"),
  selectMirror: document.getElementById("select-mirror"),
  btnToggleLogs: document.getElementById("btn-toggle-logs"),
  btnCloseLogs: document.getElementById("btn-close-logs"),
  btnClearLogs: document.getElementById("btn-clear-logs"),
  drawerLogs: document.getElementById("drawer-logs"),
  logBody: document.getElementById("log-body"),
  toastContainer: document.getElementById("toast-container"),
  snapshotCanvas: document.getElementById("snapshot-canvas"),
};

// Logging & Diagnostics
function addLog(message, type = "info") {
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-${type}">${escapeHtml(message)}</span>`;
  if (elements.logBody) {
    elements.logBody.appendChild(entry);
    elements.logBody.scrollTop = elements.logBody.scrollHeight;
  }
  console.log(`[VTON:${type.toUpperCase()}]`, message);
}

function showToast(message, type = "info") {
  if (!elements.toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

// Update UI Status
function setConnectionStatus(status, text) {
  if (elements.statusDot) elements.statusDot.className = `status-dot ${status}`;
  if (elements.statusText) elements.statusText.textContent = text.toLowerCase();

  if (status === "live") {
    if (elements.btnStreamLabel) elements.btnStreamLabel.textContent = "Disconnect";
    if (elements.btnToggleStream) elements.btnToggleStream.classList.add("connected");
    if (elements.stagePlaceholder) elements.stagePlaceholder.classList.add("hidden");
    if (elements.telemetryIce) elements.telemetryIce.textContent = "connected";
  } else if (status === "connecting") {
    if (elements.btnStreamLabel) elements.btnStreamLabel.textContent = "Connecting...";
    if (elements.btnToggleStream) elements.btnToggleStream.classList.remove("connected");
    if (elements.telemetryIce) elements.telemetryIce.textContent = "checking";
  } else {
    if (elements.btnStreamLabel) elements.btnStreamLabel.textContent = "Start Try-On";
    if (elements.btnToggleStream) elements.btnToggleStream.classList.remove("connected");
    if (elements.stagePlaceholder) elements.stagePlaceholder.classList.remove("hidden");
    if (elements.telemetryIce) elements.telemetryIce.textContent = "idle";
  }
}

// Session Timer
function startSessionTimer() {
  stopSessionTimer();
  state.sessionSeconds = 0;
  if (elements.telemetryTimer) elements.telemetryTimer.textContent = "00:00";
  state.sessionTimerId = setInterval(() => {
    state.sessionSeconds++;
    const m = String(Math.floor(state.sessionSeconds / 60)).padStart(2, "0");
    const s = String(state.sessionSeconds % 60).padStart(2, "0");
    if (elements.telemetryTimer) elements.telemetryTimer.textContent = `${m}:${s}`;
  }, 1000);
}

function stopSessionTimer() {
  if (state.sessionTimerId) {
    clearInterval(state.sessionTimerId);
    state.sessionTimerId = null;
  }
}

// Dynamic SDK Loader with fallback CDNs
async function loadDecartSDK() {
  if (createDecartClient && models) {
    state.isSdkLoaded = true;
    return;
  }

  addLog("Loading Decart AI SDK from CDN...", "info");
  const cdnList = [
    "https://esm.sh/@decartai/sdk",
    "https://cdn.jsdelivr.net/npm/@decartai/sdk/+esm",
    "https://unpkg.com/@decartai/sdk?module"
  ];

  let lastError = null;
  for (const cdn of cdnList) {
    try {
      addLog(`Connecting to SDK CDN: ${cdn}`, "info");
      const sdk = await import(cdn);
      if (sdk && sdk.createDecartClient) {
        createDecartClient = sdk.createDecartClient;
        models = sdk.models;
        state.isSdkLoaded = true;
        addLog(`Decart SDK successfully loaded from ${cdn}`, "success");
        initModel();
        return;
      }
    } catch (e) {
      lastError = e;
      addLog(`CDN ${cdn} unavailable (${e.message}), trying next mirror...`, "warn");
    }
  }

  throw new Error(`Failed to load @decartai/sdk from all CDNs: ${lastError ? lastError.message : 'Unknown'}`);
}

// Initialize Model
function initModel() {
  const modelId = state.modelName || "lucy-vton-3.6";
  try {
    if (models && typeof models.realtime === "function") {
      state.model = models.realtime(modelId);
      const fpsVal = typeof state.model.fps === "object" ? (state.model.fps?.ideal || 30) : (state.model.fps || 30);
      const widthVal = typeof state.model.width === "object" ? (state.model.width?.ideal || 1280) : (state.model.width || 1280);
      const heightVal = typeof state.model.height === "object" ? (state.model.height?.ideal || 720) : (state.model.height || 720);
      addLog(`Model initialized: ${modelId} (${widthVal}x${heightVal} @ ${fpsVal}fps)`, "success");
    } else {
      state.model = { fps: 30, width: 1280, height: 720 };
      addLog(`Model fallback initialized: ${modelId} (1280x720 @ 30fps)`, "info");
    }
  } catch (err) {
    addLog(`Model init fallback: ${err.message}`, "warn");
    state.model = { fps: 30, width: 1280, height: 720 };
  }
}

// Check Backend Config
async function checkServerConfig() {
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const data = await res.json();
      if (data.model) {
        state.modelName = data.model;
      }
      if (data.hasServerApiKey) {
        state.serverApiKey = data.apiKey || "";
        if (elements.serverKeyStatus) {
          elements.serverKeyStatus.textContent = "Active on Server (.env)";
          elements.serverKeyStatus.style.color = "var(--accent-emerald)";
        }
        if (elements.inputApiKey) {
          elements.inputApiKey.value = state.serverApiKey;
        }
        addLog(`Decart API Key detected on backend server (${state.serverApiKey.slice(0, 10)}...).`, "success");
      } else {
        if (elements.serverKeyStatus) {
          elements.serverKeyStatus.textContent = "Not set on server (UI key will be used)";
          elements.serverKeyStatus.style.color = "var(--accent-amber)";
        }
        addLog("No server API key found. You can enter your API key in Settings.", "warn");
      }
      if (data.defaultSpeed) {
        state.fastMode = data.defaultSpeed === "fast";
        if (elements.toggleFastMode) elements.toggleFastMode.checked = state.fastMode;
        if (elements.telemetrySpeed) elements.telemetrySpeed.textContent = state.fastMode ? "Fast Mode (2x)" : "Standard";
      }
    }
  } catch (e) {
    if (elements.serverKeyStatus) {
      elements.serverKeyStatus.textContent = "Server unreachable";
      elements.serverKeyStatus.style.color = "var(--accent-rose)";
    }
    addLog("Could not reach /api/config.", "warn");
  }
}

// Enumerate Camera Devices
async function loadCameraDevices() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === "videoinput");
    if (elements.selectCamera) {
      elements.selectCamera.innerHTML = '<option value="">Default Front Camera</option>';
      videoDevices.forEach((device, idx) => {
        const opt = document.createElement("option");
        opt.value = device.deviceId;
        opt.textContent = device.label || `Camera ${idx + 1}`;
        elements.selectCamera.appendChild(opt);
      });
    }
    addLog(`Detected ${videoDevices.length} camera device(s).`, "info");
  } catch (e) {
    console.warn("Camera enumeration error:", e);
  }
}

// Acquire Local Camera Stream
async function getCameraStream() {
  addLog("Requesting laptop webcam access...", "info");
  
  const videoConstraints = {
    frameRate: state.model && state.model.fps ? state.model.fps : 30,
    width: state.model && state.model.width ? state.model.width : 1280,
    height: state.model && state.model.height ? state.model.height : 720,
  };

  if (state.selectedCameraId) {
    videoConstraints.deviceId = { exact: state.selectedCameraId };
  }

  const audioConstraints = !state.isMuted;

  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
      video: videoConstraints,
    });
  } catch (constraintErr) {
    addLog(`Exact constraints not supported (${constraintErr.name}), retrying with ideal constraints...`, "warn");
    stream = await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
      video: {
        deviceId: state.selectedCameraId ? { ideal: state.selectedCameraId } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
    });
  }

  state.localStream = stream;
  if (elements.videoLocal) {
    elements.videoLocal.srcObject = stream;
    elements.videoLocal.play().catch(() => {});
  }
  
  const videoTrack = stream.getVideoTracks()[0];
  const settings = videoTrack && videoTrack.getSettings ? videoTrack.getSettings() : {};
  addLog(`Webcam active: ${settings.width || 'auto'}x${settings.height || 'auto'} @ ${Math.round(settings.frameRate || 30)}fps`, "success");

  loadCameraDevices();
  return stream;
}

// Mint client token directly via Decart API (browser fallback if backend cannot connect)
async function fetchClientTokenDirect(apiKey) {
  const modelId = state.modelName || "lucy-vton-3.6";
  try {
    addLog(`Requesting client token for ${modelId} from https://api.decart.ai/v1/client/tokens...`, "info");
    const res = await fetch("https://api.decart.ai/v1/client/tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        expiresIn: 3600,
        allowedModels: [modelId]
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.apiKey) {
        addLog("Minted Decart JWT client token successfully!", "success");
        return data.apiKey;
      }
    } else {
      const errText = await res.text();
      addLog(`Decart token API error (${res.status}): ${errText}`, "error");
    }
  } catch (e) {
    addLog(`Direct token fetch failed: ${e.message}`, "warn");
  }
  return null;
}

// Resolve active API key
async function resolveApiKey() {
  // Clear known dummy keys
  const stored = localStorage.getItem("decart_custom_key");
  if (stored && (stored === "111111" || (!stored.startsWith("dct_") && !stored.startsWith("ey")))) {
    localStorage.removeItem("decart_custom_key");
  }

  // Priority 1: Verified backend server key from .env
  let rawKey = "";
  if (state.serverApiKey && state.serverApiKey.startsWith("dct_")) {
    rawKey = state.serverApiKey.trim();
  }

  // Priority 2: Custom UI input if valid key provided
  const inputVal = elements.inputApiKey ? elements.inputApiKey.value.trim() : "";
  if (inputVal && (inputVal.startsWith("dct_") || inputVal.startsWith("ey"))) {
    rawKey = inputVal;
  }

  // Update input field display with active key
  if (elements.inputApiKey && rawKey) {
    elements.inputApiKey.value = rawKey;
  }

  // If already a signed JWT token, use directly
  if (rawKey && rawKey.startsWith("ey")) {
    return rawKey;
  }

  // 1. First try our local backend endpoint
  try {
    const res = await fetch("/api/realtime-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: rawKey })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.apiKey && data.apiKey.startsWith("ey")) {
        addLog("Received client token from local server.", "success");
        return data.apiKey;
      }
    }
  } catch (err) {
    console.warn("Backend /api/realtime-token error:", err);
  }

  // 2. Direct browser minting via Decart API
  if (rawKey) {
    const mintedToken = await fetchClientTokenDirect(rawKey);
    if (mintedToken) {
      return mintedToken;
    }
    return rawKey;
  }

  throw new Error("Missing Decart API key. Please configure DECART_API_KEY.");
}

// Decart Client Factory
async function initDecartClient() {
  await loadDecartSDK();

  const clientToken = await resolveApiKey();
  
  addLog(`Configuring Decart client with token (${clientToken.slice(0, 15)}...)...`, "info");

  state.client = createDecartClient({
    apiKey: clientToken,
    apiKeyProvider: async () => {
      addLog("Refreshing Decart client token...", "info");
      return await resolveApiKey();
    }
  });

  addLog("Decart client initialized successfully.", "success");
}

// Connect to Decart Realtime WebRTC Stream
async function connectStream() {
  if (state.isConnected || state.isConnecting) return;
  state.isConnecting = true;
  setConnectionStatus("connecting", "Connecting WebRTC...");

  try {
    // 1. Ensure Decart SDK is loaded
    await loadDecartSDK();

    // 2. Get webcam media stream
    const stream = await getCameraStream();

    // 3. Initialize Decart client
    if (!state.client) {
      await initDecartClient();
    }

    // 4. Connect real-time session
    const activeModelName = state.modelName || "lucy-vton-3.6";
    addLog(`Initiating WebRTC connection with model '${activeModelName}' (speed: ${state.fastMode ? 'fast' : 'standard'})...`, "info");
    
    const connectOptions = {
      model: state.model,
      mirror: state.mirrorMode,
      onRemoteStream: (transformedStream) => {
        addLog(`Transformed remote WebRTC stream received from Decart Lucy (${activeModelName})!`, "success");
        state.remoteStream = transformedStream;
        if (elements.videoOutput) {
          elements.videoOutput.srcObject = transformedStream;
          elements.videoOutput.play().catch(e => console.warn("Autoplay err:", e));
        }
        setConnectionStatus("live", `Live (${activeModelName})`);
        showToast(`Connected to ${activeModelName} live stream!`, "success");
      }
    };

    if (state.fastMode) {
      connectOptions.speed = "fast";
    }

    const realtimeClient = await state.client.realtime.connect(stream, connectOptions);
    state.realtimeClient = realtimeClient;
    state.isConnected = true;
    state.isConnecting = false;
    startSessionTimer();

    // 5. Apply initial garment
    if (state.activePreset) {
      applyPreset(state.activePreset);
    } else if (state.presets.length > 0) {
      applyPreset(state.presets[0]);
    }

  } catch (err) {
    state.isConnecting = false;
    state.isConnected = false;
    setConnectionStatus("error", "Connection Failed");
    stopSessionTimer();
    addLog(`WebRTC Connect Failed: ${err.message}`, "error");
    showToast(`Failed to connect: ${err.message}`, "error");
    
    if (state.localStream) {
      state.localStream.getTracks().forEach(t => t.stop());
      state.localStream = null;
    }
  }
}

// Disconnect Session
function disconnectStream() {
  if (state.realtimeClient) {
    try {
      addLog("Disconnecting Decart WebRTC session...", "info");
      state.realtimeClient.disconnect();
    } catch (e) {
      console.warn("Disconnect error:", e);
    }
    state.realtimeClient = null;
  }

  if (state.localStream) {
    state.localStream.getTracks().forEach(t => t.stop());
    state.localStream = null;
    if (elements.videoLocal) elements.videoLocal.srcObject = null;
  }

  if (elements.videoOutput && elements.videoOutput.srcObject) {
    elements.videoOutput.srcObject = null;
  }

  state.isConnected = false;
  state.isConnecting = false;
  stopSessionTimer();
  setConnectionStatus("idle", "Disconnected");
  addLog("Session closed cleanly.", "info");
  showToast("Stream disconnected.", "info");
}

// Apply Garment (set() replaces full state atomically)
async function applyGarment(prompt, image, label, thumbUrl) {
  if (!state.realtimeClient || !state.isConnected) {
    showToast("Please connect the live stream first!", "warn");
    addLog("Cannot apply garment: stream is not connected.", "warn");
    return;
  }

  try {
    addLog(`Updating outfit: "${prompt.slice(0, 40)}..."`, "info");
    
    // Atomically replace full state
    await state.realtimeClient.set({
      prompt: prompt,
      image: image,
    });

    if (elements.activeOutfitTitle) elements.activeOutfitTitle.textContent = (label || prompt).toLowerCase();
    if (elements.activeOutfitThumb && thumbUrl) {
      elements.activeOutfitThumb.src = thumbUrl;
    }
    if (elements.activeOutfitPill) elements.activeOutfitPill.style.display = "flex";

    addLog(`Successfully applied outfit: "${label || prompt}"`, "success");
    showToast(`Wearing: ${label || 'Custom Garment'}`, "success");

  } catch (err) {
    addLog(`Failed to apply garment: ${err.message}`, "error");
    showToast(`Failed to update garment: ${err.message}`, "error");
  }
}

// Apply Preset
async function applyPreset(preset) {
  state.activePreset = preset;
  
  document.querySelectorAll(".preset-card").forEach(c => {
    c.classList.toggle("active", c.dataset.id === preset.id);
  });

  const garmentImage = preset.dataUrl || preset.imageUrl;
  
  if (state.isConnected && state.realtimeClient) {
    await applyGarment(preset.prompt, garmentImage, preset.name, preset.imageUrl);
  } else {
    if (elements.activeOutfitTitle) elements.activeOutfitTitle.textContent = preset.name.toLowerCase();
    if (elements.activeOutfitThumb) elements.activeOutfitThumb.src = preset.imageUrl;
    if (elements.customPrompt) elements.customPrompt.value = preset.prompt;
    addLog(`Selected preset: ${preset.name}. Click "Start Try-On" to wear.`, "info");
  }
}

// Render Presets
function renderPresets(presets) {
  if (!elements.presetsGrid) return;
  elements.presetsGrid.innerHTML = "";
  presets.forEach((preset, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `preset-card ${index === 0 ? 'active' : ''}`;
    card.dataset.id = preset.id;
    card.dataset.name = preset.name.toLowerCase();
    card.setAttribute("title", preset.name.toLowerCase());
    card.setAttribute("aria-label", preset.name.toLowerCase());
    card.innerHTML = `
      <div class="preset-asset-frame">
        <img src="${preset.imageUrl}" class="preset-asset-img" alt="${escapeHtml(preset.name)}" loading="lazy">
      </div>
    `;

    card.addEventListener("click", () => applyPreset(preset));
    elements.presetsGrid.appendChild(card);
  });

  if (presets.length > 0) {
    state.activePreset = presets[0];
    if (elements.activeOutfitTitle) elements.activeOutfitTitle.textContent = state.activePreset.name.toLowerCase();
    if (elements.activeOutfitThumb) elements.activeOutfitThumb.src = state.activePreset.imageUrl;
    if (elements.customPrompt) elements.customPrompt.value = state.activePreset.prompt;
  }
}

// Populate Presets Grid
async function loadPresets() {
  // Built-in presets with 3D dress assets
  state.presets = [
    {
      id: "red-silk",
      name: "Crimson Silk Gown",
      prompt: "Wearing an elegant luxury crimson red silk evening gown with dramatic drapes",
      filename: "red-silk-dress.jpg",
      imageUrl: "/garments/red-silk-dress.jpg",
      category: "Dresses"
    },
    {
      id: "emerald",
      name: "Emerald Velvet Dress",
      prompt: "Wearing a luxury emerald green velvet cocktail dress with delicate gold buckle",
      filename: "emerald-dress.jpg",
      imageUrl: "/garments/emerald-dress.jpg",
      category: "Dresses"
    },
    {
      id: "black-slip",
      name: "Black Satin Slip Dress",
      prompt: "Wearing an elegant luxury black satin slip dress with spaghetti straps",
      filename: "black-slip-dress.jpg",
      imageUrl: "/garments/black-slip-dress.jpg",
      category: "Dresses"
    },
    {
      id: "floral-dress",
      name: "White Floral Sundress",
      prompt: "Wearing a white floral printed summer sundress with delicate ruffles and flowers",
      filename: "floral-sundress.jpg",
      imageUrl: "/garments/floral-sundress.jpg",
      category: "Dresses"
    },
    {
      id: "leather-biker",
      name: "Black Leather Biker",
      prompt: "Wearing a tailored luxury black moto leather jacket with metallic zippers",
      filename: "leather-biker.jpg",
      imageUrl: "/garments/leather-biker.jpg",
      category: "Jackets"
    }
  ];

  renderPresets(state.presets);

  // Fetch full preset JSON with embedded data URLs
  try {
    const res = await fetch("/garments/presets.json");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        state.presets = data;
        renderPresets(state.presets);
      }
    }
  } catch (e) {
    console.warn("Using default preset definitions:", e);
  }
}

// Handle Custom Garment Upload
function setupUploader() {
  const dropzone = elements.uploadDropzone;
  const fileInput = elements.fileInput;
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  if (elements.btnRemovePreview) {
    elements.btnRemovePreview.addEventListener("click", () => {
      state.customGarmentDataUrl = null;
      if (elements.customPreviewWrap) elements.customPreviewWrap.style.display = "none";
      if (elements.uploadDropzone) elements.uploadDropzone.style.display = "block";
      fileInput.value = "";
    });
  }
}

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    showToast("Please upload an image file (PNG, JPG, WebP)", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    state.customGarmentDataUrl = e.target.result;
    if (elements.customPreviewImg) elements.customPreviewImg.src = e.target.result;
    if (elements.customPreviewWrap) elements.customPreviewWrap.style.display = "block";
    if (elements.uploadDropzone) elements.uploadDropzone.style.display = "none";
    addLog(`Loaded custom garment image: ${file.name} (${Math.round(file.size / 1024)} KB)`, "info");
    showToast(`Loaded ${file.name}`, "info");
  };
  reader.readAsDataURL(file);
}

// Snapshot Photo Capture
function captureSnapshot() {
  const video = elements.videoOutput;
  if (!video || !video.videoWidth) {
    showToast("No active transformed stream to capture!", "warn");
    return;
  }

  const canvas = elements.snapshotCanvas;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.fillText("Decart Lucy VTON 3.5", 30, canvas.height - 30);

  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  a.href = dataUrl;
  a.download = `vton-lucy-${timestamp}.png`;
  a.click();

  addLog("Snapshot captured and downloaded.", "success");
  showToast("Snapshot saved to your downloads!", "success");
}

// Event Listeners Setup
function setupEventListeners() {
  console.log("[VTON] Wiring up event listeners...");

  // Toggle Stream Button
  const toggleHandler = () => {
    if (state.isConnected) {
      disconnectStream();
    } else {
      connectStream();
    }
  };
  if (elements.btnToggleStream) elements.btnToggleStream.addEventListener("click", toggleHandler);
  if (elements.btnPlaceholderStart) elements.btnPlaceholderStart.addEventListener("click", toggleHandler);

  // Upload panel toggle
  const uploadPanel = document.getElementById('upload-panel');
  const btnOpenUpload = document.getElementById('btn-open-upload');
  const btnCloseUpload = document.getElementById('btn-close-upload');
  if (btnOpenUpload && uploadPanel) {
    btnOpenUpload.addEventListener('click', () => uploadPanel.classList.toggle('open'));
  }
  if (btnCloseUpload && uploadPanel) {
    btnCloseUpload.addEventListener('click', () => uploadPanel.classList.remove('open'));
  }

  // Snapshot
  if (elements.btnSnapshot) elements.btnSnapshot.addEventListener("click", captureSnapshot);

  // Layout mode (PiP vs Side-by-Side)
  if (elements.btnToggleLayout) {
    elements.btnToggleLayout.addEventListener("click", () => {
      state.layoutMode = state.layoutMode === "pip" ? "side-by-side" : "pip";
      if (elements.stageViewport) elements.stageViewport.classList.toggle("side-by-side", state.layoutMode === "side-by-side");
      elements.btnToggleLayout.classList.toggle("active", state.layoutMode === "side-by-side");
      addLog(`Layout set to: ${state.layoutMode}`, "info");
    });
  }

  // Camera Mirroring
  if (elements.btnToggleMirror) {
    elements.btnToggleMirror.addEventListener("click", () => {
      state.isMirrored = !state.isMirrored;
      if (elements.videoLocal) elements.videoLocal.style.transform = state.isMirrored ? "scaleX(-1)" : "none";
      elements.btnToggleMirror.classList.toggle("active", state.isMirrored);
    });
  }

  // Audio Toggle
  if (elements.btnToggleAudio) {
    elements.btnToggleAudio.addEventListener("click", () => {
      state.isMuted = !state.isMuted;
      if (state.localStream) {
        state.localStream.getAudioTracks().forEach(t => { t.enabled = !state.isMuted; });
      }
      elements.btnToggleAudio.classList.toggle("active", !state.isMuted);
      showToast(state.isMuted ? "Microphone Muted" : "Microphone Active", "info");
    });
  }

  // Fullscreen Toggle
  if (elements.btnToggleFullscreen) {
    elements.btnToggleFullscreen.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        if (elements.stageViewport) elements.stageViewport.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Prompt modifier chips
  document.querySelectorAll(".chip-btn[data-add]").forEach(chip => {
    chip.addEventListener("click", () => {
      const addition = chip.getAttribute("data-add");
      let current = elements.customPrompt ? elements.customPrompt.value.trim() : "";
      if (current && !current.endsWith(",")) current += ",";
      if (elements.customPrompt) elements.customPrompt.value = `${current} ${addition}`.trim();
    });
  });

  // Apply Custom Garment Button
  if (elements.btnApplyCustom) {
    elements.btnApplyCustom.addEventListener("click", async () => {
      const prompt = elements.customPrompt ? elements.customPrompt.value.trim() : "";
      if (!prompt) {
        showToast("Please enter a garment prompt description", "warn");
        return;
      }

      const image = state.customGarmentDataUrl || (state.activePreset ? state.activePreset.dataUrl : "");
      if (!image) {
        showToast("Please upload a garment image or select a preset", "warn");
        return;
      }

      await applyGarment(prompt, image, "Custom Garment", state.customGarmentDataUrl);
    });
  }

  // Settings Modal Controls
  if (elements.btnOpenSettings && elements.modalSettings) {
    elements.btnOpenSettings.addEventListener("click", () => {
      elements.modalSettings.classList.add("open");
    });
  }

  const closeSettings = () => {
    if (elements.modalSettings) elements.modalSettings.classList.remove("open");
  };
  if (elements.btnCloseSettings) elements.btnCloseSettings.addEventListener("click", closeSettings);
  if (elements.btnCancelSettings) elements.btnCancelSettings.addEventListener("click", closeSettings);

  if (elements.btnSaveSettings) {
    elements.btnSaveSettings.addEventListener("click", async () => {
      const key = elements.inputApiKey ? elements.inputApiKey.value.trim() : "";
      if (key) {
        localStorage.setItem("decart_custom_key", key);
        addLog("Custom API key saved for session.", "info");
      }
      if (elements.toggleFastMode) state.fastMode = elements.toggleFastMode.checked;
      if (elements.selectCamera) state.selectedCameraId = elements.selectCamera.value;
      if (elements.selectMirror) state.mirrorMode = elements.selectMirror.value;
      if (elements.telemetrySpeed) elements.telemetrySpeed.textContent = state.fastMode ? "Fast Mode (2x)" : "Standard";

      state.client = null;
      try {
        await initDecartClient();
      } catch (err) {
        addLog("Decart client: " + err.message, "info");
      }

      closeSettings();
      showToast("Settings updated!", "success");
    });
  }

  // Diagnostics Drawer
  if (elements.btnToggleLogs && elements.drawerLogs) {
    elements.btnToggleLogs.addEventListener("click", () => {
      elements.drawerLogs.classList.toggle("open");
    });
  }
  if (elements.btnCloseLogs && elements.drawerLogs) {
    elements.btnCloseLogs.addEventListener("click", () => {
      elements.drawerLogs.classList.remove("open");
    });
  }
  if (elements.btnClearLogs && elements.logBody) {
    elements.btnClearLogs.addEventListener("click", () => {
      elements.logBody.innerHTML = "";
      addLog("Diagnostic log cleared.", "info");
    });
  }

  // Restore stored key if any
  const storedKey = localStorage.getItem("decart_custom_key");
  if (storedKey && elements.inputApiKey) {
    elements.inputApiKey.value = storedKey;
  }
}

// Initial Bootstrapping
async function bootstrap() {
  console.log("[VTON] Starting Bootstrap...");
  
  // 1. Immediately wire up all UI controls & event listeners (zero delay!)
  setupEventListeners();
  setupUploader();
  
  // 2. Immediately render presets
  await loadPresets();

  addLog("VTON Studio controls active.", "info");

  // 3. Background asynchronous initializations
  try {
    await checkServerConfig();
  } catch (e) {
    console.warn("Config check error:", e);
  }

  try {
    await loadCameraDevices();
  } catch (e) {
    console.warn("Device load error:", e);
  }

  try {
    await loadDecartSDK();
    await initDecartClient();
  } catch (e) {
    addLog(`Decart SDK status: ${e.message}`, "info");
  }

  addLog("Ready. Click 'Start Try-On' to begin camera stream.", "success");
}

// Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
