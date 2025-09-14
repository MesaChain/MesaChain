"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "./StatsCard";
import { UsageChart } from "./UsageChart";
import { APIKeyManager } from "./APIKeyManager";
import { IntegrationList } from "./IntegrationList";
import { APIDocumentation } from "./APIDocumentation";
import {
  Activity,
  Key,
  Puzzle,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  BarChart3,
  FileText
} from "lucide-react";

export default function APIManagement() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-6 text-white">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                API Management Dashboard
              </h1>
              <p className="text-lg opacity-90 mb-6">
                Manage and monitor your third-party API integrations in one centralized hub
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-white/20 backdrop-blur hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
                  Quick Start Guide
                </button>
                <button className="bg-white/10 backdrop-blur hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
                  View Documentation
                </button>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Active Integrations"
            value="12"
            description="3 new this month"
            icon={Puzzle}
            trend={{ value: 25, isPositive: true }}
            variant="success"
          />
          <StatsCard
            title="Total API Calls"
            value="2.4M"
            description="Last 30 days"
            icon={Activity}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="API Keys"
            value="8"
            description="2 expiring soon"
            icon={Key}
            trend={{ value: -5, isPositive: false }}
            variant="warning"
          />
          <StatsCard
            title="Error Rate"
            value="0.12%"
            description="Well within limits"
            icon={AlertTriangle}
            trend={{ value: -40, isPositive: true }}
            variant="success"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Puzzle className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <UsageChart type="line" />
              <UsageChart
                type="bar"
                title="Integration Performance"
                description="Response times by integration type"
              />
            </div>
            <IntegrationList />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationList />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <UsageChart
                title="Integration Health"
                description="Success rates over time"
              />
              <UsageChart
                type="bar"
                title="Error Distribution"
                description="Errors by integration type"
              />
            </div>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <APIKeyManager />
          </TabsContent>

          <TabsContent value="documentation" className="space-y-6">
            <APIDocumentation />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <UsageChart
                title="Request Volume"
                description="API requests over time"
              />
              <UsageChart
                type="bar"
                title="Top Endpoints"
                description="Most frequently used endpoints"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Avg Response Time"
                value="145ms"
                description="Last 24 hours"
                icon={Activity}
                trend={{ value: -12, isPositive: true }}
                variant="success"
              />
              <StatsCard
                title="Uptime"
                value="99.9%"
                description="30-day average"
                icon={CheckCircle}
                variant="success"
              />
              <StatsCard
                title="Rate Limits Hit"
                value="23"
                description="This month"
                icon={AlertTriangle}
                trend={{ value: 15, isPositive: false }}
                variant="warning"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}