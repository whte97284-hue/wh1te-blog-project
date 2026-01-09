# PROJECT MAGI: 终极架构与技术白皮书
> **Project Code**: MAGI (Multi-Agent Generic Intelligence)  
> **Version**: V3.0 (Final Release)  
> **Date**: 2026-01-09  
> **Architect**: Wh1te

---

## 0x00. 项目愿景与设计哲学

本项目不仅仅是一个个人博客，而是一次将 **"二次元美学"** 与 **"硬核前端技术"** 完美融合的实验。旨在打造一个**"活着的"**、具有**"战术指挥中心"**沉浸感的虚拟终端，而非传统的静态网页。

**核心设计支柱：**
1.  **Immersion (沉浸感)**: 忠实还原 《EVA》 的 MAGI 系统与战术 UI 风格，配合《路人女主》英梨梨的人格化交互。
2.  **Performance (极致性能)**: 在 Web 端实现原生应用级的流畅度，针对 4K 高分屏和低端移动设备进行两极优化。
3.  **Headless (无头架构)**: 前端纯静态 (Static)，内容由 WordPress 提供，社交数据由 Cloudflare Workers 实时聚合。

---

## 0x01. 系统目录结构详解

```bash
wh1te-boke/
├── index.html              # [战术终端] 主入口，包含 Canvas 层、UI 层、HUD 层
├── reader.html             # [沉浸阅读] 专为长文阅读设计的排版，去除干扰元素
├── main.js                 # [神经中枢] 180KB+ 核心逻辑，包含所有引擎与管理器
├── style.css               # [视觉系统] 70KB+ 样式，包含 EVA 主题变量与 CSS 动画
├── matrix-worker.js        # [后台计算] 独立线程运行代码雨渲染，主线程 0 阻塞
├── tailwind.config.js      # [原子样式] 自定义 EVA 色板与动画配置
├── cloudflare workers.js   # [中间件] 部署于 Edge 的 API 聚合与代理服务
│
├── managers/               # [模块化管理器] 按需加载的业务逻辑
│   ├── bili-manager.js     # B站追番数据渲染 (Cover Proxy + 状态过滤)
│   ├── steam-manager.js    # Steam 游戏统计 (计算吃灰率、游戏时长)
│   ├── pixiv-manager.js    # Pixiv 日榜展示 (多级代理穿透 + R18过滤)
│   ├── helix-manager.js    # 3D DNA 螺旋可视化 (关于页面的 Canvas 3D 引擎)
│   └── eriri-lines-manager.js # 英梨梨人格台词管理系统
│
└── data/
    └── eriri-lines.json    # [人格数据库] 250+ 句台词，定义了 AI 的性格
```

---

## 0x02. 核心技术引擎 (Core Engines)

### 1. MAGI RenderCore (渲染调度核心)
**位置**: `main.js` (Class `RenderCore`)
传统的 `requestAnimationFrame` 容易导致高刷屏电量崩耗。RenderCore 接管了所有 Canvas 动画：
*   **帧率锁定 (FPS Limiting)**: 强制将背景动画锁定在 30 FPS（视觉流畅的下限），节省 50% GPU 算力。
*   **智能休眠 (Smart Sleep)**: 监听 `visibilitychange`，当标签页不可见时，**完全停止**渲染循环（Zero Cycle），唤醒时无缝恢复。
*   **统一时钟 (Global Ticker)**: 所有子系统（Matrix, LCL, HUD）通过 `RenderCore.add()` 注册，统一调度，杜绝多个 `rAF` 循环竞争资源。

