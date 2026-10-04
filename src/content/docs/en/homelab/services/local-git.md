---
title: "Using Git on a Local Machine and LAN Server"
summary: "Git is a distributed version control system that does not depend on platforms such as GitHub or GitLab. You can use Git on your local machine, on a server inside your LAN, or on any server that supports Git."
lang: en
translationKey: "homelab-services-local-git"
slug: local-git
track: homelab
stage: services
order: 5
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/git/local_git_server.md
aiTranslated: true
---
Git is a distributed version control system, **it does not depend on platforms such as GitHub or GitLab**. You can use Git on your local machine, on a server inside your LAN, or on any server that supports Git.

## Core Concepts

Git supports several protocols and methods:
- **Local path** (`/path/to/repo`)
- **SSH** (`ssh://user@host/path` or `user@host:path`)
- **HTTP/HTTPS** (`https://server/path`)
- **Git protocol** (`git://server/path`)

### Bare Repository vs Regular Repository

**Important note:** Git repositories come in two types:

1. **Bare repository**: no working directory, contains only the Git history, typically used server-side
2. **Regular repository (working repository)**: has a working directory, contains your project files

**Key point:** Both types of repositories can be cloned! You do not need to create a bare repository to use it as a server. A regular Git repository (one with a working directory) can also be cloned from other machines.

## Test Case 1: Local Git Server

This test case shows how to:
1. Create a local Git server repository
2. Clone from the local server
3. Make changes
4. Push back to the local server

### Step 1: Set up a local Git server repository

```bash
# 创建 Git 服务器仓库目录
mkdir -p ~/git-server
cd ~/git-server

# 创建裸仓库（bare repository，服务器端仓库）
git init --bare myproject.git
```

### Step 2: Clone the repository (just like cloning from GitHub)

```bash
# 进入工作目录
cd ~/

# 从本地"服务器"克隆
git clone ~/git-server/myproject.git myproject-local
cd myproject-local
```

### Step 3: Make changes and commit

```bash
# 创建测试文件
echo "Hello from my local Git server!" > README.md
echo "This proves Git works without GitHub" >> README.md

# 添加并提交更改
git add README.md
git commit -m "Initial commit: Add README with test message"
```

### Step 4: Push changes back to the local server

```bash
# 推送到本地 Git 服务器仓库
git push origin master  # 或 'main'，取决于默认分支
```

### Step 5: Verify - clone from the local server again

```bash
# 创建另一个克隆以验证推送成功
cd ~/
git clone ~/git-server/myproject.git myproject-verify
cd myproject-verify

# 检查内容
cat README.md
```

**Expected output:**
```
Hello from my local Git server!
This proves Git works without GitHub
```

## Test Case 1.5: Cloning from a Regular Git Repository (not a bare repository)

This test case shows: **you do not need a bare repository; a regular Git repository can be cloned too!**

### Step 1: Create a regular Git repository (with a working directory)

```bash
# 在机器 A 上创建一个普通项目
cd ~/
mkdir myproject
cd myproject

# 初始化普通 Git 仓库（不是 bare）
git init

# 创建一些文件
echo "Hello from regular Git repo!" > README.md
echo "This is a working directory" >> README.md

# 提交
git add README.md
git commit -m "Initial commit"
```

### Step 2: Clone this regular repository from another machine

**On machine B (or a different location on the same machine):**

```bash
# 方法 1：如果通过 SSH 访问
git clone user@machine-a:~/myproject

# 方法 2：如果通过共享文件夹访问
git clone /path/to/shared/myproject

# 方法 3：如果通过本地路径访问（同一机器）
git clone ~/myproject myproject-clone
```

### Step 3: Verify the clone succeeded

```bash
cd myproject-clone  # 或 myproject（取决于你使用的命令）
cat README.md
```

**Expected output:**
```
Hello from regular Git repo!
This is a working directory
```

### Step 4: Modify and push back to the original repository

```bash
# 在克隆的仓库中修改
echo "Modified from clone" > newfile.txt
git add newfile.txt
git commit -m "Add file from clone"
git push origin master  # 或 main
```

### Differences between a bare and a regular repository

| Feature | Bare Repository | Regular Repository |
|------|----------------|----------------|
| Working directory | ❌ No | ✅ Yes |
| Edit files directly | ❌ No | ✅ Yes |
| Can be cloned | ✅ Yes | ✅ Yes |
| Suitable as a server | ✅ Recommended | ✅ Yes, it works too |
| Use case | A dedicated Git server | A project under development |

**Which one to use when?**

- **Bare repository**: when you want a dedicated "server" repository and do not plan to work in it directly
- **Regular repository**: when you are already working on a project and want others to be able to clone it too

**Important note:** Both approaches work! Which one you pick depends on your use case.

## Test Case 2: Git between VMs on a LAN

### Step 1: Set up a Git repository on the VM (192.0.2.10)

**On the VM, there are two ways:**

**Option A: Create a bare repository (recommended for a dedicated server)**
```bash
# 创建 Git 仓库目录
mkdir -p ~/git-repos
cd ~/git-repos

# 创建裸仓库
git init --bare finance_web_app.git

# 应该看到类似输出：
# Initialized empty Git repository in /home/lkm/git-repos/finance_web_app.git/
```

**Option B: Use a regular Git repository (if you are already working on the project)**
```bash
# 如果你已经有一个项目目录
cd ~/Pictures/finance_web_app  # 或你的项目目录

# 如果还没有初始化为 Git 仓库
git init

# 如果已经是 Git 仓库，直接使用即可
# 这个普通仓库也可以被克隆！
```

