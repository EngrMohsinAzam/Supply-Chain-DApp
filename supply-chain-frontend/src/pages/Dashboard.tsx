"use client"

import type React from "react"
import { CubeIcon, TruckIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline"
import { useWeb3, ProductStatus } from "../contexts/Web3Context.jsx"
import { useState, useEffect } from "react"

const Dashboard: React.FC = () => {
  const { isConnected, getTotalProducts, getProduct } = useWeb3()
  const [stats, setStats] = useState({
    totalProducts: 0,
    manufactured: 0,
    inTransit: 0,
    withDistributor: 0,
    withRetailer: 0,
    sold: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isConnected) {
      loadStats()
    }
  }, [isConnected])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const totalProducts = await getTotalProducts()
      let manufactured = 0,
        inTransit = 0,
        withDistributor = 0,
        withRetailer = 0,
        sold = 0

      for (let i = 1; i <= totalProducts; i++) {
        const product = await getProduct(i)
        if (product) {
          switch (product.status) {
            case ProductStatus.Manufactured:
              manufactured++
              break
            case ProductStatus.InTransit:
              inTransit++
              break
            case ProductStatus.WithDistributor:
              withDistributor++
              break
            case ProductStatus.WithRetailer:
              withRetailer++
              break
            case ProductStatus.Sold:
              sold++
              break
          }
        }
      }

      setStats({
        totalProducts,
        manufactured,
        inTransit,
        withDistributor,
        withRetailer,
        sold,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const dashboardStats = [
    {
      name: "Total Products",
      value: stats.totalProducts.toString(),
      icon: CubeIcon,
      change: "+0%",
      changeType: "neutral",
    },
    {
      name: "In Transit",
      value: stats.inTransit.toString(),
      icon: TruckIcon,
      change: "+0%",
      changeType: "neutral",
    },
    {
      name: "Sold",
      value: stats.sold.toString(),
      icon: CheckCircleIcon,
      change: "+0%",
      changeType: "increase",
    },
    {
      name: "Manufactured",
      value: stats.manufactured.toString(),
      icon: ClockIcon,
      change: "+0%",
      changeType: "neutral",
    },
  ]

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallet connected</h3>
        <p className="mt-1 text-sm text-gray-500">Connect your wallet to access the supply chain dashboard.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Supply Chain Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Monitor and track your supply chain operations in real-time.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
          >
            <dt>
              <div className="absolute rounded-md bg-blue-500 p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <CubeIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Product #{item}234 updated</p>
                  <p className="text-sm text-gray-500">Status changed to "In Transit"</p>
                </div>
                <div className="text-sm text-gray-500">2h ago</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Supply Chain Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Manufacturing</span>
              <span className="text-sm font-medium text-gray-900">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Shipping</span>
              <span className="text-sm font-medium text-gray-900">30%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "30%" }}></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Delivered</span>
              <span className="text-sm font-medium text-gray-900">25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "25%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
