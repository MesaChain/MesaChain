"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    CreditCard,
    Truck,
    Calculator,
    Package,
    Users,
    TrendingUp,
    BarChart3,
    Settings,
    AlertTriangle,
    CheckCircle,
    Clock,
} from "lucide-react"

enum IntegrationType {
    ACCOUNTING = "accounting",
    DELIVERY = "delivery",
    PAYMENT = "payment",
    INVENTORY = "inventory",
    CRM = "crm",
    MARKETING = "marketing",
    ANALYTICS = "analytics",
}

interface Integration {
    id: string
    name: string
    type: IntegrationType
    status: "active" | "inactive" | "error"
    apiKey: string
    webhookUrl?: string
    lastSync: Date
    usageCount: number
    errorCount: number
    rateLimit: number
    rateLimitUsed: number
}

const integrationIcons = {
    [IntegrationType.ACCOUNTING]: Calculator,
    [IntegrationType.DELIVERY]: Truck,
    [IntegrationType.PAYMENT]: CreditCard,
    [IntegrationType.INVENTORY]: Package,
    [IntegrationType.CRM]: Users,
    [IntegrationType.MARKETING]: TrendingUp,
    [IntegrationType.ANALYTICS]: BarChart3,
}

const statusIcons = {
    default: CheckCircle,
    secondary: Clock,
    destructive: AlertTriangle,
} as const

const mockIntegrations: Integration[] = [
    {
        id: "1",
        name: "QuickBooks Online",
        type: IntegrationType.ACCOUNTING,
        status: "active",
        apiKey: "qb_live_123",
        lastSync: new Date("2024-01-20T10:30:00"),
        usageCount: 1250,
        errorCount: 2,
        rateLimit: 5000,
        rateLimitUsed: 1250,
    },
    {
        id: "2",
        name: "Stripe Payments",
        type: IntegrationType.PAYMENT,
        status: "active",
        apiKey: "sk_live_456",
        webhookUrl: "https://api.mesachain.com/webhooks/stripe",
        lastSync: new Date("2024-01-20T11:45:00"),
        usageCount: 890,
        errorCount: 0,
        rateLimit: 10000,
        rateLimitUsed: 890,
    },
    {
        id: "3",
        name: "FedEx Shipping",
        type: IntegrationType.DELIVERY,
        status: "error",
        apiKey: "fedex_789",
        lastSync: new Date("2024-01-19T08:15:00"),
        usageCount: 45,
        errorCount: 12,
        rateLimit: 1000,
        rateLimitUsed: 45,
    },
]

export function IntegrationList() {
    const formatTimeAgo = (date: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

        if (diffHours < 1) return "Just now"
        if (diffHours < 24) return `${diffHours}h ago`
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays}d ago`
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Integrations</CardTitle>
                <CardDescription>Monitor and manage your third-party API integrations</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockIntegrations.map((integration) => {
                        const Icon = integrationIcons[integration.type]
                        const statusKey =
                            integration.status === "active"
                                ? "default"
                                : integration.status === "inactive"
                                ? "secondary"
                                : "destructive"
                        const StatusIcon = statusIcons[statusKey]
                        const usagePercentage = (integration.rateLimitUsed / integration.rateLimit) * 100

                        return (
                            <div key={integration.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded-md">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{integration.name}</h4>
                                            <p className="text-sm text-muted-foreground capitalize">{integration.type} integration</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge  className={`${integration.status === "active" ? "bg-green-500" : integration.status === "inactive" ? "bg-yellow-100" : "bg-red-400"} flex items-center gap-1`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {integration.status}
                                        </Badge>
                                        <Button size="sm" variant="ghost">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Last Sync</p>
                                        <p className="font-medium">{formatTimeAgo(integration.lastSync)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Requests</p>
                                        <p className="font-medium">{integration.usageCount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Errors</p>
                                        <p
                                            className={`font-medium ${integration.errorCount > 0 ? "text-destructive" : "text-success"
                                                }`}
                                        >
                                            {integration.errorCount}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Rate Limit</p>
                                        <p className="font-medium">{usagePercentage.toFixed(1)}%</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>API Usage</span>
                                        <span>
                                            {integration.rateLimitUsed} / {integration.rateLimit}
                                        </span>
                                    </div>
                                    <Progress value={usagePercentage} className="h-2"  />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
