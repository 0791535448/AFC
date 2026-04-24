'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor, 
  Wrench, 
  Users, 
  Settings, 
  LogOut,
  Home,
  Building,
  Cpu,
  Package,
  Tag,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Activity
} from 'lucide-react'
import { BranchConfig } from '@/components/settings/BranchConfig'
import { DeviceTypeConfig } from '@/components/settings/DeviceTypeConfig'
import { MakeConfig } from '@/components/settings/MakeConfig'
import { ModelConfig } from '@/components/settings/ModelConfig'
import { StatusConfig } from '@/components/settings/StatusConfig'
import { AssetsManagement } from '@/components/assets/AssetsManagement'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="h-4 w-4" />
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: <Package className="h-4 w-4" />
  },
  {
    id: 'hardware',
    label: 'Hardware Management',
    icon: <Monitor className="h-4 w-4" />
  },
  {
    id: 'repairs',
    label: 'Repair Management',
    icon: <Wrench className="h-4 w-4" />
  },
  {
    id: 'users',
    label: 'User Management',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    children: [
      {
        id: 'branches',
        label: 'Branches',
        icon: <Building className="h-4 w-4" />
      },
      {
        id: 'device-types',
        label: 'Device Types',
        icon: <Cpu className="h-4 w-4" />
      },
      {
        id: 'makes',
        label: 'Hardware Makes',
        icon: <Package className="h-4 w-4" />
      },
      {
        id: 'models',
        label: 'Hardware Models',
        icon: <Tag className="h-4 w-4" />
      },
      {
        id: 'statuses',
        label: 'Hardware Status',
        icon: <CheckCircle className="h-4 w-4" />
      }
    ]
  }
]

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['settings'])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleMenu = (menuId: string) => {
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus(expandedMenus.filter(id => id !== menuId))
    } else {
      setExpandedMenus([...expandedMenus, menuId])
    }
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />
      case 'assets':
        return <AssetsContent />
      case 'hardware':
        return <HardwareContent />
      case 'repairs':
        return <RepairsContent />
      case 'users':
        return <UsersContent />
      case 'branches':
        return <BranchesContent />
      case 'device-types':
        return <DeviceTypesContent />
      case 'makes':
        return <MakesContent />
      case 'models':
        return <ModelsContent />
      case 'statuses':
        return <StatusesContent />
      default:
        return <DashboardContent />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-purple-100 text-purple-800'
      case 'Admin': return 'bg-blue-100 text-blue-800'
      case 'Manager': return 'bg-green-100 text-green-800'
      case 'Technician': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Monitor className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Admin Panel</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1"
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <Button
                variant={activeMenu === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${isSidebarCollapsed ? 'px-2' : ''}`}
                onClick={() => {
                  if (item.children) {
                    toggleMenu(item.id)
                  } else {
                    setActiveMenu(item.id)
                  }
                }}
              >
                {item.icon}
                {!isSidebarCollapsed && (
                  <>
                    <span className="ml-2">{item.label}</span>
                    {item.children && (
                      <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${
                        expandedMenus.includes(item.id) ? 'rotate-90' : ''
                      }`} />
                    )}
                  </>
                )}
              </Button>
              
              {item.children && expandedMenus.includes(item.id) && !isSidebarCollapsed && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Button
                      key={child.id}
                      variant={activeMenu === child.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setActiveMenu(child.id)}
                    >
                      {child.icon}
                      <span className="ml-2">{child.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t">
          {!isSidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name}
                  </p>
                  <Badge className={getRoleColor(user?.role || '')}>
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeMenu)?.label || 
                 menuItems.find(item => item.children?.some(child => child.id === activeMenu))?.label}
              </h1>
              <p className="text-sm text-gray-600">
                {activeMenu === 'dashboard' && 'System overview and statistics'}
                {activeMenu === 'branches' && 'Manage branch locations and information'}
                {activeMenu === 'device-types' && 'Configure device categories and types'}
                {activeMenu === 'makes' && 'Manage hardware manufacturers'}
                {activeMenu === 'models' && 'Configure hardware models'}
                {activeMenu === 'statuses' && 'Manage hardware status options'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

// Dashboard Content Component
const DashboardContent: React.FC = () => {
  const stats = [
    { title: 'Total Hardware', value: '156', icon: Monitor, change: '+12%' },
    { title: 'Active Repairs', value: '8', icon: Wrench, change: '-3' },
    { title: 'System Users', value: '24', icon: Users, change: '+2' },
    { title: 'System Health', value: '98%', icon: CheckCircle, change: '+1%' }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-12">
              <Monitor className="h-4 w-4 mr-2" />
              Add Hardware
            </Button>
            <Button variant="outline" className="h-12">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="h-12">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Placeholder components for other pages
const HardwareContent: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Hardware Management</CardTitle>
      <CardDescription>Manage and monitor all hardware assets</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Hardware management content will be implemented here.</p>
    </CardContent>
  </Card>
)

const RepairsContent: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Repair Management</CardTitle>
      <CardDescription>Track and manage repair requests</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Repair management content will be implemented here.</p>
    </CardContent>
  </Card>
)

const AssetsContent: React.FC = () => <AssetsManagement />

const UsersContent: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>User Management</CardTitle>
      <CardDescription>Manage system users and permissions</CardDescription>
    </CardHeader>
    <CardContent>
      <p>User management content will be implemented here.</p>
    </CardContent>
  </Card>
)

const BranchesContent: React.FC = () => <BranchConfig />

const DeviceTypesContent: React.FC = () => <DeviceTypeConfig />

const MakesContent: React.FC = () => <MakeConfig />

const ModelsContent: React.FC = () => <ModelConfig />

const StatusesContent: React.FC = () => <StatusConfig />
