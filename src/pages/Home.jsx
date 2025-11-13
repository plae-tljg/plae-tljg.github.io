import { Link } from 'react-router-dom'
import './Home.css'
import { getAllPosts } from '../data/blogData'

function Home() {
  const posts = getAllPosts()

  return (
    <div className="home">
      <section className="recent-posts">
        <div className="container">
          <h1 className="page-title">博客</h1>
          <div className="posts-grid">
            {posts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-meta">
                  <span className="post-date">{post.date}</span>
                  {post.tags && post.tags.length > 0 && (
                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="post-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <h2 className="post-title">
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </h2>
                <p className="post-excerpt">{post.excerpt}</p>
                <Link to={`/blog/${post.id}`} className="post-link">
                  阅读更多 →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

