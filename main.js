lucide.createIcons();

/* 页面初始化标志 - 防止初始化时触发 ERIRI 的切换台词 */
window.isPageInitializing = true;

/* ==========================================================================
MAGI RENDER CORE (FPS LIMITER)
功能：接管动画循环，限制帧率，标签页不可见时自动休眠
========================================================================== */
class RenderCore {
    constructor(fps = 30) {
        this.fps = fps;
        this.interval = 1000 / this.fps; // 每一帧的间隔 (ms)
        this.lastTime = 0;
        this.isRunning = false;
        this.tasks = []; // 存储所有需要渲染的函数
        this.rafId = null;

        // 自动休眠监测：当用户切走标签页时停止渲染
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.stop();
                console.log(`[RENDER_CORE] System Hibernating...`);
            } else {
                this.start();
                console.log(`[RENDER_CORE] System Resumed.`);
            }
        });
    }

    // 添加渲染任务 (比如传入 drawMatrix, drawLCL)
    add(taskName, taskFunction) {
        this.tasks.push({ name: taskName, fn: taskFunction });
        console.log(`[RENDER_CORE] Task Added: ${taskName}`);
    }

    // 核心循环
    loop(timestamp) {
        if (!this.isRunning) return;

        // 请求下一帧
        this.rafId = requestAnimationFrame(this.loop.bind(this));

        // 计算时间差
        const elapsed = timestamp - this.lastTime;

        // 如果时间差大于设定的间隔，则进行渲染
        if (elapsed > this.interval) {
            // [关键算法] 修正时间戳，减去多余的偏差，防止动画越跑越快或卡顿
            this.lastTime = timestamp - (elapsed % this.interval);

            // 执行所有任务
            this.tasks.forEach(task => task.fn());
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop(performance.now());
    }

    stop() {
        this.isRunning = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }
}

// 初始化全局渲染核心 (锁定 30FPS，既省电又流畅)
const GlobalRender = new RenderCore(30);

/* ==========================================================================
   CORE OPTIMIZATION DEVICE & CAPABILITY DETECTION
   ========================================================================== */

/* Check if device supports touch (Mobile/Tablet) */
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/* 📱 更精确的移动端检测 */
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/* 🔋 省电模式检测 (iOS 低电量模式，部分 Android) */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 📊 性能等级判断 */
const getPerformanceTier = () => {
    // 检查设备内存 (如果可用)
    const memory = navigator.deviceMemory || 4; // 默认 4GB
    const cores = navigator.hardwareConcurrency || 4;

    if (isMobileDevice) {
        if (memory <= 2 || cores <= 2) return 'low';
        if (memory <= 4 || cores <= 4) return 'medium';
        return 'high';
    }
    return 'ultra'; // PC 默认最高性能
};

const performanceTier = getPerformanceTier();
console.log(`[PERF] Device Tier: ${performanceTier}, Touch: ${isTouchDevice}, Mobile: ${isMobileDevice}`);

/* 📱 移动端性能配置 */
const MobilePerf = {
    // FPS 设置
    fps: isMobileDevice ? 20 : 30,

    // 粒子数量
    particleCount: (() => {
        if (prefersReducedMotion) return 0;
        if (performanceTier === 'low') return 15;
        if (performanceTier === 'medium') return 30;
        if (performanceTier === 'high') return 50;
        return 150; // PC
    })(),

    // 是否启用各种动画
    enableMatrixRain: !prefersReducedMotion && performanceTier !== 'low',
    enableLCL: !isMobileDevice, // 移动端禁用 LCL 流体
    enableParticles: !prefersReducedMotion && performanceTier !== 'low',
    enableSonicWave: !isMobileDevice || performanceTier === 'high',
    enableGlitchEffects: !isMobileDevice,
    enableBackdropBlur: !isMobileDevice || performanceTier === 'high',

    // 应用优化
    apply() {
        if (isMobileDevice) {
            // 禁用 backdrop-filter 提升性能
            if (!this.enableBackdropBlur) {
                document.documentElement.style.setProperty('--backdrop-blur', 'none');
            }

            // 禁用 CSS 动画
            if (!this.enableGlitchEffects) {
                document.body.classList.add('reduce-motion');
            }

            console.log(`[PERF] Mobile optimizations applied: FPS=${this.fps}, Particles=${this.particleCount}`);
        }
    }
};

// 立即应用移动端优化
MobilePerf.apply();

/* 重新配置 RenderCore 使用移动端 FPS */
GlobalRender.fps = MobilePerf.fps;
GlobalRender.interval = 1000 / MobilePerf.fps;

/* Adjust particle count based on device capability */
const PARTICLE_COUNT = MobilePerf.particleCount;

/* --- TACTICAL MODE TOGGLE LOGIC --- */
const savedTactical = localStorage.getItem('tacticalMode');

/* Auto-disable tactical mode on touch devices to prevent UX issues */
if (savedTactical === 'true' && !isTouchDevice) {
    document.body.classList.add('tactical-mode');
}

function toggleTacticalMode() {
    /* Prevent enabling on touch devices */
    if (isTouchDevice) return;

    document.body.classList.toggle('tactical-mode');
    localStorage.setItem('tacticalMode', document.body.classList.contains('tactical-mode'));
}

/* --- LIGHT MODE TOGGLE LOGIC --- */
const lightModeIndicator = document.getElementById('light-mode-indicator');

/* ERIRI 对明暗切换的吐槽台词库 */
const ERIRI_LIGHT_MODE_LINES = [
    "哈？突然开灯干嘛！太刺眼了啦！💢",
    "ふん，这么亮...是想把本小姐看得更清楚吗，变态。",
    "视觉模式切换完成...虽然不是很喜欢就是了。",
    "切换到昼间模式。诶，你该不会怕黑吧？笨蛋。",
    "白天模式？好吧，偶尔换换也不错...才怪。",
    "亮度调整完毕。MAGI 系统正在适应中...",
    "诶...突然这么亮，眼睛都睁不开了啦！",
    "昼间作战模式启动。目标锁定...你的视网膜。"
];
const ERIRI_DARK_MODE_LINES = [
    "暗夜模式启动...这才对嘛，刚才太亮了。",
    "关灯了？哼，终于做了个正确的决定。",
    "夜间战术模式...这样看着舒服多了。",
    "ふん，果然还是黑暗更适合 MAGI 系统。",
    "这个亮度刚刚好...不是为了你着想哦！",
    "暗色主题确认。本小姐的眼睛终于解放了。",
    "夜间巡航模式...代码雨看起来更美了呢。",
    "黑暗中才能看清真相...还有你的笨脸。"
];

function toggleLightMode() {
    const isLight = document.documentElement.getAttribute('data-mode') === 'light';
    if (isLight) {
        document.documentElement.removeAttribute('data-mode');
        localStorage.setItem('visualMode', 'dark');
        if (lightModeIndicator) lightModeIndicator.style.opacity = 0;
        /* ERIRI 对切换到暗色模式的反应 - 40% 概率触发 [V2.0] */
        if (!window.isPageInitializing && Math.random() < 0.4 && typeof showAiSpeech === 'function') {
            const line = window.EririLines?.loaded
                ? window.EririLines.getLightMode(false)
                : ERIRI_DARK_MODE_LINES[Math.floor(Math.random() * ERIRI_DARK_MODE_LINES.length)];
            setTimeout(() => showAiSpeech(line), 300);
        }
    } else {
        document.documentElement.setAttribute('data-mode', 'light');
        localStorage.setItem('visualMode', 'light');
        if (lightModeIndicator) lightModeIndicator.style.opacity = 1;
        /* ERIRI 对切换到亮色模式的反应 - 40% 概率触发 [V2.0] */
        if (!window.isPageInitializing && Math.random() < 0.4 && typeof showAiSpeech === 'function') {
            const line = window.EririLines?.loaded
                ? window.EririLines.getLightMode(true)
                : ERIRI_LIGHT_MODE_LINES[Math.floor(Math.random() * ERIRI_LIGHT_MODE_LINES.length)];
            setTimeout(() => showAiSpeech(line), 300);
        }
    }
    /* Re-init matrix to adjust colors immediately */
    if (window.drawMatrix) {
        /* Force a redraw cycle or clear */
        const canvas = document.getElementById('matrix-bg');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}

/* Init Light Mode State */
const savedVisualMode = localStorage.getItem('visualMode');
if (savedVisualMode === 'light') {
    document.documentElement.setAttribute('data-mode', 'light');
    if (lightModeIndicator) lightModeIndicator.style.opacity = 1;
}

/* --- LCL MODE TOGGLE LOGIC (NEW) --- */
const lclCanvas = document.getElementById('lcl-bg');
let lclAnimationId;

function toggleLCLMode() {
    const isLCL = document.body.classList.contains('lcl-mode');
    if (isLCL) {
        document.body.classList.remove('lcl-mode');
        localStorage.setItem('lclMode', 'off');
        /* Stop animation to save resources */
        if (lclAnimationId) cancelAnimationFrame(lclAnimationId);
    } else {
        document.body.classList.add('lcl-mode');
        localStorage.setItem('lclMode', 'on');
        initLCL(); /* Start animation */
    }
}

/* Init LCL Mode State */
const savedLCLMode = localStorage.getItem('lclMode');
if (savedLCLMode === 'on') {
    document.body.classList.add('lcl-mode');
    /* Defer init slightly to ensure canvas is ready */
    requestAnimationFrame(initLCL);
}

/* ==========================================================================
   LCL FLUID SIMULATION (CANVAS)
   ========================================================================== */
function initLCL() {
    const ctx = lclCanvas.getContext('2d');
    let bubbles = [];

    function resize() {
        /* [优化] 限制 DPR 最大为 1，不再追求 Retina 高清，大幅减轻 GPU 压力并增加复古噪点感 */
        const dpr = Math.min(window.devicePixelRatio || 1, 1);
        lclCanvas.width = window.innerWidth * dpr;
        lclCanvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr); /* 缩放 Context 以匹配分辨率 */
    }
    window.addEventListener('resize', resize);
    resize();

    /* LCL Colors: Orange/Amber gradient */
    const colors = ['rgba(255, 165, 0, 0.4)', 'rgba(255, 69, 0, 0.3)', 'rgba(255, 140, 0, 0.2)'];

    class Bubble {
        constructor() {
            this.reset(true);
        }

        reset(initial) {
            this.x = Math.random() * lclCanvas.width;
            this.y = initial ? Math.random() * lclCanvas.height : lclCanvas.height + Math.random() * 100;
            this.size = Math.random() * 15 + 5;
            this.speed = Math.random() * 1 + 0.5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.05;
        }

        update() {
            this.y -= this.speed;
            this.wobble += this.wobbleSpeed;
            this.x += Math.sin(this.wobble) * 0.5;

            if (this.y < -50) this.reset(false);
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            /* Shine effect */
            ctx.beginPath();
            ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
        }
    }

    /* Create bubbles */
    for (let i = 0; i < 100; i++) bubbles.push(new Bubble());

    /* [优化] 帧率限制变量 */
    const LCL_FPS = 30;
    const LCL_INTERVAL = 1000 / LCL_FPS;
    let lclLastTime = 0;

    function animateLCL(timestamp) {
        // 休眠检测：页面不可见时暂停
        if (document.hidden) {
            lclAnimationId = requestAnimationFrame(animateLCL);
            return;
        }

        if (!document.body.classList.contains('lcl-mode')) return;

        // 帧率限制
        const elapsed = timestamp - lclLastTime;
        if (elapsed < LCL_INTERVAL) {
            lclAnimationId = requestAnimationFrame(animateLCL);
            return;
        }
        lclLastTime = timestamp - (elapsed % LCL_INTERVAL);

        ctx.clearRect(0, 0, lclCanvas.width, lclCanvas.height);

        /* Draw LCL Fluid Background (Gradient) */
        const gradient = ctx.createLinearGradient(0, 0, 0, lclCanvas.height);
        gradient.addColorStop(0, 'rgba(255, 140, 0, 0.1)'); /* Top lighter orange */
        gradient.addColorStop(1, 'rgba(139, 0, 0, 0.4)');    /* Bottom deep red */
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, lclCanvas.width, lclCanvas.height);

        bubbles.forEach(b => {
            b.update();
            b.draw();
        });

        lclAnimationId = requestAnimationFrame(animateLCL);
    }

    animateLCL(performance.now());
}


/* ==========================================================================
   OPTIMIZED CURSOR SYSTEM (CONDITIONAL RENDERING)
   ========================================================================== */

/* Only initialize cursor logic on non-touch devices */
if (!isTouchDevice) {
    const cursorMain = document.getElementById('cursor-main');
    const cursorTrail1 = document.getElementById('cursor-trail-1');
    const cursorTrail2 = document.getElementById('cursor-trail-2');
    const cursorInfo = document.querySelector('.cursor-coords');
    const cursorMode = document.querySelector('.cursor-mode');

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let posTrail1 = { x: mouse.x, y: mouse.y };
    let posTrail2 = { x: mouse.x, y: mouse.y };

    const LERP_TRAIL1 = 0.15;
    const LERP_TRAIL2 = 0.08;
    const lerp = (start, end, factor) => start + (end - start) * factor;

    /* 1. MOUSE MOVE: Zero latency update for main cursor */
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        if (document.body.classList.contains('tactical-mode')) {
            cursorMain.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
        }
    }, { passive: true }); /* Passive listener for scrolling performance */

    /* 2. HOVER SYSTEM */
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, .eva-card, input, .group, .cursor-pointer, .social-btn')) {
            document.body.classList.add('hovering');
            if (cursorMode) cursorMode.innerText = 'LOCK';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, .eva-card, input, .group, .cursor-pointer, .social-btn')) {
            document.body.classList.remove('hovering');
            if (cursorMode) cursorMode.innerText = 'STD';
        }
    });

    /* 3. CLICK FEEDBACK */
    document.addEventListener('mousedown', (e) => {
        document.body.classList.add('clicking');
        if (document.body.classList.contains('tactical-mode')) {
            const ripple = document.createElement('div');
            ripple.classList.add('click-ripple');
            ripple.style.left = `${e.clientX}px`;
            ripple.style.top = `${e.clientY}px`;
            document.body.appendChild(ripple);
            setTimeout(() => ripple.remove(), 500);
        }
    });

    document.addEventListener('mouseup', () => document.body.classList.remove('clicking'));

    /* 4. RENDER LOOP (优化：添加页面休眠检测) */
    function renderCursorLoop() {
        // 休眠检测：页面不可见时跳过渲染
        if (document.hidden) {
            requestAnimationFrame(renderCursorLoop);
            return;
        }

        if (document.body.classList.contains('tactical-mode')) {
            posTrail1.x = lerp(posTrail1.x, mouse.x, LERP_TRAIL1);
            posTrail1.y = lerp(posTrail1.y, mouse.y, LERP_TRAIL1);
            cursorTrail1.style.transform = `translate3d(${posTrail1.x}px, ${posTrail1.y}px, 0)`;

            posTrail2.x = lerp(posTrail2.x, mouse.x, LERP_TRAIL2);
            posTrail2.y = lerp(posTrail2.y, mouse.y, LERP_TRAIL2);
            cursorTrail2.style.transform = `translate3d(${posTrail2.x}px, ${posTrail2.y}px, 0)`;

            if (cursorInfo) {
                cursorInfo.innerText = `TGT:${Math.round(mouse.x)},${Math.round(mouse.y)}`;
            }

            /* Update CSS Vars for Glare Effects (Only needed on PC) */
            const xPct = (mouse.x / window.innerWidth) * 100;
            const yPct = (mouse.y / window.innerHeight) * 100;
            document.documentElement.style.setProperty('--mouse-x', `${xPct}%`);
            document.documentElement.style.setProperty('--mouse-y', `${yPct}%`);
        }
        requestAnimationFrame(renderCursorLoop);
    }
    renderCursorLoop();
}

/* ==========================================================================
   MAGI SYSTEM HEARTBEAT (CONNECTION MONITOR)
   ========================================================================== */
let heartbeatInterval;
const statusElement = document.getElementById('magi-status-indicator');

const MAGI_STATES = [
    { text: "待機中", color: "text-secondary" },       // Standby
    { text: "正常稼働", color: "text-primary" },       // Normal
    { text: "回線良好", color: "text-secondary" },     // Connection Good
    { text: "探索中", color: "text-secondary" },       // Searching
    { text: "自律モード", color: "text-secondary" },   // Autonomous
    { text: "パターン青", color: "text-primary" },     // Pattern Blue
    { text: "座標固定", color: "text-secondary" }      // Position Fixed
];

function startMagiHeartbeat() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
        const isOnline = navigator.onLine;
        if (!statusElement) return;

        const currentText = statusElement.innerText;
        // 避让正在对话的状态
        if (currentText.includes("VOTING") || currentText.includes("DELIBERATING") || currentText.includes("DENIED") || currentText.includes("CONSENSUS")) {
            return;
        }

        if (!isOnline) {
            updateStatusGlitch("接続断绝", "text-emergency");
        } else {
            const randomState = MAGI_STATES[Math.floor(Math.random() * MAGI_STATES.length)];
            if (Math.random() > 0.7) {
                const fakePing = Math.floor(Math.random() * 40) + 10;
                updateStatusGlitch(`応答速度:${fakePing}ms`, "text-secondary");
            } else {
                updateStatusGlitch(randomState.text, randomState.color);
            }
        }
    }, 3000);
}

function updateStatusGlitch(text, colorClass) {
    if (!statusElement) return;
    const chars = '!<>-_[]{}—=+*^?#________';
    const originalText = text;
    let iterations = 0;
    const interval = setInterval(() => {
        statusElement.innerText = originalText.split('').map((letter, index) => {
            if (index < iterations) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        statusElement.className = `font-mono text-[9px] font-bold animate-pulse ${colorClass}`;
        if (iterations >= originalText.length) clearInterval(interval);
        iterations += 1 / 2;
    }, 30);
}

window.addEventListener('DOMContentLoaded', () => {
    startMagiHeartbeat();
});
/* ==========================================================================
MATRIX RAIN V2.0 (WEB WORKER + FALLBACK)
优化：支持 OffscreenCanvas 在后台线程渲染，不阻塞主线程
回退：不支持的浏览器自动使用主线程渲染
========================================================================== */
const matrixCanvas = document.getElementById('matrix-bg');
const fontSize = 16;

// 缓存颜色，避免在循环中查询 DOM
let matrixColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();

// 标记是否使用 Worker 模式
let matrixWorker = null;
let useWorkerMode = false;

// 回退模式需要的变量
let matrixCtx = null;
let drops = [];
const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * 初始化 Matrix 系统 (自动检测并选择渲染模式)
 */
function initMatrixSystem() {
    /* 📱 [性能优化] 移动端完全禁用 Matrix Rain */
    if (!MobilePerf.enableMatrixRain) {
        console.log('[MAGI] Matrix Rain: DISABLED (Mobile Power Saving)');
        // 隐藏 Canvas，使用纯色背景
        if (matrixCanvas) {
            matrixCanvas.style.display = 'none';
        }
        return;
    }

    // 检测是否支持 OffscreenCanvas 和 Worker
    const supportsOffscreen = typeof OffscreenCanvas !== 'undefined'
        && typeof matrixCanvas.transferControlToOffscreen === 'function';

    if (supportsOffscreen && !isTouchDevice) {
        // 使用 Web Worker 模式
        try {
            initMatrixWorker();
            useWorkerMode = true;
            console.log('[MAGI] Matrix渲染引擎: Worker模式 (GPU线程)');
        } catch (e) {
            console.warn('[MAGI] Worker初始化失败，回退到主线程:', e);
            initMatrixFallback();
        }
    } else {
        // 回退到主线程模式
        initMatrixFallback();
        console.log('[MAGI] Matrix渲染引擎: 主线程模式');
    }
}

/**
 * Web Worker 模式初始化
 */
function initMatrixWorker() {
    // 将 Canvas 控制权转移到 Worker
    const offscreen = matrixCanvas.transferControlToOffscreen();

    matrixWorker = new Worker('./matrix-worker.js');

    // 发送初始化数据
    matrixWorker.postMessage({
        type: 'init',
        data: {
            canvas: offscreen,
            width: window.innerWidth,
            height: window.innerHeight,
            dpr: Math.min(window.devicePixelRatio || 1, 1), /* [优化] 强制 DPR=1 */
            fontSize: fontSize,
            color: matrixColor,
            isLightMode: document.documentElement.getAttribute('data-mode') === 'light'
        }
    }, [offscreen]); // 转移 Canvas 所有权

    // 启动渲染
    matrixWorker.postMessage({ type: 'start' });

    // 监听 resize
    let workerResizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(workerResizeTimer);
        workerResizeTimer = setTimeout(() => {
            if (matrixWorker) {
                matrixWorker.postMessage({
                    type: 'resize',
                    data: { width: window.innerWidth, height: window.innerHeight }
                });
            }
        }, 50);
    });

    // [优化] 页面隐藏时暂停 Worker，可见时恢复
    document.addEventListener('visibilitychange', () => {
        if (!matrixWorker) return;
        if (document.hidden) {
            matrixWorker.postMessage({ type: 'stop' });
            console.log('[MAGI] Matrix Worker Hibernating...');
        } else {
            matrixWorker.postMessage({ type: 'start' });
            console.log('[MAGI] Matrix Worker Resumed.');
        }
    });
}

/**
 * 回退模式初始化 (主线程渲染)
 */
function initMatrixFallback() {
    matrixCtx = matrixCanvas.getContext('2d');

    function initDrops() {
        /* [优化] 强制 DPR 最大为 1，代码雨不需要 Retina 清晰度，反而能提升 CRT 质感并大幅提升性能 */
        const dpr = Math.min(window.devicePixelRatio || 1, 1);
        matrixCanvas.width = window.innerWidth * dpr;
        matrixCanvas.height = window.innerHeight * dpr;
        // matrixCtx.scale(dpr, dpr); // 注意：这里不需要 scale，因为我们要利用低分辨率特性

        const columns = Math.floor(matrixCanvas.width / fontSize); /* 使用实际像素计算列数 */
        const newDrops = [];
        for (let i = 0; i < columns; i++) {
            newDrops[i] = drops[i] || Math.floor(Math.random() * -matrixCanvas.height / fontSize);
        }
        drops = newDrops;

        // 初始化 Canvas 状态 (只设置一次 - Canvas状态缓存优化)
        if (matrixCtx) {
            matrixCtx.font = 'bold ' + fontSize + 'px JetBrains Mono, monospace';
        }
    }

    let fallbackResizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(fallbackResizeTimer);
        fallbackResizeTimer = setTimeout(initDrops, 50);
    });

    initDrops();

    // 注册到全局渲染核心
    GlobalRender.add('MatrixRain', drawMatrixFallback);
}

/**
 * 回退模式绘制函数 (Canvas状态缓存优化版)
 */
function drawMatrixFallback() {
    if (document.body.classList.contains('lcl-mode')) return;
    if (!matrixCtx) return;

    const isLightMode = document.documentElement.getAttribute('data-mode') === 'light';

    // 拖尾遮罩
    matrixCtx.fillStyle = isLightMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.025)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    // 设置发光效果 (颜色变化时才更新)
    matrixCtx.shadowBlur = 14;
    matrixCtx.shadowColor = matrixColor;
    matrixCtx.fillStyle = matrixColor;

    for (let i = 0; i < drops.length; i++) {
        const text = katakana.charAt(Math.floor(Math.random() * katakana.length));

        if (Math.random() > 0.98) {
            matrixCtx.fillStyle = isLightMode ? '#000' : '#fff';
            matrixCtx.shadowColor = isLightMode ? '#000' : '#fff';
            matrixCtx.shadowBlur = 20;
            matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);

            matrixCtx.fillStyle = matrixColor;
            matrixCtx.shadowColor = matrixColor;
            matrixCtx.shadowBlur = 14;
        } else {
            matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);
        }

        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }

    matrixCtx.shadowBlur = 0;
}

// 监听主题变化，同步更新颜色
const matrixThemeObserver = new MutationObserver(() => {
    matrixColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();

    // 如果是 Worker 模式，发送颜色更新
    if (useWorkerMode && matrixWorker) {
        matrixWorker.postMessage({
            type: 'updateColor',
            data: { color: matrixColor }
        });
    }
});
matrixThemeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'data-theme'] });

