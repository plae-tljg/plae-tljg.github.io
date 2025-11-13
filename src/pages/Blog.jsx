import { Link } from 'react-router-dom'
import './Blog.css'
import { getAllPosts } from '../data/blogData'

function Blog() {
  const posts = getAllPosts()

  return (
    <div className="blog-page">
      <div className="container">
        <h1 className="page-title">博客文章</h1>
        <div className="posts-list">
          {posts.map(post => (
            <article key={post.id} className="blog-post-item">
              <div className="post-header">
                <h2 className="post-title">
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </h2>
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
              </div>
              <p className="post-excerpt">{post.excerpt}</p>
              <Link to={`/blog/${post.id}`} className="read-more">
                阅读全文 →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Blog

