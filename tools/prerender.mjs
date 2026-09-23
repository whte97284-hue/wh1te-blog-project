#!/usr/bin/env node
/**
 * ============================================================================
 *  首页文章列表 · 构建期预渲染
 *  ---------------------------------------------------------------------------
 *  为什么需要它：
 *    首页文章列表原本 100% 依赖运行时请求 api-worker.wh1te.top。
 *    这带来两个问题 ——
 *      1) 首屏 HTML 里没有任何文章，用户要先看到骨架屏再等一次 API 往返（LCP 差）；
 *      2) 该 API 会间歇性返回 502（ALL_SOURCES_FAILED），此时首页直接显示
 *         "CONNECTION LOST"，这就是"时好时坏"的来源。
 *    社区共识：静态化程度高的页面，构建期预渲染成 HTML 是 LCP 提升最明显的一招，
 *    判断标准就一条 —— 首屏 HTML 里能不能直接看到内容。
 *
 *  它做什么：
 *    拉取第一页文章，按 main.js 里 renderPage() 的同一套标记生成静态卡片，
 *    写进 index.html 的 PRERENDER 区块，并把文章 id 列表写进容器的 data-prerendered。
 *    main.js 拿到 API 数据后会比对 id 列表：一致就保留这段 DOM 不重绘（避免闪烁），
 *    不一致才走原来的渲染路径（这样新发布的文章仍能自动出现）。
 *
 *  用法：
 *    node tools/prerender.mjs            # 生成
 *    npm run prerender                   # 同上
 *
 *  注意：
 *    · 失败时不会写入文件（保留上一次的内容），不会把页面改坏。
 *    · 只依赖 Node 18+ 内置的 fetch，无需安装任何依赖。
 * ============================================================================
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX_PATH = path.join(ROOT, 'index.html');

const API = 'https://api-worker.wh1te.top/blog/posts';
const PER_PAGE = 6;
const FIELDS = 'id,date,title,excerpt,slug';
const MAX_TRIES = 6;

const START = '<!-- PRERENDER:START -->';
const END = '<!-- PRERENDER:END -->';

/* -------------------------------------------------------------------------- */
/* 拉取文章（API 会间歇性 502，所以带重试）                                    */
/* -------------------------------------------------------------------------- */
async function fetchPosts() {
  const url = `${API}?page=1&per_page=${PER_PAGE}&_fields=${FIELDS}`;
  let lastErr;
  for (let i = 1; i <= MAX_TRIES; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('响应不是非空数组（可能是 ALL_SOURCES_FAILED）');
      }
      if (i > 1) console.log(`  ✓ 第 ${i} 次尝试成功`);
      return data;
    } catch (e) {
      lastErr = e;
      console.warn(`  ✗ 第 ${i}/${MAX_TRIES} 次失败：${e.message}`);
      if (i < MAX_TRIES) await new Promise((r) => setTimeout(r, 1200 * i));
    }
  }
  throw new Error(`多次重试后仍无法获取文章列表：${lastErr?.message}`);
}

/* -------------------------------------------------------------------------- */
/* 与 main.js 对齐的格式化逻辑                                                 */
/* -------------------------------------------------------------------------- */

/**
 * 复刻 main.js 的 `new Date(post.date).toISOString().split('T')[0]`。
 * post.date 形如 `2026-07-28T06:06:46`（不带时区），浏览器会按【本地时区】解析，
 * 再转成 UTC —— 所以大陆访客看到的日期会比原始日期早一天（凌晨发布的文章）。
 * 这里固定按 UTC+8 计算，保证：① 与大陆访客看到的一致；② 与构建机所在时区无关。
 *
 * 注：这个"早一天"是原有行为，本次不改动（改了会让历史文章日期整体位移）。
 */
function formatDate(s) {
  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s) ? `${s}+08:00` : s;
  return new Date(iso).toISOString().split('T')[0];
}

function buildExcerpt(post) {
  if (!post.excerpt || !post.excerpt.rendered) return 'NO SUMMARY';
  // 与 main.js 完全一致：去标签 → 去 [&hellip;] → trim → 超 40 字截断
  const raw = post.excerpt.rendered.replace(/<[^>]+>/g, '').replace('[&hellip;]', '').trim();
  return raw.length > 40 ? `${raw.substring(0, 40)}...` : raw;
}

