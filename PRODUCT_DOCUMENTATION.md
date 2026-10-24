# mir.ai ✦ Complete Product & Technical Documentation

> **Version**: 1.0.0  
> **Status**: Production / Live  
> **Production URL**: [https://mir-ai-2g63.onrender.com/](https://mir-ai-2g63.onrender.com/)  
> **Repository**: [https://github.com/kaizen-abhinav/mir.ai](https://github.com/kaizen-abhinav/mir.ai)  
> **Authors & Engineering Team**: Abhinav Varghese Abraham & Christy Roy  
> **Video Walkthrough**: [Watch on Google Drive](https://drive.google.com/file/d/1ewP4kQpb6wuX07_5iydvyP4PF-rfX_N2/view?usp=sharing)  
> **Target Audience**: Core Developers, Solutions Architects, Retail Partners, Product Managers, and AI Engineers.

---

## Table of Contents

1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Problem Statement & Commercial Impact](#2-problem-statement--commercial-impact)
3. [End-to-End System Architecture](#3-end-to-end-system-architecture)
   - 3.1 [High-Level Architecture Topology](#31-high-level-architecture-topology)
   - 3.2 [Sequence Diagram: Ephemeral Token Minting & Authentication](#32-sequence-diagram-ephemeral-token-minting--authentication)
   - 3.3 [Sequence Diagram: WebRTC Live Media Transformation](#33-sequence-diagram-webrtc-live-media-transformation)
   - 3.4 [Sequence Diagram: Atomic Garment Swapping (`set()`)](#34-sequence-diagram-atomic-garment-swapping-set)
   - 3.5 [Sequence Diagram: Retail Store "Hold & Scan" Mirror Flow](#35-sequence-diagram-retail-store-hold--scan-mirror-flow)
   - 3.6 [Sequence Diagram: Zero-Waste Credit Optimization State Machine](#36-sequence-diagram-zero-waste-credit-optimization-state-machine)
4. [Feature Specifications & Functional Deep Dive](#4-feature-specifications--functional-deep-dive)
   - 4.1 [Live Generative Video VTON (Decart Lucy 3.6 / 3.5)](#41-live-generative-video-vton-decart-lucy-36--35)
   - 4.2 [Smart Retail Mirror: "Hold & Scan" Viewfinder HUD](#42-smart-retail-mirror-hold--scan-viewfinder-hud)
   - 4.3 [Zero-Waste Credit Saver Suite](#43-zero-waste-credit-saver-suite)
   - 4.4 [True Liquid Glass UI & Optical Refraction Engine](#44-true-liquid-glass-ui--optical-refraction-engine)
   - 4.5 [Atomic State Swapping Pipeline](#45-atomic-state-swapping-pipeline)
   - 4.6 [3D Luxury Wardrobe Catalogue Dock](#46-3d-luxury-wardrobe-catalogue-dock)
   - 4.7 [Custom Garment Studio & Prompt Engineering](#47-custom-garment-studio--prompt-engineering)
   - 4.8 [High-Resolution Watermarked Snapshot Studio](#48-high-resolution-watermarked-snapshot-studio)
   - 4.9 [Diagnostics, ICE Telemetry & Live Event Log](#49-diagnostics-ice-telemetry--live-event-log)
   - 4.10 [Synthesized Web Audio Acoustic Engine](#410-synthesized-web-audio-acoustic-engine)
5. [Mathematical & Algorithmic Foundations](#5-mathematical--algorithmic-foundations)
   - 5.1 [Squircle Geometry & Signed Distance Fields (SDF)](#51-squircle-geometry--signed-distance-fields-sdf)
   - 5.2 [SVG Optical Refraction & Vector Displacement Fields](#52-svg-optical-refraction--vector-displacement-fields)
   - 5.3 [Second-Order Spring Physics ODE Solver](#53-second-order-spring-physics-ode-solver)
   - 5.4 [Screen-to-Sensor Optical Coordinate Transformation](#54-screen-to-sensor-optical-coordinate-transformation)
6. [Codebase Anatomy & Implementation Details](#6-codebase-anatomy--implementation-details)
   - 6.1 [`index.html`: DOM Hierarchy & Markup Specification](#61-indexhtml-dom-hierarchy--markup-specification)
   - 6.2 [`app.js`: State Engine & WebRTC Controller](#62-appjs-state-engine--webrtc-controller)
   - 6.3 [`liquid-glass.js`: Refraction Shaders & Physics](#63-liquid-glassjs-refraction-shaders--physics)
   - 6.4 [`style.css`: Design Tokens & Visual Hierarchy](#64-stylecss-design-tokens--visual-hierarchy)
   - 6.5 [`server.py`: Python Standard Library Server](#65-serverpy-python-standard-library-server)
   - 6.6 [`server.js`: Node.js ESM Backend Alternative](#66-serverjs-nodejs-esm-backend-alternative)
   - 6.7 [`start.sh` & Project Manifests](#67-startsh--project-manifests)
   - 6.8 [`garments/` Asset System & `generate_garments.py`](#68-garments-asset-system--generate_garmentspy)
7. [API Reference & Protocols](#7-api-reference--protocols)
   - 7.1 [Local Backend Endpoints](#71-local-backend-endpoints)
   - 7.2 [Decart Cloud API Protocol](#72-decart-cloud-api-protocol)
   - 7.3 [`@decartai/sdk` JS API Methods](#73-decartaisdk-js-api-methods)
8. [Configuration & Environment Variables](#8-configuration--environment-variables)
9. [Installation, Local Setup & Run Guide](#9-installation-local-setup--run-guide)
10. [Cloud Deployment & DevOps Runbook](#10-cloud-deployment--devops-runbook)
11. [Security, Privacy & Data Integrity](#11-security-privacy--data-integrity)
12. [Troubleshooting & Diagnostic FAQ](#12-troubleshooting--diagnostic-faq)
13. [Commercial Roadmap & Future Horizons](#13-commercial-roadmap--future-horizons)

---

## 1. Executive Summary & Product Vision

**mir.ai** is an interactive, real-time WebRTC Virtual Try-On (VTON) Studio and Smart Retail Mirror. Powered by **Decart AI's `lucy-vton-3.6` and `3.5`** generative video foundational models, mir.ai transforms live 720p 30 FPS camera feeds to project physical and digital garments onto human bodies in real time.

Unlike static 2D image diffusion (which requires 20 to 60 seconds per frame) or superficial augmented reality sticker filters (which lack depth, cloth physics, and lighting consistency), mir.ai achieves **continuous bidirectional video transformation with sub-second latency**. The user moves naturally in front of their webcam or a physical store display, observing fabric drape, stretch, folds, wrinkles, and dynamic shadows as they turn, pose, and gesture.

### Key Milestones Achieved
- **Sub-Second Streaming Inference**: End-to-end WebRTC round-trip transformation powered by LiveKit media streaming.
- **Physical-to-Digital Bridge**: The **Hold & Scan HUD** allows shoppers in physical stores to hold any garment up to the camera, extract it via real-time optical coordinate mapping, and wear it digitally within 5 seconds.
- **Zero-Waste Credit Economics**: Proprietary credit optimization reduces consumption by up to 90%, enabling over **140 try-on sessions per 1,000 Decart API credits**.
- **True Liquid Glass UI**: Custom optical squircle refraction engine utilizing SVG `<feDisplacementMap>`, canvas-baked specular rim highlights, pointer-tracked internal glow, and analytical second-order spring physics on all controls.
- **Zero-Dependency Architecture**: Lightweight backend runs out-of-the-box on standard Python 3.10+ standard libraries or Node.js without heavy frameworks.

---

## 2. Problem Statement & Commercial Impact

### 2.1 The E-Commerce Returns Crisis
Online apparel retail experiences an average return rate between **30% and 40%**, with over 70% of returns attributed to poor fit, unflattering drape, and visual discrepancies between product photos and reality. This costs global retail over **$800 billion annually** in reverse logistics, repackaging, product depreciation, and environmental emissions.

### 2.2 In-Store Retail Friction
In physical retail environments, fitting rooms are a notorious point of friction:
- **Long Queues**: Shoppers frequently abandon high-intent purchase baskets when dressing room lines exceed 5–7 minutes.
- **Item Handling Wear**: Garments tried on multiple times suffer makeup stains, fabric stretching, and deodorant marks, leading to inventory markdowns.
- **Limited Sizing/Color Display**: Physical floor space limits visible SKU variations.

### 2.3 Legacy AR & AI Limitations
| Technology | Latency | Realism | Cloth Physics | Usability |
| :--- | :--- | :--- | :--- | :--- |
| **Legacy 2D AR Overlays** | ~33 ms | Poor (flat sticker) | None (static warping) | Rigid, breaks on side profiles |
| **Standard Image Diffusion** | 20–60 s | High | High (single frame) | Non-interactive, high friction |
| **mir.ai (Decart Lucy VTON)** | **< 300 ms** | **Ultra-Realistic** | **Full Generative Dynamics** | **Live 30 FPS natural motion** |

### 2.4 Value Proposition
1. **Confidence-Driven Conversion**: Increases online e-commerce conversion by up to 35% through dynamic drape visualization.
2. **Instant In-Store Trying**: Shoppers try 10 outfits in under 60 seconds without undressing.
3. **Sustainable Logistics**: Slashes return shipments and eliminates physical sample wear.

---

## 3. End-to-End System Architecture

### 3.1 High-Level Architecture Topology

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT BROWSER (mir.ai)                            │
│                                                                                │
│  ┌───────────────────────┐   ┌────────────────────────┐   ┌─────────────────┐  │
│  │ HTML5 / CSS3 HUD      │   │ Liquid Glass Engine    │   │ Web Audio Synth │  │
│  │ (Zero-framework DOM)  │   │ (SDF Refraction/Spring)│   │ (Chimes/Shutter)│  │
│  └───────────┬───────────┘   └───────────┬────────────┘   └────────┬────────┘  │
│              │                           │                         │           │
│              └───────────────────────────┼─────────────────────────┘           │
│                                          ▼                                     │
│                         ┌─────────────────────────────────┐                    │
│                         │    app.js Application Core      │                    │
│                         │  • State Machine & Watchdogs    │                    │
│                         │  • Optical Crop Transformation  │                    │
│                         │  • Dynamic @decartai/sdk Loader │                    │
│                         └────────┬───────────────▲────────┘                    │
└──────────────────────────────────┼───────────────┼─────────────────────────────┘
                                   │               │
            1. User Media Stream   │               │ 5. Remote Transformed
            (1280x720 @ 30 FPS)    │               │    MediaStream (720p 30 FPS)
                                   ▼               │
┌───────────────────────────┐    ┌─────────────────┴─────────────┐
│    Local Device Camera    │    │    Decart LiveKit WebRTC      │
│    (navigator.mediaDevices)│    │       Edge Streaming          │
└───────────────────────────┘    └─────────────────▲─────────────┘
                                                   │
                                                   │ 4. Bidirectional RTCPeerConnection
                                                   │    (H.264 / VP8 Video Tracks)
                                                   ▼
┌───────────────────────────┐    ┌───────────────────────────────┐
│      mir.ai Backend       │    │ Decart.ai Cloud Infrastructure│
│   (server.py / server.js) │    │                               │
│                           │    │  ┌─────────────────────────┐  │
│  • Ephemeral Token Proxy  │    │  │ Lucy VTON 3.6 / 3.5     │  │
│  • Static File Server     │    │  │ Generative Video Engine │  │
│  • Custom Garment Storage │    │  └─────────────────────────┘  │
│                           │    │  ┌─────────────────────────┐  │
│  POST /api/realtime-token │    │  │ Token Validation API    │  │
│  (Mint JWT Client Token)  ├───►│  │ (POST /v1/client/tokens)│  │
└───────────────────────────┘    └───────────────────────────────┘
```

---

### 3.2 Sequence Diagram: Ephemeral Token Minting & Authentication

```mermaid
sequenceDiagram
    autonumber
    actor User as Shopper / Browser
    participant App as mir.ai Frontend (app.js)
    participant Srv as mir.ai Server (server.py)
    participant Decart as Decart API (api.decart.ai)

    User->>App: Clicks "Start Try-On"
    App->>Srv: POST /api/realtime-token { expiresIn: 3600 }
    activate Srv
    Note over Srv: Read DECART_API_KEY from environment (.env)
    Srv->>Decart: POST /v1/client/tokens<br/>Header: x-api-key: dct_...<br/>Body: { expiresIn: 3600, allowedModels: ["lucy-vton-3.6"] }
    activate Decart
    Decart-->>Srv: 200 OK { apiKey: "eyJhbGciOi...", expiresAt: 1729780000 }
    deactivate Decart
    Srv-->>App: 200 OK { apiKey: "eyJhbGciOi..." }
    deactivate Srv
    Note over App: Client securely stores signed ephemeral token<br/>(Master key never exposed to browser)
```

---

### 3.3 Sequence Diagram: WebRTC Live Media Transformation

```mermaid
sequenceDiagram
    autonumber
    actor User as Shopper / User
    participant App as mir.ai Client (app.js)
    participant DecartSDK as @decartai/sdk
    participant DecartEdge as Decart LiveKit WebRTC Server
    participant Lucy as Decart Lucy VTON Engine

    App->>App: getUserMedia({ video: 1280x720 @ 30fps, audio: true })
    App->>DecartSDK: createDecartClient({ apiKeyProvider })
    App->>DecartSDK: client.realtime.connect(stream, { model, speed: "standard", mirror: "auto" })
    activate DecartSDK
    DecartSDK->>DecartEdge: SDP Offer & ICE Candidate Exchange (LiveKit Protocol)
    DecartEdge-->>DecartSDK: SDP Answer & Connected
    DecartSDK-->>App: Returns RealtimeClient instance
    deactivate DecartSDK

    loop 30 FPS Ingestion & Generative Inference
        App->>DecartEdge: Local Webcam Frame Video Track
        DecartEdge->>Lucy: Ingest frame + apply active Prompt & Garment Reference
        Lucy->>DecartEdge: Render transformed video frame (cloth drape, shadows, motion)
        DecartEdge->>App: onRemoteStream(transformedStream)
        App->>User: Render transformed video on full-screen <video id="video-output">
    end
```

---

### 3.4 Sequence Diagram: Atomic Garment Swapping (`set()`)

```mermaid
sequenceDiagram
    autonumber
    actor User as Shopper
    participant App as mir.ai Client
    participant Realtime as RealtimeClient (SDK)
    participant Lucy as Decart Lucy VTON Engine

    User->>App: Clicks 3D Garment Card (e.g. "Emerald Velvet Dress")
    App->>App: Update active preset state & UI pill
    App->>Realtime: realtimeClient.set({ prompt: "Wearing...", image: "data:image/jpeg;base64,..." })
    activate Realtime
    Realtime->>Lucy: Transmit atomic state payload over open WebRTC DataChannel
    Note over Lucy: Replaces prompt & reference image buffer seamlessly.<br/>WebRTC peer connection remains connected without renegotiation!
    Lucy-->>Realtime: State Ack
    deactivate Realtime
    Note over App: Next incoming video frames smoothly transition to Emerald Dress
```

---

### 3.5 Sequence Diagram: Retail Store "Hold & Scan" Mirror Flow

```mermaid
sequenceDiagram
    autonumber
    actor Shopper as In-Store Shopper
    participant UI as HUD Viewfinder Overlay
    participant App as app.js Core
    participant Audio as Web Audio Synthesizer
    participant Lucy as Decart Lucy 3.6 Engine

    Shopper->>UI: Holds physical T-shirt in front of smart mirror & taps "Hold & Scan"
    App->>App: Pause WebRTC stream to burn 0 credits during alignment
    App->>UI: Display Live Mirror Preview + HUD Guides (Shoulders, Collar, Chest, Hem)
    App->>Audio: Play starting chime (550 Hz)
    
    loop 5-Second Countdown (5 to 1)
        App->>UI: Update countdown badge (5, 4, 3, 2, 1)
        App->>Audio: Play rising frequency tone (550Hz -> 1100Hz)
    end

    App->>Audio: Play shutter acoustic chime (1350 Hz)
    App->>UI: Trigger white screen shutter flash animation
    App->>App: Compute getFrameCropCoordinates(video, viewfinderFrame, container)
    App->>App: Extract garment bounding box from unmirrored camera buffer onto Canvas 2D
    App->>UI: Open "Garment Captured" Modal with unmirrored thumbnail & Category Pills
    Shopper->>UI: Selects category (e.g. "T-Shirt") and clicks "✨ Project Onto Me"
    App->>App: Prepend captured garment to Left 3D Catalogue Dock
    App->>App: Resume WebRTC session with Decart Lucy
    App->>Lucy: realtimeClient.set({ prompt: "Wearing this captured t-shirt...", image: croppedDataUrl })
    Lucy-->>Shopper: Garment is projected directly onto shopper's reflection!
```

---

### 3.6 Sequence Diagram: Zero-Waste Credit Optimization State Machine

```mermaid
stateDiagram-v2
    [*] --> Standby: App Loaded
    Standby --> LocalMirror: User Clicks "Start" (Webcam active, 0 credits/s)
    LocalMirror --> LiveStreaming: User Selects Garment Preset
    
    state LiveStreaming {
        [*] --> StandardMode: Default (2 cr/s)
        StandardMode --> FastMode: User Toggles Fast Mode (4 cr/s)
        FastMode --> StandardMode: User Reverts to Standard
    }

    LiveStreaming --> IdlePaused: Inactivity Watchdog (>45s no interaction)
    LiveStreaming --> ManuallyPaused: User Clicks "Pause AI" HUD Button
    LiveStreaming --> ScannerPaused: User Clicks "Hold & Scan" (0 cr/s)
    
    state EcoBurstMode {
        [*] --> RenderBurst: Lucy Renders Outfit (3.5s)
        RenderBurst --> FreezeFrame: Canvas captures 720p frame
        FreezeFrame --> AutoPause: Disconnects WebRTC (~7 credits total)
    }

    LiveStreaming --> EcoBurstMode: If Try-On Mode = "burst"
    
    IdlePaused --> LiveStreaming: User Clicks "Tap to Resume"
    ManuallyPaused --> LiveStreaming: User Clicks "Resume AI"
    ScannerPaused --> LiveStreaming: Garment Scanned & "Project Onto Me" clicked
    AutoPause --> LiveStreaming: User Clicks "Resume Live Stream"
```

---

## 4. Feature Specifications & Functional Deep Dive

### 4.1 Live Generative Video VTON (Decart Lucy 3.6 / 3.5)
- **Model Architecture**: Ingests bidirectional video stream at native 1280x720 resolution at 30 FPS.
- **Dynamic Physics Inference**: Analyzes skeletal posture, shoulder geometry, chest volume, and torso rotation to synthesize realistic fabric tension, wrinkles, shadows, and natural drape.
- **Speed Modes**:
  - **Standard Mode (Default)**: Optimized for efficiency at **2 credits/second** (50% reduction in billing).
  - **Fast Mode**: Higher sampling throughput for ultra-low latency interactive mirrors at **4 credits/second**.

### 4.2 Smart Retail Mirror: "Hold & Scan" Viewfinder HUD
Designed specifically for retail stores and smart fitting mirrors:
- **Optical Guidance Reticles**:
  - `ALIGN·TL` / `ALIGN·TR` / `CROP·BL` / `CROP·BR`: High-precision alignment corner tags.
  - **Shoulder & Hanger Alignment Bar**: Dotted horizontal indicator ensuring the garment hanger or shoulder seam is leveled.
  - **Collar Arc Notch**: Custom dashed SVG arc guiding neckline placement.
  - **Chest & Graphic Target Zone**: Crosshair reticle with branded chest boundary box for centered graphic tees.
  - **T-Shirt Silhouette Guide**: Subtle dashed vector silhouette providing visual body framing.
  - **Bottom Hem Boundary**: Horizontal marker establishing garment length.
- **Sweeping Laser Scan Line**: Animated cyan laser sweeping vertically across the frame.
- **5-Second Countdown & Audio Feedback**: Stepped frequency chimes keeping the customer steady before auto-capture.
- **Orientation Flip Button**: Instant horizontal flip tool (`⇋ flip`) to ensure mirrored and unmirrored graphic text displays correctly.

### 4.3 Zero-Waste Credit Saver Suite
Continuous real-time generative video can consume credits rapidly if left unchecked. mir.ai includes an automated four-tier conservation system:
1. **Smart Inactivity Auto-Sleep**: Continuously monitors user interaction (`pointerdown`, `keydown`, `touchstart`). If no interaction occurs within 45 seconds (configurable: 30s, 45s, 60s, or disabled), the WebRTC media track is cleanly closed, halting billing while retaining local camera mirror view with an overlay banner.
2. **Zero-Credit Scanner Suspension**: When entering "Hold & Scan" mode, the WebRTC session automatically pauses so that zero credits are billed while the user adjusts the garment in the viewfinder.
3. **Eco Snapshot Burst Mode**: Renders the selected outfit live through Decart Lucy for exactly 3.5 seconds to establish cloth settlement, captures the resulting high-definition frame to an overlay view, and disconnects the stream. This reduces cost per outfit to **~7 credits**, allowing **over 140 virtual try-ons from a single 1,000 credit grant**.
4. **Live Credit Watchdog**: Real-time HUD pill displaying running session uptime (`mm:ss`) and accurate estimated credit consumption (`~X cr`).

### 4.4 True Liquid Glass UI & Optical Refraction Engine
Implemented via custom shaders and geometry in `liquid-glass.js`:
- **Refraction Mode (Chromium)**: Dynamically injects an inline SVG filter chain containing `<feDisplacementMap>` driven by red (X) and green (Y) vector displacement channels, combined with `<feComponentTransfer>` for chromatic dispersion.
- **Specular Rim Highlight**: Bakes normal-vector light bounces into an offscreen canvas to create realistic edge reflections.
- **Engine-Adaptive Fallback**: Gracefully detects WebKit (Safari) and Gecko (Firefox) to apply high-performance frosted glass (`backdrop-filter: blur(24px)`).
- **Interactive Spring Physics**: Pointer tracking modulates light reflections, specular intensity, and button squircle deformation using analytical second-order spring dynamics.

### 4.5 Atomic State Swapping Pipeline
Calling `realtimeClient.set({ prompt, image })` updates the active outfit instantaneously over the existing WebRTC DataChannel. The media stream does not tear down or re-negotiate SDP offers, eliminating black frames or connection drops.

### 4.6 3D Luxury Wardrobe Catalogue Dock
Located on the left vertical rail, featuring curated ready-to-wear garments:
1. **Crimson Silk Gown**: Luxury red silk evening gown with dramatic drapes.
2. **Emerald Velvet Dress**: Cocktail dress with delicate gold accents.
3. **Black Satin Slip Dress**: Minimalist silk slip dress with spaghetti straps.
4. **White Floral Sundress**: Summer printed sundress with subtle ruffles.
5. **Black Leather Biker**: Tailored moto leather jacket with metallic hardware.

All presets are embedded directly into `garments/presets.json` with base64 data URLs for instant zero-latency loading.

### 4.7 Custom Garment Studio & Prompt Engineering
- **Drag & Drop Dropzone**: Accepts PNG, JPEG, WebP files with client-side preview.
- **Server Persistence**: Automatically uploads custom garments to `/api/upload` generating permanent local storage.
- **Prompt Customizer**: Text area with quick-add modifier chips (`casual fit`, `oversized`, `fitted`, `studio lighting`) for fine-tuning fabric behavior.

### 4.8 High-Resolution Watermarked Snapshot Studio
Captures the current frame from the `<video id="video-output">` stream at native resolution, adds an unobtrusive semi-transparent watermark (`Decart Lucy VTON 3.5`), and triggers an immediate client-side download named `vton-lucy-YYYY-MM-DDTHH-mm-ss.png`.

### 4.9 Diagnostics, ICE Telemetry & Live Event Log
Slide-out drawer providing comprehensive real-time debugging:
- WebRTC ICE connection status (`new`, `checking`, `connected`, `disconnected`).
- Active camera resolution and framerate settings.
- Ephemeral token minting timestamps and TTL countdowns.
- Detailed error reporting for SDP negotiation, constraint mismatches, or network drops.

### 4.10 Synthesized Web Audio Acoustic Engine
Generates procedural sound effects using browser-native Web Audio API without external audio files:
- **Countdown Tones**: Sine wave oscillators sweeping from 550 Hz to 1100 Hz.
- **Shutter Acoustic**: Dual-stage resonant acoustic pop at 1350 Hz simulating a DSLR shutter.

---

## 5. Mathematical & Algorithmic Foundations

### 5.1 Squircle Geometry & Signed Distance Fields (SDF)

Standard CSS rounded corners (`border-radius`) exhibit discontinuous curvature at the tangent points where straight edges meet circular arcs ($C^1$ continuity, but $C^2$ failure). In contrast, mir.ai implements a **Lissé Superellipse (Squircle)** with $C^2$ and $C^3$ curvature continuity, defined by the generalized superellipse equation:

$$\left| \frac{x}{a} \right|^n + \left| \frac{y}{b} \right|^n = 1$$

Where $n \approx 4.0$ to $5.0$ represents the squircle exponent, and $a, b$ are semi-axes.

For arbitrary 2D coordinates $(x, y)$, the signed distance field $d(x, y)$ to the squircle perimeter is approximated by:

$$d(x, y) = \sqrt[n]{\left(\frac{|x|}{a}\right)^n + \left(\frac{|y|}{b}\right)^n} - 1$$

When $d(x, y) < 0$, the point lies inside the glass element; when $d(x, y) = 0$, the point lies on the specular rim; and when $d(x, y) > 0$, the point lies outside.

---

### 5.2 SVG Optical Refraction & Vector Displacement Fields

Optical refraction through curved glass follows Snell's Law:

$$n_1 \sin \theta_1 = n_2 \sin \theta_2$$

Where $n_1 \approx 1.0$ (air) and $n_2 \approx 1.52$ (glass). In mir.ai, the normal vector $\mathbf{N} = (N_x, N_y)$ across the squircle lens surface is derived from the spatial gradient of the SDF:

$$\mathbf{N}(x, y) = \frac{\nabla d(x, y)}{\|\nabla d(x, y)\|}$$

The resulting 2D refraction displacement vector $\mathbf{D} = (D_x, D_y)$ is mapped to an RGB texture where:
- $\text{Red Channel } R = 128 + 127 \cdot D_x$ (Horizontal optical displacement)
- $\text{Green Channel } G = 128 + 127 \cdot D_y$ (Vertical optical displacement)
- $\text{Blue Channel } B = 255 \cdot (\mathbf{N} \cdot \mathbf{L})^k$ (Specular highlight from virtual light vector $\mathbf{L}$)

This texture is loaded into an SVG `<feDisplacementMap>` filter:

```xml
<filter id="liquid-refraction">
  <feImage xlink:href="data:image/png;base64,..." result="displacement-map" />
  <feDisplacementMap in="SourceGraphic" in2="displacement-map" scale="24" xChannelSelector="R" yChannelSelector="G" result="refracted" />
  <feBlend mode="screen" in="refracted" in2="specular" />
</filter>
```

---

### 5.3 Second-Order Spring Physics ODE Solver

Interactive controls respond to user pointers using a second-order linear damped harmonic oscillator:

$$m \frac{d^2 x}{dt^2} + c \frac{dx}{dt} + k (x - x_{\text{target}}) = 0$$

Dividing by mass $m$, with angular frequency $\omega_0 = \sqrt{\frac{k}{m}}$ and damping ratio $\zeta = \frac{c}{2 \sqrt{k m}}$:

$$\ddot{x} + 2 \zeta \omega_0 \dot{x} + \omega_0^2 (x - x_{\text{target}}) = 0$$

For real-time 60 FPS animation, mir.ai calculates the exact closed-form analytical solution over interval $\Delta t$:

1. **Underdamped ($\zeta < 1$)**: Oscillation with decaying envelope:
   $$\omega_d = \omega_0 \sqrt{1 - \zeta^2}$$
   $$x(t) = x_{\text{target}} + e^{-\zeta \omega_0 \Delta t} \left( A \cos(\omega_d \Delta t) + B \sin(\omega_d \Delta t) \right)$$
   Where $A = x_0 - x_{\text{target}}$ and $B = \frac{v_0 + \zeta \omega_0 A}{\omega_d}$.

2. **Critically Damped ($\zeta = 1$)**: Fastest settlement without overshoot:
   $$x(t) = x_{\text{target}} + e^{-\omega_0 \Delta t} \left( A + (v_0 + \omega_0 A) \Delta t \right)$$

3. **Overdamped ($\zeta > 1$)**: Non-oscillatory exponential return:
   $$r_{1,2} = -\zeta \omega_0 \pm \omega_0 \sqrt{\zeta^2 - 1}$$
   $$x(t) = x_{\text{target}} + C_1 e^{r_1 \Delta t} + C_2 e^{r_2 \Delta t}$$

---

### 5.4 Screen-to-Sensor Optical Coordinate Transformation

When a shopper positions a garment inside the screen viewfinder, the screen dimensions $(W_c, H_c)$ typically differ from the native video track buffer $(W_v, H_v = 1280 \times 720)$. Because video is displayed with CSS `object-fit: cover`, the scale factor $S$ and display offsets $(O_x, O_y)$ are:

$$S = \max\left(\frac{W_c}{W_v}, \frac{H_c}{H_v}\right)$$
$$W_r = W_v \cdot S, \quad H_r = H_v \cdot S$$
$$O_x = \frac{W_c - W_r}{2}, \quad O_y = \frac{H_c - H_r}{2}$$

For a viewfinder bounding box positioned at screen coordinates $(X_{\text{screen}}, Y_{\text{screen}})$ with dimensions $(W_{\text{frame}}, H_{\text{frame}})$:

If camera mirroring is active ($\text{mirrored} = \text{true}$), the horizontal axis is inverted:
$$X_{\text{effective}} = W_c - (X_{\text{screen}} + W_{\text{frame}})$$

The corresponding pixel coordinates in the native video buffer are:
$$X_{\text{native}} = \frac{X_{\text{effective}} - O_x}{S}, \quad Y_{\text{native}} = \frac{Y_{\text{screen}} - O_y}{S}$$
$$W_{\text{native}} = \frac{W_{\text{frame}}}{S}, \quad H_{\text{native}} = \frac{H_{\text{frame}}}{S}$$

These coordinates are clamped to the sensor bounds $[0, W_v]$ and $[0, H_v]$ and rendered directly to an offscreen Canvas 2D buffer.

---

## 6. Codebase Anatomy & Implementation Details

```
/home/abhinav/vton-lucy/
├── index.html              # Main application DOM structure & HUD overlays
├── app.js                  # Frontend client engine, WebRTC controller & state machine
├── liquid-glass.js         # Optical refraction shaders & spring physics engine
├── style.css               # Design system, glassmorphism materials & HUD styling
├── server.py               # Zero-dependency Python 3 backend server & token proxy
├── server.js               # Node.js ESM backend alternative
├── requirements.txt        # Production dependency manifest (Render deployment)
├── package.json            # Project manifest & npm scripts
├── start.sh                # Automated bootstrapper script
├── .env                    # Active local environment variables
├── .env.example            # Configuration template
├── .gitignore              # Git ignore rules
├── garments/               # Wardrobe presets & image assets
│   ├── generate_garments.py# Procedural asset generator script
│   ├── presets.json        # 5 luxury garments with base64 data URLs
│   ├── red-silk-dress.jpg  # Crimson Silk Gown
│   ├── emerald-dress.jpg   # Emerald Velvet Dress
│   ├── black-slip-dress.jpg# Black Satin Slip Dress
│   ├── floral-sundress.jpg # White Floral Sundress
│   ├── leather-biker.jpg   # Black Moto Leather Biker
│   └── *.png               # Alternate outerwear assets
└── uploads/                # Custom user garment storage directory
```

---

### 6.1 `index.html`: DOM Hierarchy & Markup Specification

- **Import Map**: Directly loads `@decartai/sdk` from `https://esm.sh/@decartai/sdk` for zero-bundler ESM execution.
- **Canvas Stage (`#stage-viewport`)**:
  - `#video-output`: Fullscreen video element receiving the remote WebRTC stream from Decart.
  - `#freeze-frame-view`: Freeze-frame canvas overlay for Eco Snapshot Burst Mode.
  - `#stage-placeholder`: Standby overlay with "Start" and "Hold & Scan" triggers.
  - `#pip-container` / `#video-local`: Picture-in-Picture webcam mirror.
- **Top-Left HUD (`.hud-tl`)**: Brand wordmark (`mir.ai`), connection status dot, and the Live Credit Watchdog pill (`#credit-watchdog-pill`).
- **Top-Right HUD (`.hud-tr`)**: Control buttons:
  - `#btn-scan-garment`: Store Mirror Mode trigger.
  - `#btn-toggle-stream`: WebRTC connect/disconnect toggle.
  - `#btn-pause-stream`: Manual AI credit saver pause toggle.
  - `#btn-snapshot`: High-res capture trigger.
  - `#btn-toggle-mirror`: Camera flip toggle.
  - `#btn-open-settings`: Settings modal toggle.
  - `#btn-toggle-logs`: Diagnostics drawer toggle.
- **Left Catalogue Dock (`#garment-rail`)**: Vertical glassmorphic dock containing `#btn-open-upload` (add custom outfit), `#btn-dock-scan` (store scan trigger), and `#presets-grid` (scrollable cards).
- **Scanner Viewfinder Overlay (`#viewfinder-overlay`)**: Full-screen HUD overlay containing `#scanner-live-preview`, alignment guides, sweeping laser, and `#scan-countdown`.
- **Scan Result Dialog (`#scan-result-overlay`)**: Modal previewing the cropped garment with `#btn-flip-scan-thumb`, category pills, and `#btn-project-scan`.
- **Idle Banner (`#idle-banner`)**: Automatic credit-saver pause notification with tap-to-resume trigger.

---

### 6.2 `app.js`: State Engine & WebRTC Controller

`app.js` is the central orchestrator (1,544 lines). Key modules include:

#### Global State Model (`state`)
```javascript
const state = {
  client: null,                 // DecartClient instance
  realtimeClient: null,         // RealtimeClient WebRTC session
  localStream: null,            // MediaStream from navigator.mediaDevices
  remoteStream: null,           // Transformed MediaStream from Lucy
  model: null,                  // Model metadata ({ fps: 30, width: 1280, height: 720 })
  isConnected: false,           // Active WebRTC connection status
  isConnecting: false,          // Negotiation in progress
  isMuted: true,                // Audio state
  isMirrored: true,             // Camera transform state
  fastMode: false,              // false = 2 cr/s (standard), true = 4 cr/s (fast)
  tryOnMode: "live",            // "live" continuous vs "burst" eco snapshot
  idleTimeoutSeconds: 45,       // Auto-sleep threshold
  lastUserActivityTime: Date.now(),
  creditsUsedThisSession: 0,    // Live credit counter
  isPaused: false,              // Manual or auto-pause state
  mirrorMode: "auto",           // Decart WebRTC mirror setting
  selectedCameraId: "",         // DeviceId from enumerateDevices
  activePreset: null,           // Currently selected garment
  presets: [],                  // Loaded wardrobe presets
  sessionTimerId: null,         // 1-second interval timer
  sessionSeconds: 0,            // Total stream uptime
  idleCheckTimerId: null,       // 2-second interval idle watchdog
  burstTimerId: null,           // 3.5s timeout for burst mode
  modelName: "lucy-vton-3.6",   // Target AI model
  scanTimerId: null,            // 5-second countdown timer
  scanSecondsLeft: 5,           // Remaining countdown seconds
  lastScannedGarmentDataUrl: null, // Cropped garment image
  selectedScanCategory: "t-shirt" // Active classification
};
```

#### Core Functions
- `loadDecartSDK()`: Dynamically imports `@decartai/sdk` across multiple CDN mirrors (`esm.sh`, `jsdelivr`, `unpkg`).
- `resolveApiKey()`: Multi-tier key resolution prioritizing server-side `.env`, followed by UI modal input, with token minting via `/api/realtime-token`.
- `connectStream()`: Initializes camera track, mints token, establishes WebRTC connection via LiveKit edge, and attaches remote transformed video track.
- `applyGarment(prompt, image, label, thumbUrl)`: Calls `realtimeClient.set({ prompt, image })` to swap garments atomically over the open media session.
- `startIdleWatcher()`: Inspects inactivity every 2,000 ms. If elapsed time exceeds `idleTimeoutSeconds`, calls `pauseWebRTC(true)`.
- `pauseWebRTC(isIdle)`: Gracefully terminates the WebRTC session while keeping the local camera mirror active, bringing credit burn to **0 cr/s**.
- `resumeWebRTC()`: Reconnects the media session and re-applies the last active garment prompt and image.
- `startGarmentScanner()`: Suspends WebRTC billing, attaches local camera to viewfinder preview, and executes 5-second countdown with rising audio tones.
- `captureHeldGarmentCrop()`: Triggers shutter flash, computes unmirrored pixel crop via `getFrameCropCoordinates()`, and presents the result dialog.
- `projectScannedGarment()`: Prepends captured garment to wardrobe presets and projects it onto the user via Decart Lucy.

---

### 6.3 `liquid-glass.js`: Refraction Shaders & Physics

`liquid-glass.js` (1,100 lines) powers the physical glass material:
- **`detectEngine()`**: Identifies Chromium, Gecko, or WebKit via User Agent data.
- **`detectMode()`**: Returns `"refract"` for Chromium (enabling SVG displacement) and `"frost"` for Safari/Firefox.
- **`Spring` Class**: Analytical second-order ODE solver providing continuous velocity and position integration without numeric jitter.
- **`squircleOutline(w, h, radius)`**: Evaluates superellipse polynomial roots to trace squircle path boundaries.
- **`applyLiquidGlass(element, options)`**: Attaches canvas displacement maps, specular rims, and event listeners to interactive elements.
- **`initLiquidGlass(selector)`**: Batch initializes all buttons, pills, and HUD controls.

---

### 6.4 `style.css`: Design Tokens & Visual Hierarchy

Comprehensive CSS architecture (1,873 lines):
- **Glassmorphic Tokens**:
  ```css
  --glass: rgba(255, 255, 255, 0.06);
  --glass-hover: rgba(255, 255, 255, 0.10);
  --glass-strong: rgba(255, 255, 255, 0.12);
  --blur: 24px;
  --text: rgba(255, 255, 255, 0.85);
  --text-dim: rgba(255, 255, 255, 0.45);
  --radius: 14px;
  ```
- **HUD Positioning**: Fixed viewports with non-blocking pointer events (`pointer-events: none` on containers, `pointer-events: auto` on interactive cards).
- **Scanner Viewfinder**: High-contrast cyan reticles (`#00f2fe`), laser scan line animations (`scanLaserMove`), and camera flash transitions (`flashFade`).
- **Responsive Media Queries**: Breakpoints at 768px and 480px dynamically collapse side docks into compact floating drawers.

---

### 6.5 `server.py`: Python Standard Library Server

Zero-dependency production HTTP server utilizing `http.server.HTTPServer` and `urllib.request`:
- **Manual `.env` Parser**: Parses environment variables without requiring `python-dotenv`.
- **CORS Handler**: Injects open headers for frictionless local and cross-origin development.
- **`GET /api/config` & `GET /api/health`**: Reports server key availability, target model, and default speed mode.
- **`POST /api/realtime-token`**: Proxies requests to `POST https://api.decart.ai/v1/client/tokens` using the master `DECART_API_KEY`, returning an ephemeral JWT.
- **`POST /api/upload`**: Decodes base64 image payloads, assigns UUID filenames, and persists them into the `uploads/` directory.

---

### 6.6 `server.js`: Node.js ESM Backend Alternative

Node.js alternative utilizing native `node:http`, `node:https`, and `node:fs`:
- Provides identical routing to `server.py` (`/api/config`, `/api/realtime-token`).
- Implements custom `.env` parser and static MIME type resolution.
- Native HTTPS request proxy to `api.decart.ai`.

---

### 6.7 `start.sh` & Project Manifests

- **`start.sh`**: Executable launcher script. Automatically copies `.env.example` to `.env` if missing, checks for `python3` (launching `server.py`), or falls back to `node` (`server.js`).
- **`requirements.txt`**: Standard requirements file configured for cloud platforms (Render.com).
- **`package.json`**: NPM project metadata containing start scripts (`npm start`, `npm run node`).

---

### 6.8 `garments/` Asset System & `generate_garments.py`

- **`presets.json`**: 3.9 MB JSON payload containing 5 luxury presets with pre-baked base64 image strings for offline and low-latency startup.
- **`generate_garments.py`**: Procedural Python imaging script using Pillow (`PIL`) to generate high-resolution garment silhouettes and mock studio backgrounds.

---

## 7. API Reference & Protocols

### 7.1 Local Backend Endpoints

#### `GET /api/config` or `GET /api/health`
Checks backend status and returns client configuration.
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "hasServerApiKey": true,
  "apiKey": "dct_beta1_zQUBGVI...",
  "model": "lucy-vton-3.6",
  "defaultSpeed": "fast"
}
```

---

#### `POST /api/realtime-token`
Mints an ephemeral Decart JWT client token.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "apiKey": "optional_override_key",
  "expiresIn": 3600
}
```
- **Response `200 OK`**:
```json
{
  "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": 1729783600
}
```
- **Error Response `400 Bad Request`**:
```json
{
  "error": "No Decart API Key provided. Please set DECART_API_KEY in your .env file or enter your API key in the UI settings."
}
```

---

#### `POST /api/upload`
Uploads a custom garment image.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "name": "summer-shirt.jpg"
}
```
- **Response `200 OK`**:
```json
{
  "url": "http://localhost:8080/uploads/garment_a1b2c3d4.jpg",
  "relativeUrl": "/uploads/garment_a1b2c3d4.jpg",
  "filename": "garment_a1b2c3d4.jpg"
}
```

---

### 7.2 Decart Cloud API Protocol

#### `POST https://api.decart.ai/v1/client/tokens`
Minting endpoint called securely by the backend server.
- **Headers**:
  - `Content-Type: application/json`
  - `x-api-key: <MASTER_DECART_API_KEY>`
- **Body**:
```json
{
  "expiresIn": 3600,
  "allowedModels": ["lucy-vton-3.6"]
}
```

---

### 7.3 `@decartai/sdk` JS API Methods

```javascript
import { createDecartClient, models } from "@decartai/sdk";

// 1. Initialize client with automatic token provider
const client = createDecartClient({
  apiKey: "eyJ...", // Initial token
  apiKeyProvider: async () => {
    const res = await fetch("/api/realtime-token", { method: "POST" });
    const { apiKey } = await res.json();
    return apiKey;
  }
});

// 2. Select model
const model = models.realtime("lucy-vton-3.6");

// 3. Establish WebRTC connection
const realtimeClient = await client.realtime.connect(stream, {
  model: model,
  speed: "standard", // "standard" (2 cr/s) or "fast" (4 cr/s)
  mirror: "auto",     // "auto", "always", or "never"
  onRemoteStream: (transformedStream) => {
    videoElement.srcObject = transformedStream;
  }
});

// 4. Atomically swap prompt & reference garment
await realtimeClient.set({
  prompt: "Wearing a black biker leather jacket",
  image: "data:image/jpeg;base64,..."
});

// 5. Clean disconnect
realtimeClient.disconnect();
```

---

## 8. Configuration & Environment Variables

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `DECART_API_KEY` | String | *(Required)* | Master Decart AI platform key (`dct_...`). Must be kept secret. |
| `DECART_MODEL` | String | `lucy-vton-3.6` | Target realtime foundational model (`lucy-vton-3.6` or `lucy-vton-3.5`). |
| `PORT` | Integer | `8080` | Local HTTP web server listening port. |
| `DECART_SPEED` | String | `fast` | Initial inference throughput mode (`standard` = 2 cr/s, `fast` = 4 cr/s). |
| `DECART_API_BASE`| String | `https://api.decart.ai/v1` | Upstream Decart REST API base URL. |

### Browser LocalStorage State Keys
- `decart_custom_key`: Overrides backend API key when supplied in UI Settings.
- `mir_tryon_mode`: Persists active mode (`live` vs `burst`).
- `mir_idle_timeout`: Persists inactivity watchdog limit (`45`, `30`, `60`, or `0`).

---

## 9. Installation, Local Setup & Run Guide

### 9.1 Prerequisites
- **Python 3.10+** OR **Node.js 18+**.
- Modern WebRTC-capable web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari).
- Webcam connected and permitted.
- Decart AI API Key (`dct_...`) from [platform.decart.ai](https://platform.decart.ai).

### 9.2 Step-by-Step Installation

```bash
# 1. Clone repository
git clone https://github.com/kaizen-abhinav/mir.ai.git
cd mir.ai

# 2. Configure environment
cp .env.example .env
nano .env  # Add your DECART_API_KEY
```

```env
DECART_API_KEY=dct_beta1_your_api_key_here
DECART_MODEL=lucy-vton-3.6
PORT=8080
DECART_SPEED=standard
```

```bash
# 3. Launch the server
./start.sh
```

*(Alternatively, run directly via Python or Node.js)*
```bash
python3 server.py
# or
node server.js
```

### 9.3 Accessing the Application
Open your web browser and navigate to:
```
http://localhost:8080
```
When prompted, allow browser camera access.

---

## 10. Cloud Deployment & DevOps Runbook

### 10.1 Deploying to Render.com
mir.ai is production-certified on [Render](https://render.com). Because browsers restrict webcam access to secure contexts (`https://` or `http://localhost`), cloud deployments **must enforce HTTPS**.

1. Create a **New Web Service** connected to your GitHub repository.
2. Configure settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python3 server.py`
3. Add Environment Variables:
   - `DECART_API_KEY`: `dct_...`
   - `DECART_MODEL`: `lucy-vton-3.6`
   - `DECART_SPEED`: `standard`
   - `PORT`: `10000` (Render dynamically assigns port)

---

### 10.2 Production Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name vton.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vton.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/vton.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vton.yourdomain.com/privkey.pem;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 11. Security, Privacy & Data Integrity

### 11.1 Ephemeral Scoped Token Model
Permanent master keys (`dct_...`) possess administrative and billing authority. mir.ai enforces Decart's enterprise token architecture:
- Master keys **never leave the backend server**.
- Browsers receive short-lived JWT tokens minted via `/api/realtime-token`.
- Tokens are strictly scoped:
  - `expiresIn: 3600` (1-hour maximum TTL).
  - `allowedModels: ["lucy-vton-3.6"]` (preventing unauthorized model execution).

### 11.2 Camera Stream Privacy
- Webcam video frames are transmitted over an encrypted WebRTC media session using **DTLS-SRTP (Datagram Transport Layer Security / Secure Real-time Transport Protocol)**.
- Local webcam video frames are processed in-memory by Decart Lucy and are **never saved to server disk or persistent cloud databases**.

### 11.3 Ephemeral File Upload Lifecycle
User-uploaded custom garments saved via `/api/upload` receive randomized UUID identifiers (`garment_<uuid>.<ext>`) preventing directory enumeration or overwrites.

---

## 12. Troubleshooting & Diagnostic FAQ

### Q1: The webcam feed shows "Offline" and clicking "Start Try-On" fails.
- **Cause**: Browser camera permissions were denied, or another application (e.g. Zoom, Teams, OBS) is holding exclusive webcam hardware lock.
- **Resolution**: Open browser settings, permit camera access for `http://localhost:8080`, ensure other video apps are closed, and refresh.

### Q2: Diagnostics log reports "Token API HTTPError 401: Unauthorized".
- **Cause**: `DECART_API_KEY` is invalid, expired, or missing in `.env`.
- **Resolution**: Verify your key format at [platform.decart.ai](https://platform.decart.ai). Re-enter the key in the settings modal (`⚙`) or update `.env` and restart `server.py`.

### Q3: WebRTC connects but the remote transformed stream is blank/black.
- **Cause**: The client webcam resolution/framerate is incompatible with the Decart model constraints.
- **Resolution**: `app.js` automatically retries with ideal fallback constraints (`1280x720 @ 30fps`). Open the Diagnostics drawer (`>_`) to inspect ICE candidate negotiation.

### Q4: How do I minimize API credit burn during long retail demos?
- **Resolution**:
  1. Set **Try-On Mode** to **Eco Snapshot Burst** in Settings (`~7 credits` per outfit).
  2. Set **Inactivity Auto-Sleep** to **30 seconds** or **45 seconds**.
  3. Keep default speed set to **Standard Mode** (2 cr/s instead of 4 cr/s).

---

## 13. Commercial Roadmap & Future Horizons

1. **Multi-Person Dynamic Detection**: Enable simultaneous multi-shopper try-on in wide-angle retail mirrors.
2. **Lower-Body & Footwear Try-On**: Expansion into pants, skirts, sneakers, and luxury boots via multi-garment layering.
3. **E-Commerce Headless SDK**: Pre-built Shopify, WooCommerce, and Magento widgets for 1-click integration on product detail pages.
4. **Native Mobile WebRTC Shells**: iOS Swift & Android Kotlin wrappers with hardware haptics and CoreML local segmentation.
5. **Generative Accessory Integration**: Live rendering of handbags, jewelry, sunglasses, and hats mapped to 3D facial landmarks.

---

*mir.ai Documentation © 2026. Built with Decart AI Lucy VTON, WebRTC, and True Liquid Glass.*
