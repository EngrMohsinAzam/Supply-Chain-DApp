"use client"

import type React from "react"
import { Fragment } from "react"
import { Link, useLocation } from "react-router-dom"
import { Disclosure, Menu, Transition } from "@headlessui/react"
import { Bars3Icon, XMarkIcon, WalletIcon } from "@heroicons/react/24/outline"
import { useWeb3, UserRole } from "../contexts/Web3Context.jsx"
import classNames from "classnames"

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Track Product", href: "/track" },
  { name: "Add Product", href: "/add-product" },
  { name: "Transfer Product", href: "/transfer" },
  { name: "Analytics", href: "/analytics" },
]

const Navbar: React.FC = () => {
  const location = useLocation()
  const { account, isConnected, connectWallet, disconnectWallet, isLoading, currentUser } = useWeb3()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getRoleName = (role: UserRole) => {
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
        return "Unregistered"
    }
  }

  return (
    <Disclosure as="nav" className="bg-white shadow-lg">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <h1 className="text-xl font-bold text-blue-600">Supply Chain DApp</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        location.pathname === item.href
                          ? "border-blue-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                        "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {isConnected ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <div className="flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-2">
                          <WalletIcon className="h-5 w-5 text-gray-400" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-700">{formatAddress(account!)}</div>
                            {currentUser && (
                              <div className="text-xs text-gray-500">
                                {getRoleName(currentUser.role)} {currentUser.isVerified ? "✓" : "⚠️"}
                              </div>
                            )}
                          </div>
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {!currentUser && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/register"
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700",
                                )}
                              >
                                Register User
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={disconnectWallet}
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block w-full px-4 py-2 text-left text-sm text-gray-700",
                              )}
                            >
                              Disconnect Wallet
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isLoading}
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    <WalletIcon className="mr-2 h-4 w-4" />
                    {isLoading ? "Connecting..." : "Connect Wallet"}
                  </button>
                )}
              </div>

              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                    "block border-l-4 py-2 pl-3 pr-4 text-base font-medium",
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="px-4">
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <WalletIcon className="h-5 w-5 text-gray-400" />
                      <span className="ml-2 text-sm font-medium text-gray-700">{formatAddress(account!)}</span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="block w-full rounded-md bg-red-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-red-700"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isLoading}
                    className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? "Connecting..." : "Connect Wallet"}
                  </button>
                )}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default Navbar