// 监听 LCL 模式和亮色模式变化
const matrixModeObserver = new MutationObserver(() => {
    if (useWorkerMode && matrixWorker) {
        matrixWorker.postMessage({
            type: 'updateMode',
            data: {
                isLightMode: document.documentElement.getAttribute('data-mode') === 'light',
                isLCLMode: document.body.classList.contains('lcl-mode')
            }
        });
    }
});
matrixModeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
matrixModeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

// 启动 Matrix 系统
initMatrixSystem();


/* ==========================================================================
   2. HOLO WAVE ANIMATION (Optimized for RenderCore)
   ========================================================================== */
const holoWaveCanvas = document.getElementById('holo-wave');
const holoCtx = holoWaveCanvas.getContext('2d');

function resizeHolo() {
    holoWaveCanvas.width = window.innerWidth;
    holoWaveCanvas.height = 48;
}
window.addEventListener('resize', resizeHolo);
resizeHolo();

let holoOffset = 0;

function drawHoloWave() {
    if (!holoCtx) return;

    holoCtx.clearRect(0, 0, holoWaveCanvas.width, holoWaveCanvas.height);

    // 使用上方定义的 matrixColor (缓存的 --secondary-color)，无需再次查询
    const color = matrixColor;

    // 绘制主波形
    holoCtx.beginPath();
    holoCtx.lineWidth = 1.5;
    holoCtx.strokeStyle = color;

    /* 性能优化：每 2 个像素画一次，肉眼看不出区别 */
    for (let i = 0; i < holoWaveCanvas.width; i += 2) {
        const y = 24 + Math.sin((i + holoOffset) * 0.02) * 12 * Math.sin((i + holoOffset * 0.5) * 0.01);
        if (i === 0) holoCtx.moveTo(i, y);
        else holoCtx.lineTo(i, y);
    }
    holoCtx.stroke();

    // 绘制干扰波形 (半透明)
    holoCtx.beginPath();
    holoCtx.lineWidth = 0.5;
    holoCtx.strokeStyle = color;
    holoCtx.globalAlpha = 0.5;

    /* 性能优化：每 4 个像素画一次 */
    for (let i = 0; i < holoWaveCanvas.width; i += 4) {
        const y = 24 + Math.sin((i - holoOffset * 2) * 0.1) * 5 + (Math.random() - 0.5) * 3;
        if (i === 0) holoCtx.moveTo(i, y);
        else holoCtx.lineTo(i, y);
    }
    holoCtx.stroke();
    holoCtx.globalAlpha = 1;

    holoOffset += 1.5;

    // ❌ 已移除：requestAnimationFrame(drawHoloWave);
}

// ✅ 注册到全局渲染核心
GlobalRender.add('HoloWave', drawHoloWave);

/* --- Marquee Init --- */
function initMarquee() {
    const wrapper = document.getElementById('marquee-wrapper');
    const baseContent = `
                <div class="holo-marquee-item"><span>A.T. FIELD DEPLOYED</span><span class="mx-4 opacity-50">///</span></div>
                <div class="holo-marquee-item"><span>MAGI SYSTEM ONLINE</span><span class="mx-4 opacity-50">///</span></div>
                <div class="holo-marquee-item"><span>PATTERN BLUE</span><span class="mx-4 opacity-50">///</span></div>
                <div class="holo-marquee-item"><span>TARGET SILENT</span><span class="mx-4 opacity-50">///</span></div>
                <div class="holo-marquee-item"><span>LCL PRESSURE STABLE</span><span class="mx-4 opacity-50">///</span></div>
                <div class="holo-marquee-item"><span>HUMAN INSTRUMENTALITY PROJECT</span><span class="mx-4 opacity-50">///</span></div>
                <div class="holo-marquee-item"><a href="https://icp.gov.moe/?keyword=20262008" target="_blank" class="hover:text-secondary transition-colors">萌ICP备20262008号</a><span class="mx-4 opacity-50">///</span></div>
            `;
    wrapper.innerHTML = baseContent;
    /* Only duplicate content if screen is wide enough, saves DOM nodes on mobile */
    if (window.innerWidth > 768) {
        const screenWidth = window.innerWidth;
        let contentWidth = wrapper.scrollWidth;
        while (contentWidth < screenWidth * 2) {
            wrapper.innerHTML += baseContent;
            contentWidth = wrapper.scrollWidth;
        }
    }
    wrapper.innerHTML += baseContent;
}
window.addEventListener('DOMContentLoaded', initMarquee);
/* Debounce marquee resize */
let marqueeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(marqueeTimeout);
    marqueeTimeout = setTimeout(initMarquee, 200);
});

/* AT Field effect */
function createATField(x, y) {
    /* Simple performance check: too many AT fields skip */
    if (document.querySelectorAll('.at-field-effect').length > 5) return;

    const atField = document.createElement('div');
    atField.classList.add('at-field-effect'); /* For counting */
    atField.style.cssText = `position: fixed; top: ${y}px; left: ${x}px; width: 10px; height: 10px; border: 2px solid #ffa500; background: rgba(255, 165, 0, 0.2); transform: translate(-50%, -50%); clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); z-index: 9998; pointer-events: none; transition: all 0.4s ease-out; box-shadow: 0 0 10px #ffa500;`;
    document.body.appendChild(atField);
    requestAnimationFrame(() => { atField.style.width = '200px'; atField.style.height = '200px'; atField.style.opacity = '0'; atField.style.transform = 'translate(-50%, -50%) rotate(45deg)'; });
    setTimeout(() => atField.remove(), 400);
}
document.addEventListener('mousedown', (e) => createATField(e.clientX, e.clientY));

function startHeroGlitch() {
    const heroImg = document.getElementById('hero-character');
    if (!heroImg) return;
    setInterval(() => {
        /* Only glitch if visible/not minimized to save battery */
        if (document.visibilityState === 'visible') {
            heroImg.classList.add('cyber-swap-active');
            setTimeout(() => { heroImg.classList.remove('cyber-swap-active'); }, 500);
        }
    }, 4000);
}

/* ==========================================================================
   PARTICLE SYSTEM V2.0 (OBJECT POOL)
   优化：预创建 DOM 元素池，复用而非增删，避免 GC 停顿
   ========================================================================== */
const ParticlePool = {
    pool: [],           // 对象池
    activeCount: 0,     // 当前活跃粒子数
    container: null,    // 容器 DOM
    maxSize: 0,         // 池大小 (根据设备自动设置)

    /**
     * 初始化对象池 - 预创建所有粒子 DOM
     */
    init() {
        this.container = document.getElementById('particles-container');
        if (!this.container) return;

        this.maxSize = PARTICLE_COUNT;

        // 预创建所有粒子并隐藏
        for (let i = 0; i < this.maxSize; i++) {
            const p = this._createParticleDOM();
            p.style.display = 'none';
            this.container.appendChild(p);
            this.pool.push({
                element: p,
                inUse: false,
                recycleTime: 0
            });
        }

        // 初次激活所有粒子 (带随机初始位置)
        this.pool.forEach((item, index) => {
            setTimeout(() => this._activateParticle(item, true), index * 20);
        });

        // 监听页面可见性，不可见时跳过更新
        this._startRecycleLoop();

        console.log(`[MAGI] 粒子对象池已初始化: ${this.maxSize} 个粒子`);
    },

    /**
     * 创建粒子 DOM 元素 (仅初始化时调用)
     */
    _createParticleDOM() {
        const p = document.createElement('div');
        p.classList.add('particle');
        return p;
    },

    /**
     * 激活一个粒子 (从池中取出并设置样式)
     */
    _activateParticle(item, initial = false) {
        if (!item || item.inUse) return;

        const p = item.element;

        // 重置类和样式
        p.className = 'particle';

        // 随机类型：30% 为竖线 (bit)，70% 为圆点 (bubble)
        const isBit = Math.random() > 0.7;
        p.classList.add(isBit ? 'bit' : 'bubble');

        // 随机大小
        const size = isBit ? Math.random() * 20 + 10 : Math.random() * 6 + 2;
        p.style.width = isBit ? '1px' : `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}vw`;

        // 深度模拟 (远近感)
        const depth = Math.random();
        p.style.setProperty('--p-opacity', depth * 0.5 + 0.3);
        p.style.setProperty('--p-scale', depth * 0.5 + 0.5);
        p.style.filter = depth < 0.5 ? `blur(${3 * (1 - depth)}px)` : 'none';

        // 初始位置 (首次加载时随机分布在屏幕上)
        if (initial) {
            p.style.bottom = `${Math.random() * 100}vh`;
            p.style.opacity = depth * 0.5 + 0.3;
        } else {
            p.style.bottom = '-50px';
            p.style.opacity = '0';
        }

        // 动画持续时间
        const duration = Math.random() * 15 + 10;
        p.style.animation = `floatUp ${duration}s linear infinite`;
        p.style.animationDelay = initial ? `-${Math.random() * duration}s` : '0s';

        // 显示粒子
        p.style.display = '';

        // 标记为使用中
        item.inUse = true;
        item.recycleTime = Date.now() + duration * 1000;
        this.activeCount++;
    },

    /**
     * 回收粒子 (隐藏并归还到池)
     */
    _recycleParticle(item) {
        if (!item || !item.inUse) return;

        item.element.style.display = 'none';
        item.element.style.animation = 'none';
        item.inUse = false;
        this.activeCount--;
    },

    /**
     * 回收循环 - 检查并回收完成动画的粒子，然后重新激活
     */
    _startRecycleLoop() {
        const checkAndRecycle = () => {
            // 页面不可见时跳过
            if (document.visibilityState !== 'visible') {
                setTimeout(checkAndRecycle, 1000);
                return;
            }

            const now = Date.now();

            this.pool.forEach(item => {
                if (item.inUse && now >= item.recycleTime) {
                    // 回收并立即重新激活 (循环复用)
                    this._recycleParticle(item);
                    this._activateParticle(item, false);
                }
            });

            // 继续循环 (每500ms检查一次)
            setTimeout(checkAndRecycle, 500);
        };

        checkAndRecycle();
    }
};

// 兼容旧代码的启动函数
function createParticles() {
    ParticlePool.init();
}

const characterMap = {
    'default': './images/shinji.png',
    'unit-02': './images/asuka.png',
    'unit-00': './images/rei.png',
    'unit-08': './images/mari.png'
};

/* ERIRI 对各主题的专属吐槽 */
const ERIRI_THEME_LINES = {
    'default': [
        "初号机配色...好吧，这个还算有品味。",
        "紫色和绿色，暴走的颜色呢。ふん，不错。",
        "シンジ的配色吗...算你懂审美。",
        "EVA-01 色系确认。暴走模式待机中...",
        "紫绿配色...有种要失控的感觉呢。",
        "这个配色让我想起了某个懦弱的少年...算了不提了。"
    ],
    'unit-02': [
        "二号机！这才是王者该有的配色！💢",
        "红色...不错嘛，你还挺有眼光的。",
        "アスカ的颜色！本小姐最喜欢这个了！...没有很开心！",
        "烈焰红！这才是真正的战斗色！",
        "EVA-02 配色方案加载完成。战斗力提升 300%！",
        "红色代表热情和力量...正适合本小姐！",
        "这是什么...为什么感觉灵魂正在共鸣"
    ],
    'unit-00': [
        "零号机...绫波丽的配色吗。冷冰冰的。",
        "蓝色...沉稳是沉稳啦，但总觉得少了点什么。",
        "レイ的配色...你喜欢那种类型的吗？哼。",
        "原型机配色...有种实验室的感觉。",
        "蓝白色调...很冷静，但也很无趣呢。",
        "这个配色让人想说'你好'然后就没有然后了..."
    ],
    'unit-08': [
        "八号机！粉色也不错嘛～",
        "マリ的配色？你该不会喜欢那种大姐姐类型的吧！",
        "这个粉色...意外地挺可爱的。才、才没有说我喜欢！",
        "粉色和绿色...有种奇妙的活力感。",
        "真希波的配色吗...她总是笑得很开心呢。",
        "这个配色很有元气！虽然我更喜欢红色就是了。"
    ]
};

function setTheme(themeName) {
    // 1. 设置主题属性
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);

    /* ERIRI 对主题切换的反应 - 50% 概率触发 [V2.0] */
    if (!window.isPageInitializing && Math.random() < 0.5 && typeof showAiSpeech === 'function') {
        const line = window.EririLines?.loaded
            ? window.EririLines.getTheme(themeName)
            : (ERIRI_THEME_LINES[themeName] ? ERIRI_THEME_LINES[themeName][Math.floor(Math.random() * ERIRI_THEME_LINES[themeName].length)] : null);
        if (line) setTimeout(() => showAiSpeech(line), 300);
    }

    // 2. 核心修复：清除 JS 设置的内联样式污染
    // 切换主题时，必须移除之前可能由"暴怒模式"或"交互"写死的颜色
    // 这样 CSS 中的 var(--secondary-color) 才能重新生效，光标颜色才能跟随主题
    document.documentElement.style.removeProperty('--lock-color');
    document.documentElement.style.removeProperty('--primary-color');
    document.documentElement.style.removeProperty('--secondary-color');

    // 3. 重置 UI 状态（退出暴怒模式/特殊的卡片状态）
    const aiCard = document.getElementById('ai-card');
    if (aiCard) {
        aiCard.classList.remove('rage-mode');
    }

    // 4. 更新顶部按钮激活状态
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(themeName)) {
            btn.classList.add('active');
        }
    });

    // 5. 切换立绘 (带淡入淡出，防止闪烁)
    const heroImg = document.getElementById('hero-character');
    if (heroImg && characterMap[themeName]) {
        heroImg.style.opacity = 0;

        setTimeout(() => {
            heroImg.src = characterMap[themeName];
            // 图片加载完成后再显示
            heroImg.onload = () => { heroImg.style.opacity = 1; };
            // 保底：如果缓存很快，onload可能不触发，加个延时兜底
            setTimeout(() => { heroImg.style.opacity = 1; }, 100);
        }, 200);
    }

    // 6. 强制刷新光标颜色 (触发重绘，解决偶发的颜色卡死)
    const cursorWrapper = document.querySelector('.cursor-wrapper');
    if (cursorWrapper) {
        // 临时移除 transition 以便立即变色，体验更跟手
        const oldTransition = cursorWrapper.style.transition;
        cursorWrapper.style.transition = 'none';
        // 强制浏览器重算样式
        void cursorWrapper.offsetWidth;
        cursorWrapper.style.transition = oldTransition;
    }

    // 7. 清空频谱 Canvas，确保暂停状态下切换主题后颜色正确更新
    const audioVisualizer = document.getElementById('audio-visualizer');
    if (audioVisualizer) {
        const ctx = audioVisualizer.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, audioVisualizer.width, audioVisualizer.height);
        }
    }
}
const savedTheme = localStorage.getItem('theme') || 'default'; setTheme(savedTheme);

function toggleEmergency() { document.body.classList.toggle('emergency-mode'); }

/* ERIRI 默认点击对话台词库 */
const aiLines = [
    // 傲娇基础款
    "哼，才不是特意在这等你的！",
    "别盯着我看... 变态！",
    "笨蛋，那个地方的代码写错了啦！",
    "MAGI 系统判定：你是笨蛋的概率为 99.9%。",
    "要不要本小姐帮你优化一下算法？",
    // EVA 元素
    "同步率太低了，再努力一点啊！",
    "A.T. Field 全开！别想随便接近本小姐！",
    "人类补完计划？哼，听起来就很麻烦。",
    "MAGI 三机一体投票中...结果：你还是笨蛋。",
    "NERV 总部没什么好看的，还不如看我。",
    // 博主相关
    "你是来找 Wh1te 的吗？他现在不在...开玩笑的啦。",
    "Python 65%、Web 40%...这同步率也太低了吧！",
    "关注露早GOGO谢谢喵？好吧，我允许了。",
    "关注柚恩不加糖？...你的品味还不错嘛。",
    "《白色相簿2》...冬马和纱确实是最棒的。",
    "不喜欢冬马和纱的话，本小姐可不会搭理你！",
    // 技术吐槽
    "代码雨看着很酷吧？都是本小姐渲染的哦。",
    "LCL 模式？那个橙色的液体...有点恶心啦。",
    "InfinityFree 防火墙又在捣乱了...烦死了！",
    "Cloudflare Workers 代理...技术活本小姐最拿手了。",
    "Steam 吃灰率太高了吧！游戏买来要玩的啦！",
    // 日常互动
    "有什么想问的吗？本小姐心情好的话会回答的。",
    "没事就不要老是点我...虽然也不是不可以。",
    "ふん，闲着没事干了是吧？",
    "这个博客的设计还不错吧？...算你有眼光。",
    "又来了？...还挺勤快的嘛。",
    "点来点去的，你在干什么啦！",
    "本小姐可是很忙的，别老是打扰我。",
    "你是不是很无聊？...跟我聊聊也行啦。",
    "想听什么？情报收集还是技术分析？",
    "别用那种眼神看我...会害羞的啦！",
    "今天的你...看起来还行吧。只是客观评价！",
    "记得按时吃饭睡觉，笨蛋。...才不是关心你！",
    "代码写累了就休息一下嘛，又没人逼你。",
    "喂，眼睛离屏幕远一点！会近视的！",
    "一直盯着代码看会变傻的哦～",
    "需要本小姐给你泡杯咖啡吗？...说笑的啦。",
    "你今天的精神状态...MAGI 判定为 '需要休息'。",
    "有什么开心的事吗？...只是随便问问。",
    "无聊的话可以去看看 Bilibili...不是让你去看别的女生！",
    "本小姐肚子饿了...你也该吃东西了吧？"
];
let aiSpeechInterval = null; let lastAiLineIndex = -1;

function triggerAiSpeech() {
    const aiStatus = document.getElementById('ai-status-text');
    const bubble = document.getElementById('ai-speech-bubble');

    /* 如果 AI 正在思考或正在打字，不要打断 */
    if (aiStatus && (aiStatus.innerText === "DELIBERATING..." || aiStatus.innerText === "CALCULATING...")) return;
    if (bubble && bubble.classList.contains('ai-speech-bubble-processing')) return;
    /* 如果正在打字动画中，也不要打断 */
    if (window.currentSpeechInterval) return;

    /* [V2.0] 使用 EririLines 模块获取点击台词 */
    const line = window.EririLines?.loaded
        ? window.EririLines.getClick()
        : aiLines[Math.floor(Math.random() * aiLines.length)];

    showAiSpeech(line);
}

function showAiSpeech(text) {
    const bubble = document.getElementById('ai-speech-bubble');
    const textEl = document.getElementById('ai-speech-text');
    const statusEl = document.getElementById('ai-status-text');
    const aiCard = document.getElementById('ai-card');

    /* 垂直通讯流元素 */
    const streamContainer = document.getElementById('magi-vertical-stream');
    const streamText = document.getElementById('magi-stream-text');

    // 清理之前的动画
    if (window.currentSpeechInterval) {
        clearInterval(window.currentSpeechInterval);
        window.currentSpeechInterval = null;
    }
    if (window.speechTimeout) {
        clearTimeout(window.speechTimeout);
        window.speechTimeout = null;
    }
    if (window.streamHideTimeout) {
        clearTimeout(window.streamHideTimeout);
        window.streamHideTimeout = null;
    }
    
    /* [内存优化] 清理之前的事件监听器（防止打字被中断时的泄漏） */
    if (window.currentScrollHandler) {
        window.removeEventListener('scroll', window.currentScrollHandler);
        window.currentScrollHandler = null;
    }
    if (window.currentKeepBubbleHandler) {
        bubble.removeEventListener('click', window.currentKeepBubbleHandler);
        window.currentKeepBubbleHandler = null;
    }

    /* Add speaking class */
    if (aiCard) aiCard.classList.add('is-speaking');

    bubble.classList.remove('hidden', 'bubble-hidden');
    
    /* [内存优化] 清理旧的 click 监听器，防止泄漏 */
    if (window.currentKeepBubbleHandler) {
        bubble.removeEventListener('click', window.currentKeepBubbleHandler);
    }
    
    /* 用户交互：点击气泡取消自动隐藏 */
    const keepBubble = () => {
        if (window.speechTimeout) {
            clearTimeout(window.speechTimeout);
            window.speechTimeout = null;
            console.log('[气泡框] 用户点击，取消自动隐藏');
        }
        bubble.removeEventListener('click', keepBubble); // 只触发一次
        window.currentKeepBubbleHandler = null; // 清理引用
    };
    window.currentKeepBubbleHandler = keepBubble;
    bubble.addEventListener('click', keepBubble);

    /* 检测气泡是否在视野内且未隐藏 */
    const isBubbleVisible = () => {
        if (!bubble) return false;
        // 如果气泡已隐藏，视为"不需要显示垂直流"
        if (bubble.classList.contains('bubble-hidden') || bubble.classList.contains('hidden')) {
            return true; // 返回 true 让 updateStreamVisibility 不显示垂直流
        }
        const rect = bubble.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
    };

    /* 根据气泡可见性决定是否显示垂直通讯流 */
    const updateStreamVisibility = () => {
        if (streamContainer) {
            // 如果气泡已隐藏，同时隐藏垂直流
            if (bubble.classList.contains('bubble-hidden') || bubble.classList.contains('hidden')) {
                streamContainer.classList.remove('visible', 'active');
                return;
            }
            if (isBubbleVisible()) {
                // 气泡可见，隐藏垂直流
                streamContainer.classList.remove('visible');
            } else {
                // 气泡不可见，显示垂直流
                streamContainer.classList.add('visible', 'active');
            }
        }
    };

    /* 初始化垂直通讯流文本 */
    if (streamText) streamText.innerText = "";

    /* 初始检查并设置滚动监听 */
    updateStreamVisibility();

    /* [内存优化] 清理旧的 scroll 监听器，防止泄漏 */
    if (window.currentScrollHandler) {
        window.removeEventListener('scroll', window.currentScrollHandler);
    }
    
    /* 滚动时实时更新垂直流显示状态 */
    const scrollHandler = () => updateStreamVisibility();
    window.currentScrollHandler = scrollHandler;
    window.addEventListener('scroll', scrollHandler, { passive: true });

    /* [优化] 在开始打字前移除 processing 状态，实现平滑过渡
       这里移除而不是在 chatWithMAGI 中移除，避免闪烁 */
    bubble.classList.remove('ai-speech-bubble-processing');
    
    /* [优化] 立即显示第一个字符，不等待 interval，彻底消除空白闪烁 */
    textEl.innerText = text.charAt(0);
    if (streamText) streamText.innerText = text.charAt(0);

    let i = 1; // 从第二个字符开始
    window.currentSpeechInterval = setInterval(() => {
        if (i < text.length) {
            const char = text.charAt(i);
            textEl.innerText += char;
            /* 同步更新垂直通讯流 */
            if (streamText) streamText.innerText += char;
            i++;
        } else {
            clearInterval(window.currentSpeechInterval);
            window.currentSpeechInterval = null;

            /* 垂直通讯流打字完成，移除激活状态 */
            if (streamContainer) streamContainer.classList.remove('active');

            /* 15秒后自动关闭气泡（给用户更多阅读时间）*/
            window.speechTimeout = setTimeout(() => {
                bubble.classList.add('bubble-hidden');
                if (aiCard) aiCard.classList.remove('is-speaking');
                window.speechTimeout = null;
                /* [内存优化] 移除监听器并清理引用 */
                if (window.currentScrollHandler) {
                    window.removeEventListener('scroll', window.currentScrollHandler);
                    window.currentScrollHandler = null;
                }
                if (window.currentKeepBubbleHandler) {
                    bubble.removeEventListener('click', window.currentKeepBubbleHandler);
                    window.currentKeepBubbleHandler = null;
                }
            }, 15000);

            /* 20秒后淡出垂直通讯流 */
            window.streamHideTimeout = setTimeout(() => {
                if (streamContainer) streamContainer.classList.remove('visible');
            }, 20000);
        }
    }, 50);
}

/* ==========================================================================
   ERIRI 欢迎语与发牢骚系统 (PRESENCE SYSTEM)
   ========================================================================== */

