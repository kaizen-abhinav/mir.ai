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
  fastMode: false, // Default to standard mode (2 cr/s instead of 4 cr/s)
  tryOnMode: "live", // "live" or "burst" (eco snapshot)
  idleTimeoutSeconds: 45, // Auto-pause after 45s inactivity
  lastUserActivityTime: Date.now(),
  creditsUsedThisSession: 0,
  isPaused: false,
  mirrorMode: "auto",
  selectedCameraId: "",
  activePreset: null,
  presets: [],
  sessionTimerId: null,
  sessionSeconds: 0,
  idleCheckTimerId: null,
  burstTimerId: null,
  customGarmentDataUrl: null,
  serverApiKey: "",
  modelName: "lucy-vton-3.6",
  scanTimerId: null,
  scanSecondsLeft: 5,
  lastScannedGarmentDataUrl: null,
  selectedScanCategory: "t-shirt",
  lastAppliedPrompt: null,
  lastAppliedImage: null,
  wasConnectedBeforeScan: false,
};

// DOM Elements
const elements = {
  videoOutput: document.getElementById("video-output"),
  videoLocal: document.getElementById("video-local"),
  stageViewport: document.getElementById("stage-viewport"),
  stagePlaceholder: document.getElementById("stage-placeholder"),
  btnToggleStream: document.getElementById("btn-toggle-stream"),
  btnPlaceholderStart: document.getElementById("btn-placeholder-start"),
  btnStandbyScan: document.getElementById("btn-standby-scan"),
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
  selectTryOnMode: document.getElementById("select-tryon-mode"),
  selectIdleTimeout: document.getElementById("select-idle-timeout"),
  // Credit Saver & Watchdog Elements
  creditWatchdogPill: document.getElementById("credit-watchdog-pill"),
  creditCounter: document.getElementById("credit-counter"),
  btnPauseStream: document.getElementById("btn-pause-stream"),
  iconPauseStream: document.getElementById("icon-pause-stream"),
  idleBanner: document.getElementById("idle-banner"),
  btnResumeIdle: document.getElementById("btn-resume-idle"),
  freezeFrameView: document.getElementById("freeze-frame-view"),
  freezeFrameImg: document.getElementById("freeze-frame-img"),
  btnUnfreezeStream: document.getElementById("btn-unfreeze-stream"),
  btnToggleLogs: document.getElementById("btn-toggle-logs"),
  btnCloseLogs: document.getElementById("btn-close-logs"),
  btnClearLogs: document.getElementById("btn-clear-logs"),
  drawerLogs: document.getElementById("drawer-logs"),
  logBody: document.getElementById("log-body"),
  toastContainer: document.getElementById("toast-container"),
  snapshotCanvas: document.getElementById("snapshot-canvas"),
  // Retail Store Scan Elements
  btnScanGarment: document.getElementById("btn-scan-garment"),
  btnDockScan: document.getElementById("btn-dock-scan"),
  btnStandbyScan: document.getElementById("btn-standby-scan"),
  viewfinderOverlay: document.getElementById("viewfinder-overlay"),
  viewfinderFrame: document.getElementById("viewfinder-frame"),
  scannerLivePreview: document.getElementById("scanner-live-preview"),
  scanCountdown: document.getElementById("scan-countdown"),
  btnCancelScan: document.getElementById("btn-cancel-scan"),
  btnSnapNow: document.getElementById("btn-snap-now"),
  shutterFlash: document.getElementById("shutter-flash"),
  scanResultOverlay: document.getElementById("scan-result-overlay"),
  scanResultThumb: document.getElementById("scan-result-thumb"),
  btnFlipScanThumb: document.getElementById("btn-flip-scan-thumb"),
  scanPromptInput: document.getElementById("scan-prompt-input"),
  btnCloseScanResult: document.getElementById("btn-close-scan-result"),
  btnRetakeScan: document.getElementById("btn-retake-scan"),
  btnProjectScan: document.getElementById("btn-project-scan"),
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
    if (elements.creditWatchdogPill) elements.creditWatchdogPill.style.display = "inline-flex";
    if (elements.btnPauseStream) elements.btnPauseStream.style.display = "flex";
  } else if (status === "connecting") {
    if (elements.btnStreamLabel) elements.btnStreamLabel.textContent = "Connecting...";
    if (elements.btnToggleStream) elements.btnToggleStream.classList.remove("connected");
    if (elements.telemetryIce) elements.telemetryIce.textContent = "checking";
  } else {
    if (elements.btnStreamLabel) elements.btnStreamLabel.textContent = "Start Try-On";
    if (elements.btnToggleStream) elements.btnToggleStream.classList.remove("connected");
    if (elements.stagePlaceholder) elements.stagePlaceholder.classList.remove("hidden");
    if (elements.telemetryIce) elements.telemetryIce.textContent = "idle";
    if (elements.btnPauseStream) elements.btnPauseStream.style.display = "none";
  }
}

