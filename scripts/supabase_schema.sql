-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'psychologist', 'admin')),
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('M', 'F', 'Other')),
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de psicólogos
CREATE TABLE IF NOT EXISTS public.psychologists (
    id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    license_number TEXT UNIQUE NOT NULL,
    specializations TEXT[] DEFAULT '{}',
    years_experience INTEGER DEFAULT 0,
    education JSONB DEFAULT '{}',
    certifications JSONB DEFAULT '{}',
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    availability JSONB DEFAULT '{}',
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 10),
    total_patients INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
    assigned_psychologist UUID REFERENCES public.psychologists(id),
    medical_history JSONB DEFAULT '{}',
    current_medications JSONB DEFAULT '{}',
    emergency_contact JSONB DEFAULT '{}',
    insurance_info JSONB DEFAULT '{}',
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    consent_given BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones de terapia
CREATE TABLE IF NOT EXISTS public.therapy_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    psychologist_id UUID REFERENCES public.psychologists(id) ON DELETE CASCADE NOT NULL,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    session_type TEXT NOT NULL CHECK (session_type IN ('individual', 'group', 'emergency', 'follow_up', 'assessment')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    patient_feedback INTEGER CHECK (patient_feedback >= 1 AND patient_feedback <= 10),
    therapist_rating INTEGER CHECK (therapist_rating >= 1 AND therapist_rating <= 10),
    session_goals TEXT[],
    homework_assigned TEXT,
    next_session_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de registros de estado de ánimo
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL,
    mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
    anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    exercise_minutes INTEGER DEFAULT 0 CHECK (exercise_minutes >= 0),
    social_interaction BOOLEAN DEFAULT FALSE,
    medication_taken BOOLEAN DEFAULT FALSE,
    significant_events TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, log_date)
);

-- Tabla de objetivos terapéuticos
CREATE TABLE IF NOT EXISTS public.therapy_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    psychologist_id UUID REFERENCES public.psychologists(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    milestones JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recursos terapéuticos
CREATE TABLE IF NOT EXISTS public.therapy_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('article', 'video', 'audio', 'exercise', 'worksheet', 'book')),
    content_url TEXT,
    tags TEXT[],
    target_conditions TEXT[],
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration_minutes INTEGER,
    created_by UUID REFERENCES public.psychologists(id),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asignación de recursos a pacientes
CREATE TABLE IF NOT EXISTS public.patient_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    resource_id UUID REFERENCES public.therapy_resources(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES public.psychologists(id) ON DELETE CASCADE NOT NULL,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'skipped')),
    completion_date TIMESTAMP WITH TIME ZONE,
    patient_rating INTEGER CHECK (patient_rating >= 1 AND patient_rating <= 10),
    patient_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, resource_id)
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('appointment', 'reminder', 'alert', 'system', 'achievement')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_patients_assigned_psychologist ON public.patients(assigned_psychologist);
CREATE INDEX IF NOT EXISTS idx_patients_risk_level ON public.patients(risk_level);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_patient_date ON public.therapy_sessions(patient_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_psychologist_date ON public.therapy_sessions(psychologist_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_patient_date ON public.mood_logs(patient_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_psychologists_updated_at BEFORE UPDATE ON public.psychologists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_therapy_sessions_updated_at BEFORE UPDATE ON public.therapy_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_therapy_goals_updated_at BEFORE UPDATE ON public.therapy_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_therapy_resources_updated_at BEFORE UPDATE ON public.therapy_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_resources_updated_at BEFORE UPDATE ON public.patient_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para patients
CREATE POLICY "Patients can view own data" ON public.patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Psychologists can view assigned patients" ON public.patients FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND user_type = 'psychologist'
    ) AND assigned_psychologist = auth.uid()
);
CREATE POLICY "Admins can view all patients" ON public.patients FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND user_type = 'admin'
    )
);

-- Políticas para psychologists
CREATE POLICY "Psychologists can view own data" ON public.psychologists FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Patients can view assigned psychologist" ON public.psychologists FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.patients 
        WHERE id = auth.uid() AND assigned_psychologist = psychologists.id
    )
);

-- Políticas para therapy_sessions
CREATE POLICY "Patients can view own sessions" ON public.therapy_sessions FOR SELECT USING (
    patient_id = auth.uid()
);
CREATE POLICY "Psychologists can view their sessions" ON public.therapy_sessions FOR SELECT USING (
    psychologist_id = auth.uid()
);

-- Políticas para mood_logs
CREATE POLICY "Patients can manage own mood logs" ON public.mood_logs FOR ALL USING (
    patient_id = auth.uid()
);
CREATE POLICY "Psychologists can view assigned patients mood logs" ON public.mood_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.patients 
        WHERE id = patient_id AND assigned_psychologist = auth.uid()
    )
);

-- Políticas para notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (
    user_id = auth.uid()
);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (
    user_id = auth.uid()
);

-- Funciones auxiliares
CREATE OR REPLACE FUNCTION get_user_type(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_type_result TEXT;
BEGIN
    SELECT user_type INTO user_type_result
    FROM public.user_profiles
    WHERE id = user_uuid;
    
    RETURN user_type_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para calcular estadísticas de paciente
CREATE OR REPLACE FUNCTION get_patient_stats(patient_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'avg_mood', COALESCE(AVG(mood_score), 0),
        'avg_anxiety', COALESCE(AVG(anxiety_level), 0),
        'total_sessions', (
            SELECT COUNT(*) FROM public.therapy_sessions 
            WHERE patient_id = patient_uuid AND status = 'completed'
        ),
        'last_session', (
            SELECT MAX(session_date) FROM public.therapy_sessions 
            WHERE patient_id = patient_uuid AND status = 'completed'
        ),
        'mood_trend', (
            SELECT CASE 
                WHEN COUNT(*) < 2 THEN 'insufficient_data'
                WHEN AVG(CASE WHEN log_date >= CURRENT_DATE - INTERVAL '7 days' THEN mood_score END) > 
                     AVG(CASE WHEN log_date >= CURRENT_DATE - INTERVAL '14 days' AND log_date < CURRENT_DATE - INTERVAL '7 days' THEN mood_score END) 
                THEN 'improving'
                ELSE 'declining'
            END
            FROM public.mood_logs 
            WHERE patient_id = patient_uuid AND log_date >= CURRENT_DATE - INTERVAL '14 days'
        )
    ) INTO result
    FROM public.mood_logs
    WHERE patient_id = patient_uuid AND log_date >= CURRENT_DATE - INTERVAL '30 days';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
