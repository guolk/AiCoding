import { NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        📚 Research Reader
      </NavLink>
      <ul className="navbar-nav">
        <li>
          <NavLink to="/" className={`nav-link ${isActive('/')}`}>
            文献库
          </NavLink>
        </li>
        <li>
          <NavLink to="/annotations" className={`nav-link ${isActive('/annotations')}`}>
            批注管理
          </NavLink>
        </li>
        <li>
          <NavLink to="/stats" className={`nav-link ${isActive('/stats')}`}>
            阅读统计
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