// Session Timer & Credit Burn Watchdog
function startSessionTimer() {
  stopSessionTimer();
  state.sessionSeconds = 0;
  state.creditsUsedThisSession = 0;
  if (elements.telemetryTimer) elements.telemetryTimer.textContent = "00:00";
  if (elements.creditCounter) elements.creditCounter.textContent = "~0 cr";
  if (elements.creditWatchdogPill) elements.creditWatchdogPill.style.display = "inline-flex";
  if (elements.btnPauseStream) {
    elements.btnPauseStream.style.display = "flex";
    elements.btnPauseStream.classList.remove("btn-paused");
  }

  state.sessionTimerId = setInterval(() => {
    state.sessionSeconds++;
    const burnRate = state.fastMode ? 4 : 2;
    state.creditsUsedThisSession += burnRate;

    const m = String(Math.floor(state.sessionSeconds / 60)).padStart(2, "0");
    const s = String(state.sessionSeconds % 60).padStart(2, "0");
    if (elements.telemetryTimer) elements.telemetryTimer.textContent = `${m}:${s}`;
    if (elements.creditCounter) elements.creditCounter.textContent = `~${state.creditsUsedThisSession} cr`;
  }, 1000);

  startIdleWatcher();
}

function stopSessionTimer() {
  if (state.sessionTimerId) {
    clearInterval(state.sessionTimerId);
    state.sessionTimerId = null;
  }
  stopIdleWatcher();
}

// User Activity Tracking & Smart Auto-Sleep Watchdog
function recordUserActivity() {
  state.lastUserActivityTime = Date.now();
}

function startIdleWatcher() {
  stopIdleWatcher();
  state.lastUserActivityTime = Date.now();
  state.idleCheckTimerId = setInterval(() => {
    if (!state.isConnected || state.isPaused) return;
    if (state.idleTimeoutSeconds <= 0) return;

    const elapsed = Date.now() - state.lastUserActivityTime;
    if (elapsed > state.idleTimeoutSeconds * 1000) {
      addLog(`Auto-sleep triggered after ${state.idleTimeoutSeconds}s of inactivity. AI paused to save credits.`, "info");
      pauseWebRTC(true);
    }
  }, 2000);
}

function stopIdleWatcher() {
  if (state.idleCheckTimerId) {
    clearInterval(state.idleCheckTimerId);
    state.idleCheckTimerId = null;
  }
}

