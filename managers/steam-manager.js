/**
 * STEAM MANAGER (ES MODULE)
 * 功能：从 Worker 获取 Steam 游戏数据并渲染
 * 按需加载：仅在访问 Steam 视图时加载
 */
const SteamManager = {
    workerEndpoint: 'https://eva-proxy.whte97284.workers.dev/steam/summary',
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
            const maxHours = 5000;
            const percent = Math.min(totalHours / maxHours, 1);
            const offset = 552 - (552 * percent);
            setTimeout(() => {
                circle.style.strokeDashoffset = offset;
                circle.style.stroke = percent > 0.8 ? "#ff0000" : (percent > 0.5 ? "#ffae00" : "var(--secondary-color)");
            }, 100);
        }

        // 2. 渲染下方三个数据块
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

            if (data.user.game_extra_info) {
                document.getElementById('steam-status-text').classList.add('animate-pulse', 'text-red-500');
            }
        }

        const label = document.querySelector('#total-hours + span');
        if (label) label.innerText = "生命挥霍 (小时)";
    },

    renderGames(games) {
        const list = document.getElementById('steam-game-list');
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

export default SteamManager;
