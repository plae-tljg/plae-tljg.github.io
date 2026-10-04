---
title: "Old iGPU problems (postmortem)"
summary: "> Note: The material below describes a problem I hit earlier; it has since been resolved. This file is kept for historical reference."
lang: en
translationKey: "ubuntu-gpu-igpu-postmortem"
slug: igpu-postmortem
track: ubuntu
stage: gpu
order: 2
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/gpu/old_igpu_problems.md
aiTranslated: true
---
> Note: The material below describes a problem I hit earlier; it has since been resolved. This file is kept for historical reference.

## Earlier iGPU usage problems

### Background

I wanted to use the CPU's integrated graphics (iGPU) for display output instead of the dedicated GPU, so I simply unplugged the DP cable from the 4060 and plugged it into the motherboard's DP port. That may have caused the problem?

### Checking whether the integrated graphics work

```bash
# 检查集成显卡是否在工作（虽然物理上我们已经知道不是 GPU 在工作）
lspci -k | grep -EA3 'VGA|3D|Display'
lspci | egrep 'VGA|3D'
```

Output you might see:

```bash
00:02.0 VGA compatible controller: Intel Corporation HD Graphics 620 (rev 02)
        Subsystem: Dell HD Graphics 620
        Kernel driver in use: i915
        Kernel modules: i915
```

Check whether the GPU is connected properly:

```bash
sudo apt install mesa-utils
glxinfo | grep -E "OpenGL vendor|OpenGL renderer"
```

You should see:

```bash
OpenGL vendor string: NVIDIA Corporation
OpenGL renderer string: GeForce GTX 1650/PCIe/SSE2
```

### The earlier attempt

The AI suggested using:

```bash
sudo nano /etc/modprobe.d/blacklist-nouveau.conf
```

Add these lines to the file:

```bash
blacklist nouveau
options nouveau modeset=0
```

Update initramfs and reboot:

```bash
sudo update-initramfs -u
sudo reboot now
```

### Attempting to fix the problem

Run:

```bash
sudo apt purge '*nvidia*'
sudo apt purge '*cuda*'
sudo apt-get purge nvidia*
reboot now
sudo ubuntu-drivers autoinstall
reboot now
nvidia-smi
```

`nvidia-smi` shows:

```bash
NVIDIA-SMI has failed because it couldn't communicate with the NVIDIA driver. Make sure that the latest NVIDIA driver is installed and running.
```

## Reference material for iGPU display and GPU computing

Below is the reference material I used for "iGPU display rendering and GPU computing". The method in the first reference has been tested and works.

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/use_integrated_graphics/Use%20integrated%20graphics%20for%20display%20and%20NVIDIA%20GPU%20for%20CUDA%20on%20Ubuntu%2014.04.html" data-title="Use integrated graphics for display and NVIDIA GPU for CUDA on Ubuntu 14.04" data-origin="https://gist.github.com/alexlee-gk/76a409f62a53883971a18a11af93241b?permalink_comment_id=3102545">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://gist.github.com/alexlee-gk/76a409f62a53883971a18a11af93241b?permalink_comment_id=3102545" rel="noopener" target="_blank">Use integrated graphics for display and NVIDIA GPU for CUDA on Ubuntu 14.04</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/cuda/use_integrated_graphics/Use%20integrated%20graphics%20for%20display%20and%20NVIDIA%20GPU%20for%20CUDA%20on%20Ubuntu%2014.04.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">A local snapshot of someone else's page; copyright stays with the original author. The archive does not execute the scripts inside it.</p>
  <div class="archive-viewer__body"></div>
</figure>

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/use_integrated_graphics/osdf's%20log%20_%20Intel%20Integrated%20Graphics,%20dedicated%20GPU%20for%20CUDA%20and%20Ubuntu%2013.10%20and%2014.04.html" data-title="Intel Integrated Graphics, dedicated GPU for CUDA and Ubuntu 13.10 and 14.04" data-origin="https://osdf.github.io/blog/intel-integrated-graphics-dedicated-gpu-for-cuda-and-ubuntu-1310.html">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://osdf.github.io/blog/intel-integrated-graphics-dedicated-gpu-for-cuda-and-ubuntu-1310.html" rel="noopener" target="_blank">Intel Integrated Graphics, dedicated GPU for CUDA and Ubuntu 13.10 and 14.04</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/cuda/use_integrated_graphics/osdf's%20log%20_%20Intel%20Integrated%20Graphics,%20dedicated%20GPU%20for%20CUDA%20and%20Ubuntu%2013.10%20and%2014.04.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">A local snapshot of someone else's page; copyright stays with the original author. The archive does not execute the scripts inside it.</p>
  <div class="archive-viewer__body"></div>
</figure>

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/use_integrated_graphics/%5BSOLVED%5D%20Run%20CUDA%20on%20dedicated%20NVIDIA%20GPU%20while%20connecting%20monitors%20to%20Intel%20HD%20graphics,%20is%20this%20possible_%20-%20CUDA%20_%20CUDA%20Setup%20and%20Installation%20-%20NVIDIA%20Developer%20Forums.html" data-title="[SOLVED] Run CUDA on dedicated NVIDIA GPU while connecting monitors to Intel HD graphics, is this possible?" data-origin="https://forums.developer.nvidia.com/t/solved-run-cuda-on-dedicated-nvidia-gpu-while-connecting-monitors-to-intel-hd-graphics-is-this-possible/47690">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://forums.developer.nvidia.com/t/solved-run-cuda-on-dedicated-nvidia-gpu-while-connecting-monitors-to-intel-hd-graphics-is-this-possible/47690" rel="noopener" target="_blank">[SOLVED] Run CUDA on dedicated NVIDIA GPU while connecting monitors to Intel HD graphics, is this possible?</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/cuda/use_integrated_graphics/%5BSOLVED%5D%20Run%20CUDA%20on%20dedicated%20NVIDIA%20GPU%20while%20connecting%20monitors%20to%20Intel%20HD%20graphics,%20is%20this%20possible_%20-%20CUDA%20_%20CUDA%20Setup%20and%20Installation%20-%20NVIDIA%20Developer%20Forums.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">A local snapshot of someone else's page; copyright stays with the original author. The archive does not execute the scripts inside it.</p>
  <div class="archive-viewer__body"></div>
