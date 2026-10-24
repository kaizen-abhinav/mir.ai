# mir.ai ✦ Realtime WebRTC Virtual Try-On Studio

<div align="center">

[![Live App](https://img.shields.io/badge/Live%20App-mir--ai--2g63.onrender.com-00f2fe?style=for-the-badge&logo=render)](https://mir-ai-2g63.onrender.com/)
[![Video Demo](https://img.shields.io/badge/Video%20Demo-Watch%20Walkthrough-ea4335?style=for-the-badge&logo=googledrive)](https://drive.google.com/file/d/1ewP4kQpb6wuX07_5iydvyP4PF-rfX_N2/view?usp=sharing)
![Decart AI](https://img.shields.io/badge/Powered%20By-Decart.ai%20Lucy%20VTON-4facfe?style=for-the-badge)
![WebRTC](https://img.shields.io/badge/Stream-WebRTC%20LiveKit-8a2be2?style=for-the-badge)
![Liquid Glass](https://img.shields.io/badge/UI-True%20Liquid%20Glass-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)

<p align="center">
  <strong>Next-generation live virtual clothing try-on powered by Decart.ai Lucy VTON 3.6 & 3.5 over ultra-low-latency WebRTC.</strong>
</p>

### 🌐 [Launch Live Web App](https://mir-ai-2g63.onrender.com/) ✦ 🎬 [Watch Full Video Demo](https://drive.google.com/file/d/1ewP4kQpb6wuX07_5iydvyP4PF-rfX_N2/view?usp=sharing)

</div>

---

## 🔗 Live Deployments & Demo

* 🚀 **Production URL**: [https://mir-ai-2g63.onrender.com/](https://mir-ai-2g63.onrender.com/) *(HTTPS active for instant camera access)*
* 🎥 **Video Demo Walkthrough**: [Watch on Google Drive](https://drive.google.com/file/d/1ewP4kQpb6wuX07_5iydvyP4PF-rfX_N2/view?usp=sharing)

---

## 📖 Overview

**mir.ai** is a real-time WebRTC Virtual Try-On (VTON) system that projects garments onto a live video stream captured from your webcam. Powered by **Decart AI's `lucy-vton-3.6`** generative video pipeline, **mir.ai** allows users to see garments mapped onto their body in real time with realistic fabric drape, lighting, and temporal consistency—enabling on-the-fly outfit changes in sub-second intervals without reconnecting the media session.

---

## 💡 Problem Solved

Traditional online apparel shopping and physical retail store fitting rooms face critical friction points:

1. **High Return Rates (30–40% in Fashion E-Commerce)**: Shoppers struggle to visualize how garments drape, fold, and fit their specific body shape and motion, causing massive return rates, logistical overhead, and environmental waste.
2. **Tedious Fitting Room Queues**: In physical clothing stores, customers often abandon purchases due to long fitting room lines and the hassle of repeatedly undressing to try on different items.
3. **Unrealistic 2D "Sticker" Overlays**: Existing AR virtual mirrors simply paste static 2D images over camera feeds without depth perception, cloth physics, or proper lighting integration.
4. **Latency & Credit Drain in Generative Video**: Traditional diffusion models take 20–60 seconds per frame, while continuous real-time video streams can rapidly exhaust API credits if left unmanaged.

### 🌟 How mir.ai Solves This:
* **Live Generative Video (30 FPS)**: Replaces flat 2D overlays with Decart's `lucy-vton-3.6` model, rendering true cloth deformation, shadows, and body tracking in sub-second intervals over WebRTC.
* **Store Mirror "Hold & Scan" HUD**: Retail shoppers simply hold any physical t-shirt or clothing item in front of the mirror; the computer vision viewfinder captures, aligns, and projects the garment onto their reflection within 5 seconds.
* **Zero-Waste Credit Optimizer**: Built-in idle sleep watchdog, zero-credit scan suspension, and Eco Burst Snapshot modes reduce credit consumption by up to 90%, allowing over **140 try-ons per 1,000 credits**.

---

## 🛠 Tech Stack & Tools Used

| Layer | Technologies & Tools | Purpose |
| :--- | :--- | :--- |
| **Generative AI** | **Decart AI (`lucy-vton-3.6` / `3.5`)** | Live video cloth deformation, body pose tracking & virtual try-on inference |
| **Streaming** | **WebRTC & LiveKit** | Ultra-low-latency bidirectional video track streaming |
| **SDK** | **`@decartai/sdk`** | Real-time signaling, media stream connection & atomic state swapping (`set()`) |
| **Frontend** | **Vanilla ES6+ Modules, HTML5, CSS3** | Zero-framework, sub-millisecond UI rendering and glassmorphic styling |
| **Optical Engine** | **SVG Filters (`<feDisplacementMap>`), Canvas 2D** | True Liquid Glass refraction, squircle math, and specular rim reflection |
| **Audio** | **Web Audio API** | Real-time synthesized chimes and shutter acoustics without external assets |
| **Backend** | **Python 3.10+ (`server.py`) / Node.js (`server.js`)** | Zero-dependency HTTP server & secure ephemeral JWT token broker |
| **Security** | **Decart Client Token API (JWT)** | Protects master API key by issuing scoped, short-lived client tokens |
| **Deployment** | **Render.com** | Automated CI/CD deployment with managed HTTPS/SSL certificates |

---

## ✨ Key Features

- **Retail Store "Hold & Scan" HUD**: Walk in front of the camera holding any physical t-shirt or garment. The smart optical scanner isolates and extracts the garment, displays full-frame live preview behind a high-tech alignment HUD (shoulder guide, collar scoop notch, chest target reticle, and hem boundary), automatically unmirrors graphics/logos, and projects it directly onto you!
- **True Liquid Glass UI**: Custom optical squircle refraction engine utilizing SVG `<feDisplacementMap>` + `<feComponentTransfer>`, canvas-baked specular rim highlights, pointer-tracked internal glow, and real-time second-order spring physics on all controls.
- **Credit Saver & Eco Suite**:
  - **Standard Mode (2 credits/sec)**: Reduces credit burn by 50% vs Fast Mode (4 credits/sec).
  - **Smart Idle Auto-Sleep**: Automatically pauses the WebRTC stream after 45s of inactivity to prevent accidental credit drainage, keeping the local mirror active with a tap-to-resume banner.
  - **Zero-Credit Scanning**: Automatically suspends AI billing during garment positioning and countdown.
  - **Eco Snapshot Burst Mode**: Renders outfit for ~3.5 seconds, freezes high-res try-on frame, and disconnects WebRTC (~7 credits per outfit = **140+ try-ons per 1,000 credits**).
  - **Live Credit Watchdog**: Real-time HUD pill displaying session uptime and estimated credits spent.
- **Decart `lucy-vton-3.6` & `3.5` Native Support**: High-definition 720p virtual try-on with state-of-the-art cloth deformation and movement tracking.
- **Atomic Garment Swapping (`set()`)**: Switch outfits instantly using `realtimeClient.set({ prompt, image })` without tearing down WebRTC peer connections.
- **Curated 3D Wardrobe Presets**: Ready-to-wear luxury studio garments (Crimson Silk Gown, Emerald Velvet Dress, Black Satin Slip Dress, White Floral Sundress, Black Moto Leather Biker).
- **Custom Garment Studio**: Drag-and-drop or upload custom clothing photos with live text prompt editing.
- **High-Res Snapshot Downloads**: Capture, watermark, and download snapshots of your virtual try-on looks.
- **Enterprise-Grade Token Security**: Employs short-lived ephemeral JWT client tokens minted via `/api/realtime-token` (`POST https://api.decart.ai/v1/client/tokens`) to protect your permanent platform API key.
- **Zero-Dependency Architecture**: Lightweight backend runs out-of-the-box on standard Python 3.10+ or Node.js.

---

## 🏗 System Architecture

```
                      ┌────────────────────────────────────────┐
                      │              mir.ai Client             │
                      │         (Modern HTML5 / ES Modules)    │
                      └────┬───────────────────────────────▲───┘
                           │                               │
         1. User Media     │ 3. SDP / ICE Signaling        │ 5. Remote Transformed
         (Webcam @ 720p)   │                               │    Video Track (720p)
                           ▼                               │
            ┌─────────────────────────────┐    ┌───────────┴─────────────┐
            │       Local Camera Feed     │    │   Decart LiveKit WebRTC │
            │      1280x720 @ 30 FPS      │    │     Streaming Server    │
            └──────────────┬──────────────┘    └───────────▲─────────────┘
                           │                               │
                           │ 4. Media Ingestion            │ Live Lucy 3.6
                           ▼                               │ Inference
                      ┌────────────────────────────────────┴───────────┐
                      │        Decart.ai Lucy VTON 3.6 / 3.5           │
                      │           Generative Video Engine              │
                      └────────────────────────────────────────────────┘
                                       ▲
                                       │ 2. Ephemeral JWT Client Token
                                       │    (POST /v1/client/tokens)
                      ┌────────────────┴───────────────┐
                      │         mir.ai Backend         │
                      │       (server.py / server.js)  │
                      └────────────────────────────────┘
```

---

## 🚀 Setup & Installation Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/kaizen-abhinav/mir.ai.git
cd mir.ai
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your Decart API key:

```env
# Decart.ai Platform API Key (dct_...)
DECART_API_KEY=dct_beta1_your_api_key_here

# Realtime Model (lucy-vton-3.6 or lucy-vton-3.5)
DECART_MODEL=lucy-vton-3.6

# Server Port
PORT=8080

# Speed Mode: 'fast' (lower latency) or 'standard'
DECART_SPEED=fast
```

*(Note: Never commit your `.env` file to source control. It is already included in `.gitignore`.)*

### 3. Launch the Server

Launch using the startup script:

```bash
./start.sh
```

Or run directly with **Python 3**:
```bash
python3 server.py
```

Or with **Node.js**:
```bash
node server.js
```

### 4. Experience Virtual Try-On

1. Open **`http://localhost:8080`** in Chrome, Edge, Firefox, or Safari.
2. Click **"Start Try-On"** and grant camera permissions.
3. Your live webcam feed will stream through Decart's `lucy-vton-3.6` model.
4. Click any garment preset card or upload your own outfit photo to try it on live!

---

## 💻 SDK Integration Examples

### JavaScript / Browser (Used in `mir.ai`)

```javascript
import { createDecartClient, models } from "@decartai/sdk";

// 1. Select the Lucy VTON model
const model = models.realtime("lucy-vton-3.6");

// 2. Capture user webcam feed matching model constraints
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: {
    frameRate: model.fps,
    width: model.width,
    height: model.height,
  }
});

// 3. Initialize Decart client with backend token provider
const client = createDecartClient({
  apiKeyProvider: async () => {
    const res = await fetch("/api/realtime-token", { method: "POST" });
    const { apiKey } = await res.json();
    return apiKey;
  }
});

// 4. Establish WebRTC real-time connection
const realtimeClient = await client.realtime.connect(stream, {
  model,
  speed: "fast",    // 2x throughput, lower latency
  mirror: "auto",
  onRemoteStream: (transformedStream) => {
    const videoElement = document.querySelector("#video-output");
    videoElement.srcObject = transformedStream;
  }
});

// 5. Apply garment dynamically (atomically replaces prompt + image)
await realtimeClient.set({
  prompt: "Wearing a black bomber jacket with a blue logo on the chest",
  image: "https://example.com/bomber.png",
});

// 6. Switch garments on the fly
await realtimeClient.set({
  prompt: "Wearing a red biker leather jacket",
  image: "https://example.com/leather.png",
});

// 7. Teardown session when finished
realtimeClient.disconnect();
```

---

### Python SDK (`decart`)

```python
import asyncio
from decart import DecartClient, models, SetInput
from decart.realtime import RealtimeClient, RealtimeConnectOptions
from decart.types import ModelState, Prompt

async def main():
    model = models.realtime("lucy-vton-3.6")

    # Acquire local camera stream track
    stream = await get_camera_stream(
        audio=True,
        video={
            "frame_rate": model.fps,
            "width": model.width,
            "height": model.height,
        },
    )

    client = DecartClient(api_key=os.environ["DECART_API_KEY"])

    # Connect to realtime WebRTC transformation session
    realtime_client = await RealtimeClient.connect(
        base_url=client.base_url,
        api_key=client.api_key,
        local_track=stream.video,
        options=RealtimeConnectOptions(
            model=model,
            on_remote_stream=lambda transformed_stream: handle_stream(transformed_stream),
            initial_state=ModelState(
                prompt=Prompt(text="Wearing a black bomber jacket with a blue logo on the chest"),
            ),
        ),
    )

    # Change garments on the fly
    await realtime_client.set(SetInput(
        prompt="Wearing a red leather jacket",
        image="https://example.com/red-jacket.png",
    ))

    # Clean disconnect
    await realtime_client.disconnect()

asyncio.run(main())
```

---

## 🔒 Security Architecture

**mir.ai** implements Decart's recommended authentication architecture:

```
[Browser / Client] ──(POST /api/realtime-token)──> [Backend Server (server.py)]
                                                            │
                                                   x-api-key: dct_... (Secret)
                                                            ▼
                                              [POST https://api.decart.ai/v1/client/tokens]
                                                            │
                                                   Signed JWT Token (TTL: 1h)
                                                            ▼
[Browser / Client] <───(Returns { apiKey: eyJ... })─────────┘
        │
  LiveKit WebRTC
  x-api-key: eyJ...
        ▼
[Decart WebRTC Edge Signaling]
```

- **Zero Permanent Key Leakage**: Browser bundles and public networks never see your master `dct_...` key.
- **Scoped Permissions**: Ephemeral tokens are scoped strictly to `allowedModels: ["lucy-vton-3.6"]`.
- **Automatic TTL Renewal**: `apiKeyProvider` automatically refreshes the client token prior to every connection or reconnect.

---

## 📂 Project Structure

```
mir.ai/
├── index.html              # Modern WebRTC try-on studio interface
├── app.js                  # Frontend client logic & WebRTC session manager
├── liquid-glass.js         # True Liquid Glass optical refraction & spring physics engine
├── style.css               # Cyber-fashion dark theme styling & liquid glass materials
├── server.py               # Zero-dependency Python 3 backend server & token proxy
├── server.js               # Node.js backend alternative
├── requirements.txt        # Production Python requirements for Render / cloud hosting
├── package.json            # Project metadata & npm scripts
├── start.sh                # Executable startup launcher
├── .env.example            # Environment variables template
├── .gitignore              # Protects keys & artifacts from git tracking
├── garments/               # Wardrobe presets & assets
│   ├── generate_garments.py# Asset generator script
│   ├── presets.json        # Preset metadata & data URLs
│   ├── bomber-jacket.png
│   ├── red-leather-jacket.png
│   ├── denim-jacket.png
│   ├── beige-trench.png
│   ├── cyberpunk-hoodie.png
│   ├── navy-blazer.png
│   └── floral-shirt.png
└── uploads/                # Custom user garment storage
```

---

## ☁️ Deployment

**mir.ai** is deployed live on [Render](https://render.com) with automatic HTTPS (mandatory for browser webcam permissions).

* **Live URL**: [https://mir-ai-2g63.onrender.com/](https://mir-ai-2g63.onrender.com/)
* **Build Command**: `pip install -r requirements.txt`
* **Start Command**: `python3 server.py`
* **Environment Variables**:
  * `DECART_API_KEY`: *(Configured in Render dashboard environment settings)*
  * `DECART_MODEL`: `lucy-vton-3.6`
  * `DECART_SPEED`: `standard`

---

## 🛠 Diagnostics & Controls

- **Settings Modal (`⚙`)**: Configure API keys, toggle Fast Mode, switch between camera inputs, or adjust front-camera mirroring.
- **Diagnostics Drawer (`>_`)**: Real-time event log tracking media constraints, ICE candidate negotiation, client token renewal timestamps, and SDK state changes.
- **Snapshot Tool (`📷`)**: Instant canvas snapshot capture with automated watermarking and PNG download.

---

## 📜 License

MIT License. Built for real-time AI fashion exploration and interactive streaming with Decart AI.
