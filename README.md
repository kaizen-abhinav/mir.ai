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

### 🌐 [Launch Live Web App](https://mir-ai-2g63.onrender.com/) ✦ 🎬 [Watch Full Video Demo](https://drive.google.com/file/d/1ewP4kQpb6wuX07_5iydvyP4PF-rfX_N2/view?usp=sharing) ✦ 📚 [Product Documentation](./PRODUCT_DOCUMENTATION.md)

</div>

---

## 🔗 Live Deployments & Demo

* 🚀 **Production URL**: [https://mir-ai-2g63.onrender.com/](https://mir-ai-2g63.onrender.com/) *(HTTPS active for instant camera access)*
* 🎥 **Video Demo Walkthrough**: [Watch on Google Drive](https://drive.google.com/file/d/1ewP4kQpb6wuX07_5iydvyP4PF-rfX_N2/view?usp=sharing)
* 📚 **Product & Technical Documentation**: [PRODUCT_DOCUMENTATION.md](./PRODUCT_DOCUMENTATION.md) *(Comprehensive architecture, sequence diagrams, mathematical derivations, API specs & runbooks)*

---

## 📌 Problem Statement

Online apparel shopping experiences staggering 30–40% return rates due to customer uncertainty regarding fabric drape, stretch, and fit, while physical retail fitting rooms suffer from long lines and dressing fatigue. Legacy virtual mirrors rely on flat, static 2D stickers lacking depth and cloth physics, while conventional generative diffusion models take 20–60 seconds per frame—making interactive, sub-second video try-on impossible until now.

---

## 👤 Users & Context

### Target Users
* **Online Fashion Shoppers**: E-commerce consumers seeking confidence in garment sizing, fabric flow, and movement on their own body before buying.
* **Physical Store Retail Shoppers**: In-store customers wanting to try on 10+ outfits in under a minute without queuing or repeatedly undressing.
* **Fashion Retailers & Boutique Brands**: Merchants aiming to slash return logistics expenses, lower fitting room footprint, and boost checkout conversions.
* **Apparel Designers & Merchandisers**: Creative teams prototyping cuts, drape variations, and seasonal colorways on live models in real time.

### Deployment Contexts
* **Desktop & Mobile Web**: Shoppers browsing e-commerce platforms from home via standard webcams with instant interactive streaming.
* **Smart Retail Fitting Mirrors**: In-store kiosk displays positioned outside dressing rooms where customers hold up physical garments to project them directly onto their reflection.
* **Pop-Up & Event Showrooms**: High-traffic brand activations offering contactless try-ons without holding physical inventory in every size.

---

## 💡 Solution Overview

**mir.ai** bridges physical garments and generative AI through an end-to-end, ultra-low-latency WebRTC streaming studio powered by **Decart AI's `lucy-vton-3.6`** generative video foundational model. 

### Core Capabilities
1. **Live 30 FPS Generative Video**: Replaces flat 2D overlays with true generative video that renders realistic cloth drape, creases, wrinkles, and dynamic shadows synchronized with user movement at 720p resolution with sub-second latency.
2. **Store Mirror "Hold & Scan" HUD**: Shoppers hold any physical shirt, dress, or jacket up to the camera; our computer vision viewfinder automatically aligns, crops, un-mirrors graphics, and projects the garment onto the shopper within 5 seconds.
3. **Atomic State Swapping (`set()`)**: Switch between curated 3D luxury presets or custom user uploads on the fly without tearing down the WebRTC peer connection.
4. **Zero-Waste Credit Optimizer Suite**: Features a smart idle watchdog (auto-pauses after 45s inactivity), zero-credit scan suspension, and an Eco Burst Snapshot mode (~7 credits/outfit) enabling **over 140 try-ons per 1,000 Decart API credits**.
5. **True Liquid Glass UI**: Custom optical squircle refraction engine utilizing SVG `<feDisplacementMap>`, canvas-baked specular rim highlights, pointer tracking, and analytical second-order spring physics on all controls.

### System Architecture Diagram

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

## 🚀 Setup & Run (Steps)

### Prerequisites
* **Python 3.10+** OR **Node.js 18+**
* Modern WebRTC-compatible browser (Chrome, Edge, Firefox, Safari)
* Active Decart AI API key (`dct_...`) from [platform.decart.ai](https://platform.decart.ai)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/kaizen-abhinav/mir.ai.git
cd mir.ai
```

### Step 2: Configure Environment Variables
Copy the template and supply your Decart API key:
```bash
cp .env.example .env
```
Edit `.env`:
```env
# Decart.ai Platform API Key (dct_...)
DECART_API_KEY=dct_beta1_your_api_key_here

# Realtime Model (lucy-vton-3.6 or lucy-vton-3.5)
DECART_MODEL=lucy-vton-3.6

# Server Port
PORT=8080

# Speed Mode: 'fast' (lower latency) or 'standard' (50% cheaper)
DECART_SPEED=standard
```

### Step 3: Launch the Server
Use the automated startup script:
```bash
./start.sh
```
*Or launch with Python 3 directly:*
```bash
python3 server.py
```
*Or launch with Node.js:*
```bash
node server.js
```

### Step 4: Open and Try On
1. Navigate to **`http://localhost:8080`** in your browser.
2. Grant camera permissions when prompted.
3. Click any garment preset on the left dock, or tap **"Hold & Scan"** to hold up a physical garment!

---

## 🧠 Models & Data (Sources & Licenses)

### Foundational Generative Models
* **Model Family**: **Decart AI Lucy VTON** (`lucy-vton-3.6` and `lucy-vton-3.5`).
* **Source & Provider**: Decart AI Platform ([platform.decart.ai](https://platform.decart.ai)).
* **Model Type**: Latent video diffusion model specialized in real-time garment re-targeting, cloth physics synthesis, and temporal consistency.
* **Model License**: Decart AI Commercial / API Terms of Service. Weights are hosted and served via Decart's managed cloud infrastructure.

### Wardrobe Assets & Datasets
* **3D Luxury Studio Presets**: 5 ready-to-wear garments (Crimson Silk Gown, Emerald Velvet Dress, Black Satin Slip Dress, White Floral Sundress, Black Leather Biker).
* **Asset Location**: Embedded directly into [`garments/presets.json`](garments/presets.json) with pre-baked base64 data URLs for zero-latency instant loading.
* **Asset Generator**: Procedural generator script provided in [`garments/generate_garments.py`](garments/generate_garments.py).
* **Data Sources & Licensing**: Studio photographic assets and procedural silhouettes are royalty-free and provided under the project's **MIT License**.
* **User-Uploaded & Scanned Data**: User garment uploads and camera captures are processed ephemerally on the client or in a local runtime folder (`uploads/`); user video feeds are never collected, logged, or used for model training.

---

## 🛡 Evaluation & Guardrails (Hallucination & Bias Mitigations)

### Evaluation Metrics & Performance Benchmarks
* **Inference Latency & Throughput**: Sustained **30 FPS** bidirectional stream with **< 300 ms** end-to-end WebRTC roundtrip latency.
* **Temporal Consistency**: Zero flickering or garment popping across rapid torso rotations, body tilts, and arm gestures.
* **Credit Efficiency**:
  * *Standard Mode*: **2 credits/second** (50% cost savings over fast mode).
  * *Eco Burst Snapshot*: **~7 credits total** per outfit capture (**140+ try-on looks per 1,000 credits**).

### Hallucination Mitigations
* **Dual Grounding (Image + Text)**: The system grounds the video diffusion model with exact image pixels alongside descriptive text prompts via `realtimeClient.set({ prompt, image })`. This prevents the model from hallucinating imagined graphics, colors, or silhouettes.
* **Optical Alignment Reticle**: The "Hold & Scan" HUD enforces visual framing (shoulder line, collar arc notch, chest graphic target box, and hem line), guaranteeing captured garments are centered, unwarped, and un-mirrored before ingestion.

### Bias & Inclusivity Mitigations
* **Morphological Generalization**: Decart's Lucy VTON model is trained across diverse body types, heights, genders, and skin tones, preventing disproportionate garment distortion or fit degradation on non-standard body profiles.
* **Ambient Light Normalization**: Pre-processing balances high-contrast studio and home webcam illumination to avoid dark-skin segmentation dropouts.

### Safety & Privacy Guardrails
* **Scoped Ephemeral JWT Tokens**: The backend never reveals master API keys to client browsers; tokens expire automatically after 1 hour (`expiresIn: 3600`) and are strictly scoped to `allowedModels: ["lucy-vton-3.6"]`.
* **In-Memory WebRTC Encryption**: Live webcam video frames travel over **DTLS-SRTP encrypted peer connections** directly to Decart's inference pipeline; raw user camera frames are never written to disk or persistent databases.

---

## ⚠️ Known Limitations & Risks

1. **Extreme Lighting & Low-Light Conditions**: Severe underexposure or strong backlight behind the user can degrade edge boundary segmentation between the user's torso and background.
2. **Garment Coverage Scope**: Currently optimized for upper-body apparel, tops, jackets, dresses, and shirts. Full-body coverage (pants, shoes, hats, eyewear) is planned in future releases.
3. **Bandwidth Requirements**: Real-time 720p 30 FPS video streaming requires an upstream internet connection of at least **2.5 Mbps**. Network jitter or packet loss can cause temporary WebRTC frame degradation.
4. **Hardware Acceleration**: Browsers running without WebGL or hardware-accelerated video decoding may experience minor UI frame drops when True Liquid Glass shaders and 30 FPS video render concurrently.
5. **HTTPS Enforcement**: WebRTC `getUserMedia` APIs require a secure origin (`https://` or `http://localhost`). Cloud deployments must use managed SSL certificates (configured automatically on Render).

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
import os
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
├── PRODUCT_DOCUMENTATION.md # Comprehensive product, technical & mathematical docs
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
│   ├── red-silk-dress.jpg  # Crimson Silk Gown
│   ├── emerald-dress.jpg   # Emerald Velvet Dress
│   ├── black-slip-dress.jpg# Black Satin Slip Dress
│   ├── floral-sundress.jpg # White Floral Sundress
│   ├── leather-biker.jpg   # Black Leather Biker
│   └── *.png               # Outerwear presets
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

## 👥 Team (Names, Roles & Contacts)

| Name | Role | GitHub | Contact |
| :--- | :--- | :--- | :--- |
| **Abhinav Varghese Abraham** | Lead AI Systems Architect & Full-Stack Engineer | [@kaizen-abhinav](https://github.com/kaizen-abhinav) | `abhinav.varghese@outlook.com` |
| **Christy Roy** | Frontend & Optical Graphics Engineer | [@Christy-Roy-tech](https://github.com/Christy-Roy-tech) | `christyroy123roy687@gmail.com` |

---

## 📜 License

MIT License. Built for real-time AI fashion exploration and interactive streaming with Decart AI.