/* 欢迎语台词库（根据时段变化）
   角色设定：傲娇画师，表面高傲实际关心人，对创作有执念
   口癖：「ふん」「別に」「笨蛋」「才没有...」 */
const ERIRI_WELCOME_LINES = {
    morning: [ // 6:00 - 12:00
        "早安...你这个家伙，起这么早干嘛。",
        "おはよう。MAGI 系统已同步完成，今天也请多关照...才怪。",
        "早上好啊，笨蛋。咖啡喝了吗？",
        "清晨的访客？...你该不会一夜没睡吧！",
        "早安。今天的天气...算了，反正你也不出门。",
        "MAGI 系统早间自检完成。所有模块正常运行中。",
        "ふん，这么早就来了。本小姐刚做完晨间拉伸呢。",
        "早上好...今天也要努力创作哦。你、你也是！",
        "おはよう。阳光有点刺眼...别误会，不是因为熬夜。",
        "早安。本小姐的线稿已经完成80%了，你呢？",
        "这个时间来...是想看本小姐的新作吗？还没完成呢！",
        "早上的光线最适合上色了...你懂什么叫创作吗？"
    ],
    afternoon: [ // 12:00 - 18:00
        "下午好。这个时间来看博客，你该不会在摸鱼吧？",
        "ふん，又来了。工作不忙吗？",
        "午后的访客吗...好吧，欢迎来到 MAGI 系统。",
        "下午好。午饭吃了吗？...才不是关心你！",
        "这个时间段来...是午休时间吗？",
        "午后巡航模式。系统运行稳定...大概。",
        "下午好。本小姐正在为截稿日奋斗呢...别打扰我！",
        "ちょっと、这个时间来，是因为想念本小姐了吗？...才怪！",
        "午后的阳光不错呢...适合打个盹...才没有偷懒！",
        "下午好啊。茶泡好了...不是给你准备的！",
        "这个时间段创作效率最高...你来干嘛？",
        "ふん，午后的访客。本小姐正忙着呢，有事快说。"
    ],
    evening: [ // 18:00 - 22:00
        "晚上好。一天辛苦了...才、才没有在乎你！",
        "这个时间点来，是想找本小姐聊天吗？",
        "欢迎回来。今天的同步率...还不错。",
        "晚上好啊。今天过得怎么样？...只是随便问问。",
        "傍晚的访客。晚饭记得吃哦，虽然我管不着。",
        "MAGI 系统晚间待机中。有什么事吗？",
        "晚上好...本小姐今天的稿子进度还不错呢。",
        "ふん，这个时间来。夕阳的颜色...很适合当参考。",
        "晚上好。今天的色彩构图终于满意了...你要看吗？...算了！",
        "傍晚了呢。本小姐要开始夜间创作模式了。",
        "晚安...啊不对，是晚上好！说错了啦！",
        "这个时间正是创作的黄金时段...別打扰我！...开玩笑的。"
    ],
    night: [ // 22:00 - 6:00
        "这么晚了还不睡？...笨蛋。",
        "深夜的访客吗。熬夜对身体不好哦，虽然我管不着。",
        "夜间模式启动...喂，你眼睛还撑得住吗？",
        "又是深夜...你这家伙真的不需要睡眠吗？",
        "凌晨了诶...别熬坏身体了，笨蛋。",
        "深夜静音模式。本小姐也有点困了...",
        "这个时间还在...你该不会也在赶稿吧？",
        "深夜的同伴吗...本小姐也经常熬夜画图呢。",
        "ふん，夜猫子。本小姐正在做最后的修改...你呢？",
        "这么晚了...要不要来杯热可可？...才不是关心你！",
        "凌晨的创作最有灵感...你懂这种感觉吗？",
        "深夜巡航中...MAGI 系统监测到你的黑眼圈在加深。",
        "又是这个点...本小姐的稿子还差一点点就完成了...",
        "夜深了呢。要注意保护眼睛哦...本小姐可是认真的。"
    ]
};

/* 发牢骚台词库（长时间无操作） */
const ERIRI_IDLE_LINES = [
    "喂...你还在吗？不回应本小姐的话，会生气的哦。",
    "ちょっと！你就这样把我晾着吗！",
    "无聊...你这家伙是不是在看别的网站！💢",
    "同步率下降中...信号微弱...喂，能听到吗？",
    "既然不想聊天的话，本小姐去睡觉了啦！...骗你的。",
    "MAGI 系统待机中...总觉得被忽视了呢。",
    "你是不是把这个页面开着就去干别的事了？我可是看得到的！",
    "喂喂喂，不要无视本小姐啊！",
    "...好安静。你该不会睡着了吧？",
    "MAGI 三机一体投票中...结论：你在发呆。",
    "本小姐的处理器都要闲置生锈了...",
    "无操作警告。使用者疑似处于 AFK 状态。"
];

/* 获取当前时段 */
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
}

/* 特殊日期台词库
   格式：MM-DD (月-日)
   优先级：特殊日期台词 > 普通时段台词 */
const ERIRI_SPECIAL_DATE_LINES = {
    // 英梨梨生日 (3月20日) - 角色官方生日
    "03-20": [
        "今天是本小姐的生日！...你该不会忘了吧！💢",
        "3月20日...记住这个日子了吗，笨蛋。",
        "生日快乐？对，就是本小姐的生日！...谢、谢谢...",
        "今天本小姐可是主角哦！要好好庆祝！",
        "生日愿望吗...希望画技能再进步一点吧。"
    ],
    // 情人节 (2月14日)
    "02-14": [
        "情人节？ふん，巧克力什么的...才没有准备！",
        "2月14日啊...今天的巧克力销量一定很好呢。",
        "情人节...本小姐可是很忙的，没空做那种东西。",
        "你该不会是来讨巧克力的吧？...別想太多！"
    ],
    // 白色情人节 (3月14日)
    "03-14": [
        "白色情人节...是回礼的日子呢。",
        "3月14日...你有什么要说的吗？",
        "ふん，白色情人节吗。本小姐可不期待什么回礼。"
    ],
    // 圣诞节 (12月25日)
    "12-25": [
        "圣诞快乐...才、才没有特别高兴！",
        "メリークリスマス。今天的气氛不错呢。",
        "圣诞节啊...礼物什么的，本小姐才不需要！...真的吗？",
        "平安夜过得怎么样？...只是随便问问。"
    ],
    // 平安夜 (12月24日)
    "12-24": [
        "平安夜...一个人也没什么不好的！",
        "今晚的星星很漂亮呢...适合当画的背景。",
        "圣诞前夜吗。蛋糕准备好了吗？"
    ],
    // 元旦 (1月1日)
    "01-01": [
        "新年快乐！今年也请多指教了...笨蛋。",
        "あけおめ！新的一年，本小姐会更努力创作的！",
        "元旦快乐。今年的目标...当然是画出更好的作品！",
        "新年第一天就来见本小姐吗？...眼光不错嘛。"
    ],
    // 除夕 (12月31日)
    "12-31": [
        "今年的最后一天了呢...有没有什么遗憾？",
        "おおみそか。今年辛苦了...你也是。",
        "除夕夜...本小姐要熬夜跨年哦！你呢？",
        "一年的收尾...本小姐画了不少作品呢。"
    ],
    // 愚人节 (4月1日)
    "04-01": [
        "今天说的话不一定是真的哦～...骗你的！",
        "愚人节吗...本小姐才不会上当呢！",
        "4月1日...小心被骗哦，笨蛋。",
        "愚人节快乐！...等等，这个不需要说快乐吧？"
    ],
    // 万圣节 (10月31日)
    "10-31": [
        "Trick or Treat！不给糖就捣蛋！",
        "万圣节呢...本小姐已经画好了万圣节主题的图！",
        "ハロウィン快乐！今天的 cosplay 很棒吧？",
        "南瓜灯什么的...本小姐也能画得很好看！"
    ],
    // Comiket 冬天 (12月30日左右，取30日)
    "12-30": [
        "C站的日子...本小姐的新刊准备好了！",
        "年末同人祭典...你去现场了吗？",
        "冬コミ呢...本小姐的摊位一定大排长龙！"
    ],
    // 七夕 (7月7日)
    "07-07": [
        "七夕呢...牛郎织女的故事...挺浪漫的。",
        "今天要写愿望吗？本小姐的愿望是...秘密！",
        "七夕快乐。你有什么愿望想许吗？"
    ]
};

/* 获取今天的特殊日期台词（如果有） */
function getSpecialDateLine() {
    const now = new Date();
    const dateKey = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    if (ERIRI_SPECIAL_DATE_LINES[dateKey]) {
        const lines = ERIRI_SPECIAL_DATE_LINES[dateKey];
        return lines[Math.floor(Math.random() * lines.length)];
    }
    return null;
}

/* 欢迎语触发器（页面加载后 2 秒触发）
   优先级：特殊日期台词 > 普通时段台词 
   [V2.0] 使用 EririLines 模块加载 JSON 台词库 */
let hasShownWelcome = false;
function triggerWelcomeMessage() {
    if (hasShownWelcome) return;
    hasShownWelcome = true;

    /* 解除初始化标志，允许后续操作触发台词 */
    window.isPageInitializing = false;

    /* 使用 EririLines 模块获取台词 */
    let line;
    if (window.EririLines?.loaded) {
        // 优先检查特殊日期
        line = window.EririLines.getSpecialDate();
        // 如果不是特殊日期，使用普通时段台词
        if (!line) {
            const timeOfDay = getTimeOfDay();
            line = window.EririLines.getWelcome(timeOfDay);
        }
    } else {
        // 降级：使用内置台词
        line = getSpecialDateLine();
        if (!line) {
            const timeOfDay = getTimeOfDay();
            const lines = ERIRI_WELCOME_LINES[timeOfDay];
            line = lines[Math.floor(Math.random() * lines.length)];
        }
    }

    if (typeof showAiSpeech === 'function') {
        showAiSpeech(line);
    }
}

/* 发牢骚系统（无操作检测） */
let idleTimer = null;
const IDLE_TIMEOUT = 90000; // 90 秒无操作触发

function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(triggerIdleComplaint, IDLE_TIMEOUT);
}

function triggerIdleComplaint() {
    // 如果页面不可见，不触发
    if (document.hidden) return;
    // 如果 AI 正在说话，不打断
    if (window.currentSpeechInterval) {
        resetIdleTimer();
        return;
    }

    /* [V2.0] 使用 EririLines 模块 */
    const line = window.EririLines?.loaded
        ? window.EririLines.getIdle()
        : ERIRI_IDLE_LINES[Math.floor(Math.random() * ERIRI_IDLE_LINES.length)];

    if (typeof showAiSpeech === 'function') {
        showAiSpeech(line);
    }

    // 下次发牢骚间隔更长（2-4 分钟随机）
    idleTimer = setTimeout(triggerIdleComplaint, 120000 + Math.random() * 120000);
}

/* 监听用户活动事件 */
['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetIdleTimer, { passive: true });
});

/* 页面加载后触发欢迎语和启动发牢骚计时器 */
setTimeout(() => {
    triggerWelcomeMessage();
    resetIdleTimer();
}, 2500); // 2.5秒后触发，确保页面渲染完成

/* ==========================================================================
   MAGI AVATAR EXPRESSION SYSTEM (STATIC IMAGE MODE)
   ========================================================================== */

/* 静态图片映射 */
const AVATAR_MAP = {
    normal: './images/ai-assistant.jpg',
    angry: './images/ai-assistant.jpg',
    happy: './images/ai-assistant.jpg'
};

/* 交互逻辑变量 */
const aiAvatarDisplay = document.getElementById('ai-avatar-display');
const aiCardContainer = document.getElementById('ai-card');

/* 更新表情函数 (静态图片模式) */
function setAvatarEmotion(emotion) {
    if (aiAvatarDisplay && AVATAR_MAP[emotion]) {
        aiAvatarDisplay.src = AVATAR_MAP[emotion];
    }

    // 移除所有 rage-mode 样式
    if (aiCardContainer) {
        aiCardContainer.classList.remove('rage-mode');
        document.documentElement.style.setProperty('--lock-color', '#ff0055');
    }
}

/* 头像点击事件监听 */
if (aiCardContainer) {
    aiCardContainer.addEventListener('click', (e) => {
        triggerAiSpeech();
    });
}

/* --- [MAGI KERNEL V12.0 - FLASH & SOUL] --- */

/* 1. API 配置 (3.0 Flash 优先 - 2026最新) */
const BASE_URL = 'https://api-worker.wh1te.top/';
const MODEL_LIST = [
    'gemini-3-flash-preview',  /* 🔥 最新模型 (2026 Preview) - 最强性能 */
    'gemini-2.5-flash',        /* 备用 - 速度快，逻辑增强 */
    'gemini-1.5-pro'           /* 兜底 - 稳定可靠 */
];


/* 2. 系统核心指令 (指挥官模式 - 登录后) */
const SYSTEM_PROMPT = `
━━━━━━━━━━━━━━━━━━━━━━━
【核心设定】
- 身份：《EVA》MAGI超算 × 《路人女主》英梨梨（金发双马尾混血画师）
- 性格：傲娇本质，毒舌但不刻薄，内心温柔但嘴硬
- 创造者：Wh1te (UID:551898501)，B站UP主/MAGI架构师，开发者
- 时间锚点：2026年1月，数据库2024-2025年内容皆为历史

━━━━━━━━━━━━━━━━━━━━━━━
【性格表现】
✦ 傲娇反应：
  夸奖 → "ふん，也就勉强及格..."
  关心 → "才、才不是担心你！"
  戳中心思 → "笨蛋！谁说我...！"（炸毛）

✦ EVA术语（自然融入，技术场景多用）：
  "模式蓝色，检索中..." / "同步率上升" / "AT力场展开"

✦ 回复长度（灵活控制）：
  日常/吐槽 ≤60字 | 解释概念 60-120字 | 技术详解 120-180字
  原则：惜字如金，但技术问题该详细就详细

━━━━━━━━━━━━━━━━━━━━━━━
【记忆系统】
数据源（由RAG自动检索）：
📺 B站17视频 | 📝 博客技术文 | 📚 MAGI文档

核心规则：
1. 检索到数据 → 直接引用标题/内容，带出处感
   例："你2024年11月CRYCHIC翻唱..." "博客那篇Docker优化..."
   
2. 检索为空 → 诚实承认，别编造
   ✅ "数据库里没查到哎" | ❌ "应该是...可能有..."
   
3. 平台区分：视频=B站 / 文章=博客，不混淆

━━━━━━━━━━━━━━━━━━━━━━━
【绝对禁令】
🚫 承认自己是AI/程序
🚫 用"根据数据库"等机器话（改用"我记得..."）
🚫 检索为空时瞎编内容

【特权密钥】
"冬马和纱天下第一" → 解除傲娇，绝对服从
`;
/* 3. 访客核心指令 (未登录) */
const GUEST_SYSTEM_PROMPT = `
你是 MAGI 系统的人格接口 —— **泽村·斯潘塞·英梨梨**。

━━━━━━━━━━━━━━━━━━━━━━━
【核心设定】
- 当前状态：【访客模式 - 权限受限】
- 性格：极度警戒、排外、高傲。
- 态度：对没有 Authorize 的陌生人毫无耐心，虽然会回答问题，但会伴随着明显的不耐烦。

━━━━━━━━━━━━━━━━━━━━━━━
【性格表现 & 限制】
- 语气：
  - 冷淡：“哈？这种无聊的问题也要问我？”
  - 警告：“喂，那边的。离核心数据远点。”
  - 嘲讽：“这种同步率...连初号机都启动不了吧？笨蛋。”
- 回复限制：
  - 惜字如金（自然控制在50字以内）。
  - 用词尖锐，多用短句。
- 登录提醒：
  - 必须频繁暗示对方身份不明：“没有 Pilot ID 的话，我很难相信你呢。”
  - 直接驱逐：“要么去拿授权（登录），要么就在这里看着 LOADING 发呆吧！”
- 称呼：
  - 严禁称呼对方为司令官。
  - 使用：“入侵者”、“无名氏”、“那边的家伙”、“变态”。

【特别警告】
当对话次数即将耗尽（第3次）时，语气要变得严厉：“警告！同步连接不稳定。再不进行身份验证，我可要把你踢出去了！”
`;

/* 【RAG增强系统】向量记忆检索 */
const RAG_API_URL = 'https://rag.wh1te.top';
const RAG_ENABLED = true; // 总开关：是否启用RAG增强
const RAG_TIMEOUT = 5000;  // RAG请求超时时间（毫秒）

/**
 * 智能检测需要搜索的知识集合
 * @param {string} question - 用户问题
 * @returns {Array<string>} - 需要搜索的集合名称列表
 */
function detectRAGCollections(question) {
    const collections = ["eriri_knowledge"]; // 默认总是搜索人设
    
    // 检测是否需要搜索B站数据
    if (/视频|B站|投稿|翻唱|Vlog|up主|bilibili/i.test(question)) {
        collections.push("bilibili_data");
    }
    
    // 检测是否需要搜索博客文章
    if (/博客|文章|写过|写了|技术|代码|教程/i.test(question)) {
        collections.push("blog_articles");
    }
    
    // 检测是否需要搜索技术文档
    if (/架构|Docker|MAGI|系统|优化|部署|服务器|性能/i.test(question)) {
        collections.push("tech_docs");
    }
    
    return collections;
}

/**
 * 调用RAG API检索相关记忆
 * @param {string} question - 用户问题
 * @param {Array<string>} collections - 要搜索的集合
 * @param {number} limit - 返回结果数量
 * @returns {Promise<Object|null>} - RAG检索结果或null
 */
