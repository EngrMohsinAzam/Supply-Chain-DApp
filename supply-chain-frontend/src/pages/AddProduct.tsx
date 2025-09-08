"use client"

import { useState } from "react"
import { useWeb3, UserRole } from "../contexts/Web3Context.jsx"

const AddProduct = () => {
  const { isConnected, currentUser, registerProduct } = useWeb3()
  const [formData, setFormData] = useState({
    name: "",
    batchNumber: "",
    price: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }

    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = "Batch number is required"
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required"
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Price must be a valid positive number"
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
      await registerProduct(formData.name, formData.batchNumber, formData.price)
      // Reset form
      setFormData({
        name: "",
        batchNumber: "",
        price: "",
      })
    } catch (error) {
      console.error("Error adding product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔗</div>
        <h3>Connect Your Wallet</h3>
        <p>Please connect your wallet to add products.</p>
      </div>
    )
  }

  if (!currentUser || currentUser.role !== UserRole.Manufacturer || !currentUser.isVerified) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🚫</div>
        <h3>Access Denied</h3>
        <p>Only verified manufacturers can add products to the supply chain.</p>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="card-header">
          <h2 className="card-title">Add New Product</h2>
          <p className="card-description">Register a new product in the supply chain system</p>
        </div>

        <div className="card-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleInputChange}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Batch Number</label>
              <input
                type="text"
                name="batchNumber"
                className="form-input"
                placeholder="Enter batch number"
                value={formData.batchNumber}
                onChange={handleInputChange}
              />
              {errors.batchNumber && <div className="form-error">{errors.batchNumber}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Price (ETH)</label>
              <input
                type="text"
                name="price"
                className="form-input"
                placeholder="Enter price in ETH (e.g., 0.1)"
                value={formData.price}
                onChange={handleInputChange}
              />
              {errors.price && <div className="form-error">{errors.price}</div>}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFormData({ name: "", batchNumber: "", price: "" })}
              >
                Reset
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Adding Product...
                  </>
                ) : (
                  "➕ Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct
