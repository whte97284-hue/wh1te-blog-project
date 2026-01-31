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
            night: ["这么晚了还不睡？...笨蛋。"],
            guestExtra: [
              "喂，你是谁啊？没见过你这种权限的家伙呢，快去身份同步啦！",
              "这种同步率...你是哪来的路人甲？快去登录系统！",
              "切，访客吗？我可没空陪你闲聊，除非你有授权凭证。"
            ]
        },
        idle: [
            "喂...你还在吗？放置不管可是重罪哦！",
            "哈欠...好无聊啊，就没有更有趣的指令吗？",
            "再不理我，我就要去画本子了！...骗你的啦，笨蛋。"
        ],
        guestIdle: [
            "一直在这个页面盯着我看干嘛？变态。",
            "喂，那边的。没有授权就请不要长时间占用连接通道。",
            "啧...这种被陌生人监视的感觉真不爽。",
            "如果你想发呆的话，请去别的网站，这里是 MAGI 核心。",
            "同步率这么低还赖着不走...真是厚脸皮。"
        ],
        theme: { default: ["初号机配色...还算有品味。"] },
        lightMode: { toLight: ["太刺眼了啦！"], toDark: ["这样看着舒服多了。"] },
        song: { _default: ["这首歌还不错嘛。"] },
        specialDates: {},
        rateLimit: [
            "ちょっと待って！CPU都要烧坏了！🔥",
            "喂喂，让人家喘口气啦！同步率过载警告！",
            "不要一下子塞那么多指令进来啊笨蛋！",
            "排队！懂不懂排队啊！💢",
            "[系统过热] 你是想把 MAGI 的回路烧掉吗？"
        ],
        guestClick: [
            "别碰我！没有授权不许乱摸！",
            "哈？你想对系统核心做什么？变态！",
            "Access Denied！离我远点！",
            "警告：检测到非法接触！AT力场全开！",
            "喂！你的 Pilot ID 呢？没有就别乱动！"
        ],
        click: [
            "干嘛啦...突然戳人家。",
            "工作还没做完呢...不过，陪你一会也可以。",
            "怎、怎么了？脸上有东西吗？",
            "再戳？再戳我就...咬你哦！"
        ]
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
     * 获取欢迎语（根据时段 & 权限）
     */
    getWelcome(timeOfDay) {
        const isCommander = localStorage.getItem('magi_access') === 'commander';

        if (isCommander) {
            // 指挥官：早安/晚安 + 专属称呼
            const baseLines = this.data?.welcome?.[timeOfDay] || this.fallback.welcome[timeOfDay];
            let line = this._random(baseLines);
            const commanderId = localStorage.getItem('commander_id') || '指挥官';
            
            return line.replace('你这个家伙', `${commanderId}司令官`)
                       .replace('你', `${commanderId}司令官`)
                       .replace('笨蛋', '...哼，勉强原谅你'); 
        } else {
            // 访客：强制触发“排外”台词
            // 尝试读取 json 里的 guestExtra，没有则降级到 fallback
            const guestLines = this.data?.welcome?.guestExtra || this.fallback.welcome.guestExtra;
            return this._random(guestLines);
        }
    },

    /**
     * 获取发牢骚台词（权限区分版）
     */
    getIdle() {
        const isCommander = localStorage.getItem('magi_access') === 'commander';

        if (isCommander) {
            const lines = this.data?.idle || this.fallback.idle;
            return this._random(lines);
        } else {
            // 访客：戒备/不耐烦
            const lines = this.data?.guestIdle || this.fallback.guestIdle;
            return this._random(lines);
        }
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
     * 获取点击台词（权限区分版）
     */
    getClick() {
        const isCommander = localStorage.getItem('magi_access') === 'commander';
        
        if (isCommander) {
            // 指挥官：正常互动（优先用 json 里的，没有则降级到 fallback.click）
            const lines = this.data?.click || this.fallback.click; 
            return this._random(lines);
        } else {
            // 访客：只能触发“拒绝/嘲讽”台词
            // 尝试读取 json 里的 guestClick，没有则降级到 fallback.guestClick
            const lines = this.data?.guestClick || this.fallback.guestClick;
            return this._random(lines);
        }
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
