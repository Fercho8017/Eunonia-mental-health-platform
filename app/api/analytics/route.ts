import { type NextRequest, NextResponse } from "next/server"
import { getSystemMetrics, getChatbotStats, getActivityStats } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "overview"
    const days = Number.parseInt(searchParams.get("days") || "7")
    const user_id = searchParams.get("user_id")

    let analytics: any = {}

    switch (type) {
      case "overview":
        // Métricas generales del sistema
        const systemMetrics = await getSystemMetrics(days)
        const latestMetrics = systemMetrics[0] || {}

        analytics = {
          system_health: {
            uptime: latestMetrics.system_uptime || 99.5,
            response_time: latestMetrics.response_time_ms || 1200,
            error_rate: latestMetrics.error_rate || 0.5,
            active_users: latestMetrics.active_users || 0,
          },
          usage_stats: {
            total_sessions: systemMetrics.reduce((sum, m) => sum + (m.completed_sessions || 0), 0),
            chatbot_interactions: systemMetrics.reduce((sum, m) => sum + (m.chatbot_interactions || 0), 0),
            new_registrations: systemMetrics.reduce((sum, m) => sum + (m.new_registrations || 0), 0),
          },
          trends: systemMetrics.map((m) => ({
            date: m.timestamp,
            active_users: m.active_users,
            sessions: m.completed_sessions,
            interactions: m.chatbot_interactions,
          })),
        }
        break

      case "chatbot":
        // Estadísticas del chatbot
        const chatbotStats = await getChatbotStats(user_id)
        analytics = {
          chatbot_performance: chatbotStats,
          user_satisfaction: chatbotStats.avg_satisfaction || 0,
          usage_patterns: {
            avg_session_duration: chatbotStats.avg_duration || 0,
            total_conversations: chatbotStats.total_conversations || 0,
            messages_per_session: chatbotStats.total_messages / (chatbotStats.total_conversations || 1),
          },
        }
        break

      case "activity":
        // Estadísticas de actividad
        const activityStats = await getActivityStats(days)
        analytics = {
          user_activity: activityStats,
          most_common_actions: activityStats.slice(0, 10),
          activity_by_user_type: activityStats.reduce((acc: any, stat: any) => {
            const userType = stat._id.user_type
            if (!acc[userType]) acc[userType] = 0
            acc[userType] += stat.count
            return acc
          }, {}),
        }
        break

      case "patient":
        if (!user_id) {
          return NextResponse.json({ error: "user_id requerido para análisis de paciente" }, { status: 400 })
        }

        // Análisis específico del paciente
        analytics = {
          patient_progress: {
            // Aquí se integrarían los datos de Supabase con MongoDB
            mood_trends: [], // Datos de mood_logs
            session_effectiveness: [], // Datos de therapy_sessions
            chatbot_usage: await getChatbotStats(user_id),
            risk_predictions: [], // Datos de ML predictions
          },
        }
        break

      case "psychologist":
        if (!user_id) {
          return NextResponse.json({ error: "user_id requerido para análisis de psicólogo" }, { status: 400 })
        }

        analytics = {
          psychologist_performance: {
            patient_outcomes: [],
            session_ratings: [],
            workload_analysis: [],
            effectiveness_metrics: [],
          },
        }
        break

      default:
        return NextResponse.json({ error: "Tipo de análisis no válido" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      type,
      period_days: days,
      generated_at: new Date().toISOString(),
      analytics,
    })
  } catch (error) {
    console.error("Error en analytics:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
