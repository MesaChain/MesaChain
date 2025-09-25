"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Star, Grid, List, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { DataTable, ColumnDefinition } from "@/components/ui/data-table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Image from "next/image"

// Custom debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

// Define types for menu items
type Category = "Food" | "Drinks" | "Desserts"
type FilterCategory = "All" | "Favorites" | Category
type ViewMode = "grid" | "table"

interface MenuItem {
    id: string
    name: string
    description: string
    price: number
    category: Category
    image: string
    isFavorite: boolean
    available: boolean
    preparationTime: number // in minutes
    allergens: string[]
    createdAt: string
}

// Sample data
const initialMenuItems: MenuItem[] = [
    {
        id: "1",
        name: "Bacon Burger",
        description: "Juicy beef patty with crispy bacon",
        price: 8.63,
        category: "Food",
        image: "/placeholder.svg?height=200&width=200",
        isFavorite: true,
        available: true,
        preparationTime: 15,
        allergens: ["gluten", "dairy"],
        createdAt: "2024-01-01T10:00:00Z"
    },
    {
        id: "2",
        name: "Cheese Burger",
        description: "Classic burger with melted cheese",
        price: 8.05,
        category: "Food",
        image: "/placeholder.svg?height=200&width=200",
        isFavorite: false,
        available: true,
        preparationTime: 12,
        allergens: ["gluten", "dairy"],
        createdAt: "2024-01-02T10:00:00Z"
    },
    {
        id: "3",
        name: "Chicken Curry Sandwich",
        description: "Spicy chicken curry in a soft bun",
        price: 3.45,
        category: "Food",
        image: "/placeholder.svg?height=200&width=200",
        isFavorite: false,
        available: false,
        preparationTime: 8,
        allergens: ["gluten"],
        createdAt: "2024-01-03T10:00:00Z"
    },
    {
        id: "4",
        name: "Chocolate Cake",
        description: "Rich chocolate cake with ganache",
        price: 5.99,
        category: "Desserts",
        image: "/placeholder.svg?height=200&width=200",
        isFavorite: true,
        available: true,
        preparationTime: 5,
        allergens: ["gluten", "dairy", "eggs"],
        createdAt: "2024-01-04T10:00:00Z"
    },
    {
        id: "5",
        name: "Iced Coffee",
        description: "Cold brewed coffee with ice",
        price: 3.25,
        category: "Drinks",
        image: "/placeholder.svg?height=200&width=200",
        isFavorite: false,
        available: true,
        preparationTime: 3,
        allergens: [],
        createdAt: "2024-01-05T10:00:00Z"
    },
]

