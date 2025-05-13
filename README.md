# scraping-tools
Node.js + axios + cheerio を使って構築した、静的Webサイト保存ツールです。  
指定したURLのページを構造を保ったまま保存し、HTML/CSS/JS/画像/音声/動画などのアセットをローカルに一括取得できます。  
Web制作現場や移行不可能なCMS対策、Webバックアップ用途などに活用できます。

## 📦 特徴

- URL構造に沿って HTML をディレクトリ保存
- CSS・JS・画像・音声・動画ファイルを再帰的にダウンロード
- CSS内部の `background-image: url()` なども正規表現で解析して取得
- `<a href="...">` の内部リンクを再帰的に辿って静的保存
- `BASE_URL` を変えるだけで他のサイトにも使い回し可能

## 🛠 使い方

### 1. 必要なライブラリをインストール

```bash
npm install axios cheerio
```
環境依存の注意点：
- Node.jsのバージョンやESM構文使用時、`url`, `fs`, `path` の扱いが異なる場合があります
- `require('url')` が失敗する環境では `npm install url` による補完導入で対応できます

### 2. 設定
スクリプト内の以下の2点を自身の環境に合わせて書き換えてください：
```js
const BASE_URL = 'https://example.com/';
const BACKUP_FOLDER = 'D:/your/backup/folder';
```

### 3. スクリプトを実行
```bash
node scraper.js
```

## 📄 Related Articles

- Qiita: [Node.jsで静的Webサイトを丸ごと保存するツールを作った](https://qiita.com/msfactory1103/items/9cdb8a5d80a3561bb1a4)
- Zenn: [静的Webサイトを丸ごと保存するNode.jsツール](https://zenn.dev/msfactory/articles/45035ba0a4293f)

---

## 🌍 English Version

# scraping-tools

A static web scraping tool built with Node.js + axios + cheerio.  
Downloads a target URL's HTML, CSS, JS, images, audio, and video assets while preserving its structure.  
Ideal for CMS migration, static backups, or archiving inaccessible web content.

## 📦 Features

- Saves HTML files with folder structure that reflects the site's URL paths  
- Recursively downloads CSS, JS, images, audio, and video files  
- Parses `background-image: url(...)` inside CSS for additional asset fetching  
- Follows internal links recursively via `<a href="...">`  
- Reusable: just change `BASE_URL` to target other websites

## 🛠 Usage

### 1. Install required libraries

```bash
npm install axios cheerio
```
Environment Notes:

Depending on your Node.js version or ESM usage, modules like url, fs, and path may behave differently

If require('url') fails, run npm install url to manually include it

### 2. Configure constants in the script
Update the following values inside your script:
```js
const BASE_URL = 'https://example.com/';
const BACKUP_FOLDER = 'D:/your/backup/folder';
```

### 3. Run the script
```bash
node scraper.js
```
