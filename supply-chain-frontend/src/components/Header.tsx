"use client"

import { useWeb3, UserRole } from "../contexts/Web3Context.jsx"

const Header = ({ title, onToggleSidebar }) => {
  const { account, isConnected, connectWallet, disconnectWallet, isLoading, currentUser } = useWeb3()

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getRoleName = (role) => {
    switch (role) {
      case UserRole.Manufacturer:
        return "Manufacturer"
      case UserRole.Distributor:
        return "Distributor"
      case UserRole.Retailer:
        return "Retailer"
      case UserRole.Consumer:
        return "Consumer"
      default:
        return "Unregistered"
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case UserRole.Manufacturer:
        return "role-manufacturer"
      case UserRole.Distributor:
        return "role-distributor"
      case UserRole.Retailer:
        return "role-retailer"
      case UserRole.Consumer:
        return "role-consumer"
      default:
        return "role-unregistered"
    }
  }

  return (
    <header className="professional-header">
      <div className="header-left">
        <button className="sidebar-toggle-professional" onClick={onToggleSidebar}>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </button>
        <div className="page-title-section">
          <h1 className="page-title-professional">{title}</h1>
          <div className="breadcrumb">
            <span>Supply Chain</span>
            <span className="breadcrumb-separator">›</span>
            <span>{title}</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {isConnected ? (
          <div className="wallet-section-professional">
            <div className="wallet-info-card">
              <div className="wallet-avatar">
                <div className="avatar-icon">👤</div>
                <div className="connection-indicator"></div>
              </div>
              <div className="wallet-details">
                <div className="wallet-address-professional">
                  <span className="address-label">Wallet</span>
                  <span className="address-value">{formatAddress(account)}</span>
                </div>
                {currentUser && (
                  <div className="user-role-section">
                    <span className={`role-badge ${getRoleColor(currentUser.role)}`}>
                      {getRoleName(currentUser.role)}
                    </span>
                    <span className={`verification-status ${currentUser.isVerified ? "verified" : "unverified"}`}>
                      {currentUser.isVerified ? "✓ Verified" : "⚠ Pending"}
                    </span>
                  </div>
                )}
              </div>
              <button className="disconnect-button-professional" onClick={disconnectWallet}>
                <span className="disconnect-icon">🔌</span>
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        ) : (
          <button className="connect-wallet-professional" onClick={connectWallet} disabled={isLoading}>
            {isLoading ? (
              <div className="connect-loading">
                <div className="connect-spinner"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="connect-content">
                <span className="wallet-icon">👛</span>
                <span>Connect Wallet</span>
                <div className="connect-glow"></div>
              </div>
            )}
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