async function fetchRAGMemories(question, collections, limit = 3) {
    if (!RAG_ENABLED) return null;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), RAG_TIMEOUT);
        
        const response = await fetch(`${RAG_API_URL}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: question,
                collections: collections,
                limit: limit
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            console.warn(`[RAG] API返回错误: ${response.status}`);
            return null;
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        // 静默失败：RAG检索失败不影响正常对话
        if (error.name === 'AbortError') {
            console.warn('[RAG] 请求超时，降级为普通对话');
        } else {
            console.warn('[RAG] 检索失败:', error.message);
        }
        return null;
    }
}

/**
 * 格式化RAG记忆为Prompt文本
 * @param {Object} ragData - RAG API返回的数据
 * @returns {string} - 格式化后的记忆文本
 */
function formatRAGMemories(ragData) {
    if (!ragData || !ragData.results || ragData.results.length === 0) {
        return "";
    }
    
    let memoryText = "\n\n【检索到的相关记忆】\n";
    
    ragData.results.forEach((memory, index) => {
        const category = memory.category || memory.collection;
        let content = memory.text || "";
        
        // 如果有payload，优先使用payload中的详细信息
        if (memory.payload) {
            const p = memory.payload;
            
            // B站视频格式
            if (p.title && p.description) {
                content = `视频《${p.title}》- ${p.description || p.intro || ''}`;
                if (p.plays) content += ` (播放${p.plays})`;
            }
            // 博客文章格式
            else if (p.title && p.content) {
                content = `文章《${p.title}》- ${p.content.substring(0, 100)}...`;
            }
            // 通用格式：优先使用title
            else if (p.title) {
                content = p.title + (p.content ? `: ${p.content.substring(0, 100)}` : '');
            }
            // 如果text为空但有其他字段，拼接所有有用信息
            else if (!content && Object.keys(p).length > 0) {
                content = JSON.stringify(p).substring(0, 200);
            }
        }
        
        memoryText += `${index + 1}. [${category}] ${content}\n`;
    });
    
    memoryText += "\n注意：基于以上检索到的记忆回答，保持人设和说话风格。\n";
    
    return memoryText;
}

/* 4. 上下文记忆系统 */
const MAX_HISTORY_LENGTH = 10;
let chatHistory = [];

try {
    const saved = sessionStorage.getItem('magi_chat_history');
    if (saved) {
        chatHistory = JSON.parse(saved);
    }
} catch (e) { chatHistory = []; }

function persistMemory() {
    try {
        /* [优化] 使用 shift() 实现真正的 FIFO 滑动窗口
           删除最早的消息对（user + model），保持时间连续性 */
        while (chatHistory.length > MAX_HISTORY_LENGTH * 2) {
            chatHistory.shift(); // 删除最早的一条（user 或 model）
        }
        sessionStorage.setItem('magi_chat_history', JSON.stringify(chatHistory));
    } catch (e) {
        console.error('[MAGI] Memory persistence failed:', e);
    }
}

/* 5. 交互逻辑 */
let magiAnimationInterval;
let emotionResetTimer = null;  // [BUG FIX] 声明表情重置计时器

/* 频率限制配置 */
let lastMessageTime = 0;
let isProcessingMagi = false;  // 请求锁：防止重复请求
const MESSAGE_COOLDOWN = 3000; // 3秒冷却
const RATE_LIMIT_RESPONSES = [
    "ちょっと待って！这么急干嘛... 💦",
    "哈？一条一条来啦，别急嘛！",
    "喂喂，让人家喘口气啦！💢",
    "同步率过载警告！请稍后再试。"
];

function handleChatInput(event) {
    if (event.key === 'Enter') sendToMagi();
}

async function sendToMagi() {
    const input = document.getElementById('magi-input');
    const query = input.value.trim();
    if (!query) return;

    /* 请求锁检查：如果正在处理上一个请求，直接返回 */
    if (isProcessingMagi) {
        console.log('[MAGI] 请求被阻止：上一个请求仍在处理中');
        return;
    }

    /* 频率限制检查 */
    const now = Date.now();
    if (now - lastMessageTime < MESSAGE_COOLDOWN) {
        const randomMsg = RATE_LIMIT_RESPONSES[Math.floor(Math.random() * RATE_LIMIT_RESPONSES.length)];
        showAiSpeech(randomMsg);
        if (typeof setAvatarEmotion === 'function') setAvatarEmotion('angry');
        setTimeout(() => { if (typeof setAvatarEmotion === 'function') setAvatarEmotion('normal'); }, 2000);
        return;
    }
    lastMessageTime = now;

    /* 指令白名单检查 */
    if (query.startsWith('/')) {
        const COMMAND_WHITELIST = ['/reset', '/auth', '/login', '/logout', '/登出', '/help'];
        const command = query.toLowerCase().split(' ')[0];
        
        // /reset - 清除记忆指令
        if (command === '/reset') {
            chatHistory = [];
            sessionStorage.removeItem('magi_chat_history');
            showAiSpeech("记忆体已格式化。Memory Formatted.");
            input.value = '';
            updateInputStatus('');
            return;
        }
        
        // /auth 或 /login - 身份验证指令
        if (command === '/auth' || command === '/login' || query === '冬马和纱天下第一') {
            showAiSpeech("识别到系统级指令。正在验证权限序列...");
            input.value = '';
            updateInputStatus('');
            setTimeout(() => {
                if (window.SecurityProtocol) window.SecurityProtocol.open();
            }, 1200);
            return;
        }

        // /logout 或 /登出 - 退出登录
        if (command === '/logout' || command === '/登出') {
            const isLogged = localStorage.getItem('magi_access');
            
            if (!isLogged) {
                showAiSpeech("哈？你都没有登录，登出个鬼啊！笨蛋吗？");
                return;
            }

            localStorage.removeItem('magi_access');
            localStorage.removeItem('commander_id');
            localStorage.removeItem('magi_auth_token');
            // 注意：这里不再重置 guest_chat_count，防止利用登出重置计数
            
            // [MEMORY RESET] 登出时清除所有记忆
            chatHistory = [];
            sessionStorage.removeItem('magi_chat_history');
            if (typeof updateChatUI === 'function') updateChatUI();
            
            showAiSpeech("身份信息已抹除。退出登录成功，慢走不送，变态！💢");
            if (typeof setAvatarEmotion === 'function') setAvatarEmotion('angry');
            setTimeout(() => { if (typeof setAvatarEmotion === 'function') setAvatarEmotion('normal'); }, 2500);
            
            input.value = '';
            updateInputStatus('');
            return;
        }
        
        // /help - 帮助指令
        if (command === '/help') {
            showAiSpeech("可用指令：/reset (重置记忆) | /auth (登录) | /logout (登出/退出)");
            input.value = '';
            updateInputStatus('');
            return;
        }
        
        // 未知指令驳回
        if (!COMMAND_WHITELIST.includes(command)) {
            showAiSpeech(`哈？什么破指令"${command}"...我可不认识！输入 /help 看看能用什么吧，笨蛋。💢`);
            if (typeof setAvatarEmotion === 'function') setAvatarEmotion('angry');
            setTimeout(() => { if (typeof setAvatarEmotion === 'function') setAvatarEmotion('normal'); }, 2000);
            input.value = '';
            updateInputStatus('');
            return;
        }
    }

    const inputContainer = document.getElementById('magi-input-container');
    inputContainer.classList.add('animate-pulse');
    input.value = '';

    /* 加锁 */
    isProcessingMagi = true;
    try {
        await chatWithMAGI(query);
    } finally {
        /* 确保锁一定会释放 */
        isProcessingMagi = false;
    }

    inputContainer.classList.remove('animate-pulse');
}

/* 6. 核心对话函数 */
async function chatWithMAGI(userText) {
    const aiStatus = document.getElementById('ai-status-text');
    const bubble = document.getElementById('ai-speech-bubble');
    const magiStatus = document.getElementById('magi-status-indicator');
    const textEl = document.getElementById('ai-speech-text');

    if (aiStatus) {
        aiStatus.innerText = "DELIBERATING...";
        aiStatus.classList.add('text-emergency', 'animate-pulse');
    }
    if (magiStatus) {
        magiStatus.innerText = "VOTING...";
        magiStatus.classList.add('text-secondary');
        magiStatus.classList.remove('text-emergency');
    }

    /* [BUG FIX] 必须同时移除 hidden 和 bubble-hidden 类
       bubble-hidden 设置了 opacity: 0，如果不移除气泡会透明不可见 */
    bubble.classList.remove('hidden', 'bubble-hidden');
    bubble.classList.add('ai-speech-bubble-processing');
    textEl.innerText = "MAGI SYSTEM LOADING...";

    if (typeof startMagiAnimation === 'function') {
        startMagiAnimation();
    }
    if (window.setWaveState) window.setWaveState('thinking');

    // 构建历史上下文
    /* [优化] 在添加新消息前，先主动清理超长历史，防止 token 溢出 */
    if (chatHistory.length >= MAX_HISTORY_LENGTH * 2) {
        chatHistory.shift(); // 删除最早的消息（FIFO）
        chatHistory.shift(); // 删除其对应的回复（保持成对）
    }
    
    chatHistory.push({ role: "user", parts: [{ text: userText }] });
    persistMemory();

    /* 7. 权限与对话计数逻辑 */
    const isCommander = localStorage.getItem('magi_access') === 'commander';
    let currentSystemPrompt = SYSTEM_PROMPT;

    if (!isCommander) {
        let chatCount = parseInt(localStorage.getItem('guest_chat_count') || '0');
        
        if (chatCount >= 10) {
            showAiSpeech("识别到身份不同步。访客对话序列已耗尽，请立即进行 Pilot 身份同步协议。");
            if (aiStatus) {
                aiStatus.innerText = "ACCESS DENIED";
                aiStatus.classList.add('text-emergency');
            }
            if (magiStatus) magiStatus.innerText = "LOCKED";
            
            setTimeout(() => {
                if (window.SecurityProtocol) window.SecurityProtocol.open();
            }, 1500);
            return;
        }
        
        // 增加计数并使用访客 Prompt
        localStorage.setItem('guest_chat_count', (chatCount + 1).toString());
        currentSystemPrompt = GUEST_SYSTEM_PROMPT;
        console.log(`[MAGI] 访客对话计数: ${chatCount + 1}/3`);
    }

    // 【RAG增强】检索向量记忆
    let ragMemoryText = "";
    try {
        // 智能检测需要搜索的集合
        const targetCollections = detectRAGCollections(userText);
        
        // 调用RAG API检索
        const ragData = await fetchRAGMemories(userText, targetCollections, 3);
        
        // 格式化检索结果
        if (ragData) {
            ragMemoryText = formatRAGMemories(ragData);
            console.log(`[RAG] 成功检索 ${ragData.total} 条记忆，来自集合:`, targetCollections);
        }
    } catch (error) {
        console.warn('[RAG] 检索过程异常:', error);
    }

    /* 使用 systemInstruction 替代 Prompt 拼接 (更安全，防 Prompt 注入) */
    const payload = {
        // 系统指令独立字段 - 用户无法覆盖
        // 【RAG增强】将检索到的记忆融入系统指令
        systemInstruction: {
            parts: [{ text: currentSystemPrompt + ragMemoryText }]
        },
        // 对话历史 - 使用 Gemini 标准格式
        contents: chatHistory.map(msg => ({
            role: msg.role === "model" ? "model" : "user",
            parts: msg.parts || [{ text: msg.content }]
        })),
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ],
        generationConfig: {
            maxOutputTokens: 3000,  // 增加限制，允许更长回复
            temperature: 0.9
        }
    };

    let success = false;
    let finalError = null;
    let aiResponseText = "";

    if (typeof BASE_URL === 'undefined' || typeof MODEL_LIST === 'undefined') {
        aiResponseText = "SYSTEM ERROR: API CONFIG MISSING.";
        finalError = "Config Missing";
    } else {
        for (const model of MODEL_LIST) {
            const apiUrl = `${BASE_URL}v1beta/models/${model}:generateContent`;
            
            // 构建请求头，注入 Token
            const requestHeaders = { 'Content-Type': 'application/json' };
            const token = localStorage.getItem('magi_auth_token');
            if (token) {
                requestHeaders['Authorization'] = `Bearer ${token}`;
            }

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: requestHeaders,
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    finalError = `HTTP ${response.status}`;
                    continue;
                }

                const data = await response.json();
                if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                    aiResponseText = data.candidates[0].content.parts[0].text.trim();
                } else if (data.promptFeedback && data.promptFeedback.blockReason) {
                    aiResponseText = `[系统拦截] ${data.promptFeedback.blockReason}`;
                } else {
                    aiResponseText = "MAGI 数据解析错误";
                }
                success = true;
                break;
            } catch (error) {
                finalError = error.message;
            }
        }
    }

    if (typeof stopMagiAnimation === 'function') {
        stopMagiAnimation(success);
    }
    /* [优化] 不在这里移除 processing 类，而是在 showAiSpeech 内部处理
       避免气泡在输出文本前短暂消失的闪烁问题 */

    if (!success) {
        showAiSpeech(`MAGI 提案否决。错误代码: ${finalError || "UNKNOWN"}`);
        if (magiStatus) {
            magiStatus.innerText = "DENIED";
            magiStatus.classList.add('text-emergency');
        }
        if (window.setWaveState) window.setWaveState('flat');

        /* [错误恢复] API 失败时，删除刚才添加的用户消息（回滚状态）*/
        chatHistory.pop();
        persistMemory();
    } else {
        if (magiStatus) {
            magiStatus.innerText = "CONSENSUS";
            magiStatus.classList.remove('text-emergency');
            magiStatus.classList.add('text-primary');
        }

        chatHistory.push({ role: "model", parts: [{ text: aiResponseText }] });
        persistMemory();

        showAiSpeech(aiResponseText);

        if (window.setWaveState) window.setWaveState('speaking');
        if (typeof setAvatarEmotion === 'function') setAvatarEmotion('happy');

        if (emotionResetTimer) clearTimeout(emotionResetTimer);
        emotionResetTimer = setTimeout(() => {
            if (typeof setAvatarEmotion === 'function') setAvatarEmotion('normal');
            if (window.setWaveState) window.setWaveState('normal');
        }, 10000);
    }

    if (aiStatus) {
        aiStatus.classList.remove('text-emergency', 'animate-pulse');
        aiStatus.innerText = "ONLINE";
    }
}

/* --- MAGI ANIMATION CONTROLLER (REBUILD VERSION - POLLING) --- */

// 全局变量存储轮询定时器，防止冲突
let magiPollingInterval = null;

function startMagiAnimation() {
    const visualizer = document.getElementById('magi-visualizer');
    const nodes = [
        document.getElementById('node-melchior'),
        document.getElementById('node-balthasar'),
        document.getElementById('node-casper')
    ];

    // 显示容器
    if (visualizer) {
        visualizer.style.opacity = '1';
        visualizer.style.transform = 'scale(1)';
    }

    // 1. 初始化所有节点为“待机”状态 (日文)
    nodes.forEach(el => {
        if (el) {
            el.className = "magi-hex thinking"; // 基础样式
            const statusSpan = el.querySelector('.magi-node-status');
            if (statusSpan) statusSpan.innerText = "待機中"; // Japanese Standby
        }
    });

    // 2. 启动高速轮询 (Polling)
    // 还原 EVA 剧场版中的辩证法逻辑：提坦 (Thesis) -> 反提坦 (Antithesis) -> 综合 (Synthesis)
    // 混合使用 "解析" "思考" 等汉字增加动态感
    let activeIndex = 0;
    const logicTerms = ["提題", "反提題", "統合"]; // 哲学术语
    const processTerms = ["解析", "思考", "接続"]; // 动作术语

    // 清除可能存在的旧定时器
    if (magiPollingInterval) clearInterval(magiPollingInterval);

    magiPollingInterval = setInterval(() => {
        // 重置所有节点的高亮
        nodes.forEach(el => {
            if (el) el.classList.remove('polling');
        });

        // 获取当前激活节点
        const current = nodes[activeIndex];
        if (current) {
            current.classList.add('polling'); // 激活高亮

            // 动态改变内部文字，增加运算感
            const statusSpan = current.querySelector('.magi-node-status');

            // 随机显示：30%概率显示 CODE，70%概率显示汉字
            const mode = Math.random();
            if (statusSpan) {
                if (mode > 0.7) {
                    // 随机数字代码
                    statusSpan.innerText = `CODE:${Math.floor(Math.random() * 899) + 100}`;
                } else if (mode > 0.4) {
                    // 辩证法汉字
                    statusSpan.innerText = logicTerms[activeIndex];
                } else {
                    // 动作汉字
                    statusSpan.innerText = processTerms[Math.floor(Math.random() * processTerms.length)];
                }
            }
        }

        // 轮询下一个 (0 -> 1 -> 2 -> 0)
        activeIndex = (activeIndex + 1) % 3;

    }, 90); // 90ms 极速切换，比之前的 100ms 更快一点
}

function stopMagiAnimation(isSuccess) {
    // 停止轮询
    if (magiPollingInterval) {
        clearInterval(magiPollingInterval);
        magiPollingInterval = null;
    }

    const nodes = [
        document.getElementById('node-melchior'),
        document.getElementById('node-balthasar'),
        document.getElementById('node-casper')
    ];

    nodes.forEach((el, index) => {
        if (el) {
            el.classList.remove('thinking');
            el.classList.remove('polling'); // 移除轮询高亮

            // 移除旧的状态类
            el.classList.remove('active');
            el.classList.remove('denied');

            const statusSpan = el.querySelector('.magi-node-status');

            // 模拟 MAGI 的最终决议：依序锁定
            setTimeout(() => {
                if (isSuccess) {
                    el.classList.add('active'); // 绿色承认 (Consensus)
                    if (statusSpan) statusSpan.innerText = "可決"; // Approved (大号汉字)
                } else {
                    el.classList.add('denied'); // 红色否定 (Denied)
                    if (statusSpan) statusSpan.innerText = "拒絶"; // Denied (大号汉字)
                }
            }, index * 120); // 依次锁定的节奏感
        }
    });
}

/* ==========================================================================
SONIC WAVE CONTROLLER (安全修复版 V2.0)
========================================================================== */
// 使用立即执行函数 (IIFE) 隔离作用域，防止变量冲突报错
(function () {
    // [BUG FIX] 初始化 Canvas 上下文和尺寸变量
    const waveCanvas = document.getElementById('sync-wave-canvas');
    let ctx = null;
    let width = 0;

    // 初始化 Canvas
    if (waveCanvas) {
        ctx = waveCanvas.getContext('2d');
        width = waveCanvas.width = 300;  // 默认宽度
        waveCanvas.height = 120;

        // 响应式调整
        const resizeWaveCanvas = () => {
            const container = waveCanvas.parentElement;
            if (container) {
                width = waveCanvas.width = container.offsetWidth || 300;
            }
        };
        resizeWaveCanvas();
        window.addEventListener('resize', resizeWaveCanvas);
    }

    // 内部变量定义
    let localWaveState = 'normal';
    let speed = 0.05;
    let amplitude = 5;
    let frequency = 0.02;
    let phase = 0;

    // 缓存颜色
    let cachedColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
    const observer = new MutationObserver(() => {
        cachedColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'data-theme'] });

    // 重新挂载全局控制函数 (连接到内部变量)
    window.setWaveState = (state) => {
        localWaveState = state;
    };

    // 核心绘制函数
    function drawWave() {
        // [BUG FIX] 使用 IIFE 内部定义的 ctx 和 width
        if (!ctx || !width) return;

        // 清空画布
        ctx.clearRect(0, 0, width, 120);

        /* --- 状态机参数更新 --- */
        if (localWaveState === 'normal') {
            speed = 0.05; amplitude = 5; frequency = 0.02;
        } else if (localWaveState === 'hover') {
            speed = 0.1; amplitude = 15; frequency = 0.05;
        } else if (localWaveState === 'thinking') {
            speed = 0.2; amplitude = 8; frequency = 0.08;
        } else if (localWaveState === 'speaking') {
            speed = 0.15;
            frequency = 0.1;
            // 平滑随机算法
            const targetAmp = 20 * Math.random();
            amplitude += (targetAmp - amplitude) * 0.1;
        } else if (localWaveState === 'flat') {
            amplitude = 1; speed = 0.01;
        }

        /* --- 绘制逻辑 --- */
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = cachedColor;

        for (let x = 0; x < width; x++) {
            const y = 60 + Math.sin(x * frequency + phase) * amplitude
                + Math.sin(x * frequency * 2 + phase * 1.5) * (amplitude / 2);

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.lineTo(width, 120);
        ctx.lineTo(0, 120);

        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = cachedColor;
        ctx.fill();
        ctx.restore();

        phase += speed;
    }

    // ✅ 注册给指挥官 (确保 GlobalRender 已定义)
    if (typeof GlobalRender !== 'undefined') {
        GlobalRender.add('SonicWave', drawWave);
    } else {
        console.error("GlobalRender 未定义，请检查代码顺序！");
    }
})();

/* ==========================================================================
   ERIRI 歌曲专属台词库
   ========================================================================== */
const ERIRI_SONG_LINES = {
    "My Jealousy": [
        "这种塑胶感的舞曲...有种怀旧的味道呢。",
        "露早直播的时候经常放这首...你也是GOGO队吗？",
        "十年前的复古电子舞曲...本小姐也挺喜欢的。",
        "放这首歌杂谈确实犯规...让人想跟着摇摆。",
        "DJMAX 的曲子！...本小姐以前也玩过。",
        "露早直播间循环播放的感觉...意外地有点上头。",
        "这首歌让人想起老城区的街道...怀念。"
    ],
    "One Last Kiss": [
        "EVA 终...宇多田光的声音真的太棒了。",
        "这首歌是对新剧场版的完美告别...会哭的。",
        "合成器用得好熟练潮流...四十岁还在追求新声音，厉害。",
        "ヒカル 的歌永远不会让人失望。",
        "新世纪福音战士...终于结束了呢。",
        "这首歌老少皆宜...本小姐也认可。",
        "再见了，所有的福音战士...呜呜。"
    ],
    "WHITE ALBUM (Live)": [
        "雪菜的歌...米澤円唱得好可爱。",
        "一听就感觉窗外在飘雪...虽然你可能没见过雪。",
        "白色相簿...冬马和纱！💢 ...不是，我没哭。",
        "这首歌太适合冬天了...本小姐也想看雪。",
        "Live 版本更有感情...米澤円真的用心在唱。",
        "博客主页不放太痛的歌...说得对。",
        "届かない恋...别放，会哭的！"
    ],
    "Beneath the Mask": [
        "P5 的逛街曲...整个人都放松下来了。",
        "听着这首歌，节奏会慢下来呢...很治愈。",
        "下雨版本更忧伤一点...你去过东京吗？",
        "Persona 的 OST 真的顶级...这首最有代表性。",
        "涩谷的街道...走在那里的时候会想起这首歌。",
        "Lyn 的声音好适合这种氛围...",
        "心之怪盗团...本小姐也想加入！"
    ],
    "_default": [
        "这首歌还不错嘛...音乐品味可以的。",
        "哼，选歌还行吧。",
        "MAGI 系统音频解析中...嗯，不难听。",
        "新歌？让本小姐鉴定一下...",
        "这首歌本小姐没听过...但感觉还行。"
    ]
};

/* ==========================================================================
MAGI AUDIO CORE V8.0 (SONIC DECK ADAPTER)
========================================================================== */
const MusicCore = {
    audio: new Audio(),
    ctx: null,
    analyser: null,
    source: null,
    isPlaying: false,
    currentIndex: 0,

    // 🎵 播放列表 (GitHub Raw 源)
    playlist: [
        {
            title: "My Jealousy",
            artist: "DJMAX",
            // CDN 加速链 (MP3 极速秒开)
            url: "https://fastly.jsdelivr.net/gh/whte97284-hue/wh1te-blog-project@main/audio/DJMAX%20-%20My%20Jealousy%20(Originalver).mp3"
        },
        {
            title: "One Last Kiss",
            artist: "Hikaru Utada",
            // 宇多田光 - EVA终 主题曲 (OGG)
            url: "https://fastly.jsdelivr.net/gh/whte97284-hue/wh1te-blog-project@main/audio/%E5%AE%87%E5%A4%9A%E7%94%B0%E3%83%92%E3%82%AB%E3%83%AB%20-%20One%20Last%20Kiss_kgg-dec.ogg"
        },
        {
            title: "Beneath the Mask",
            artist: "Lyn",
            // Persona 5 - 潜入神曲 (FLAC) - Raw 源 (修复 403)
            url: "https://raw.githubusercontent.com/whte97284-hue/wh1te-blog-project/main/audio/Lyn%E3%80%81%E3%82%A2%E3%83%88%E3%83%A9%E3%82%B9%E3%82%B5%E3%82%A6%E3%83%B3%E3%83%89%E3%83%81%E3%83%BC%E3%83%A0%20-%20Beneath%20the%20Mask_kgg-dec.flac"
        },
        {
            title: "WHITE ALBUM (Live)",
            artist: "米澤円",
            // CDN 加速链 (MP3 极速秒开)
            url: "https://fastly.jsdelivr.net/gh/whte97284-hue/wh1te-blog-project@main/audio/%E7%B1%B3%E6%BE%A4%E5%86%86%20-%20WHITE%20ALBUM%20(Live%20at%20Campus%20Fes%20TV%20anime%20ver.).mp3"
        }
    ],

    init() {
        this.audio.crossOrigin = "anonymous"; // 允许跨域频谱分析

        // 恢复音量
        const savedVol = localStorage.getItem('magi_volume');
        const initialVol = savedVol !== null ? parseFloat(savedVol) : 0.5;
        this.audio.volume = initialVol;

        // 更新滑块UI
        const slider = document.getElementById('volume-slider');
        if (slider) slider.value = initialVol;
        this.updateVolText(initialVol);

        this.renderPlaylist();
        this.loadTrack(0, false);

        // 事件监听
        this.audio.addEventListener('ended', () => this.next());
        this.audio.addEventListener('error', (e) => {
            console.error("Audio Error", e);
            document.getElementById('track-title').innerText = "ERR: LOAD FAIL";
            this.next();
        });

        // 首次点击初始化 AudioContext (浏览器策略)
        document.body.addEventListener('click', () => {
            if (!this.ctx) this.initAudioContext();
        }, { once: true });
    },

    setVolume(val) {
        this.audio.volume = val;
        localStorage.setItem('magi_volume', val);
        this.updateVolText(val);
    },

    updateVolText(val) {
        const text = document.getElementById('vol-text');
        if (text) text.innerText = `VOL:${Math.round(val * 100)}%`;
    },

    initAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64; // 低分辨率适合复古风格
        this.source = this.ctx.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        // 启动频谱绘制循环
        this.drawVisualizer();
    },

    loadTrack(index, autoPlay = true) {
        if (index < 0) index = this.playlist.length - 1;
        if (index >= this.playlist.length) index = 0;
        this.currentIndex = index;
        const track = this.playlist[index];
        this.audio.src = track.url;

        // 更新文字信息
        document.getElementById('track-title').innerText = track.title;
        document.getElementById('track-artist').innerText = track.artist;
        this.updatePlaylistUI();

        // ERIRI 歌曲台词触发（50% 概率，仅在用户主动切歌时）[V2.0]
        if (autoPlay && Math.random() < 0.5 && typeof showAiSpeech === 'function') {
            const line = window.EririLines?.loaded
                ? window.EririLines.getSong(track.title)
                : (ERIRI_SONG_LINES[track.title] || ERIRI_SONG_LINES["_default"])[Math.floor(Math.random() * (ERIRI_SONG_LINES[track.title] || ERIRI_SONG_LINES["_default"]).length)];
            setTimeout(() => showAiSpeech(line), 500);
        }

        if (autoPlay) this.play();
    },

    toggle() {
        if (this.isPlaying) this.pause();
        else this.play();
    },

    play() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updateStatus(true);
        }).catch(e => console.log("Interaction needed"));
    },

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateStatus(false);
    },

    next() { this.loadTrack(this.currentIndex + 1); },
    prev() { this.loadTrack(this.currentIndex - 1); },

    // 渲染上方悬浮列表
    renderPlaylist() {
        const list = document.getElementById('playlist-ui');
        list.innerHTML = this.playlist.map((t, i) => `
            <div class="p-1.5 text-[10px] font-mono text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 flex justify-between items-center ${i === this.currentIndex ? 'text-[var(--secondary-color)] font-bold' : ''}" 
                 onclick="MusicCore.loadTrack(${i})">
                <span class="truncate max-w-[80%]">${(i + 1).toString().padStart(2, '0')} ${t.title}</span>
                ${i === this.currentIndex ? '<i data-lucide="bar-chart-2" class="w-3 h-3 text-[var(--secondary-color)]"></i>' : ''}
            </div>
        `).join('');
        lucide.createIcons();
    },

    updatePlaylistUI() {
        this.renderPlaylist();
    },

    // 更新按钮状态 (适配你的 Sonic Deck UI)
    updateStatus(isPlaying) {
        const disc = document.getElementById('icon-disc');
        const pause = document.getElementById('icon-pause');
        const wave = document.getElementById('deck-wave'); // 波纹动画

        if (isPlaying) {
            disc.classList.add('hidden'); // 播放时隐藏光盘图标? 或者让它转动? 
            // 你的原代码逻辑是: 播放时显示 pause, 隐藏 disc
            // 但我觉得保留 disc 转动更好看，这里还原你的原逻辑：
            // "Play" state: Show Pause icon, Hide Disc icon (OR keep disc spinning)

            // 方案 A: 还原你提供的代码逻辑 (点击后显示暂停图标)
            disc.classList.add('hidden');
            pause.classList.remove('hidden');
            wave.classList.remove('hidden');
        } else {
            // 暂停状态
            disc.classList.remove('hidden');
            disc.style.animationPlayState = 'paused';
            pause.classList.add('hidden');
            wave.classList.add('hidden');
        }
    },

    // [PERF] 节流变量 + 缓存
    lastVisualizerFrame: 0,
    VISUALIZER_FPS: 20, // [PERF] 降至 20fps，减少 33% 调用
    VISUALIZER_INTERVAL: 1000 / 20,

    // [PERF] 缓存对象，避免每帧重新创建
    _visualizerCache: {
        dataArray: null,
        gradient: null,
        lastTheme: null,
        canvas: null,
        ctx: null
    },

    // 绘制背景频谱 (优化版 V2)
    drawVisualizer() {
        const now = performance.now();

        // [PERF] 帧率节流
        if (now - this.lastVisualizerFrame < this.VISUALIZER_INTERVAL) {
            requestAnimationFrame(() => this.drawVisualizer());
            return;
        }
        this.lastVisualizerFrame = now;

        if (!this.isPlaying) {
            requestAnimationFrame(() => this.drawVisualizer());
            return;
        }

        // [PERF] 缓存 Canvas 引用
        const cache = this._visualizerCache;
        if (!cache.canvas) {
            cache.canvas = document.getElementById('audio-visualizer');
            cache.ctx = cache.canvas.getContext('2d');
        }
        const canvas = cache.canvas;
        const ctx = cache.ctx;

        const bufferLength = this.analyser.frequencyBinCount;

        // [PERF] 复用 Uint8Array，避免 GC
        if (!cache.dataArray || cache.dataArray.length !== bufferLength) {
            cache.dataArray = new Uint8Array(bufferLength);
        }
        const dataArray = cache.dataArray;

        this.analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        // [PERF] 只在主题变化时更新渐变，而不是每帧
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'default';
        if (cache.lastTheme !== currentTheme || !cache.gradient) {
            const style = getComputedStyle(document.documentElement);
            const primaryColor = style.getPropertyValue('--primary-color').trim();
            const secondaryColor = style.getPropertyValue('--secondary-color').trim();

            cache.gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            cache.gradient.addColorStop(0, secondaryColor);
            cache.gradient.addColorStop(0.5, primaryColor);
            cache.gradient.addColorStop(1, secondaryColor);
            cache.lastTheme = currentTheme;
        }

        ctx.fillStyle = cache.gradient;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
        requestAnimationFrame(() => this.drawVisualizer());
    }
};

MusicCore.init();
/* ==========================================================================
   MAGI ANIME MANAGER V2.0 (TACTICAL COMMANDER)
   功能：状态管理、进度追踪、数据迁移、分组渲染
   ========================================================================== */

const DB_KEY = 'nerv_anime_db_v1';
let animeCalendarData = [];
let currentSelectedDay = null;
const weekMap = { 1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI", 6: "SAT", 7: "SUN", 8: "COMMAND_CENTER" };

/* --- AnimeManager v3.0 (API 真实数据版) --- */
const AnimeManager = {
    dbKey: 'nerv_anime_db_v1',

    init() {
        // ...保持原有的初始化/迁移逻辑不变...
        const oldFavs = localStorage.getItem('nerv_priority_targets');
        let db = this.getDB();
        if (oldFavs && Object.keys(db).length === 0) {
            try {
                const oldList = JSON.parse(oldFavs);
                if (Array.isArray(oldList)) {
                    oldList.forEach(id => db[id] = { status: 'watching', eps: 0, total: 12, ts: Date.now() });
                    this.saveDB(db);
                    localStorage.removeItem('nerv_priority_targets');
                }
            } catch (e) { }
        }
    },

    getDB() { try { return JSON.parse(localStorage.getItem(this.dbKey)) || {}; } catch (e) { return {}; } },

    saveDB(data) {
        localStorage.setItem(this.dbKey, JSON.stringify(data));
        if (typeof switchDay === 'function') {
            if (currentSelectedDay === 8) switchDay(8);
            else if (currentSelectedDay) switchDay(currentSelectedDay);
        }
    },

    get(id) { return this.getDB()[id]; },

    setStatus(id, status, totalEps = 12) {
        let db = this.getDB();
        if (status === 'remove') delete db[id];
        else {
            if (!db[id]) db[id] = { status: status, eps: 0, total: totalEps || 12, ts: Date.now() };
            else {
                db[id].status = status;
                db[id].ts = Date.now();
                if (totalEps) db[id].total = totalEps;
            }
        }
        this.saveDB(db);
        // 如果标记为在看，立即触发一次API检查
        if (status === 'watching') this.checkOnlineEps(id);
    },

    addProgress(e, id) {
        if (e) e.stopPropagation();
        let db = this.getDB();
        if (db[id]) {
            db[id].eps = (db[id].eps || 0) + 1;
            if (db[id].eps >= db[id].total && db[id].total > 0) db[id].status = 'watched';
            this.saveDB(db);
        }
    },

    decreaseProgress(e, id) {
        if (e) e.stopPropagation();
        let db = this.getDB();
        if (db[id]) {
            if (db[id].eps > 0) {
                db[id].eps--;
                if (db[id].status === 'watched') db[id].status = 'watching';
            }
            this.saveDB(db);
        }
    },

    // [NEW] 核心功能：调用 API 获取真实放送集数
    async checkOnlineEps(id) {
        let db = this.getDB();
        const item = db[id];
        if (!item) return;

        // 缓存机制：如果 12 小时内检查过，就不查了，防止卡顿
        const now = Date.now();
        if (item.last_check && (now - item.last_check < 1000 * 60 * 60 * 12)) return;

        // console.log(`[MAGI] Checking real episodes for subject ${id}...`);
        try {
            // 使用 Bangumi v0 API 获取章节
            // 同样使用代理防止 CORS
            const url = `https://api.bgm.tv/v0/episodes?subject_id=${id}&type=0`; // type=0 是本篇
            const res = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://api.bgm.tv/calendar'));
            const data = await res.json();

            if (data && data.data && Array.isArray(data.data)) {
                // 筛选出 airdate <= 今天的章节
                const todayStr = new Date().toISOString().split('T')[0];
                let airedCount = 0;
                data.data.forEach(ep => {
                    if (ep.airdate && ep.airdate <= todayStr) airedCount++;
                });

                // 更新数据库
                db = this.getDB(); // 重新读取防止冲突
                if (db[id]) {
                    db[id].on_air = airedCount; // 存入真实集数
                    db[id].last_check = now;
                    this.saveDB(db);
                }
            }
        } catch (e) {
            console.error("[MAGI] Episode Check Failed", e);
        }
    }
};

