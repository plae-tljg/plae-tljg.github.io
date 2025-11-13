import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <nav className="nav">
            <Link to="/" className="logo">
              LKM
            </Link>
            <ul className="nav-links">
              <li>
                <Link 
                  to="/" 
                  className={location.pathname === '/' ? 'active' : ''}
                >
                  首页
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className={location.pathname.startsWith('/blog') ? 'active' : ''}
                >
                  博客
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main">
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} LKM. All rights reserved.</p>
          <p className="footer-links">
            <a href="https://github.com/plae-tljg" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout

