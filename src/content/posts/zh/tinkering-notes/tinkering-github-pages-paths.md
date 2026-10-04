---
title: 03 两个仓库，一个域名：一次 GitHub Pages 路径实验
summary: >-
  There is an interesting problem, a github user can serve github pages per
  repository. Like I have a repository ubuntusetup, I can access its github p…
lang: zh
translationKey: tinkering-github-pages-paths
slug: tinkering-github-pages-paths
date: '2026-10-01'
series: tinkering-notes
seriesOrder: 3
tags:
  - 折腾
  - Ubuntu
status: preview
source: seasons/03-tinkering/03-github-pages-paths.zh.md
syncedAt: '2026-10-04T10:26:34.592Z'
---
<!-- 草稿：从 plae-lkm/ubuntu_setup 的 docs/dev/git/github_pages.md 导入，等待重写。
     六张截图还在原仓库的 assets/github_pages/ 里，写文章时再挑两张搬过来。
     命令与截图先不删，重写时再决定留哪些。 -->
# Github Pages

## Conflicting Endpoints

There is an interesting problem, a github user can serve github pages per repository. Like I have a repository [ubuntu_setup](https://github.com/plae-tljg/ubuntu_setup), I can access its github page by [https://plae-tljg.github.io/ubuntu_setup/](https://plae-tljg.github.io/ubuntu_setup/).  

But a github user can also have personal page by creating personal repository, liek for me `plae-tljg`, I can make a repository called `plae-tljg.github.io`, which its deployed page can be access with [plae-tljg.github.io](plae-tljg.github.io). We can call it a `personal repo`.  

Now what if you create an endpoint under your personal repo of same name as your other repository which has deployed pages, like `ubuntu_setup`?  

Let's experiment.  

### Localhost Appearance

I created the experiment at `d1c20f6f3eeab0f9cd167f21155015d87e1c7e2e` commit of my personal repo.  

`npm run dev` at localhost show following pages, which actually has different pages on endpoint with slash ([http://localhost:5173/ubuntu_setup](http://localhost:5173/ubuntu_setup)) and without slash ([http://localhost:5173/ubuntu_setup/](http://localhost:5173/ubuntu_setup/)).  

![Personal Repository - localhost - Home](/ubuntu/github_pages/personal_localhost_home.png)  

![Personal Repository - localhost - Without Slash](/ubuntu/github_pages/ubuntu_localhost_without_slash.png)  

![Personal Repository - localhost - With Slash](/ubuntu/github_pages/ubuntu_localhost_with_slash.png)  

### Github Page Deployment

Now using the script to deploy to github page, we can see following:  

![Personal Repository - Github Page - Home](/ubuntu/github_pages/personal_gh_pages_home.png)  

![Personal Repository - Github Page - Without Slash](/ubuntu/github_pages/ubuntu_gh_pages_without_slash.png)  

Note that the page of without slash [https://plae-tljg.github.io/ubuntu_setup](https://plae-tljg.github.io/ubuntu_setup) cannot be visited unless you click button from homepage of personal repo github page. If dont do that, you will be redirected to [https://plae-tljg.github.io/ubuntu_setup/](https://plae-tljg.github.io/ubuntu_setup/), which is just following:  

![Personal Repository - Github Page - With Slash](/ubuntu/github_pages/ubuntu_gh_pages_with_slash.png)  

so you can see that teh page of [https://plae-tljg.github.io/ubuntu_setup/](https://plae-tljg.github.io/ubuntu_setup/) is actually the github page for the other repository `ubuntu_setup`.
