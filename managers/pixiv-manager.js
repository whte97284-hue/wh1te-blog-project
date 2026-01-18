/**
 * PIXIV MANAGER (ES MODULE)
 * 功能：从 Worker 获取 Pixiv 排行榜数据并渲染
 * 按需加载：仅在访问 Pixiv 视图时加载
 */
const PixivManager = {
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

            if (!res.ok) throw new Error(`HTTP_${res.status}`);

            const data = await res.json();

            if (data.error || !data.list || !Array.isArray(data.list)) {
                console.error("Worker Error:", data);
                throw new Error(data.msg || "INVALID_DATA_STRUCTURE");
            }

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
                             onerror="this.parentElement.innerHTML='<div class=\\'p-4 text-[8px] text-red-500 text-center\\'>IMG_CORRUPT</div>'"
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

export default PixivManager;
