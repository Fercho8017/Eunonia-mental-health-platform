"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Send, Bot, User, Brain, Heart, Shield } from "lucide-react"
import { useChat } from "ai/react"

interface ChatBotProps {
  onClose: () => void
  userType: "patient" | "psychologist" | "admin"
}

export function ChatBot({ onClose, userType }: ChatBotProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: getWelcomeMessage(userType),
      },
    ],
  })

  function getWelcomeMessage(type: string) {
    switch (type) {
      case "patient":
        return "¡Hola! Soy tu asistente de bienestar mental. Estoy aquí para apoyarte, escucharte y ayudarte con técnicas de relajación, seguimiento de tu estado de ánimo, o simplemente para conversar. ¿En qué puedo ayudarte hoy?"
      case "psychologist":
        return "¡Hola, Doctor/a! Soy tu asistente especializado. Puedo ayudarte con análisis de patrones de pacientes, sugerencias de tratamiento basadas en evidencia, preparación de sesiones, y análisis de datos clínicos. ¿Cómo puedo asistirte?"
      case "admin":
        return "¡Hola, Administrador! Soy tu asistente del sistema. Puedo ayudarte con análisis de métricas, gestión de usuarios, reportes del sistema, y optimización de recursos. ¿Qué necesitas revisar hoy?"
      default:
        return "¡Hola! ¿Cómo puedo ayudarte hoy?"
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case "patient":
        return <Heart className="h-5 w-5 text-red-500" />
      case "psychologist":
        return <Brain className="h-5 w-5 text-purple-500" />
      case "admin":
        return <Shield className="h-5 w-5 text-blue-500" />
      default:
        return <Bot className="h-5 w-5 text-gray-500" />
    }
  }

  function getTitle(type: string) {
    switch (type) {
      case "patient":
        return "Asistente de Bienestar"
      case "psychologist":
        return "Asistente Clínico"
      case "admin":
        return "Asistente del Sistema"
      default:
        return "Asistente IA"
    }
  }

  const quickActions = {
    patient: [
      "Ejercicios de respiración",
      "Registro de estado de ánimo",
      "Técnicas de relajación",
      "Consejos para dormir mejor",
    ],
    psychologist: [
      "Análisis de progreso del paciente",
      "Sugerencias de tratamiento",
      "Recursos terapéuticos",
      "Interpretación de datos",
    ],
    admin: ["Reporte de usuarios activos", "Métricas del sistema", "Análisis de uso", "Estado del servidor"],
  }

  const handleQuickAction = (action: string) => {
    handleInputChange({ target: { value: action } } as any)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            {getIcon(userType)}
            <span className="ml-2">{getTitle(userType)}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="secondary" className="w-fit">
          IA Especializada en Salud Mental
        </Badge>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === "assistant" && <Bot className="h-4 w-4 mt-0.5 text-purple-600" />}
                {message.role === "user" && <User className="h-4 w-4 mt-0.5 text-white" />}
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-purple-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <p className="text-sm text-gray-600 mb-2">Acciones rápidas:</p>
        <div className="grid grid-cols-1 gap-2 mb-4">
          {quickActions[userType].map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-left justify-start h-auto py-2 px-3 bg-transparent"
              onClick={() => handleQuickAction(action)}
            >
              <span className="text-xs">{action}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
