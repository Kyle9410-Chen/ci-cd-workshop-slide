# ci-cd-workshop-slide

CI/CD Workshop 簡報，使用 [Marp](https://marp.app/) 撰寫。

- `slides.md`：簡報
- `teaching-material/`：教材原文與圖片

```bash
npm install
npm run dev
npm run build
npm run build:pdf
```

`npm run dev` 啟動後開啟 http://localhost:8080/slides.md 即可預覽並 live reload。

## 部署

push 到 `main` 後，`.github/workflows/pages.yaml` 會建置簡報並部署到 GitHub Pages。第一次使用前，請到 Repo 的 Settings → Pages，將 Source 設為 **GitHub Actions**。
