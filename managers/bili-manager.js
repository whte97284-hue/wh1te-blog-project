/**
 * BILIBILI MANAGER (ES MODULE)
 * 功能：从 Worker 获取 B站追番数据并渲染
 * 按需加载：仅在访问 B站视图时加载
 */
const BiliManager = {
    workerEndpoint: 'https://eva-proxy.whte97284.workers.dev/bili/bangumi',
    uid: '551898501',

    // 状态管理
    state: {
        page: 1,
        pageSize: 24,
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
            const url = `${this.workerEndpoint}?uid=${this.uid}&pn=${this.state.page}&ps=${this.state.pageSize}&status=${this.state.status}`;

            const res = await fetch(url);
            const json = await res.json();

            if (isReset) document.getElementById('bili-grid').innerHTML = '';

            if (json.code === 0 && json.data.list && json.data.list.length > 0) {
                this.render(json.data.list);

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
        const statusMap = { 1: '想看', 2: '在看', 3: '看过' };

        const html = list.map((item, idx) => {
            const cover = item.cover.replace('http:', 'https:');
            const safeCover = `https://images.weserv.nl/?url=${encodeURIComponent(cover)}&w=300&h=400&output=webp`;
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

        grid.insertAdjacentHTML('beforeend', html);
    }
};

export default BiliManager;
