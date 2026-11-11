# CI/CD

---

CI/CD 分別代表了兩樣東西：Continuous Integration（持續整合）及 Continuous Delivery / Continuous Deployment（持續交付 / 持續部署），主要是為了確保程式碼從開發到上線的過程中自動化且可靠。帶來的好處有：

- 降低風險
- 提升品質
- 減少重複工作

其中常見的工具有很多種，這次主要的內容會圍繞在 GitHub Actions

## **Preparation**

先 Fork 以下兩個專案 Backend、Frontend

![alt text](images/01-fork-repos.png)

### Backend

Backend 是透過 Python 的 FastAPI 實作的，並透過 uv 做套件管理，所以之後的指令會很常看到 `uv` 開頭的指令。

### Frontend

Frontend 是透過 React + TypeScript 實作的，並透過 npm 管理套件，所以操作 Frontend 的指令大多以 `npm` 開頭。

### Docker Hub

請到 Docker Hub 註冊帳號，或是可以之前註冊過的帳號

## CI - Continuous Integration

CI（Continuous Integration）最主要的功用是解決多人開發時，各自寫的程式碼合在一起後才發現出錯、而且很難找到原因的狀況。

可以從一般的開發流程來看：

```mermaid
flowchart TD
    A["需求分析"] --> B["設計"]
    B --> C["本機開發"]
    C --> D["本機測試"]
    D --> H["建置打包"]
    H --> I["部署到測試環境"]
    I --> J["QA 測試"]
    J --> K{"發現 bug？"}
    K -- 是 --> C
    K -- 否 --> L["部署上線"]
    L --> M["上線後監控與維護"]
```

可以發現過程中有很多時候開發者並不是在處理程式邏輯，而是如何將程式碼整合、驗證 Bug、實際部署等，其中 CI 就可以將整合、Bug 驗證自動化，減少人力的消耗及更穩定專案的進行。

### Lint

是一種靜態檢查工具，各式語言可能都有屬於自己的 Linter，透過分析程式碼的撰寫方式找出潛在的問題，通常包括：

- Style
- 潛在 bug
- 不好的寫法

開發時，建議先在本機執行 Lint，不過本機檢查可能被略過，所以 CI 還是會在統一的環境中重新檢查一次，確保合併進主分支的程式碼都符合，以範例的 Repo 來說的話可以透過這些指令測試。

- Backend：

```bash
uv run ruff check .
```

- Frontend

```bash
npm run lint
```

### Test

測試是透過撰寫程式碼來驗證程式行為是否符合預期。與 Lint 不同，測試需要實際執行程式，因此能檢查出「語法正確但邏輯錯誤」的問題。各種語言也都有自己的測試框架，例如 JavaScript 的 Jest、Vitest，Python 的 pytest。常見的測試類型包括：

- Unit Test：針對單一函式或模組進行測試，速度快、數量最多
- Integration Test：測試多個模組或外部服務（如資料庫、API）搭配運作是否正常
- End-to-End Test：模擬使用者實際操作整個系統，最接近真實情境，但執行較慢

開發時，建議在本機先執行測試，確認實作的功能如同預期。不過和 Lint 一樣，本機測試可能被略過，或因環境差異（作業系統、套件版本、環境變數）而結果不同，因此 push 到遠端後，CI 會在統一的環境中重新執行所有測試。以範例的 Repo 來說的話可以透過這些指令測試。

- Backend

```bash
uv run pytest
```

- Frontend

```bash
npm test -- --run
```

## CD - Continuous Delivery

CD（Continuous Delivery）把建置、部署到各環境與驗證的整個過程自動化，讓程式碼隨時處於可以部署的狀態。與 Continuous Deployment 最大的差異，在於「部署到正式環境」這一步是否也自動化：Continuous Delivery 保留人工決定上線的時機，Continuous Deployment 則在通過所有檢查後直接自動上線。

### Build Docker Image

在 Continuous Delivery 中，「隨時可以部署」的前提是：要有一個已經打包好、可以直接拿去執行的產出物。在現代的開發流程中，這個產出物最常見的形式就是 Docker Image。

如果由開發者在自己的電腦上建置 Image 再上傳，又會回到依賴人力、環境不一致、步驟複雜的問題。把建置交給 CI/CD：

- 只有通過檢查的程式碼才會被打包：建置會接在 Lint 與 Test 之後執行
- 建置環境一致：每次都在相同的 Runner 上、用相同的步驟建置
- 可追溯：每個 Image 都能對應到某一次 commit，出問題時清楚知道是哪個版本

