import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, mean_squared_error, r2_score
import joblib
from datetime import datetime, timedelta
import json
import warnings
warnings.filterwarnings('ignore')

class MentalHealthPredictor:
    def __init__(self):
        self.risk_classifier = None
        self.mood_predictor = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        
    def load_data(self):
        """Carga y prepara los datos para el entrenamiento"""
        print("Cargando datos para entrenamiento de ML...")
        
        # Generar datos sintéticos más realistas
        np.random.seed(42)
        n_patients = 500
        n_days = 90
        
        data = []
        
        for patient_id in range(n_patients):
            # Características base del paciente
            age = np.random.randint(18, 70)
            gender = np.random.choice(['M', 'F', 'Other'])
            
            # Patrones individuales (algunos pacientes tienen tendencias específicas)
            base_mood = np.random.normal(6, 1.5)
            mood_volatility = np.random.exponential(1)
            anxiety_tendency = np.random.normal(5, 2)
            
            # Generar historial de días
            for day in range(n_days):
                date = datetime.now() - timedelta(days=day)
                
                # Factores temporales
                weekday_effect = np.sin(2 * np.pi * date.weekday() / 7) * 0.5
                seasonal_effect = np.sin(2 * np.pi * date.timetuple().tm_yday / 365) * 0.3
                
                # Estado de ánimo con tendencias y ruido
                mood_score = base_mood + weekday_effect + seasonal_effect + np.random.normal(0, mood_volatility)
                mood_score = max(1, min(10, mood_score))
                
                # Ansiedad correlacionada inversamente con el estado de ánimo
                anxiety_level = anxiety_tendency + (7 - mood_score) * 0.3 + np.random.normal(0, 1)
                anxiety_level = max(1, min(10, anxiety_level))
                
                # Factores de estilo de vida
                sleep_hours = np.random.normal(7.5, 1.5)
                sleep_hours = max(4, min(12, sleep_hours))
                
                exercise_minutes = max(0, np.random.poisson(25))
                social_interaction = np.random.choice([0, 1], p=[0.4, 0.6])
                
                # Medicación (algunos pacientes)
                on_medication = np.random.choice([0, 1], p=[0.7, 0.3])
                
                # Sesiones de terapia
                therapy_sessions_week = np.random.poisson(0.5)  # Promedio 0.5 por semana
                
                # Variables derivadas
                mood_trend = 0  # Se calculará después
                anxiety_trend = 0  # Se calculará después
                
                record = {
                    'patient_id': patient_id,
                    'date': date.date(),
                    'age': age,
                    'gender': gender,
                    'mood_score': round(mood_score, 1),
                    'anxiety_level': round(anxiety_level, 1),
                    'sleep_hours': round(sleep_hours, 1),
                    'exercise_minutes': exercise_minutes,
                    'social_interaction': social_interaction,
                    'on_medication': on_medication,
                    'therapy_sessions_week': therapy_sessions_week,
                    'weekday': date.weekday(),
                    'day_of_year': date.timetuple().tm_yday
                }
                
                data.append(record)
        
        df = pd.DataFrame(data)
        
        # Calcular tendencias (promedio móvil de 7 días)
        df = df.sort_values(['patient_id', 'date'])
        df['mood_trend'] = df.groupby('patient_id')['mood_score'].rolling(window=7, min_periods=1).mean().reset_index(0, drop=True)
        df['anxiety_trend'] = df.groupby('patient_id')['anxiety_level'].rolling(window=7, min_periods=1).mean().reset_index(0, drop=True)
        
        # Crear etiquetas de riesgo
        def calculate_risk_level(row):
            risk_score = 0
            
            # Factores de riesgo
            if row['mood_score'] < 4:
                risk_score += 3
            elif row['mood_score'] < 6:
                risk_score += 1
                
            if row['anxiety_level'] > 7:
                risk_score += 2
            elif row['anxiety_level'] > 5:
                risk_score += 1
                
            if row['sleep_hours'] < 6 or row['sleep_hours'] > 9:
                risk_score += 1
                
            if row['exercise_minutes'] < 20:
                risk_score += 1
                
            if row['social_interaction'] == 0:
                risk_score += 1
                
            # Tendencias negativas
            if row['mood_trend'] < row['mood_score'] - 1:
                risk_score += 1
                
            if row['anxiety_trend'] > row['anxiety_level'] + 1:
                risk_score += 1
            
            if risk_score >= 6:
                return 'high'
            elif risk_score >= 3:
                return 'medium'
            else:
                return 'low'
        
        df['risk_level'] = df.apply(calculate_risk_level, axis=1)
        
        # Crear variable objetivo para predicción de estado de ánimo futuro
        df = df.sort_values(['patient_id', 'date'])
        df['future_mood'] = df.groupby('patient_id')['mood_score'].shift(-7)  # Estado de ánimo en 7 días
        
        # Eliminar filas sin datos futuros
        df = df.dropna(subset=['future_mood'])
        
        print(f"Datos cargados: {len(df)} registros de {df['patient_id'].nunique()} pacientes")
        return df
    
    def train_risk_classifier(self, df):
        """Entrena el clasificador de niveles de riesgo"""
        print("Entrenando clasificador de riesgo...")
        
        # Preparar características
        feature_columns = [
            'age', 'mood_score', 'anxiety_level', 'sleep_hours', 
            'exercise_minutes', 'social_interaction', 'on_medication',
            'therapy_sessions_week', 'mood_trend', 'anxiety_trend',
            'weekday', 'day_of_year'
        ]
        
        # Codificar género
        df['gender_encoded'] = self.label_encoder.fit_transform(df['gender'])
        feature_columns.append('gender_encoded')
        
        X = df[feature_columns]
        y = df['risk_level']
        
        # Dividir datos
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # Escalar características
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Entrenar modelo
        self.risk_classifier = RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        self.risk_classifier.fit(X_train_scaled, y_train)
        
        # Evaluar modelo
        y_pred = self.risk_classifier.predict(X_test_scaled)
        accuracy = (y_pred == y_test).mean()
        
        # Validación cruzada
        cv_scores = cross_val_score(self.risk_classifier, X_train_scaled, y_train, cv=5)
        
        print(f"Precisión en test: {accuracy:.3f}")
        print(f"Validación cruzada: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
        
        # Reporte detallado
        print("\nReporte de clasificación:")
        print(classification_report(y_test, y_pred))
        
        # Importancia de características
        feature_importance = pd.DataFrame({
            'feature': feature_columns,
            'importance': self.risk_classifier.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\nImportancia de características (Top 5):")
        for _, row in feature_importance.head().iterrows():
            print(f"  {row['feature']}: {row['importance']:.3f}")
        
        return accuracy, feature_importance
    
    def train_mood_predictor(self, df):
        """Entrena el predictor de estado de ánimo futuro"""
        print("\nEntrenando predictor de estado de ánimo...")
        
        # Preparar características (mismas que el clasificador)
        feature_columns = [
            'age', 'mood_score', 'anxiety_level', 'sleep_hours', 
            'exercise_minutes', 'social_interaction', 'on_medication',
            'therapy_sessions_week', 'mood_trend', 'anxiety_trend',
            'weekday', 'day_of_year', 'gender_encoded'
        ]
        
        X = df[feature_columns]
        y = df['future_mood']
        
        # Dividir datos
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Usar el mismo scaler (ya entrenado)
        X_train_scaled = self.scaler.transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Entrenar modelo
        self.mood_predictor = GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=6,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        self.mood_predictor.fit(X_train_scaled, y_train)
        
        # Evaluar modelo
        y_pred = self.mood_predictor.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"Error cuadrático medio: {mse:.3f}")
        print(f"R² Score: {r2:.3f}")
        print(f"Error promedio: {np.sqrt(mse):.3f} puntos en escala 1-10")
        
        return mse, r2
    
    def predict_patient_risk(self, patient_data):
        """Predice el nivel de riesgo para un paciente"""
        if self.risk_classifier is None:
            raise ValueError("El modelo de riesgo no ha sido entrenado")
        
        # Preparar datos
        features = np.array([
            patient_data['age'],
            patient_data['mood_score'],
            patient_data['anxiety_level'],
            patient_data['sleep_hours'],
            patient_data['exercise_minutes'],
            patient_data['social_interaction'],
            patient_data['on_medication'],
            patient_data['therapy_sessions_week'],
            patient_data['mood_trend'],
            patient_data['anxiety_trend'],
            patient_data['weekday'],
            patient_data['day_of_year'],
            patient_data['gender_encoded']
        ]).reshape(1, -1)
        
        # Escalar y predecir
        features_scaled = self.scaler.transform(features)
        risk_prediction = self.risk_classifier.predict(features_scaled)[0]
        risk_probabilities = self.risk_classifier.predict_proba(features_scaled)[0]
        
        # Obtener probabilidades por clase
        classes = self.risk_classifier.classes_
        risk_probs = dict(zip(classes, risk_probabilities))
        
        return risk_prediction, risk_probs
    
    def predict_future_mood(self, patient_data):
        """Predice el estado de ánimo futuro para un paciente"""
        if self.mood_predictor is None:
            raise ValueError("El modelo de predicción de ánimo no ha sido entrenado")
        
        # Preparar datos (misma estructura que el clasificador)
        features = np.array([
            patient_data['age'],
            patient_data['mood_score'],
            patient_data['anxiety_level'],
            patient_data['sleep_hours'],
            patient_data['exercise_minutes'],
            patient_data['social_interaction'],
            patient_data['on_medication'],
            patient_data['therapy_sessions_week'],
            patient_data['mood_trend'],
            patient_data['anxiety_trend'],
            patient_data['weekday'],
            patient_data['day_of_year'],
            patient_data['gender_encoded']
        ]).reshape(1, -1)
        
        # Escalar y predecir
        features_scaled = self.scaler.transform(features)
        mood_prediction = self.mood_predictor.predict(features_scaled)[0]
        
        return round(mood_prediction, 1)
    
    def generate_recommendations(self, patient_data, risk_level, future_mood):
        """Genera recomendaciones basadas en las predicciones"""
        recommendations = []
        
        # Recomendaciones basadas en riesgo
        if risk_level == 'high':
            recommendations.append({
                'type': 'urgent',
                'message': 'Se recomienda contactar inmediatamente con tu psicólogo',
                'priority': 1
            })
            recommendations.append({
                'type': 'therapy',
                'message': 'Considera aumentar la frecuencia de sesiones terapéuticas',
                'priority': 1
            })
        elif risk_level == 'medium':
            recommendations.append({
                'type': 'monitoring',
                'message': 'Mantén un seguimiento diario de tu estado de ánimo',
                'priority': 2
            })
        
        # Recomendaciones basadas en estado de ánimo actual
        if patient_data['mood_score'] < 5:
            recommendations.append({
                'type': 'activity',
                'message': 'Practica técnicas de mindfulness y respiración profunda',
                'priority': 2
            })
        
        # Recomendaciones basadas en ansiedad
        if patient_data['anxiety_level'] > 7:
            recommendations.append({
                'type': 'anxiety',
                'message': 'Implementa técnicas de relajación muscular progresiva',
                'priority': 2
            })
        
        # Recomendaciones basadas en sueño
        if patient_data['sleep_hours'] < 6:
            recommendations.append({
                'type': 'sleep',
                'message': 'Mejora tu higiene del sueño - objetivo: 7-8 horas por noche',
                'priority': 3
            })
        elif patient_data['sleep_hours'] > 9:
            recommendations.append({
                'type': 'sleep',
                'message': 'Evalúa la calidad de tu sueño con un profesional',
                'priority': 3
            })
        
        # Recomendaciones basadas en ejercicio
        if patient_data['exercise_minutes'] < 30:
            recommendations.append({
                'type': 'exercise',
                'message': 'Incrementa tu actividad física a 30 minutos diarios',
                'priority': 3
            })
        
        # Recomendaciones basadas en interacción social
        if patient_data['social_interaction'] == 0:
            recommendations.append({
                'type': 'social',
                'message': 'Busca oportunidades de interacción social positiva',
                'priority': 3
            })
        
        # Recomendaciones basadas en predicción futura
        if future_mood < patient_data['mood_score'] - 1:
            recommendations.append({
                'type': 'prevention',
                'message': 'Se prevé una posible disminución del ánimo. Implementa estrategias preventivas',
                'priority': 2
            })
        
        return sorted(recommendations, key=lambda x: x['priority'])
    
    def save_models(self):
        """Guarda los modelos entrenados"""
        if self.risk_classifier:
            joblib.dump(self.risk_classifier, 'risk_classifier_model.pkl')
        if self.mood_predictor:
            joblib.dump(self.mood_predictor, 'mood_predictor_model.pkl')
        if self.scaler:
            joblib.dump(self.scaler, 'feature_scaler.pkl')
        if self.label_encoder:
            joblib.dump(self.label_encoder, 'label_encoder.pkl')
        
        print("Modelos guardados exitosamente")
    
    def load_models(self):
        """Carga los modelos entrenados"""
        try:
            self.risk_classifier = joblib.load('risk_classifier_model.pkl')
            self.mood_predictor = joblib.load('mood_predictor_model.pkl')
            self.scaler = joblib.load('feature_scaler.pkl')
            self.label_encoder = joblib.load('label_encoder.pkl')
            print("Modelos cargados exitosamente")
            return True
        except FileNotFoundError:
            print("No se encontraron modelos guardados")
            return False

def main():
    """Función principal para entrenar y evaluar los modelos"""
    predictor = MentalHealthPredictor()
    
    print("=== ENTRENAMIENTO DE MODELOS DE ML ===\n")
    
    # Cargar datos
    df = predictor.load_data()
    
    # Entrenar modelos
    risk_accuracy, feature_importance = predictor.train_risk_classifier(df)
    mood_mse, mood_r2 = predictor.train_mood_predictor(df)
    
    # Guardar modelos
    predictor.save_models()
    
    # Ejemplo de predicción
    print("\n=== EJEMPLO DE PREDICCIÓN ===")
    sample_patient = {
        'age': 35,
        'mood_score': 4.5,
        'anxiety_level': 7.2,
        'sleep_hours': 5.5,
        'exercise_minutes': 15,
        'social_interaction': 0,
        'on_medication': 1,
        'therapy_sessions_week': 1,
        'mood_trend': 4.8,
        'anxiety_trend': 6.9,
        'weekday': 1,  # Martes
        'day_of_year': 50,
        'gender_encoded': 0  # Codificado
    }
    
    # Predicciones
    risk_level, risk_probs = predictor.predict_patient_risk(sample_patient)
    future_mood = predictor.predict_future_mood(sample_patient)
    recommendations = predictor.generate_recommendations(sample_patient, risk_level, future_mood)
    
    print(f"Paciente ejemplo:")
    print(f"  Estado de ánimo actual: {sample_patient['mood_score']}")
    print(f"  Nivel de ansiedad: {sample_patient['anxiety_level']}")
    print(f"  Horas de sueño: {sample_patient['sleep_hours']}")
    
    print(f"\nPredicciones:")
    print(f"  Nivel de riesgo: {risk_level}")
    print(f"  Probabilidades de riesgo: {risk_probs}")
    print(f"  Estado de ánimo futuro (7 días): {future_mood}")
    
    print(f"\nRecomendaciones:")
    for i, rec in enumerate(recommendations[:5], 1):
        print(f"  {i}. [{rec['type'].upper()}] {rec['message']}")
    
    # Guardar resultados
    results = {
        'timestamp': datetime.now().isoformat(),
        'model_performance': {
            'risk_classifier_accuracy': float(risk_accuracy),
            'mood_predictor_mse': float(mood_mse),
            'mood_predictor_r2': float(mood_r2)
        },
        'feature_importance': feature_importance.to_dict('records'),
        'sample_prediction': {
            'patient_data': sample_patient,
            'risk_level': risk_level,
            'risk_probabilities': {k: float(v) for k, v in risk_probs.items()},
            'future_mood': float(future_mood),
            'recommendations': recommendations
        }
    }
    
    with open('ml_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n=== ENTRENAMIENTO COMPLETADO ===")
    print(f"Resultados guardados en 'ml_results.json'")
    print(f"Modelos listos para integración con la aplicación web")

if __name__ == "__main__":
    main()
