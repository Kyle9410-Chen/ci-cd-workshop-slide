---
marp: true
theme: workshop
paginate: true
title: CI/CD Workshop
footer: CI/CD Workshop
---

<!-- _class: cover -->
<!-- _paginate: false -->
<!-- _footer: '' -->

# CI/CD Workshop

NYCU **SDC**

<!--
開課前停留於此。今天會用 GitHub Actions 把 Lint、Test、建置 Docker Image 自動化，最後用 Reverse Proxy 把前後端部署上線。
-->

---

<!-- header: 開場 -->

## 本次課程的學習目標

<div class="goals">
  <div><b>01</b><h3>理解 CI/CD</h3><p>說出 CI 與 CD 各自自動化了開發流程中的哪些步驟</p></div>
  <div><b>02</b><h3>撰寫 Workflow</h3><p>用 GitHub Actions 自動執行 Lint、Test 與建置 Image</p></div>
  <div><b>03</b><h3>部署服務</h3><p>用 Docker 與 Reverse Proxy 把前後端部署上線</p></div>
</div>

<!--
三個可以觀察的能力：看懂概念、寫得出 Workflow、能把服務部署起來。
完整指令都在講義裡，不用急著抄投影片。
-->

---

## 今天的課程內容

<ol class="agenda">
  <li>CI/CD 是什麼</li>
  <li>Preparation</li>
  <li>CI：Lint 與 Test</li>
  <li>CD：Build Docker Image</li>
  <li>Reverse Proxy</li>
  <li>GitHub Actions</li>
  <li>Workflow：Event、Job、Step</li>
  <li>Hands on：CI</li>
  <li>Hands on：CD</li>
  <li>部署到 VM</li>
  <li>回顧</li>
  <li>問答</li>
</ol>

<!--
先講概念（CI、CD、Reverse Proxy），再認識 GitHub Actions 的語法，最後動手把 Frontend 與 Backend 的 CI/CD 寫出來並部署。
-->

---

<!-- header: CI/CD -->

## CI/CD 代表兩件事

<div class="cards" style="margin-top:24px">
  <div class="card">
    <span class="label">CI</span>
    <h3>Continuous Integration</h3>
    <p>持續整合：每次修改都自動檢查，確保合在一起的程式碼沒有問題</p>
  </div>
  <div class="card">
    <span class="label">CD</span>
    <h3>Continuous Delivery／Deployment</h3>
    <p>持續交付／持續部署：把建置、部署與驗證自動化，讓程式碼隨時可以上線</p>
  </div>
</div>

<p class="note">目標：程式碼從開發到上線的過程<strong>自動化</strong>且<strong>可靠</strong></p>

<!--
CI/CD 分別代表 Continuous Integration 與 Continuous Delivery / Continuous Deployment。
兩者合起來的目的是：確保程式碼從開發到上線的過程中自動化且可靠。
-->

---

## 為什麼需要 CI/CD？

<div class="benefits">

* <div class="benefit">
    <div class="ill mini risk">
      <ol class="tl sm"><li><b>修改</b></li><li class="bad"><b>CI</b></li><li class="ghost"><b>main</b></li></ol>
      <span class="say">✗ 合併前擋下</span>
    </div>
    <b>01</b><h3>降低風險</h3><p>問題在合併前就被發現，而不是上線後</p>
  </div>
* <div class="benefit">
    <div class="ill mini quality">
      <ol class="tl sm"><li><b>修改</b></li><li class="good"><b>Lint ✓</b></li><li class="good"><b>Test ✓</b></li></ol>
      <span class="say">每次都一樣</span>
    </div>
    <b>02</b><h3>提升品質</h3><p>每次修改都經過同樣的檢查與測試</p>
  </div>
* <div class="benefit">
    <div class="ill mini repeat">
      <ol class="tl sm"><li class="hl"><b>檢查</b></li><li class="hl"><b>打包</b></li><li class="hl"><b>部署</b></li></ol>
      <span class="say"><span class="gear">⚙</span> 交給機器執行</span>
    </div>
    <b>03</b><h3>減少重複工作</h3><p>檢查、打包、部署交給機器執行</p>
  </div>

</div>

<div class="legend">
  <span><i class="sw ok"></i>通過檢查</span>
  <span><i class="sw bad"></i>被擋下</span>
  <span><i class="sw auto"></i>自動執行</span>
  <span class="muted">常見工具很多，今天的內容圍繞在 <strong>GitHub Actions</strong></span>
</div>

<!--
三個好處，每按一次出現一個，圖會接著播放動畫。
01 降低風險：有問題的修改在 CI 就被擋下，不會進到 main，而不是上線後才發現。
02 提升品質：不管是誰、第幾次修改，都跑同樣的 Lint 與 Test，品質標準不會因人而異。
03 減少重複工作：檢查、打包、部署不必每次手動執行，交給 CI/CD 依序完成。
圖例：綠色代表通過檢查，紅色代表被擋下，藍色代表自動執行。
常見的 CI/CD 工具很多（GitLab CI、Jenkins 等），今天主要使用 GitHub Actions。
-->

---

<!-- header: Preparation -->

## 先 Fork 兩個專案

![w:1300](teaching-material/images/01-fork-repos.png)

<!--
請學員先 Fork Backend 與 Frontend 兩個專案到自己的帳號，之後的 Workflow 都寫在自己 Fork 的 Repo 裡。
-->

---

## 今天會用到的專案與服務

<div class="cards" style="margin-top:24px">
  <div class="card">
    <span class="label">Backend</span>
    <h3>FastAPI</h3>
    <p>用 uv 管理套件，指令大多以 <code>uv</code> 開頭</p>
  </div>
  <div class="card">
    <span class="label">Frontend</span>
    <h3>React + TypeScript</h3>
    <p>用 npm 管理套件，指令大多以 <code>npm</code> 開頭</p>
  </div>
  <div class="card">
    <span class="label">Registry</span>
    <h3>Docker Hub</h3>
    <p>註冊帳號，或使用之前註冊過的帳號</p>
  </div>
</div>

<!--
Backend 是 Python 的 FastAPI，用 uv 做套件管理，所以之後會很常看到 uv 開頭的指令。
Frontend 是 React + TypeScript，用 npm 管理套件。
Docker Hub 用來存放 CD 建置出來的 Image，請先註冊好帳號。
-->

---

<!-- header: CI · Continuous Integration -->

## CI 解決什麼問題？

<div class="cols" style="margin-top:24px">
<div>

### 多人開發時

- 各自寫的程式碼合在一起後才發現出錯
- 出錯時很難找到原因

</div>
<div>

### CI 的作法

- 每次修改都在統一環境自動檢查
- 問題在合併前就被發現

</div>
</div>

<!--
CI 最主要的功用是解決多人開發時，各自寫的程式碼合在一起後才發現出錯、而且很難找到原因的狀況。
-->

---

## 一般的開發流程