```mermaid
flowchart TD
    A["Lint 與 Test"] --> B["依照 Dockerfile 建置 Image"]
    B --> C["加上 Tag：latest、commit SHA"]
    C --> D["推送到 Registry：Docker Hub"]
```

## Reverse Proxy

Reverse Proxy（反向代理）是位於使用者與後端服務之間的一台伺服器。使用者的請求會先送到 Reverse Proxy，再由它依照規則轉送給後方對應的服務，最後把回應傳回給使用者。對使用者來說，他只知道自己連到了一個網址，並不知道背後實際有幾個服務、各自在哪裡。

常見的 Reverse Proxy 工具有 Nginx、Caddy、Traefik 等。

範例：

```bash
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

- `location /api/`：路徑以 `/api/` 開頭的請求，轉送給 Backend
- `location /`：其他所有請求，轉送給 Frontend
- `backend`、`frontend`：服務的名稱，在 Docker Compose 中可以直接用服務名稱互相連線

### Why

以今天的專案為例，我們有 Frontend 與 Backend 兩個服務。如果讓使用者直接分別連線，會遇到幾個問題：

- CORS 問題：前端在 `example.com`、後端在 `api.example.com` 或不同的 port，瀏覽器會視為不同來源，需要額外設定 CORS
- 對外暴露多個入口：每個服務都要開放對外連線，管理與安全性都較麻煩
- 前端需要知道後端的實際位址：後端位址一變動，前端就得重新建置

加入 Reverse Proxy 後，所有請求都從同一個入口進來，再依照路徑分流：

- `/` ： 轉送給 Frontend
- `/api` ： 轉送給 Backend

對瀏覽器來說，前端與 API 都在同一個網域下，就可以解決 CORS 的問題。

其他常見用途

- HTTPS 處理：在 Reverse Proxy 統一設定 SSL 憑證，後方服務只需處理 HTTP
- 負載平衡（Load Balancing）：將請求分散到多個相同的服務，提升承載量與可用性
- 隱藏內部架構：後端服務不必直接對外開放，只有 Reverse Proxy 對外
- 快取與壓縮：快取靜態檔案、壓縮回應內容，加快載入速度

## GitHub Actions

今天我們使用 GitHub Actions 來實作 CI/CD。GitHub Actions 是 GitHub 內建的自動化服務，只要在 Repo 中撰寫 YAML 格式的設定檔，就能在特定事件發生時（例如 push 程式碼或開 Pull Request）自動執行指定的工作，例如：Lint、測試、建置與部署。

範例：

```yaml
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

而這一份檔案，通常會被稱為一個「Workflow」

### Event

Event 指的是觸發 Workflow 的條件，在剛剛的範例中：

```yaml
on:
    push:
        branches: [main]
    pull_request:
```

這一段就是 Workflow 的 Event，條件通常有很多種，可以參考 https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#on

對於大部分的開發者，比較常使用到的是：

- `push`：只要 push 到指定的 branch 上，就會觸發 Workflow。如果不指定 branch，則任何 push 都會觸發
- `pull_request`：預設在 Pull Request 被開啟、有新的 commit 推上來、或重新開啟時觸發，也可以進一步設定條件，例如
    - `branches`：指定 PR 的目標分支，也就是要合併進去的分支（例如只有要合併進 `main` 的 PR 才觸發）
    - `types`：指定 PR 的活動類型，例如 `opened`、`synchronize`、`closed`
    - `paths`：只有特定檔案或資料夾有變更時才觸發
- `workflow_dispatch`：在 GitHub 介面上手動觸發
- `schedule`：依照排程定時觸發，例如每天半夜執行一次

### Job

Job 是 Workflow 中的一組任務，一個 Workflow 可以包含一個或多個 Job，定義在 `jobs` 底下。在剛剛的範例中：

```yaml
jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: 20
            - run: npm ci
            - run: npm run lint
            - run: npm test
```

這裡定義了一個名為 `test` 的 Job，其中：

- `test`：Job 的 ID，可以自行命名，但同一個 Workflow 中不能重複
- `runs-on`：指定執行這個 Job 的 Runner 環境，GitHub 有預設提供一些環境可以直接跑 Workflow，包括 `ubuntu-latest`、`windows-latest`、`macos-latest`
- `steps`：這個 Job 要依序執行的步驟，只要其中一個 Step 失敗，整個 Job 就會失敗

### Step

Step 是 Job 中依序執行的每一個動作，定義在 `steps` 底下，以 `-` 開頭表示一個 Step。每個 Step 主要有兩種用法：使用現成的 Action，或直接執行指令。以下有一些常見的參數：

