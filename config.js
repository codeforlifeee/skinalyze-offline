// config.js - Main Configuration File
// ⚠️ IMPORTANT: Update these values with your actual backend details

export const CONFIG = {
  // Backend Configuration (MODIFY THESE WITH YOUR BACKEND URL)
  BACKEND_URL: "http://192.168.1.100:5000/api", // TODO: Replace with your backend URL
  TIMEOUT: 10000,
  
  // Authentication Endpoints (MODIFY BASED ON YOUR BACKEND)
  ENDPOINTS: {
    auth: {
      login: "/auth/login",
      signup: "/auth/signup",
      logout: "/auth/logout",
      verify: "/auth/verify",
    },
    clinician: {
      patients: "/clinician/patients",
      patient_detail: "/clinician/patients/:id",
      diagnosis: "/clinician/diagnosis",
      images_upload: "/clinician/images/upload",
      diagnosis_history: "/clinician/diagnosis/:patientId",
      create_patient: "/clinician/patients/create",
    },
    patient: {
      diagnoses: "/patient/diagnoses",
      progress: "/patient/progress",
      profile: "/patient/profile",
      history: "/patient/history",
    },
  },
  
  // ML Model Configuration
  ML_MODEL: {
    input_size: 224, // Input image dimensions (224x224)
    num_classes: 7, // Number of output classes
    classes: [
      "Melanoma",
      "Basal Cell Carcinoma",
      "Squamous Cell Carcinoma",
      "Actinic Keratosis",
      "Benign Keratosis",
      "Melanocytic Nevus",
      "Vascular Lesion",
    ],
    confidence_threshold: 0.6, // Only show predictions > 60% confidence
  },
  
  // App Settings
  APP: {
    name: "Skinalyze",
    version: "1.0.0",
    offline_mode_enabled: true,
    max_offline_diagnoses: 50,
  },
};
