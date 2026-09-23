/* ==========================================================================
   MAGI BOOT LOADER (开屏加载管理器)
   在 main.js 之后加载,控制开屏动画
   ========================================================================== */

/* [PERF 2026-09-23] 移除 preloadThemeCharacters()
   理由：
   1. 与 main.js:1041 的 characterMap 预加载完全重复（那边用的还是正确的 .webp 路径）；
   2. 本文件原列表里的 './images/shinji.png' 是错的——首屏 hero 用的是 shinji.webp，
      shinji.png 全仓库零引用，却要白下 511KB；
   3. 这 4 张 PNG 合计 1.37MB，在开屏阶段并发拉取，和 style.css / main.js / hero 图
      抢同一条带宽——也就是说开屏遮罩"遮挡"的加载痕迹，主要就是它自己制造的。
   现在图片预加载统一由 main.js 在空闲时进行（见 main.js characterMap 处的 requestIdleCallback）。 */

const MAGIBootLoader = {
    loader: null,
    progressBar: null,
    progressText: null,
    statusText: null,
    datetimeText: null,
    startTime: null,
    minDisplayTime: 200, // [PERF 2026-09-23] 1500 → 200：原来的 1.5 秒是纯人为延迟，
                         // 缓存全命中时也照样撑满，属于"制造加载"而非"遮挡加载"。
                         // 遮罩的作用只是防闪白，200ms 足够。
    datetimeInterval: null,

    init() {
        this.loader = document.getElementById('magi-boot-loader');
        this.progressBar = document.getElementById('magi-boot-progress');
        this.progressText = document.getElementById('magi-boot-percent');
        this.statusText = document.getElementById('magi-boot-status');
        this.datetimeText = document.getElementById('magi-boot-datetime');
        this.startTime = Date.now();
        
        // 启动日期时间更新
        this.updateDateTime();
        this.datetimeInterval = setInterval(() => this.updateDateTime(), 1000);
    },

    updateDateTime() {
        if (!this.datetimeText) return;
        const now = new Date();
        const date = now.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        }).replace(/\//g, '.');
        const time = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        this.datetimeText.textContent = `${date} ${time}`;
    },

    updateProgress(percent, status) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percent}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = `${percent}%`;
        }
        if (this.statusText && status) {
            this.statusText.textContent = status;
        }
    },

    async verifyIdentity() {
        const token = localStorage.getItem('magi_auth_token');
        const isCommander = localStorage.getItem('magi_access') === 'commander';
        const BASE_URL = 'https://api-worker.wh1te.top/';

        // Case 1: 没有任何登录痕迹 -> 访客模式，跳过
        if (!isCommander && !token) return;

        // Case 2: 有 commander 标记但无 Token -> 非法篡改，强制清除
        if (isCommander && !token) {
            console.warn('[BOOT] 检测到非法权限标记 (No Token)，强制清除');
            this.forceLogout();
            this.updateProgress(45, '警告：检测到非法权限标记');
            await new Promise(r => setTimeout(r, 800));
            return;
        }

        // Case 3: 正常校验
        try {
            // [FIX 2026-09-23] 加空值守卫：原来直接 .textContent 赋值，
            // 若 #magi-boot-status 不存在会抛 TypeError，被下方 catch 当成
            // "明确验证失败" 而误触发 forceLogout()（用户会被莫名其妙登出）。
            if (this.statusText) this.statusText.textContent = '正在验证身份凭证...';
            // 设置 2秒 超时，避免卡死启动页
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(`${BASE_URL}verify`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const result = await response.json();
                if (result.valid) {
                    console.log('[BOOT] 身份验证通过:', result.user.id);
                    this.updateProgress(45, `欢迎回来，${result.user.id} 指挥官`);
                } else {
                    throw new Error(result.error || 'Token Invalid');
                }
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.warn('[BOOT] 身份验证异常:', error);
            
            // 如果是网络超时，保持离线信任（不做登出）
            if (error.name === 'AbortError' || error.message.includes('NetworkError')) {
                this.updateProgress(45, '验证超时 (Offline Mode)');
            } else {
                // 明确的验证失败（过期/伪造）-> 强制登出
                this.forceLogout();
                this.updateProgress(45, '凭证已失效，权限降级');
                await new Promise(r => setTimeout(r, 1000)); // 让用户看清错误
            }
        }
    },

    forceLogout() {
        localStorage.removeItem('magi_access');
        localStorage.removeItem('commander_id');
        localStorage.removeItem('magi_auth_token');
    },

    async hide() {
        // 清除日期时间更新
        if (this.datetimeInterval) {
            clearInterval(this.datetimeInterval);
            this.datetimeInterval = null;
        }

        // 确保加载层至少显示了 minDisplayTime 毫秒
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minDisplayTime - elapsedTime);
        
        if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        // 添加淡出 class
        if (this.loader) {
            this.loader.classList.add('loaded');
            // 等待动画完成后移除元素
            setTimeout(() => {
                if (this.loader && this.loader.parentElement) {
                    this.loader.parentElement.removeChild(this.loader);
                }
            }, 1000);
        }
    }
};

/* 启动加载序列 */
async function initializeMAGISystem() {
    MAGIBootLoader.init();

    try {
        // 阶段 1: 初始化渲染核心
        MAGIBootLoader.updateProgress(25, '正在初始化渲染核心...');

        // 阶段 2: 建立安全连接
        // [PERF 2026-09-23] 移除原来的三个 300ms 纯填充 sleep（合计 900ms）——
        // 它们唯一的作用是让进度条"看起来在做事"，代价是每次进站多等近 1 秒。
        MAGIBootLoader.updateProgress(50, '正在建立安全连接...');

        // 🔒 身份自检：给 800ms 上报窗口，超时即放行
        // [PERF 2026-09-23] 原来是 await 整条链路，最坏阻塞 3s(网络超时) + 1s(失效分支)。
        // 真正的权限由服务端判定，这里只是 UI 提示，不该参与首屏门控。
        await Promise.race([
            MAGIBootLoader.verifyIdentity(),
            new Promise(resolve => setTimeout(resolve, 800))
        ]);

        // 阶段 3: 检索战术日志
        // [FIX 2026-09-23] 原来这里 await fetchBlogPosts()，但全仓库从未定义过该函数
        // （typeof 恒为 false），所以这一段是 0ms 空转的死代码。
        // 文章列表实际由 main.js 的 BlogManager.loadPosts() 独立加载；
        // 开屏遮罩刻意不去等它——等它只会让首屏更慢。
        MAGIBootLoader.updateProgress(75, '正在检索战术日志...');

        // 阶段 4: 同步完成
        MAGIBootLoader.updateProgress(100, '系统同步完成 · ALL GREEN');

        // 隐藏加载器
        await MAGIBootLoader.hide();

        // 触发英梨梨的欢迎台词
        setTimeout(() => {
            if (typeof showAiSpeech === 'function') {
                showAiSpeech('系统同步完成，欢迎回来。ふん，又让我等了。');
            }
        }, 800);

    } catch (error) {
        console.error('[BOOT] MAGI 系统初始化失败:', error);
        MAGIBootLoader.updateProgress(100, '严重错误：启动失败');
        setTimeout(() => MAGIBootLoader.hide(), 2000);
    }
}

// 在 DOM 加载完成后立即启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMAGISystem);
} else {
    // DOM 已经加载完成
    initializeMAGISystem();
}

// 导出到全局以便调试
window.MAGIBootLoader = MAGIBootLoader;