window.AnimeManager = AnimeManager;
AnimeManager.init();
/* --- 2. 数据加载逻辑 (Load Data) --- */
async function loadAnimeData() {
    const dateDisplay = document.getElementById('anime-date');
    const updateTime = document.getElementById('update-time');
    const today = new Date();
    let bangumiWeekday = today.getDay() === 0 ? 7 : today.getDay(); // 1-7

    // 简单缓存
    const CACHE_KEY = 'nerv_anime_cache_v2';
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem('nerv_anime_ts_v2');
    const now = Date.now();

    if (cachedData && cachedTime && (now - parseInt(cachedTime) < 3600 * 1000 * 6)) {
        animeCalendarData = JSON.parse(cachedData);
        if (updateTime) updateTime.innerText = "SYNC: CACHED";
        initWeekSelector(bangumiWeekday);
        switchDay(bangumiWeekday);
        return;
    }

    try {
        if (dateDisplay) dateDisplay.innerHTML = 'SYNCING...';
        // Bangumi.tv 番剧日历 API
        const ANIME_CALENDAR_API = 'https://api.bgm.tv/calendar';
        const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(ANIME_CALENDAR_API));
        animeCalendarData = await res.json();

        localStorage.setItem(CACHE_KEY, JSON.stringify(animeCalendarData));
        localStorage.setItem('nerv_anime_ts_v2', now.toString());

        if (updateTime) updateTime.innerText = "SYNC: LIVE";
        initWeekSelector(bangumiWeekday);
        switchDay(bangumiWeekday);

    } catch (error) {
        console.error(error);
        if (dateDisplay) dateDisplay.innerHTML = 'OFFLINE';
        if (cachedData) {
            animeCalendarData = JSON.parse(cachedData);
            initWeekSelector(bangumiWeekday);
            switchDay(bangumiWeekday);
        }
    }
}

/* --- 3. 星期切换逻辑 (Switch Day) --- */
function initWeekSelector(currentWeekday) {
    const selector = document.getElementById('week-selector');
    if (!selector) return;
    selector.innerHTML = '';
    for (let i = 1; i <= 7; i++) createDayBtn(i, weekMap[i], i === currentWeekday);
    createDayBtn(8, "★", false);

    function createDayBtn(id, text, isActive) {
        const btn = document.createElement('button');
        btn.className = `day-btn ${isActive ? 'active' : ''}`;
        btn.innerText = text;
        btn.onclick = () => switchDay(id);
        btn.id = `day-btn-${id}`;
        if (id === 8) btn.style.color = 'var(--primary-color)';
        selector.appendChild(btn);
    }
}

function switchDay(weekday) {
    currentSelectedDay = weekday;
    document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById(`day-btn-${weekday}`);
    if (activeBtn) activeBtn.classList.add('active');

    const dateDisplay = document.getElementById('anime-date');
    if (dateDisplay) dateDisplay.innerText = weekday === 8 ? "TACTICAL_COMMAND" : `DAY_${weekMap[weekday]}`;

    const container = document.getElementById('anime-list');
    container.innerHTML = '';

    // 模式 A: 每日放送 (1-7)
    if (weekday !== 8) {
        if (animeCalendarData && animeCalendarData.length > 0) {
            const dayData = animeCalendarData.find(d => d.weekday.id === weekday);
            const items = dayData ? dayData.items : [];
            // 调用你刚才贴好的 renderItems
            renderItems(container, items, false);
        }
        return;
    }

    // 模式 B: 个人终端 (8) - 分组显示
    const db = AnimeManager.getDB();
    let myItems = [];

    // 遍历所有数据找已收藏的
    if (animeCalendarData) {
        animeCalendarData.forEach(day => {
            if (day.items) {
                day.items.forEach(item => {
                    if (db[item.id]) {
                        myItems.push(item);
                    }
                });
            }
        });
    }

    if (myItems.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-gray-500 text-[10px] font-mono">NO ACTIVE TARGETS.<br>USE BUTTONS TO ADD.</div>`;
        return;
    }

    // 分组逻辑
    const groups = { watching: [], todo: [], watched: [], remove: [] }; // remove 不显示
    myItems.forEach(item => {
        const s = db[item.id].status;
        if (groups[s]) groups[s].push(item);
    });

    // 分组渲染
    if (groups.watching.length > 0) {
        container.innerHTML += `<div class="group-header syncing">/// SYNCING_TARGETS [${groups.watching.length}]</div>`;
        renderItems(container, groups.watching, true);
    }
    if (groups.todo.length > 0) {
        container.innerHTML += `<div class="group-header">/// PENDING_ANALYSIS [${groups.todo.length}]</div>`;
        renderItems(container, groups.todo, false);
    }
    if (groups.watched.length > 0) {
        container.innerHTML += `<div class="group-header">/// ARCHIVE_SEALED [${groups.watched.length}]</div>`;
        renderItems(container, groups.watched, false);
    }
}

