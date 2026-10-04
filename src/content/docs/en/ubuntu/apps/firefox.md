---
title: "Firefox"
summary: "Install Firefox with apt rather than the snap version. The snap build can run into compatibility problems, for example the Sogou Pinyin input method not working, or the mouse pointer style not showing."
lang: en
translationKey: "ubuntu-apps-firefox"
slug: firefox
track: ubuntu
stage: apps
order: 3
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/firefox.md
aiTranslated: true
---
Install Firefox with apt rather than the snap version. The snap build can run into compatibility problems, for example the Sogou Pinyin input method not working, or the mouse pointer style not showing.

Note that even if you installed Firefox through apt, unless you do as below, after an Ubuntu or system update the apt version may still be replaced by the snap version automatically.

## Backup tip

- If you are using the snap version of Firefox, go into the `~/snap` directory, find your Firefox profile folder (e.g. `gvgfc0ni.default-release`), and compress it as a backup.
- If you are using the apt version of Firefox, find the matching profile folder under `~/.mozilla/firefox` and back it up.

## Installation method

You can follow the web page linked below and install it per the tutorial there, or just use my short steps:

1. Remove snap (Note: removing snap may affect the packages you installed through snap, such as vlc, mysql workbench, etc., so decide whether to remove it based on your own situation. I have never tried removing snap entirely, so weigh it yourself.)

    ```bash
    sudo snap remove --purge snapd
    sudo apt remove --autoremove snapd
    ```

2. Stop apt from installing snap automatically again later.

    ```bash
    sudo -H gedit /etc/apt/preferences.d/nosnap.pref
    ```

    Add the following to the file and save (-10 means installation is forbidden):

    ```bash
    Package: snapd
    Pin: release a=*
    Pin-Priority: -10
    ```

3. Install Firefox through apt

    ```bash
    sudo apt update
    sudo add-apt-repository ppa:mozillateam/ppa
    sudo apt update
    sudo apt install -t 'o=LP-PPA-mozillateam' firefox
    ```

## Reference links

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/apt_firefox/Completely%20Remove%20Snap%20from%20Ubuntu%20Linux%20%5BTutorial%5D.html" data-title="Remove Snap from Ubuntu" data-origin="https://www.debugpoint.com/remove-snap-ubuntu/">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://www.debugpoint.com/remove-snap-ubuntu/" rel="noopener" target="_blank">Remove Snap from Ubuntu</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/apt_firefox/Completely%20Remove%20Snap%20from%20Ubuntu%20Linux%20%5BTutorial%5D.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">Local snapshot of someone else's page, copyright stays with the original author; the archive does not run the scripts inside.</p>
  <div class="archive-viewer__body"></div>
</figure>
