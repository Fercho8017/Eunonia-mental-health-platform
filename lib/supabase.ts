import { createClient } from "@supabase/supabase-js"

// Verificar que las variables de entorno estén disponibles
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de datos
export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  user_type: "patient" | "psychologist" | "admin"
  phone?: string
  date_of_birth?: string
  gender?: string
  emergency_contact?: any
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  assigned_psychologist?: string
  medical_history?: any
  current_medications?: any
  emergency_contact?: any
  insurance_info?: any
  risk_level: "low" | "medium" | "high"
  status: "active" | "inactive" | "suspended"
  created_at: string
}

export interface Psychologist {
  id: string
  license_number: string
  specializations: string[]
  years_experience: number
  education?: any
  certifications?: any
  consultation_fee: number
  availability?: any
  bio?: string
  rating: number
  total_patients: number
  created_at: string
}

export interface TherapySession {
  id: string
  patient_id: string
  psychologist_id: string
  session_date: string
  duration_minutes: number
  session_type: "individual" | "group" | "emergency" | "follow_up"
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  notes?: string
  patient_feedback?: number
  therapist_rating?: number
  created_at: string
  updated_at: string
}

export interface MoodLog {
  id: string
  patient_id: string
  log_date: string
  mood_score: number
  anxiety_level?: number
  sleep_hours?: number
  exercise_minutes?: number
  social_interaction?: boolean
  notes?: string
  created_at: string
}

// Funciones de autenticación
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Funciones para perfiles de usuario
export const createUserProfile = async (profile: Partial<UserProfile>) => {
  const { data, error } = await supabase.from("user_profiles").insert([profile]).select()
  return { data, error }
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase.from("user_profiles").update(updates).eq("id", userId).select()
  return { data, error }
}

// Funciones para pacientes
export const createPatient = async (patient: Partial<Patient>) => {
  const { data, error } = await supabase.from("patients").insert([patient]).select()
  return { data, error }
}

export const getPatient = async (patientId: string) => {
  const { data, error } = await supabase
    .from("patients")
    .select(`
      *,
      user_profiles (*)
    `)
    .eq("id", patientId)
    .single()
  return { data, error }
}

export const getPatientsByPsychologist = async (psychologistId: string) => {
  const { data, error } = await supabase
    .from("patients")
    .select(`
      *,
      user_profiles (*)
    `)
    .eq("assigned_psychologist", psychologistId)
  return { data, error }
}

export const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
  const { data, error } = await supabase.from("patients").update(updates).eq("id", patientId).select()
  return { data, error }
}

// Funciones para psicólogos
export const createPsychologist = async (psychologist: Partial<Psychologist>) => {
  const { data, error } = await supabase.from("psychologists").insert([psychologist]).select()
  return { data, error }
}

export const getPsychologist = async (psychologistId: string) => {
  const { data, error } = await supabase
    .from("psychologists")
    .select(`
      *,
      user_profiles (*)
    `)
    .eq("id", psychologistId)
    .single()
  return { data, error }
}

export const getAllPsychologists = async () => {
  const { data, error } = await supabase.from("psychologists").select(`
      *,
      user_profiles (*)
    `)
  return { data, error }
}

// Funciones para sesiones de terapia
export const createTherapySession = async (session: Partial<TherapySession>) => {
  const { data, error } = await supabase.from("therapy_sessions").insert([session]).select()
  return { data, error }
}

export const getTherapySessions = async (userId: string, userType: string) => {
  const column = userType === "patient" ? "patient_id" : "psychologist_id"
  const { data, error } = await supabase
    .from("therapy_sessions")
    .select(`
      *,
      patients!patient_id (
        *,
        user_profiles (*)
      ),
      psychologists!psychologist_id (
        *,
        user_profiles (*)
      )
    `)
    .eq(column, userId)
    .order("session_date", { ascending: false })
  return { data, error }
}

export const updateTherapySession = async (sessionId: string, updates: Partial<TherapySession>) => {
  const { data, error } = await supabase.from("therapy_sessions").update(updates).eq("id", sessionId).select()
  return { data, error }
}

// Funciones para registros de estado de ánimo
export const createMoodLog = async (moodLog: Partial<MoodLog>) => {
  const { data, error } = await supabase.from("mood_logs").insert([moodLog]).select()
  return { data, error }
}

export const getMoodLogs = async (patientId: string, limit?: number) => {
  let query = supabase.from("mood_logs").select("*").eq("patient_id", patientId).order("log_date", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query
  return { data, error }
}

export const updateMoodLog = async (logId: string, updates: Partial<MoodLog>) => {
  const { data, error } = await supabase.from("mood_logs").update(updates).eq("id", logId).select()
  return { data, error }
}

// Funciones de estadísticas
export const getPatientStats = async (patientId: string) => {
  const { data: moodData, error: moodError } = await supabase
    .from("mood_logs")
    .select("mood_score, anxiety_level, log_date")
    .eq("patient_id", patientId)
    .order("log_date", { ascending: false })
    .limit(30)

  const { data: sessionData, error: sessionError } = await supabase
    .from("therapy_sessions")
    .select("session_date, status, patient_feedback")
    .eq("patient_id", patientId)
    .order("session_date", { ascending: false })
    .limit(10)

  return {
    moodData,
    sessionData,
    errors: { moodError, sessionError },
  }
}

export const getPsychologistStats = async (psychologistId: string) => {
  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select("id, risk_level, status")
    .eq("assigned_psychologist", psychologistId)

  const { data: sessions, error: sessionsError } = await supabase
    .from("therapy_sessions")
    .select("session_date, status, therapist_rating")
    .eq("psychologist_id", psychologistId)
    .gte("session_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  return {
    patients,
    sessions,
    errors: { patientsError, sessionsError },
  }
}
