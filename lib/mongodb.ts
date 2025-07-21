import { MongoClient, type Db, type Collection } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/"
const dbName = "eunonia_db"

let client: MongoClient
let db: Db

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db
  }

  try {
    client = new MongoClient(uri)
    await client.connect()
    db = client.db(dbName)
    console.log("Conectado a MongoDB")
    return db
  } catch (error) {
    console.error("Error conectando a MongoDB:", error)
    throw error
  }
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close()
  }
}

// Interfaces para los documentos de MongoDB
export interface ChatbotConversation {
  _id?: string
  user_id: string
  user_type: "patient" | "psychologist" | "admin"
  timestamp: Date
  messages: {
    role: "user" | "assistant"
    content: string
    timestamp: Date
  }[]
  session_duration_minutes: number
  satisfaction_rating?: number
}

export interface SessionAnalysis {
  _id?: string
  patient_id: string
  psychologist_id: string
  session_id: string
  session_date: Date
  analysis: {
    sentiment_score: number
    key_topics: string[]
    emotional_indicators: string[]
    progress_indicators: string[]
    risk_factors: string[]
  }
  created_at: Date
}

export interface MLPrediction {
  _id?: string
  user_id: string
  prediction_date: Date
  prediction_type: "risk_level" | "mood_forecast" | "intervention_recommendation"
  input_features: Record<string, any>
  prediction_result: Record<string, any>
  confidence_score: number
  model_version: string
  created_at: Date
}

export interface SystemMetrics {
  _id?: string
  timestamp: Date
  active_users: number
  new_registrations: number
  completed_sessions: number
  chatbot_interactions: number
  system_uptime: number
  response_time_ms: number
  error_rate: number
  database_connections: number
  memory_usage_percent: number
  cpu_usage_percent: number
}

export interface ActivityLog {
  _id?: string
  user_id: string
  user_type: "patient" | "psychologist" | "admin"
  action: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: Date
}

// Funciones para conversaciones de chatbot
export async function saveChatbotConversation(conversation: ChatbotConversation): Promise<void> {
  const db = await connectToMongoDB()
  const collection: Collection<ChatbotConversation> = db.collection("chatbot_conversations")
  await collection.insertOne(conversation)
}

export async function getChatbotConversations(userId: string, limit = 10): Promise<ChatbotConversation[]> {
  const db = await connectToMongoDB()
  const collection: Collection<ChatbotConversation> = db.collection("chatbot_conversations")
  return await collection.find({ user_id: userId }).sort({ timestamp: -1 }).limit(limit).toArray()
}

export async function getChatbotStats(userId?: string): Promise<any> {
  const db = await connectToMongoDB()
  const collection: Collection<ChatbotConversation> = db.collection("chatbot_conversations")

  const matchStage = userId ? { $match: { user_id: userId } } : { $match: {} }

  const stats = await collection
    .aggregate([
      matchStage,
      {
        $group: {
          _id: null,
          total_conversations: { $sum: 1 },
          avg_duration: { $avg: "$session_duration_minutes" },
          avg_satisfaction: { $avg: "$satisfaction_rating" },
          total_messages: { $sum: { $size: "$messages" } },
        },
      },
    ])
    .toArray()

  return stats[0] || {}
}

// Funciones para análisis de sesiones
export async function saveSessionAnalysis(analysis: SessionAnalysis): Promise<void> {
  const db = await connectToMongoDB()
  const collection: Collection<SessionAnalysis> = db.collection("session_analysis")
  await collection.insertOne(analysis)
}

export async function getSessionAnalysis(patientId: string, limit = 5): Promise<SessionAnalysis[]> {
  const db = await connectToMongoDB()
  const collection: Collection<SessionAnalysis> = db.collection("session_analysis")
  return await collection.find({ patient_id: patientId }).sort({ session_date: -1 }).limit(limit).toArray()
}

// Funciones para predicciones ML
export async function saveMLPrediction(prediction: MLPrediction): Promise<void> {
  const db = await connectToMongoDB()
  const collection: Collection<MLPrediction> = db.collection("ml_predictions")
  await collection.insertOne(prediction)
}

