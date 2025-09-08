"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ethers } from "ethers"
import detectEthereumProvider from "@metamask/detect-provider"
import SupplyChainTrackerABI from "../contracts/SupplyChainTracker.json"

// Contract configuration - Update with your deployed contract address
const CONTRACT_ADDRESS = "0xB96649CE478aF1A8dc7cA3D237Fc845E17A86d99" // Replace with your actual deployed contract address
const CONTRACT_ABI = SupplyChainTrackerABI.abi

// Enums matching the smart contract
export const ProductStatus = {
  Manufactured: 0,
  InTransit: 1,
  WithDistributor: 2,
  WithRetailer: 3,
  Sold: 4,
}

export const UserRole = {
  None: 0,
  Manufacturer: 1,
  Distributor: 2,
  Retailer: 3,
  Consumer: 4,
}

const Web3Context = createContext(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const showToast = (message, type = "success") => {
    // Simple toast implementation
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

  const connectWallet = async () => {
    try {
      setIsLoading(true)
      const ethereum = await detectEthereumProvider()

      if (!ethereum) {
        showToast("Please install MetaMask!", "error")
        return
      }

      const web3Provider = new ethers.providers.Web3Provider(ethereum)
      const accounts = await web3Provider.send("eth_requestAccounts", [])

      if (accounts.length > 0) {
        const signer = web3Provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

        setProvider(web3Provider)
        setSigner(signer)
        setContract(contract)
        setAccount(accounts[0])
        setIsConnected(true)

        // Load current user info
        await loadUserInfo(accounts[0], contract)

        showToast("Wallet connected successfully!")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      showToast("Failed to connect wallet", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserInfo = async (address, contractInstance) => {
    try {
      const userInfo = await contractInstance.getUser(address)
      setCurrentUser({
        name: userInfo.name,
        role: userInfo.role,
        isVerified: userInfo.isVerified,
      })
    } catch (error) {
      console.error("Error loading user info:", error)
      setCurrentUser(null)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setContract(null)
    setIsConnected(false)
    setCurrentUser(null)
    showToast("Wallet disconnected")
  }

  const registerUser = async (name, role) => {
    if (!contract) throw new Error("Contract not connected")

    try {
      const tx = await contract.registerUser(name, role)
      await tx.wait()

      // Reload user info
      if (account) {
        await loadUserInfo(account, contract)
      }

      showToast("User registered successfully!")
    } catch (error) {
      console.error("Error registering user:", error)
      showToast(error.reason || "Failed to register user", "error")
      throw error
    }
  }

  const registerProduct = async (name, batchNumber, price) => {
    if (!contract) throw new Error("Contract not connected")

    try {
      const priceInWei = ethers.utils.parseEther(price)
      const tx = await contract.registerProduct(name, batchNumber, priceInWei)
      const receipt = await tx.wait()

      // Extract product ID from event
      const event = receipt.events?.find((e) => e.event === "ProductRegistered")
      const productId = event?.args?.productId?.toNumber()

      showToast(`Product registered with ID: ${productId}`)
      return productId
    } catch (error) {
      console.error("Error registering product:", error)
      showToast(error.reason || "Failed to register product", "error")
      throw error
    }
  }

  const transferProduct = async (productId, toAddress) => {
    if (!contract) throw new Error("Contract not connected")

    try {
      const tx = await contract.transferProduct(productId, toAddress)
      await tx.wait()
      showToast("Product transferred successfully!")
    } catch (error) {
      console.error("Error transferring product:", error)
      showToast(error.reason || "Failed to transfer product", "error")
      throw error
    }
  }

  const getProduct = async (productId) => {
    if (!contract) return null

    try {
      const product = await contract.getProduct(productId)
      return {
        name: product.name,
        batchNumber: product.batchNumber,
        manufacturingDate: product.manufacturingDate.toNumber(),
        manufacturer: product.manufacturer,
        currentOwner: product.currentOwner,
        status: product.status,
        isAuthentic: product.isAuthentic,
        price: product.price,
      }
    } catch (error) {
      console.error("Error getting product:", error)
      return null
    }
  }

  const verifyProduct = async (productId) => {
    if (!contract) return null

    try {
      const result = await contract.verifyProduct(productId)
      return {
        authentic: result.authentic,
        manufacturer: result.manufacturer,
        currentOwner: result.currentOwner,
        status: result.status,
      }
    } catch (error) {
      console.error("Error verifying product:", error)
      return null
    }
  }

  const getTotalProducts = async () => {
    if (!contract) return 0

    try {
      const total = await contract.getTotalProducts()
      return total.toNumber()
    } catch (error) {
      console.error("Error getting total products:", error)
      return 0
    }
  }

  const updatePrice = async (productId, newPrice) => {
    if (!contract) throw new Error("Contract not connected")

    try {
      const priceInWei = ethers.utils.parseEther(newPrice)
      const tx = await contract.updatePrice(productId, priceInWei)
      await tx.wait()
      showToast("Price updated successfully!")
    } catch (error) {
      console.error("Error updating price:", error)
      showToast(error.reason || "Failed to update price", "error")
      throw error
    }
  }

  const markCounterfeit = async (productId) => {
    if (!contract) throw new Error("Contract not connected")

    try {
      const tx = await contract.markCounterfeit(productId)
      await tx.wait()
      showToast("Product marked as counterfeit!")
    } catch (error) {
      console.error("Error marking counterfeit:", error)
      showToast(error.reason || "Failed to mark as counterfeit", "error")
      throw error
    }
  }

  const getUserInfo = async (address) => {
    if (!contract) return null

    try {
      const userInfo = await contract.getUser(address)
      return {
        name: userInfo.name,
        role: userInfo.role,
        isVerified: userInfo.isVerified,
      }
    } catch (error) {
      console.error("Error getting user info:", error)
      return null
    }
  }

  const getAllProducts = async () => {
    if (!contract) return []

    try {
      const totalProducts = await getTotalProducts()
      const products = []

      for (let i = 1; i <= totalProducts; i++) {
        const product = await getProduct(i)
        if (product) {
          products.push({ ...product, id: i })
        }
      }

      return products
    } catch (error) {
      console.error("Error getting all products:", error)
      return []
    }
  }

  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = await detectEthereumProvider()
      if (ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(ethereum)
        const accounts = await web3Provider.listAccounts()
        if (accounts.length > 0) {
          connectWallet()
        }
      }
    }

    checkConnection()
  }, [])

  const value = {
    account,
    provider,
    signer,
    contract,
    isConnected,
    isLoading,
    currentUser,
    connectWallet,
    disconnectWallet,
    registerUser,
    registerProduct,
    transferProduct,
    getProduct,
    verifyProduct,
    getTotalProducts,
    updatePrice,
    markCounterfeit,
    getUserInfo,
    getAllProducts,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
