"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useWeb3, UserRole } from "../contexts/Web3Context.jsx"

const RegisterUser = () => {
  const { isConnected, currentUser, registerUser } = useWeb3()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    role: "",
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
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.role) {
      newErrors.role = "Role is required"
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
      await registerUser(formData.name, Number.parseInt(formData.role))
      navigate("/")
    } catch (error) {
      console.error("Registration failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔗</div>
        <h3>Connect Your Wallet</h3>
        <p>Please connect your wallet to register as a user.</p>
      </div>
    )
  }

  if (currentUser && currentUser.role !== UserRole.None) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">✅</div>
        <h3>Already Registered</h3>
        <p>
          You are already registered as a user.
          {currentUser.isVerified ? " Your account is verified." : " Waiting for verification."}
        </p>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div className="card-header text-center">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👤</div>
          <h2 className="card-title">Register User</h2>
          <p className="card-description">Register your account to participate in the supply chain network</p>
        </div>

        <div className="card-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" className="form-select" value={formData.role} onChange={handleInputChange}>
                <option value="">Select your role</option>
                <option value={UserRole.Manufacturer}>Manufacturer</option>
                <option value={UserRole.Distributor}>Distributor</option>
                <option value={UserRole.Retailer}>Retailer</option>
                <option value={UserRole.Consumer}>Consumer</option>
              </select>
              {errors.role && <div className="form-error">{errors.role}</div>}
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
                      Verification Required
                    </h4>
                    <p className="text-sm" style={{ color: "#92400e" }}>
                      After registration, your account will need to be verified by the contract owner before you can
                      perform role-specific actions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Registering...
                </>
              ) : (
                "👤 Register User"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterUser
