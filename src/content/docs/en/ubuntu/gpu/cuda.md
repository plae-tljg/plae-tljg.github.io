---
title: "NVIDIA GPU and CUDA setup"
summary: "Downloading and installing the driver straight from NVIDIA is usually more reliable than Ubuntu’s automatic install."
lang: en
translationKey: "ubuntu-gpu-cuda"
slug: cuda
track: ubuntu
stage: gpu
order: 1
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/gpu/cuda.md
aiTranslated: true
---
## NVIDIA GPU Driver Installation

### Recommended Installation Method

Download and install the driver directly from the NVIDIA official website, which is usually more reliable than Ubuntu's automatic installation.

1. Visit the [NVIDIA Driver Download Page](https://www.nvidia.com/en-us/drivers) to find the driver version suitable for your GPU. For example, for a `5060Ti` GPU, you need the `580` series driver (such as `580.76`).

2. Download and run the installer:

```bash
chmod +x NVIDIA-Linux-x86_64-580.76.05.run
sudo ./NVIDIA-Linux-x86_64-580.76.05.run  # Select MIT option
sudo reboot
nvidia-smi  # Verify installation
```

### Notes

In some cases, using `sudo ubuntu-drivers autoinstall` may fail to correctly install the driver, causing `nvidia-smi` to fail to detect the device. If you encounter issues, it is recommended to use the official installer.
## Installing the CUDA Toolkit

To use a GPU for AI computation, you need the CUDA Toolkit installed.

### Compatibility notes

There are compatibility requirements between driver versions and CUDA Toolkit versions. Check the compatibility table:
- [CUDA Toolkit Release Notes](https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/index.html)
- [Stack Overflow - CUDA version and compute capability compatibility](https://stackoverflow.com/questions/28932864/which-compute-capability-is-supported-by-which-cuda-versions/28933055#28933055)

For driver versions `>=580`, you need a CUDA version of `>=13.0` (only `13.0` is available right now).

### Official installation guide

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/CUDA%20Installation%20Guide%20for%20Linux%20%E2%80%94%20Installation%20Guide%20for%20Linux%2013.0%20documentation.html" data-title="Official CUDA Installation Guide for Linux" data-origin="https://docs.nvidia.com/cuda/cuda-installation-guide-linux/">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://docs.nvidia.com/cuda/cuda-installation-guide-linux/" rel="noopener" target="_blank">Official CUDA Installation Guide for Linux</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/cuda/CUDA%20Installation%20Guide%20for%20Linux%20%E2%80%94%20Installation%20Guide%20for%20Linux%2013.0%20documentation.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">A local snapshot of someone else's page; the copyright belongs to the original author. The archive does not execute any scripts on the page.</p>
  <div class="archive-viewer__body"></div>
</figure>

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/CUDA%20Toolkit%2013.0%20-%20Release%20Notes%20%E2%80%94%20Release%20Notes%2013.0%20documentation.html" data-title="Official CUDA Release Note" data-origin="https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/index.html">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/index.html" rel="noopener" target="_blank">Official CUDA Release Note</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/cuda/CUDA%20Toolkit%2013.0%20-%20Release%20Notes%20%E2%80%94%20Release%20Notes%2013.0%20documentation.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">A local snapshot of someone else's page; the copyright belongs to the original author. The archive does not execute any scripts on the page.</p>
  <div class="archive-viewer__body"></div>
</figure>

### Installation steps (using CUDA 13.0 as the example)

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

### Verifying the installation

```bash
nvcc --version
```

### Environment variable configuration

Add the following to `~/.bashrc`:

```bash
export PATH=/usr/local/cuda/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
```

Then reload the configuration:

```bash
source ~/.bashrc
```

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/CUDA%20Toolkit%2013.0%20Downloads%20_%20NVIDIA%20Developer.html" data-title="CUDA Download and Installation" data-origin="https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=22.04&target_type=deb_local">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=22.04&target_type=deb_local" rel="noopener" target="_blank">CUDA Download and Installation</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/cuda/CUDA%20Toolkit%2013.0%20Downloads%20_%20NVIDIA%20Developer.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">A local snapshot of someone else's page; the copyright belongs to the original author. The archive does not execute any scripts on the page.</p>
  <div class="archive-viewer__body"></div>
</figure>
## CUDA Installation Test

### Watch the GPU in real time

Run this in one terminal:

```bash
watch -n .5 nvidia-smi
```

### Test with PyTorch

Create a virtual environment and install the dependencies:

```bash
python3.10 -m venv test_env
source ./test_env/bin/activate
pip3 install torch torchvision
pip install transformers
# 安装其他可能缺失的依赖
```

> Note: PyTorch and CUDA versions have to match. Before installing, check the [official PyTorch installation guide](https://pytorch.org/get-started/locally/)

Simple test:

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

A more complete test (QWEN3):

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

## Driver Problems After a Kernel Update

### What the problem looks like

After the system kernel updates (say, from `6.8.0-85` to `6.8.0-87`), the NVIDIA driver may stop working.

**Symptoms:**

1. `nvidia-smi` fails and reports that it cannot talk to the NVIDIA driver
2. Running `sudo modprobe nvidia` says the module was not found
3. The new kernel directory is there under `/lib/modules/`, but the NVIDIA driver modules are missing

**How to check:**

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

### The fix

**Reinstall the driver**, so that it is built against the current kernel:

```bash
# 重新运行 NVIDIA 驱动安装程序
sudo ./NVIDIA-Linux-x86_64-580.76.05.run
sudo reboot
```

> This is really a common problem, and it has nothing to do with the iGPU setup — the driver simply has to be recompiled for every new kernel.

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/cuda/What's%20the%20process%20for%20fixing%20NVIDIA%20drivers%20after%20kernel%20updates%20in%20Ubuntu%2020.04%20-%20Graphics%20_%20Linux%20_%20Linux%20-%20NVIDIA%20Developer%20Forums.html" data-title="What's the process for fixing NVIDIA drivers after kernel updates in Ubuntu 20.04" data-origin="https://forums.developer.nvidia.com/t/whats-the-process-for-fixing-nvidia-drivers-after-kernel-updates-in-ubuntu-20-04/208870/3">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://forums.developer.nvidia.com/t/whats-the-process-for-fixing-nvidia-drivers-after-kernel-updates-in-ubuntu-20-04/208870/3" rel="noopener" target="_blank">What's the process for fixing NVIDIA drivers after kernel updates in Ubuntu 20.04</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand the archive</button>
      <a href="/archives/ubuntu-setup/assets/cuda/What's%20the%20process%20for%20fixing%20NVIDIA%20drivers%20after%20kernel%20updates%20in%20Ubuntu%2020.04%20-%20Graphics%20_%20Linux%20_%20Linux%20-%20NVIDIA%20Developer%20Forums.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">A local snapshot of somebody else's page, copyright stays with the original author; the archive does not run any script inside it.</p>
  <div class="archive-viewer__body"></div>
</figure>

## Earlier Notes

If you hit iGPU trouble before, see the [older iGPU write-up](/zh/docs/ubuntu/gpu/igpu-postmortem/).

---

> **Further reading**: [The driver is installed, but nothing renders](/zh/writing/nvidia-drivers/) — the whole story of the same thing, collected in the tinkering notes.