// Pause WebRTC stream (saves 100% credits while keeping local camera alive)
function pauseWebRTC(isIdle = false) {
  if (!state.isConnected && !state.realtimeClient) return;

  if (state.realtimeClient) {
    try {
      state.realtimeClient.disconnect();
    } catch (_) {}
    state.realtimeClient = null;
  }

  state.isPaused = true;
  state.isConnected = false;
  if (state.sessionTimerId) {
    clearInterval(state.sessionTimerId);
    state.sessionTimerId = null;
  }

  setConnectionStatus("idle", "Paused (AI off)");
  if (elements.btnToggleStream) elements.btnToggleStream.classList.remove("connected");
  if (elements.btnPauseStream) {
    elements.btnPauseStream.style.display = "flex";
    elements.btnPauseStream.classList.add("btn-paused");
    elements.btnPauseStream.title = "Resume AI Stream";
    elements.btnPauseStream.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>`;
  }

  if (isIdle && elements.idleBanner) {
    elements.idleBanner.style.display = "block";
  }

  showToast(isIdle ? "AI stream auto-paused to save credits" : "AI stream paused (0 credits/sec)", "info");
}

// Resume WebRTC stream
async function resumeWebRTC() {
  if (elements.idleBanner) {
    elements.idleBanner.style.display = "none";
  }
  if (elements.freezeFrameView) {
    elements.freezeFrameView.style.display = "none";
  }

  state.isPaused = false;
  recordUserActivity();

  if (elements.btnPauseStream) {
    elements.btnPauseStream.classList.remove("btn-paused");
    elements.btnPauseStream.title = "Pause AI (Save Credits)";
    elements.btnPauseStream.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>`;
  }

  addLog("Resuming real-time VTON stream...", "info");
  await connectStream();
  if (state.lastAppliedPrompt) {
    await applyGarment(state.lastAppliedPrompt, state.lastAppliedImage || "", "Active Garment");
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

      // Load Saved Eco & Try-On Preferences
      const savedTryOnMode = localStorage.getItem("mir_tryon_mode");
      if (savedTryOnMode && elements.selectTryOnMode) {
        state.tryOnMode = savedTryOnMode;
        elements.selectTryOnMode.value = savedTryOnMode;
      }
      const savedIdleTimeout = localStorage.getItem("mir_idle_timeout");
      if (savedIdleTimeout !== null && elements.selectIdleTimeout) {
        state.idleTimeoutSeconds = parseInt(savedIdleTimeout, 10);
        elements.selectIdleTimeout.value = savedIdleTimeout;
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
  state.lastAppliedPrompt = prompt;
  state.lastAppliedImage = image;
  recordUserActivity();

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

    // Eco Burst Snapshot mode: let Lucy render for 3.5s, grab frame, and pause!
    if (state.tryOnMode === "burst") {
      if (state.burstTimerId) clearTimeout(state.burstTimerId);
      showToast("Rendering Eco Snapshot (~3.5s burst)...", "info");

      state.burstTimerId = setTimeout(() => {
        state.burstTimerId = null;
        if (elements.videoOutput && elements.freezeFrameImg && elements.freezeFrameView) {
          try {
            const vw = elements.videoOutput.videoWidth || 1280;
            const vh = elements.videoOutput.videoHeight || 720;
            const c = document.createElement("canvas");
            c.width = vw;
            c.height = vh;
            const ctx = c.getContext("2d");
            ctx.drawImage(elements.videoOutput, 0, 0, vw, vh);
            const dataUrl = c.toDataURL("image/jpeg", 0.95);
            elements.freezeFrameImg.src = dataUrl;
            elements.freezeFrameView.style.display = "block";
            showToast("✨ Eco Snapshot Captured! (Used only ~7 credits)", "success");
            pauseWebRTC(false);
          } catch (e) {
            console.warn("Burst capture error:", e);
          }
        }
      }, 3500);
    }

  } catch (err) {
    addLog(`Failed to apply garment: ${err.message}`, "error");
    showToast(`Failed to update garment: ${err.message}`, "error");
  }
}

// Apply Preset
async function applyPreset(preset) {
  state.activePreset = preset;
  recordUserActivity();
  
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
    
    // Connect on Garment Select if mirror camera is running or out of standby
    if (state.localStream || (elements.stagePlaceholder && elements.stagePlaceholder.classList.contains("hidden"))) {
      addLog(`Selected preset: ${preset.name}. Connecting stream on-demand...`, "info");
      await connectStream();
    } else {
      addLog(`Selected preset: ${preset.name}. Click "Start" to wear.`, "info");
    }
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

// Audio Chime synthesizer for smart store interaction
function playScanChime(freq = 700, duration = 0.08) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

// Calculate exact crop coordinates mapping screen frame to native video buffer
function getFrameCropCoordinates(video, frameEl, containerEl) {
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  
  const cRect = containerEl ? containerEl.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight, left: 0, top: 0 };
  const fRect = frameEl ? frameEl.getBoundingClientRect() : null;

  if (!fRect || !cRect.width || !cRect.height) {
    const cropW = Math.round(vw * 0.55);
    const cropH = Math.round(vh * 0.70);
    return {
      cropX: Math.round((vw - cropW) / 2),
      cropY: Math.round((vh - cropH) / 2),
      cropW,
      cropH
    };
  }

  const containerW = cRect.width;
  const containerH = cRect.height;

  // object-fit: cover scaling
  const scale = Math.max(containerW / vw, containerH / vh);
  const renderedW = vw * scale;
  const renderedH = vh * scale;
  const offsetX = (containerW - renderedW) / 2;
  const offsetY = (containerH - renderedH) / 2;

  // Screen coordinates of frame relative to container
  const frameLeftRel = fRect.left - cRect.left;
  const frameTopRel = fRect.top - cRect.top;
  const frameW = fRect.width;
  const frameH = fRect.height;

  // If live preview is mirrored on screen (standard selfie view), the x-position on screen is reversed
  const isMirrored = state.isMirrored;
  const effectiveScreenX = isMirrored 
    ? (containerW - (frameLeftRel + frameW)) 
    : frameLeftRel;

  // Convert to native video buffer coordinates
  const nativeX = (effectiveScreenX - offsetX) / scale;
  const nativeY = (frameTopRel - offsetY) / scale;
  const nativeW = frameW / scale;
  const nativeH = frameH / scale;

  // Clamp safely within video dimensions
  const cropX = Math.max(0, Math.min(vw - 1, Math.round(nativeX)));
  const cropY = Math.max(0, Math.min(vh - 1, Math.round(nativeY)));
  const cropW = Math.max(1, Math.min(vw - cropX, Math.round(nativeW)));
  const cropH = Math.max(1, Math.min(vh - cropY, Math.round(nativeH)));

  return { cropX, cropY, cropW, cropH };
}

// Start Store Scan Mode (Live Preview + Garment HUD + 5-Second Countdown)
async function startGarmentScanner() {
  if (!elements.viewfinderOverlay) return;

  // 1. Ensure camera stream is active so the shopper sees what they are holding
  if (!state.localStream) {
    addLog("Activating camera for garment scanning...", "info");
    try {
      await getCameraStream();
    } catch (err) {
      showToast("Could not access camera: " + err.message, "error");
      return;
    }
  }

  // Suspend WebRTC during scanner to burn 0 credits while aligning
  if (state.isConnected && !state.isPaused) {
    state.wasConnectedBeforeScan = true;
    pauseWebRTC(false);
    addLog("Decart stream paused during garment scan (0 credits used).", "info");
  }

  // 2. Attach live camera stream to scanner preview element
  if (elements.scannerLivePreview && state.localStream) {
    elements.scannerLivePreview.style.transform = state.isMirrored ? "scaleX(-1)" : "none";
    if (elements.scannerLivePreview.srcObject !== state.localStream) {
      elements.scannerLivePreview.srcObject = state.localStream;
    }
    elements.scannerLivePreview.play().catch(() => {});
  }

  // 3. Open viewfinder overlay
  elements.viewfinderOverlay.classList.add("active");
  state.scanSecondsLeft = 5;
  if (elements.scanCountdown) {
    elements.scanCountdown.textContent = "5";
    elements.scanCountdown.style.display = "block";
    elements.scanCountdown.style.animation = "none";
    void elements.scanCountdown.offsetWidth;
    elements.scanCountdown.style.animation = "";
  }

  addLog("Store Scan Mode: Place t-shirt / garment within HUD guides (5s timer started).", "info");
  playScanChime(550, 0.1);

  // 4. Clear any existing timer
  if (state.scanTimerId) clearInterval(state.scanTimerId);

  // 5. Run 5-second countdown with rising tones
  state.scanTimerId = setInterval(() => {
    state.scanSecondsLeft--;
    if (state.scanSecondsLeft > 0) {
      if (elements.scanCountdown) {
        elements.scanCountdown.textContent = String(state.scanSecondsLeft);
        elements.scanCountdown.style.animation = "none";
        void elements.scanCountdown.offsetWidth;
        elements.scanCountdown.style.animation = "";
      }
      // Rising chime per second from 5 down to 1
      playScanChime(550 + (5 - state.scanSecondsLeft) * 110, 0.08);
    } else {
      clearInterval(state.scanTimerId);
      state.scanTimerId = null;
      captureHeldGarmentCrop();
    }
  }, 1000);
}

// Cancel Scanner
function cancelGarmentScanner() {
  if (state.scanTimerId) {
    clearInterval(state.scanTimerId);
    state.scanTimerId = null;
  }
  if (elements.viewfinderOverlay) {
    elements.viewfinderOverlay.classList.remove("active");
  }
}

// Crop and capture held garment
function captureHeldGarmentCrop() {
  cancelGarmentScanner();

  // Play shutter chime & trigger flash
  playScanChime(1350, 0.2);
  if (elements.shutterFlash) {
    elements.shutterFlash.classList.add("flash");
    setTimeout(() => elements.shutterFlash.classList.remove("flash"), 400);
  }

  const video = (elements.scannerLivePreview && elements.scannerLivePreview.videoWidth) 
    ? elements.scannerLivePreview 
    : elements.videoLocal;

  if (!video || !video.videoWidth) {
    showToast("No active webcam frame to capture garment from!", "error");
    return;
  }

  const { cropX, cropY, cropW, cropH } = getFrameCropCoordinates(
    video, 
    elements.viewfinderFrame, 
    elements.viewfinderOverlay
  );

  // Render to offscreen canvas
  const canvas = document.createElement("canvas");
  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext("2d");

  // Draw crop from native camera track
  ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  const garmentDataUrl = canvas.toDataURL("image/jpeg", 0.94);
  state.lastScannedGarmentDataUrl = garmentDataUrl;
  addLog(`Successfully extracted held garment snapshot (${cropW}x${cropH}).`, "success");

  // Show confirmation / project dialog
  showScanResultDialog(garmentDataUrl);
}

// Show Captured Garment Dialog
function showScanResultDialog(dataUrl) {
  if (elements.scanResultThumb) elements.scanResultThumb.src = dataUrl;
  if (elements.scanPromptInput) {
    elements.scanPromptInput.value = "Wearing this captured t-shirt with exact fabric, graphic, and color";
  }
  state.selectedScanCategory = "t-shirt";

  // Reset category pills
  document.querySelectorAll(".cat-pill").forEach(p => {
    p.classList.toggle("active", p.dataset.cat === "t-shirt");
  });

  if (elements.scanResultOverlay) {
    elements.scanResultOverlay.classList.add("active");
  }
}

// Project scanned garment onto the user via Decart Lucy
async function projectScannedGarment() {
  if (elements.scanResultOverlay) {
    elements.scanResultOverlay.classList.remove("active");
  }

  if (!state.lastScannedGarmentDataUrl) return;

  const cat = state.selectedScanCategory || "t-shirt";
  const prompt = (elements.scanPromptInput && elements.scanPromptInput.value.trim()) || `Wearing this captured ${cat}`;
  const label = `Scanned ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;

  // Ensure WebRTC connection is active
  if (!state.isConnected || !state.realtimeClient) {
    addLog("Connecting real-time VTON stream to project scanned garment...", "info");
    await connectStream();
  }

  // 1. Add to the session catalog presets list (appears at the top of left dock!)
  const newPreset = {
    id: `scan-${Date.now()}`,
    name: label,
    prompt: prompt,
    filename: "scanned-garment.jpg",
    imageUrl: state.lastScannedGarmentDataUrl,
    dataUrl: state.lastScannedGarmentDataUrl,
    category: "Store Scan",
    isScanned: true
  };

  state.presets.unshift(newPreset);
  renderPresets(state.presets);

  // 2. Project onto user atomically
  await applyGarment(prompt, state.lastScannedGarmentDataUrl, label, state.lastScannedGarmentDataUrl);
  showToast(`✨ Scanned ${cat} projected onto you!`, "success");
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

  // Track user interaction for Smart Auto-Sleep
  ['pointerdown', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, recordUserActivity, { passive: true });
  });

  // Toggle Stream Button
  const toggleHandler = () => {
    if (state.isConnected) {
      disconnectStream();
    } else {
      resumeWebRTC();
    }
  };
  if (elements.btnToggleStream) elements.btnToggleStream.addEventListener("click", toggleHandler);

  // Standby Start Button: Activate local camera first to save credits while browsing
  if (elements.btnPlaceholderStart) {
    elements.btnPlaceholderStart.addEventListener("click", async () => {
      try {
        await getCameraStream();
        if (elements.stagePlaceholder) elements.stagePlaceholder.classList.add("hidden");
        addLog("Local mirror camera active (0 credits used). Select an outfit to wear.", "info");
        showToast("Select an outfit from the left catalogue to try on!", "info");
      } catch (err) {
        showToast("Could not access camera: " + err.message, "error");
      }
    });
  }

  // Credit Saver: Pause / Resume Stream Button in HUD
  if (elements.btnPauseStream) {
    elements.btnPauseStream.addEventListener("click", () => {
      if (state.isPaused) {
        resumeWebRTC();
      } else {
        pauseWebRTC(false);
      }
    });
  }

  // Credit Saver: Resume from Idle Auto-Sleep Banner
  if (elements.btnResumeIdle) {
    elements.btnResumeIdle.addEventListener("click", () => {
      resumeWebRTC();
    });
  }

  // Credit Saver: Resume from Freeze Frame in Eco Snapshot mode
  if (elements.btnUnfreezeStream) {
    elements.btnUnfreezeStream.addEventListener("click", () => {
      resumeWebRTC();
    });
  }

  // Store Mirror: Scan Held Garment triggers
  if (elements.btnScanGarment) elements.btnScanGarment.addEventListener("click", startGarmentScanner);
  if (elements.btnDockScan) elements.btnDockScan.addEventListener("click", startGarmentScanner);
  if (elements.btnStandbyScan) elements.btnStandbyScan.addEventListener("click", startGarmentScanner);
  if (elements.btnCancelScan) elements.btnCancelScan.addEventListener("click", cancelGarmentScanner);
  if (elements.btnSnapNow) elements.btnSnapNow.addEventListener("click", captureHeldGarmentCrop);

  // Scan Result Dialog Controls
  if (elements.btnCloseScanResult && elements.scanResultOverlay) {
    elements.btnCloseScanResult.addEventListener("click", () => elements.scanResultOverlay.classList.remove("active"));
  }
  if (elements.btnRetakeScan && elements.scanResultOverlay) {
    elements.btnRetakeScan.addEventListener("click", () => {
      elements.scanResultOverlay.classList.remove("active");
      startGarmentScanner();
    });
  }
  if (elements.btnProjectScan) {
    elements.btnProjectScan.addEventListener("click", projectScannedGarment);
  }

  // Category Pills
  document.querySelectorAll(".cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.selectedScanCategory = pill.dataset.cat || "t-shirt";
      if (elements.scanPromptInput) {
        elements.scanPromptInput.value = `Wearing this captured ${state.selectedScanCategory} with exact fabric, graphic, and color`;
      }
    });
  });

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
      if (elements.scannerLivePreview) elements.scannerLivePreview.style.transform = state.isMirrored ? "scaleX(-1)" : "none";
      elements.btnToggleMirror.classList.toggle("active", state.isMirrored);
    });
  }

  // Scanned Garment Thumbnail Flip Button
  if (elements.btnFlipScanThumb && elements.scanResultThumb) {
    elements.btnFlipScanThumb.addEventListener("click", () => {
      const img = elements.scanResultThumb;
      if (!img.src) return;
      const c = document.createElement("canvas");
      c.width = img.naturalWidth || 400;
      c.height = img.naturalHeight || 500;
      const ctx = c.getContext("2d");
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      const flipped = c.toDataURL("image/jpeg", 0.94);
      img.src = flipped;
      state.lastScannedGarmentDataUrl = flipped;
      addLog("Flipped scanned garment orientation.", "info");
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
      if (elements.selectTryOnMode) {
        state.tryOnMode = elements.selectTryOnMode.value;
        localStorage.setItem("mir_tryon_mode", state.tryOnMode);
      }
      if (elements.selectIdleTimeout) {
        state.idleTimeoutSeconds = parseInt(elements.selectIdleTimeout.value, 10) || 0;
        localStorage.setItem("mir_idle_timeout", String(state.idleTimeoutSeconds));
      }
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
