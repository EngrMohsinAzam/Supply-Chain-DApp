import type React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"
import { useWeb3 } from "../contexts/Web3Context"
import { ChartBarIcon } from "@heroicons/react/24/outline"

const Analytics: React.FC = () => {
  const { isConnected } = useWeb3()

  // Mock data for charts
  const statusData = [
    { name: "Manufacturing", value: 45, color: "#3B82F6" },
    { name: "In Transit", value: 30, color: "#F59E0B" },
    { name: "Delivered", value: 20, color: "#10B981" },
    { name: "Pending", value: 5, color: "#6B7280" },
  ]

  const monthlyData = [
    { month: "Jan", products: 120, delivered: 100 },
    { month: "Feb", products: 150, delivered: 130 },
    { month: "Mar", products: 180, delivered: 160 },
    { month: "Apr", products: 200, delivered: 180 },
    { month: "May", products: 220, delivered: 200 },
    { month: "Jun", products: 250, delivered: 230 },
  ]

  const categoryData = [
    { category: "Food & Beverages", count: 45 },
    { category: "Electronics", count: 38 },
    { category: "Pharmaceuticals", count: 32 },
    { category: "Textiles", count: 28 },
    { category: "Automotive", count: 22 },
    { category: "Other", count: 15 },
  ]

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallet connected</h3>
        <p className="mt-1 text-sm text-gray-500">Connect your wallet to view analytics.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Supply Chain Analytics</h1>
        <p className="mt-2 text-sm text-gray-600">
          Comprehensive insights into your supply chain performance and trends.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Product Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="products" stroke="#3B82F6" strokeWidth={2} name="Total Products" />
              <Line type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={2} name="Delivered" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Products by Category</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Transit Time</p>
              <p className="text-2xl font-semibold text-gray-900">5.2 days</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">98.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cost Efficiency</p>
              <p className="text-2xl font-semibold text-gray-900">$2.34/unit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
