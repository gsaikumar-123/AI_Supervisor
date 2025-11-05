import { Link, useLocation } from 'react-router-dom'

const NavLink = ({ to, label }) => {
  const { pathname } = useLocation()
  const isActive = pathname === to
  return (
    <Link
      to={to}
      className={[
        'inline-flex items-center px-3 h-10 text-sm font-medium border-b-2 transition-colors',
        isActive ? 'text-indigo-700 border-indigo-600' : 'text-gray-700 border-transparent hover:text-indigo-700 hover:border-indigo-300'
      ].join(' ')}
    >
      {label}
    </Link>
  )
}

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-xl font-semibold text-indigo-700">AI Supervisor</div>
              <nav className="flex gap-2">
                <NavLink to="/" label="Test Call" />
                <NavLink to="/supervisor" label="Supervisor" />
                <NavLink to="/caller" label="Caller" />
                <NavLink to="/learned" label="Learned" />
              </nav>
            </div>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout
