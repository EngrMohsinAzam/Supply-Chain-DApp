"use client"

import { useState, useEffect } from "react"
import { useWeb3, UserRole } from "../contexts/Web3Context.jsx"

const VerifyUsers = () => {
  const { isConnected, currentUser, contract, account } = useWeb3()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [isVerifying, setIsVerifying] = useState({})

  useEffect(() => {
    if (isConnected && contract) {
      loadUsers()
    }
  }, [isConnected, contract])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // Get all UserRegistered events from the contract
      const filter = contract.filters.UserRegistered()
      const events = await contract.queryFilter(filter, 0, "latest")

      const userPromises = events.map(async (event) => {
        const userAddress = event.args.user
        try {
          const userInfo = await contract.getUser(userAddress)
          return {
            address: userAddress,
            name: userInfo.name,
            role: userInfo.role,
            isVerified: userInfo.isVerified,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
          }
        } catch (error) {
          console.error(`Error fetching user ${userAddress}:`, error)
          return null
        }
      })

      const userResults = await Promise.all(userPromises)
      const validUsers = userResults.filter(Boolean)

      // Sort by block number (newest first)
      validUsers.sort((a, b) => b.blockNumber - a.blockNumber)

      setUsers(validUsers)
    } catch (error) {
      console.error("Error loading users:", error)
      showToast("Failed to load users", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyUser = async (userAddress) => {
    if (!contract) return

    setIsVerifying((prev) => ({ ...prev, [userAddress]: true }))
    try {
      const tx = await contract.verifyUser(userAddress)
      await tx.wait()

      showToast("User verified successfully!", "success")

      // Reload users to update the list
      await loadUsers()
    } catch (error) {
      console.error("Error verifying user:", error)
      showToast(error.reason || "Failed to verify user", "error")
    } finally {
      setIsVerifying((prev) => ({ ...prev, [userAddress]: false }))
    }
  }

  const showToast = (message, type = "success") => {
    const toast = document.createElement("div")
    toast.className = `toast ${type}`
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span>${type === "success" ? "✅" : "❌"}</span>
        <span>${message}</span>
      </div>
    `

    let container = document.querySelector(".toast-container")
    if (!container) {
      container = document.createElement("div")
      container.className = "toast-container"
      document.body.appendChild(container)
    }

    container.appendChild(toast)

    setTimeout(() => {
      toast.remove()
    }, 5000)
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

  const getRoleColor = (role) => {
    switch (role) {
      case UserRole.Manufacturer:
        return "bg-blue-100 text-blue-800"
      case UserRole.Distributor:
        return "bg-purple-100 text-purple-800"
      case UserRole.Retailer:
        return "bg-orange-100 text-orange-800"
      case UserRole.Consumer:
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const checkIsOwner = async () => {
    if (!contract || !account) return false
    try {
      const owner = await contract.owner()
      return owner.toLowerCase() === account.toLowerCase()
    } catch (error) {
      return false
    }
  }

  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const checkOwnership = async () => {
      const ownerStatus = await checkIsOwner()
      setIsOwner(ownerStatus)
    }

    if (contract && account) {
      checkOwnership()
    }
  }, [contract, account])

  // Filter users based on search and filter criteria
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "" || user.role.toString() === filterRole

    const matchesStatus =
      filterStatus === "" ||
      (filterStatus === "verified" && user.isVerified) ||
      (filterStatus === "unverified" && !user.isVerified)

    return matchesSearch && matchesRole && matchesStatus
  })

  if (!isConnected) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔗</div>
        <h3>Connect Your Wallet</h3>
        <p>Please connect your wallet to verify users.</p>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🚫</div>
        <h3>Access Denied</h3>
        <p>Only the contract owner can verify users.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading users from blockchain...</p>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="card mb-6">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="card-title">User Verification</h2>
              <p className="card-description">
                Verify registered users to allow them to participate in the supply chain
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-semibold">{users.length}</span> Total Users
              </div>
              <div className="text-sm">
                <span className="font-semibold text-green-600">{users.filter((u) => u.isVerified).length}</span>{" "}
                Verified
              </div>
              <div className="text-sm">
                <span className="font-semibold text-orange-600">{users.filter((u) => !u.isVerified).length}</span>{" "}
                Pending
              </div>
            </div>
          </div>
        </div>

        <div className="card-content">
          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <select className="form-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="">All Roles</option>
                <option value={UserRole.Manufacturer}>Manufacturer</option>
                <option value={UserRole.Distributor}>Distributor</option>
                <option value={UserRole.Retailer}>Retailer</option>
                <option value={UserRole.Consumer}>Consumer</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Pending Verification</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No Users Found</h3>
              <p>{users.length === 0 ? "No users have registered yet." : "No users match your search criteria."}</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.address}>
                      <td>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm font-mono text-gray-500">
                            {user.address.slice(0, 10)}...{user.address.slice(-8)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getRoleColor(user.role)}`}>{getRoleName(user.role)}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span
                            className={`status-badge ${
                              user.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.isVerified ? "✅ Verified" : "⏳ Pending"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div>Block #{user.blockNumber}</div>
                          <div className="text-xs font-mono text-gray-500">{user.transactionHash.slice(0, 10)}...</div>
                        </div>
                      </td>
                      <td>
                        {!user.isVerified ? (
                          <button
                            onClick={() => verifyUser(user.address)}
                            disabled={isVerifying[user.address]}
                            className="btn btn-primary text-sm"
                          >
                            {isVerifying[user.address] ? (
                              <>
                                <div className="spinner" style={{ width: "16px", height: "16px" }}></div>
                                Verifying...
                              </>
                            ) : (
                              "✅ Verify User"
                            )}
                          </button>
                        ) : (
                          <span className="text-sm text-green-600 font-medium">✅ Already Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content text-center">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
            <h3 className="font-bold text-2xl">{users.length}</h3>
            <p className="text-sm text-gray-600">Total Registered</p>
          </div>
        </div>

        <div className="card">
          <div className="card-content text-center">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
            <h3 className="font-bold text-2xl text-green-600">{users.filter((u) => u.isVerified).length}</h3>
            <p className="text-sm text-gray-600">Verified Users</p>
          </div>
        </div>

        <div className="card">
          <div className="card-content text-center">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
            <h3 className="font-bold text-2xl text-orange-600">{users.filter((u) => !u.isVerified).length}</h3>
            <p className="text-sm text-gray-600">Pending Verification</p>
          </div>
        </div>

        <div className="card">
          <div className="card-content text-center">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏭</div>
            <h3 className="font-bold text-2xl text-blue-600">
              {users.filter((u) => u.role === UserRole.Manufacturer).length}
            </h3>
            <p className="text-sm text-gray-600">Manufacturers</p>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title">Role Distribution</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { role: UserRole.Manufacturer, name: "Manufacturers", icon: "🏭", color: "blue" },
              { role: UserRole.Distributor, name: "Distributors", icon: "🚚", color: "purple" },
              { role: UserRole.Retailer, name: "Retailers", icon: "🏪", color: "orange" },
              { role: UserRole.Consumer, name: "Consumers", icon: "👤", color: "green" },
            ].map(({ role, name, icon, color }) => {
              const count = users.filter((u) => u.role === role).length
              const verified = users.filter((u) => u.role === role && u.isVerified).length
              const percentage = count > 0 ? Math.round((verified / count) * 100) : 0

              return (
                <div key={role} className="text-center p-4 border rounded-lg">
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
                  <h4 className="font-semibold">{name}</h4>
                  <p className="text-2xl font-bold" style={{ color: `var(--${color}-600, #3b82f6)` }}>
                    {count}
                  </p>
                  <p className="text-sm text-gray-600">
                    {verified}/{count} verified ({percentage}%)
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full bg-${color}-500`}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor:
                          color === "blue"
                            ? "#3b82f6"
                            : color === "purple"
                              ? "#8b5cf6"
                              : color === "orange"
                                ? "#f97316"
                                : "#10b981",
                      }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyUsers
