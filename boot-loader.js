/* ==========================================================================
   MAGI BOOT LOADER (开屏加载管理器)
   在 main.js 之后加载,控制开屏动画
   ========================================================================== */

/* 预加载所有主题的背景人物图片，避免切换时卡顿 */
function preloadThemeCharacters() {
    const characterImages = [
        './images/shinji.png',  // default
        './images/asuka.png',   // unit-02
        './images/rei.png',     // unit-00
        './images/mari.png'     // unit-08
    ];
    
    characterImages.forEach(src => {
        const img = new Image();
        img.src = src;
        // 图片会自动缓存到浏览器
    });
    
    console.log('[PRELOAD] 背景人物图片预加载完成');
}

const MAGIBootLoader = {
    loader: null,
    progressBar: null,
    progressText: null,
    statusText: null,
    datetimeText: null,
    startTime: null,
    minDisplayTime: 1500, // 最小展示时间 1.5 秒
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
            this.statusText.textContent = '正在验证身份凭证...';
            // 设置 3秒 超时，避免卡死启动页
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

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
        // 阶段 1: 初始化渲染核心 (20%)
        MAGIBootLoader.updateProgress(20, '正在初始化渲染核心...');
        await new Promise(resolve => setTimeout(resolve, 300));

        // 阶段 2: 连接外部数据节点 + 预加载资源 + [SECURITY] 身份核验 (40%)
        MAGIBootLoader.updateProgress(40, '正在建立安全连接...');
        // 🖼️ 预加载所有主题的背景人物图片（后台进行，不阻塞）
        preloadThemeCharacters();
        
        // 🔒 执行身份自检
        await MAGIBootLoader.verifyIdentity();
        
        await new Promise(resolve => setTimeout(resolve, 300));

        // 阶段 3: 检索战术日志 (WordPress API) (70%)
        MAGIBootLoader.updateProgress(70, '正在检索战术日志...');
        
        // 实际等待 WordPress 数据加载
        if (typeof fetchBlogPosts === 'function') {
            try {
                await fetchBlogPosts();
            } catch (error) {
                console.warn('[BOOT] WordPress API 加载失败，继续启动:', error);
            }
        }

        // 阶段 4: 同步完成 (100%)
        MAGIBootLoader.updateProgress(100, '系统同步完成 · ALL GREEN');
        
        // 💫 在100%完成后延迟0.3秒，让用户看清"ALL GREEN"
        await new Promise(resolve => setTimeout(resolve, 300));

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
