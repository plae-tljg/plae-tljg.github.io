import { Link } from 'react-router-dom'
import './Home.css'
import { getRecentPosts } from '../data/blogData'

function Home() {
  const recentPosts = getRecentPosts(3)

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">欢迎来到我的博客</h1>
          <p className="hero-subtitle">
            分享技术知识、学习心得和生活感悟
          </p>
          <Link to="/blog" className="btn">
            查看博客
          </Link>
        </div>
      </section>

      <section className="recent-posts">
        <div className="container">
          <h2 className="section-title">最新文章</h2>
          <div className="posts-grid">
            {recentPosts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-meta">
                  <span className="post-date">{post.date}</span>
                  {post.tags && post.tags.length > 0 && (
                    <span className="post-tag">{post.tags[0]}</span>
                  )}
                </div>
                <h3 className="post-title">
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="post-excerpt">{post.excerpt}</p>
                <Link to={`/blog/${post.id}`} className="post-link">
                  阅读更多 →
                </Link>
              </article>
            ))}
          </div>
          <div className="view-all">
            <Link to="/blog" className="btn btn-secondary">
              查看所有文章
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