<div class="tl-grid">
<ol class="tl more">
  <li><b>需求分析與設計</b></li>
  <li><b>本機開發</b></li>
  <li class="ci"><b>本機測試</b><em class="by">CI</em></li>
</ol>
<ol class="tl cont more" style="--base:1.4s">
  <li class="cd"><b>建置打包</b><em class="by">CD</em></li>
  <li class="cd"><b>部署到測試環境</b><em class="by">CD</em></li>
  <li class="ci"><b>QA 測試</b><em class="by">CI</em></li>
</ol>
<ol class="tl cont" style="--base:2.6s">
  <li class="ci"><b>發現 bug？</b><small>是 → 回到本機開發</small><em class="by">CI</em></li>
  <li class="cd"><b>部署上線</b><em class="by">CD</em></li>
  <li><b>監控與維護</b></li>
</ol>
<div class="mark-step">

* <div class="legend"><span><span class="sw auto"></span>CI：自動整合與驗證</span><span><span class="sw ok"></span>CD：自動建置與部署</span></div>

</div>
</div>

<!--
從一般開發流程來看：需求分析、設計之後在本機開發，接著在本機測試；再來打包、部署到測試環境，交給 QA 測試。
QA 發現 bug 就要回到本機開發，再走一次上面的流程；沒有問題才部署上線並監控。
（按下一步）標出來的步驟，開發者都不是在處理程式邏輯，而是在整合程式碼、驗證 Bug、實際部署：
藍色的測試與驗證可以交給 CI 自動化，綠色的建置與部署可以交給 CD 自動化，減少人力消耗，讓專案進行更穩定。
-->

---

## Lint：靜態檢查程式碼

<p>不執行程式，透過分析程式碼的寫法找出潛在問題</p>

<div class="issues lint">
  <div class="issue" style="--k:0">
    <div class="scene">
      <div class="lint-code"><span class="kw">let</span> <u>user_name</u> = <span class="str">'Kyle'</span></div>
      <span class="lint-msg warn">⚠ 變數命名應使用 camelCase</span>
    </div>
    <span class="label">01</span>
    <h3>Style</h3>
    <p>排版與命名是否符合規範</p>
  </div>
  <div class="issue" style="--k:1">
    <div class="scene">
      <div class="lint-code"><span class="kw">import</span> <u>os</u><br><span class="fn">print</span>(<u>totl</u>)</div>
      <span class="lint-msg">✗ os 未使用 · totl 未定義</span>
    </div>
    <span class="label">02</span>
    <h3>潛在 bug</h3>
    <p>未使用的變數、未定義的名稱</p>
  </div>
  <div class="issue" style="--k:2">
    <div class="scene">
      <div class="lint-code"><span class="kw">if</span> (count <u>==</u> <span class="str">'0'</span>) {<br>  reset()<br>}</div>
      <span class="lint-msg warn">⚠ 應使用 === 避免型別轉換</span>
    </div>
    <span class="label">03</span>
    <h3>不好的寫法</h3>
    <p>容易出錯或難以維護的寫法</p>
  </div>
</div>

<!--
Lint 是一種靜態檢查工具，各種語言都有自己的 Linter，透過分析程式碼的撰寫方式找出潛在問題，通常包括 Style、潛在 bug、不好的寫法。三個例子依序出現：
Style：user_name 不符合 JavaScript 的 camelCase 命名規範。
潛在 bug：import 了 os 卻沒用到，print 的 totl 是打錯字、根本沒有定義，不執行程式也能發現。
不好的寫法：== 會先做型別轉換，'0' == 0 會成立，容易出錯，Linter 建議改用 ===。
-->

---

## 本機先跑 Lint，CI 再檢查一次

<div class="cols">
<div>

<div class="file">Backend</div>

```bash
uv run ruff check .
```

</div>
<div>

<div class="file">Frontend</div>

```bash
npm run lint
```

</div>
</div>

<p class="note">本機檢查可能被略過，CI 會在<strong>統一的環境</strong>重新檢查，確保合併進主分支的程式碼都符合規範</p>

<!--
開發時建議先在本機執行 Lint，但本機檢查可能被略過，所以 CI 還是會在統一的環境中重新檢查一次。
-->

---

## Test：實際執行程式

<div class="cards" style="margin-top:16px">
<div class="card">
  <span class="label">Lint</span>
  <h3>不執行程式</h3>
  <p>檢查寫法與格式</p>
</div>
<div class="card focus">
  <span class="label">Test</span>
  <h3>實際執行程式</h3>
  <p>能抓到「語法正確但邏輯錯誤」的問題</p>
</div>
</div>

<p class="muted">各語言都有測試框架：JavaScript 的 Jest、Vitest，Python 的 pytest</p>

<!--
測試是透過撰寫程式碼來驗證程式行為是否符合預期。與 Lint 不同，測試需要實際執行程式，因此能檢查出語法正確但邏輯錯誤的問題。
-->

---

## 常見的測試類型

<div class="pyramid">

* <div class="layer"><b>Unit Test</b></div><div class="desc"><strong>單一函式或模組</strong><small>速度快、數量最多</small></div>
* <div class="layer"><b>Integration Test</b></div><div class="desc"><strong>多個模組或外部服務搭配運作</strong><small>資料庫、API，確認元件之間的串接</small></div>
* <div class="layer"><b>E2E Test</b></div><div class="desc"><strong>模擬使用者操作整個系統</strong><small>最接近真實情境，但執行較慢</small></div>

</div>

<p class="pyramid-note">越往上，測試範圍越大、越接近真實情境，但執行越慢、數量越少</p>

<!--
由下往上一層一層疊：Unit Test 是地基，數量最多、速度最快；往上是 Integration Test 與 End-to-End Test，測試範圍越大、越接近真實情境，但執行也越慢，所以數量越少。
-->

---

## 為什麼 CI 還要再跑一次測試？

<div class="cols">
<div>

- 本機測試可能被略過
- 環境差異造成結果不同
  - 作業系統
  - 套件版本
  - 環境變數

</div>
<div>

<div class="file">Backend</div>

```bash
uv run pytest
```

<div class="file">Frontend</div>

```bash
npm test -- --run
```

</div>
</div>

<!--
開發時建議在本機先跑測試，確認功能如同預期。但和 Lint 一樣，本機測試可能被略過，或因環境差異而結果不同。
push 到遠端後，CI 會在統一的環境中重新執行所有測試。
-->

---

<!-- header: CD · Continuous Delivery -->

## Continuous Delivery 與 Continuous Deployment

<div class="tl-row" style="margin-top:56px">
  <span class="tl-cap">兩者相同</span>
  <ol class="tl more">
    <li><b>建置</b></li>
    <li><b>部署到測試環境</b></li>
    <li><b>驗證</b></li>
  </ol>
</div>

