import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, MessageCircle, Calendar, BarChart3, Shield, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { HeroWithVideo } from "@/components/hero-with-video"
import { ImageSection } from "@/components/image-section"

export default function HomePage() {
  const features = [
    {
      icon: MessageCircle,
      title: "Chatbot IA 24/7",
      description: "Asistente inteligente disponible en todo momento para apoyo inmediato y orientación personalizada.",
    },
    {
      icon: Calendar,
      title: "Citas con Profesionales",
      description: "Agenda sesiones con psicólogos certificados según tu disponibilidad y necesidades específicas.",
    },
    {
      icon: BarChart3,
      title: "Seguimiento de Progreso",
      description: "Monitorea tu bienestar mental con herramientas de análisis y reportes detallados de tu evolución.",
    },
    {
      icon: Shield,
      title: "Privacidad Garantizada",
      description: "Tus datos están protegidos con los más altos estándares de seguridad y confidencialidad médica.",
    },
  ]

  const steps = [
    {
      number: "01",
      title: "Registro Personalizado",
      description: "Crea tu perfil y completa una evaluación inicial para personalizar tu experiencia de bienestar.",
    },
    {
      number: "02",
      title: "Conexión Inteligente",
      description: "Nuestro algoritmo te conecta con el psicólogo más adecuado según tus necesidades específicas.",
    },
    {
      number: "03",
      title: "Apoyo Continuo",
      description:
        "Recibe seguimiento constante a través de sesiones programadas y nuestro chatbot IA disponible 24/7.",
    },
  ]

  const testimonials = [
    {
      name: "María González",
      role: "Paciente",
      content:
        "Eunonia me ayudó a encontrar el apoyo que necesitaba. El chatbot IA está siempre disponible y mi psicóloga es increíble.",
      rating: 5,
    },
    {
      name: "Dr. Carlos Ruiz",
      role: "Psicólogo",
      content:
        "Como profesional, las herramientas de análisis de Eunonia me permiten brindar un mejor seguimiento a mis pacientes.",
      rating: 5,
    },
    {
      name: "Ana Martínez",
      role: "Paciente",
      content: "La plataforma es muy fácil de usar y me siento segura sabiendo que mis datos están protegidos.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">Eunonia</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                Características
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">
                Cómo Funciona
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-purple-600 transition-colors">
                Testimonios
              </a>
              <Button asChild variant="outline">
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Registrarse</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroWithVideo />

      {/* Features Section */}
      <section
        id="features"
        className="py-20 relative"
        style={{
          backgroundImage: `url('/images/mental-wellness.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/95 to-purple-50/95"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <Badge variant="secondary" className="mb-4">
              Características Principales
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que Necesitas para tu Bienestar Mental
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestra plataforma combina tecnología avanzada con atención humana profesional para ofrecerte el mejor
              cuidado de salud mental.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/90 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Image Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <ImageSection
            title="Terapia Profesional Personalizada"
            description="Conectamos con psicólogos certificados que entienden tus necesidades específicas. Cada sesión está diseñada para ayudarte a alcanzar tus objetivos de bienestar mental con un enfoque personalizado y basado en evidencia."
            imageSrc="/images/professional-therapy.png"
            imageAlt="Sesión de terapia profesional"
          >
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary">Psicólogos Certificados</Badge>
              <Badge variant="secondary">Terapia Personalizada</Badge>
              <Badge variant="secondary">Enfoque Basado en Evidencia</Badge>
            </div>
          </ImageSection>

          <ImageSection
            title="Mindfulness y Bienestar Integral"
            description="Incorporamos técnicas de mindfulness y meditación en tu proceso de sanación. Nuestras herramientas te ayudan a desarrollar una mayor conciencia emocional y a encontrar paz interior en tu día a día."
            imageSrc="/images/mindfulness-nature.png"
            imageAlt="Práctica de mindfulness en la naturaleza"
            reverse={true}
          >
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary">Meditación Guiada</Badge>
              <Badge variant="secondary">Técnicas de Relajación</Badge>
              <Badge variant="secondary">Bienestar Integral</Badge>
            </div>
          </ImageSection>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 relative"
        style={{
          backgroundImage: `url('/images/digital-health.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-blue-900/90"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Proceso Simple
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Cómo Funciona Eunonia</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              En solo tres pasos simples, puedes comenzar tu camino hacia el bienestar mental con el apoyo de
              profesionales y tecnología avanzada.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center animate-fadeInUp" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-blue-100">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 relative"
        style={{
          backgroundImage: `url('/images/support-community.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-blue-50/95"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <Badge variant="secondary" className="mb-4">
              Testimonios
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Lo que Dicen Nuestros Usuarios</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Miles de personas han encontrado el apoyo que necesitaban a través de nuestra plataforma. Estas son
              algunas de sus experiencias.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/90 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 relative"
        style={{
          backgroundImage: `url('/images/new-beginnings.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-blue-900/90"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="animate-fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Comienza tu Camino hacia el Bienestar Mental Hoy
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              No esperes más para cuidar tu salud mental. Únete a miles de personas que ya han encontrado el apoyo que
              necesitaban con Eunonia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-blue-50 text-lg px-8 py-4">
                <Link href="/auth/register">
                  Registrarse Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4 backdrop-blur-sm bg-transparent"
              >
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-8 w-8 text-purple-400" />
                <span className="text-xl font-bold">Eunonia</span>
              </div>
              <p className="text-gray-400">Tu plataforma de confianza para el bienestar mental y la salud emocional.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terapia Online
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Chatbot IA
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Seguimiento
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Recursos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Términos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>soporte@eunonia.com</li>
                <li>+1 (555) 123-4567</li>
                <li>Disponible 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Eunonia. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
