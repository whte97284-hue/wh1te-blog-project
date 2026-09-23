#!/usr/bin/env node
/**
 * ============================================================================
 *  lucide 图标库 · 按需裁剪
 *  ---------------------------------------------------------------------------
 *  背景：
 *    项目里实际只用到 61 个图标，而 vendor/lucide.js 是完整包 —— 1324 个图标，
 *    原始 476 KB / gzip 约 83.5 KB。首屏要白白下载这些用不到的数据。
 *
 *  做法：
 *    不重新发明实现，而是【从官方完整包里抽出三块原样保留】：
 *      1) 第 14–90 行的 helper（createElement / replaceElement / defaultAttributes …）
 *      2) 实际用到的图标定义（const Xxx = [...]）
 *      3) 官方自己的 createIcons 实现
 *    再拼成一个同样结构的 UMD。这样运行时行为与完整包完全一致，
 *    只是 icons 表里少了用不到的图标。
 *
 *  依赖文件：
 *    vendor/lucide.full.js   ← 官方完整包（裁剪的来源，必须保留）
 *    vendor/lucide.js        ← 本脚本生成的裁剪版（页面实际加载这个）
 *
 *  用法：
 *    npm run build:lucide
 *
 *  注意：
 *    新增图标（在 HTML/JS 里写了新的 data-lucide="xxx"）之后必须重新跑一次，
 *    否则该图标不会渲染，控制台会出现 "icon name was not found" 警告。
 * ============================================================================
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FULL = path.join(ROOT, 'vendor', 'lucide.full.js');
const OUT = path.join(ROOT, 'vendor', 'lucide.js');

/** 扫描哪些文件里的 data-lucide / icon: 需要计入 */
const SCAN = [
  'index.html', 'main.js', 'boot-loader.js',
  'card.html', 'card2.html', 'reader.html', 'password.html', 'about-fragment.html',
  'managers/bili-manager.js', 'managers/eriri-lines-manager.js',
  'managers/pixiv-manager.js', 'managers/steam-manager.js',
];

/* -------------------------------------------------------------------------- */
/** 复刻 lucide 的 toPascalCase（必须与包内实现一致，否则查不到图标） */
function toPascalCase(str) {
  return str.replace(/(\w)(\w*)(_|-|\s*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase());
}

/** 从项目源码里提取用到的图标名（kebab-case） */
async function collectIconNames() {
  const names = new Set();
  for (const rel of SCAN) {
    let s;
    try {
      s = await readFile(path.join(ROOT, rel), 'utf8');
    } catch {
      continue; // 文件不存在就跳过
    }
    // data-lucide="xxx"，以及模板表达式里 'xxx' / "xxx"
    for (const m of s.matchAll(/data-lucide="([^"]*)"/g)) {
      const v = m[1];
      if (/^[a-z0-9-]+$/.test(v)) names.add(v);
      for (const q of v.matchAll(/'([a-z0-9-]+)'|"([a-z0-9-]+)"/g)) {
        if (q[1]) names.add(q[1]);
        if (q[2]) names.add(q[2]);
      }
    }
    // 动态图标的数据源，形如 icon: 'xxx'
    for (const m of s.matchAll(/icon\s*:\s*['"]([a-z0-9-]+)['"]/g)) {
      names.add(m[1]);
    }
  }
  return [...names].sort();
}

/** 从完整包里抽出一个图标定义（const Xxx = [ ... ];） */
function extractIcon(src, name) {
  const startRe = new RegExp('^  const ' + name + ' = \\[', 'm');
  const m = startRe.exec(src);
  if (!m) return null;
  const endRe = /^  \];$/gm;
  endRe.lastIndex = m.index;
  const e = endRe.exec(src);
  if (!e) return null;
  return src.slice(m.index, e.index + e[0].length);
}

/** 抽出 helper 块（createElement … defaultAttributes） */
function extractHelpers(src) {
  const start = src.indexOf('  const createElement = ');
  const end = src.indexOf('  const Accessibility = [');
  if (start === -1 || end === -1) throw new Error('找不到 helper 块边界');
  return src.slice(start, end).trimEnd();
}

/** 抽出官方的 createIcons 实现 */
function extractCreateIcons(src) {
  const start = src.indexOf('  const createIcons = ');
  const end = src.indexOf('\n  exports.', start);
  if (start === -1 || end === -1) throw new Error('找不到 createIcons 边界');
  return src.slice(start, end).trimEnd();
}

function extractLicense(src) {
  const m = /^\/\*\*[\s\S]*?\*\//.exec(src);
  return m ? m[0] : '/* lucide - ISC */';
}

/* -------------------------------------------------------------------------- */
async function main() {
  // 首次运行时，把当前文件当作完整包备份
  try {
    await access(FULL);
  } catch {
    const cur = await readFile(OUT, 'utf8');
    if (cur.includes('lucide v') && cur.length > 400000) {
      await writeFile(FULL, cur, 'utf8');
      console.log('▸ 已把当前 vendor/lucide.js 备份为 vendor/lucide.full.js');
    } else {
      throw new Error('缺少 vendor/lucide.full.js（官方完整包）。请先放置该文件。');
    }
  }

  const full = await readFile(FULL, 'utf8');
  const license = extractLicense(full);
  const helpers = extractHelpers(full);
  const createIcons = extractCreateIcons(full);

  const wanted = await collectIconNames();
  console.log(`▸ 项目用到的图标：${wanted.length} 个`);

  const defs = [];
  const entries = [];
  const missing = [];
  for (const kebab of wanted) {
    const pascal = toPascalCase(kebab);
    const def = extractIcon(full, pascal);
    if (!def) {
      missing.push(`${kebab} (${pascal})`);
      continue;
    }
    defs.push(def);
    entries.push(`    ${pascal}: ${pascal},`);
  }

  if (missing.length) {
    console.warn('⚠ 以下图标在完整包里找不到，已跳过：');
    for (const m of missing) console.warn('   · ' + m);
  }

  const out = `${license}
/*
 * ⚠ 本文件由 tools/build-lucide.mjs 自动生成，请勿手改。
 *   来源：vendor/lucide.full.js（lucide v0.294.0 官方完整包）
 *   已裁剪：只保留项目实际用到的 ${defs.length} 个图标（完整包共 1324 个）
 *   重新生成：npm run build:lucide
 *   新增 data-lucide 图标后必须重新生成，否则该图标不会渲染。
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.lucide = {}));
})(this, (function (exports) { 'use strict';

${helpers}

${defs.join('\n\n')}

  var iconAndAliases = /*#__PURE__*/Object.freeze({
    __proto__: null,
${entries.join('\n')}
  });

${createIcons}

  exports.createElement = createElement$1;
  exports.createIcons = createIcons;
  exports.icons = iconAndAliases;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
`;

  await writeFile(OUT, out, 'utf8');

  const before = Buffer.byteLength(full, 'utf8');
  const after = Buffer.byteLength(out, 'utf8');
  const pct = ((1 - after / before) * 100).toFixed(1);
  console.log(`▸ 已生成 vendor/lucide.js`);
  console.log(`   ${before.toLocaleString()} → ${after.toLocaleString()} 字节（省 ${pct}%）`);
}

main().catch((e) => {
  console.error(`\n✗ 生成失败：${e.message}`);
  process.exit(1);
});
