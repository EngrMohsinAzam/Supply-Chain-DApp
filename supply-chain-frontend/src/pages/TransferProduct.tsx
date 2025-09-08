"use client"

import { useState, useEffect } from "react"
import { useWeb3, UserRole } from "../contexts/Web3Context.jsx"

const TransferProduct = () => {
  const { isConnected, currentUser, transferProduct, getProduct, getUserInfo } = useWeb3()
  const [formData, setFormData] = useState({
    productId: "",
    toAddress: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [productInfo, setProductInfo] = useState(null)
  const [recipientInfo, setRecipientInfo] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Load product info when product ID changes
  useEffect(() => {
    if (formData.productId) {
      loadProductInfo(formData.productId)
    } else {
      setProductInfo(null)
    }
  }, [formData.productId])

  // Load recipient info when address changes
  useEffect(() => {
    if (formData.toAddress && formData.toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      loadRecipientInfo(formData.toAddress)
    } else {
      setRecipientInfo(null)
    }
  }, [formData.toAddress])

  const loadProductInfo = async (productId) => {
    try {
      const id = Number.parseInt(productId)
      if (isNaN(id)) return

      const product = await getProduct(id)
      setProductInfo(product)
    } catch (error) {
      setProductInfo(null)
    }
  }

  const loadRecipientInfo = async (address) => {
    try {
      const user = await getUserInfo(address)
      setRecipientInfo(user)
    } catch (error) {
      setRecipientInfo(null)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.productId.trim()) {
      newErrors.productId = "Product ID is required"
    } else if (isNaN(Number.parseInt(formData.productId)) || Number.parseInt(formData.productId) <= 0) {
      newErrors.productId = "Product ID must be a positive number"
    }

    if (!formData.toAddress.trim()) {
      newErrors.toAddress = "Recipient address is required"
    } else if (!formData.toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      newErrors.toAddress = "Invalid Ethereum address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await transferProduct(Number.parseInt(formData.productId), formData.toAddress)
      // Reset form
      setFormData({
        productId: "",
        toAddress: "",
      })
      setProductInfo(null)
      setRecipientInfo(null)
    } catch (error) {
      console.error("Transfer failed:", error)
    } finally {
      setIsSubmitting(false)
    }
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
        return "Unknown"
    }
  }

  if (!isConnected) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔗</div>
        <h3>Connect Your Wallet</h3>
        <p>Please connect your wallet to transfer products.</p>
      </div>
    )
  }

  if (!currentUser || !currentUser.isVerified) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🚫</div>
        <h3>Access Denied</h3>
        <p>Only verified users can transfer products.</p>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="card" style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div className="card-header">
          <h2 className="card-title">Transfer Product</h2>
          <p className="card-description">
            Transfer ownership of a product to another verified user in the supply chain
          </p>
        </div>

        <div className="card-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Product ID</label>
              <input
                type="number"
                name="productId"
                className="form-input"
                placeholder="Enter product ID"
                value={formData.productId}
                onChange={handleInputChange}
              />
              {errors.productId && <div className="form-error">{errors.productId}</div>}

              {productInfo && (
                <div className="card mt-4" style={{ background: "#dbeafe", border: "1px solid #3b82f6" }}>
                  <div className="card-content">
                    <h4 className="font-semibold" style={{ color: "#1e40af", marginBottom: "0.5rem" }}>
                      📦 Product Information
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      <p className="text-sm" style={{ color: "#1e40af" }}>
                        <strong>Name:</strong> {productInfo.name}
                      </p>
                      <p className="text-sm" style={{ color: "#1e40af" }}>
                        <strong>Batch:</strong> {productInfo.batchNumber}
                      </p>
                      <p className="text-sm font-mono" style={{ color: "#1e40af" }}>
                        <strong>Current Owner:</strong> {productInfo.currentOwner.slice(0, 10)}...
                      </p>
                      <p className="text-sm" style={{ color: "#1e40af" }}>
                        <strong>Authentic:</strong> {productInfo.isAuthentic ? "✅ Yes" : "❌ No"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Recipient Address</label>
              <input
                type="text"
                name="toAddress"
                className="form-input"
                placeholder="0x..."
                value={formData.toAddress}
                onChange={handleInputChange}
              />
              {errors.toAddress && <div className="form-error">{errors.toAddress}</div>}

              {recipientInfo && (
                <div className="card mt-4" style={{ background: "#d1fae5", border: "1px solid #10b981" }}>
                  <div className="card-content">
                    <h4 className="font-semibold" style={{ color: "#065f46", marginBottom: "0.5rem" }}>
                      👤 Recipient Information
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      <p className="text-sm" style={{ color: "#065f46" }}>
                        <strong>Name:</strong> {recipientInfo.name || "Unknown"}
                      </p>
                      <p className="text-sm" style={{ color: "#065f46" }}>
                        <strong>Role:</strong> {getRoleName(recipientInfo.role)}
                      </p>
                      <p className="text-sm" style={{ color: "#065f46" }}>
                        <strong>Status:</strong> {recipientInfo.isVerified ? "✅ Verified" : "⚠️ Not Verified"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="card"
              style={{ background: "#fef3c7", border: "1px solid #f59e0b", marginBottom: "1.5rem" }}
            >
              <div className="card-content">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <div>
                    <h4 className="font-semibold" style={{ color: "#92400e" }}>
                      Transfer Requirements
                    </h4>
                    <ul className="text-sm" style={{ color: "#92400e", marginTop: "0.5rem", paddingLeft: "1rem" }}>
                      <li>• You must be the current owner of the product</li>
                      <li>• The recipient must be a verified user</li>
                      <li>• The transfer will update the product status based on recipient role</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setFormData({ productId: "", toAddress: "" })
                  setProductInfo(null)
                  setRecipientInfo(null)
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !productInfo || !recipientInfo?.isVerified}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Transferring...
                  </>
                ) : (
                  "🔄 Transfer Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TransferProduct
