import './About.css'

function About() {
  return (
    <div className="about-page">
      <div className="container">
        <div className="about-content">
          <h1 className="page-title">关于我</h1>
          <div className="about-section">
            <h2>简介</h2>
            <p>
              欢迎来到我的个人博客！这里主要分享我在技术学习过程中的心得体会、
              项目经验以及一些有趣的技术知识。
            </p>
          </div>
          <div className="about-section">
            <h2>技能</h2>
            <ul>
              <li>前端开发：React, Vue, JavaScript, TypeScript</li>
              <li>后端开发：Node.js, Python</li>
              <li>其他：Git, Linux, 系统运维</li>
            </ul>
          </div>
          <div className="about-section">
            <h2>联系方式</h2>
            <p>
              你可以通过以下方式联系我：
            </p>
            <ul>
              <li>
                GitHub: <a href="https://github.com/plae-tljg" target="_blank" rel="noopener noreferrer">plae-tljg</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

