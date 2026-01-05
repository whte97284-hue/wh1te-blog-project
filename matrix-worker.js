/**
 * MAGI MATRIX WORKER V1.0
 * 功能：在后台线程渲染 Matrix 代码雨，不阻塞主线程
 * 使用 OffscreenCanvas API
 */

let canvas = null;
let ctx = null;
let drops = [];
let isRunning = false;
let lastTime = 0;
const FPS = 30;
const INTERVAL = 1000 / FPS;

// 可配置变量 (由主线程传入)
let fontSize = 16;
let matrixColor = '#39ff14';
let isLightMode = false;
let isLCLMode = false;
let devicePixelRatio = 1; // [优化] Worker 内部 DPR

// 片假名字符集
const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * 初始化 Canvas 和雨滴数组
 */
function initMatrix(width, height) {
    if (!canvas) return;

    // [优化] 应用 DPR
    const dpr = devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    // Worker 中不需要 scale，直接按物理像素渲染

    const columns = Math.floor(canvas.width / fontSize);
    const newDrops = [];

    for (let i = 0; i < columns; i++) {
        // 保留已有位置，避免全部重置
        newDrops[i] = drops[i] || Math.floor(Math.random() * -canvas.height / fontSize);
    }
    drops = newDrops;

    // 初始化 Canvas 状态 (只设置一次)
    ctx.font = 'bold ' + fontSize + 'px JetBrains Mono, monospace';
}

/**
 * 绘制一帧
 */
function drawMatrix() {
    if (!ctx || !canvas || isLCLMode) return;

    // 拖尾效果遮罩
    ctx.fillStyle = isLightMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.025)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 设置发光效果
    ctx.shadowBlur = 14;
    ctx.shadowColor = matrixColor;
    ctx.fillStyle = matrixColor;

    for (let i = 0; i < drops.length; i++) {
        const text = katakana.charAt(Math.floor(Math.random() * katakana.length));

        // 随机白色脉冲
        if (Math.random() > 0.98) {
            ctx.fillStyle = isLightMode ? '#000' : '#fff';
            ctx.shadowColor = isLightMode ? '#000' : '#fff';
            ctx.shadowBlur = 20;
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            // 还原样式
            ctx.fillStyle = matrixColor;
            ctx.shadowColor = matrixColor;
            ctx.shadowBlur = 14;
        } else {
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        }

        // 重置到顶部
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }

    // 重置 Shadow 避免性能问题
    ctx.shadowBlur = 0;
}

/**
 * 渲染循环 (带帧率限制)
 */
function renderLoop(timestamp) {
    if (!isRunning) return;

    requestAnimationFrame(renderLoop);

    const elapsed = timestamp - lastTime;
    if (elapsed > INTERVAL) {
        lastTime = timestamp - (elapsed % INTERVAL);
        drawMatrix();
    }
}
/**
 * 接收主线程消息
 */
self.onmessage = function (e) {
    const { type, data } = e.data;

    switch (type) {
        case 'init':
            // 接收 OffscreenCanvas
            canvas = data.canvas;
            ctx = canvas.getContext('2d');
            fontSize = data.fontSize || 16;
            matrixColor = data.color || '#39ff14';
            isLightMode = data.isLightMode || false;
            devicePixelRatio = data.dpr || 1; // [优化] 接收主线程传来的 DPR
            initMatrix(data.width, data.height);
            break;

        case 'start':
            if (!isRunning) {
                isRunning = true;
                lastTime = performance.now();
                requestAnimationFrame(renderLoop);
            }
            break;

        case 'stop':
            isRunning = false;
            break;

        case 'resize':
            // resize 时如果不传 dpr 默认保持当前值，或主线程应带上 dpr
            // 但主线程 resize 事件中只发了 width/height，这里保持 dpr 不变即可
            initMatrix(data.width, data.height);
            break;

        case 'updateColor':
            matrixColor = data.color;
            // 更新 Canvas 状态
            if (ctx) {
                ctx.shadowColor = matrixColor;
                ctx.fillStyle = matrixColor;
            }
            break;

        case 'updateMode':
            isLightMode = data.isLightMode;
            isLCLMode = data.isLCLMode;
            // LCL 模式下清空画布
            if (isLCLMode && ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            break;
    }
};
