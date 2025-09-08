"use client"

import { Link, useLocation } from "react-router-dom"

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const navigation = [
    {
      section: "Main",
      items: [
        { name: "Dashboard", href: "/", icon: "📊" },
        { name: "All Products", href: "/products", icon: "📦" },
        { name: "Track Product", href: "/track", icon: "🔍" },
      ],
    },
    {
      section: "Actions",
      items: [
        { name: "Add Product", href: "/add-product", icon: "➕" },
        { name: "Transfer Product", href: "/transfer", icon: "🔄" },
        { name: "Register User", href: "/register", icon: "👤" },
      ],
    },
    {
      section: "Management",
      items: [
        { name: "Verify Users", href: "/verify-users", icon: "✅" },
        { name: "Analytics", href: "/analytics", icon: "📈" },
        { name: "Reports", href: "/reports", icon: "📋" },
      ],
    },
  ]

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">🔗</div>
          <span>SupplyChain</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((section) => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${location.pathname === item.href ? "active" : ""}`}
                onClick={() => window.innerWidth <= 768 && onClose()}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