export default function MenuManagementEnhanced() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearchQuery = useDebounce(searchInput, 300)
    const [activeCategory, setActiveCategory] = useState<FilterCategory>("All")
    const [viewMode, setViewMode] = useState<ViewMode>("grid")

    // Filter menu items based on search query and active category
    const filteredMenuItems = menuItems.filter((item) => {
        const matchesSearch =
            debouncedSearchQuery === "" ||
            item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            item.price.toString().includes(debouncedSearchQuery)

        let matchesCategory = true
        if (activeCategory === "Favorites") {
            matchesCategory = item.isFavorite
        } else if (activeCategory !== "All") {
            matchesCategory = item.category === activeCategory
        }

        return matchesSearch && matchesCategory
    })

    // Handle menu item operations
    const handleDelete = (id: string) => {
        setMenuItems(menuItems.filter((item) => item.id !== id))
    }

    const handleFavoriteToggle = (id: string) => {
        setMenuItems(menuItems.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)))
    }

    const handleAvailabilityToggle = (id: string) => {
        setMenuItems(menuItems.map((item) => (item.id === id ? { ...item, available: !item.available } : item)))
    }

    const handleBulkDelete = (items: MenuItem[]) => {
        const idsToDelete = new Set(items.map(item => item.id))
        setMenuItems(prev => prev.filter(item => !idsToDelete.has(item.id)))
    }

    const handleExport = (format: string, data: MenuItem[]) => {
        console.log(`Exporting ${data.length} menu items as ${format}`)
    }

    // Table columns definition
    const tableColumns: ColumnDefinition<MenuItem>[] = [
        {
            key: 'image',
            header: 'Image',
            render: (value: string, item) => (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                        src={value || "/placeholder.svg"}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                    />
                </div>
            ),
            width: '80px'
        },
        {
            key: 'name',
            header: 'Name',
            render: (value: string, item) => (
                <div className="flex items-center space-x-2">
                    <span className="font-medium">{value}</span>
                    {item.isFavorite && (
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    )}
                </div>
            ),
            sortable: true,
            filterable: true,
            width: '200px'
        },
        {
            key: 'description',
            header: 'Description',
            render: (value: string) => (
                <span className="text-gray-600 truncate max-w-[200px] block">{value}</span>
            ),
            filterable: true,
            width: '250px'
        },
        {
            key: 'category',
            header: 'Category',
            render: (value: string) => (
                <Badge variant="outline">{value}</Badge>
            ),
            sortable: true,
            filterable: true,
            width: '120px'
        },
        {
            key: 'price',
            header: 'Price',
            render: (value: number) => (
                <span className="font-medium">${value.toFixed(2)}</span>
            ),
            sortable: true,
            align: 'right',
            width: '100px'
        },
        {
            key: 'available',
            header: 'Status',
            render: (value: boolean) => (
                <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {value ? 'Available' : 'Unavailable'}
                </Badge>
            ),
            sortable: true,
            filterable: true,
            width: '120px'
        },
        {
            key: 'preparationTime',
            header: 'Prep Time',
            render: (value: number) => `${value} min`,
            sortable: true,
            align: 'right',
            width: '100px'
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_, item) => (
                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFavoriteToggle(item.id)}
                        className="h-8 w-8 p-0"
                    >
                        <Star className={cn("h-4 w-4", item.isFavorite && "fill-yellow-500 text-yellow-500")} />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAvailabilityToggle(item.id)}
                        className="h-8 w-8 p-0"
                    >
                        <div className={cn("w-2 h-2 rounded-full", item.available ? "bg-green-500" : "bg-red-500")} />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 px-2">
                        <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            ),
            width: '180px'
        }
    ]

    const bulkActions = [
        {
            label: 'Delete Selected',
            action: 'delete',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        },
        {
            label: 'Mark as Favorite',
            action: 'favorite',
            icon: <Star className="h-4 w-4" />,
            variant: 'outline' as const
        },
        {
            label: 'Toggle Availability',
            action: 'availability',
            icon: <MoreHorizontal className="h-4 w-4" />,
            variant: 'outline' as const
        }
    ]

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold">Menu Management</h1>
                <div className="flex w-full md:w-auto gap-4">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            className="pl-10"
                            placeholder="Search menu items"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        {searchInput && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Badge variant="secondary" className="font-normal">
                                    {filteredMenuItems.length} results
                                    <button className="ml-1 hover:text-primary" onClick={() => setSearchInput("")}>
                                        ×
                                    </button>
                                </Badge>
                            </div>
                        )}
                    </div>
                    <Button className="whitespace-nowrap">
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
            </div>

            {/* Filters and View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <Tabs
                    defaultValue="All"
                    value={activeCategory}
                    onValueChange={(value) => setActiveCategory(value as FilterCategory)}
                >
                    <TabsList>
                        <TabsTrigger value="All">All</TabsTrigger>
                        <TabsTrigger value="Favorites">
                            <Star className="h-4 w-4 mr-1 fill-current" /> Favorites
                        </TabsTrigger>
                        <TabsTrigger value="Food">Food</TabsTrigger>
                        <TabsTrigger value="Drinks">Drinks</TabsTrigger>
                        <TabsTrigger value="Desserts">Desserts</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">View:</span>
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'table' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredMenuItems.map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onDelete={() => handleDelete(item.id)}
                            onFavoriteToggle={() => handleFavoriteToggle(item.id)}
                            onAvailabilityToggle={() => handleAvailabilityToggle(item.id)}
                        />
                    ))}
                </div>
            ) : (
                <DataTable
                    data={filteredMenuItems}
                    columns={tableColumns}
                    pagination={true}
                    selectable={true}
                    exportable={true}
                    exportFormats={['csv', 'json', 'excel']}
                    defaultPageSize={25}
                    pageSizeOptions={[10, 25, 50, 100]}
                    onExport={handleExport}
                    bulkActions={bulkActions}
                    rowKey="id"
                    emptyState={
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
                            <p className="text-sm text-gray-500 mb-6">Try adjusting your search or filters.</p>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Menu Item
                            </Button>
                        </div>
                    }
                />
            )}
        </div>
    )
}

interface MenuItemCardProps {
    item: MenuItem
    onDelete: () => void
    onFavoriteToggle: () => void
    onAvailabilityToggle: () => void
}

function MenuItemCard({ item, onDelete, onFavoriteToggle, onAvailabilityToggle }: MenuItemCardProps) {
    return (
        <Card className="overflow-hidden">
            <div className="relative h-48 bg-gray-200">
                <Badge className="absolute top-2 right-2 z-10">{item.category}</Badge>
                <div className="absolute top-2 left-2 z-10 flex space-x-1">
                    <button
                        className={cn(
                            "p-1.5 rounded-full transition-colors",
                            item.isFavorite
                                ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200",
                        )}
                        onClick={onFavoriteToggle}
                        aria-label={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Star className={cn("h-4 w-4", item.isFavorite && "fill-yellow-500")} />
                    </button>
                    <button
                        className={cn(
                            "p-1.5 rounded-full transition-colors",
                            item.available
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-red-100 text-red-600 hover:bg-red-200",
                        )}
                        onClick={onAvailabilityToggle}
                        aria-label={item.available ? "Mark as unavailable" : "Mark as available"}
                    >
                        <div className={cn("w-3 h-3 rounded-full", item.available ? "bg-green-500" : "bg-red-500")} />
                    </button>
                </div>
                <div className="w-full h-full flex items-center justify-center">
                    <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={200}
                        height={200}
                        className="object-cover"
                    />
                </div>
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold flex items-center">
                        {item.name}
                        {item.isFavorite && <Star className="h-4 w-4 ml-2 fill-yellow-500 text-yellow-500" />}
                    </h3>
                    <span className="text-xl font-semibold">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-gray-600 mb-2 text-sm">{item.description}</p>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500">{item.preparationTime} min prep</span>
                    <Badge className={item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {item.available ? 'Available' : 'Unavailable'}
                    </Badge>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={onDelete}
                    >
                        <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                </div>
            </div>
        </Card>
    )
}
