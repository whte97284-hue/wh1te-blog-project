/**
 * ERIRI 台词库加载器 (ERIRI Lines Manager)
 * 从 JSON 文件加载台词，支持热更新和容错
 */
const EririLinesManager = {
    data: null,
    loaded: false,
    fallback: {
        welcome: {
            morning: ["早安...你这个家伙，起这么早干嘛。"],
            afternoon: ["下午好。你该不会在摸鱼吧？"],
            evening: ["晚上好。一天辛苦了...才没有在乎你！"],
            night: ["这么晚了还不睡？...笨蛋。"]
        },
        idle: ["喂...你还在吗？"],
        theme: { default: ["初号机配色...还算有品味。"] },
        lightMode: { toLight: ["太刺眼了啦！"], toDark: ["这样看着舒服多了。"] },
        song: { _default: ["这首歌还不错嘛。"] },
        specialDates: {},
        rateLimit: ["ちょっと待って！"]
    },

    /**
     * 初始化：加载 JSON 数据
     */
    async init() {
        try {
            const response = await fetch('./data/eriri-lines.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.data = await response.json();
            this.loaded = true;
            console.log('[ERIRI] 台词库加载完成:', Object.keys(this.data).length, '个模块');
        } catch (e) {
            console.warn('[ERIRI] 台词库加载失败，使用内置备用:', e.message);
            this.data = this.fallback;
            this.loaded = true;
        }
    },

    /**
     * 获取欢迎语（根据时段）
     */
    getWelcome(timeOfDay) {
        const lines = this.data?.welcome?.[timeOfDay] || this.fallback.welcome[timeOfDay];
        return this._random(lines);
    },

    /**
     * 获取发牢骚台词
     */
    getIdle() {
        const lines = this.data?.idle || this.fallback.idle;
        return this._random(lines);
    },

    /**
     * 获取主题切换台词
     */
    getTheme(themeName) {
        const lines = this.data?.theme?.[themeName] || this.data?.theme?.default || this.fallback.theme.default;
        return this._random(lines);
    },

    /**
     * 获取明暗切换台词
     */
    getLightMode(isLight) {
        const key = isLight ? 'toLight' : 'toDark';
        const lines = this.data?.lightMode?.[key] || this.fallback.lightMode[key];
        return this._random(lines);
    },

    /**
     * 获取歌曲专属台词
     */
    getSong(songTitle) {
        const lines = this.data?.song?.[songTitle] || this.data?.song?._default || this.fallback.song._default;
        return this._random(lines);
    },

    /**
     * 获取特殊日期台词（如果今天是特殊日期）
     */
    getSpecialDate() {
        const now = new Date();
        const dateKey = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        const dateData = this.data?.specialDates?.[dateKey];
        if (dateData?.lines) {
            return this._random(dateData.lines);
        }
        return null;
    },

    /**
     * 获取频率限制台词
     */
    getRateLimit() {
        const lines = this.data?.rateLimit || this.fallback.rateLimit;
        return this._random(lines);
    },

    /**
     * 获取点击台词（默认对话）
     */
    getClick() {
        const lines = this.data?.click || this.fallback.idle; // 降级到 idle
        return this._random(lines);
    },

    /**
     * 获取错误提示台词
     */
    getError() {
        const lines = this.data?.error || ["出错了..."];
        return this._random(lines);
    },

    /**
     * 随机选取
     */
    _random(arr) {
        if (!arr || arr.length === 0) return "...";
        return arr[Math.floor(Math.random() * arr.length)];
    }
};

// 页面加载时初始化
EririLinesManager.init();

// 暴露到全局
window.EririLines = EririLinesManager;