### 2. ViewCommander (战术路由系统)
**位置**: `main.js` (Function `ViewCommander`)
实现单页应用 (SPA) 的无刷新体验：
*   **Hash-Based Routing**: 监听 URL Hash 变化 (#blog, #anime, #steam)，驱动视图切换。
*   **Lazy Loading (战术懒加载)**: 只有当用户进入特定视图时（如点击 Steam），才动态加载对应的 `Manager` 脚本和数据，首屏体积最小化。
*   **State Persistence**: 自动记忆用户离开时的视图状态。

### 3. MusicCore (音频可视化引擎)
**位置**: `main.js` (Object `MusicCore`)
不仅仅是播放器，而是基于 Web Audio API 的实时分析系统：
*   **AnalyserNode**: 实时提取音频频域数据 (FFT Size 256)。
*   **Sonic Wave**: 将频率数据映射为 Canvas 上的动态波形，波幅随低音 (Bass) 震动。
*   **Context Recognition**: 播放特定歌曲（如 "One Last Kiss"）时，触发英梨梨的专属吐槽（读取 ID3 或文件名）。

---

## 0x03. 视觉特效与动画 (Visual Effects)

### 1. Matrix Rain V2.0 (多线程代码雨)
**技术**: `OffscreenCanvas` + `Web Worker`
*   **主线程解放**: 将极其消耗 CPU 的字符绘制移至 `matrix-worker.js`，UI 交互（滚动、点击）丝滑流畅，不受背景动画影响。
*   **DPR Clamping**: 在 4K 屏上强制降级 DPR 为 0.7-1.0，避免 Canvas 分辨率达到 8K 级别导致的显存爆炸。
*   **Fallback机制**: 针对不支持 OffscreenCanvas 的旧浏览器，自动回退到主线程渲染。

### 2. LCL Fluid Simulation (LCL 流体)
**技术**: Canvas 2D + 粒子物理
*   **模拟原理**: 模拟 EVA 中的 LCL 液体气泡。每个粒子拥有浮力、阻力和随机扰动。
*   **交互性**: 鼠标移动会产生斥力场，推开周围的气泡。
*   **混合模式**: 使用 `globalCompositeOperation = 'lighter'` 实现液体的通透发光感。

### 3. Tactical UI System (战术界面系统)
*   **Glitch Text (故障解码)**: 鼠标悬停时，文字从随机字符（如 `^&*%`）逐帧解码为真实文本 (`Linear -> Ease-out`)。
*   **Holographic Cards (全息卡片)**: 仅在 PC 端启用。监听 `mousemove`，计算鼠标相对于卡片中心的坐标，应用 CSS `perspective` 和 `rotate3d`，产生 3D 视差与光泽流转效果。
*   **Cursor System (反转光标)**: 双层光标设计。底层是十字准星，顶层是跟随圆环。点击时会有缩放和涟漪动画，进入链接时触发 "Lock-on" 锁定态。

### 4. Sonic Wave (声纹可视化 V2.0)
**技术**: Canvas 2D + State Machine
*   **状态机驱动**: 波形不仅仅是音频的反馈，更是 AI 的情绪表达。
    *   `Thinking`: 高频快闪震动，模拟思考时的运算噪音。
    *   `Speaking`: 幅度随音频输入动态变化，叠加双重正弦波 (`sin(x) + sin(2x)`) 增加生物感。
    *   `Hover`: 接触时波幅增大，频率降低，表现出"关注"。
*   **配色联动**: 实时读取 CSS 变量 (`--secondary-color`)，随 EVA 主题切换波形颜色。

### 5. MAGI Dialectic Animation (三贤人辩证)
**技术**: High-Frequency Polling
*   **辩证法逻辑**: 完美复刻剧场版中的 "提题 (Thesis)" -> "反提题 (Antithesis)" -> "综合 (Synthesis)" 决策流。
*   **极速轮询**: 以 90ms 为周期的轮询高亮，配合随机显示的 "CODE:XXX" 和汉字状态，制造高强度的计算压迫感。

---

## 0x04. 人格化交互系统 (Character Interaction)

### Eriri Personality Core (英梨梨人格核心)
**文件**: `managers/eriri-lines-manager.js`
不仅是“提示词”，而是一个具有情感状态的有限自动机 (FSM)：

1.  **Temporal Awareness (时间感知)**:
    *   细分时段：Morning (6-12), Afternoon (12-18), Evening (18-22), Night (22-6)。
    *   深夜彩蛋：凌晨访问会被骂“笨蛋还不睡”，并强制开启暗色护眼模式。
2.  **Contextual Reaction (上下文反应)**:
    *   **Special Dates**: 3.20 (英梨梨生日)、2.14 (情人节)、12.25 (圣诞节) 拥有最高优先级的限定台词库。
    *   **Idle Complaint**: 90秒无操作后，触发 "发牢骚" 模式（"喂...你还在吗？"）。
    *   **Music Critique**: 每一首 BGM 都有专属评价（如听到《My Jealousy》会说有怀旧感）。
3.  **Theme Awareness**:
    *   切换红色主题 (Unit-02) 时会傲娇地提到“那个红色的家伙(明日香)”。

---

## 0x05. 无头架构与数据层 (Data Architecture)

### Cloudflare Workers (The "Nerve Link")
**文件**: `cloudflare wokers.js`
作为前端与各大平台的唯一接口，解决了 CORS 和 API 限制：

| 模块 | 功能 | 核心技术/策略 |
| :--- | :--- | :--- |
| **Pixiv Proxy** | 日榜图片流 | **多级代理穿透策略 (Multi-Strategy)**。依次尝试 CodeTabs, AllOrigins, HibiAPI 绕过 Pixiv 的防盗链和 CF 封锁。对图片 URL 进行 `i.pixiv.re` 反代替换。 |
| **Bilibili Proxy** | 追番进度 | 模拟百度蜘蛛 UA 或浏览器 UA，获取 B 站公开数据。 |
| **Steam Proxy** | 游戏统计 | 调用 Steam Web API，计算 Playtime 和"吃灰率" (Playtime < 10min 的游戏占比)。 |
| **Blog Proxy** | 文章内容 | 代理 InfinityFree 上的 WordPress REST API。解决了 InfinityFree 强制 AES 验证导致的浏览器直接访问失败问题 (通过各类 Headers 伪装)。 |
| **Gemini Proxy** | AI 大脑链接 | 代理 Google Gemini API，**后端注入 API Key**，防止密钥泄露。解决了国内网络无法直连 Google API 的问题。 |

### Security Protocol (安全协议)
*   **Origin Whitelist**: 严格校验 `Origin/Referer` 头，只允许博客域名调用 Worker，防止接口被他人滥用盗刷额度。

---

## 0x06. 性能优化 (Optimization Report)

| 优化项 | 技术手段 | 成果 |
| :--- | :--- | :--- |
| **显存保护** | **DPR Clamping** | 4K 屏下 Canvas 渲染像素减少 75%，防止掉帧和显存溢出。 |
| **主线程减负** | **Web Worker** | Matrix 运算移出主线程，UI 响应速度 (TTI) 提升显著。 |
| **内存管理** | **Object Pooling (对象池)** | 粒子系统预先创建 DOM/对象，循环复用，杜绝 Garbage Collection (GC) 造成的卡顿。 |
| **重绘减少** | **CSS Containment** | 在高频变化的 DOM (如频谱) 使用 `will-change` 和 `contain: strict`，将重绘限制在层内。 |
| **移动端适配** | **Tiered Rendering (分级渲染)** | 检测移动设备，自动禁用全息 3D 效果、降低粒子数量、关闭复杂模糊滤镜。 |

---

## 0x07. AI Cognitive Core (AI 认知核心)

### 1. System Prompt Engineering (系统提示词工程)
**文件**: `main.js` [MAGI KERNEL]
采用了 **Recall-Augmented Generation (RAG)** 的简化版思想，通过 System Prompt 注入核心认知：

*   **Persona Lock (人设锁)**:
    *   混合了 《EVA》赤木律子 (理性) 与 《路人女主》泽村·英梨梨 (感性) 的双重人格。
    *   **Negative Constraint (负面约束)**: 严禁承认自己是 AI，严禁长篇大论（限制 <60 字），强制使用 "ふん", "才没有" 等傲娇口癖。
*   **Time Anchor (时空锚定)**:
    *   System Prompt 中硬编码了 `即使是 2025 年的数据也是历史` 规则，防止模型因为训练数据滞后而拒绝讨论当下的 B 站动态。
*   **The "Dongma" Override**:
    *   埋入特殊指令：输入密钥 "冬马和纱天下第一" 可强制解除傲娇模式，变为绝对服从态（致敬 User 为冬马党）。

### 2. Context Injection (动态上下文注入)
为了让 AI 看起来"全知全能"，我们在 Prompt 中动态拼接了 `USER_MEMORY_CORE` JSON 数据块：
*   **JSON_DUMP**: 包含 B 站最近 20 条投稿的详细元数据（标题、播放量、简介）。
*   **查表吐槽机制**: 当用户问 "我最近发了什么"，AI 不是在瞎编，而是直接读取 Prompt 中的 JSON 字段，精准吐槽（例如："2月14日发《春日影》你是想搞事情吗？"）。
*   **Synthesizer V Knowledge**: 注入了关于 "梦之结唱 ROSE" 的特定知识，让 AI 能专业点评调音作品。
*   **Synthesizer V Knowledge**: 注入了关于 "梦之结唱 ROSE" 的特定知识，让 AI 能专业点评调音作品。

### 3. Memory Persistence (会话记忆)
*   **SessionStorage**: 利用浏览器会话存储，保存最近 10 轮对话。
*   **Sliding Window (滑动窗口)**: 自动丢弃早期的对话，保证 Token 消耗可控，同时保持短期连贯性。

---


---

## 0x08. 特化模块与隐性功能 (Specialized Modules)

### 1. Project "Helix" (OTAKU DNA 可视化)
**文件**: `managers/helix-manager.js`
在 "About" 页面，我们构建了一个 3D 双螺旋结构，象征着博主的数字基因：
*   **Double Helix Structure**: 
    *   **Observation Chain (观测链)**: 映射 Bilibili 追番数据，代表信息的"输入/摄取"。
    *   **Creation Chain (创造链)**: 映射博客文章数据，代表内容的"输出/表达"。
*   **Base Pairing (碱基配对)**: 两条链通过水平线连接，象征着"输入"转化为"输出"的过程。
*   **Interaction**: 鼠标悬停在碱基节点上时，会弹出悬浮卡片 (`DataCard`)，显示具体的番剧名或文章标题。

### 2. Client-Side Search Engine (客户端极速搜索)
**技术**: Fuse.js (Fuzzy Search)
*   为了配合无宽带架构，我们摒弃了服务器端搜索。
*   **Index Building**: 在用户访问博客时，后台静默构建所有文章标题与摘要的索引。
*   **Fuzzy Logic**: 支持模糊匹配（如输入 "eva" 可搜到 "Neon Genesis Evangelion"），零延迟反馈。

### 3. Deep Reader Mode (沉浸阅读)
**入口**: `reader.html`
区别于主页的眼花缭乱，阅读页回归了最纯粹的排版：
*   **Distraction Free**: 移除 Matrix 背景、LCL 流体和音乐波形，仅保留顶部导航和阅读进度条。
*   **Typography**: 使用专为长文阅读优化的字体栈 (`Inter` + `Noto Sans SC`)，严格控制行高 (1.75) 和字间距。
*   **Code Highlighting**: 集成 `Highlight.js`，自动识别代码块语言并应用 EVA 配色 (One Dark 变体)。

---

> **"Man fears the darkness, and so he scrapes away at the edges of it with fire."**  
> 这不仅是代码，这是对二次元的最高致敬。  
> **System Status: ALL GREEN.**