/* -------------------------------------------------------------------------- */
/* 生成卡片（标记与 main.js renderPage() 保持一致）                            */
/* -------------------------------------------------------------------------- */
function renderCard(post) {
  const id = post.id;
  const title = post.title?.rendered ?? '';
  const excerpt = buildExcerpt(post);
  const date = formatDate(post.date);

  // 与 main.js 的差异只有一处：去掉 popIn 入场动画与 opacity:0。
  // 静态内容必须在 HTML 到达时立刻可见，不能等动画（那正是预渲染要解决的问题）。
  return `                    <article class="eva-card p-0 group cursor-pointer transform transition-transform hover:-translate-y-1 overflow-hidden flex flex-col bg-black/20"
                             data-id="${id}"
                             onclick="ArticleViewer.open(${id})">
                        <div class="eva-glare"></div>
                        <div class="w-full h-[3px] bg-gradient-to-r from-secondary via-primary to-secondary opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>
                        <div class="p-4 flex flex-col flex-1 relative pl-5">
                            <div class="charge-line absolute left-0 top-0 bottom-0 w-[2px] bg-white/10 group-hover:bg-secondary/30 transition-colors duration-500 overflow-hidden"><div class="charge-glow w-full h-full"></div></div>
                            <div class="eva-header mb-2 flex items-center w-full">
                                <span class="text-xs">ARCHIVE_${id}</span>
                            </div>
                            <h3 class="text-lg font-bold leading-tight group-hover:text-secondary transition-colors duration-300 font-serif mb-1">${title}</h3>
                            <p class="text-gray-400 text-xs leading-relaxed mb-3">${excerpt}</p>
                            <div class="mt-auto pt-3 flex items-center justify-between text-[10px] font-mono text-gray-500 border-t border-white/5">
                                <span>${date}</span>
                                <div class="flex gap-2 overflow-hidden truncate max-w-[60%] justify-end"></div>
                            </div>
                        </div>
                    </article>`;
}

/* -------------------------------------------------------------------------- */
/* 注入 index.html                                                             */
/* -------------------------------------------------------------------------- */
function inject(html, cards, ids) {
  const s = html.indexOf(START);
  const e = html.indexOf(END);
  if (s === -1 || e === -1 || e < s) {
    throw new Error(
      `index.html 里找不到 PRERENDER 标记。请先手动加入：\n` +
      `  ${START}\n  ...\n  ${END}`
    );
  }

  const block =
    `${START}\n` +
    `                    <!-- 本段由 tools/prerender.mjs 生成，请勿手改。\n` +
    `                         生成时间 ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC\n` +
    `                         作用：让首屏 HTML 里直接就能看到文章列表，不依赖运行时 API 往返。 -->\n` +
    cards.join('\n') +
    `\n                    ${END}`;

  let out = html.slice(0, s) + block + html.slice(e + END.length);

  // 同步更新容器上的 data-prerendered（main.js 靠它决定是否复用这段 DOM）
  out = out.replace(
    /(<div id="article-list-container"[^>]*?)data-prerendered="[^"]*"/,
    `$1data-prerendered="${ids}"`
  );
  if (!out.includes(`data-prerendered="${ids}"`)) {
    throw new Error('未能更新 data-prerendered 属性，请检查 index.html 的容器标签');
  }
  return out;
}

/* -------------------------------------------------------------------------- */
async function main() {
  console.log('▸ 拉取文章列表…');
  const posts = await fetchPosts();
  console.log(`  ✓ 拿到 ${posts.length} 篇`);

  const cards = posts.map(renderCard);
  const ids = posts.map((p) => p.id).join(',');

  const html = await readFile(INDEX_PATH, 'utf8');
  const out = inject(html, cards, ids);

  if (out === html) {
    console.log('▸ 内容无变化，未写入。');
    return;
  }

  await writeFile(INDEX_PATH, out, 'utf8');
  const delta = out.length - html.length;
  console.log(`▸ 已写入 index.html（${delta >= 0 ? '+' : ''}${delta} 字节）`);
  console.log(`  data-prerendered="${ids}"`);
  console.log('');
  for (const p of posts) {
    console.log(`  · ${String(p.id).padEnd(5)} ${formatDate(p.date)}  ${p.title?.rendered ?? ''}`);
  }
}

main().catch((e) => {
  console.error(`\n✗ 预渲染失败：${e.message}`);
  console.error('  index.html 未被修改。');
  process.exit(1);
});
