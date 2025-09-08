"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Web3Provider } from "./contexts/Web3Context.jsx"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import Home from "./pages/Home"
import AddProduct from "./pages/AddProduct"
import TrackProduct from "./pages/TrackProduct"
import RegisterUser from "./pages/RegisterUser"
import TransferProduct from "./pages/TransferProduct"
import VerifyUsers from "./pages/VerifyUsers"
import "./styles/global.css"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <Web3Provider>
      <Router>
        <div className="app-container">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

          <div className={`main-content ${sidebarOpen ? "expanded" : ""}`}>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Header title="Dashboard" onToggleSidebar={toggleSidebar} />
                    <Home />
                  </>
                }
              />
              <Route
                path="/products"
                element={
                  <>
                    <Header title="All Products" onToggleSidebar={toggleSidebar} />
                    <Home />
                  </>
                }
              />
              <Route
                path="/add-product"
                element={
                  <>
                    <Header title="Add Product" onToggleSidebar={toggleSidebar} />
                    <AddProduct />
                  </>
                }
              />
              <Route
                path="/track"
                element={
                  <>
                    <Header title="Track Product" onToggleSidebar={toggleSidebar} />
                    <TrackProduct />
                  </>
                }
              />
              <Route
                path="/register"
                element={
                  <>
                    <Header title="Register User" onToggleSidebar={toggleSidebar} />
                    <RegisterUser />
                  </>
                }
              />
              <Route
                path="/transfer"
                element={
                  <>
                    <Header title="Transfer Product" onToggleSidebar={toggleSidebar} />
                    <TransferProduct />
                  </>
                }
              />
              <Route
                path="/verify-users"
                element={
                  <>
                    <Header title="Verify Users" onToggleSidebar={toggleSidebar} />
                    <VerifyUsers />
                  </>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </Web3Provider>
  )
}

export default App
