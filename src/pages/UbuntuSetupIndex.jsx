import './UbuntuSetup.css'

function UbuntuSetupIndex() {
  return (
    <div className="ubuntu-setup-page">
      <div className="container">
        <article className="ubuntu-setup-content">
          <header className="page-header">
            <h1 className="page-title">Testing</h1>
            <p className="page-subtitle">Ubuntu 系统配置指南目录</p>
          </header>

          <section className="content-section">
            <h2>欢迎</h2>
            <p>这是 Ubuntu 设置指南的索引页面。你可以在这里找到各种配置和安装指南。</p>
          </section>

          <section className="content-section">
            <h2>快速链接</h2>
            <ul>
              <li><a href="/ubuntu_setup">完整设置指南</a></li>
              <li>系统更新和基础工具安装</li>
              <li>开发环境配置</li>
              <li>Docker 和容器化工具</li>
            </ul>
          </section>

          <section className="content-section">
            <h2>开始使用</h2>
            <p>点击上面的链接查看完整的 Ubuntu 设置指南，或者浏览下面的各个部分。</p>
          </section>
        </article>
      </div>
    </div>
  )
}

export default UbuntuSetupIndex

