const fs = require('fs')

let html = fs.readFileSync('dist/index.html', 'utf8')

const pwaTags = [
  '<link rel="manifest" href="/manifest.json" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
  '<meta name="apple-mobile-web-app-title" content="Simple Finance" />',
  '<link rel="apple-touch-icon" href="/icon.png" />',
].join('\n    ')

html = html.replace('</head>', `    ${pwaTags}\n  </head>`)
fs.writeFileSync('dist/index.html', html)

fs.copyFileSync('assets/icon.png', 'dist/icon.png')
if (fs.existsSync('public')) {
  fs.readdirSync('public').forEach((f) => fs.copyFileSync(`public/${f}`, `dist/${f}`))
}

console.log('PWA post-build complete.')