</figure>

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/use_integrated_graphics/drivers%20-%20How%20to%20configure%20iGPU%20for%20xserver%20and%20nvidia%20GPU%20for%20CUDA%20work%20-%20Ask%20Ubuntu.html" data-title="Ask Ubuntu - How to configure iGPU for xserver and nvidia GPU for CUDA work" data-origin="https://askubuntu.com/questions/1061551/how-to-configure-igpu-for-xserver-and-nvidia-gpu-for-cuda-work">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://askubuntu.com/questions/1061551/how-to-configure-igpu-for-xserver-and-nvidia-gpu-for-cuda-work" rel="noopener" target="_blank">Ask Ubuntu - How to configure iGPU for xserver and nvidia GPU for CUDA work</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/cuda/use_integrated_graphics/drivers%20-%20How%20to%20configure%20iGPU%20for%20xserver%20and%20nvidia%20GPU%20for%20CUDA%20work%20-%20Ask%20Ubuntu.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">A local snapshot of someone else's page; copyright stays with the original author. The archive does not execute the scripts inside it.</p>
  <div class="archive-viewer__body"></div>
</figure>

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/use_integrated_graphics/Using%20GPU%20for%20CUDA%20and%20integrated%20graphics%20for%20display%20-%20can't%20make%20it%20work%20-%20CUDA%20_%20CUDA%20Setup%20and%20Installation%20-%20NVIDIA%20Developer%20Forums.html" data-title="Using GPU for CUDA and integrated graphics for display - can't make it work " data-origin="https://forums.developer.nvidia.com/t/using-gpu-for-cuda-and-integrated-graphics-for-display-cant-make-it-work/49820">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://forums.developer.nvidia.com/t/using-gpu-for-cuda-and-integrated-graphics-for-display-cant-make-it-work/49820" rel="noopener" target="_blank">Using GPU for CUDA and integrated graphics for display - can't make it work </a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/cuda/use_integrated_graphics/Using%20GPU%20for%20CUDA%20and%20integrated%20graphics%20for%20display%20-%20can't%20make%20it%20work%20-%20CUDA%20_%20CUDA%20Setup%20and%20Installation%20-%20NVIDIA%20Developer%20Forums.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">A local snapshot of someone else's page; copyright stays with the original author. The archive does not execute the scripts inside it.</p>
  <div class="archive-viewer__body"></div>
</figure>

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/How%20to%20make%20desktop%20Ubuntu%20boot%20in%20headless%20mode_%20-%20Deep%20Learning%20-%20fast.ai%20Course%20Forums" data-title="Using GPU for CUDA and integrated graphics for display - can't make it work " data-origin="https://forums.fast.ai/t/how-to-make-desktop-ubuntu-boot-in-headless-mode/19582/4?replies_to_post_number=4">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://forums.fast.ai/t/how-to-make-desktop-ubuntu-boot-in-headless-mode/19582/4?replies_to_post_number=4" rel="noopener" target="_blank">Using GPU for CUDA and integrated graphics for display - can't make it work </a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/cuda/How%20to%20make%20desktop%20Ubuntu%20boot%20in%20headless%20mode_%20-%20Deep%20Learning%20-%20fast.ai%20Course%20Forums" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">A local snapshot of someone else's page; copyright stays with the original author. The archive does not execute the scripts inside it.</p>
  <div class="archive-viewer__body"></div>
</figure>

## Summary of the earlier problem

After installing with `--no-opengl-files`, `nvidia-smi` initially worked fine, but the same problem showed up a few weeks later.

In the end I had to plug the DP cable back into the GPU instead of the motherboard. Hopefully there will be no more problems.

![CUDA Fail Again](/ubuntu/cuda/cuda_fail_again.png)

```
          _————             +--------------------------------------+  
         //¯¯\\\\           |    _  _     _    _ _                 |  
        // _  _\\           |   | \| |_ _(_)__| (_)__ _            |  
        \|(0)(0)\           |   | .` \ V / / _` | / _` |_          |  
        d  n ¨  b           |   |_|\_|\_/|_\__,_|_\__,_( )         |  
         \_U_^  /           |                          |/          |  
         /   \_/|_____      |       Nvidia,                        |  
      ___\   |__/\    \_    |          Fuck you!                   |  
     /   |   / |:|      \   |   ___        _                   _   |  
    /    /  /\ |:|     | \  |  | __|  _ __| |__  _  _ ___ _  _| |  |  
   |    /\__/ \|:\     |  \ |  | _| || / _| / / | || / _ \ || |_|  |  
    \  /\   / ||: \    \  | |  |_| \_,_\__|_\_\  \_, \___/\_,_(_)  |  
     \/  \_/  ||: |     |  \|                    |__/              |  
     /     /  //; \     |  |+--------------------------------------+  
     \    /  /|;   \    |  \  
```

## Solution

The root cause of the problem was that the driver had not been compiled against the new kernel. This had nothing to do with the iGPU in the end.

The solution was to reinstall the driver so that it would be compiled against the current kernel.

---

> **Further reading**: [Drivers installed, but no rendering](/zh/writing/nvidia-drivers/) — the full story behind the same issue, collected in *Tinkering Notes*.
