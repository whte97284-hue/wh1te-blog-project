/* ==========================================================================
   圣地巡礼地图 (Leaflet 懒加载 + 初始化)
   --------------------------------------------------------------------------
   [PERF 2026-09-24] 从 index.html 内联脚本外置而来。
   原因：内联 <script> 会阻塞 HTML 解析，且这 ~9KB 计入【渲染阻塞】的 HTML 体积。
   外置为 defer 后，它与 HTML 并行下载，不再拖慢首屏。
   注意：defer 脚本在 DOMContentLoaded 之前执行，所以下面这个
   addEventListener('DOMContentLoaded', ...) 仍然会正常触发。
   ========================================================================== */

            document.addEventListener('DOMContentLoaded', function() {
                let pilgrimageMap = null;
                let leafletLoaded = false;

                function loadLeaflet(callback) {
                    if (leafletLoaded) { callback(); return; }
                    if (typeof L !== 'undefined') { leafletLoaded = true; callback(); return; }
                    
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    document.head.appendChild(link);
                    
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    script.onload = function() { leafletLoaded = true; callback(); };
                    document.head.appendChild(script);
                }

                window.initPilgrimageMap = function() {
                if (pilgrimageMap) return;
                const container = document.getElementById('pilgrimage-map');
                if (!container || container.offsetParent === null) return;

                loadLeaflet(function() {

                // 圣地数据 (东京 + 镰仓)
                const locations = {
                    'ikebukuro': { lat: 35.7295, lng: 139.7109, label: '池袋', unit: '01', title: 'EVA STORE 本部', desc: '「EVA STORE TOKYO-01」所在地。补给据点。' },
                    'shinjuku': { lat: 35.6938, lng: 139.7035, label: '新宿', unit: '01', title: '第三新东京市?', desc: '美里小姐飙车的地方。人很多，记得开 A.T.力场。' },
                    'akihabara': { lat: 35.6984, lng: 139.7731, label: '秋叶原', unit: '02', title: '补给基地', desc: '手办和 RADIO EVA 的天堂。' },
                    'shibuya': { lat: 35.6580, lng: 139.7016, label: '涩谷', unit: '02', title: 'PARCO', desc: '潮流圣地。' },
                    'asakusa': { lat: 35.7148, lng: 139.7967, label: '浅草', unit: '02', title: '雷门', desc: '传统和风，补充能量的地方。' },
                    'tokyobigsight': { lat: 35.6298, lng: 139.7942, label: '有明', unit: '02', title: 'Big Sight', desc: '夏冬两季的人类补完计划（漫展）。' },
                    'kamakura': { lat: 35.3192, lng: 139.5467, label: '镰仓', unit: '00', title: '江之电沿线', desc: '坐江之电看海，不是红海，是蓝海。' },
                    'shichirigahama': { lat: 35.3058, lng: 139.5106, label: '七里滨', unit: '00', title: '夕阳海岸', desc: '耳边自动响起 Fly Me To The Moon。' },
                    'enoshima': { lat: 35.3017, lng: 139.4811, label: '江之岛', unit: '00', title: '圣地', desc: '像个好玩的迷宫。看到猫咪别给它戴使徒面具。' }
                };

                // 初始化地图 - 视野范围覆盖东京到�的仓
                pilgrimageMap = L.map('pilgrimage-map', {
                    zoomControl: true,
                    attributionControl: false,
                    scrollWheelZoom: true
                }).setView([35.50, 139.60], 10); // 中心点和缩放级别

                // OSM 图层
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 16,
                    minZoom: 9
                }).addTo(pilgrimageMap);

                // 路线
                const routePoints = [
                    [locations.asakusa.lat, locations.asakusa.lng],
                    [locations.akihabara.lat, locations.akihabara.lng],
                    [locations.ikebukuro.lat, locations.ikebukuro.lng],
                    [locations.shinjuku.lat, locations.shinjuku.lng],
                    [locations.shibuya.lat, locations.shibuya.lng],
                    [locations.tokyobigsight.lat, locations.tokyobigsight.lng],
                    [35.5, 139.7],
                    [locations.kamakura.lat, locations.kamakura.lng],
                    [locations.shichirigahama.lat, locations.shichirigahama.lng],
                    [locations.enoshima.lat, locations.enoshima.lng]
                ];

                L.polyline(routePoints, {
                    color: '#a78bfa',
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '8, 12'
                }).addTo(pilgrimageMap);

                // 标记点
                const unitColors = { '01': '#a78bfa', '02': '#fb7185', '00': '#60a5fa' };

                Object.keys(locations).forEach(key => {
                    const loc = locations[key];
                    const color = unitColors[loc.unit];

                    const icon = L.divIcon({
                        className: 'pilgrimage-marker',
                        html: `<div style="
                        width: 24px; height: 24px; 
                        background: ${color}; 
                        border: 2px solid white; 
                        border-radius: 50%; 
                        box-shadow: 0 0 10px ${color};
                        display: flex; align-items: center; justify-content: center;
                        font-size: 10px; font-weight: bold; color: white;
                        font-family: monospace;
                    ">${loc.unit}</div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    L.marker([loc.lat, loc.lng], { icon })
                        .addTo(pilgrimageMap)
                        .on('click', () => showMapInfo(loc));
                });

                // 修复地图尺寸
                setTimeout(() => pilgrimageMap.invalidateSize(), 200);
                }); // end loadLeaflet callback
            }

            function showMapInfo(loc) {
                const panel = document.getElementById('map-info-panel');
                const content = document.getElementById('map-info-content');
                const unitColors = { '01': 'text-purple-400', '02': 'text-red-400', '00': 'text-blue-400' };

                content.innerHTML = `
                <div class="flex items-center gap-2 mb-2">
                    <span class="${unitColors[loc.unit]} font-mono text-xs">UNIT-${loc.unit}</span>
                    <span class="text-white font-bold font-serif">${loc.label}</span>
                </div>
                <div class="text-[var(--secondary-color)] text-sm font-bold mb-1">${loc.title}</div>
                <p class="text-gray-400 text-xs leading-relaxed">${loc.desc}</p>
            `;
                panel.classList.remove('hidden');
            }

            function closeMapPanel() {
                document.getElementById('map-info-panel').classList.add('hidden');
            }

            // 当切换到 About 视图时初始化地图
            const originalSwitchView = window.switchView;
            window.switchView = function (view) {
                if (typeof originalSwitchView === 'function') {
                    originalSwitchView(view);
                }
                if (view === 'about') {
                    setTimeout(initPilgrimageMap, 300);
                }
            };

            // 页面加载后检查是否在 About 视图
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    const aboutView = document.getElementById('about-view-container');
                    if (aboutView && !aboutView.classList.contains('hidden')) {
                        initPilgrimageMap();
                    }
                }, 500);
            });

            // === Literary Archive: Tetralogy Toggle ===
            function toggleTetralogy() {
                const list = document.getElementById('tetralogy-list');
                const chevron = document.querySelector('.tetralogy-chevron');

                if (list.classList.contains('hidden')) {
                    // Expand
                    list.classList.remove('hidden');
                    list.style.maxHeight = '0px';
                    list.style.opacity = '0';
                    list.style.overflow = 'hidden';
                    list.style.transition = 'max-height 0.4s ease-out, opacity 0.3s ease-out';

                    requestAnimationFrame(() => {
                        list.style.maxHeight = list.scrollHeight + 'px';
                        list.style.opacity = '1';
                    });

                    if (chevron) {
                        chevron.style.transform = 'rotate(180deg)';
                        chevron.style.transition = 'transform 0.3s ease';
                    }

                    // Reinitialize Lucide icons for new elements
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                } else {
                    // Collapse
                    list.style.maxHeight = '0px';
                    list.style.opacity = '0';

                    if (chevron) {
                        chevron.style.transform = 'rotate(0deg)';
                    }

                    setTimeout(() => {
                        list.classList.add('hidden');
                        list.style.maxHeight = '';
                        list.style.opacity = '';
                        list.style.overflow = '';
                    }, 400);
                }
            }

            // Make toggleTetralogy globally accessible
            window.toggleTetralogy = toggleTetralogy;

            }); // end DOMContentLoaded
        