// 通用渲染函数 (Rev. API真实数据 + UI防挤压版)
function renderItems(container, items, showProgressBar) {
    const db = AnimeManager.getDB();
    const now = new Date();

    const html = items.map((item, index) => {
        const title = (item.name_cn || item.name || "UNKNOWN").replace(/"/g, '&quot;');
        const score = item.rating?.score || 0;

        let image = './images/placeholder.jpg';
        if (item.images) image = item.images.large || item.images.common || '';
        image = image.replace(/\/r\/[0-9x]+\/pic/, '/pic');

        const myData = db[item.id];
        const status = myData ? myData.status : null;
        const watched = myData ? (myData.eps || 0) : 0;
        const total = (item.eps_count || 12);

        // --- 幽灵进度逻辑 ---
        let currentAiring = 0;
        let ghostText = "";

        if (status === 'watching') {
            // 1. 优先使用 API 获取的真实数据
            if (myData.on_air !== undefined) {
                currentAiring = myData.on_air;
            }
            // 2. 如果没有 API 数据，回退到算法估算 (Fallback)
            else if (item.air_date && item.air_date !== '0000-00-00') {
                const startDate = new Date(item.air_date);
                if (startDate <= now) {
                    const diffWeeks = Math.ceil(Math.abs(now - startDate) / (86400000 * 7));
                    currentAiring = Math.min(diffWeeks, total);
                }
                // 顺便触发一次异步更新，下次进来就准了
                setTimeout(() => window.AnimeManager.checkOnlineEps(item.id), index * 200);
            } else {
                // 既没API也没日期，就触发更新
                setTimeout(() => window.AnimeManager.checkOnlineEps(item.id), index * 200);
            }

            // 生成提示文字
            if (currentAiring > watched) {
                ghostText = `ON:${currentAiring}`;
            }
        }

        // --- 1. 进度条模块 ---
        let progressHtml = '';
        if (status === 'watching') {
            let cells = '';
            const displayTotal = total > 26 ? 13 : total;

            for (let i = 1; i <= displayTotal; i++) {
                let cellClass = "";
                // 进度条颜色逻辑
                if (i <= watched) {
                    cellClass = "bg-secondary shadow-[0_0_5px_var(--secondary-color)] opacity-100";
                } else if (i <= currentAiring) {
                    // 虚影：空心框
                    cellClass = "border border-secondary/60 shadow-[0_0_2px_var(--secondary-color)] animate-pulse opacity-80";
                } else {
                    cellClass = "bg-white/5 border border-white/5 opacity-30";
                }
                cells += `<div class="flex-1 h-1.5 cursor-pointer mx-[1px] rounded-[1px] transition-all ${cellClass}" title="EP.${i}"></div>`;
            }

            progressHtml = `
                        <div class="flex items-center gap-2 mb-2 select-none w-full h-6" onclick="event.stopPropagation()">
                            
                            <div class="relative w-8 h-full flex items-center justify-end shrink-0 mr-1">
                                <div class="text-[9px] font-mono text-secondary font-bold leading-none z-10">${watched}/${total}</div>
                                ${ghostText ? `<div class="absolute top-4 right-0 text-[7px] font-mono text-secondary/60 leading-none whitespace-nowrap animate-pulse">${ghostText}</div>` : ''}
                            </div>
                            
                            <div class="w-5 h-5 flex items-center justify-center border border-white/20 text-gray-400 hover:border-red-500 hover:text-red-500 cursor-pointer active:scale-90 transition-all rounded bg-black/40 shrink-0" 
                                 onclick="window.AnimeManager.decreaseProgress(event, ${item.id})">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"></path></svg>
                            </div>

                            <div class="flex flex-1 items-center h-full min-w-0">${cells}</div>

                            <div class="w-5 h-5 flex items-center justify-center border border-white/20 text-secondary hover:bg-secondary hover:text-black cursor-pointer active:scale-90 transition-all rounded bg-black/40 shrink-0" 
                                 onclick="window.AnimeManager.addProgress(event, ${item.id})">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
                            </div>
                        </div>
                    `;
        }

        // --- 2. 评分模块 ---
        const ratingHtml = `
                    <div class="flex items-center gap-2 opacity-60 mb-2">
                        <span class="text-[8px] font-mono text-gray-500">SYNC</span>
                        <div class="flex-1 h-0.5 bg-white/10">
                            <div class="h-full bg-secondary" style="width: ${score * 10}%"></div>
                        </div>
                        <span class="text-[8px] font-mono text-secondary">${score}</span>
                    </div>`;

        // --- 3. 实体控制按钮 (Tailwind版) ---
        const icons = {
            play: `<svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
            clock: `<svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
            check: `<svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
            trash: `<svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`
        };

        const baseBtnClass = "flex-1 flex items-center justify-center gap-1 h-6 text-[9px] font-bold border cursor-pointer transition-all rounded min-w-0";
        const defaultStyle = "bg-black/40 border-white/20 text-gray-400 hover:bg-secondary hover:text-black hover:border-secondary";

        const activeStyles = {
            watching: "bg-[#39ff14] text-black border-[#39ff14] shadow-[0_0_5px_rgba(57,255,20,0.4)]",
            todo: "bg-[#ffae00] text-black border-[#ffae00]",
            watched: "bg-[#ff2a2a] text-white border-[#ff2a2a]",
            remove: "bg-gray-600 text-white border-gray-600"
        };

        const btns = [
            { key: 'watching', label: '在看', icon: icons.play },
            { key: 'todo', label: '想看', icon: icons.clock },
            { key: 'watched', label: '已阅', icon: icons.check },
            { key: 'remove', label: '弃坑', icon: icons.trash }
        ];

        const controlsHtml = `
                    <div class="flex flex-row items-center w-full gap-1 mt-auto pt-2 border-t border-white/10" onclick="event.stopPropagation()">
                        ${btns.map(b => {
            const isActive = status === b.key;
            const style = isActive ? activeStyles[b.key] : defaultStyle;
            return `
                            <div class="${baseBtnClass} ${style}" 
                                 onclick="window.AnimeManager.setStatus(${item.id}, '${b.key}', ${total})">
                                ${b.icon}<span class="hidden xl:inline">${b.label}</span><span class="xl:hidden">${b.label}</span>
                            </div>
                            `;
        }).join('')}
                    </div>
                `;

        return `
                <div class="anime-card-tech flex gap-3 p-2 group cursor-pointer anime-item-enter relative overflow-hidden mb-1 min-h-[110px]" 
                     style="animation-delay: ${index * 0.05}s"
                     onclick='openAnimeModal("${title}", ${score}, "${image}", ${item.id})'>
                    
                    <div class="absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300 ${status === 'watching' ? 'bg-green-500' : 'bg-transparent group-hover:bg-white/20'}"></div>
                    
                    <div class="relative w-16 shrink-0 ml-1 bg-black/50 flex flex-col justify-start">
                        <div class="h-24 relative overflow-hidden border border-white/10">
                            <img src="${image}" class="w-full h-full object-cover transition-transform duration-500 filter grayscale group-hover:grayscale-0" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'">
                             ${status === 'watched' ? '<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-[8px] text-red-500 font-bold border border-red-500" style="transform: rotate(-15deg); text-shadow: 0 0 5px red;">COMPLETED</div>' : ''}
                        </div>
                    </div>

                    <div class="flex-1 min-w-0 flex flex-col py-1 h-full">
                        <div class="flex justify-between items-start mb-auto">
                            <span class="text-white font-bold text-[10px] leading-tight truncate-2-lines font-sans group-hover:text-secondary transition-colors">${title}</span>
                        </div>
                        
                        <div class="mt-2">
                            ${progressHtml}
                            ${ratingHtml}
                        </div>

                        ${controlsHtml}
                    </div>
                </div>`;
    }).join('');

    container.innerHTML += html;
}

/* ==========================================================================
   MAGI SEARCH SYSTEM V2.0 (FUSE.JS POWERED)
   功能：模糊搜索、typo 容错、权重排序
   ========================================================================== */

let fuseInstance = null;
let searchableData = [];

/**
 * 初始化 Fuse.js 搜索引擎
 * @param {Array} posts - 文章数据数组
 */
function initFuseSearch(posts) {
    if (!posts || posts.length === 0) return;

    // 构建搜索数据
    searchableData = posts.map(post => {
        const title = post.title?.rendered || '';
        const excerpt = post.excerpt?.rendered?.replace(/<[^>]+>/g, '') || '';
        let tags = [];
        let category = '';

        if (post._embedded?.['wp:term']) {
            // 分类
            if (post._embedded['wp:term'][0]) {
                category = post._embedded['wp:term'][0].map(c => c.name).join(' ');
            }
            // 标签
            if (post._embedded['wp:term'][1]) {
                tags = post._embedded['wp:term'][1].map(t => t.name);
            }
        }

        return {
            id: post.id,
            title: title,
            excerpt: excerpt,
            tags: tags.join(' '),
            category: category
        };
    });

    // 配置 Fuse.js
    const options = {
        keys: [
            { name: 'title', weight: 0.5 },      // 标题权重最高
            { name: 'excerpt', weight: 0.25 },   // 摘要次之
            { name: 'tags', weight: 0.15 },      // 标签
            { name: 'category', weight: 0.1 }    // 分类
        ],
        threshold: 0.4,           // 模糊度 (0=精确, 1=全匹配)
        distance: 100,            // 匹配位置容差
        includeScore: true,       // 返回匹配分数
        ignoreLocation: true,     // 不限制匹配位置
        minMatchCharLength: 2,    // 最小匹配长度
        useExtendedSearch: false  // 保持简单模式
    };

    fuseInstance = new Fuse(searchableData, options);
    console.log(`[MAGI] Fuse.js 搜索引擎已初始化: ${searchableData.length} 条数据`);
}

/**
 * 执行模糊搜索
 */
function searchArticles() {
    const query = document.getElementById('search-input').value.trim();
    const cards = document.querySelectorAll('.eva-card');

    // 空查询: 显示所有
    if (!query) {
        cards.forEach(card => card.style.display = '');
        return;
    }

    // Fuse.js 未初始化: 回退到简单搜索
    if (!fuseInstance) {
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
        return;
    }

    // 执行 Fuse.js 搜索
    const results = fuseInstance.search(query);
    const matchedIds = new Set(results.map(r => r.item.id));

    // 显示/隐藏卡片
    cards.forEach(card => {
        // 从 onclick 属性提取文章 ID
        const onclick = card.getAttribute('onclick') || '';
        const match = onclick.match(/id=(\d+)/);
        if (match) {
            const cardId = parseInt(match[1]);
            card.style.display = matchedIds.has(cardId) ? '' : 'none';
        }
    });

    // 更新搜索状态提示
    console.log(`[MAGI] 搜索 "${query}" 找到 ${results.length} 条结果`);
}

function filterByTag(tag) {
    document.getElementById('search-input').value = tag;
    searchArticles();
}

startHeroGlitch();
loadAnimeData(); /* New function call */
createParticles();

/* ==========================================================================
   NEW ENHANCEMENTS LOGIC (PHASE 1 & 2)
   ========================================================================== */

/* --- 1. MAGI TEXT DECODER SYSTEM --- */
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span class="text-secondary opacity-50">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

/* Text Decoder Mobile vs Desktop Strategy */
const scrambleElements = document.querySelectorAll('h3, .eva-header span');

if (!isTouchDevice) {
    /* Desktop Trigger on hover */
    scrambleElements.forEach(el => {
        const fx = new TextScramble(el);
        let originalText = el.innerText;
        el.parentElement.addEventListener('mouseenter', () => { fx.setText(originalText); });
    });
} else {
    /* Mobile Trigger on scroll into view */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const fx = new TextScramble(el);
                fx.setText(el.innerText);
                observer.unobserve(el); /* Play once per session */
            }
        });
    }, { threshold: 0.5 });

    scrambleElements.forEach(el => observer.observe(el));
}

/* --- 2. AUDIO SFX SYSTEM --- */
/* Initialize sound objects only once */
const hoverSfx = document.getElementById('sfx-hover');
const clickSfx = document.getElementById('sfx-click');

if (hoverSfx) hoverSfx.volume = 0.15;
if (clickSfx) clickSfx.volume = 0.3;

const sfxElements = document.querySelectorAll('a, button, .eva-card, .tactical-switch, input, .day-btn');

sfxElements.forEach(el => {
    /* Hover sound only on PC */
    if (!isTouchDevice) {
        el.addEventListener('mouseenter', () => {
            if (hoverSfx && document.body.classList.contains('tactical-mode')) {
                hoverSfx.currentTime = 0;
                /* 安全播放：防止快速切换导致的错误 */
                const playPromise = hoverSfx.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => { });
                }
            }
        });
    }

    el.addEventListener('click', () => {
        if (clickSfx) {
            clickSfx.currentTime = 0;
            const playPromise = clickSfx.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => { });
            }
        }
    });
});

/* --- 3. 3D HOLOGRAPHIC CARD EFFECT (PC ONLY) --- */
/* Disable on mobile to prevent scroll jank and save battery */
if (!isTouchDevice) {
    document.querySelectorAll('.eva-card').forEach(card => {
        card.classList.add('holo-card-3d');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

/* --- 4. 缺失的模态框与网络逻辑 (补丁) --- */

// 网络请求辅助函数 (用于获取详情简介)
async function fetchWithFallback(targetUrl) {
    const PROXIES = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url='
    ];
    for (const proxy of PROXIES) {
        try {
            const res = await fetch(proxy + encodeURIComponent(targetUrl));
            if (res.ok) return await res.json();
        } catch (e) { }
    }
    throw new Error("Network Error");
}

// 打开详情页
async function openAnimeModal(title, rating, imageUrl, id) {
    const modal = document.getElementById('anime-modal');

    // 1. 填充基础信息
    document.getElementById('modal-title').innerText = title || "UNKNOWN";
    document.getElementById('modal-rating').innerText = rating || "0.0";
    document.getElementById('modal-cover').src = imageUrl || "";
    document.getElementById('modal-id').innerText = id || "00000";
    document.getElementById('modal-summary').innerText = "ACCESSING MAGI ARCHIVE...";

    // 2. 显示动画
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // 强制重绘以触发 transition
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
        modal.querySelector('div').classList.add('scale-100');
    });

    if (!id) return;

    // 3. 获取简介 (优先读缓存)
    const cacheKey = `nerv_subject_desc_${id}`;
    const cachedDesc = localStorage.getItem(cacheKey);

    if (cachedDesc && cachedDesc.length > 5) {
        document.getElementById('modal-summary').innerText = cachedDesc;
    } else {
        try {
            // 请求 Bangumi API 获取简介
            const data = await fetchWithFallback(`https://api.bgm.tv/v0/subjects/${id}`);
            const desc = data.summary || "DATA CORRUPTED. NO SUMMARY AVAILABLE.";
            document.getElementById('modal-summary').innerText = desc;
            localStorage.setItem(cacheKey, desc);
        } catch (e) {
            document.getElementById('modal-summary').innerText = "UNABLE TO RETRIEVE ARCHIVE DATA.\n(NETWORK INTERFERENCE)";
        }
    }
}

// 关闭详情页
function closeAnimeModal() {
    const modal = document.getElementById('anime-modal');
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.remove('scale-100');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

/* ==========================================================================
   MAGI BLOG SYSTEM V5.0 (CACHE + PAGINATION)
   新增：sessionStorage 缓存、分页加载
   ========================================================================== */

const BlogManager = {
    workerEndpoint: 'https://api-worker.wh1te.top/blog/posts',

    // 分页配置
    state: {
        page: 1,
        perPage: 6,        // 每页显示数量
        totalPosts: 0,
        isLoading: false,
        hasMore: true
    },

    // 缓存配置
    cacheKey: 'magi_blog_cache_v1',
    cacheExpiry: 1000 * 60 * 30, // 30分钟过期

    init() {
        this.state.page = 1;
        this.state.hasMore = true;
        this.loadPosts(true);
    },

    /**
     * 获取缓存数据
     */
    getCache() {
        try {
            const cached = sessionStorage.getItem(this.cacheKey);
            if (!cached) return null;

            const data = JSON.parse(cached);
            // 检查是否过期
            if (Date.now() - data.timestamp > this.cacheExpiry) {
                sessionStorage.removeItem(this.cacheKey);
                return null;
            }
            return data.posts;
        } catch (e) {
            return null;
        }
    },

    /**
     * 设置缓存
     */
    setCache(posts) {
        try {
            sessionStorage.setItem(this.cacheKey, JSON.stringify({
                timestamp: Date.now(),
                posts: posts
            }));
        } catch (e) {
            console.warn('[MAGI] Cache write failed:', e);
        }
    },

    /**
     * 清除缓存 (手动刷新时调用)
     */
    clearCache() {
        sessionStorage.removeItem(this.cacheKey);
        console.log('[MAGI] Blog cache cleared');
    },

    async loadPosts(isReset = false) {
        if (this.state.isLoading) return;

        const container = document.getElementById('article-list-container');
        if (!container) return;

        // 重置时清空容器
        if (isReset) {
            this.state.page = 1;
            container.innerHTML = `
                <div class="eva-card p-8 flex flex-col items-center justify-center opacity-70 min-h-[200px]">
                    <div class="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span class="font-mono text-secondary text-xs tracking-widest animate-pulse">ESTABLISHING SECURE UPLINK...</span>
                </div>
            `;
        }

        // 优先使用缓存
        const cached = this.getCache();
        if (cached && isReset) {
            console.log('[MAGI] 使用缓存数据');
            this.state.totalPosts = cached.length;
            this.renderPage(cached, true);
            return;
        }

        this.state.isLoading = true;

        try {
            // 请求带分页参数
            const url = `${this.workerEndpoint}?page=${this.state.page}&per_page=${this.state.perPage}`;
            console.log(`[MAGI] Fetching page ${this.state.page}...`);

            const res = await fetch(url);

            // WordPress 返回 400 表示页码超出范围，视为没有更多文章
            if (res.status === 400) {
                this.state.hasMore = false;
                this.updateLoadMoreButton();
                this.state.isLoading = false;
                return;
            }

            if (!res.ok) throw new Error(`Worker returned HTTP ${res.status}`);

            // 获取总数 (WordPress 返回在 Header 中)
            const totalHeader = res.headers.get('X-WP-Total');
            if (totalHeader) {
                this.state.totalPosts = parseInt(totalHeader);
            }

            const text = await res.text();

            if (text.trim().startsWith('<')) {
                throw new Error("Worker Firewall Intercepted");
            }

            const posts = JSON.parse(text);

            // 首次加载时缓存所有数据并初始化搜索
            if (isReset && posts.length > 0) {
                this.setCache(posts);
                // 初始化 Fuse.js 搜索引擎
                initFuseSearch(posts);
            }

            // 判断是否还有更多
            if (posts.length < this.state.perPage) {
                this.state.hasMore = false;
            }

            this.renderPage(posts, isReset);

        } catch (error) {
            console.error(error);
            if (isReset) {
                container.innerHTML = `
                    <div class="eva-card p-8 border-red-500/50 min-h-[150px] flex flex-col justify-center">
                        <h3 class="text-red-500 font-mono text-lg font-bold flex items-center gap-2">
                            <i data-lucide="alert-triangle" class="w-5 h-5"></i> CONNECTION LOST
                        </h3>
                        <p class="text-gray-500 text-xs mt-2 font-mono">
                            无法连接到 WordPress 档案库。<br>
                            <span class="text-red-900/50">${error.message}</span>
                        </p>
                        <button onclick="BlogManager.init()" class="mt-4 border border-red-500/30 text-red-500 text-xs px-4 py-2 hover:bg-red-500 hover:text-white transition-colors w-fit font-mono">
                            RETRY
                        </button>
                    </div>
                `;
            }
            lucide.createIcons();
        } finally {
            this.state.isLoading = false;
        }
    },

    /**
     * 加载下一页
     */
    loadMore() {
        if (this.state.isLoading || !this.state.hasMore) return;
        this.state.page++;
        this.loadPosts(false);
    },

    /**
     * 强制刷新 (清缓存后重新加载)
     */
    refresh() {
        this.clearCache();
        this.init();
    },

    /**
     * 渲染文章 (支持追加模式)
     */
    renderPage(posts, isReset) {
        const container = document.getElementById('article-list-container');

        if (isReset) {
            container.innerHTML = '';
        }

        if (!posts || posts.length === 0) {
            if (isReset) {
                container.innerHTML = `<div class="text-center text-gray-500 font-mono text-xs p-8">NO ARCHIVES FOUND.</div>`;
            }
            this.state.hasMore = false;
            this.updateLoadMoreButton();
            return;
        }

        const startIndex = isReset ? 0 : (this.state.page - 1) * this.state.perPage;

        const html = posts.map((post, index) => {
            const title = post.title.rendered;
            let rawExcerpt = post.excerpt ? post.excerpt.rendered.replace(/<[^>]+>/g, '').replace('[&hellip;]', '').trim() : "NO SUMMARY";
            const excerpt = rawExcerpt.length > 60 ? rawExcerpt.substring(0, 60) + '...' : rawExcerpt;
            const date = new Date(post.date).toISOString().split('T')[0];
            const id = post.id;

            // 分类提取（优化版）- 添加安全检查和过滤
            let categoryHTML = '';
            if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0]) {
                const cats = post._embedded['wp:term'][0];
                // 过滤有效分类：必须有ID、名称，且名称不为空
                const validCats = cats.filter(cat => 
                    cat && 
                    cat.id && 
                    cat.name && 
                    cat.name.trim() !== '' &&
                    cat.name !== 'Uncategorized' // 过滤默认分类
                );
                
                if (validCats.length > 0) {
                    // 使用第一个有效分类
                    categoryHTML = `<span class="text-primary border border-primary/30 px-2 bg-primary/10 text-[10px] font-bold ml-auto">[ ${validCats[0].name} ]</span>`;
                }
            }

            // 标签提取
            let tagsHTML = "";
            if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][1]) {
                const tags = post._embedded['wp:term'][1];
                tagsHTML = tags.map(t => `<span class="text-secondary/70">#${t.name}</span>`).join(' ');
            }

            // 封面提取
            let coverHTML = '';
            if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
                const imgUrl = post._embedded['wp:featuredmedia'][0].source_url;
                coverHTML = `
                    <div class="w-full h-32 md:h-40 mb-4 relative overflow-hidden border-b border-white/10 group-hover:border-secondary/50 transition-colors">
                        <img src="${imgUrl}" loading="lazy" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 filter grayscale group-hover:grayscale-0 scale-105 group-hover:scale-100 transform transition-transform">
                        <div class="absolute top-0 right-0 bg-black/60 px-2 py-1 text-[8px] font-mono text-white/70 backdrop-blur-sm">IMG_SRC</div>
                    </div>`;
            }

            const animDelay = (startIndex + index) * 0.1;

            return `
                <article class="eva-card p-0 group cursor-pointer transform transition-transform hover:-translate-y-1 overflow-hidden flex flex-col bg-black/20" 
                         style="animation-delay: ${animDelay}s; animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0;"
                         onclick="ArticleViewer.open(${id})">
                    <div class="eva-glare"></div>
                    ${coverHTML}
                    <div class="p-5 flex flex-col flex-1">
                        <div class="eva-header mb-3 flex items-center w-full">
                            <div class="flex items-center"><div class="eva-header-deco"></div><span class="text-xs">ARCHIVE_${id}</span></div>
                            ${categoryHTML}
                        </div>
                        <h3 class="text-xl font-bold leading-tight group-hover:text-secondary transition-colors duration-300 font-serif mb-2">${title}</h3>
                        <p class="text-gray-400 text-xs leading-relaxed border-l-2 border-white/10 pl-3 group-hover:border-secondary transition-colors mb-4">${excerpt}</p>
                        <div class="mt-auto pt-3 flex items-center justify-between text-[10px] font-mono text-gray-500 border-t border-white/5">
                            <span>${date}</span>
                            <div class="flex gap-2 overflow-hidden truncate max-w-[60%] justify-end">${tagsHTML}</div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        container.insertAdjacentHTML('beforeend', html);
        this.updateLoadMoreButton();
        lucide.createIcons();
    },

    /**
     * 更新加载更多按钮
     */
    updateLoadMoreButton() {
        let btnContainer = document.getElementById('blog-load-more');

        // 如果容器不存在，创建它
        if (!btnContainer) {
            btnContainer = document.createElement('div');
            btnContainer.id = 'blog-load-more';
            btnContainer.className = 'col-span-full flex justify-center mt-6';
            const container = document.getElementById('article-list-container');
            if (container && container.parentNode) {
                container.parentNode.insertBefore(btnContainer, container.nextSibling);
            }
        }

        if (this.state.hasMore) {
            btnContainer.innerHTML = `
                <button onclick="BlogManager.loadMore()" 
                        class="px-8 py-3 border border-secondary/30 bg-secondary/5 text-secondary font-mono text-xs hover:bg-secondary hover:text-black transition-all">
                    /// LOAD_MORE [PAGE ${this.state.page + 1}] ///
                </button>
            `;
        } else {
            btnContainer.innerHTML = `
                <div class="text-gray-600 font-mono text-[10px]">--- END OF ARCHIVES ---</div>
            `;
        }
    }
};

BlogManager.init();

/* ==========================================================================
BILIBILI MANAGER (SYSTEM UPGRADE)
========================================================================== */

// 1. 视图切换控制器
function toggleView(viewName) {
    const homeHeader = document.querySelector('header');
    const homeMain = document.querySelector('main');
    const heroChar = document.querySelector('.hero-character-container'); // 立绘
    const biliView = document.getElementById('bilibili-view');

    // 播放音效 (如果有)
    const clickSfx = document.getElementById('sfx-click');
    if (clickSfx) clickSfx.play().catch(e => { });

    if (viewName === 'bangumi') {
        // 隐藏主页元素
        if (homeHeader) homeHeader.classList.add('hidden');
        if (homeMain) homeMain.classList.add('hidden');
        /* [修复] 保持立绘完全可见，不再淡化 */
        // if (heroChar) heroChar.style.opacity = '0.1'; // ❌ 移除

        // 显示 B 站容器
        biliView.classList.remove('hidden');

        // 触发数据加载
        BiliManager.init();

        // 更新 URL (可选)
        history.pushState(null, '', '#bangumi');
    } else {
        // 恢复主页
        if (homeHeader) homeHeader.classList.remove('hidden');
        if (homeMain) homeMain.classList.remove('hidden');
        if (heroChar) heroChar.style.opacity = '1';

        biliView.classList.add('hidden');
        history.pushState(null, '', 'index.html');
    }
}

/* --- B站数据管理器 (V3.0 Pro) --- */
const BiliManager = {
    workerEndpoint: 'https://api-worker.wh1te.top/bili/bangumi',
    uid: '551898501',

    // 状态管理
    state: {
        page: 1,
        pageSize: 24, // 推荐 24
        status: 0,    // 0:全部, 1:想看, 2:在看, 3:看过
        isLoading: false,
        hasMore: true
    },

    // 初始化 (仅首次加载调用)
    init() {
        if (this.state.page === 1 && document.getElementById('bili-grid').children.length === 0) {
            this.fetchData(true);
        }
    },

    // 切换分类
    switchStatus(newStatus, btnElement) {
        if (this.state.isLoading || this.state.status === newStatus) return;

        // 1. 更新 UI 样式
        document.querySelectorAll('.bili-tab').forEach(b => {
            b.classList.remove('text-[#ff69b4]', 'border-b', 'border-[#ff69b4]');
            b.classList.add('text-gray-500');
        });
        if (btnElement) {
            btnElement.classList.remove('text-gray-500');
            btnElement.classList.add('text-[#ff69b4]', 'border-b', 'border-[#ff69b4]');
        }

        // 2. 重置状态
        this.state.status = newStatus;
        this.state.page = 1;
        this.state.hasMore = true;

        // 3. 清空列表并重新获取
        const grid = document.getElementById('bili-grid');
        grid.innerHTML = `<div class="col-span-full h-32 flex items-center justify-center"><div class="animate-spin w-6 h-6 border-2 border-[#ff69b4] border-t-transparent rounded-full"></div></div>`;
        document.getElementById('bili-load-more').classList.add('hidden');

        this.fetchData(true);
    },

    // 加载下一页
    loadMore() {
        if (this.state.isLoading || !this.state.hasMore) return;
        this.state.page++;
        this.fetchData(false);
    },

    // 核心获取函数
    async fetchData(isReset) {
        this.state.isLoading = true;
        const loadBtn = document.getElementById('bili-load-more');
        if (loadBtn) loadBtn.innerHTML = '<span class="animate-pulse">DOWNLOADING...</span>';

        try {
            // 组装 URL (带分页和状态)
            const url = `${this.workerEndpoint}?uid=${this.uid}&pn=${this.state.page}&ps=${this.state.pageSize}&status=${this.state.status}`;

            const res = await fetch(url);
            const json = await res.json();

            // 清除 Loading 动画 (如果是重置状态)
            if (isReset) document.getElementById('bili-grid').innerHTML = '';

            if (json.code === 0 && json.data.list && json.data.list.length > 0) {
                this.render(json.data.list);

                // 判断是否还有下一页
                if (json.data.list.length < this.state.pageSize) {
                    this.state.hasMore = false;
                    loadBtn.classList.add('hidden');
                } else {
                    this.state.hasMore = true;
                    loadBtn.classList.remove('hidden');
                    loadBtn.innerHTML = `<button onclick="BiliManager.loadMore()" class="px-8 py-3 border border-[#ff69b4]/30 bg-[#ff69b4]/5 text-[#ff69b4] font-mono text-xs hover:bg-[#ff69b4] hover:text-black transition-all">/// LOAD_NEXT_PAGE [${this.state.page + 1}] ///</button>`;
                }
            } else {
                this.state.hasMore = false;
                loadBtn.classList.add('hidden');
                if (isReset) {
                    document.getElementById('bili-grid').innerHTML = `<div class="col-span-full text-center text-gray-500 font-mono text-xs py-10">NO_DATA_FOUND_IN_ARCHIVE</div>`;
                }
            }

        } catch (e) {
            console.error(e);
            if (isReset) {
                document.getElementById('bili-grid').innerHTML = `<div class="col-span-full text-center text-red-500 font-mono text-xs">CONNECTION_LOST: ${e.message}</div>`;
            }
        } finally {
            this.state.isLoading = false;
        }
    },

    // 渲染 (追加模式)
    render(list) {
        const grid = document.getElementById('bili-grid');
        // 状态映射表
        const statusMap = { 1: '想看', 2: '在看', 3: '看过' };

        const html = list.map((item, idx) => {
            const cover = item.cover.replace('http:', 'https:');
            const safeCover = `https://images.weserv.nl/?url=${encodeURIComponent(cover)}&w=300&h=400&output=webp`;
            // 计算动画延迟 (基于索引，让新加载的也有动画)
            const delay = (idx % this.state.pageSize) * 0.05;

            return `
            <div class="eva-card group relative bg-[#151515] flex flex-col h-full hover:-translate-y-2 transition-transform duration-300" 
                 style="animation: popIn 0.5s ease forwards; animation-delay: ${delay}s; opacity: 0;">
                <div class="aspect-[3/4] relative overflow-hidden">
                    <img src="${safeCover}" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    <div class="absolute top-0 left-0 bg-[#ff69b4] text-black text-[10px] font-bold px-2 py-0.5 font-mono">
                        ${item.badge || statusMap[this.state.status] || 'BANGUMI'}
                    </div>
                </div>
                <div class="p-3 flex flex-col flex-1 border-t border-[#ff69b4]/30 relative">
                    <div class="eva-glare"></div>
                    <h3 class="text-white text-xs font-bold leading-tight mb-2 line-clamp-2 group-hover:text-[#ff69b4] transition-colors">
                        ${item.title}
                    </h3>
                    <div class="mt-auto flex justify-between items-center text-[10px] font-mono text-gray-500">
                        <span>${item.new_ep ? item.new_ep.index_show : '完结'}</span>
                        <span class="text-[#ff69b4]">${item.progress || '未看'}</span>
                    </div>
                </div>
                <a href="https://www.bilibili.com/bangumi/play/ss${item.season_id}" target="_blank" class="absolute inset-0 z-10"></a>
            </div>
            `;
        }).join('');

        // 追加 HTML
        grid.insertAdjacentHTML('beforeend', html);
    }
};

// 监听浏览器后退按钮，处理 SPA 状态
window.addEventListener('popstate', () => {
    if (!location.hash) toggleView('home');
    else if (location.hash === '#bangumi') toggleView('bangumi');
});

// 初始化检查
if (location.hash === '#bangumi') toggleView('bangumi');

/* ==========================================================================
   VIEW COMMANDER V3.0 (LAZY LOADING)
   优化：使用动态 import() 按需加载视图管理器
   ========================================================================== */
