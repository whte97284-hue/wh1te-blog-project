/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    // 扫描这些文件中的 Tailwind 类名
    content: [
        "./*.html",           // 根目录的所有 HTML (index.html, reader.html 等)
        "./*.js",             // 根目录的 JS (main.js)
        "./managers/*.js",    // managers 文件夹下的 JS
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Space Grotesk', 'Noto Sans JP', 'sans-serif'],
                serif: ['Noto Serif SC', 'serif'],
                mono: ['JetBrains Mono', 'Noto Sans JP', 'monospace'],
            },
            colors: {
                primary: 'var(--primary-color)',
                secondary: 'var(--secondary-color)',
                bg: 'var(--bg-color)',
                surface: 'var(--surface-color)',
                emergency: '#ff0000',
            },
            animation: {
                'spin-slow': 'spin 30s linear infinite',
                'spin-slower': 'spin 60s linear infinite',
                'glitch': 'glitch 3s linear infinite',
                'scan': 'scan 4s linear infinite',
                'magi-pulse': 'magiPulse 4s ease-in-out infinite',
                'pop-in': 'popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'red-alert': 'redAlert 2s ease-in-out infinite',
                'typing': 'typing 3.5s steps(40, end)',
                'flash': 'flash 2s infinite',
                'scanner-beam': 'scannerBeam 4s ease-in-out infinite',
                'icon-glitch': 'iconGlitch 0.3s ease-in-out forwards',
                'speaking-shake': 'speakingShake 0.5s infinite',
                'hologram-flicker': 'hologramFlicker 3s infinite',
                'chromatic-move': 'chromaticMove 5s infinite alternate',
                'data-stream': 'dataStream 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            },
            keyframes: {
                scan: {
                    '0%': { backgroundPosition: '0 0' },
                    '100%': { backgroundPosition: '0 100%' }
                },
                magiPulse: {
                    '0%, 100%': { opacity: '0.5', boxShadow: '0 0 15px var(--secondary-color)' },
                    '50%': { opacity: '1', boxShadow: '0 0 30px var(--secondary-color)' }
                },
                popIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
                    '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
                },
                redAlert: {
                    '0%, 100%': { boxShadow: 'inset 0 0 30px rgba(255,0,0,0.3)' },
                    '50%': { boxShadow: 'inset 0 0 80px rgba(255,0,0,0.6)' }
                },
                typing: {
                    '0%': { width: '0' },
                    '100%': { width: '100%' }
                },
                flash: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.3' }
                },
                scannerBeam: {
                    '0%': { left: '-100%' },
                    '100%': { left: '200%' }
                },
                iconGlitch: {
                    '0%': { transform: 'scale(0.8) skewX(20deg)', opacity: '0' },
                    '50%': { transform: 'scale(1.1) skewX(-10deg)', opacity: '1' },
                    '100%': { transform: 'scale(1) skewX(0deg)', opacity: '1' }
                },
                speakingShake: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1.02)' },
                    '25%': { transform: 'translate(1px, 1px) scale(1.02)' },
                    '50%': { transform: 'translate(-1px, 0) scale(1.02)' },
                    '75%': { transform: 'translate(0, -1px) scale(1.02)' }
                },
                hologramFlicker: {
                    '0%, 100%': { opacity: '0.95', filter: 'brightness(1.1) contrast(1.2)' },
                    '50%': { opacity: '0.8', filter: 'brightness(0.9) contrast(1)' },
                    '92%': { opacity: '0.95', transform: 'skewX(0deg)' },
                    '93%': { opacity: '0.6', transform: 'skewX(2deg)' },
                    '94%': { opacity: '0.95', transform: 'skewX(0deg)' },
                    '96%': { transform: 'translate(1px, 0)' },
                    '97%': { transform: 'translate(-1px, 0)' }
                },
                chromaticMove: {
                    '0%': { textShadow: '-2px 0 0 rgba(255,0,0,0.5), 2px 0 0 rgba(0,255,255,0.5)' },
                    '100%': { textShadow: '-1px 0 0 rgba(255,0,0,0.5), 1px 0 0 rgba(0,255,255,0.5)' }
                },
                dataStream: {
                    '0%': { opacity: '0', transform: 'translateX(-10px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' }
                }
            }
        },
    },
    plugins: [],
}
