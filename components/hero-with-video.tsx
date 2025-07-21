"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Heart, Play, ChevronDown, Users, Brain, Clock } from "lucide-react"
import Link from "next/link"

export function HeroWithVideo() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <section
      className="relative py-20 px-4 min-h-screen flex items-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1)), url(/images/hero-background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container mx-auto text-center relative z-10">
        <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200 backdrop-blur-sm">
          Plataforma de Salud Mental con IA
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-shadow">
          Tu bienestar mental es nuestra{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">prioridad</span>
        </h1>

        <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto backdrop-blur-sm bg-white/20 p-4 rounded-lg">
          Eunonia combina inteligencia artificial avanzada con atención profesional para ofrecerte una experiencia
          personalizada de cuidado mental y bienestar emocional.
        </p>

        {/* Estadísticas destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-purple-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">1000+</span>
            </div>
            <p className="text-sm text-gray-600">Pacientes Atendidos</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <Brain className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">50+</span>
            </div>
            <p className="text-sm text-gray-600">Psicólogos Certificados</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">24/7</span>
            </div>
            <p className="text-sm text-gray-600">Soporte IA</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/auth/register">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 shadow-lg">
              Comenzar Tu Viaje
              <Heart className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="bg-white/80 backdrop-blur-sm shadow-lg">
                <Play className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Video demo de Eunonia</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-gray-600" />
        </div>
      </div>
    </section>
  )
}
