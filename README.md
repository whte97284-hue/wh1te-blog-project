# PROJECT MAGI: PERFORMANCE OPTIMIZATION REPORT
> **SYSTEM STATUS**: GREEN  
> **SYNC RATIO**: 400% (VS INITIAL STATE)  
> **ARCHIVE DATE**: 2026.01.05

---

## 0x00. EXECUTIVE SUMMARY (执行摘要)

此文档记录了 **Project Wh1te Blog** (代号: MAGI) 的前端性能重构与极限优化历程。

面对 **4K HiDPI 环境**、**混合渲染管线 (Canvas + CSS)** 以及 **多设备异构算力** 的挑战，本项目摒弃了传统的通用图形库 (Three.js/Pixi.js) 方案，自主构建了一套**轻量级、多线程、自适应**的微型渲染引擎。

**最终成果**：
- **CPU 负载**：在空闲状态下接近 **0%** (智能休眠)。
- **GPU 负载**：4K 全屏渲染下降低 **75%** 以上。
- **渲染帧率**：低功耗设备从 **15 FPS** 提升至 **60 FPS** (配合硬件加速)。
- **核心体积**：原生 JS 实现，无第三方重型依赖。

---

## 0x01. CORE ARCHITECTURE (核心架构)

### 1.1 THREAD ISOLATION (线程隔离)
即便是现代浏览器，主线程 (Main Thread) 依然不堪重负（DOM操作、JS逻辑、事件监听）。为了保证视觉特效的绝对流畅，我们将计算密集型任务剥离。

*   **Implementation**: 
    - 使用 **Web Worker** 承载 `Matrix Rain` (代码雨) 运算逻辑。
    - 利用 `OffscreenCanvas` API 将 Canvas 控制权移交至 Worker 线程。
    - 主线程仅负责 DOM 交互与状态同步，**UI 卡顿不再影响背景动画**。

### 1.2 RENDER CORE (调度核心)
摒弃散乱的 `setInterval` 或 `requestAnimationFrame`，构建统一的 `GlobalRender` 调度器。

*   **FPS Limiter (帧率锁)**: 
    - 物理锁定 **30 FPS** 用于背景动画。对于代码雨这种风格化特效，30帧与60帧视觉差异极小，但能节省 **50%** 的 GPU 算力。
*   **Visibility Awareness (感知休眠)**:
    - 监听 `visibilitychange` 事件。当用户切换标签页时，渲染引擎 **完全停机 (Zero-Cycle)**，不消耗用户以毫安时计算的电量。

---

## 0x02. OPTIMIZATION PROTOCOLS (优化协议)

### 2.1 PROTOCOL: DPR-CLAMPING (分辨率钳制)
**[CRITICAL SUCCESS FACTOR]**

这是本次优化的决胜点。在 HiDPI (Retina/4K) 屏幕上，传统的 `window.devicePixelRatio` 乘法策略会导致渲染像素量呈指数级爆炸。

*   **Problem**: 
    - 4K Screen @ 200% Scaling = 3840x2160 逻辑分辨率。
    - Native Canvas Render = **8,294,400 pixels per frame**.
    - 导致显存带宽 (Memory Bandwidth) 和光栅化 (Rasterization) 瓶颈。

*   **Solution**:
    - 实施 **DPR Clamping** 策略。
    - `Matrix Rain`: 强制 `dpr = 1.0` (物理像素渲染，复古 CRT 质感)。
    - `LCL Fluid`: 强制 `dpr <= 1.5` (平衡清晰度与性能)。
    - **Result**: 渲染压力降低 **75%-90%**，从此 4K 屏不再是性能黑洞。

### 2.2 PROTOCOL: CSS COMPOSITING (合成层优化)
针对 CSS 视觉特效 (`mix-blend-mode`, `backdrop-filter`) 对集成显卡 (iGPU) 的毁灭性打击进行防御。

*   **Tactics**:
    - 精简 DOM 节点数量 (粒子系统从 150 降级适配)。
    - 移除不必要的 `box-shadow` 和全屏滤镜，减少 GPU 合成阶段的重绘 (Repaint)。

### 2.3 PROTOCOL: SEARCH ENGINE UPGRADE (检索引擎升级)
为了在无后端数据库支持的情况下实现毫秒级搜索：

*   **Integration**: 引入 **Fuse.js** 模糊搜索引擎。
*   **Features**: 
    - 支持 Fuzzy Matching (拼写错误容错)。
    - 权重排序 (标题 > 摘要 > 标签)。
    - 纯前端索引，零网络延迟。

---

## 0x03. DEBUGGING LOGS (排查日志)

### INCIDENT: THE "4060Ti" ANOMALY
> **现象**: 在一台配置为 RTX 4060Ti 的高配笔记本上，网页帧率仅为 15 FPS，且 GPU 占用极低。

**Analysis Process**:
1.  **Stage 1 - Canvas**: 怀疑 Canvas 分辨率过高 -> 实施 DPR 优化 -> **无效**。
2.  **Stage 2 - DOM/CSS**: 暴力移除所有 DOM 元素和 CSS 特效 -> **无效**。
3.  **Stage 3 - Event Loop**: 停止所有 JS 动画循环 -> **无效**。
4.  **Final Diagnosis**: 
    - 排查发现该浏览器在某些极端情况下 (或人为设置) 关闭了 **Hardware Acceleration (硬件加速)**。
    - 导致所有 WebGL/Canvas 计算回落至 CPU 软件模拟渲染。
    - **CPU Load**: 88% (All Cores Active).
    - **GPU Load**: ~0%.

**Conclusion**: 
前端优化的边界在于用户的环境配置。尽管如此，我们的架构通过 **Worker 隔离** 和 **DPR 降级**，最大限度地减轻了 CPU 软渲染的压力，保证了在极端环境下的基本可用性。

---

## 0x04. TECHNICAL STACK (技术栈)

*   **Core**: Vanilla JavaScript (ES6+)
*   **Renderer**: Custom WebGL/Canvas2D Engine
*   **Styling**: Tailwind CSS + Custom Brutalist Design
*   **Search**: Fuse.js
*   **Worker**: Web Worker API + OffscreenCanvas
*   **Backend**: WordPress REST API (Proxied via Cloudflare Workers)

---

> "Man fears the darkness, and so he scrapes away at the edges of it with fire."  
> —— **Project MAGI**, Optimization Complete.
