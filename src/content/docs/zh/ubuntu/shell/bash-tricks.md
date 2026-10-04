---
title: "Bash 技巧"
summary: "Ubuntu 终端默认的 Tab 补全会显示公共前缀后停止，不像其他终端（如 PuTTY、Arch Linux）可以循环选择。解决方法："
lang: zh
translationKey: "ubuntu-shell-bash-tricks"
slug: bash-tricks
track: ubuntu
stage: shell
order: 2
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/utils/common_cmd/bash_tricks.md
---
## 增强终端 Tab 补全

Ubuntu 终端默认的 Tab 补全会显示公共前缀后停止，不像其他终端（如 PuTTY、Arch Linux）可以循环选择。解决方法：

### 基础配置

在 `~/.bashrc` 中添加：

```bash
bind '"\t":menu-complete'
```

启用后，按 Tab 键会循环选择所有匹配项，而不是只显示公共前缀。

### 显示所有匹配项

如果想在循环前先显示所有可能的匹配项列表，可以添加：

```bash
bind "set show-all-if-ambiguous on"
```

这样当有多个匹配时，会先显示所有可能的补全列表，然后可以通过 Tab 键循环选择。

### 应用配置

添加后需要：
1. 运行 `source ~/.bashrc` 立即生效，或
2. 重新登录

## 模块化环境变量管理

将 `.bashrc` 拆分为多个模块文件，便于管理：

<!--code:title=环境变量文件示例 · /lib/bash/bash_env_vars_example.sh collapse-->
```bash
#!/usr/bin/env bash
# ~/.bash_env_vars
# 示例环境变量配置文件

# 别名定义
alias python_serve="python -m http.server"
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# 系统相关
export SYSTEM_USER_LIB=/usr/local/lib

# Java 配置
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Python 相关
export PYENV=$HOME/.pyenv/bin

# Node.js 相关
export NODE_JS=$HOME/.local/node/bin

# PATH 配置
export PATH=$HOME/.local/bin:$PYENV:$NODE_JS:$PATH

# LD_LIBRARY_PATH 配置
export LD_LIBRARY_PATH=$HOME/.local/lib:$SYSTEM_USER_LIB:$LD_LIBRARY_PATH
```

在 `~/.bashrc` 中加载：

<!--code:title=.bashrc 加载示例 · /lib/bash/bashrc_loading_example.sh-->
```bash
# ~/.bashrc 中的模块化加载示例

# Load custom environment variables
if [ -f ~/.bash_env_vars ]; then
    . ~/.bash_env_vars
fi

# Load aliases
if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# Load Python module completion
if [ -f ~/.python_module_completion.sh ]; then
    source ~/.python_module_completion.sh
fi

# Load custom functions
if [ -f ~/.bash_functions ]; then
    . ~/.bash_functions
fi
```

## Python 模块补全

为 `python -m` 提供 Tab 补全功能：

<!--code:title=Python 模块补全脚本 · /lib/bash/python_module_completion.sh collapse-->
```bash
_python_module_completion() {
  local cur prev base_dir prefix
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"

  # 检查是否在 -m 参数后
  local has_m=0
  for ((i=1; i<COMP_CWORD; i++)); do
    if [[ "${COMP_WORDS[i]}" == "-m" ]]; then
      has_m=1
      break
    fi
  done

  # 如果不在 -m 参数后，使用默认补全
  if [[ $has_m -eq 0 ]]; then
    # 使用默认的文件名补全
    _filedir
    return 0
  fi

  # 只在 -m 后面补全
  if [[ "$prev" != "-m" ]]; then
    return 0
  fi

  # 分割模块路径，base_dir 是父目录，prefix 是当前补全前缀
  if [[ "$cur" == *.* ]]; then
    base_dir="${cur%.*}"
    prefix="${cur##*.}"
    search_dir="${base_dir//./\/}"
  else
    base_dir=""
    prefix="$cur"
    search_dir="."
  fi

  # 查找当前目录下的所有目录和 .py 文件（不含 __init__.py）
  local candidates=()
  if [[ -d "$search_dir" ]]; then
    while IFS= read -r entry; do
      if [[ -d "$search_dir/$entry" ]]; then
        candidates+=("$entry")
      elif [[ -f "$search_dir/$entry" && "$entry" == *.py && "$entry" != "__init__.py" ]]; then
        candidates+=("${entry%.py}")
      fi
    done < <(ls "$search_dir")
  fi

  # 拼接模块路径并补全
  local results=()
  for c in "${candidates[@]}"; do
    if [[ "$c" == "$prefix"* ]]; then
      if [[ -n "$base_dir" ]]; then
        results+=("$base_dir.$c")
      else
        results+=("$c")
      fi
    fi
  done

  COMPREPLY=( $(compgen -W "${results[*]}" -- "$cur") )
  compopt -o nospace
}

# 使用 -o default 选项来保持默认补全行为
complete -F _python_module_completion -o default python python3
```

在 `~/.bashrc` 中加载：
```bash
if [ -f ~/.python_module_completion.sh ]; then
    source ~/.python_module_completion.sh
fi
```

## Source 和点命令的区别

- `source script.sh` 和 `. script.sh`：在当前 shell 执行，环境变量会生效
- `./script.sh`：在子 shell 执行，环境变量不会影响当前 shell

**关键区别**：
- `. script.sh` - 点后面有**空格**，是命令
- `./script.sh` - 点后面是**斜杠**，是路径

**典型用途**：
- 激活虚拟环境：`source venv/bin/activate` 或 `. venv/bin/activate`
- 加载配置：`source ~/.bash_env_vars`
- 执行独立脚本：`./backup.sh`（不影响当前环境）

---

> **延伸阅读**：[Ubuntu 的 Tab 补全不如 PuTTY](/zh/writing/tinkering-bash-completion/)——同一件事的来龙去脉，收在《折腾笔记》里。
