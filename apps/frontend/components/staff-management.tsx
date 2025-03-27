"use client"

import { useState } from "react"
import { Search, Plus, Mail, Phone, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useDebounce } from "@/lib/hooks/use-debounce"


// Define types for staff members
type Permission = "admin" | "pos" | "menu" | "staff" | "reports" | "kitchen" | "bar" | "payments"

interface StaffMember {
    id: string
    name: string
    position: string
    email: string
    phone: string
    isActive: boolean
    permissions: Permission[]
}

// Sample data
const initialStaffMembers: StaffMember[] = [
    {
        id: "1",
        name: "Alexa Laza",
        position: "Manager",
        email: "alexa@mesachain.com",
        phone: "+1 (555) 123-4567",
        isActive: true,
        permissions: ["admin", "pos", "menu", "staff", "reports"],
    },
    {
        id: "2",
        name: "John Smith",
        position: "Waiter",
        email: "john@mesachain.com",
        phone: "+1 (555) 234-5678",
        isActive: true,
        permissions: ["pos"],
    },
    {
        id: "3",
        name: "Emma Johnson",
        position: "Chef",
        email: "emma@mesachain.com",
        phone: "+1 (555) 345-6789",
        isActive: true,
        permissions: ["kitchen", "menu"],
    },
    {
        id: "4",
        name: "Michael Brown",
        position: "Bartender",
        email: "michael@mesachain.com",
        phone: "+1 (555) 456-7890",
        isActive: true,
        permissions: ["pos", "bar"],
    },
    {
        id: "5",
        name: "Sarah Davis",
        position: "Cashier",
        email: "sarah@mesachain.com",
        phone: "+1 (555) 567-8901",
        isActive: false,
        permissions: ["pos", "payments"],
    },
]

export default function StaffManagement() {
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaffMembers)
    const [searchQuery, setSearchQuery] = useState("")
    const debouncedSearchQuery = useDebounce(searchQuery, 300)
    // Filter staff members based on search query
    const filteredStaffMembers = staffMembers.filter(
        (member) =>
            member.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            member.position.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    )

    // Handle staff deletion
    const handleDelete = (id: string) => {
        setStaffMembers(staffMembers.filter((member) => member.id !== id))
    }

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold">Staff Management</h1>
                <div className="flex w-full md:w-auto gap-4">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            className="pl-10"
                            placeholder="Search menu items"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Badge variant="secondary" className="font-normal">
                                    {filteredStaffMembers.length} results
                                    <button className="ml-1 hover:text-primary" onClick={() => setSearchQuery("")}>
                                        ×
                                    </button>
                                </Badge>
                            </div>
                        )}
                    </div>
                    <Button className="whitespace-nowrap">
                        <Plus className="mr-2 h-4 w-4" /> Add Staff
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredStaffMembers.map((member) => (
                    <StaffCard key={member.id} member={member} onDelete={() => handleDelete(member.id)} />
                ))}
            </div>
        </div>
    )
}

interface StaffCardProps {
    member: StaffMember
    onDelete: () => void
}

function StaffCard({ member, onDelete }: StaffCardProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div>
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={member.isActive ? "default" : "secondary"}
                            className={member.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                            {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-gray-500">{member.position}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a href={`mailto:${member.email}`} className="text-gray-700 hover:underline">
                        {member.email}
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a href={`tel:${member.phone}`} className="text-gray-700 hover:underline">
                        {member.phone}
                    </a>
                </div>
            </div>

            <div className="mb-4">
                <p className="font-medium mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                    {member.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="rounded-full">
                            {permission}
                        </Badge>
                    ))}
                </div>
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
        </Card>
    )
}

