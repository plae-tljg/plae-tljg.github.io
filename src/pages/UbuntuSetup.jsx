import './UbuntuSetup.css'

function UbuntuSetup() {
  return (
    <div className="ubuntu-setup-page">
      <div className="container">
        <article className="ubuntu-setup-content">
          <header className="page-header">
            <h1 className="page-title">Ubuntu 设置指南</h1>
            <p className="page-subtitle">Ubuntu 系统配置和开发环境搭建</p>
          </header>

          <section className="content-section">
            <h2>系统更新</h2>
            <p>首先更新系统包列表和已安装的包：</p>
            <pre><code>sudo apt update
sudo apt upgrade -y</code></pre>
          </section>

          <section className="content-section">
            <h2>安装基础工具</h2>
            <p>安装常用的开发工具和实用程序：</p>
            <pre><code>sudo apt install -y \
  curl \
  wget \
  git \
  vim \
  build-essential \
  software-properties-common</code></pre>
          </section>

          <section className="content-section">
            <h2>安装 Node.js</h2>
            <p>使用 NodeSource 仓库安装最新版本的 Node.js：</p>
            <pre><code>curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs</code></pre>
            <p>验证安装：</p>
            <pre><code>node --version
npm --version</code></pre>
          </section>

          <section className="content-section">
            <h2>安装开发工具</h2>
            <h3>Visual Studio Code</h3>
            <pre><code>wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install -y code</code></pre>
          </section>

          <section className="content-section">
            <h2>配置 Git</h2>
            <p>设置 Git 用户信息：</p>
            <pre><code>git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"</code></pre>
            <p>生成 SSH 密钥：</p>
            <pre><code>ssh-keygen -t ed25519 -C "your.email@example.com"
cat ~/.ssh/id_ed25519.pub</code></pre>
          </section>

          <section className="content-section">
            <h2>Docker 安装</h2>
            <p>安装 Docker 和 Docker Compose：</p>
            <pre><code>sudo apt install -y ca-certificates gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin</code></pre>
            <p>将当前用户添加到 docker 组：</p>
            <pre><code>sudo usermod -aG docker $USER
newgrp docker</code></pre>
          </section>

          <section className="content-section">
            <h2>常用配置</h2>
            <h3>设置终端别名</h3>
            <p>编辑 <code>~/.bashrc</code> 添加常用别名：</p>
            <pre><code>alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'</code></pre>
          </section>

          <section className="content-section">
            <h2>总结</h2>
            <p>完成以上步骤后，你的 Ubuntu 系统应该已经配置好了基本的开发环境。可以根据具体需求继续安装其他工具和软件。</p>
          </section>
        </article>
      </div>
    </div>
  )
}

export default UbuntuSetup

