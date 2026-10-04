---
title: 04 仪表盘上的脸为什么会变形
summary: >-
  Initially, there is problem in a page with say 3x3 image dashboard, but that
  as image size become not standard, the original code make the guys look …
lang: zh
translationKey: tinkering-image-fit
slug: tinkering-image-fit
date: '2026-10-01'
series: tinkering-notes
seriesOrder: 4
tags:
  - 折腾
  - Ubuntu
status: preview
source: seasons/03-tinkering/04-image-fit.zh.md
syncedAt: '2026-10-04T10:26:34.593Z'
---
<!-- 草稿：从 plae-lkm/ubuntu_setup 的 docs/dev/web_dev/html.md 导入，等待重写。
     纯叙事，没有对应的文档页。
     命令与截图先不删，重写时再决定留哪些。 -->
# HTML Outlook

## Image Rendering Problem in HTML

Initially, there is problem in a page with say `3x3` image dashboard, but that as image size become not standard, the original code make the guys look fat and swollen:  

```html
<td style="border-right:none;">
    <img src="example.com" width="200" height="229" style="display: inline"></img>
    <br><br>
</td>
```

Next, it is resolved by not restricting the width, so that it is not resized:  

```html
<td style="border-right:none;">
    <img src="example.com"  style="display: inline; height: 229px; width: auto; max-height: 100%;"></img>
    <br><br>
</td>
```

But then after viewing a bit again, some more problem if say more than 1 shorter images appear on a row,  

```html
<td style="border-right:none;">
    <div style="width: 200px; height: 229px; overflow: hidden; display: inline-block;">
        <img src="example.com" 
             style="display: block; width: 100%; height: 100%; object-fit: cover; object-position: center;">
    </div>
    <br><br>
</td>
```