export async function getLatestMLPrediction(userId: string, predictionType: string): Promise<MLPrediction | null> {
  const db = await connectToMongoDB()
  const collection: Collection<MLPrediction> = db.collection("ml_predictions")
  return await collection.findOne(
    { user_id: userId, prediction_type: predictionType },
    { sort: { prediction_date: -1 } },
  )
}

export async function getMLPredictions(userId: string, limit = 10): Promise<MLPrediction[]> {
  const db = await connectToMongoDB()
  const collection: Collection<MLPrediction> = db.collection("ml_predictions")
  return await collection.find({ user_id: userId }).sort({ prediction_date: -1 }).limit(limit).toArray()
}

// Funciones para métricas del sistema
export async function saveSystemMetrics(metrics: SystemMetrics): Promise<void> {
  const db = await connectToMongoDB()
  const collection: Collection<SystemMetrics> = db.collection("system_metrics")
  await collection.insertOne(metrics)
}

export async function getSystemMetrics(days = 7): Promise<SystemMetrics[]> {
  const db = await connectToMongoDB()
  const collection: Collection<SystemMetrics> = db.collection("system_metrics")
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  return await collection
    .find({ timestamp: { $gte: startDate } })
    .sort({ timestamp: -1 })
    .toArray()
}

export async function getLatestSystemMetrics(): Promise<SystemMetrics | null> {
  const db = await connectToMongoDB()
  const collection: Collection<SystemMetrics> = db.collection("system_metrics")
  return await collection.findOne({}, { sort: { timestamp: -1 } })
}

// Funciones para logs de actividad
export async function saveActivityLog(log: ActivityLog): Promise<void> {
  const db = await connectToMongoDB()
  const collection: Collection<ActivityLog> = db.collection("activity_logs")
  await collection.insertOne(log)
}

export async function getActivityLogs(userId?: string, limit = 50): Promise<ActivityLog[]> {
  const db = await connectToMongoDB()
  const collection: Collection<ActivityLog> = db.collection("activity_logs")

  const query = userId ? { user_id: userId } : {}

  return await collection.find(query).sort({ timestamp: -1 }).limit(limit).toArray()
}

export async function getActivityStats(days = 30): Promise<any> {
  const db = await connectToMongoDB()
  const collection: Collection<ActivityLog> = db.collection("activity_logs")
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const stats = await collection
    .aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            action: "$action",
            user_type: "$user_type",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])
    .toArray()

  return stats
}

// Función para análisis de texto usando IA
export async function analyzeSessionText(sessionText: string): Promise<any> {
  // Esta función se integraría con un servicio de análisis de texto
  // Por ahora, retornamos un análisis simulado
  return {
    sentiment_score: Math.random() * 2 - 1, // Entre -1 y 1
    key_topics: ["ansiedad", "trabajo", "relaciones"],
    emotional_indicators: ["estrés", "preocupación"],
    progress_indicators: ["mejora en sueño", "mayor autoestima"],
    risk_factors: [],
  }
}

// Función para generar reportes
export async function generateUserReport(userId: string, userType: string): Promise<any> {
  const db = await connectToMongoDB()

  const report: any = {
    user_id: userId,
    user_type: userType,
    generated_at: new Date(),
    data: {},
  }

  if (userType === "patient") {
    // Estadísticas de conversaciones de chatbot
    const chatbotStats = await getChatbotStats(userId)
    report.data.chatbot = chatbotStats

    // Análisis de sesiones recientes
    const sessionAnalysis = await getSessionAnalysis(userId, 5)
    report.data.session_analysis = sessionAnalysis

    // Predicciones ML recientes
    const predictions = await getMLPredictions(userId, 5)
    report.data.ml_predictions = predictions
  } else if (userType === "psychologist") {
    // Estadísticas de actividad
    const activityLogs = await getActivityLogs(userId, 100)
    report.data.activity_summary = activityLogs
  } else if (userType === "admin") {
    // Métricas del sistema
    const systemMetrics = await getSystemMetrics(30)
    report.data.system_metrics = systemMetrics

    // Estadísticas de actividad general
    const activityStats = await getActivityStats(30)
    report.data.activity_stats = activityStats
  }

  return report
}
