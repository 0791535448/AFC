'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Laptop, Wrench, Package, ClipboardList, Users, BarChart3, Activity, Settings, Bell } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalHardware: 0,
    activeRepairs: 0,
    pendingTasks: 0,
    totalAssets: 0
  })

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        // Mock data for now - replace with actual API calls
        setStats({
          totalHardware: 4,
          activeRepairs: 1,
          pendingTasks: 3,
          totalAssets: 4
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ICT Infrastructure Dashboard</h1>
                <p className="text-gray-600 text-sm">Manage hardware, repairs, and assets efficiently</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Hardware</CardTitle>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Laptop className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalHardware}</div>
              <p className="text-sm text-gray-600 mt-1">Registered devices</p>
              <div className="mt-3 flex items-center text-xs text-green-600">
                <span className="font-medium">+12%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Active Repairs</CardTitle>
              <div className="bg-orange-100 p-2 rounded-lg">
                <Wrench className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.activeRepairs}</div>
              <p className="text-sm text-gray-600 mt-1">Currently in progress</p>
              <div className="mt-3 flex items-center text-xs text-orange-600">
                <span className="font-medium">1 urgent</span>
                <span className="ml-1">requires attention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Pending Tasks</CardTitle>
              <div className="bg-purple-100 p-2 rounded-lg">
                <ClipboardList className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.pendingTasks}</div>
              <p className="text-sm text-gray-600 mt-1">Awaiting action</p>
              <div className="mt-3 flex items-center text-xs text-purple-600">
                <span className="font-medium">2 high priority</span>
                <span className="ml-1">tasks overdue</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Total Assets</CardTitle>
              <div className="bg-green-100 p-2 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalAssets}</div>
              <p className="text-sm text-gray-600 mt-1">Tracked inventory</p>
              <div className="mt-3 flex items-center text-xs text-green-600">
                <span className="font-medium">98%</span>
                <span className="ml-1">properly maintained</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button className="btn-primary flex items-center gap-2 h-12">
                  <Laptop className="h-5 w-5" />
                  Add Hardware
                </Button>
                <Button className="btn-secondary flex items-center gap-2 h-12">
                  <Wrench className="h-5 w-5" />
                  New Repair
                </Button>
                <Button className="btn-secondary flex items-center gap-2 h-12">
                  <Package className="h-5 w-5" />
                  Move Asset
                </Button>
                <Button className="btn-secondary flex items-center gap-2 h-12">
                  <ClipboardList className="h-5 w-5" />
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Wrench className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">Printer repair initiated</span>
                      <p className="text-xs text-gray-600">ICT003 - Canon IR-ADV 4535</p>
                    </div>
                  </div>
                  <Badge className="status-badge status-pending">2h ago</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Package className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">Laptop assigned to Finance</span>
                      <p className="text-xs text-gray-600">ICT002 - HP EliteDesk 800</p>
                    </div>
                  </div>
                  <Badge className="status-badge status-active">5h ago</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Laptop className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">New hardware registered</span>
                      <p className="text-xs text-gray-600">ICT001 - Dell Latitude 7420</p>
                    </div>
                  </div>
                  <Badge className="status-badge">1d ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <BarChart3 className="h-5 w-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Hardware Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Active</span>
                    <Badge className="status-badge status-active">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Under Repair</span>
                    <Badge className="status-badge status-pending">1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Retired</span>
                    <Badge className="status-badge">0</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Repair Priority</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Critical</span>
                    <Badge className="status-badge status-error">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">High</span>
                    <Badge className="status-badge status-pending">1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Medium</span>
                    <Badge className="status-badge">2</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Task Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Pending</span>
                    <Badge className="status-badge status-pending">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">In Progress</span>
                    <Badge className="status-badge status-active">2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Completed</span>
                    <Badge className="status-badge status-active">8</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
