import { type NextRequest, NextResponse } from "next/server"
import { saveMLPrediction, getLatestMLPrediction } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, prediction_type, input_features } = body

    // Simular predicción ML (en producción, esto llamaría al modelo Python)
    let prediction_result: any = {}
    let confidence_score = 0

    switch (prediction_type) {
      case "risk_level":
        // Simular predicción de nivel de riesgo
        const riskScore = Math.random()
        if (riskScore > 0.7) {
          prediction_result = { risk_level: "high", probability: riskScore }
        } else if (riskScore > 0.4) {
          prediction_result = { risk_level: "medium", probability: riskScore }
        } else {
          prediction_result = { risk_level: "low", probability: riskScore }
        }
        confidence_score = riskScore
        break

      case "mood_forecast":
        // Simular predicción de estado de ánimo futuro
        const currentMood = input_features.mood_score || 5
        const forecast = Math.max(1, Math.min(10, currentMood + (Math.random() - 0.5) * 2))
        prediction_result = {
          predicted_mood: Math.round(forecast * 10) / 10,
          trend: forecast > currentMood ? "improving" : "declining",
        }
        confidence_score = 0.75 + Math.random() * 0.2
        break

      case "intervention_recommendation":
        // Simular recomendaciones de intervención
        const recommendations = [
          "Incrementar frecuencia de sesiones terapéuticas",
          "Implementar técnicas de mindfulness",
          "Mejorar higiene del sueño",
          "Aumentar actividad física",
          "Fortalecer red de apoyo social",
        ]
        prediction_result = {
          recommendations: recommendations.slice(0, Math.floor(Math.random() * 3) + 2),
          priority_level: Math.floor(Math.random() * 3) + 1,
        }
        confidence_score = 0.8 + Math.random() * 0.15
        break

      default:
        return NextResponse.json({ error: "Tipo de predicción no válido" }, { status: 400 })
    }

    // Guardar predicción en MongoDB
    const mlPrediction = {
      user_id,
      prediction_date: new Date(),
      prediction_type,
      input_features,
      prediction_result,
      confidence_score,
      model_version: "1.0.0",
      created_at: new Date(),
    }

    await saveMLPrediction(mlPrediction)

    return NextResponse.json({
      success: true,
      prediction: prediction_result,
      confidence: confidence_score,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en predicción ML:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    const prediction_type = searchParams.get("prediction_type")

    if (!user_id || !prediction_type) {
      return NextResponse.json({ error: "Parámetros requeridos: user_id, prediction_type" }, { status: 400 })
    }

    const latestPrediction = await getLatestMLPrediction(user_id, prediction_type)

    if (!latestPrediction) {
      return NextResponse.json({ error: "No se encontraron predicciones" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      prediction: latestPrediction,
    })
  } catch (error) {
    console.error("Error obteniendo predicción ML:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
