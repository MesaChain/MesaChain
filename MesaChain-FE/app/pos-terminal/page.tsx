"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Product {
  id: string
  name: string
  price: number
}

interface OrderItem extends Product {
  quantity: number
}

const products: Product[] = [
  { id: "1", name: "Espresso", price: 2.5 },
  { id: "2", name: "Latte", price: 3.5 },
  { id: "3", name: "Cappuccino", price: 3.5 },
  { id: "4", name: "Muffin", price: 2.75 },
  { id: "5", name: "Croissant", price: 2.25 },
  { id: "6", name: "Iced Coffee", price: 3.0 },
  { id: "7", name: "Tea", price: 2.0 },
  { id: "8", name: "Sandwich", price: 6.5 },
]

const syncLogs = [
  { time: "8:05:44 PM", message: "No new data to sync." },
  { time: "8:05:44 PM", message: "Starting synchronization..." },
  { time: "8:05:44 PM", message: "Connection restored. System is online." },
  { time: "8:05:44 PM", message: "Product catalog seeded." },
]

export default function Component() {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([])

  const addToOrder = (product: Product) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.find((item) => item.id === product.id)
      if (existingItem) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromOrder = (productId: string) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.find((item) => item.id === productId)
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
      }
      return prev.filter((item) => item.id !== productId)
    })
  }

  const clearOrder = () => {
    setCurrentOrder([])
  }

  const total = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">POS Terminal</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Sync Now</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                    onClick={() => addToOrder(product)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="h-16 bg-gray-100 rounded mb-3 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-300 rounded"></div>
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>
                      <p className="text-gray-600 text-sm">${product.price.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Current Order Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Current Order</h2>
                <Button variant="destructive" size="sm" onClick={clearOrder} className="bg-red-500 hover:bg-red-600">
                  New Order
                </Button>
              </div>

              <div className="min-h-[200px] mb-6">
                {currentOrder.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 italic">
                    Add products to start an order.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentOrder.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <span className="font-medium text-sm">{item.name}</span>
                          <div className="text-xs text-gray-600">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFromOrder(item.id)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            -
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              addToOrder(item)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
                <Button className="w-full bg-gray-400 hover:bg-gray-500" disabled={currentOrder.length === 0}>
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Log Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sync Log</h2>
          <div className="space-y-1">
            {syncLogs.map((log, index) => (
              <div key={index} className="text-sm">
                <span className="text-blue-600 font-mono">[{log.time}]</span>
                <span className="text-gray-700 ml-2">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
