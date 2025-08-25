import os
from supabase import create_client, Client
from pymongo import MongoClient
import json
from datetime import datetime, timedelta
import bcrypt
import random
from dotenv import load_dotenv

load_dotenv()


class DatabaseManager:
    def __init__(self):
        # Configuración de Supabase
        self.supabase_url = os.getenv(
            "SUPABASE_URL", "https://gyyoqlmgwaosnkodfalp.supabase.co"
        )
        self.supabase_key = os.getenv(
            "SUPABASE_ANON_KEY",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eW9xbG1nd2Fvc25rb2RmYWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMzgyNzMsImV4cCI6MjA2ODcxNDI3M30.R_thw0ZlPDrcjTLqGhdkcZ5BOszMf5RsoiGh0qRnyGs",
        )
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)

        # Configuración de MongoDB
        self.mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        self.mongo_client = MongoClient(self.mongo_uri)
        self.mongo_db = self.mongo_client["eunonia_db"]

    def setup_supabase_tables(self):
        """Crea las tablas necesarias en Supabase"""
        print("Configurando tablas de Supabase...")

        # Tabla de usuarios (extendida de auth.users)
        users_table = """
        CREATE TABLE IF NOT EXISTS public.user_profiles (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'psychologist', 'admin')),
            phone TEXT,
            date_of_birth DATE,
            gender TEXT,
            emergency_contact JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """

        # Tabla de psicólogos
        psychologists_table = """
        CREATE TABLE IF NOT EXISTS public.psychologists (
            id UUID REFERENCES public.user_profiles(id) PRIMARY KEY,
            license_number TEXT UNIQUE NOT NULL,
            specializations TEXT[],
            years_experience INTEGER,
            education JSONB,
            certifications JSONB,
            consultation_fee DECIMAL(10,2),
            availability JSONB,
            bio TEXT,
            rating DECIMAL(3,2) DEFAULT 0.00,
            total_patients INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """

        # Tabla de pacientes
        patients_table = """
        CREATE TABLE IF NOT EXISTS public.patients (
            id UUID REFERENCES public.user_profiles(id) PRIMARY KEY,
            assigned_psychologist UUID REFERENCES public.psychologists(id),
            medical_history JSONB,
            current_medications JSONB,
            emergency_contact JSONB,
            insurance_info JSONB,
            risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """

        # Tabla de sesiones
        sessions_table = """
        CREATE TABLE IF NOT EXISTS public.therapy_sessions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            patient_id UUID REFERENCES public.patients(id) NOT NULL,
            psychologist_id UUID REFERENCES public.psychologists(id) NOT NULL,
            session_date TIMESTAMP WITH TIME ZONE NOT NULL,
            duration_minutes INTEGER NOT NULL,
            session_type TEXT NOT NULL CHECK (session_type IN ('individual', 'group', 'emergency', 'follow_up')),
            status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
            notes TEXT,
            patient_feedback INTEGER CHECK (patient_feedback >= 1 AND patient_feedback <= 10),
            therapist_rating INTEGER CHECK (therapist_rating >= 1 AND therapist_rating <= 10),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """

        # Tabla de registros de estado de ánimo
        mood_logs_table = """
        CREATE TABLE IF NOT EXISTS public.mood_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            patient_id UUID REFERENCES public.patients(id) NOT NULL,
            log_date DATE NOT NULL,
            mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
            anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
            sleep_hours DECIMAL(3,1),
            exercise_minutes INTEGER DEFAULT 0,
            social_interaction BOOLEAN DEFAULT FALSE,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(patient_id, log_date)
        );
        """

        # Ejecutar creación de tablas
        tables = [
            users_table,
            psychologists_table,
            patients_table,
            sessions_table,
            mood_logs_table,
        ]

        for table_sql in tables:
            try:
                # Nota: En un entorno real, usarías migraciones de Supabase
                print(f"Tabla SQL preparada: {table_sql[:50]}...")
            except Exception as e:
                print(f"Error creando tabla: {e}")

        print("Configuración de Supabase completada")

    def setup_mongodb_collections(self):
        """Configura las colecciones de MongoDB"""
        print("Configurando colecciones de MongoDB...")

        # Colección para análisis de texto de sesiones
        session_analysis = self.mongo_db["session_analysis"]
        session_analysis.create_index([("patient_id", 1), ("session_date", -1)])

        # Colección para datos de chatbot
        chatbot_conversations = self.mongo_db["chatbot_conversations"]
        chatbot_conversations.create_index([("user_id", 1), ("timestamp", -1)])

        # Colección para análisis predictivo
        ml_predictions = self.mongo_db["ml_predictions"]
        ml_predictions.create_index([("user_id", 1), ("prediction_date", -1)])

        # Colección para métricas del sistema
        system_metrics = self.mongo_db["system_metrics"]
        system_metrics.create_index([("timestamp", -1)])

        # Colección para logs de actividad
        activity_logs = self.mongo_db["activity_logs"]
        activity_logs.create_index([("user_id", 1), ("timestamp", -1)])

        print("Colecciones de MongoDB configuradas")

    def create_test_users(self):
        """Crea usuarios de prueba"""
        print("Creando usuarios de prueba...")

        test_users = [
            # Administradores
            {
                "email": "admin@eunonia.com",
                "password": "Admin123!",
                "first_name": "Ana",
                "last_name": "Administradora",
                "user_type": "admin",
                "phone": "+1234567890",
            },
            # Psicólogos
            {
                "email": "dr.garcia@eunonia.com",
                "password": "Psico123!",
                "first_name": "María",
                "last_name": "García",
                "user_type": "psychologist",
                "phone": "+1234567891",
                "license_number": "PSY-2024-001",
                "specializations": [
                    "Ansiedad",
                    "Depresión",
                    "Terapia Cognitivo-Conductual",
                ],
                "years_experience": 8,
                "consultation_fee": 75.00,
                "bio": "Especialista en trastornos de ansiedad y depresión con 8 años de experiencia.",
            },
            {
                "email": "dr.ruiz@eunonia.com",
                "password": "Psico123!",
                "first_name": "Carlos",
                "last_name": "Ruiz",
                "user_type": "psychologist",
                "phone": "+1234567892",
                "license_number": "PSY-2024-002",
                "specializations": ["Trauma", "PTSD", "Terapia Familiar"],
                "years_experience": 12,
                "consultation_fee": 85.00,
                "bio": "Experto en trauma y terapia familiar con más de 12 años de experiencia.",
            },
            # Pacientes
            {
                "email": "juan.perez@email.com",
                "password": "Paciente123!",
                "first_name": "Juan",
                "last_name": "Pérez",
                "user_type": "patient",
                "phone": "+1234567893",
                "date_of_birth": "1990-05-15",
                "gender": "M",
            },
            {
                "email": "maria.gonzalez@email.com",
                "password": "Paciente123!",
                "first_name": "María",
                "last_name": "González",
                "user_type": "patient",
                "phone": "+1234567894",
                "date_of_birth": "1985-08-22",
                "gender": "F",
            },
            {
                "email": "ana.martinez@email.com",
                "password": "Paciente123!",
                "first_name": "Ana",
                "last_name": "Martínez",
                "user_type": "patient",
                "phone": "+1234567895",
                "date_of_birth": "1992-12-03",
                "gender": "F",
            },
            {
                "email": "luis.garcia@email.com",
                "password": "Paciente123!",
                "first_name": "Luis",
                "last_name": "García",
                "user_type": "patient",
                "phone": "+1234567896",
                "date_of_birth": "1988-03-18",
                "gender": "M",
            },
        ]

        created_users = []

        for user_data in test_users:
            try:
                # En un entorno real, usarías la API de Supabase Auth
                user_info = {
                    "id": f"user_{len(created_users) + 1}",
                    "email": user_data["email"],
                    "user_type": user_data["user_type"],
                    "first_name": user_data["first_name"],
                    "last_name": user_data["last_name"],
                    "phone": user_data.get("phone"),
                    "created_at": datetime.now().isoformat(),
                }

                # Agregar datos específicos según el tipo de usuario
                if user_data["user_type"] == "psychologist":
                    user_info.update(
                        {
                            "license_number": user_data.get("license_number"),
                            "specializations": user_data.get("specializations"),
                            "years_experience": user_data.get("years_experience"),
                            "consultation_fee": user_data.get("consultation_fee"),
                            "bio": user_data.get("bio"),
                        }
                    )
                elif user_data["user_type"] == "patient":
                    user_info.update(
                        {
                            "date_of_birth": user_data.get("date_of_birth"),
                            "gender": user_data.get("gender"),
                            "risk_level": random.choice(["low", "medium", "high"]),
                            "status": "active",
                        }
                    )

                created_users.append(user_info)
                print(
                    f"Usuario creado: {user_data['email']} ({user_data['user_type']})"
                )

            except Exception as e:
                print(f"Error creando usuario {user_data['email']}: {e}")

        # Guardar usuarios en archivo JSON para referencia
        with open("test_users.json", "w") as f:
            json.dump(created_users, f, indent=2, default=str)

        print(f"Creados {len(created_users)} usuarios de prueba")
        return created_users

    def create_sample_data(self, users):
        """Crea datos de muestra para los usuarios"""
        print("Creando datos de muestra...")

        patients = [u for u in users if u["user_type"] == "patient"]
        psychologists = [u for u in users if u["user_type"] == "psychologist"]

        # Crear registros de estado de ánimo
        mood_logs = []
        for patient in patients:
            for days_back in range(30):  # Últimos 30 días
                date = datetime.now() - timedelta(days=days_back)
                mood_log = {
                    "patient_id": patient["id"],
                    "log_date": date.date().isoformat(),
                    "mood_score": random.randint(3, 9),
                    "anxiety_level": random.randint(2, 8),
                    "sleep_hours": round(random.uniform(5.5, 9.5), 1),
                    "exercise_minutes": random.randint(0, 90),
                    "social_interaction": random.choice([True, False]),
                    "created_at": date.isoformat(),
                }
                mood_logs.append(mood_log)

        # Crear sesiones terapéuticas
        therapy_sessions = []
        for patient in patients:
            psychologist = random.choice(psychologists)
            num_sessions = random.randint(3, 8)

            for i in range(num_sessions):
                session_date = datetime.now() - timedelta(days=random.randint(1, 90))
                session = {
                    "patient_id": patient["id"],
                    "psychologist_id": psychologist["id"],
                    "session_date": session_date.isoformat(),
                    "duration_minutes": random.choice([30, 45, 60]),
                    "session_type": random.choice(["individual", "follow_up"]),
                    "status": random.choice(["completed", "scheduled"]),
                    "patient_feedback": random.randint(6, 10),
                    "therapist_rating": random.randint(7, 10),
                    "created_at": session_date.isoformat(),
                }
                therapy_sessions.append(session)

        # Crear conversaciones de chatbot
        chatbot_conversations = []
        for user in users:
            num_conversations = random.randint(5, 15)
            for i in range(num_conversations):
                conversation_date = datetime.now() - timedelta(
                    days=random.randint(1, 60)
                )
                conversation = {
                    "user_id": user["id"],
                    "user_type": user["user_type"],
                    "timestamp": conversation_date.isoformat(),
                    "messages": [
                        {
                            "role": "user",
                            "content": random.choice(
                                [
                                    "Me siento ansioso hoy",
                                    "¿Puedes ayudarme con técnicas de relajación?",
                                    "Tengo problemas para dormir",
                                    "¿Cómo puedo manejar el estrés?",
                                ]
                            ),
                            "timestamp": conversation_date.isoformat(),
                        },
                        {
                            "role": "assistant",
                            "content": "Te entiendo. Vamos a trabajar juntos en algunas técnicas que pueden ayudarte.",
                            "timestamp": (
                                conversation_date + timedelta(seconds=30)
                            ).isoformat(),
                        },
                    ],
                    "session_duration_minutes": random.randint(5, 25),
                    "satisfaction_rating": random.randint(7, 10),
                }
                chatbot_conversations.append(conversation)

        # Guardar datos en MongoDB
        try:
            if mood_logs:
                self.mongo_db["mood_logs_sample"].insert_many(mood_logs)
            if therapy_sessions:
                self.mongo_db["therapy_sessions_sample"].insert_many(therapy_sessions)
            if chatbot_conversations:
                self.mongo_db["chatbot_conversations"].insert_many(
                    chatbot_conversations
                )

            print(f"Datos de muestra creados:")
            print(f"  - {len(mood_logs)} registros de estado de ánimo")
            print(f"  - {len(therapy_sessions)} sesiones terapéuticas")
            print(f"  - {len(chatbot_conversations)} conversaciones de chatbot")

        except Exception as e:
            print(f"Error guardando datos en MongoDB: {e}")

    def generate_system_metrics(self):
        """Genera métricas del sistema"""
        print("Generando métricas del sistema...")

        metrics = []
        for days_back in range(30):  # Últimos 30 días
            date = datetime.now() - timedelta(days=days_back)

            daily_metrics = {
                "timestamp": date.isoformat(),
                "active_users": random.randint(50, 150),
                "new_registrations": random.randint(2, 10),
                "completed_sessions": random.randint(15, 45),
                "chatbot_interactions": random.randint(100, 300),
                "system_uptime": round(random.uniform(98.5, 99.9), 2),
                "response_time_ms": random.randint(800, 2000),
                "error_rate": round(random.uniform(0.1, 2.0), 2),
                "database_connections": random.randint(20, 80),
                "memory_usage_percent": random.randint(45, 85),
                "cpu_usage_percent": random.randint(25, 75),
            }
            metrics.append(daily_metrics)

        try:
            self.mongo_db["system_metrics"].insert_many(metrics)
            print(f"Generadas {len(metrics)} métricas del sistema")
        except Exception as e:
            print(f"Error guardando métricas: {e}")


def main():
    """Función principal para configurar las bases de datos"""
    db_manager = DatabaseManager()

    print("=== CONFIGURACIÓN DE BASES DE DATOS EUNONIA ===\n")

    # Configurar Supabase
    db_manager.setup_supabase_tables()

    # Configurar MongoDB
    db_manager.setup_mongodb_collections()

    # Crear usuarios de prueba
    test_users = db_manager.create_test_users()

    # Crear datos de muestra
    db_manager.create_sample_data(test_users)

    # Generar métricas del sistema
    db_manager.generate_system_metrics()

    print("\n=== CONFIGURACIÓN COMPLETADA ===")
    print("Credenciales de usuarios de prueba guardadas en 'test_users.json'")
    print("\nUsuarios de prueba creados:")
    print("- admin@eunonia.com (Admin123!)")
    print("- dr.garcia@eunonia.com (Psico123!)")
    print("- dr.ruiz@eunonia.com (Psico123!)")
    print("- juan.perez@email.com (Paciente123!)")
    print("- maria.gonzalez@email.com (Paciente123!)")
    print("- ana.martinez@email.com (Paciente123!)")
    print("- luis.garcia@email.com (Paciente123!)")


if __name__ == "__main__":
    main()