<!--
CD 把建置、部署到各環境與驗證的整個過程自動化，讓程式碼隨時處於可以部署的狀態。
前面三步 Delivery 與 Deployment 完全相同。
-->

---

## Continuous Delivery 與 Continuous Deployment

<div class="tl-row" style="margin-top:56px">
  <span class="tl-cap">Continuous Delivery</span>
  <ol class="tl">
    <li><b>驗證</b></li>
    <li class="warn"><b>人工決定上線</b></li>
    <li><b>正式環境</b></li>
  </ol>
</div>

<!--
Continuous Delivery 在驗證之後保留人工決定上線的時機。
-->

---

## Continuous Delivery 與 Continuous Deployment

<div class="tl-row" style="margin-top:56px">
  <span class="tl-cap">Continuous Deployment</span>
  <ol class="tl">
    <li><b>驗證</b></li>
    <li class="good"><b>直接自動上線</b></li>
    <li><b>正式環境</b></li>
  </ol>
</div>

<!--
Continuous Deployment 通過所有檢查後直接自動上線。兩者的差異只在「部署到正式環境」這一步是否也自動化。
-->

---

## 「隨時可以部署」需要一個產出物

<div class="cols wide-left" style="margin-top:24px">
<div>

- 已經打包好、可以直接拿去執行
- 現代開發流程中最常見的形式：**Docker Image**

</div>
<div class="card bad">
  <span class="label">如果在自己的電腦建置再上傳</span>
  <p>又回到依賴人力、環境不一致、步驟複雜的問題</p>
</div>
</div>

<!--
在 Continuous Delivery 中，隨時可以部署的前提是有一個已經打包好、可以直接執行的產出物，最常見的就是 Docker Image。
如果由開發者在自己的電腦上建置再上傳，又會回到依賴人力、環境不一致、步驟複雜的問題。
-->

---

## 把建置交給 CI/CD

<div class="goals" style="margin-top:48px">
  <div><b>01</b><h3>通過檢查才打包</h3><p>建置接在 Lint 與 Test 之後執行</p></div>
  <div><b>02</b><h3>建置環境一致</h3><p>每次都在相同的 Runner 上、用相同的步驟建置</p></div>
  <div><b>03</b><h3>可追溯</h3><p>每個 Image 都對應到一次 commit，出問題時清楚知道是哪個版本</p></div>
</div>

---

## 建置 Docker Image 的流程

<ol class="tl" style="margin-top:80px">
  <li class="good"><b>Lint 與 Test</b><small>通過檢查</small></li>
  <li><b>建置 Image</b><small>依照 Dockerfile，加上 latest 與 commit SHA Tag</small></li>
  <li class="hl"><b>推送到 Registry</b><small>Docker Hub</small></li>
</ol>

<!--
Lint 與 Test 通過後，依照 Dockerfile 建置 Image，加上 latest 與 commit SHA 兩個 Tag，最後推送到 Docker Hub。
Hands on 的 CD 部分就是把這幾步寫成 Workflow。
-->

---

<!-- header: Reverse Proxy -->

## Reverse Proxy：位在使用者與服務之間

<ol class="tl" style="margin-top:56px">
  <li><b>使用者</b><small>發出請求</small></li>
  <li class="hl"><b>Reverse Proxy</b><small>依照規則轉送</small></li>
  <li><b>對應的服務</b><small>處理後回應，經 Proxy 傳回</small></li>
</ol>

<p style="margin-top:48px">使用者只知道自己連到<strong>一個網址</strong>，不知道背後有幾個服務、各自在哪裡</p>
<p class="muted small">常見工具：Nginx、Caddy、Traefik</p>

<!--
使用者的請求先送到 Reverse Proxy，再依照規則轉送給後方對應的服務，最後把回應傳回使用者。
-->

---

## Nginx 設定範例

<div class="walk">
<div>

<div class="file">default.conf</div>

```nginx {2|4-6|8-10}
server {
    listen 80;

    location /api/ {
        proxy_pass http://backend:8000/;
    }

    location / {
        proxy_pass http://frontend:80;
    }
}
```

</div>
<div class="walk-notes">