- `uses` ：使用現成的 Action

```yaml
steps:
    - uses: actions/checkout@v7
```

`actions/checkout` 是最常用的 Action，負責把 Repo 的程式碼下載到 Runner 上，類似於本機上使用的 `git clone` 。

- `with` ：傳入參數給 Action

```yaml
steps:
    - uses: actions/setup-node@v7
      with:
          node-version: 20
```

每個 Action 可以接受哪些參數，可以參考該 Action 的說明文件。

- `run` ：執行指令

```yaml
steps:
    - run: npm ci
```

這會直接在 Runner 上執行這行 Shell

- `name` ：幫 Step 命名

```yaml
steps:
    - name: 安裝相依套件
      run: npm ci
    - name: 執行測試
      run: npm test
```

會顯示在 GitHub Actions 的執行紀錄中，方便查看是哪個步驟成功或失敗

- 其他常見的：
    - `env`：設定這個 Step 使用的環境變數
    - `if`：設定條件，符合時才執行這個 Step

### Marketplace

開源社群中，其實有很多別人寫好的 Action，可以到這個網址看：https://github.com/marketplace?type=actions

## Hands on

Workflow 在 GitHub Actions 中有固定的檔案位置，會位於 `.github/workflows` 內，可以先建一個 `main.yaml` 在這個資料夾內。

### CI

#### Frontend

```yaml
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

這個 Workflow 主要包含兩個 Job：Lint 與 Test。

- Lint 包括：
    - Lint（Oxlint）：檢查潛在 bug 與不好的寫法
    - Prettier：檢查程式碼排版是否符合規範
    - Type Check：檢查 TypeScript 型別是否正確
- Test：
    - 使用 Vitest 實際執行單元測試

兩個 Job 會同時執行，以縮短整體等待時間。也因為每個 Job 都在一台全新的 Runner 上執行、彼此不共用環境，所以在實際執行 Lint 與 Test 之前，兩個 Job 都需要各自完成以下準備步驟：

1. `actions/checkout`：把 Repo 的程式碼下載到 Runner 上
2. `actions/setup-node`：安裝 Node.js 環境
    - `node-version-file: .nvmrc`：從 `.nvmrc` 讀取 Node.js 版本，讓 CI 與本機使用相同版本
    - `cache: npm`：快取 npm 套件，若 `package-lock.json` 沒有變動，下次執行可以直接使用快取，加快安裝速度
3. `npm ci`：依照 `package-lock.json` 安裝套件，確保每次安裝的版本完全一致。

#### Backend

```yaml
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

Backend 的 Workflow 與 Frontend 結構相同，一樣包含 Lint 與 Test 兩個 Job，差別在於使用的是 Python 的工具。

- Lint 包括：
    - Ruff check：檢查可能的 bug 與不好的寫法，例如：未使用的 import、未定義的變數
    - Ruff format：檢查程式碼排版是否一致，加上 `-check` 只檢查、不修改檔案
- Test：
    - 使用 pytest 執行單元測試

和 Frontend 一樣，兩個 Job 會同時執行，且各自在全新的 Runner 上運作，因此都需要先完成以下準備步驟：

1. `actions/checkout`：把 Repo 的程式碼下載到 Runner 上
2. `astral-sh/setup-uv`：安裝 uv，這是一個 Python 的套件與專案管理工具
    - `enable-cache: true`：快取 uv 下載的套件，加快之後的安裝速度
    - uv 會依照專案中的 `.python-version` 或 `pyproject.toml` 的設定，自動下載對應版本的 Python，讓 CI 與本機使用相同版本
3. `uv sync --locked`：依照 `uv.lock` 安裝套件，並建立虛擬環境。

完成後就可以 push 到 main 上：

```bash
git add .
git commit -m "ci: add linter and testing"
git push origin main
```

push 後可以在 GitHub Repo 中的 Actions 看到執行狀況

![alt text](images/02-ci-actions-run.png)

### CD

在寫 CD 的 Workflow 前要先做一些準備

![alt text](images/03-dockerhub-access-token.png)

建立完後請複製 token，並到 GitHub Repository Settings 中的 Secrets 新增

![alt text](images/04-github-repo-settings.png)

![alt text](images/05-github-actions-secrets.png)

- Token 請新增到 Secrets 中，名字： `DOCKERHUB_TOKEN`
- Username 請新增到 Variables 中，名字： `DOCKERHUB_USERNAME`

Secrets 與 Variables 的差別

