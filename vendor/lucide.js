/**
 * @license lucide v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
/*
 * ⚠ 本文件由 tools/build-lucide.mjs 自动生成，请勿手改。
 *   来源：vendor/lucide.full.js（lucide v0.294.0 官方完整包）
 *   已裁剪：只保留项目实际用到的 61 个图标（完整包共 1324 个）
 *   重新生成：npm run build:lucide
 *   新增 data-lucide 图标后必须重新生成，否则该图标不会渲染。
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.lucide = {}));
})(this, (function (exports) { 'use strict';

  const createElement = (tag, attrs, children = []) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach((name) => {
      element.setAttribute(name, String(attrs[name]));
    });
    if (children.length) {
      children.forEach((child) => {
        const childElement = createElement(...child);
        element.appendChild(childElement);
      });
    }
    return element;
  };
  var createElement$1 = ([tag, attrs, children]) => createElement(tag, attrs, children);

  const getAttrs = (element) => Array.from(element.attributes).reduce((attrs, attr) => {
    attrs[attr.name] = attr.value;
    return attrs;
  }, {});
  const getClassNames = (attrs) => {
    if (typeof attrs === "string")
      return attrs;
    if (!attrs || !attrs.class)
      return "";
    if (attrs.class && typeof attrs.class === "string") {
      return attrs.class.split(" ");
    }
    if (attrs.class && Array.isArray(attrs.class)) {
      return attrs.class;
    }
    return "";
  };
  const combineClassNames = (arrayOfClassnames) => {
    const classNameArray = arrayOfClassnames.flatMap(getClassNames);
    return classNameArray.map((classItem) => classItem.trim()).filter(Boolean).filter((value, index, self) => self.indexOf(value) === index).join(" ");
  };
  const toPascalCase = (string) => string.replace(/(\w)(\w*)(_|-|\s*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase());
  const replaceElement = (element, { nameAttr, icons, attrs }) => {
    const iconName = element.getAttribute(nameAttr);
    if (iconName == null)
      return;
    const ComponentName = toPascalCase(iconName);
    const iconNode = icons[ComponentName];
    if (!iconNode) {
      return console.warn(
        `${element.outerHTML} icon name was not found in the provided icons object.`
      );
    }
    const elementAttrs = getAttrs(element);
    const [tag, iconAttributes, children] = iconNode;
    const iconAttrs = {
      ...iconAttributes,
      "data-lucide": iconName,
      ...attrs,
      ...elementAttrs
    };
    const classNames = combineClassNames(["lucide", `lucide-${iconName}`, elementAttrs, attrs]);
    if (classNames) {
      Object.assign(iconAttrs, {
        class: classNames
      });
    }
    const svgElement = createElement$1([tag, iconAttrs, children]);
    return element.parentNode?.replaceChild(svgElement, element);
  };

  const defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  };

  const AlertTriangle = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }],
      ["path", { d: "M12 9v4" }],
      ["path", { d: "M12 17h.01" }]
    ]
  ];

  const Aperture = [
    "svg",
    defaultAttributes,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["line", { x1: "14.31", x2: "20.05", y1: "8", y2: "17.94" }],
      ["line", { x1: "9.69", x2: "21.17", y1: "8", y2: "8" }],
      ["line", { x1: "7.38", x2: "13.12", y1: "12", y2: "2.06" }],
      ["line", { x1: "9.69", x2: "3.95", y1: "16", y2: "6.06" }],
      ["line", { x1: "14.31", x2: "2.83", y1: "16", y2: "16" }],
      ["line", { x1: "16.62", x2: "10.88", y1: "12", y2: "21.94" }]
    ]
  ];

  const ArrowLeft = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "m12 19-7-7 7-7" }],
      ["path", { d: "M19 12H5" }]
    ]
  ];

  const ArrowUp = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "m5 12 7-7 7 7" }],
      ["path", { d: "M12 19V5" }]
    ]
  ];

  const ArrowUpToLine = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M5 3h14" }],
      ["path", { d: "m18 13-6-6-6 6" }],
      ["path", { d: "M12 7v14" }]
    ]
  ];

  const BarChart2 = [
    "svg",
    defaultAttributes,
    [
      ["line", { x1: "18", x2: "18", y1: "20", y2: "10" }],
      ["line", { x1: "12", x2: "12", y1: "20", y2: "4" }],
      ["line", { x1: "6", x2: "6", y1: "20", y2: "14" }]
    ]
  ];

  const Book = [
    "svg",
    defaultAttributes,
    [["path", { d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" }]]
  ];

  const BookOpen = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }],
      ["path", { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" }]
    ]
  ];

  const Calendar = [
    "svg",
    defaultAttributes,
    [
      ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", ry: "2" }],
      ["line", { x1: "16", x2: "16", y1: "2", y2: "6" }],
      ["line", { x1: "8", x2: "8", y1: "2", y2: "6" }],
      ["line", { x1: "3", x2: "21", y1: "10", y2: "10" }]
    ]
  ];

  const Check = ["svg", defaultAttributes, [["path", { d: "M20 6 9 17l-5-5" }]]];

  const ChefHat = [
    "svg",
    defaultAttributes,
    [
      [
        "path",
        {
          d: "M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"
        }
      ],
      ["line", { x1: "6", x2: "18", y1: "17", y2: "17" }]
    ]
  ];

  const CheckCircle = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }],
      ["path", { d: "m9 11 3 3L22 4" }]
    ]
  ];

  const ChevronDown = ["svg", defaultAttributes, [["path", { d: "m6 9 6 6 6-6" }]]];

  const ChevronFirst = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "m17 18-6-6 6-6" }],
      ["path", { d: "M7 6v12" }]
    ]
  ];

  const ChevronLeft = ["svg", defaultAttributes, [["path", { d: "m15 18-6-6 6-6" }]]];

  const ChevronRightCircle = [
    "svg",
    defaultAttributes,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["path", { d: "m10 8 4 4-4 4" }]
    ]
  ];

  const ChevronUp = ["svg", defaultAttributes, [["path", { d: "m18 15-6-6-6 6" }]]];

  const ChevronsDownUp = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "m7 20 5-5 5 5" }],
      ["path", { d: "m7 4 5 5 5-5" }]
    ]
  ];

  const Copy = [
    "svg",
    defaultAttributes,
    [
      ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
      ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]
    ]
  ];

  const Disc = [
    "svg",
    defaultAttributes,
    [
      ["circle", { cx: "12", cy: "12", r: "10" }],
      ["circle", { cx: "12", cy: "12", r: "2" }]
    ]
  ];

  const Download = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
      ["polyline", { points: "7 10 12 15 17 10" }],
      ["line", { x1: "12", x2: "12", y1: "15", y2: "3" }]
    ]
  ];

  const FileSearch = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v3" }],
      ["polyline", { points: "14 2 14 8 20 8" }],
      ["path", { d: "M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" }],
      ["path", { d: "m9 18-1.5-1.5" }]
    ]
  ];

  const FileText = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }],
      ["polyline", { points: "14 2 14 8 20 8" }],
      ["line", { x1: "16", x2: "8", y1: "13", y2: "13" }],
      ["line", { x1: "16", x2: "8", y1: "17", y2: "17" }],
      ["line", { x1: "10", x2: "8", y1: "9", y2: "9" }]
    ]
  ];

  const Fingerprint = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" }],
      ["path", { d: "M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2" }],
      ["path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02" }],
      ["path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" }],
      ["path", { d: "M8.65 22c.21-.66.45-1.32.57-2" }],
      ["path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88" }],
      ["path", { d: "M2 16h.01" }],
      ["path", { d: "M21.8 16c.2-2 .131-5.354 0-6" }],
      ["path", { d: "M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" }]
    ]
  ];

  const Flame = [
    "svg",
    defaultAttributes,
    [
      [
        "path",
        {
          d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
        }
      ]
    ]
  ];

  const Github = [
    "svg",
    defaultAttributes,
    [
      [
        "path",
        {
          d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
        }
      ],
      ["path", { d: "M9 18c-4.51 2-5-2-7-2" }]
    ]
  ];

  const Headphones = [
    "svg",
    defaultAttributes,
    [
      [
        "path",
        {
          d: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"
        }
      ]
    ]
  ];

  const Heart = [
    "svg",
    defaultAttributes,
    [
      [
        "path",
        {
          d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        }
      ]
    ]
  ];

  const HeartHandshake = [
    "svg",
    defaultAttributes,
    [
      [
        "path",
        {
          d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        }
      ],
      [
        "path",
        {
          d: "M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"
        }
      ],
      ["path", { d: "m18 15-2-2" }],
      ["path", { d: "m15 18-2-2" }]
    ]
  ];

  const Home = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }],
      ["polyline", { points: "9 22 9 12 15 12 15 22" }]
    ]
  ];

  const Image = [
    "svg",
    defaultAttributes,
    [
      ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }],
      ["circle", { cx: "9", cy: "9", r: "2" }],
      ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }]
    ]
  ];

  const ImagePlus = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" }],
      ["line", { x1: "16", x2: "22", y1: "5", y2: "5" }],
      ["line", { x1: "19", x2: "19", y1: "2", y2: "8" }],
      ["circle", { cx: "9", cy: "9", r: "2" }],
      ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }]
    ]
  ];

  const Inbox = [
    "svg",
    defaultAttributes,
    [
      ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12" }],
      [
        "path",
        {
          d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
        }
      ]
    ]
  ];

  const Key = [
    "svg",
    defaultAttributes,
    [
      ["circle", { cx: "7.5", cy: "15.5", r: "5.5" }],
      ["path", { d: "m21 2-9.6 9.6" }],
      ["path", { d: "m15.5 7.5 3 3L22 7l-3-3" }]
    ]
  ];

  const Library = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "m16 6 4 14" }],
      ["path", { d: "M12 6v14" }],
      ["path", { d: "M8 8v12" }],
      ["path", { d: "M4 4v16" }]
    ]
  ];

  const List = [
    "svg",
    defaultAttributes,
    [
      ["line", { x1: "8", x2: "21", y1: "6", y2: "6" }],
      ["line", { x1: "8", x2: "21", y1: "12", y2: "12" }],
      ["line", { x1: "8", x2: "21", y1: "18", y2: "18" }],
      ["line", { x1: "3", x2: "3.01", y1: "6", y2: "6" }],
      ["line", { x1: "3", x2: "3.01", y1: "12", y2: "12" }],
      ["line", { x1: "3", x2: "3.01", y1: "18", y2: "18" }]
    ]
  ];

  const ListTree = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M21 12h-8" }],
      ["path", { d: "M21 6H8" }],
      ["path", { d: "M21 18h-8" }],
      ["path", { d: "M3 6v4c0 1.1.9 2 2 2h3" }],
      ["path", { d: "M3 10v6c0 1.1.9 2 2 2h3" }]
    ]
  ];

  const Loader2 = [
    "svg",
    defaultAttributes,
    [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }]]
  ];

  const LogOut = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }],
      ["polyline", { points: "16 17 21 12 16 7" }],
      ["line", { x1: "21", x2: "9", y1: "12", y2: "12" }]
    ]
  ];

  const MapPin = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }],
      ["circle", { cx: "12", cy: "10", r: "3" }]
    ]
  ];

  const Menu = [
    "svg",
    defaultAttributes,
    [
      ["line", { x1: "4", x2: "20", y1: "12", y2: "12" }],
      ["line", { x1: "4", x2: "20", y1: "6", y2: "6" }],
      ["line", { x1: "4", x2: "20", y1: "18", y2: "18" }]
    ]
  ];

  const MessageCircle = [
    "svg",
    defaultAttributes,
    [["path", { d: "m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" }]]
  ];

  const MessageSquare = [
    "svg",
    defaultAttributes,
    [["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }]]
  ];

  const Music2 = [
    "svg",
    defaultAttributes,
    [
      ["circle", { cx: "8", cy: "18", r: "4" }],
      ["path", { d: "M12 18V2l7 4" }]
    ]
  ];

  const Pause = [
    "svg",
    defaultAttributes,
    [
      ["rect", { width: "4", height: "16", x: "6", y: "4" }],
      ["rect", { width: "4", height: "16", x: "14", y: "4" }]
    ]
  ];

  const Search = [
    "svg",
    defaultAttributes,
    [
      ["circle", { cx: "11", cy: "11", r: "8" }],
      ["path", { d: "m21 21-4.3-4.3" }]
    ]
  ];

  const Send = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "m22 2-7 20-4-9-9-4Z" }],
      ["path", { d: "M22 2 11 13" }]
    ]
  ];

  const Settings2 = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M20 7h-9" }],
      ["path", { d: "M14 17H5" }],
      ["circle", { cx: "17", cy: "17", r: "3" }],
      ["circle", { cx: "7", cy: "7", r: "3" }]
    ]
  ];

  const Shield = [
    "svg",
    defaultAttributes,
    [["path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" }]]
  ];

  const Shuffle = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" }],
      ["path", { d: "m18 2 4 4-4 4" }],
      ["path", { d: "M2 6h1.9c1.5 0 2.9.9 3.6 2.2" }],
      ["path", { d: "M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" }],
      ["path", { d: "m18 14 4 4-4 4" }]
    ]
  ];

  const SkipBack = [
    "svg",
    defaultAttributes,
    [
      ["polygon", { points: "19 20 9 12 19 4 19 20" }],
      ["line", { x1: "5", x2: "5", y1: "19", y2: "5" }]
    ]
  ];

  const SkipForward = [
    "svg",
    defaultAttributes,
    [
      ["polygon", { points: "5 4 15 12 5 20 5 4" }],
      ["line", { x1: "19", x2: "19", y1: "5", y2: "19" }]
    ]
  ];

  const Snowflake = [
    "svg",
    defaultAttributes,
    [
      ["line", { x1: "2", x2: "22", y1: "12", y2: "12" }],
      ["line", { x1: "12", x2: "12", y1: "2", y2: "22" }],
      ["path", { d: "m20 16-4-4 4-4" }],
      ["path", { d: "m4 8 4 4-4 4" }],
      ["path", { d: "m16 4-4 4-4-4" }],
      ["path", { d: "m8 20 4-4 4 4" }]
    ]
  ];

  const Sparkles = [
    "svg",
    defaultAttributes,
    [
      [
        "path",
        {
          d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
        }
      ],
      ["path", { d: "M5 3v4" }],
      ["path", { d: "M19 17v4" }],
      ["path", { d: "M3 5h4" }],
      ["path", { d: "M17 19h4" }]
    ]
  ];

  const Split = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M16 3h5v5" }],
      ["path", { d: "M8 3H3v5" }],
      ["path", { d: "M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" }],
      ["path", { d: "m15 9 6-6" }]
    ]
  ];

  const Sun = [
    "svg",
    defaultAttributes,
    [
      ["circle", { cx: "12", cy: "12", r: "4" }],
      ["path", { d: "M12 2v2" }],
      ["path", { d: "M12 20v2" }],
      ["path", { d: "m4.93 4.93 1.41 1.41" }],
      ["path", { d: "m17.66 17.66 1.41 1.41" }],
      ["path", { d: "M2 12h2" }],
      ["path", { d: "M20 12h2" }],
      ["path", { d: "m6.34 17.66-1.41 1.41" }],
      ["path", { d: "m19.07 4.93-1.41 1.41" }]
    ]
  ];

  const SunMoon = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" }],
      ["path", { d: "M12 2v2" }],
      ["path", { d: "M12 20v2" }],
      ["path", { d: "m4.9 4.9 1.4 1.4" }],
      ["path", { d: "m17.7 17.7 1.4 1.4" }],
      ["path", { d: "M2 12h2" }],
      ["path", { d: "M20 12h2" }],
      ["path", { d: "m6.3 17.7-1.4 1.4" }],
      ["path", { d: "m19.1 4.9-1.4 1.4" }]
    ]
  ];

  const Swords = [
    "svg",
    defaultAttributes,
    [
      ["polyline", { points: "14.5 17.5 3 6 3 3 6 3 17.5 14.5" }],
      ["line", { x1: "13", x2: "19", y1: "19", y2: "13" }],
      ["line", { x1: "16", x2: "20", y1: "16", y2: "20" }],
      ["line", { x1: "19", x2: "21", y1: "21", y2: "19" }],
      ["polyline", { points: "14.5 6.5 18 3 21 3 21 6 17.5 9.5" }],
      ["line", { x1: "5", x2: "9", y1: "14", y2: "18" }],
      ["line", { x1: "7", x2: "4", y1: "17", y2: "20" }],
      ["line", { x1: "3", x2: "5", y1: "19", y2: "21" }]
    ]
  ];

  const Terminal = [
    "svg",
    defaultAttributes,
    [
      ["polyline", { points: "4 17 10 11 4 5" }],
      ["line", { x1: "12", x2: "20", y1: "19", y2: "19" }]
    ]
  ];

  const Tv = [
    "svg",
    defaultAttributes,
    [
      ["rect", { width: "20", height: "15", x: "2", y: "7", rx: "2", ry: "2" }],
      ["polyline", { points: "17 2 12 7 7 2" }]
    ]
  ];

  const Type = [
    "svg",
    defaultAttributes,
    [
      ["polyline", { points: "4 7 4 4 20 4 20 7" }],
      ["line", { x1: "9", x2: "15", y1: "20", y2: "20" }],
      ["line", { x1: "12", x2: "12", y1: "4", y2: "20" }]
    ]
  ];

  const Unlock = [
    "svg",
    defaultAttributes,
    [
      ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }],
      ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1" }]
    ]
  ];

  const User = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }],
      ["circle", { cx: "12", cy: "7", r: "4" }]
    ]
  ];

  const X = [
    "svg",
    defaultAttributes,
    [
      ["path", { d: "M18 6 6 18" }],
      ["path", { d: "m6 6 12 12" }]
    ]
  ];

  const Zap = [
    "svg",
    defaultAttributes,
    [["polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" }]]
  ];

  var iconAndAliases = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AlertTriangle: AlertTriangle,
    Aperture: Aperture,
    ArrowLeft: ArrowLeft,
    ArrowUp: ArrowUp,
    ArrowUpToLine: ArrowUpToLine,
    BarChart2: BarChart2,
    Book: Book,
    BookOpen: BookOpen,
    Calendar: Calendar,
    Check: Check,
    CheckCircle: CheckCircle,
    ChevronDown: ChevronDown,
    ChevronLeft: ChevronLeft,
    ChevronUp: ChevronUp,
    Copy: Copy,
    Disc: Disc,
    Download: Download,
    FileSearch: FileSearch,
    FileText: FileText,
    Fingerprint: Fingerprint,
    Flame: Flame,
    Github: Github,
    Headphones: Headphones,
    Heart: Heart,
    HeartHandshake: HeartHandshake,
    Home: Home,
    Image: Image,
    ImagePlus: ImagePlus,
    Inbox: Inbox,
    Key: Key,
    Library: Library,
    List: List,
    ListTree: ListTree,
    Loader2: Loader2,
    LogOut: LogOut,
    MapPin: MapPin,
    Menu: Menu,
    MessageCircle: MessageCircle,
    MessageSquare: MessageSquare,
    Music2: Music2,
    Pause: Pause,
    Search: Search,
    Send: Send,
    Settings2: Settings2,
    Shield: Shield,
    Shuffle: Shuffle,
    SkipBack: SkipBack,
    SkipForward: SkipForward,
    Snowflake: Snowflake,
    Sparkles: Sparkles,
    Split: Split,
    Sun: Sun,
    SunMoon: SunMoon,
    Swords: Swords,
    Terminal: Terminal,
    Tv: Tv,
    Type: Type,
    Unlock: Unlock,
    User: User,
    X: X,
    Zap: Zap,
  });

  const createIcons = ({ icons = iconAndAliases, nameAttr = "data-lucide", attrs = {} } = {}) => {
    if (!Object.values(icons).length) {
      throw new Error(
        "Please provide an icons object.\nIf you want to use all the icons you can import it like:\n `import { createIcons, icons } from 'lucide';\nlucide.createIcons({icons});`"
      );
    }
    if (typeof document === "undefined") {
      throw new Error("`createIcons()` only works in a browser environment.");
    }
    const elementsToReplace = document.querySelectorAll(`[${nameAttr}]`);
    Array.from(elementsToReplace).forEach(
      (element) => replaceElement(element, { nameAttr, icons, attrs })
    );
    if (nameAttr === "data-lucide") {
      const deprecatedElements = document.querySelectorAll("[icon-name]");
      if (deprecatedElements.length > 0) {
        console.warn(
          "[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"
        );
        Array.from(deprecatedElements).forEach(
          (element) => replaceElement(element, { nameAttr: "icon-name", icons, attrs })
        );
      }
    }
  };

  exports.createElement = createElement$1;
  exports.createIcons = createIcons;
  exports.icons = iconAndAliases;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