* **listen 80**<span class="d">Nginx 在 80 port 接收使用者的請求</span>
* **location /api/**<span class="d">以 <code>/api/</code> 開頭的請求轉送給 Backend。<code>backend</code> 是服務名稱，在 Docker Compose 中可以直接用服務名稱互相連線</span>
* **location /**<span class="d">其他所有請求轉送給 Frontend</span>

</div>
</div>

---

## 如果讓使用者直接連線到各個服務

<div class="issues">
  <div class="issue" style="--k:0">
    <div class="scene">
      <div class="bx">瀏覽器<small>example.com</small></div>
      <div class="vl bad"></div>
      <div class="bx">Backend API<small>api.example.com</small></div>
      <span class="mark">✗ 被擋下</span>
    </div>
    <span class="label">CORS</span>
    <h3>不同來源</h3>
    <p>前端在 <code>example.com</code>、後端在 <code>api.example.com</code> 或不同 port，需要額外設定 CORS</p>
  </div>
  <div class="issue" style="--k:1">
    <div class="scene">
      <div class="bx">網際網路</div>
      <div class="pair">
        <div class="col"><div class="vl bad"></div><div class="bx">Frontend<small>:80</small></div></div>
        <div class="col"><div class="vl bad"></div><div class="bx">Backend<small>:8000</small></div></div>
      </div>
      <span class="mark">✗ 兩個入口</span>
    </div>
    <span class="label">入口</span>
    <h3>對外暴露多個入口</h3>
    <p>每個服務都要開放對外連線，管理與安全性都較麻煩</p>
  </div>
  <div class="issue" style="--k:2">
    <div class="scene">
      <div class="bx">Frontend<small>API = <s>10.0.0.5</s></small></div>
      <div class="vl bad"></div>
      <div class="bx">重新建置</div>
      <span class="mark">✗ 位址變就重建</span>
    </div>
    <span class="label">位址</span>
    <h3>前端要知道後端位址</h3>
    <p>後端位址一變動，前端就得重新建置</p>
  </div>
</div>

<!--
今天的專案有 Frontend 與 Backend 兩個服務，如果讓使用者分別直接連線，就會遇到這三個問題，三張圖依序播放：
CORS：網頁在 example.com，卻要呼叫 api.example.com，瀏覽器視為不同來源，沒有設定 CORS 就會擋下。
入口：Frontend 與 Backend 都要對外開 port，入口變多，管理與安全性都較麻煩。
位址：前端在建置時就寫入後端位址，後端位址一變，前端就得重新建置。
下一頁看 Reverse Proxy 如何用同一個入口解決這些問題。
-->
---

## 同一個入口，依照路徑分流

<div class="tl-row" style="margin-top:56px">
  <span class="tl-cap"><code>example.com/</code></span>
  <ol class="tl">
    <li><b>瀏覽器</b></li>
    <li class="hl"><b>Reverse Proxy</b><small>路徑是 /</small></li>
    <li><b>Frontend</b></li>
  </ol>
</div>

<!--
一般頁面的請求，Reverse Proxy 看到路徑是 /，轉送給 Frontend。
-->

---

## 同一個入口，依照路徑分流

<div class="tl-row" style="margin-top:56px">
  <span class="tl-cap"><code>example.com/api/todos</code></span>
  <ol class="tl">
    <li><b>瀏覽器</b></li>
    <li class="hl"><b>Reverse Proxy</b><small>路徑以 /api 開頭</small></li>
    <li><b>Backend</b></li>
  </ol>
</div>

<p class="note" style="margin-top:56px">對瀏覽器來說，前端與 API 都在<strong>同一個網域</strong>下，CORS 的問題就解決了</p>

<!--
API 請求走的是同一個網域，只是路徑以 /api 開頭，Reverse Proxy 轉送給 Backend。
-->

---

## Reverse Proxy 的其他常見用途

<div class="cards grid-2" style="margin-top:16px">
  <div class="card"><h3>HTTPS 處理</h3><p>統一設定 SSL 憑證，後方服務只需處理 HTTP</p></div>
  <div class="card"><h3>負載平衡</h3><p>將請求分散到多個相同的服務，提升承載量與可用性</p></div>
  <div class="card"><h3>隱藏內部架構</h3><p>後端服務不必直接對外開放，只有 Reverse Proxy 對外</p></div>
  <div class="card"><h3>快取與壓縮</h3><p>快取靜態檔案、壓縮回應內容，加快載入速度</p></div>
</div>

---

<!-- header: GitHub Actions -->

## GitHub Actions

<ol class="tl more" style="margin-top:56px">
  <li><b>事件發生</b><small>push、開 PR</small></li>
  <li class="hl"><b>讀取 Workflow</b><small>Repo 中的 YAML</small></li>
  <li><b>Lint</b></li>
</ol>

<p style="margin-top:48px">GitHub 內建的自動化服務：在 Repo 中寫好 YAML 設定檔，特定事件發生時就會自動執行指定的工作</p>

---

## GitHub Actions

<ol class="tl cont" style="margin-top:56px">
  <li><b>Test</b></li>
  <li><b>Build</b></li>
  <li><b>Deploy</b></li>
</ol>

<p style="margin-top:48px">Lint、測試、建置與部署，都可以寫在 Workflow 裡自動執行</p>

---

## Workflow 範例

<div class="walk">
<div>

<div class="file">.github/workflows/main.yaml</div>

```yaml {1|3-6|8-10|11-18}
name: CI

on:
    push:
        branches: [main]
    pull_request:

jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v7
            - uses: actions/setup-node@v7
              with:
                  node-version: 20
            - run: npm ci
            - run: npm run lint
            - run: npm test
```

</div>
<div class="walk-notes">

<p>這一份 YAML 檔案就是一個 <strong>Workflow</strong></p>

* **name**<span class="d">Workflow 的名稱，會顯示在 Actions 頁面</span>
* **on · Event**<span class="d">什麼時候執行：push 到 <code>main</code> 或開 Pull Request 時</span>
* **jobs · Job**<span class="d">要執行哪些工作，這裡只有一個 <code>test</code>，跑在 Ubuntu 的 Runner 上</span>
* **steps · Step**<span class="d">工作的步驟：下載程式碼、安裝 Node.js 與套件，再執行 Lint 與測試</span>

</div>
</div>

<!--
這是一個最小的 CI Workflow：push 到 main 或開 PR 時，安裝 Node.js、安裝套件、執行 Lint 與測試。
接下來依序拆解 Event、Job、Step 三個部分。
-->

---

## Workflow 的組成

<div class="box" style="margin-top:16px">
  <span class="tag">Workflow · .github/workflows/main.yaml</span>
  <div class="box surface"><span class="tag">on · Event</span>push、pull_request</div>
  <div class="box"><span class="tag">jobs.test · Job · steps 1–3</span>
    <ol class="tl sm more">
      <li><b>checkout</b></li>
      <li><b>setup-node</b></li>
      <li><b>npm ci</b></li>
    </ol>
  </div>
</div>

<!--
Event 決定何時觸發，一個 Workflow 可以有多個 Job，每個 Job 由多個依序執行的 Step 組成。
前三個 Step 是準備環境：下載程式碼、安裝 Node.js、安裝套件。
-->

---

## Workflow 的組成

<div class="box" style="margin-top:16px">
  <span class="tag">Workflow · .github/workflows/main.yaml</span>
  <div class="box surface"><span class="tag">on · Event</span>push、pull_request</div>
  <div class="box"><span class="tag">jobs.test · Job · steps 4–5</span>
    <ol class="tl sm cont">
      <li><b>lint</b></li>
      <li><b>test</b></li>
    </ol>
  </div>
</div>

<!--
準備好之後才執行 lint 與 test。任一 Step 失敗，整個 Job 就失敗。
-->

---

## Event：觸發 Workflow 的條件

<div class="cols">
<div>

```yaml
on:
    push:
        branches: [main]
    pull_request:
```

</div>
<div>

| Event | 觸發時機 |
|---|---|
| `push` | push 到指定 branch；不指定則任何 push 都會觸發 |
| `pull_request` | PR 開啟、有新 commit、重新開啟 |
| `workflow_dispatch` | 在 GitHub 介面上手動觸發 |
| `schedule` | 依照排程定時觸發 |

</div>
</div>

<p class="muted small">所有 Event：docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#on</p>

---

## pull_request 的進一步條件

<div class="cards" style="margin-top:24px">
  <div class="card">
    <span class="label">branches</span>
    <h3>目標分支</h3>
    <p>PR 要合併進去的分支，例如只有合併進 <code>main</code> 的 PR 才觸發</p>
  </div>
  <div class="card">
    <span class="label">types</span>
    <h3>活動類型</h3>
    <p>例如 <code>opened</code>、<code>synchronize</code>、<code>closed</code></p>
  </div>
  <div class="card">
    <span class="label">paths</span>
    <h3>變更的檔案</h3>
    <p>只有特定檔案或資料夾有變更時才觸發</p>
  </div>
</div>

---

## Job：Workflow 中的一組任務

<div class="cols">
<div>

```yaml
jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v7
            - uses: actions/setup-node@v7
              with:
                  node-version: 20
            - run: npm ci
            - run: npm run lint
            - run: npm test
```

</div>
<div>

- `test`：Job 的 ID
  - 可以自行命名，同一個 Workflow 中不能重複
- `runs-on`：執行的 Runner 環境
  - `ubuntu-latest`、`windows-latest`、`macos-latest`
- `steps`：依序執行的步驟
  - 任一 Step 失敗，整個 Job 就失敗

</div>
</div>

---

## Step：uses 與 with

<div class="cols">
<div>

<div class="file">uses：使用現成的 Action</div>

```yaml
steps:
    - uses: actions/checkout@v7
```

<p class="small muted"><code>actions/checkout</code> 把 Repo 的程式碼下載到 Runner 上，類似本機的 <code>git clone</code></p>

</div>
<div>

<div class="file">with：傳入參數給 Action</div>

```yaml
steps:
    - uses: actions/setup-node@v7
      with:
          node-version: 20
```

<p class="small muted">每個 Action 接受哪些參數，請參考該 Action 的說明文件</p>

</div>
</div>

<!--
Step 是 Job 中依序執行的每個動作，以 - 開頭。主要有兩種用法：使用現成的 Action，或直接執行指令。
-->

---

## Step：run 與 name

<div class="cols">
<div>

<div class="file">run：直接在 Runner 上執行 Shell</div>

```yaml
steps:
    - run: npm ci
```

</div>
<div>

<div class="file">name：幫 Step 命名</div>

```yaml
steps:
    - name: 安裝相依套件
      run: npm ci
    - name: 執行測試
      run: npm test
```

<p class="small muted">名稱會顯示在執行紀錄中，方便查看哪個步驟成功或失敗</p>

</div>
</div>

<p class="muted small">其他常見參數：<code>env</code> 設定環境變數、<code>if</code> 符合條件才執行</p>

---

## Marketplace：別人寫好的 Action

<div class="cols wide-left" style="margin-top:24px">
<div>

- `actions/checkout`、`actions/setup-node` 都是現成的 Action
- 開源社群還有很多別人寫好的 Action，可以直接 `uses`

</div>
<div class="card focus">
  <span class="label">GitHub Marketplace</span>
  <p>github.com/marketplace?type=actions</p>
</div>
</div>

---

<!-- header: Hands on · CI -->

## Workflow 的檔案位置

<div class="cols wide-left" style="margin-top:24px">
<div>

```text
ci-cd-workshop-frontend/
└── .github/
    └── workflows/
        └── main.yaml
```

</div>
<div>

- GitHub Actions 固定讀取 `.github/workflows` 內的檔案
- 先在這個資料夾內建立 `main.yaml`
- Frontend 與 Backend 兩個 Repo 都要各自建立

</div>
</div>

---

## Frontend CI：兩個 Job 同時執行

<div class="cols" style="margin-top:24px">
<div class="box">
  <span class="tag">lint · Lint</span>
  <div class="stack">
    <div class="node">Oxlint<small>潛在 bug 與不好的寫法</small></div>
    <div class="node">Prettier<small>排版是否符合規範</small></div>
    <div class="node">Type check<small>TypeScript 型別是否正確</small></div>
  </div>
</div>
<div class="box">
  <span class="tag">test · Test</span>
  <div class="stack">
    <div class="node">Vitest<small>實際執行單元測試</small></div>
  </div>
</div>
</div>

<!--
兩個 Job 會同時執行，縮短整體等待時間。
-->

---

## Frontend CI

<div class="walk">
<div>

<div class="file">.github/workflows/main.yaml</div>

```yaml {1|3-4|6-7|9-13|14|16-19|21|23-24|26-27|29-30|32-43|45-46}
name: CI

on:
    push:

permissions:
    contents: read

jobs:
    lint:
        name: Lint
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v7

            - uses: actions/setup-node@v7
              with:
                  node-version-file: .nvmrc
                  cache: npm

            - run: npm ci

            - name: Oxlint
              run: npm run lint

            - name: Prettier
              run: npm run format:check

            - name: Type check
              run: npm run typecheck

    test:
        name: Test
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v7

            - uses: actions/setup-node@v7
              with:
                  node-version-file: .nvmrc
                  cache: npm

            - run: npm ci

            - name: Vitest
              run: npm test -- --run
```

</div>
<div class="walk-notes">

* **name**<span class="d">Workflow 的名稱，會顯示在 Actions 頁面</span>
* **on · push**<span class="d">不指定 branch，任何 push 都會觸發</span>
* **permissions**<span class="d">這個 Workflow 只需要讀取程式碼</span>
* **jobs · lint**<span class="d"><code>lint</code> 是 Job 的 id，<code>name</code> 是顯示名稱，跑在 Ubuntu 的 Runner 上</span>
* **actions/checkout**<span class="d">把 Repo 的程式碼下載到 Runner 上</span>
* **actions/setup-node**<span class="d">安裝 Node.js。<code>.nvmrc</code> 讓 CI 與本機版本相同，<code>cache: npm</code> 快取套件</span>
* **npm ci**<span class="d">依照 <code>package-lock.json</code> 安裝，確保每次版本完全一致</span>
* **Oxlint**<span class="d">檢查潛在 bug 與不好的寫法</span>
* **Prettier**<span class="d">檢查排版是否符合規範</span>
* **Type check**<span class="d">檢查 TypeScript 型別是否正確</span>
* **jobs · test**<span class="d">與 <code>lint</code> 同時執行。每個 Job 都在全新的 Runner 上，所以前三個 Step 要再做一次</span>
* **Vitest**<span class="d">實際執行單元測試</span>

</div>
</div>

<!--
整份檔案由上往下看：先是 Workflow 名稱、觸發條件與權限，接著 jobs 底下有 lint 與 test 兩個 Job。
lint 先完成準備步驟（checkout、setup-node、npm ci），再執行 Oxlint、Prettier 與 Type check。
test 與 lint 同時執行，準備步驟相同，最後用 Vitest 執行測試。
-->

---

## 為什麼每個 Job 都要重新準備？

<p>每個 Job 都在一台<strong>全新的 Runner</strong> 上執行，彼此不共用環境</p>

<ol class="tl" style="margin-top:32px">
  <li><b>actions/checkout</b><small>下載 Repo 的程式碼</small></li>
  <li><b>actions/setup-node</b><small>安裝 Node.js</small></li>
  <li><b>npm ci</b><small>依 package-lock.json 安裝</small></li>
</ol>

<div class="cols" style="margin-top:16px">
<div>

- `node-version-file: .nvmrc`
  - CI 與本機使用相同的 Node.js 版本

</div>
<div>

- `cache: npm`
  - `package-lock.json` 沒變動時直接使用快取

</div>
</div>

<!--
npm ci 會依照 package-lock.json 安裝，確保每次安裝的版本完全一致。
-->

---

## Backend CI：結構相同，換成 Python 工具

<div class="cols" style="margin-top:24px">
<div class="box">
  <span class="tag">lint · Lint</span>
  <div class="stack">
    <div class="node">Ruff check<small>未使用的 import、未定義的變數</small></div>
    <div class="node">Ruff format<small>加上 --check 只檢查、不修改檔案</small></div>
  </div>
</div>
<div class="box">
  <span class="tag">test · Test</span>
  <div class="stack">
    <div class="node">Pytest<small>執行單元測試</small></div>
  </div>
</div>
</div>

---

## Backend CI

<div class="walk">
<div>

<div class="file">.github/workflows/main.yaml</div>

```yaml {1-7|9-14|16-18|20|22-23|25-26|28-38|40-41}
name: CI

on:
    push:

permissions:
    contents: read

jobs:
    lint:
        name: Lint
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v7

            - uses: astral-sh/setup-uv@v7
              with:
                  enable-cache: true

            - run: uv sync --locked

            - name: Ruff check
              run: uv run ruff check .

            - name: Ruff format
              run: uv run ruff format --check .

    test:
        name: Test
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v7

            - uses: astral-sh/setup-uv@v7
              with:
                  enable-cache: true

            - run: uv sync --locked

            - name: Pytest
              run: uv run pytest
```

</div>
<div class="walk-notes">

* **name · on · permissions**<span class="d">與 Frontend 相同</span>
* **jobs · lint**<span class="d">一樣先用 <code>actions/checkout</code> 下載程式碼</span>
* **astral-sh/setup-uv**<span class="d">安裝 uv。<code>enable-cache</code> 快取下載的套件，並依 <code>.python-version</code> 或 <code>pyproject.toml</code> 自動下載對應的 Python</span>
* **uv sync --locked**<span class="d">依照 <code>uv.lock</code> 安裝套件並建立虛擬環境</span>
* **Ruff check**<span class="d">檢查未使用的 import、未定義的變數等問題</span>
* **Ruff format**<span class="d">加上 <code>--check</code> 只檢查排版、不修改檔案</span>
* **jobs · test**<span class="d">與 <code>lint</code> 同時執行，準備步驟相同</span>
* **Pytest**<span class="d">執行單元測試</span>

</div>
</div>

<!--
Backend 的結構與 Frontend 相同，只是把 Node.js 的工具換成 Python 的 uv、Ruff 與 pytest。
-->

---

## push 到 main

```bash
git add .
git commit -m "ci: add linter and testing"
git push origin main
```

<p class="muted">Frontend 與 Backend 兩個 Repo 都要 push</p>

---

## 在 Actions 查看執行狀況

![h:540](teaching-material/images/02-ci-actions-run.png)

<!--
push 後可以在 GitHub Repo 的 Actions 分頁看到執行狀況，Lint 與 Test 兩個 Job 同時執行。
-->

---

<!-- header: Hands on · CD -->

## CD 的事前準備

<ol class="tl" style="margin-top:72px">
  <li><b>Docker Hub</b><small>建立 Access Token</small></li>
  <li><b>GitHub Repo Settings</b><small>Secrets and variables</small></li>
  <li class="hl"><b>Workflow 中使用</b><small>登入並推送 Image</small></li>
</ol>

<p class="muted" style="margin-top:56px">Workflow 需要 Docker Hub 帳號的權限，才能把 Image 推送上去</p>

---

## Docker Hub：建立 Access Token

![h:560](teaching-material/images/03-dockerhub-access-token.png)

<!--
到 Docker Hub 的 Personal access tokens 建立新的 Token，權限選 Repo Read & Write。建立完後請複製 Token，離開頁面後就看不到了。
-->

---

## GitHub：進入 Repository Settings

![w:1300](teaching-material/images/04-github-repo-settings.png)

---

## Secrets and variables → Actions

<div class="cols wide-left">
<div>

![w:760](teaching-material/images/05-github-actions-secrets.png)

</div>
<div>

| 種類 | 名稱 | 內容 |
|---|---|---|
| Secrets | `DOCKERHUB_TOKEN` | Token |
| Variables | `DOCKERHUB_USERNAME` | Username |

</div>
</div>

---

## Secrets 與 Variables 的差別

<div class="cards" style="margin-top:24px">
<div class="card">
  <span class="label">Secrets · secrets.DOCKERHUB_TOKEN</span>
  <h3>機密資訊</h3>
  <p>Token、密碼。儲存後無法再查看內容，執行紀錄中會自動遮蔽成 <code>***</code></p>
</div>
<div class="card">
  <span class="label">Variables · vars.DOCKERHUB_USERNAME</span>
  <h3>非機密的設定值</h3>
  <p>使用者名稱、環境名稱。可以隨時查看與修改</p>
</div>
</div>

---

## 在 CI 之後加上 publish Job

<ol class="tl" style="margin-top:72px">
  <li class="good"><b>lint ∥ test</b><small>同時執行，都要成功</small></li>
  <li class="hl"><b>publish</b><small>建置並推送 Image</small></li>
  <li><b>Docker Hub</b></li>
</ol>

<p class="muted" style="margin-top:56px">在原本 CI 的 Workflow 中，<code>jobs</code> 底下新增一個 <code>publish</code> Job</p>

---

## Frontend publish

<div class="walk">
<div>

<div class="file">main.yaml · 加在 jobs 底下</div>

```yaml {1-2|3|5-6|8|10-13|15|17-20|21-22|23-25|26-27}
publish:
    name: Publish image
    needs: [lint, test]
    runs-on: ubuntu-latest
    env:
        IMAGE: ${{ vars.DOCKERHUB_USERNAME }}/ci-cd-workshop-frontend
    steps:
        - uses: actions/checkout@v7

        - uses: docker/login-action@v4
          with:
              username: ${{ vars.DOCKERHUB_USERNAME }}
              password: ${{ secrets.DOCKERHUB_TOKEN }}

        - uses: docker/setup-buildx-action@v4

        - uses: docker/build-push-action@v7
          with:
              context: .
              push: true
              build-args: |
                  VITE_API_BASE_URL=/api
              tags: |
                  ${{ env.IMAGE }}:latest
                  ${{ env.IMAGE }}:${{ github.sha }}
              cache-from: type=gha
              cache-to: type=gha,mode=max
```

</div>
<div class="walk-notes">

* **publish**<span class="d">在原本 CI 的 <code>jobs</code> 底下新增的 Job</span>
* **needs**<span class="d"><code>lint</code> 與 <code>test</code> 都成功後才執行，確保上傳的都是通過檢查的程式碼</span>
* **env · IMAGE**<span class="d">Job 層級的環境變數，格式為 <code>使用者名稱/映像檔名稱</code>，所有 Step 都能用 <code>${{ env.IMAGE }}</code></span>
* **actions/checkout**<span class="d">建置時需要 Dockerfile 與原始碼</span>
* **docker/login-action**<span class="d">用 Variables 的 Username 與 Secrets 的 Token 登入，才有權限上傳</span>
* **docker/setup-buildx-action**<span class="d">Buildx 是 Docker 的進階建置工具</span>
* **context · push**<span class="d">在 Repo 根目錄尋找 Dockerfile，建置完成後推送；<code>false</code> 則只建置</span>
* **build-args**<span class="d">建置時使用的參數。<code>/api</code> 讓前端把 API 請求送到同一個網域，再由 Reverse Proxy 轉送</span>
* **tags**<span class="d">同時加上 <code>latest</code> 與這次 commit 的 SHA 兩個 Tag</span>
* **cache-from · cache-to**<span class="d">使用 GitHub Actions 的快取，加快之後的建置</span>

</div>
</div>

<!--
VITE_API_BASE_URL 設為 /api：前端打包後會把 API 請求送到同一個網域的 /api，之後由 Reverse Proxy 轉送給 Backend。
-->

---

## 兩個 Tag：latest 與 commit SHA

<div class="cards" style="margin-top:24px">
<div class="card">
  <span class="label">${{ env.IMAGE }}:latest</span>
  <h3>永遠指向最新版本</h3>
  <p>方便直接取用最新一次建置的 Image</p>
</div>
<div class="card focus">
  <span class="label">${{ env.IMAGE }}:${{ github.sha }}</span>
  <h3>每個版本唯一</h3>
  <p>清楚知道 Image 對應哪一次 commit，需要時也能回滾到特定版本</p>
</div>
</div>

---

## Backend publish：只有兩處不同

<div class="walk">
<div>

<div class="file">main.yaml · 加在 jobs 底下</div>

```yaml {5-6|17-25|1-4,7-15}
publish:
    name: Publish image
    needs: [lint, test]
    runs-on: ubuntu-latest
    env:
        IMAGE: ${{ vars.DOCKERHUB_USERNAME }}/ci-cd-workshop-backend
    steps:
        - uses: actions/checkout@v7

        - uses: docker/login-action@v4
          with:
              username: ${{ vars.DOCKERHUB_USERNAME }}
              password: ${{ secrets.DOCKERHUB_TOKEN }}

        - uses: docker/setup-buildx-action@v4

        - uses: docker/build-push-action@v7
          with:
              context: .
              push: true
              tags: |
                  ${{ env.IMAGE }}:latest
                  ${{ env.IMAGE }}:${{ github.sha }}
              cache-from: type=gha
              cache-to: type=gha,mode=max
```

</div>
<div class="walk-notes">

* **IMAGE**<span class="d">Image 名稱改成 <code>ci-cd-workshop-backend</code></span>
* **build-push-action**<span class="d">不需要 <code>build-args</code></span>
* **其餘相同**<span class="d"><code>needs</code>、登入與 Buildx 都與 Frontend 相同</span>

</div>
</div>

---

## push 到 main

```bash
git add .
git commit -m "cd: build docker image"
git push origin main
```

---

## Publish 在 Lint 與 Test 成功後才執行

![h:540](teaching-material/images/06-cd-publish-job.png)

---

## 在 Docker Hub 看到 Image

![w:1400](teaching-material/images/07-dockerhub-image.png)

---

<!-- header: 部署 -->

## 部署架構

<div class="arch">
  <div class="vm"><span class="tag">VM</span></div>
  <div class="net"><span class="tag">Docker Compose · todo</span></div>
  <svg class="arch-lines" viewBox="0 0 1216 600" width="1216" height="600">
    <path class="ln ln-in" d="M170 300 L300 300"/>
    <path class="ln ln-front" d="M480 300 L620 190"/>
    <path class="ln ln-back" d="M480 300 L620 430"/>
    <path class="ln ln-db" d="M820 430 L935 430"/>
  </svg>
  <div class="chips"><span class="chip c1">① GET example.com/</span><span class="chip c2">② GET example.com/api/todos</span></div>
  <div class="an" style="left:10px;top:255px;width:160px">瀏覽器</div>
  <span class="port" style="left:180px;top:286px">:3000</span>
  <div class="an hl" style="left:300px;top:252px;width:180px;height:96px">todo-proxy<small>nginx</small></div>
  <span class="route r1" style="left:512px;top:200px">/</span>
  <span class="route r2" style="left:500px;top:372px">/api/</span>
  <div class="an n-front" style="left:620px;top:145px;width:200px">todo-frontend</div>
  <div class="an n-back" style="left:620px;top:385px;width:200px">todo-backend</div>
  <div class="an n-db" style="left:935px;top:385px;width:190px">todo-db</div>
  <span class="vol" style="left:935px;top:492px;width:190px">volume · todo-db-data</span>
  <i class="pkt req pa-req" style="offset-path:path('M90 300 L480 300 L620 190 L720 190')"></i>
  <i class="pkt res pa-res" style="offset-path:path('M720 190 L620 190 L480 300 L90 300')"></i>
  <i class="pkt req pb-req" style="offset-path:path('M90 300 L480 300 L620 430 L1030 430')"></i>
  <i class="pkt res pb-res" style="offset-path:path('M1030 430 L620 430 L480 300 L90 300')"></i>
</div>

<!--
四個容器由 Docker Compose 啟動並接在同一個網路，只有 todo-proxy 對外開放 port 3000。
動畫輪流示範兩種請求（藍點是請求、綠點是回應）：
① 開啟網站 example.com/：瀏覽器連到 VM 的 3000 port，todo-proxy 看到路徑是 /，轉送給 todo-frontend，網頁再沿原路回到瀏覽器。
② 呼叫 API example.com/api/todos：todo-proxy 看到路徑以 /api/ 開頭，轉送給 todo-backend，Backend 再到 todo-db 讀寫資料，結果沿原路回到瀏覽器。
資料庫的資料存在 volume todo-db-data，容器重建後資料仍在。
-->
---

## 建立部署資料夾

<div class="walk">
<div>

<div class="file">VM · bash</div>

```bash {1|2}
mkdir -p ~/todo/proxy
cd ~/todo
```

</div>
<div class="walk-notes">

<p>SSH 進到 VM 後執行</p>

* **mkdir -p**<span class="d">建立 <code>~/todo</code> 與底下的 <code>proxy</code> 資料夾，<code>-p</code> 會連同上層一起建立</span>
* **cd ~/todo**<span class="d">之後的檔案都放在這個資料夾</span>

</div>
</div>

<!--
先 SSH 進到 VM，建立部署用的資料夾。proxy 資料夾等一下用來放 Nginx 的設定檔。
-->

---

## 要建立的檔案

<div class="walk">
<div>

<div class="file">~/todo</div>

```text {2|3|4-5}
~/todo
├── .env
├── compose.yaml
└── proxy
    └── default.conf
```

</div>
<div class="walk-notes">

* **.env**<span class="d">Docker Hub 帳號，Compose 會自動讀取</span>
* **compose.yaml**<span class="d">定義四個服務：資料庫、後端、前端與 Reverse Proxy</span>
* **proxy/default.conf**<span class="d">Reverse Proxy 的 Nginx 設定檔</span>

</div>
</div>

<!--
部署只需要三個檔案，接下來一個一個建立。
-->

---

## .env

<div class="walk">
<div>

<div class="file">~/todo/.env</div>

```bash {1}
DOCKERHUB_USERNAME=<帳號>
```

</div>
<div class="walk-notes">

* **DOCKERHUB_USERNAME**<span class="d">換成自己的 Docker Hub 帳號，也就是 CD 推送 Image 的位置。Compose 會自動讀取同資料夾的 <code>.env</code>，<code>compose.yaml</code> 就不用寫死帳號</span>

</div>
</div>

---

## compose.yaml

<div class="walk">
<div>

<div class="file">~/todo/compose.yaml</div>

```yaml {1-4|5-8|9-10|11-15|17-19|20-21|22-24|26-28|30-34|35-36|37-39|41-42}
services:
  todo-db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: todo
      POSTGRES_PASSWORD: todo
      POSTGRES_DB: todo
    volumes:
      - todo-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U todo -d todo"]
      interval: 5s
      timeout: 5s
      retries: 5

  todo-backend:
    image: ${DOCKERHUB_USERNAME}/ci-cd-workshop-backend:latest
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql+psycopg://todo:todo@todo-db:5432/todo
    depends_on:
      todo-db:
        condition: service_healthy

  todo-frontend:
    image: ${DOCKERHUB_USERNAME}/ci-cd-workshop-frontend:latest
    restart: unless-stopped

  todo-proxy:
    image: nginx:1.27-alpine
    restart: unless-stopped
    ports:
      - "3000:80"
    volumes:
      - ./proxy/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - todo-backend
      - todo-frontend

volumes:
  todo-db-data:
```

</div>
<div class="walk-notes">

* **services · todo-db**<span class="d">每個服務的名稱同時是容器之間連線用的名稱。<code>restart: unless-stopped</code> 讓容器異常停止或 VM 重開機後自動重啟</span>
* **environment**<span class="d">容器的環境變數，對應 <code>docker run -e</code>，這裡設定資料庫的帳號、密碼與名稱</span>
* **volumes**<span class="d">資料存在 <code>todo-db-data</code>，容器刪除後資料仍在</span>
* **healthcheck**<span class="d">每 5 秒確認資料庫是否已可接受連線</span>
* **todo-backend**<span class="d"><code>${DOCKERHUB_USERNAME}</code> 會帶入 <code>.env</code> 的值，下載 CD 推送的 Image</span>
* **DATABASE_URL**<span class="d">主機名稱 <code>todo-db</code> 就是資料庫的服務名稱，帳號密碼對應上方設定</span>
* **depends_on**<span class="d">等資料庫的 healthcheck 通過後才啟動 Backend</span>
* **todo-frontend**<span class="d">只需要 Image，API 位址在建置 Image 時就寫進去了</span>
* **todo-proxy · ports**<span class="d">VM 的 3000 port 對應容器的 80 port，是整個系統唯一對外的入口</span>
* **volumes · :ro**<span class="d">把本機的設定檔掛進容器，<code>:ro</code> 代表唯讀</span>
* **depends_on**<span class="d">前後端都啟動後才啟動 Proxy</span>
* **volumes**<span class="d">宣告要建立的 Volume，也就是 todo-db 使用的 <code>todo-db-data</code></span>

</div>
</div>

<!--
一個區塊一個區塊往下看：
todo-db：服務名稱也是連線名稱，restart unless-stopped 讓容器自動重啟；environment 對應 docker run -e；volumes 把資料存到 todo-db-data；healthcheck 確認資料庫可以連線。
todo-backend：Image 來自 CD 推送的位置，帳號由 .env 帶入；DATABASE_URL 用 todo-db 這個名稱連到資料庫；depends_on 等 healthcheck 通過才啟動。
todo-frontend：只需要 Image。
todo-proxy：只有它有 ports，是唯一對外入口；設定檔用唯讀方式掛進去；前後端啟動後才啟動。
-->

---

## proxy/default.conf

<div class="walk">
<div>

<div class="file">~/todo/proxy/default.conf</div>

```nginx {1-2|4|5|6|7|9-11|13-15}
server {
    listen 80;

    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    location /api/ {
        proxy_pass http://todo-backend:8000;
    }

    location / {
        proxy_pass http://todo-frontend:80;
    }
}
```

</div>
<div class="walk-notes">

* **listen 80**<span class="d">在容器的 80 port 接收請求，也就是 VM 的 3000 port</span>
* **Host**<span class="d">保留使用者原本請求的網域與 port，否則產生網址或重新導向時可能出錯</span>
* **X-Real-IP**<span class="d">使用者的真實 IP，否則 Backend 看到的都是 Nginx 容器的 IP</span>
* **X-Forwarded-For**<span class="d">記錄請求經過的 IP 清單</span>
* **X-Forwarded-Proto**<span class="d">原始請求是 <code>http</code> 還是 <code>https</code></span>
* **location /api/**<span class="d">以 <code>/api/</code> 開頭的請求轉送給 <code>todo-backend</code></span>
* **location /**<span class="d">其他請求轉送給 <code>todo-frontend</code></span>

</div>
</div>

<!--
proxy_set_header 把原始請求的資訊帶給後方服務。
location 依路徑分流，todo-backend 與 todo-frontend 都是 compose.yaml 中的服務名稱。
-->

---

## 啟動服務

<div class="walk">
<div>

<div class="file">~/todo</div>

```bash {1}
docker compose up -d
```

</div>
<div class="walk-notes">

* **docker compose up -d**<span class="d">依照 <code>compose.yaml</code> 下載 Image 並啟動所有服務，<code>-d</code> 代表在背景執行</span>

</div>
</div>

<!--
在 ~/todo 資料夾中執行，Compose 會讀取 compose.yaml 與 .env，依照 depends_on 的順序啟動四個容器。
-->

---

## 打開 http://localhost:3000

![h:540](teaching-material/images/08-deployed-site.png)

---

<!-- header: 回顧 -->

## 從 push 到上線

<div class="tl-row" style="margin-top:56px">
  <span class="tl-cap">GitHub Actions</span>
  <ol class="tl more">
    <li><b>git push</b></li>
    <li class="good"><b>Lint ∥ Test</b><small>CI</small></li>
    <li class="good"><b>Publish image</b><small>CD，推送到 Docker Hub</small></li>
  </ol>
</div>

<!--
請學員說出從 push 到上線，每一步由誰負責：GitHub Actions 負責 Lint、Test 與建置推送。
-->

---

## 從 push 到上線

<div class="tl-row" style="margin-top:56px">
  <span class="tl-cap">VM</span>
  <ol class="tl cont">
    <li><b>docker compose up</b><small>從 Docker Hub 下載並啟動</small></li>
    <li class="hl"><b>Reverse Proxy</b><small>/ 與 /api 分流</small></li>
    <li><b>使用者</b></li>
  </ol>
</div>

<!--
VM 上用 Docker Compose 下載並啟動容器，Nginx 作為單一入口分流，使用者就能看到新版本。
-->

---

<!-- _class: qa -->
<!-- _header: '' -->

## Q & A

<p>感謝參與 CI/CD Workshop</p>
