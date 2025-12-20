# 澳門寵物友善餐廳 (Macau Pet-Friendly Eats)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

English | [中文](README_zh.md)

一個由社區驅動的澳門寵物友善餐飲指南。

## 關於本專案

Macau Pet-Friendly Eats 旨在解決寵物主人在澳門尋找合適餐飲場所的難題。我們提供一個全面、由社區共同維護的寵物友善餐廳和咖啡館列表，詳細列出具體的寵物政策和設施。

### 主要功能

*   **互動地圖**：輕鬆定位您附近或特定區域的寵物友善地點。
*   **用戶認證**：由 Supabase 支持的安全註冊和登錄功能。
*   **收藏夾**：保存您最喜愛的餐廳，以便快速訪問。
*   **寵物檔案**：為您的毛孩創建專屬檔案。
*   **管理員儀表板**：用於管理餐廳列表和用戶內容的全面工具。
*   **多語言支持**：全面支持中文、英文和葡萄牙文（i18next）。

## 截圖

| 首頁 | 地圖視圖 |
|:---:|:---:|
| ![首頁佔位圖](https://via.placeholder.com/600x400?text=Home+Page) | ![地圖視圖佔位圖](https://via.placeholder.com/600x400?text=Map+View) |

## 技術棧

### 前端 (Frontend)
*   **React (Vite)**：快速、現代化的 UI 開發。
*   **TypeScript**：類型安全的代碼，提高可維護性。
*   **Tailwind CSS**：實用優先的樣式設計，實現快速開發。

### 後端/數據庫 (Backend/DB)
*   **Supabase**：
    *   **Auth**：安全的用戶認證。
    *   **Postgres**：強大的關聯式數據庫。
    *   **Storage**：用於存儲餐廳圖片和用戶上傳的內容。
    *   **Edge Functions**：無伺服器邏輯（如適用）。

### 國際化 (Internationalization)
*   **i18next**：使用 `i18next-http-backend` 實現命名空間翻譯的懶加載 (`/public/locales`)。

### 狀態/數據 (State/Data)
*   **React Hooks**：用於本地狀態管理和數據獲取邏輯的自定義 Hooks。

## 快速開始

請按照以下步驟在本地設置專案副本。

### 先決條件

*   **Node.js**：建議 v18.0.0 或更高版本。
*   **Supabase CLI**：（可選）用於本地數據庫開發。

### 安裝

1.  克隆 (Clone) 倉庫
    ```sh
    git clone https://github.com/BrianWong05/macau-pet-eats.git
    ```
2.  安裝 NPM 套件
    ```sh
    npm install
    ```

### 環境設置

1.  在根目錄下創建一個 `.env.local` 文件。
2.  添加以下變量（您可以在您的 Supabase 專案設置中找到這些）：

    ```env
    VITE_SUPABASE_URL=your_supbase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

### 本地運行

啟動開發伺服器：

```sh
npm run dev
```

## 專案結構

以下是專案結構的高層概覽：

```text
macau-pet-eats/
├── public/
│   └── locales/       # i18n 翻譯 JSON 文件
├── src/
│   ├── components/    # 可複用的 UI 組件
│   ├── contexts/      # React 上下文 (Auth, Theme 等)
│   ├── hooks/         # 自定義 React Hooks
│   ├── pages/         # 頁面組件 (路由)
│   ├── services/      # API 和 Supabase 服務調用
│   └── types/         # TypeScript 類型定義
├── .env.example       # 環境變量示例
└── package.json       # 專案依賴和腳本
```

## 數據庫設置

本專案使用 **Supabase** 作為後端。

1.  在 [Supabase](https://supabase.com) 上創建一個新專案。
2.  在 SQL 編輯器中執行架構設置腳本，以創建必要的數據表（`restaurants`, `profiles`, `reviews` 等）。
3.  *注意：如果有的話，可以在根目錄或 `supabase/` 文件夾中找到 `schema.sql` 文件以自動執行此步驟。*

## 貢獻指南

貢獻是開源社區成為學習、激勵和創造的絕佳場所的原因。我們**非常感謝**您的任何貢獻。

1.  Fork 本專案
2.  創建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  提交 Pull Request
