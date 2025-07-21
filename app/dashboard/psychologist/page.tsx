"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Brain, Users, Calendar, BarChart3, MessageCircle, Search, LogOut, Plus } from "lucide-react"
import { ChatBot } from "@/components/chat-bot"
import Link from "next/link"

export default function PsychologistDashboard() {
  const [showChat, setShowChat] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const patients = [
    {
      id: 1,
      name: "Juan Pérez",
      lastSession: "2024-01-20",
      nextSession: "2024-01-25",
      status: "Activo",
      progress: 75,
      riskLevel: "Bajo",
    },
    {
      id: 2,
      name: "María González",
      lastSession: "2024-01-18",
      nextSession: "2024-01-24",
      status: "Activo",
      progress: 60,
      riskLevel: "Medio",
    },
    {
      id: 3,
      name: "Carlos Ruiz",
      lastSession: "2024-01-15",
      nextSession: "2024-01-26",
      status: "Pendiente",
      progress: 40,
      riskLevel: "Alto",
    },
  ]

  const todayAppointments = [
    { id: 1, patient: "Juan Pérez", time: "10:00 AM", type: "Sesión Individual", duration: "50 min" },
    { id: 2, patient: "Ana Martínez", time: "2:00 PM", type: "Seguimiento", duration: "30 min" },
    { id: 3, patient: "Luis García", time: "4:00 PM", type: "Primera Consulta", duration: "60 min" },
  ]

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "Alto":
        return "bg-red-100 text-red-800"
      case "Medio":
        return "bg-yellow-100 text-yellow-800"
      case "Bajo":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel del Psicólogo</h1>
              <p className="text-gray-600">Dr. María García</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowChat(!showChat)} className="bg-purple-600 hover:bg-purple-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Asistente IA
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
          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pacientes Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-xs text-green-600">+2 este mes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Citas Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs text-gray-600">2 completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Progreso Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-xs text-green-600">+5% vs mes anterior</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-xs text-red-600">Requieren atención</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Appointments */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Citas de Hoy
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Cita
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {appointment.patient
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{appointment.patient}</h3>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.time}</p>
                      <p className="text-sm text-gray-600">{appointment.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Patient Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-500" />
                  Gestión de Pacientes
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar paciente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Paciente
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{patient.name}</h3>
                        <p className="text-sm text-gray-600">Última sesión: {patient.lastSession}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Progreso</p>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${patient.progress}%` }} />
                        </div>
                      </div>
                      <Badge className={getRiskBadgeColor(patient.riskLevel)}>{patient.riskLevel}</Badge>
                      <Badge variant={patient.status === "Activo" ? "default" : "secondary"}>{patient.status}</Badge>
                      <Button size="sm" variant="outline">
                        Ver Perfil
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
            <ChatBot onClose={() => setShowChat(false)} userType="psychologist" />
          </div>
        )}
      </div>
    </div>
  )
}