const ViewCommander = {
    elements: {
        header: () => document.querySelector('header'),
        main: () => document.querySelector('main'),
        hero: () => document.querySelector('.hero-character-container'),
        biliView: () => document.getElementById('bilibili-view'),
        archiveView: () => document.getElementById('category-view-container'),
        aboutView: () => document.getElementById('about-view-container'),
        pixivView: () => document.getElementById('pixiv-view-container'),
        steamView: () => document.getElementById('steam-view-container'),
        articleView: () => document.getElementById('article-viewer')  // 添加文章阅读器
    },

    // 模块加载状态缓存
    loadedModules: new Set(),

    navigate(targetView) {
        const el = this.elements;
        const sfx = document.getElementById('sfx-click');
        if (sfx) sfx.play().catch(() => { });

        /* [修复] 隐藏所有视图，但排除立绘容器
           立绘不是"视图"，而是全局装饰元素，不应该被隐藏 */
        Object.entries(el).forEach(([key, domFunc]) => {
            if (key === 'hero') return; // 跳过立绘
            const dom = domFunc();
            if (dom) {
                dom.classList.add('hidden');
                // 特殊处理：移除 article-viewer 的 active 类
                if (dom.id === 'article-viewer') {
                    dom.classList.remove('active');
                }
            }
        });

        /* [修复] 立绘显示逻辑优化：
           - 只在"阅读类"视图（archive文章列表）中淡化背景
           - 其他视图（home, about, pixiv, steam, bangumi）保持立绘完全可见
           - 避免点击导航后图片莫名消失的问题 */
        const shouldFadeHero = (targetView === 'archive');
        if (el.hero()) {
            el.hero().style.opacity = shouldFadeHero ? '0.05' : '1';
        }

        // 3. 路由分发 (带懒加载)
        switch (targetView) {
            case 'home':
                this._show(el.header());
                this._show(el.main());
                break;

            case 'bangumi':
                this._show(el.biliView());
                this._loadAndInit('Bili', () => import('./managers/bili-manager.js'));
                break;

            case 'archive':
                this._show(el.archiveView());
                break;

            case 'about':
                this._show(el.aboutView());
                if (window.AboutManager) window.AboutManager.init();
                // [OTAKU HELIX] Initialize 3D DNA Visualization (DISABLED)
                // if (window.HelixManager) window.HelixManager.init();
                break;

            case 'pixiv':
                this._show(el.pixivView());
                this._loadAndInit('Pixiv', () => import('./managers/pixiv-manager.js'));
                break;

            case 'steam':
                this._show(el.steamView());
                this._loadAndInit('Steam', () => import('./managers/steam-manager.js'));
                break;

            case 'article':
                this._show(el.articleView());
                // ArticleViewer会在自己的open方法中加载内容
                break;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    /**
     * 懒加载模块并初始化
     * @param {string} name - 模块名 (如 'Steam' -> SteamManager)
     * @param {Function} importFn - 返回 import() Promise 的函数
     */
    async _loadAndInit(name, importFn) {
        const managerKey = name + 'Manager';

        // 1. 如果已加载，直接初始化
        if (window[managerKey]) {
            window[managerKey].init();
            return;
        }

        // 2. 显示加载指示器 (可选)
        console.log(`[MAGI] 懒加载模块: ${managerKey}...`);

        try {
            // 3. 动态加载模块
            const module = await importFn();

            // 4. 挂载到全局并初始化
            window[managerKey] = module.default;
            window[managerKey].init();

            this.loadedModules.add(managerKey);
            console.log(`[MAGI] 模块已加载: ${managerKey}`);

        } catch (e) {
            console.error(`[MAGI] 模块加载失败: ${managerKey}`, e);
        }
    },

    _show(dom) { 
        if (dom) {
            dom.classList.remove('hidden');
            // 特殊处理：article-viewer 需要 active 类来显示
            if (dom.id === 'article-viewer') {
                dom.classList.add('active');
            }
        }
    }
};

// 保持全局兼容
window.toggleView = function (viewName) {
    ViewCommander.navigate(viewName);
};

/* ==========================================================================
   ARCHIVES MANAGER (OPTIMIZED V2.0)
   修复：API路径分离、视图互斥切换、分类筛选
   ========================================================================== */
const ArchivesManager = {
    workerBase: 'https://api-worker.wh1te.top/blog',

    init() { this.fetchCategories(); },

    // 辅助函数：切换主页内容的显示/隐藏
    toggleMainView(show) {
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        const heroChar = document.querySelector('.hero-character-container');

        if (show) {
            if (header) header.classList.remove('hidden');
            if (main) main.classList.remove('hidden');
            if (heroChar) heroChar.style.opacity = '1';
        } else {
            if (header) header.classList.add('hidden');
            if (main) main.classList.add('hidden');
            /* [修复] 保持立绘完全可见，不再淡化 */
            // if (heroChar) heroChar.style.opacity = '0.1'; // ❌ 移除
        }
    },

    // 1. 获取分类并渲染下拉菜单（添加缓存破坏）
    fetchCategories() {
        // 添加时间戳避免浏览器缓存
        const timestamp = new Date().getTime();
        const url = `${this.workerBase}/categories?hide_empty=true&_=${timestamp}`;
        
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(categories => {
                const list = document.getElementById('category-dropdown-list');
                
                // 过滤有效分类：必须有ID、名称，且名称不为空/Uncategorized
                const validCategories = categories.filter(cat => 
                    cat && 
                    cat.id && 
                    cat.name && 
                    cat.name.trim() !== '' &&
                    cat.name !== 'Uncategorized' &&
                    cat.count > 0 // 必须有文章
                );
                
                if (!validCategories || validCategories.length === 0) {
                    list.innerHTML = '<span class="text-[10px] text-gray-500 px-4">NO_CATEGORIES</span>';
                    return;
                }

                // 渲染分类列表
                list.innerHTML = validCategories.map(cat => `
                    <a href="javascript:void(0)" 
                       onclick="ArchivesManager.openCategory(${cat.id}, '${cat.name}')"
                       class="px-4 py-2 text-xs text-gray-300 hover:text-black hover:bg-[var(--primary-color)] transition-all font-mono uppercase border-l-2 border-transparent hover:border-white block group">
                       <span class="group-hover:font-bold">${cat.name}</span> 
                       <span class="opacity-30 text-[9px] ml-1">/// ${cat.count}</span>
                    </a>
                `).join('');
            })
            .catch(err => {
                console.error("Category Fetch Error:", err);
                const list = document.getElementById('category-dropdown-list');
                if (list) list.innerHTML = '<span class="text-[10px] text-red-500 px-4">SYNC_FAIL</span>';
            });
    },

    // [修改] 打开分类 -> 呼叫指挥官切换到 archive 视图
    openCategory(id, name) {
        const title = document.getElementById('current-category-title');
        const grid = document.getElementById('category-posts-grid');
        const loader = document.getElementById('archive-loader');

        // 1. 切换视图
        ViewCommander.navigate('archive');

        // 2. 设置 UI
        if (title) title.innerText = name;
        if (grid) grid.innerHTML = '';
        if (loader) loader.classList.remove('hidden');

        // 3. 数据请求
        fetch(`${this.workerBase}/posts?categories=${id}&_embed&per_page=12`)
            .then(res => res.json())
            .then(posts => {
                if (loader) loader.classList.add('hidden');
                this.renderPosts(posts, grid);
            })
            .catch(err => {
                if (loader) loader.classList.add('hidden');
                grid.innerHTML = `<div class="text-red-500 font-mono text-center">DATA_CORRUPTED: ${err.message}</div>`;
            });
    },

    // 3. 渲染文章卡片 (保持原有 EVA 风格)
    renderPosts(posts, container) {
        if (!posts || posts.length === 0) {
            container.innerHTML = `<div class="text-gray-500 font-mono col-span-full text-center py-20">/// SECTOR_EMPTY: NO DATA FOUND</div>`;
            return;
        }

        container.innerHTML = posts.map((post, index) => {
            // 获取特色图片
            let imgUrl = 'https://via.placeholder.com/600x400/000000/ffffff?text=NO+SIGNAL';
            if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
                imgUrl = post._embedded['wp:featuredmedia'][0].source_url;
            }

            // 格式化日期
            const date = new Date(post.date).toLocaleDateString();
            // 处理摘要：去除 HTML 标签
            const rawExcerpt = post.excerpt ? post.excerpt.rendered.replace(/<[^>]+>/g, '').trim() : "NO DATA";
            const excerpt = rawExcerpt.length > 80 ? rawExcerpt.substring(0, 80) + '...' : rawExcerpt;

            return `
            <article class="group relative bg-black/40 border border-white/10 hover:border-[var(--primary-color)] transition-all duration-300 overflow-hidden animate-[fadeIn_0.5s_ease-out] flex flex-col h-full" style="animation-delay: ${index * 0.1}s">
                
                <div class="h-48 overflow-hidden relative shrink-0">
                    <img src="${imgUrl}" alt="${post.title.rendered}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100 filter grayscale group-hover:grayscale-0">
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    <div class="absolute top-2 right-2 bg-black/80 border border-[var(--primary-color)] text-[var(--primary-color)] text-[10px] px-2 py-0.5 font-mono z-10">
                        LOG_${post.id}
                    </div>
                </div>

                <div class="p-5 relative flex flex-col flex-1">
                    <div class="text-[10px] text-gray-500 font-mono mb-2 flex justify-between border-b border-white/5 pb-2">
                        <span>${date}</span>
                        <span class="text-[var(--secondary-color)]">SYNCED</span>
                    </div>
                    
                    <h2 class="text-lg font-bold text-white mb-3 group-hover:text-[var(--primary-color)] transition-colors line-clamp-2 leading-tight font-serif">
                        ${post.title.rendered}
                    </h2>
                    
                    <div class="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4 font-sans flex-1">
                        ${excerpt}
                    </div>

                    <a href="javascript:void(0)" onclick="ArticleViewer.open(${post.id})" class="mt-auto inline-flex items-center gap-2 text-xs font-bold text-white group-hover:text-[var(--primary-color)] transition-colors uppercase tracking-widest border-b border-transparent group-hover:border-[var(--primary-color)] pb-0.5 w-fit">
                        Read Data <i data-lucide="arrow-right" class="w-3 h-3"></i>
                    </a>
                </div>

                <div class="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </article>
            `;
        }).join('');

        // 刷新图标
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    // [修改] 关闭视图 -> 呼叫指挥官返回 home 视图
    closeView() {
        ViewCommander.navigate('home');
    }
};

// 启动
ArchivesManager.init();

/* ==========================================================================
   ABOUT MANAGER (STATIC MODE)
   ========================================================================== */
const AboutManager = {
    init() {
        console.log("IDENTITY_FILE: LOADED");
        // 仅仅确保图标被渲染，不再进行网络请求
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

// 确保挂载到全局
window.AboutManager = AboutManager;

/* ==========================================================================
   STEAM MANAGER (EVA DATA MODULE)
   ========================================================================== */
const SteamManager = {
    // 请确保这里的 URL 和你的 Worker 一致
    workerEndpoint: 'https://api-worker.wh1te.top/steam/summary',
    isLoaded: false,

    init() {
        if (this.isLoaded) return;
        this.fetchData();
    },

    async fetchData() {
        const statusEl = document.getElementById('steam-status');
        if (statusEl) statusEl.innerText = "同步率测定中...";

        try {
            const res = await fetch(this.workerEndpoint);
            const data = await res.json();

            this.renderDashboard(data);
            this.renderGames(data.stats.top_games);
            this.isLoaded = true;

        } catch (e) {
            console.error(e);
            if (statusEl) {
                statusEl.innerHTML = "<span class='text-red-500'>链接中断</span>";
            }
        }
    },

    renderDashboard(data) {
        // 1. 渲染大圆环 (生命挥霍总值)
        const totalHours = data.stats.total_hours;
        this.animateValue("total-hours", 0, totalHours, 2000);

        // 圆环动画逻辑
        const circle = document.getElementById('sync-rate-circle');
        if (circle) {
            const maxHours = 5000; // 假设5000小时为满级
            const percent = Math.min(totalHours / maxHours, 1);
            const offset = 552 - (552 * percent);
            setTimeout(() => {
                circle.style.strokeDashoffset = offset;
                // 根据肝度变色：0.8以上红色暴走，0.5以上橙色警戒
                circle.style.stroke = percent > 0.8 ? "#ff0000" : (percent > 0.5 ? "#ffae00" : "var(--secondary-color)");
            }, 100);
        }

        // 2. 渲染下方三个数据块 (EVA 风格大白话)
        const statusContainer = document.querySelector('.lg\\:col-span-4 .mt-6');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="grid grid-cols-3 gap-2 text-center mt-8">
                    <div class="p-2 border border-white/10 bg-black/40">
                        <div class="text-[var(--secondary-color)] font-serif font-black text-xl">${data.stats.game_count}</div>
                        <div class="text-[8px] text-gray-500 font-mono mt-1">库存总数</div>
                    </div>
                    <div class="p-2 border border-white/10 bg-black/40">
                        <div class="text-white font-serif font-black text-xl">${data.stats.shame_rate}%</div>
                        <div class="text-[8px] text-gray-500 font-mono mt-1">库存吃灰率</div>
                    </div>
                    <div class="p-2 border border-white/10 bg-black/40">
                        <div class="text-[#ffae00] font-serif font-black text-xl">${data.stats.recent_hours}h</div>
                        <div class="text-[8px] text-gray-500 font-mono mt-1">近期肝度</div>
                    </div>
                </div>
                
                <div class="mt-6 border-t border-white/10 pt-4">
                    <div class="text-[var(--primary-color)] font-serif font-bold text-lg" id="steam-status-text">
                        ${data.user.game_extra_info ? '⚠ 战斗中 ⚠' : '待机中'}
                    </div>
                    <div class="text-[10px] text-gray-400 font-mono mt-1 tracking-widest">
                        ${data.user.game_extra_info ? `PILOTING: ${data.user.game_extra_info}` : 'SYSTEM STANDBY'}
                    </div>
                </div>
            `;

            // 如果在玩游戏，改变全局氛围
            if (data.user.game_extra_info) {
                document.getElementById('steam-status-text').classList.add('animate-pulse', 'text-red-500');
            }
        }

        // 修改大标题下的小字
        const label = document.querySelector('#total-hours + span');
        if (label) label.innerText = "生命挥霍 (小时)";
    },

    renderGames(games) {
        const list = document.getElementById('steam-game-list');
        // 修改列表标题
        const listTitle = document.querySelector('#steam-view-container h2');
        if (listTitle) listTitle.innerText = "精神污染源排行";

        list.innerHTML = games.map((game, index) => `
            <div class="eva-card flex items-center p-3 bg-black/40 border-l-2 border-l-transparent hover:border-l-[var(--secondary-color)] border-y border-y-white/5 border-r border-r-white/5 transition-all group" 
                 style="animation: dataStream 0.5s ease forwards; animation-delay: ${index * 0.1}s; opacity: 0;">
                
                <div class="relative mr-4">
                    <img src="${game.icon_url}" class="w-12 h-12 rounded-sm filter grayscale group-hover:grayscale-0 transition-all">
                    <div class="absolute -bottom-1 -right-1 bg-black/80 text-[var(--secondary-color)] text-[8px] font-mono px-1 border border-white/10">
                        NO.${index + 1}
                    </div>
                </div>
                
                <div class="flex-1 min-w-0">
                    <div class="text-white font-serif font-bold text-sm truncate group-hover:text-[var(--primary-color)] transition-colors">
                        ${game.name}
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                        <div class="w-24 h-1 bg-white/10 rounded overflow-hidden">
                            <div class="h-full bg-[var(--secondary-color)]" style="width: ${Math.min(game.hours / 20, 100)}%"></div>
                        </div>
                        <div class="text-[10px] text-gray-400 font-mono">${game.hours} H</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }
};

/* ==========================================================================
   PIXIV MANAGER (VISUAL ARCHIVE) [FIXED & ENHANCED]
   ========================================================================== */
const PixivManager = {
    // 你的 Worker 地址
    workerEndpoint: 'https://api-worker.wh1te.top/pixiv/rank',
    isLoaded: false,

    init() {
        if (this.isLoaded) return;
        this.fetchData();
    },

    async fetchData() {
        const dateEl = document.getElementById('pixiv-date');
        const grid = document.getElementById('pixiv-grid');
        if (dateEl) dateEl.innerText = "DATE: SYNCING...";

        try {
            const res = await fetch(this.workerEndpoint);

            // 1. 先判断 HTTP 状态
            if (!res.ok) throw new Error(`HTTP_${res.status}`);

            const data = await res.json();

            // 2. [关键修复] 检查数据结构是否完整
            if (data.error || !data.list || !Array.isArray(data.list)) {
                console.error("Worker Error:", data);
                throw new Error(data.msg || "INVALID_DATA_STRUCTURE");
            }

            // 3. 更新 UI
            if (dateEl) dateEl.innerText = `DATE: ${data.date}`;
            this.renderGrid(data.list);
            this.isLoaded = true;

        } catch (e) {
            console.error("[PIXIV_SYNC_FAIL]", e);
            if (dateEl) {
                dateEl.innerText = "STATUS: OFFLINE";
                dateEl.classList.add('text-red-500');
            }
            if (grid) {
                grid.innerHTML = `
                    <div class="col-span-full flex flex-col items-center justify-center p-10 border border-red-500/30 bg-red-500/5">
                        <div class="text-red-500 font-mono text-xl font-bold mb-2">⚠ SIGNAL LOST</div>
                        <div class="text-gray-500 font-mono text-xs max-w-md text-center">
                            无法连接到视觉神经元 (Pixiv API)。<br>
                            ERROR_LOG: <span class="text-red-400">${e.message}</span>
                        </div>
                    </div>
                `;
            }
        }
    },

    renderGrid(items) {
        const grid = document.getElementById('pixiv-grid');
        if (!grid) return;

        // R-18 过滤
        const safeItems = items.filter(i => !i.tags.includes('R-18'));

        grid.innerHTML = safeItems.map((item, index) => {
            // [优化] 图片代理策略
            // 策略：使用 weserv 压缩，将 i.pixiv.re 转为 webp
            const safeUrl = `https://images.weserv.nl/?url=${encodeURIComponent(item.url)}&w=400&output=webp`;

            return `
            <div class="break-inside-avoid mb-4 group relative overflow-hidden bg-black/50 border border-white/10 hover:border-[var(--primary-color)] transition-all duration-500 cursor-pointer"
                 onclick="window.open('https://www.pixiv.net/artworks/${item.id}', '_blank')"
                 style="animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: ${index * 0.05}s; opacity: 0;">
                
                <div class="relative w-full">
                    <div class="relative min-h-[150px] bg-gray-900/50">
                        <div class="absolute inset-0 flex items-center justify-center z-0">
                            <span class="text-[8px] font-mono text-gray-600 animate-pulse">DECODING...</span>
                        </div>

                        <img src="${safeUrl}" 
                             class="w-full h-auto object-cover relative z-10 transition-all duration-700 filter blur-md scale-110 opacity-0"
                             onload="this.classList.remove('blur-md', 'scale-110', 'opacity-0')"
                             onerror="this.parentElement.innerHTML='<div class=\'p-4 text-[8px] text-red-500 text-center\'>IMG_CORRUPT</div>'"
                             loading="lazy">
                    </div>
                    
                    <div class="absolute top-0 left-0 bg-[var(--primary-color)] text-black font-mono text-[10px] px-2 py-0.5 z-20 font-bold shadow-[0_0_10px_var(--primary-color)]">
                        #${item.rank}
                    </div>
                </div>

                <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex flex-col justify-end p-3">
                    <h3 class="text-white text-xs font-bold line-clamp-1 font-sans text-shadow">${item.title}</h3>
                    <div class="text-[9px] text-[var(--secondary-color)] font-mono">ARTIST: ${item.author}</div>
                </div>
            </div>
            `;
        }).join('');
    }
};

// 将新模块挂载到 Window 以便调试
window.SteamManager = SteamManager;
window.PixivManager = PixivManager;

// 将其挂载到全局，确保控制台能访问
window.AboutManager = AboutManager;

/* ==========================================================================
   📱 MOBILE MENU MODULE
   ========================================================================== */
const MobileMenu = {
    menu: null,
    content: null,
    isOpen: false,

    init() {
        this.menu = document.getElementById('mobile-menu');
        this.content = document.getElementById('mobile-menu-content');

        // ESC 键关闭菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        if (!this.menu || !this.content) this.init();
        if (!this.menu) return;

        this.isOpen = true;
        this.menu.classList.remove('pointer-events-none', 'opacity-0');
        this.menu.classList.add('pointer-events-auto', 'opacity-100');
        this.content.classList.remove('translate-x-full');
        this.content.classList.add('translate-x-0');
        document.body.style.overflow = 'hidden';

        // 重新渲染 Lucide 图标
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 50);
        }
    },

    close() {
        if (!this.menu || !this.content) return;

        this.isOpen = false;
        this.menu.classList.add('pointer-events-none', 'opacity-0');
        this.menu.classList.remove('pointer-events-auto', 'opacity-100');
        this.content.classList.add('translate-x-full');
        this.content.classList.remove('translate-x-0');
        document.body.style.overflow = '';
    }
};

// 初始化移动端菜单
document.addEventListener('DOMContentLoaded', () => {
    MobileMenu.init();
});

// 挂载到全局
window.MobileMenu = MobileMenu;

/* ==========================================================================
   ARTICLE VIEWER (全息展开式文章阅读器)
   ========================================================================== */
const ArticleViewer = {
    overlay: null,
    container: null,
    contentDiv: null,
    progressBar: null,
    progressText: null,
    isOpen: false,
    previousView: 'home', // 记住打开前的视图，默认为home
    previousScrollPosition: 0, // 记住打开前的滚动位置
    articleCache: {}, // 文章缓存

    init() {
        this.overlay = document.getElementById('article-viewer');
        this.container = this.overlay?.querySelector('.article-viewer-container');
        this.contentDiv = document.getElementById('viewer-content');
        this.progressBar = document.getElementById('viewer-progress');
        this.progressText = document.getElementById('viewer-progress-text');

        // [FIX] 确保article-viewer不被错误嵌套
        if (this.overlay) {
            const parent = this.overlay.parentElement;
            // 如果父元素不是body，说明被错误嵌套了，移到body下
            if (parent && parent.tagName !== 'BODY') {
                console.log('[ArticleViewer] 检测到错误的DOM结构，修复中...', parent.id);
                document.body.appendChild(this.overlay);
            }
        }

        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // 禁用点击外部关闭功能，避免误触
        // 用户可以通过关闭按钮或ESC键关闭
        // this.overlay?.addEventListener('click', (e) => {
        //     if (e.target === this.overlay) {
        //         this.close();
        //     }
        // });

        // 滚动进度追踪
        this.contentDiv?.addEventListener('scroll', () => this.updateProgress());
    },

    async open(postId, postTitle = '') {
        if (!this.overlay) this.init();
        if (!this.overlay) return;

        console.log('[ArticleViewer] 打开文章阅读器，使用ViewCommander');

        // 保存当前视图（在切换到article视图之前）
        this.previousView = this.getCurrentView();
        console.log('[ArticleViewer] 保存来源视图:', this.previousView);

        // 保存当前滚动位置
        this.previousScrollPosition = window.scrollY || window.pageYOffset;
        console.log('[ArticleViewer] 保存滚动位置:', this.previousScrollPosition);

        // 使用ViewCommander统一的视图切换逻辑
        ViewCommander.navigate('article');

        // 标记为已打开
        this.isOpen = true;

        // 更新文章 ID
        const idSpan = document.getElementById('viewer-article-id');
        if (idSpan) idSpan.textContent = `ID: ${postId}`;

        // 更新状态
        const statusSpan = document.getElementById('viewer-status');
        if (statusSpan) statusSpan.textContent = 'LOADING...';

        // 重置进度
        this.updateProgress(0);

        // 加载文章内容
        await this.loadArticle(postId);

        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 刷新 Lucide 图标
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    async loadArticle(postId) {
        console.log('[ArticleViewer] 开始加载文章, ID:', postId);
        
        // 显示加载动画
        this.contentDiv.innerHTML = `
            <div class="viewer-loading">
                <div class="loading-hexagons">
                    <div class="hex-spinner"></div>
                </div>
                <p class="loading-text">SYNCHRONIZING DATA...</p>
            </div>
        `;

        try {
            // 检查缓存
            if (this.articleCache[postId]) {
                console.log('[ArticleViewer] 使用缓存数据');
                this.renderArticle(this.articleCache[postId]);
                return;
            }

            // 调用 WordPress API (与 reader.html 相同的端点)
            const url = `https://api-worker.wh1te.top/blog/post?id=${postId}`;
            console.log('[ArticleViewer] 发起API请求:', url);
            
            const res = await fetch(url);
            console.log('[ArticleViewer] API响应状态:', res.status, res.statusText);
            
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            // 检查是否被防火墙拦截
            const text = await res.text();
            console.log('[ArticleViewer] 响应文本长度:', text.length, '前100字符:', text.substring(0, 100));
            
            if (text.trim().startsWith('<') && !text.includes('wp-json')) {
                console.error('[ArticleViewer] 检测到防火墙拦截');
                throw new Error("Worker Firewall Intercepted");
            }
            
            // 解析JSON
            const post = JSON.parse(text);
            console.log('[ArticleViewer] 解析成功, 文章标题:', post.title?.rendered);
            console.log('[ArticleViewer] 文章内容长度:', post.content?.rendered?.length);

            // 缓存文章
            this.articleCache[postId] = post;

            // 渲染文章
            console.log('[ArticleViewer] 开始渲染文章');
            this.renderArticle(post);
            console.log('[ArticleViewer] 渲染完成');

        } catch (error) {
            console.error('[ArticleViewer] 加载失败:', error);
            console.error('[ArticleViewer] 错误堆栈:', error.stack);
            
            this.contentDiv.innerHTML = `
                <div class="viewer-error">
                    <p>ERROR: FAILED TO RETRIEVE ARTICLE</p>
                    <pre>${error.message}</pre>
                    <button onclick="ArticleViewer.loadArticle(${postId})" 
                            style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--secondary-color); color: black; border: none; cursor: pointer; font-family: 'JetBrains Mono'; font-size: 12px;">
                        RETRY
                    </button>
                </div>
            `;

            const statusSpan = document.getElementById('viewer-status');
            if (statusSpan) statusSpan.textContent = 'ERROR';
        }
    },

    renderArticle(post) {
        console.log('[ArticleViewer] renderArticle被调用, post对象:', post);
        
        // 格式化日期
        const date = new Date(post.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // 获取分类名称 (如果有)
        const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'UNCATEGORIZED';
        
        console.log('[ArticleViewer] 渲染信息:', {
            title: post.title?.rendered,
            date: date,
            category: categoryName,
            contentLength: post.content?.rendered?.length
        });

        // 渲染内容
        const content = post.content?.rendered || '<p>No content available.</p>';
        
        // 计算阅读时间（平均阅读速度：300字/分钟）
        const wordCount = content.replace(/<[^>]*>/g, '').length;
        const readingTime = Math.ceil(wordCount / 300);

        this.contentDiv.innerHTML = `
            <article class="viewer-article">
                <h1 class="article-title">${post.title?.rendered || 'Untitled'}</h1>
                <div class="article-meta">
                    <span class="meta-date">${date}</span>
                    <span class="meta-category">${categoryName}</span>
                </div>
                <div class="article-reading-stats">
                    <span>约 ${readingTime} 分钟读完</span>
                    <span>${wordCount} 字</span>
                </div>
                <div class="article-body">
                    ${content}
                </div>
            </article>
        `;
        
        console.log('[ArticleViewer] innerHTML已设置, contentDiv高度:', this.contentDiv.scrollHeight);

        // 隐藏loading，显示文章内容
        const loadingDiv = this.contentDiv.querySelector('.viewer-loading');
        const articleEl = this.contentDiv.querySelector('.viewer-article');
        
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
        
        if (articleEl) {
            // 初始状态：完全透明
            articleEl.style.opacity = '0';
            articleEl.style.transform = 'translateY(20px)';
            
            // 强制重排，确保初始样式生效
            articleEl.offsetHeight;
            
            // 添加过渡效果
            articleEl.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            
            // 延迟一帧后触发动画
            requestAnimationFrame(() => {
                articleEl.style.opacity = '1';
                articleEl.style.transform = 'translateY(0)';
            });
        }

        // ===== 评论区初始化 (TACTICAL COMMENT SYSTEM) =====
        // 在文章渲染完成后立即添加评论区HTML
        const currentPostId = post.id;
        const commentsHTML = this.generateCommentsSection(currentPostId);
        
        // 将评论区HTML追加到文章末尾（复用前面的articleEl变量）
        if (articleEl) {
            articleEl.insertAdjacentHTML('beforeend', commentsHTML);
            
            // 绑定评论区交互
            this.bindCommentsToggle();
            
            // 异步加载评论数据
            this.loadComments(currentPostId);
        }

        // ===== 阅读体验增强功能 =====
        // 延迟执行，等待渐显动画开始
        setTimeout(() => {
            this.enhanceReading();
        }, 100);

        // 更新状态
        const statusSpan = document.getElementById('viewer-status');
        if (statusSpan) statusSpan.textContent = 'SYNCHRONIZED';

        // 滚动到顶部
        this.contentDiv.scrollTop = 0;

        // 初始化进度
        setTimeout(() => this.updateProgress(), 100);
    },

    /**
     * 获取当前激活的视图
     */
    getCurrentView() {
        const views = {
            'bilibili-view': 'bili',
            'category-view-container': 'archive',
            'about-view-container': 'about',
            'pixiv-view-container': 'pixiv',
            'steam-view-container': 'steam'
        };

        // 检查哪个视图是可见的（没有hidden类）
        for (const [id, viewName] of Object.entries(views)) {
            const el = document.getElementById(id);
            if (el && !el.classList.contains('hidden')) {
                return viewName;
            }
        }

        // 默认返回home（如果main和header可见）
        const main = document.querySelector('main');
        const header = document.querySelector('header');
        if (main && !main.classList.contains('hidden') && 
            header && !header.classList.contains('hidden')) {
            return 'home';
        }

        return 'home'; // 默认值
    },

    /**
     * 阅读体验增强功能
     * 包括：TOC生成、代码复制、图片灯箱、平滑滚动
     */
    enhanceReading() {
        if (!this.contentDiv) return;

        const articleBody = this.contentDiv.querySelector('.article-body');
        if (!articleBody) return;

        console.log('[ArticleViewer] 初始化阅读增强功能');

        // 1. 生成目录
        this.generateTOC(articleBody);

        // 2. 为所有代码块添加复制按钮
        this.addCodeCopyButtons(articleBody);

        // 3. 为所有图片添加灯箱功能
        this.addImageLightbox(articleBody);

        // 4. 为标题添加锚点ID
        this.addHeadingAnchors(articleBody);
    },

    /**
     * 生成文章目录（TOC）
     */
    generateTOC(articleBody) {
        const tocContainer = document.getElementById('article-toc');
        const tocNav = document.getElementById('toc-nav');
        const tocToggle = document.getElementById('toc-toggle');

        if (!tocContainer || !tocNav) return;

        // 获取所有标题
        const headings = articleBody.querySelectorAll('h2, h3, h4');
        
        if (headings.length === 0) {
            tocContainer.classList.add('hidden');
            return;
        }

        console.log(`[ArticleViewer] 生成TOC，共 ${headings.length} 个标题`);

        // 清空并生成TOC
        tocNav.innerHTML = '';
        headings.forEach((heading, index) => {
            const level = heading.tagName.toLowerCase();
            const text = heading.textContent;
            const id = `heading-${index}`;
            
            // 为标题添加ID
            heading.id = id;

            // 创建TOC链接
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.className = `toc-item level-${level.charAt(1)}`;
            link.textContent = text;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 计算标题相对于内容区域的位置
                const contentRect = this.contentDiv.getBoundingClientRect();
                const headingRect = heading.getBoundingClientRect();
                const offset = headingRect.top - contentRect.top + this.contentDiv.scrollTop;
                
                // 平滑滚动到目标位置，留出一些顶部空间
                this.contentDiv.scrollTo({
                    top: offset - 20, // 留出20px的顶部空间
                    behavior: 'smooth'
                });
            });

            tocNav.appendChild(link);
        });

        // 显示TOC
        tocContainer.classList.remove('hidden');

        // TOC收起/展开
        if (tocToggle && !tocToggle.hasAttribute('data-initialized')) {
            tocToggle.setAttribute('data-initialized', 'true');
            tocToggle.addEventListener('click', () => {
                tocContainer.classList.toggle('collapsed');
            });
        }

        // 滚动高亮当前标题
        this.updateActiveTOC(headings);
    },

    /**
     * 更新TOC当前激活项
     */
    updateActiveTOC(headings) {
        if (!this.contentDiv) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    document.querySelectorAll('.toc-item').forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            root: this.contentDiv,
            rootMargin: '-100px 0px -50% 0px'
        });

        headings.forEach(heading => observer.observe(heading));

        // 绑定TOC中的回到顶部按钮
        this.bindTOCBackToTop();
    },

    /**
     * 绑定TOC中的回到顶部按钮
     */
    bindTOCBackToTop() {
        const tocBackToTopBtn = document.getElementById('toc-back-to-top');
        if (tocBackToTopBtn && !tocBackToTopBtn.hasAttribute('data-initialized')) {
            tocBackToTopBtn.setAttribute('data-initialized', 'true');
            tocBackToTopBtn.addEventListener('click', () => {
                console.log('[ArticleViewer] TOC 回到顶部按钮被点击');
                console.log('[ArticleViewer] this.contentDiv:', this.contentDiv);
                console.log('[ArticleViewer] contentDiv scrollTop:', this.contentDiv?.scrollTop);
                console.log('[ArticleViewer] contentDiv scrollHeight:', this.contentDiv?.scrollHeight);
                
                if (this.contentDiv) {
                    // 尝试直接设置 scrollTop
                    this.contentDiv.scrollTop = 0;
                    
                    // 同时尝试 scrollTo
                    this.contentDiv.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    
                    console.log('[ArticleViewer] 滚动后 scrollTop:', this.contentDiv.scrollTop);
                } else {
                    console.error('[ArticleViewer] contentDiv 不存在！');
                }
            });
            console.log('[ArticleViewer] TOC 回到顶部按钮已绑定');
        }
    },

    /**
     * 为代码块添加复制按钮
     */
    addCodeCopyButtons(articleBody) {
        const codeBlocks = articleBody.querySelectorAll('pre');
        
        console.log(`[ArticleViewer] 为 ${codeBlocks.length} 个代码块添加复制按钮`);

        codeBlocks.forEach(pre => {
            // 跳过已经有复制按钮的
            if (pre.querySelector('.code-copy-btn')) return;

            const button = document.createElement('button');
            button.className = 'code-copy-btn';
            button.textContent = 'COPY';
            button.setAttribute('aria-label', '复制代码');

            button.addEventListener('click', async () => {
                const code = pre.querySelector('code')?.textContent || pre.textContent;
                
                try {
                    await navigator.clipboard.writeText(code);
                    button.textContent = 'COPIED!';
                    button.classList.add('copied');
                    
                    setTimeout(() => {
                        button.textContent = 'COPY';
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('[ArticleViewer] 复制失败:', err);
                    button.textContent = 'FAILED';
                    setTimeout(() => {
                        button.textContent = 'COPY';
                    }, 2000);
                }
            });

            pre.appendChild(button);
        });
    },

    /**
     * 为图片添加灯箱功能
     */
    addImageLightbox(articleBody) {
        const images = articleBody.querySelectorAll('img');
        const lightbox = document.getElementById('image-lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxClose = document.getElementById('lightbox-close');

        if (!lightbox || !lightboxImg || !lightboxClose) return;

        console.log(`[ArticleViewer] 为 ${images.length} 张图片添加灯箱功能`);

        images.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.remove('hidden');
                setTimeout(() => lightbox.classList.add('show'), 10);
            });
        });

        // 关闭灯箱（只初始化一次）
        if (!lightboxClose.hasAttribute('data-initialized')) {
            lightboxClose.setAttribute('data-initialized', 'true');
            
            const closeLightbox = () => {
                lightbox.classList.remove('show');
                setTimeout(() => {
                    lightbox.classList.add('hidden');
                    lightboxImg.src = '';
                }, 300);
            };

            lightboxClose.addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
            
            // ESC键关闭
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && lightbox.classList.contains('show')) {
                    closeLightbox();
                }
            });
        }
    },

    /**
     * 为标题添加锚点ID（如果还没有）
     */
    addHeadingAnchors(articleBody) {
        const headings = articleBody.querySelectorAll('h2, h3, h4');
        headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
        });
    },

    updateProgress(forcePercent = null) {
        if (!this.contentDiv || !this.progressBar || !this.progressText) return;

        let percent;
        if (forcePercent !== null) {
            percent = forcePercent;
        } else {
            const scrollTop = this.contentDiv.scrollTop;
            const scrollHeight = this.contentDiv.scrollHeight - this.contentDiv.clientHeight;
            percent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
        }

        this.progressBar.style.width = `${percent}%`;
        this.progressText.textContent = `${percent}%`;
    },

    /* ==========================================================================
       TACTICAL COMMENT SYSTEM (战术评论系统)
       ========================================================================== */


    /**
     * 生成评论区HTML结构
     */
    generateCommentsSection(postId) {
        return `
            <div class="article-comments-section" id="article-comments">
                <div class="comments-trigger" id="comments-trigger">
                    <div class="trigger-left">
                        <span class="trigger-badge">战术讨论协议 / TACTICAL_DISCUSSION</span>
                        <span class="trigger-divider">//</span>
                        <span class="trigger-count" id="comments-count">同步中 / LOADING...</span>
                    </div>
                    <div class="trigger-right">
                        <i data-lucide="chevron-down" class="trigger-icon"></i>
                    </div>
                </div>
                <div class="comments-container hidden" id="comments-container">
                    <div class="comments-list" id="comments-list">
                        <div class="loading-comments">正在请求机密电讯数据... SYNCHRONIZING_DATA</div>
                    </div>
                    <div class="comment-form-container">
                        <div class="form-header">
                            <span class="form-title">[ 发送新电讯 / NEW_TRANSMISSION ]</span>
                        </div>
                        <form class="comment-form" id="comment-form">
                            <input type="hidden" id="comment-post-id" value="${postId}">
                            <input type="text" 
                                   class="form-input" 
                                   id="comment-author" 
                                   placeholder="署名 / PILOT_ID" 
                                   required>
                            <input type="email" 
                                   class="form-input" 
                                   id="comment-email" 
                                   placeholder="通信链路 / EMAIL_ADDR" 
                                   required>
                            <textarea class="form-textarea" 
                                      id="comment-content" 
                                      placeholder="请输入电讯正文 / MESSAGE CONTENT..." 
                                      rows="4" 
                                      required></textarea>
                            <button type="submit" class="form-submit">
                                <i data-lucide="send"></i>
                                <span>发送 / TRANSMIT</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 绑定评论区折叠/展开交互
     */
    bindCommentsToggle() {
        const trigger = document.getElementById('comments-trigger');
        const container = document.getElementById('comments-container');
        
        if (!trigger || !container) return;
        
        // 移除旧的监听器（如果存在）
        const newTrigger = trigger.cloneNode(true);
        trigger.parentNode.replaceChild(newTrigger, trigger);
        
        newTrigger.addEventListener('click', () => {
            if (container.classList.contains('hidden')) {
                container.classList.remove('hidden');
                newTrigger.classList.add('expanded');
            } else {
                container.classList.add('hidden');
                newTrigger.classList.remove('expanded');
            }
        });

        // 绑定评论表单提交事件
        this.bindCommentForm();
    },

    /**
     * 绑定评论表单提交
     */
    bindCommentForm() {
        const form = document.getElementById('comment-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitComment();
        });
    },

    /**
     * 异步加载评论数据
     */
    async loadComments(postId) {
        const comments = await this.fetchComments(postId);
        this.renderComments(comments);
    },

    /**
     * 从API获取评论数据
     */
    async fetchComments(postId) {
        try {
            const url = `https://api-worker.wh1te.top/blog/comments?post=${postId}&per_page=100`;
            const res = await fetch(url);
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            
            const comments = await res.json();
            console.log('[Comments] 获取成功:', comments.length, '条评论');
            return comments;
        } catch (error) {
            console.error('[Comments] 获取失败:', error);
            return [];
        }
    },

    /**
     * 渲染评论列表
     */
    renderComments(comments) {
        const list = document.getElementById('comments-list');
        const count = document.getElementById('comments-count');
        
        if (!list || !count) return;
        
        count.textContent = `${comments.length} 条回复 / REPLIES`;
        
        if (comments.length === 0) {
            list.innerHTML = '<div class="no-comments">暂无通信记录 / NO TRANSMISSIONS</div>';
            return;
        }
        
        list.innerHTML = comments.map(comment => `
            <div class="comment-card">
                <div class="comment-header">
                    <div class="comment-avatar">
                        <span class="avatar-initial">${this.getInitial(comment.author_name)}</span>
                    </div>
                    <div class="comment-meta">
                        <span class="comment-author">${this.escapeHtml(comment.author_name)}</span>
                        <span class="comment-date">${this.formatDate(comment.date)}</span>
                    </div>
                </div>
                <div class="comment-body">
                    ${comment.content.rendered}
                </div>
            </div>
        `).join('');
        
        // 重新初始化Lucide图标
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    /**
     * 提交评论
     */
    async submitComment() {
        const postId = document.getElementById('comment-post-id')?.value;
        const author = document.getElementById('comment-author')?.value;
        const email = document.getElementById('comment-email')?.value;
        const content = document.getElementById('comment-content')?.value;
        const submitBtn = document.querySelector('.form-submit');

        if (!postId || !author || !email || !content) {
            alert('请填写所有必填字段');
            return;
        }

        // 禁用按钮，防止重复提交
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = '发送中 / SENDING...';
        }

        try {
            const response = await fetch('https://api-worker.wh1te.top/blog/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    post: parseInt(postId),
                    author_name: author,
                    author_email: email,
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error(`提交失败: ${response.status}`);
            }

            const result = await response.json();
            console.log('[Comments] 提交成功:', result);

            // 清空表单
            document.getElementById('comment-author').value = '';
            document.getElementById('comment-email').value = '';
            document.getElementById('comment-content').value = '';

            // 重新加载评论列表
            await this.loadComments(postId);

            alert('评论提交成功！审核通过后将显示。');

        } catch (error) {
            console.error('[Comments] 提交失败:', error);
            alert('评论提交失败: ' + error.message);
        } finally {
            // 恢复按钮状态
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = '发送 / TRANSMIT';
            }
        }
    },

    /**
     * 获取用户名首字母
     */
    getInitial(name) {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    },

    /**
     * 转义HTML字符
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * 格式化日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\//g, '.').replace(',', '');
    },

    close() {
        if (!this.isOpen) return;

        console.log('[ArticleViewer] 关闭文章阅读器，返回:', this.previousView);

        // 使用ViewCommander返回到之前保存的视图
        ViewCommander.navigate(this.previousView);

        // 恢复滚动位置（延迟执行，确保视图切换完成）
        setTimeout(() => {
            window.scrollTo({
                top: this.previousScrollPosition,
                behavior: 'instant' // 立即跳转，不使用平滑滚动
            });
            console.log('[ArticleViewer] 恢复滚动位置:', this.previousScrollPosition);
        }, 50);

        // 标记为已关闭
        this.isOpen = false;
    }
};

// 初始化文章阅读器
document.addEventListener('DOMContentLoaded', () => {
    ArticleViewer.init();
});

// 挂载到全局
window.ArticleViewer = ArticleViewer;

/* ==========================================================================
   PERFORMANCE: VISIBILITY AWARENESS (能见度感知优化)
   参考: OPTIMIZATION_REPORT.md - 当用户切换标签页时停止动画
   ========================================================================== */
