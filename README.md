# rails-go-react-app

## 概要

このリポジトリは、Web開発で用いられる3つの異なる技術スタック（React, Ruby on Rails, Go）を連携させた、フルスタックで簡易的なWebアプリケーションです。

プロジェクト管理手法としてモノレポ構成を採用し、単一リポジトリ内での効率的なパッケージ管理とスクリプト実行を実現しています。

---

## アーキテクチャ

本アプリケーションは、それぞれが独立した役割を持つ3つのサービスで構成されています。これらはネットワークを介して連携し、機能を提供します。

1.  **Frontend (React / TypeScript)**
    -   **ディレクトリ**: `packages/ts-react-client`
    -   **役割**: ユーザーインターフェース（UI）を担当。ユーザーからの入力を受け取り、APIサーバーにリクエストを送信します。
    -   **技術**: `React`, `TypeScript`, `Vite`

2.  **API Server (Ruby on Rails)**
    -   **ディレクトリ**: `packages/rails-api-server`
    -   **役割**: アプリケーションの司令塔（バックエンド）。フロントエンドからのリクエストを処理し、必要に応じてGoマイクロサービスと通信しながら、データベースへの永続化を行います。
    -   **技術**: `Ruby on Rails` (APIモード)

3.  **Microservice (Go)**
    -   **ディレクトリ**: `packages/go-processor`
    -   **役割**: 特定の処理に特化した独立サービス。Rails APIからの依頼を受け、メッセージにタイムスタンプを付加して返却します。
    -   **技術**: `Go` (標準ライブラリのみ)

---

## 起動方法

### 1. 前提条件

開発を始める前に、以下のソフトウェアがインストールされていることを確認してください。

-   **Ruby**: `3.3.3`
-   **Rails**: `7.x` (gem install railsで入る最新版)
-   **Go**: `1.24.5`
-   **Node.js**: `24.4.1`

### 2. セットアップ

初回のみ、以下のコマンドを実行してプロジェクトの依存関係をインストールし、データベースを準備します。

```bash
# 1. プロジェクトルートでnpmパッケージをインストール
# (npm workspacesの機能により、frontendの依存関係も同時にインストールされます)
npm install

# 2. Rails APIの依存関係をインストールし、DBをセットアップ
cd packages/rails-api-server
bundle install
rails db:create && rails db:migrate
cd ../..
```

### 3. 全サービスの起動
プロジェクトのルートディレクトリで以下のコマンドを実行すると、3つのサービスが同時に起動します。

```bash
npm run start:all
```

これにより、各サービスが以下のポートで待ち受け状態になります。

React Client: `http://localhost:5173`

Rails API: `http://localhost:3000`

Go Processor: `http://localhost:8081`

ブラウザで`http://localhost:5173`を開いて、アプリケーションを操作できます。
