import { useParams, Link } from 'react-router-dom'
import './BlogPost.css'
import { getPostById } from '../data/blogData'

function BlogPost() {
  const { id } = useParams()
  const post = getPostById(id)

  if (!post) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <h1>文章未找到</h1>
          <Link to="/blog" className="btn">返回博客列表</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-post-page">
      <div className="container">
        <Link to="/blog" className="back-link">← 返回博客列表</Link>
        
        <article className="blog-post">
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
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
          </header>

          <div className="post-content">
            {post.content ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <div className="post-placeholder">
                <p>这篇文章的内容正在编写中...</p>
                <p>请稍后再来查看。</p>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}

export default BlogPost