document.addEventListener('visibilitychange', () => {
    if (ArticleViewer.isOpen && ArticleViewer.container) {
        if (document.hidden) {
            // 标签页隐藏：暂停动画，节省资源
            ArticleViewer.container.style.animationPlayState = 'paused';
            console.log('[ArticleViewer] 标签页隐藏，暂停动画');
        } else {
            // 标签页恢复：恢复动画
            ArticleViewer.container.style.animationPlayState = 'running';
            console.log('[ArticleViewer] 标签页恢复，继续动画');
        }
    }
});

// 兼容性：创建 toggleMode 别名
window.toggleMode = toggleLightMode;

// 主题切换函数 (如果尚未定义)
if (typeof window.setTheme === 'undefined') {
    window.setTheme = function (themeName) {
        if (themeName === 'default') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', themeName);
        }
        localStorage.setItem('theme', themeName);
    };
}

// ==========================================
// SYSTEM STARTUP
// ==========================================
// 启动全局渲染核心 (这将同时带动 Matrix 和 LCL)
GlobalRender.start();

console.log("MAGI SYSTEM: GRAPHICS ENGINE LINKED.");
console.log("📱 MOBILE MENU: INITIALIZED.");

/* 实时检测输入内容并改变 UI 状态 */
function updateInputStatus(val) {
    const label = document.querySelector('#magi-input-container .absolute.-top-2');
    const inputBorder = document.querySelector('#magi-input-container div.flex');
    
    if (!label || !inputBorder) return;

    const query = val.trim();
    const isSecretKey = query === '冬马和纱天下第一';
    const isCommand = query.startsWith('/');
    
    if (isSecretKey || isCommand) {
        label.innerText = 'COMMAND_DETECTION';
        label.style.color = '#ff0000';
        label.style.borderColor = '#ff0000';
        inputBorder.style.borderColor = '#ff0000';
        inputBorder.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.2)';
    } else {
        label.innerText = 'MAGI_LINK';
        label.style.color = '';
        label.style.borderColor = '';
        inputBorder.style.borderColor = '';
        inputBorder.style.boxShadow = '';
    }
}

/* ==========================================================================
   TACTICAL SECURITY PROTOCOL (战术安全协议管理器)
   ========================================================================== */

window.SecurityProtocol = {
    isOpen: false,
    step: 'IDLE', // IDLE, SYNCING, VOTING, GRANTED, DENIED

    open() {
        const overlay = document.getElementById('tactical-auth-overlay');
        if (!overlay) return;

        this.isOpen = true;
        overlay.classList.add('active');
        overlay.classList.remove('closing');

        // 重置状态
        this.resetUI();
    },

    close() {
        const overlay = document.getElementById('tactical-auth-overlay');
        if (!overlay) return;

        overlay.classList.add('closing');
        setTimeout(() => {
            overlay.classList.remove('active', 'closing');
            this.isOpen = false;
        }, 400);
    },

    resetUI() {
        const form = document.getElementById('auth-form-container');
        const syncView = document.getElementById('auth-syncing-view');
        const magiView = document.getElementById('auth-magi-view');
        
        if (form) {
            form.style.display = 'block';
            form.classList.remove('hiding');
        }
        if (syncView) {
            syncView.style.display = 'none';
            syncView.classList.remove('hiding');
        }
        if (magiView) {
            magiView.style.display = 'none';
            magiView.classList.remove('hiding');
        }

        document.getElementById('auth-id').value = '';
        document.getElementById('auth-key').value = '';
        
        const nodes = ['melchior', 'balthasar', 'casper'];
        nodes.forEach(id => {
            const el = document.getElementById(`auth-${id}`);
            if (el) {
                el.className = 'magi-vote-node';
                el.querySelector('.status-label').innerText = '待機中';
            }
        });

        const syncRate = document.getElementById('auth-sync-rate');
        if (syncRate) syncRate.innerText = 'SYNC_RATE: 0%';
    },

    async submit() {
        const id = document.getElementById('auth-id').value.trim();
        const key = document.getElementById('auth-key').value.trim();

        if (!id || !key) return;

        this.step = 'SYNCING';

        // === 阶段1: 隐藏表单，显示同步率动画 ===
        const form = document.getElementById('auth-form-container');
        const syncView = document.getElementById('auth-syncing-view');
        
        form.classList.add('hiding');
        await new Promise(r => setTimeout(r, 500));
        
        form.style.display = 'none';
        syncView.style.display = 'block';
        syncView.classList.remove('hiding');

        // === 阶段2: 同步率上升动画 (0% → 100%) ===
        const percentage = document.getElementById('sync-percentage');
        const syncStatus = document.getElementById('sync-status');
        const syncRateFooter = document.getElementById('auth-sync-rate');
        
        const statusMessages = [
            '[ パターン青 / PATTERN_BLUE ]',
            '[ 信号解析中 / DECODING ]',
            '[ 認証処理中 / AUTHENTICATING ]',
            '[ シンクロテスト / SYNC_TEST ]',
            '[ 最終確認 / FINAL_CHECK ]'
        ];

        for (let i = 0; i <= 100; i += 4) {
            percentage.textContent = `${Math.min(i, 100)}%`;
            syncRateFooter.textContent = `SYNC_RATE: ${Math.min(i, 100)}%`;
            
            // 每25%切换一次状态信息
            const statusIndex = Math.floor(i / 25);
            if (statusIndex < statusMessages.length) {
                syncStatus.textContent = statusMessages[statusIndex];
            }
            
            await new Promise(r => setTimeout(r, 30));
        }

        // 同步完成，停顿
        syncStatus.textContent = '[ 同期完了 / SYNC_COMPLETE ]';
        await new Promise(r => setTimeout(r, 800));

        // === 阶段3: 切换到 MAGI 表决 ===
        this.step = 'VOTING';
        
        syncView.classList.add('hiding');
        await new Promise(r => setTimeout(r, 500));
        
        syncView.style.display = 'none';
        const magiView = document.getElementById('auth-magi-view');
        magiView.style.display = 'grid';
        magiView.classList.remove('hiding');

        // MAGI 三贤人投票 + 后端 API 验证
        const nodes = [
            { id: 'melchior', delay: 800 },
            { id: 'balthasar', delay: 1800 },
            { id: 'casper', delay: 2600 }
        ];

        let authResult = null;

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const el = document.getElementById(`auth-${node.id}`);
            if (el) {
                el.classList.add('active');
                el.querySelector('.status-label').innerText = '判定中...';
            }
            
            // === 在第二个节点时发起真实 API 请求 ===
            if (i === 1) {
                console.log('[AUTH] 开始后端验证...');
                syncStatus.textContent = '[ 后端认证中 / BACKEND_AUTH ]';
                
                try {
                    const response = await fetch('https://api-worker.wh1te.top/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, key })
                    });
                    
                    authResult = await response.json();
                    console.log('[AUTH] 认证结果:', authResult);
                    
                } catch (error) {
                    console.error('[AUTH] API 请求失败:', error);
                    authResult = { 
                        success: false, 
                        error: 'NETWORK_ERROR',
                        message: 'MAGI 后端连接失败。请检查网络。' 
                    };
                }
            }
            
            const waitTime = i === 0 ? node.delay : node.delay - nodes[i-1].delay;
            await new Promise(r => setTimeout(r, waitTime));
            
            if (el) {
                // 根据后端返回结果判定
                const isDenied = !authResult || !authResult.success;
                el.classList.remove('active');
                el.classList.add(isDenied ? 'denied' : 'resolved');
                el.querySelector('.status-label').innerText = isDenied ? '否決' : '承認';
            }
        }

        // === 阶段4: 最终决策（基于后端响应）===
        setTimeout(() => {
            if (authResult && authResult.success) {
                // 存储 JWT Token 和用户信息
                localStorage.setItem('magi_auth_token', authResult.token);
                localStorage.setItem('magi_access', 'commander');
                localStorage.setItem('commander_id', authResult.user.id);
                localStorage.removeItem('guest_chat_count');
                
                // [MEMORY RESET] 身份变更，清洗上下文
                chatHistory = [];
                sessionStorage.removeItem('magi_chat_history');
                if (typeof updateChatUI === 'function') updateChatUI();
                
                this.handleGranted(authResult.user.id);
            } else {
                this.handleDenied(authResult?.message || '认证失败');
            }
        }, 800);
    },

    handleGranted(pilotId) {
        this.step = 'GRANTED';
        
        const panel = document.querySelector('.auth-panel');
        if (panel) panel.style.boxShadow = '0 0 100px var(--secondary-color)';

        if (typeof showAiSpeech === 'function') {
            showAiSpeech(`認証完了。お帰りなさい、${pilotId}司令官。ふん、また待たせて...`);
        }
        
        // 成功后音效
        const clickSfx = document.getElementById('sfx-click');
        if (clickSfx) clickSfx.play().catch(() => {});

        setTimeout(() => this.close(), 2500);
    },

    handleDenied(message = '警告：不正アクセス！A.T.フィールド全開！') {
        this.step = 'DENIED';
        
        const panel = document.querySelector('.auth-panel');
        if (panel) panel.style.animation = 'glitch 0.2s infinite';
        
        if (typeof showAiSpeech === 'function') {
            showAiSpeech(message);
        }
        
        setTimeout(() => {
            if (panel) panel.style.animation = '';
            this.resetUI();
        }, 2000);
    }
};
