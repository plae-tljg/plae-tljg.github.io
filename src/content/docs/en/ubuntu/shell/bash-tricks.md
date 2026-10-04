---
title: "Bash Tricks"
summary: "Ubuntu's default Tab completion stops after showing the common prefix, unlike other terminals (such as PuTTY, Arch Linux) that can cycle through options. Solution:"
lang: en
translationKey: "ubuntu-shell-bash-tricks"
slug: bash-tricks
track: ubuntu
stage: shell
order: 2
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/utils/common_cmd/bash_tricks.md
aiTranslated: true
---
## Enhance Terminal Tab Completion

Ubuntu's default Tab completion stops after showing the common prefix, unlike other terminals (such as PuTTY, Arch Linux) that can cycle through options. Solution:

### Basic Configuration

Add to `~/.bashrc`:

```bash
bind '"\t":menu-complete'
```

After enabling, pressing Tab cycles through all matches instead of just showing the common prefix.

### Show All Matches

If you want to display all possible matches before cycling, add:

```bash
bind "set show-all-if-ambiguous on"
```

This way, when there are multiple matches, all possible completions are shown first, then you can cycle through them with Tab.

### Apply Configuration

After adding, you need to:
1. Run `source ~/.bashrc` to take effect immediately, or
2. Log in again

## Modular Environment Variable Management

Split `.bashrc` into multiple module files for easier management:

<!--code:title=Environment Variable File Example · /lib/bash/bash_env_vars_example.sh collapse-->
```bash
#!/usr/bin/env bash
# ~/.bash_env_vars
# Example environment variable configuration file

# Alias definitions
alias python_serve="python -m http.server"
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# System related
export SYSTEM_USER_LIB=/usr/local/lib

# Java configuration
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Python related
export PYENV=$HOME/.pyenv/bin

# Node.js related
export NODE_JS=$HOME/.local/node/bin

# PATH configuration
export PATH=$HOME/.local/bin:$PYENV:$NODE_JS:$PATH

# LD_LIBRARY_PATH configuration
export LD_LIBRARY_PATH=$HOME/.local/lib:$SYSTEM_USER_LIB:$LD_LIBRARY_PATH
```

Load in `~/.bashrc`:

<!--code:title=.bashrc Loading Example · /lib/bash/bashrc_loading_example.sh-->
```bash
# ~/.bashrc modular loading example

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

## Python Module Completion

Provide Tab completion for `python -m`:

<!--code:title=Python Module Completion Script · /lib/bash/python_module_completion.sh collapse-->
```bash
_python_module_completion() {
  local cur prev base_dir prefix
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"

  # Check if after -m argument
  local has_m=0
  for ((i=1; i<COMP_CWORD; i++)); do
    if [[ "${COMP_WORDS[i]}" == "-m" ]]; then
      has_m=1
      break
    fi
  done

  # If not after -m, use default completion
  if [[ $has_m -eq 0 ]]; then
    # Use default filename completion
    _filedir
    return 0
  fi

  # Only complete after -m
  if [[ "$prev" != "-m" ]]; then
    return 0
  fi

  # Split module path, base_dir is parent directory, prefix is current completion prefix
  if [[ "$cur" == *.* ]]; then
    base_dir="${cur%.*}"
    prefix="${cur##*.}"
    search_dir="${base_dir//./\/}"
  else
    base_dir=""
    prefix="$cur"
    search_dir="."
  fi

  # Find all directories and .py files in current directory (excluding __init__.py)
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

  # Join module paths and complete
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

# Use -o default option to preserve default completion behavior
complete -F _python_module_completion -o default python python3
```

Load in `~/.bashrc`:
```bash
if [ -f ~/.python_module_completion.sh ]; then
    source ~/.python_module_completion.sh
fi
```

## Difference Between Source and Dot Command

- `source script.sh` and `. script.sh`: execute in current shell, environment variables take effect
- `./script.sh`: execute in subshell, environment variables don't affect current shell

**Key Difference**:
- `. script.sh` - dot followed by **space**, is a command
- `./script.sh` - dot followed by **slash**, is a path

**Typical Use Cases**:
- Activate virtual environment: `source venv/bin/activate` or `. venv/bin/activate`
- Load configuration: `source ~/.bash_env_vars`
- Run standalone script: `./backup.sh` (doesn't affect current environment)