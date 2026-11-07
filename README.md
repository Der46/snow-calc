<p align="center">
  <img src="icon.svg" alt="雪崩派對進度計算機" width="128" height="128" />
</p>

<h1 align="center">雪崩派對・極速之星 進度計算機</h1>

<p align="center">
  雪崩派對與極速之星活動的隊伍分數、獎勵進度與代幣期望值計算工具
</p>

## 功能

- **活動切換**：頂部切換「雪崩派對」與「極速之星」，各自使用不同配色主題；網址會帶上 `#avalanche`、`#speed-1`～`#speed-3`，可直接分享。
- **極速之星三回合**：第 1 回合 10 個獎勵（1,800 → 600,000 分）、第 2、3 回合各 11 個獎勵（10,000 → 1,700,000 分），每個回合的輸入分開儲存。
- **隊伍分數加總**：輸入自己與隊友目前的分數，自動合計隊伍總分。
- **獎勵進度軌道**：顯示 15 個獎勵階段（金槌 4,000 分 → 80,000 能量 2,095,000 分），標出目前進度、預估進度與下一階段。
- **雪幣期望值**：以固定換算 **1 雪幣 ≈ 26 分**，預估把雙方剩餘雪幣跑完後可到達的總分與階段。
- **距離下一階段**：計算還差多少分數，以及需要準備多少雪幣。
- **建議轉法**：依剩餘雪幣數量（≥ 2,000、≥ 5,000）自動建議倍率策略。
- **自動儲存**：輸入內容即時計算並存到瀏覽器 `localStorage`。
- **多語系**：繁體中文、English、Tiếng Việt、日本語、한국어、ไทย、Bahasa Indonesia、Español、Português BR。
- **可加到主畫面**：附 SVG App 圖示與 Web App Manifest。

## 使用方式

純靜態網頁，不需要建置。因為語系檔 `i18n.json` 是用 `fetch` 載入，請用本機伺服器開啟，而不是直接雙擊 `index.html`：

```bash
npx serve .
```

或

```bash
python -m http.server 8000
```

然後在瀏覽器開啟顯示的網址即可。也可以直接部署到 GitHub Pages。

## 檔案結構

| 檔案 | 說明 |
| --- | --- |
| `index.html` | 頁面結構 |
| `style.css` | 樣式 |
| `app.js` | 計算邏輯、獎勵階段、策略建議與語系切換 |
| `i18n.json` | 各語系翻譯字串 |
| `icon.svg` | App 圖示 |
| `manifest.webmanifest` | Web App Manifest |

## 調整設定

- 獎勵階段：修改 `app.js` 中的 `avalancheRewards` 與 `speedRewards`（門檻、翻譯 key、圖示）。
- 各活動換算比例：修改 `app.js` 中 `MODES` 的 `pointPerCoin`。
- 極速之星專用文字：`i18n.json` 的 `modeI18n.speed`，會覆蓋同 key 的一般文字。
- 新增語系：在 `i18n.json` 加入 `languageMeta` 與對應翻譯，並在 `index.html` 的語言選單加上選項。

## 製作

© 大佬群CSL製作