- Secrets：用來存放機密資訊（Token、密碼），儲存後無法再查看內容，在執行紀錄中也會自動被遮蔽成 `***`
- Variables：用來存放非機密的設定值（使用者名稱、環境名稱），可以隨時查看與修改

#### Frontend

在原本 CI 的 Workflow 中，`jobs` 底下新增一個 `publish` Job：

```yaml
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

Job 設定

- `needs: [lint, test]`：必須等 `lint` 與 `test` 都成功後才會執行。只要其中一個失敗，就不會發布映像檔，確保上傳的都是通過檢查的程式碼
- `env`：在 Job 層級設定環境變數 `IMAGE`，代表 Image 的名稱，格式為 `使用者名稱/映像檔名稱`。這個 Job 中的所有 Step 都能透過 `${{ env.IMAGE }}` 使用，不必重複撰寫

Step 說明

1. `actions/checkout`：下載程式碼，建置映像檔時需要用到 Dockerfile 與原始碼
2. `docker/login-action`：使用事前準備的 Username 與 Token 登入，之後才有權限上傳 Image
3. `docker/setup-buildx-action`：Buildx 是 Docker 的進階建置工具
4. `docker/build-push-action`：
    - `context: .`：建置時使用的資料夾，這裡是 Repo 根目錄，Docker 會在這裡尋找 Dockerfile
    - `push: true`：建置完成後推送到 Docker Hub，若設為 `false` 則只建置不推送
    - `build-args`：傳入建置時使用的參數。
    - `tags`：為映像檔加上標籤，這裡同時加上兩個：
        - `latest`：永遠指向最新一次建置的版本，方便直接取用
        - `${{ github.sha }}`：這次 commit 的 SHA，每個版本都有唯一的標籤，可以清楚知道映像檔對應哪一次 commit，需要時也能回滾到特定版本

#### Backend

```yaml
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

完成後就可以 push 到 main 上：

```bash
git add .
git commit -m "cd: build docker image"
git push origin main
```

在 Actions 的畫面上，會多出 Publish 的 Job，並只有在 Lint 及 Test 成功後才會執行：

![alt text](images/06-cd-publish-job.png)

Workflow 執行完畢後可以到 Docker Hub 上看到 Image：

![alt text](images/07-dockerhub-image.png)

### 部署

首先 SSH 進到 VM 內，並建立部署用的資料夾：

```bash
mkdir -p ~/todo/proxy
cd ~/todo
```

接著建立對應的檔案：

```bash
~/todo
├── .env
├── compose.yaml
└── proxy
    └── default.conf
```

建立 `.env` ，把 Docker Hub 帳號寫在 `.env` 中，Compose File 會自動讀取，之後 `compose.yaml` 就不用寫死帳號：

```bash
DOCKERHUB_USERNAME=<帳號>
```

建立 `compose.yaml` ：

```yaml
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

- `services`：定義要啟動的容器，每個服務的名稱（例如 `todo-backend`）同時也是容器之間互相連線用的名稱
- `image`：使用的 Image，`${DOCKERHUB_USERNAME}` 會自動帶入 `.env` 中的值
- `restart: unless-stopped`：容器異常停止或 VM 重開機時自動重啟，除非手動停止
- `environment`：設定容器的環境變數，對應 `docker run` 的 `e`
- `volumes`：掛載資料。資料庫的資料存在 `todo-db-data` 這個 Volume 中，容器刪除後資料仍會保留；Proxy 則是把本機的設定檔掛進容器，`:ro` 代表唯讀
- `ports`：將 VM 的 3000 port 對應到容器的 80 port，對應 `docker run` 的 `p`
- `depends_on`：設定啟動順序。Backend 會等資料庫的 `healthcheck` 通過（資料庫已可接受連線）後才啟動；Proxy 則在前後端都啟動後才啟動
- 最下方的 `volumes`：宣告要建立的 Volume

建立 Reverse Proxy 設定檔 `proxy/default.conf` ：

```
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

- `Host $http_host`：保留使用者原本請求的網域與 port。若不設定，產生網址或重新導向時可能出錯
- `X-Real-IP $remote_addr`：使用者的真實 IP。若不設定，Backend 看到的 IP 都會是 Nginx 容器的 IP
- `X-Forwarded-For $proxy_add_x_forwarded_for`：記錄請求經過的 IP 清單
- `X-Forwarded-Proto $scheme`：原始請求是 `http` 還是 `https`

啟動服務：

```bash
docker compose up -d
```

之後可以實際到瀏覽器打上 `http://localhost:3000` 可以看到網站：

![alt text](images/08-deployed-site.png)
