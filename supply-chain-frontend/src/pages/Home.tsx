"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useWeb3, ProductStatus } from "../contexts/Web3Context.jsx"
import { ethers } from "ethers"

const Home = () => {
  const { isConnected, getAllProducts } = useWeb3()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (isConnected) {
      loadProducts()
    }
  }, [isConnected])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const allProducts = await getAllProducts()
      setProducts(allProducts)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusName = (status) => {
    switch (status) {
      case ProductStatus.Manufactured:
        return "Manufactured"
      case ProductStatus.InTransit:
        return "In Transit"
      case ProductStatus.WithDistributor:
        return "With Distributor"
      case ProductStatus.WithRetailer:
        return "With Retailer"
      case ProductStatus.Sold:
        return "Sold"
      default:
        return "Unknown"
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case ProductStatus.Manufactured:
        return "status-manufactured"
      case ProductStatus.InTransit:
        return "status-intransit"
      case ProductStatus.WithDistributor:
        return "status-withdistributor"
      case ProductStatus.WithRetailer:
        return "status-withretailer"
      case ProductStatus.Sold:
        return "status-sold"
      default:
        return "status-manufactured"
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isConnected) {
    return (
      <div className="professional-home">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-icon">
              <div className="blockchain-icon">
                <div className="chain-link"></div>
                <div className="chain-link"></div>
                <div className="chain-link"></div>
              </div>
            </div>
            <h1 className="hero-title">
              Decentralized Supply Chain
              <span className="gradient-text">Management</span>
            </h1>
            <p className="hero-description">
              Secure, transparent, and immutable supply chain tracking powered by blockchain technology. Connect your
              wallet to start managing your supply chain operations.
            </p>
            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure & Immutable</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👁️</span>
                <span>Full Transparency</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Real-time Tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon manufacturing">📦</div>
            <h3>Product Registration</h3>
            <p>Register and track products from manufacturing to end consumer with complete transparency.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon logistics">🚚</div>
            <h3>Supply Chain Tracking</h3>
            <p>Monitor product movement through distributors, retailers, and final delivery in real-time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon verification">✅</div>
            <h3>Authenticity Verification</h3>
            <p>Verify product authenticity and prevent counterfeiting with blockchain-based verification.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon analytics">📊</div>
            <h3>Advanced Analytics</h3>
            <p>Get insights into your supply chain performance with comprehensive analytics and reporting.</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="professional-home">
        <div className="loading-section">
          <div className="loading-spinner-professional">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3>Loading Supply Chain Data</h3>
          <p>Fetching products from blockchain...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="professional-home">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">Supply Chain Dashboard</h1>
          <p className="dashboard-subtitle">
            Monitor and manage your supply chain operations with real-time blockchain data
          </p>
        </div>
        <Link to="/add-product" className="cta-button">
          <span className="cta-icon">➕</span>
          Add New Product
        </Link>
      </div>

      {/* Statistics Overview */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon-wrapper primary">
            <span className="stat-icon">📦</span>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{products.length}</h3>
            <p className="stat-label">Total Products</p>
            <div className="stat-trend positive">
              <span>↗️</span>
              <span>Active</span>
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon-wrapper success">
            <span className="stat-icon">✅</span>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{products.filter((p) => p.isAuthentic).length}</h3>
            <p className="stat-label">Authentic Products</p>
            <div className="stat-trend positive">
              <span>✨</span>
              <span>Verified</span>
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon-wrapper warning">
            <span className="stat-icon">🚚</span>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{products.filter((p) => p.status === ProductStatus.InTransit).length}</h3>
            <p className="stat-label">In Transit</p>
            <div className="stat-trend neutral">
              <span>🔄</span>
              <span>Moving</span>
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon-wrapper info">
            <span className="stat-icon">💰</span>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{products.filter((p) => p.status === ProductStatus.Sold).length}</h3>
            <p className="stat-label">Sold Products</p>
            <div className="stat-trend positive">
              <span>📈</span>
              <span>Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Product Inventory</h2>
            <p className="section-subtitle">Live blockchain data of all registered products</p>
          </div>
          <div className="section-actions">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search products or batch numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state-professional">
            <div className="empty-icon">📦</div>
            <h3>No Products Found</h3>
            <p>
              {products.length === 0
                ? "Start by registering your first product in the supply chain."
                : "No products match your search criteria. Try adjusting your search terms."}
            </p>
            {products.length === 0 && (
              <Link to="/add-product" className="empty-cta-button">
                <span>➕</span>
                Register First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.slice(0, 8).map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-header">
                  <div className="product-id">#{product.id}</div>
                  <div className={`product-status ${getStatusClass(product.status)}`}>
                    {getStatusName(product.status)}
                  </div>
                </div>
                <div className="product-content">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-details">
                    <div className="product-detail">
                      <span className="detail-label">Batch:</span>
                      <span className="detail-value">{product.batchNumber}</span>
                    </div>
                    <div className="product-detail">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value">{ethers.utils.formatEther(product.price)} ETH</span>
                    </div>
                    <div className="product-detail">
                      <span className="detail-label">Owner:</span>
                      <span className="detail-value address">{product.currentOwner.slice(0, 8)}...</span>
                    </div>
                  </div>
                  <div className="product-authenticity">
                    <span className={`authenticity-badge ${product.isAuthentic ? "authentic" : "counterfeit"}`}>
                      {product.isAuthentic ? "✅ Authentic" : "❌ Counterfeit"}
                    </span>
                  </div>
                </div>
                <div className="product-footer">
                  <div className="product-date">{new Date(product.manufacturingDate * 1000).toLocaleDateString()}</div>
                  <Link to={`/track?id=${product.id}`} className="track-button">
                    <span>🔍</span>
                    Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length > 8 && (
          <div className="view-all-section">
            <Link to="/products" className="view-all-button">
              View All Products ({filteredProducts.length})<span>→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
