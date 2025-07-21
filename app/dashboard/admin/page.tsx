"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Brain,
  Users,
  Shield,
  BarChart3,
  MessageCircle,
  Search,
  LogOut,
  Plus,
  Settings,
  AlertTriangle,
} from "lucide-react"
import { ChatBot } from "@/components/chat-bot"
import Link from "next/link"

export default function AdminDashboard() {
  const [showChat, setShowChat] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState("all")

  const systemStats = {
    totalUsers: 1247,
    activePatients: 892,
    activePsychologists: 45,
    totalSessions: 15678,
    systemUptime: "99.9%",
    avgResponseTime: "1.2s",
  }

  const users = [
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan@email.com",
      type: "patient",
      status: "active",
      lastLogin: "2024-01-22",
      sessionsCount: 12,
    },
    {
      id: 2,
      name: "Dr. María García",
      email: "maria@email.com",
      type: "psychologist",
      status: "active",
      lastLogin: "2024-01-22",
      patientsCount: 24,
    },
    {
      id: 3,
      name: "Ana Martínez",
      email: "ana@email.com",
      type: "patient",
      status: "inactive",
      lastLogin: "2024-01-15",
      sessionsCount: 3,
    },
    {
      id: 4,
      name: "Dr. Carlos Ruiz",
      email: "carlos@email.com",
      type: "psychologist",
      status: "active",
      lastLogin: "2024-01-21",
      patientsCount: 18,
    },
  ]

  const systemAlerts = [
    {
      id: 1,
      type: "warning",
      message: "Alto volumen de usuarios conectados simultáneamente",
      timestamp: "2024-01-22 14:30",
    },
    {
      id: 2,
      type: "info",
      message: "Actualización del sistema programada para mañana",
      timestamp: "2024-01-22 12:15",
    },
    {
      id: 3,
      type: "error",
      message: "Fallo temporal en el servicio de notificaciones",
      timestamp: "2024-01-22 10:45",
    },
  ]

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Activo</Badge>
    ) : (
      <Badge variant="secondary">Inactivo</Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "patient":
        return <Badge className="bg-blue-100 text-blue-800">Paciente</Badge>
      case "psychologist":
        return <Badge className="bg-purple-100 text-purple-800">Psicólogo</Badge>
      case "admin":
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = userFilter === "all" || user.type === userFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Sistema Eunonia</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowChat(!showChat)} className="bg-purple-600 hover:bg-purple-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Asistente IA
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
            <Link href="/auth/login">
              <Button variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 p-6 transition-all duration-300 ${showChat ? "mr-96" : ""}`}>
          {/* System Stats */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Usuarios Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+12% este mes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pacientes Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.activePatients}</p>
                    <p className="text-xs text-green-600">+8% este mes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Psicólogos Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.activePsychologists}</p>
                    <p className="text-xs text-green-600">+3 este mes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Sesiones Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{systemStats.totalSessions.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+15% este mes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Uptime del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{systemStats.systemUptime}</p>
                    <p className="text-xs text-green-600">Excelente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Tiempo de Respuesta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">⚡</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{systemStats.avgResponseTime}</p>
                    <p className="text-xs text-green-600">Óptimo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Alerts */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                Alertas del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Gestión de Usuarios
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar usuario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="patient">Pacientes</SelectItem>
                      <SelectItem value="psychologist">Psicólogos</SelectItem>
                      <SelectItem value="admin">Administradores</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getTypeBadge(user.type)}
                      {getStatusBadge(user.status)}
                      <div className="text-right text-sm text-gray-600">
                        <p>Último acceso:</p>
                        <p>{user.lastLogin}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {user.type === "patient" ? (
                          <>
                            <p>Sesiones:</p>
                            <p className="font-medium">{user.sessionsCount}</p>
                          </>
                        ) : user.type === "psychologist" ? (
                          <>
                            <p>Pacientes:</p>
                            <p className="font-medium">{user.patientsCount}</p>
                          </>
                        ) : null}
                      </div>
                      <Button size="sm" variant="outline">
                        Gestionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg z-50">
            <ChatBot onClose={() => setShowChat(false)} userType="admin" />
          </div>
        )}
      </div>
    </div>
  )
}
