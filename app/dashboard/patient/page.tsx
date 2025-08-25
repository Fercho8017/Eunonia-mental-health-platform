"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, MessageCircle, Calendar, BarChart3, Heart, Smile, Frown, Meh, LogOut } from "lucide-react"
import { ChatBot } from "@/components/chat-bot"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PatientDashboard() {
  const [showChat, setShowChat] = useState(false)
  const [currentMood, setCurrentMood] = useState<"happy" | "neutral" | "sad" | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true) // Estado para mostrar el cargando
  const router = useRouter()

  // Datos de ejemplo para la gráfica y citas
  const moodData = [
    { day: "Lun", mood: 7 },
    { day: "Mar", mood: 6 },
    { day: "Mié", mood: 8 },
    { day: "Jue", mood: 5 },
    { day: "Vie", mood: 7 },
    { day: "Sáb", mood: 9 },
    { day: "Dom", mood: 8 },
  ]

  const upcomingAppointments = [
    { id: 1, psychologist: "Dr. María García", date: "2024-01-25", time: "10:00 AM", type: "Sesión Individual" },
    { id: 2, psychologist: "Dr. Carlos Ruiz", date: "2024-01-28", time: "2:00 PM", type: "Seguimiento" },
  ]

  // Función para obtener el nombre del usuario logueado
  const fetchUserProfile = async () => {
    const userId = localStorage.getItem("user_id")
    if (!userId) {
      router.push("/auth/login")
      return
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("first_name")
      .eq("id", userId)
      .single()

    if (error || !data) {
      console.error("Error al obtener el perfil del usuario:", error)
      router.push("/auth/login")
      return
    }

    setUserName(data.first_name)
    setLoading(false)
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user_id")
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel del Paciente</h1>
              <p className="text-gray-600">Bienvenido de vuelta, {loading ? "Cargando..." : userName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowChat(!showChat)} className="bg-purple-600 hover:bg-purple-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat IA
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 p-6 transition-all duration-300 ${showChat ? "mr-96" : ""}`}>
          {/* Quick Mood Check */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                ¿Cómo te sientes hoy?
              </CardTitle>
              <CardDescription>Registra tu estado de ánimo actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button
                  variant={currentMood === "happy" ? "default" : "outline"}
                  onClick={() => setCurrentMood("happy")}
                  className="flex-1"
                >
                  <Smile className="h-5 w-5 mr-2" />
                  Bien
                </Button>
                <Button
                  variant={currentMood === "neutral" ? "default" : "outline"}
                  onClick={() => setCurrentMood("neutral")}
                  className="flex-1"
                >
                  <Meh className="h-5 w-5 mr-2" />
                  Regular
                </Button>
                <Button
                  variant={currentMood === "sad" ? "default" : "outline"}
                  onClick={() => setCurrentMood("sad")}
                  className="flex-1"
                >
                  <Frown className="h-5 w-5 mr-2" />
                  Mal
                </Button>
              </div>
              {currentMood && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ¡Gracias por compartir! Tu estado de ánimo ha sido registrado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progreso Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sesiones Completadas</span>
                      <span>3/4</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Ejercicios de Mindfulness</span>
                      <span>5/7</span>
                    </div>
                    <Progress value={71} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Registro de Emociones</span>
                      <span>6/7</span>
                    </div>
                    <Progress value={86} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mood Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado de Ánimo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {moodData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{day.day}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(day.mood / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{day.mood}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Días consecutivos</span>
                    <Badge variant="secondary">12 días</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sesiones totales</span>
                    <Badge variant="secondary">24</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mejora general</span>
                    <Badge className="bg-green-100 text-green-800">+15%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Próximas Citas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{appointment.psychologist}</h3>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.date}</p>
                      <p className="text-sm text-gray-600">{appointment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                Recomendaciones Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Ejercicio de Respiración</h4>
                  <p className="text-sm text-blue-700">
                    Basado en tu estado de ánimo, te recomendamos 5 minutos de respiración profunda.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Actividad Física</h4>
                  <p className="text-sm text-green-700">
                    Una caminata de 15 minutos puede mejorar tu estado de ánimo significativamente.
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900">Meditación Guiada</h4>
                  <p className="text-sm text-purple-700">Prueba nuestra nueva sesión de meditación para la ansiedad.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg z-50">
            <ChatBot onClose={() => setShowChat(false)} userType="patient" />
          </div>
        )}
      </div>
    </div>
  )
}
