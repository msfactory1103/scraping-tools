process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const url = require('url');

const visitedPages = new Set();
const downloadedAssets = new Set();
const BASE_URL = 'https://your-target-site.com/';
const BACKUP_FOLDER = 'D:/path/to/your/backup/folder';

// ✅ HTMLファイル用：URLを構造を保ったファイルパスに変換
function urlToHtmlFilePath(pageUrl) {
  const parsedUrl = url.parse(pageUrl);
  let pathname = parsedUrl.pathname;

  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  } else if (path.extname(pathname)) {
    // /foo.html → /foo/index.html に保存
    pathname = pathname.replace(/\/?([^\/]+)$/, '$1/index.html');
  } else {
    pathname += '/index.html';
  }

  return path.join(BACKUP_FOLDER, pathname);
}

// アセットの保存
async function downloadAsset(assetUrl) {
  if (downloadedAssets.has(assetUrl)) return;
  downloadedAssets.add(assetUrl);

  try {
    const parsed = url.parse(assetUrl);
    const localPath = path.join(BACKUP_FOLDER, parsed.pathname);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });

    const response = await axios.get(assetUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(localPath, response.data);
    console.log(`📦 保存：${localPath}`);

    // CSS内の background-image なども取得
    if (assetUrl.endsWith('.css')) {
      const text = response.data.toString();
      const matches = [...text.matchAll(/url\(["']?([^"')]+)["']?\)/g)];
      for (const match of matches) {
        const cssUrl = match[1];
        if (cssUrl.startsWith('data:')) continue;
        const resolved = cssUrl.startsWith('http') ? cssUrl : url.resolve(assetUrl, cssUrl);
        await downloadAsset(resolved);
      }
    }
  } catch (err) {
    console.error(`❌ アセット取得失敗：${assetUrl} (${err.message})`);
  }
}

// HTMLページ取得
async function fetchPage(pageUrl) {
  if (visitedPages.has(pageUrl)) return;
  visitedPages.add(pageUrl);

  try {
    const response = await axios.get(pageUrl);
    const html = response.data;

    const filePath = urlToHtmlFilePath(pageUrl); // ← ここ変更
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`✅ HTML保存：${filePath}`);

    const $ = cheerio.load(html);

    // CSS
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const cssUrl = href.startsWith('http') ? href : url.resolve(BASE_URL, href);
      downloadAsset(cssUrl);
    });

    // JS
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (!src) return;
      const jsUrl = src.startsWith('http') ? src : url.resolve(BASE_URL, src);
      downloadAsset(jsUrl);
    });

    // 画像
    $('img[src], source[src], source[srcset]').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('srcset');
      if (!src) return;
      const imgUrl = src.startsWith('http') ? src : url.resolve(BASE_URL, src);
      downloadAsset(imgUrl);
    });

    // 音声・動画
    $('video[src], audio[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (!src) return;
      const mediaUrl = src.startsWith('http') ? src : url.resolve(BASE_URL, src);
      downloadAsset(mediaUrl);
    });

    // 下層ページを再帰
    $('a[href]').each((_, el) => {
      let link = $(el).attr('href');
      if (!link || link.startsWith('mailto:') || link.startsWith('#')) return;
      if (!link.startsWith('http')) {
        link = url.resolve(BASE_URL, link);
      }
      if (link.startsWith(BASE_URL)) {
        fetchPage(link);
      }
    });

  } catch (err) {
    console.error(`❌ ページ取得失敗：${pageUrl} (${err.message})`);
  }
}

fetchPage(BASE_URL);
