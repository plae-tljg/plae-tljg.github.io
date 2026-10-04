---
title: "NVIDIA GPU 与 CUDA 环境配置"
summary: "直接从 NVIDIA 官网下载并安装驱动，通常比 Ubuntu 的自动安装更可靠。"
lang: zh
translationKey: "ubuntu-gpu-cuda"
slug: cuda
track: ubuntu
stage: gpu
order: 1
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/apps/gpu/cuda.md
---
## NVIDIA GPU 驱动安装

### 推荐安装方法

直接从 NVIDIA 官网下载并安装驱动，通常比 Ubuntu 的自动安装更可靠。

1. 访问 [NVIDIA 驱动下载页面](https://www.nvidia.com/en-us/drivers)，找到适合你 GPU 的驱动版本。例如，对于 `5060Ti` GPU，需要 `580` 系列驱动（如 `580.76`）。

2. 下载并运行安装程序：

```bash
chmod +x NVIDIA-Linux-x86_64-580.76.05.run
sudo ./NVIDIA-Linux-x86_64-580.76.05.run  # 选择 MIT 选项
sudo reboot
nvidia-smi  # 验证安装
```

### 注意事项

在某些情况下，使用 `sudo ubuntu-drivers autoinstall` 可能无法正确安装驱动，导致 `nvidia-smi` 无法检测到设备。如果遇到问题，建议使用官方安装程序。

## CUDA Toolkit 安装

要使用 GPU 进行 AI 计算，需要安装 CUDA Toolkit。

### 兼容性说明

驱动版本和 CUDA Toolkit 版本之间存在兼容性要求。查看兼容性表：
- [CUDA Toolkit 发布说明](https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/index.html)
- [Stack Overflow - CUDA 版本与计算能力兼容性](https://stackoverflow.com/questions/28932864/which-compute-capability-is-supported-by-which-cuda-versions/28933055#28933055)

对于驱动版本 `>=580`，需要使用 CUDA 版本 `>=13.0`（目前只有 `13.0` 可用）。

### 官方安装指南

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/CUDA%20Installation%20Guide%20for%20Linux%20%E2%80%94%20Installation%20Guide%20for%20Linux%2013.0%20documentation.html" data-title="Official CUDA Installation Guide for Linux" data-origin="https://docs.nvidia.com/cuda/cuda-installation-guide-linux/">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">第三方页面存档</span>
    <a href="https://docs.nvidia.com/cuda/cuda-installation-guide-linux/" rel="noopener" target="_blank">Official CUDA Installation Guide for Linux</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>展开存档</button>
      <a href="/archives/ubuntu-setup/assets/cuda/CUDA%20Installation%20Guide%20for%20Linux%20%E2%80%94%20Installation%20Guide%20for%20Linux%2013.0%20documentation.html" target="_blank" rel="noopener">新窗口</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">他人页面的本地快照，版权归原作者；存档不会执行其中的脚本。</p>
  <div class="archive-viewer__body"></div>
</figure>

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/CUDA%20Toolkit%2013.0%20-%20Release%20Notes%20%E2%80%94%20Release%20Notes%2013.0%20documentation.html" data-title="Official CUDA Release Note" data-origin="https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/index.html">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">第三方页面存档</span>
    <a href="https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/index.html" rel="noopener" target="_blank">Official CUDA Release Note</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>展开存档</button>
      <a href="/archives/ubuntu-setup/assets/cuda/CUDA%20Toolkit%2013.0%20-%20Release%20Notes%20%E2%80%94%20Release%20Notes%2013.0%20documentation.html" target="_blank" rel="noopener">新窗口</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">他人页面的本地快照，版权归原作者；存档不会执行其中的脚本。</p>
  <div class="archive-viewer__body"></div>
</figure>

### 安装步骤（以 CUDA 13.0 为例）

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
sudo mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600
wget https://developer.download.nvidia.com/compute/cuda/13.0.0/local_installers/cuda-repo-ubuntu2204-13-0-local_13.0.0-580.65.06-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu2204-13-0-local_13.0.0-580.65.06-1_amd64.deb
sudo cp /var/cuda-repo-ubuntu2204-13-0-local/cuda-*-keyring.gpg /usr/share/keyrings/
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-0
sudo reboot now
```

### 验证安装

```bash
nvcc --version
```

### 环境变量配置

将以下内容添加到 `~/.bashrc` 中：

```bash
export PATH=/usr/local/cuda/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
```

然后重新加载配置：

```bash
source ~/.bashrc
```

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/CUDA%20Toolkit%2013.0%20Downloads%20_%20NVIDIA%20Developer.html" data-title="CUDA Download and Installation" data-origin="https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=22.04&target_type=deb_local">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">第三方页面存档</span>
    <a href="https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=22.04&target_type=deb_local" rel="noopener" target="_blank">CUDA Download and Installation</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>展开存档</button>
      <a href="/archives/ubuntu-setup/assets/cuda/CUDA%20Toolkit%2013.0%20Downloads%20_%20NVIDIA%20Developer.html" target="_blank" rel="noopener">新窗口</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">他人页面的本地快照，版权归原作者；存档不会执行其中的脚本。</p>
  <div class="archive-viewer__body"></div>
</figure>

## CUDA 安装测试

### 实时监控 GPU

在一个终端中运行：

```bash
watch -n .5 nvidia-smi
```

### 使用 PyTorch 测试

创建虚拟环境并安装依赖：

```bash
python3.10 -m venv test_env
source ./test_env/bin/activate
pip3 install torch torchvision
pip install transformers
# 安装其他可能缺失的依赖
```

> 注意：PyTorch 与 CUDA 版本存在兼容性要求，安装前请查看 [PyTorch 官方安装指南](https://pytorch.org/get-started/locally/)

简单测试：

<!--code:title=Simple model · /lib/test_cuda/test_cuda_simple.py collapse-->
```python
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

def run_llm_test():
    print("\n--- Transformer LLM Test (Basic) ---")
    if not torch.cuda.is_available():
        print("CUDA is not available, cannot run LLM on GPU.")
        return

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    try:
        # Choose a small model for testing purposes
        model_name = "distilbert-base-uncased-finetuned-sst-2-english"
        print(f"Loading model: {model_name}...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name)

        # Move model to GPU
        model.to(device)
        print(f"Model moved to {device} successfully.")

        # Prepare a dummy input
        text = "This is a great movie!"
        inputs = tokenizer(text, return_tensors="pt").to(device)
        print(f"Input tensor moved to {device} successfully.")

        # Perform inference
        print("Performing inference...")
        with torch.no_grad():
            outputs = model(**inputs)
        logits = outputs.logits
        predicted_class_id = logits.argmax().item()
        print(f"Inference successful. Predicted class ID: {predicted_class_id}")
        print("Your CUDA setup is working for Transformers!")

    except Exception as e:
        print(f"Error during LLM test: {e}")
        print("This might indicate issues with model loading, memory, or specific CUDA/cuDNN versions.")

if __name__ == "__main__":
    # Ensure your virtual environment is active and PyTorch/Transformers are installed
    # Then run the check_cuda_installation() first
    #check_cuda_installation()
    run_llm_test()
```

更完整的测试（QWEN3）：

<!--code:title=QWEN3 · /lib/test_cuda/test_cuda_qwen.py collapse-->
```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen3-8B"

# load the tokenizer and the model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)

# prepare the model input
prompt = "Give me a short introduction to large language model."
messages = [
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=True # Switches between thinking and non-thinking modes. Default is True.
)
model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

# conduct text completion
generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=32768
)
output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist() 

# parsing thinking content
try:
    # rindex finding 151668 (</think>)
    index = len(output_ids) - output_ids[::-1].index(151668)
except ValueError:
    index = 0

thinking_content = tokenizer.decode(output_ids[:index], skip_special_tokens=True).strip("\n")
content = tokenizer.decode(output_ids[index:], skip_special_tokens=True).strip("\n")

print("thinking content:", thinking_content)
print("content:", content)
```

## 内核更新后驱动问题

### 问题描述

当系统内核更新后（例如从 `6.8.0-85` 升级到 `6.8.0-87`），NVIDIA 驱动可能无法正常工作。

**症状：**

1. `nvidia-smi` 失败，显示无法与 NVIDIA 驱动通信
2. 运行 `sudo modprobe nvidia` 时提示模块未找到
3. 在 `/lib/modules/` 中可以看到新内核目录，但缺少 NVIDIA 驱动模块

**检查方法：**

```bash
# 查看已安装的内核版本
ls /lib/modules

# 查看内核更新历史
zcat /var/log/apt/history.log.*.gz | grep -A5 -B5 "linux-image"

# 尝试加载驱动模块
sudo modprobe nvidia
sudo modprobe nvidia_modeset
sudo modprobe nvidia_drm
```

### 解决方案

**重新安装驱动**，使其针对当前内核进行编译：

```bash
# 重新运行 NVIDIA 驱动安装程序
sudo ./NVIDIA-Linux-x86_64-580.76.05.run
sudo reboot
```

> 这实际上是一个常见问题，与 iGPU 配置无关，而是因为驱动需要在每个新内核上重新编译。

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/What's%20the%20process%20for%20fixing%20NVIDIA%20drivers%20after%20kernel%20updates%20in%20Ubuntu%2020.04%20-%20Graphics%20_%20Linux%20_%20Linux%20-%20NVIDIA%20Developer%20Forums.html" data-title="What's the process for fixing NVIDIA drivers after kernel updates in Ubuntu 20.04" data-origin="https://forums.developer.nvidia.com/t/whats-the-process-for-fixing-nvidia-drivers-after-kernel-updates-in-ubuntu-20-04/208870/3">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">第三方页面存档</span>
    <a href="https://forums.developer.nvidia.com/t/whats-the-process-for-fixing-nvidia-drivers-after-kernel-updates-in-ubuntu-20-04/208870/3" rel="noopener" target="_blank">What's the process for fixing NVIDIA drivers after kernel updates in Ubuntu 20.04</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>展开存档</button>
      <a href="/archives/ubuntu-setup/assets/cuda/What's%20the%20process%20for%20fixing%20NVIDIA%20drivers%20after%20kernel%20updates%20in%20Ubuntu%2020.04%20-%20Graphics%20_%20Linux%20_%20Linux%20-%20NVIDIA%20Developer%20Forums.html" target="_blank" rel="noopener">新窗口</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">他人页面的本地快照，版权归原作者；存档不会执行其中的脚本。</p>
  <div class="archive-viewer__body"></div>
</figure>

## 历史问题参考

如果之前遇到过 iGPU 相关的问题，可以参考 [旧版 iGPU 问题记录](/zh/docs/ubuntu/gpu/igpu-postmortem/)。

---

> **延伸阅读**：[驱动装好了，但没有渲染](/zh/writing/nvidia-drivers/)——同一件事的来龙去脉，收在《折腾笔记》里。
