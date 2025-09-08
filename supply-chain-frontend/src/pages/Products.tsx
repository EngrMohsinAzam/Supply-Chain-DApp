"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { MagnifyingGlassIcon, PlusIcon, EyeIcon, TruckIcon } from "@heroicons/react/24/outline"
import { useWeb3, ProductStatus } from "../contexts/Web3Context.jsx"
import { ethers } from "ethers"
import toast from "react-hot-toast"

interface Product {
  id: string
  name: string
  status: "Manufacturing" | "In Transit" | "Delivered" | "Pending"
  location: string
  timestamp: string
  manufacturer: string
}

const Products: React.FC = () => {
  const { isConnected, getTotalProducts, getProduct, currentUser } = useWeb3()
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isConnected) {
      loadProducts()
    }
  }, [isConnected])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const totalProducts = await getTotalProducts()
      const productPromises = []

      for (let i = 1; i <= totalProducts; i++) {
        productPromises.push(getProduct(i))
      }

      const productResults = await Promise.all(productPromises)
      const validProducts = productResults
        .map((product, index) => (product ? { ...product, id: index + 1 } : null))
        .filter(Boolean)

      setProducts(validProducts)
    } catch (error) {
      console.error("Error loading products:", error)
      toast.error("Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusName = (status: ProductStatus): string => {
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

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.Manufactured:
        return "bg-blue-100 text-blue-800"
      case ProductStatus.InTransit:
        return "bg-yellow-100 text-yellow-800"
      case ProductStatus.WithDistributor:
        return "bg-purple-100 text-purple-800"
      case ProductStatus.WithRetailer:
        return "bg-orange-100 text-orange-800"
      case ProductStatus.Sold:
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallet connected</h3>
        <p className="mt-1 text-sm text-gray-500">Connect your wallet to view products.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading products...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all products in your supply chain including their status and location.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to="/add-product"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                    >
                      Last Updated
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                            <div className="text-sm text-gray-500">Batch: {product.batchNumber}</div>
                            <div className="text-sm text-gray-500 font-mono text-xs">
                              By: {product.manufacturer.slice(0, 10)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(product.status)}`}
                          >
                            {getStatusName(product.status)}
                          </span>
                          {!product.isAuthentic && (
                            <span className="ml-2 inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-red-100 text-red-800">
                              Counterfeit
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 font-mono text-xs">
                        {product.currentOwner.slice(0, 10)}...
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(product.manufacturingDate * 1000).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {ethers.utils.formatEther(product.price)} ETH
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link to={`/track?id=${product.id}`} className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="h-5 w-5" />
                          <span className="sr-only">View details</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
