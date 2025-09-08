"use client"

import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useWeb3, ProductStatus } from "../contexts/Web3Context.jsx"
import { ethers } from "ethers"

const TrackProduct = () => {
  const [searchParams] = useSearchParams()
  const [productId, setProductId] = useState(searchParams.get("id") || "")
  const [trackingData, setTrackingData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { getProduct, verifyProduct } = useWeb3()

  const handleSearch = async () => {
    if (!productId.trim()) return

    setIsLoading(true)
    try {
      const id = Number.parseInt(productId)
      if (isNaN(id)) {
        return
      }

      const [product, verification] = await Promise.all([getProduct(id), verifyProduct(id)])

      if (product && verification) {
        setTrackingData({
          id: id,
          name: product.name,
          batchNumber: product.batchNumber,
          manufacturer: product.manufacturer,
          currentOwner: product.currentOwner,
          status: product.status,
          isAuthentic: product.isAuthentic,
          price: ethers.utils.formatEther(product.price),
          manufacturingDate: new Date(product.manufacturingDate * 1000).toISOString(),
        })
      } else {
        setTrackingData(null)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setTrackingData(null)
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

  return (
    <div className="page-content">
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Track Product</h2>
          <p className="card-description">Enter a product ID to track its journey through the supply chain</p>
        </div>

        <div className="card-content">
          <div className="flex gap-4">
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter product ID (e.g., 1, 2, 3...)"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Searching...
                </>
              ) : (
                "🔍 Track Product"
              )}
            </button>
          </div>
        </div>
      </div>

      {trackingData && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="card-title">Product Details</h2>
              <div className={`status-badge ${trackingData.isAuthentic ? "authentic-badge" : "counterfeit-badge"}`}>
                {trackingData.isAuthentic ? "✅ Authentic" : "❌ Counterfeit"}
              </div>
            </div>
          </div>

          <div className="card-content">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div>
                <h4 className="font-semibold" style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                  Product Name
                </h4>
                <p className="font-semibold">{trackingData.name}</p>
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                  Batch Number
                </h4>
                <p className="font-mono">{trackingData.batchNumber}</p>
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                  Current Status
                </h4>
                <span className={`status-badge ${getStatusClass(trackingData.status)}`}>
                  {getStatusName(trackingData.status)}
                </span>
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                  Price
                </h4>
                <p className="font-mono">{trackingData.price} ETH</p>
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                  Manufacturer
                </h4>
                <p className="font-mono text-sm">{trackingData.manufacturer}</p>
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                  Current Owner
                </h4>
                <p className="font-mono text-sm">{trackingData.currentOwner}</p>
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                  Manufacturing Date
                </h4>
                <p>{new Date(trackingData.manufacturingDate).toLocaleString()}</p>
              </div>
            </div>

            <div className="card" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div className="card-content">
                <h3 className="font-semibold mb-4">Supply Chain Timeline</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "12px", height: "12px", background: "#3b82f6", borderRadius: "50%" }}></div>
                    <div>
                      <p className="font-semibold">Manufacturing Started</p>
                      <p className="text-sm" style={{ color: "#64748b" }}>
                        Product manufactured by {trackingData.manufacturer.slice(0, 10)}...
                      </p>
                      <p className="text-xs" style={{ color: "#64748b" }}>
                        {new Date(trackingData.manufacturingDate).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {trackingData.status > ProductStatus.Manufactured && (
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: "12px", height: "12px", background: "#10b981", borderRadius: "50%" }}></div>
                      <div>
                        <p className="font-semibold">Current Status: {getStatusName(trackingData.status)}</p>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                          Currently owned by {trackingData.currentOwner.slice(0, 10)}...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!trackingData && !isLoading && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No Product Selected</h3>
          <p>Enter a product ID to view tracking information.</p>
        </div>
      )}
    </div>
  )
}

export default TrackProduct
