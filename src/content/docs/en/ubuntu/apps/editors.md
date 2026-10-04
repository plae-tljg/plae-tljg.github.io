---
title: "Editors and IDEs"
summary: "wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | sudo apt-key add - sudo apt-get install apt-transport-https echo \"deb https://downloa…"
lang: en
translationKey: "ubuntu-apps-editors"
slug: editors
track: ubuntu
stage: apps
order: 4
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/editors.md
aiTranslated: true
---
## Sublime Text

```bash
wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | sudo apt-key add -
sudo apt-get install apt-transport-https
echo "deb https://download.sublimetext.com/ apt/stable/" | sudo tee /etc/apt/sources.list.d/sublime-text.list
sudo apt-get update
sudo apt-get install sublime-text
```

## Neovim

```bash
sudo apt-get install neovim
```

Or install the latest version:

```bash
sudo add-apt-repository ppa:neovim-ppa/stable
sudo apt-get update
sudo apt-get install neovim
```

## Jupyter Notebook

```bash
pip3 install jupyter notebook
```

Or use conda:

```bash
conda install jupyter notebook
```

Launch it:

```bash
jupyter notebook
```