### Step 2: Verify the repository exists on the VM

```bash
# 在 VM 上：
ls -la ~/git-repos/finance_web_app.git
# 应该显示 Git 仓库文件，如 HEAD, config, objects/, refs/ 等
```

### Step 3: Clone from the local machine (using the correct SSH syntax)

**On your local machine:**

**If you use a bare repository (Option A):**
```bash
# 方法 1：标准 SSH 语法（推荐）
git clone user@192.0.2.10:git-repos/finance_web_app.git

# 方法 2：完整 SSH URL 语法
git clone ssh://user@192.0.2.10/home/lkm/git-repos/finance_web_app.git

# 方法 3：克隆到指定目录名
git clone user@192.0.2.10:git-repos/finance_web_app.git my-finance-web-app
```

**If you use a regular repository (Option B):**
```bash
# 克隆普通仓库（注意路径，不需要 .git 后缀）
git clone user@192.0.2.10:Pictures/finance_web_app

# 或使用完整路径
git clone ssh://user@192.0.2.10/home/lkm/Pictures/finance_web_app

# 克隆到指定目录名
git clone user@192.0.2.10:Pictures/finance_web_app my-finance-web-app
```

**Important notes:**
- A bare repository usually ends with `.git`, and you must include `.git` when cloning
- A regular repository is the project directory name; no `.git` suffix is needed when cloning
- Both approaches work fine!

### Step 4: Full workflow test

```bash
# 克隆成功后：
cd finance_web_app  # 或你的克隆目录名

# 创建测试文件
echo "This is a test file from local machine" > test.txt
echo "Current date: $(date)" >> test.txt

# 提交并推回 VM
git add test.txt
git commit -m "Add test file from local machine"
git push origin master  # 或 'main'，取决于默认分支
```

### Step 5: Verify on the VM

```bash
# 在 VM 上：
cd ~/git-repos/finance_web_app.git
# 检查提交是否到达：
git log --oneline -1
# 应该显示你最近的提交
```

## Common Troubleshooting

### 1. If you get "repository does not exist"

```bash
# 检查 VM 上的确切路径：
ssh user@192.0.2.10 "ls -la ~/git-repos"

# 确保使用正确的路径格式：
# 错误：user@192.0.2.10/Pictures/finance_web_app
# 正确：user@192.0.2.10:git-repos/finance_web_app.git
```

**Important notes:**
- The SSH format uses a colon `:` rather than a slash `/` to separate host and path
- The path is relative to the user's home directory, unless you use the `ssh://` protocol with an absolute path
- Git repositories usually end with `.git` (the convention for bare repositories)

### 2. If you get SSH permission denied

```bash
# 设置 SSH 密钥（可选但推荐）：
ssh-keygen -t rsa -b 4096  # 在本地机器上
ssh-copy-id user@192.0.2.10  # 将公钥复制到 VM
```

### 3. About bare repositories vs regular repositories

**Important clarification:** You do **not** need a bare repository to be able to clone it! Regular Git repositories can be cloned too.

```bash
# 如果你有一个普通 Git 仓库，直接克隆即可：
git clone user@192.0.2.10:Pictures/finance_web_app

# 不需要转换为 bare repository
```

**When to use a bare repository?**
- When you want a dedicated "server" repository and do not plan to edit files in it directly
- When you want a clearer server/client separation

**When to use a regular repository?**
- When you are already working on a project and want others to be able to clone it too
- When you also want to be able to edit files directly on the server side

**Both approaches work!** Which one you pick depends on your use case.

### 4. Check network connectivity

```bash
# 在本地机器上：
ping 192.0.2.10
ssh user@192.0.2.10 "echo 'SSH connection works'"
```

## Other Ways to Use It

### Option A: Use a shared network folder (if the VM shares a folder)

```bash
# 首先，确保 VM 共享了文件夹，然后：
git clone /path/to/shared/folder/git-repos/finance_web_app.git
```

### Option B: Set up an HTTP server on the VM (for testing)

```bash
# 在 VM 上：
cd ~/git-repos/finance_web_app.git
git update-server-info
# 然后临时提供 HTTP 服务：
python3 -m http.server 8000 --directory .

# 在本地机器上：
git clone http://192.0.2.10:8000

## Key Takeaways

1. **No GitHub needed**: Git works completely independently of platforms like GitHub, GitLab, or Bitbucket

2. **Any protocol works**: Git supports several protocols (local, SSH, HTTP/HTTPS, Git protocol)

3. **Full workflow**: You can run the complete Git workflow (clone, commit, push, pull) on any Git server

4. **Self-hosting options**: You can host your own Git server in any of these places:
   - A local machine (as in the examples above)
   - A home server
   - A VPS (DigitalOcean, Linode, etc.)
   - A company-internal server

## Practical Use Cases

### Examples of self-hosted Git solutions:

- **GitLab CE/EE**: run a full GitLab instance on your own server
- **Gitea**: a lightweight self-hosted Git service
- **Gogs**: another lightweight option
- **Bare Git repositories**: as in the examples above, managed manually
- **Enterprise solutions**: GitHub Enterprise, GitLab Enterprise, Bitbucket Server

## Summary

Git's core features work completely independently of any particular hosting platform. GitHub is just one of many possible remote repositories you can use with Git!

Through the test cases above, you can prove that Git works normally on a local machine, on a LAN, or on any server that supports Git, without relying on any third-party Git hosting service.

```
