import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import json
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

class MentalHealthAnalyzer:
    def __init__(self):
        self.mood_data = None
        self.session_data = None
        self.user_data = None
        self.model = None
        self.scaler = StandardScaler()
        
    def generate_sample_data(self, num_users=100, days_back=90):
        """Genera datos de muestra para análisis"""
        print("Generando datos de muestra...")
        
        # Generar datos de usuarios
        users = []
        for i in range(num_users):
            user = {
                'user_id': f'user_{i+1}',
                'age': np.random.randint(18, 70),
                'gender': np.random.choice(['M', 'F', 'Other']),
                'user_type': np.random.choice(['patient'], p=[1.0]),
                'registration_date': datetime.now() - timedelta(days=np.random.randint(1, 365))
            }
            users.append(user)
        
        self.user_data = pd.DataFrame(users)
        
        # Generar datos de estado de ánimo
        mood_records = []
        for user_id in self.user_data['user_id']:
            for day in range(days_back):
                date = datetime.now() - timedelta(days=day)
                # Simular patrones realistas de estado de ánimo
                base_mood = np.random.normal(6, 2)  # Media 6, desviación 2
                
                # Agregar patrones semanales (lunes más bajo, viernes más alto)
                weekday_effect = {0: -0.5, 1: -0.3, 2: 0, 3: 0.2, 4: 0.5, 5: 0.3, 6: 0.1}
                base_mood += weekday_effect.get(date.weekday(), 0)
                
                # Limitar entre 1 y 10
                mood_score = max(1, min(10, base_mood))
                
                mood_record = {
                    'user_id': user_id,
                    'date': date.date(),
                    'mood_score': round(mood_score, 1),
                    'anxiety_level': max(1, min(10, np.random.normal(5, 2))),
                    'sleep_hours': max(3, min(12, np.random.normal(7.5, 1.5))),
                    'exercise_minutes': max(0, np.random.poisson(30)),
                    'social_interaction': np.random.choice([0, 1], p=[0.3, 0.7])
                }
                mood_records.append(mood_record)
        
        self.mood_data = pd.DataFrame(mood_records)
        
        # Generar datos de sesiones
        session_records = []
        for user_id in self.user_data['user_id']:
            num_sessions = np.random.poisson(8)  # Promedio 8 sesiones por usuario
            for session in range(num_sessions):
                session_date = datetime.now() - timedelta(days=np.random.randint(1, 180))
                session_record = {
                    'user_id': user_id,
                    'session_date': session_date.date(),
                    'session_type': np.random.choice(['individual', 'group', 'emergency']),
                    'duration_minutes': np.random.choice([30, 45, 60]),
                    'therapist_rating': np.random.randint(7, 11),  # Rating del terapeuta
                    'patient_feedback': np.random.randint(6, 11)   # Feedback del paciente
                }
                session_records.append(session_record)
        
        self.session_data = pd.DataFrame(session_records)
        print(f"Datos generados: {len(self.user_data)} usuarios, {len(self.mood_data)} registros de ánimo, {len(self.session_data)} sesiones")
        
    def analyze_mood_patterns(self):
        """Analiza patrones en los datos de estado de ánimo"""
        print("\n=== ANÁLISIS DE PATRONES DE ESTADO DE ÁNIMO ===")
        
        # Estadísticas básicas
        mood_stats = self.mood_data.groupby('user_id')['mood_score'].agg([
            'mean', 'std', 'min', 'max', 'count'
        ]).round(2)
        
        print(f"Promedio general de estado de ánimo: {self.mood_data['mood_score'].mean():.2f}")
        print(f"Desviación estándar: {self.mood_data['mood_score'].std():.2f}")
        
        # Análisis por día de la semana
        self.mood_data['weekday'] = pd.to_datetime(self.mood_data['date']).dt.day_name()
        weekday_mood = self.mood_data.groupby('weekday')['mood_score'].mean().round(2)
        print("\nPromedio de estado de ánimo por día de la semana:")
        for day, mood in weekday_mood.items():
            print(f"  {day}: {mood}")
        
        # Correlaciones
        correlations = self.mood_data[['mood_score', 'anxiety_level', 'sleep_hours', 'exercise_minutes']].corr()
        print("\nCorrelaciones con estado de ánimo:")
        print(f"  Ansiedad: {correlations.loc['mood_score', 'anxiety_level']:.3f}")
        print(f"  Horas de sueño: {correlations.loc['mood_score', 'sleep_hours']:.3f}")
        print(f"  Ejercicio: {correlations.loc['mood_score', 'exercise_minutes']:.3f}")
        
        return mood_stats
    
    def analyze_session_effectiveness(self):
        """Analiza la efectividad de las sesiones terapéuticas"""
        print("\n=== ANÁLISIS DE EFECTIVIDAD DE SESIONES ===")
        
        # Merge datos de sesiones con datos de ánimo
        session_mood = pd.merge(
            self.session_data,
            self.mood_data,
            on='user_id',
            how='inner'
        )
        
        # Filtrar registros de ánimo cercanos a las sesiones (±7 días)
        session_mood['days_diff'] = (
            pd.to_datetime(session_mood['date']) - pd.to_datetime(session_mood['session_date'])
        ).dt.days
        
        pre_session = session_mood[(session_mood['days_diff'] >= -7) & (session_mood['days_diff'] < 0)]
        post_session = session_mood[(session_mood['days_diff'] > 0) & (session_mood['days_diff'] <= 7)]
        
        if len(pre_session) > 0 and len(post_session) > 0:
            pre_mood_avg = pre_session.groupby('user_id')['mood_score'].mean()
            post_mood_avg = post_session.groupby('user_id')['mood_score'].mean()
            
            improvement = post_mood_avg - pre_mood_avg
            print(f"Mejora promedio post-sesión: {improvement.mean():.2f} puntos")
            print(f"Usuarios con mejora: {(improvement > 0).sum()}/{len(improvement)} ({(improvement > 0).mean()*100:.1f}%)")
        
        # Análisis por tipo de sesión
        session_effectiveness = self.session_data.groupby('session_type').agg({
            'therapist_rating': 'mean',
            'patient_feedback': 'mean',
            'duration_minutes': 'mean'
        }).round(2)
        
        print("\nEfectividad por tipo de sesión:")
        print(session_effectiveness)
        
        return session_effectiveness
    
    def predict_risk_levels(self):
        """Predice niveles de riesgo usando machine learning"""
        print("\n=== PREDICCIÓN DE NIVELES DE RIESGO ===")
        
        # Preparar datos para ML
        user_features = self.mood_data.groupby('user_id').agg({
            'mood_score': ['mean', 'std', 'min'],
            'anxiety_level': ['mean', 'max'],
            'sleep_hours': 'mean',
            'exercise_minutes': 'mean',
            'social_interaction': 'mean'
        }).round(2)
        
        # Aplanar nombres de columnas
        user_features.columns = ['_'.join(col).strip() for col in user_features.columns]
        
        # Crear etiquetas de riesgo basadas en criterios clínicos
        def calculate_risk(row):
            risk_score = 0
            if row['mood_score_mean'] < 4:
                risk_score += 3
            elif row['mood_score_mean'] < 6:
                risk_score += 1
                
            if row['anxiety_level_mean'] > 7:
                risk_score += 2
            elif row['anxiety_level_mean'] > 5:
                risk_score += 1
                
            if row['sleep_hours_mean'] < 6 or row['sleep_hours_mean'] > 9:
                risk_score += 1
                
            if row['exercise_minutes_mean'] < 15:
                risk_score += 1
                
            if row['social_interaction_mean'] < 0.3:
                risk_score += 1
                
            if risk_score >= 5:
                return 'Alto'
            elif risk_score >= 3:
                return 'Medio'
            else:
                return 'Bajo'
        
        user_features['risk_level'] = user_features.apply(calculate_risk, axis=1)
        
        # Preparar datos para entrenamiento
        X = user_features.drop('risk_level', axis=1)
        y = user_features['risk_level']
        
        # Dividir datos
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
        
        # Escalar características
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Entrenar modelo
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluar modelo
        y_pred = self.model.predict(X_test_scaled)
        accuracy = (y_pred == y_test).mean()
        
        print(f"Precisión del modelo: {accuracy:.3f}")
        print("\nDistribución de niveles de riesgo:")
        risk_distribution = y.value_counts()
        for level, count in risk_distribution.items():
            print(f"  {level}: {count} usuarios ({count/len(y)*100:.1f}%)")
        
        # Importancia de características
        feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\nImportancia de características:")
        for _, row in feature_importance.head().iterrows():
            print(f"  {row['feature']}: {row['importance']:.3f}")
        
        return user_features, accuracy
    
    def generate_recommendations(self, user_id):
        """Genera recomendaciones personalizadas para un usuario"""
        user_mood = self.mood_data[self.mood_data['user_id'] == user_id]
        
        if len(user_mood) == 0:
            return ["No hay datos suficientes para generar recomendaciones"]
        
        recommendations = []
        
        # Análisis de estado de ánimo
        avg_mood = user_mood['mood_score'].mean()
        if avg_mood < 5:
            recommendations.append("Considera técnicas de mindfulness y meditación diaria")
            recommendations.append("Programa una sesión adicional con tu terapeuta")
        
        # Análisis de sueño
        avg_sleep = user_mood['sleep_hours'].mean()
        if avg_sleep < 7:
            recommendations.append("Mejora tu higiene del sueño - intenta dormir 7-8 horas")
        elif avg_sleep > 9:
            recommendations.append("Considera evaluar la calidad de tu sueño con un profesional")
        
        # Análisis de ejercicio
        avg_exercise = user_mood['exercise_minutes'].mean()
        if avg_exercise < 30:
            recommendations.append("Incrementa tu actividad física a 30 minutos diarios")
        
        # Análisis de ansiedad
        avg_anxiety = user_mood['anxiety_level'].mean()
        if avg_anxiety > 7:
            recommendations.append("Practica técnicas de respiración profunda")
            recommendations.append("Considera terapia cognitivo-conductual para la ansiedad")
        
        return recommendations
    
    def export_analysis_results(self):
        """Exporta los resultados del análisis"""
        results = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_users': len(self.user_data),
                'total_mood_records': len(self.mood_data),
                'total_sessions': len(self.session_data),
                'average_mood': float(self.mood_data['mood_score'].mean()),
                'average_anxiety': float(self.mood_data['anxiety_level'].mean())
            }
        }
        
        with open('analysis_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\nResultados exportados a analysis_results.json")
        return results

def main():
    """Función principal para ejecutar el análisis"""
    analyzer = MentalHealthAnalyzer()
    
    # Generar datos de muestra
    analyzer.generate_sample_data(num_users=150, days_back=120)
    
    # Realizar análisis
    mood_stats = analyzer.analyze_mood_patterns()
    session_effectiveness = analyzer.analyze_session_effectiveness()
    risk_analysis, model_accuracy = analyzer.predict_risk_levels()
    
    # Generar recomendaciones para algunos usuarios
    print("\n=== RECOMENDACIONES PERSONALIZADAS ===")
    sample_users = analyzer.user_data['user_id'].head(3)
    for user_id in sample_users:
        recommendations = analyzer.generate_recommendations(user_id)
        print(f"\nRecomendaciones para {user_id}:")
        for rec in recommendations:
            print(f"  • {rec}")
    
    # Exportar resultados
    results = analyzer.export_analysis_results()
    
    print("\n=== ANÁLISIS COMPLETADO ===")
    print("Los datos y modelos están listos para integración con la aplicación web")

if __name__ == "__main__":
    main()
