# VPM Build Listing JSON Action
English | [日本語](README_ja.md)  
  
Build ListingJSON for VPM with GithubAction

## Usage
Add the following to any workflow
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
+        uses: yukineko-works/vpm-build-listing-json-action@v1.0.0
+        with:
+          source-json-path: source.json
+          token: ${{ secrets.GITHUB_TOKEN }}
```

## Setting
### Use source.json
Place the [json format used in the official PackageListing](https://github.com/vrchat-community/template-package-listing/blob/main/source.json) in any location and use it.  
Specify the property `source-json-path`.  
```diff
    - name: Build Listing JSON
      uses: yukineko-works/vpm-build-listing-json-action@v1.0.0
      with:
+       source-json-path: source.json
        token: ${{ secrets.GITHUB_TOKEN }}
```

### Specify in the workflow
Specify the necessary information directly in the workflow.
Specify the properties `name`, `id`, `url`, `author-name`, `author-url`, `author-email`, `repositories`.  
```diff
    - name: Build Listing JSON
      uses: yukineko-works/vpm-build-listing-json-action@v1.0.0
      with:
+       name: example vpm repository
+       id: com.example.vpm-repository
+       url: https://example.com/index.json
+       author-name: example author
+       author-url: https://example.com
+       author-email: example@example.com # Optional
+       repositories: |
+         github/Example1
+         github/Example2
+         github/Example3
        token: ${{ secrets.GITHUB_TOKEN }}
```

## Property

Property | Type | Default | Required | Description
--- | --- | --- | --- | ---
name | string | | Yes ***1** | Repository name
id | string | | Yes ***1** | Repository ID
url | string | | Yes ***1** | Repository URL
author-name | string | | Yes ***1** | Author name
author-url | string | | Yes ***1** | Author URL
author-email | string | | No | Author email address
repositories | string | | Yes ***1** | List of repositories to be listed
source-json-path | string | | Yes ***2** | Path to source.json
output | string | `index.json` | No | Path to output json
disable-cache | boolean | `false` | No | Whether to disable the use of cache to refer to released artifacts
token | string | | Yes | Github token

***1**: Not required if `source-json-path` is specified  
***2**: Not required if *1 is specified

## License
MIT License