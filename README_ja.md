# VPM Build Listing JSON Action
[English](README.md) | 日本語  
  
VPM用のListingJSONをいい感じにビルドするGithubAction  

## 使い方
任意のworkflowに以下のように追加してください
```diff
name: Build Repo Listing

on: 
  workflow_dispatch:
  push:
    branches: main
    paths: source.json

jobs:
  build:
    runs-on: ubuntu-latest
    name: Build
    steps:
      - name: Checkout
        uses: actions/checkout@v4

+      - name: Build Listing JSON
+        uses: yukineko-works/vpm-build-listing-json-action@v1.1.0
+        with:
+          source: source.json
+          token: ${{ secrets.GITHUB_TOKEN }}
```

## 設定
### source.jsonを使用する
[公式のPackageListingで使用されているフォーマットのjson](https://github.com/vrchat-community/template-package-listing/blob/main/source.json)を任意の場所に配置し、それを使用する方法です。  
プロパティ `source` を指定してください。  
```diff
    - name: Build Listing JSON
      uses: yukineko-works/vpm-build-listing-json-action@v1.1.0
      with:
+       source: source.json
        token: ${{ secrets.GITHUB_TOKEN }}
```

### workflow内で指定する
必要な情報を直接workflow内で指定する方法です。  
プロパティ `name`, `id`, `url`, `author`, `repositories` を指定してください。  
```diff
    - name: Build Listing JSON
      uses: yukineko-works/vpm-build-listing-json-action@v1.1.0
      with:
+       name: example vpm repository
+       id: com.example.vpm-repository
+       url: https://example.com/index.json
+       author: example author
+       repositories: |
+         github/Example1
+         github/Example2
+         github/Example3
        token: ${{ secrets.GITHUB_TOKEN }}
```

## プロパティ

Property | Type | Default | Required | Description
--- | --- | --- | --- | ---
name | string | | Yes ***1** | リポジトリ名
id | string | | Yes ***1** | リポジトリID
url | string | | Yes ***1** | リポジトリのURL
author | string | | Yes ***1** | 制作者名
repositories | string | | Yes ***1** | リストに掲載するリポジトリのリスト
source | string | | Yes ***2** | source.jsonのパス
output | string | `index.json` | No | jsonの出力先のパス
disable-cache | boolean | `false` | No | リリースされている成果物の参照にキャッシュを使用しないようにするかどうか
token | string | | Yes | Githubのトークン

***1**: `source` が指定されている場合は不要  
***2**: *1を指定している場合は不要

## ライセンス
MIT License