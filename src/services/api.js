// src/services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONFIG } from "../../config";
import { storageService } from "./storageService";

// Initialize API client
const apiClient = axios.create({
  baseURL: CONFIG.BACKEND_URL,
  timeout: CONFIG.TIMEOUT,
});

let authToken = null;

// Mock test credentials for offline mode
const MOCK_CREDENTIALS = {
  clinician: {
    email: "clinician@test.com",
    password: "password",
    user: {
      id: "clinician-001",
      email: "clinician@test.com",
      name: "Dr. Smith",
      userType: "clinician",
      specialization: "Dermatology",
    },
  },
  patient: {
    email: "patient@test.com",
    password: "password",
    user: {
      id: "patient-001",
      patientId: 1, // Link to seeded patient ID
      email: "patient@test.com",
      name: "John Doe",
      userType: "patient",
      age: 35,
    },
  },
};

let currentUser = null; // Store current logged-in user

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    // Try to get token from async storage if not in memory
    if (!authToken) {
      authToken = await AsyncStorage.getItem("authToken");
    }

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      authToken = null;
      await AsyncStorage.removeItem("authToken");
      // Trigger logout event here
    }
    return Promise.reject(error);
  }
);

// =====================
// OFFLINE DATA HELPERS
// =====================
const OFFLINE_KEYS = {
  patients: "mock_patients",
  diagnosesByPatient: "mock_diagnoses_by_patient",
  progressByPatient: "mock_progress_by_patient",
};

const seedPatients = [
  {
    id: 1,
    name: "John Doe",
    fitzpatrickType: "III",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Jane Smith",
    fitzpatrickType: "II",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Rahul Verma",
    fitzpatrickType: "V",
    createdAt: new Date().toISOString(),
  },
];

const seedDiagnoses = {
  1: [
    {
      diagnosedCondition: "Melanocytic Nevus",
      riskLevel: "Low",
      confidence: 86,
      clinicalNotes: "Benign-appearing nevus. Advise routine monitoring.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      imagePath: "",
      metrics: generateMetrics(),
    },
  ],
  2: [
    {
      diagnosedCondition: "Actinic Keratosis",
      riskLevel: "Medium",
      confidence: 72,
      clinicalNotes:
        "Pre-cancerous lesion suspected. Recommend cryotherapy if persistent.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      imagePath: "",
      metrics: generateMetrics(),
    },
  ],
  3: [],
};

const seedProgress = {
  1: [
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      healingScore: 65,
      notes: "Post-observation: stable appearance, no alarming changes.",
    },
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      healingScore: 74,
      notes: "Slight improvement in border regularity and color uniformity.",
    },
  ],
  2: [
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      healingScore: 58,
      notes: "Erythema reduced; lesion surface less scaly than baseline.",
    },
  ],
  3: [],
};

async function ensureOfflineSeeds() {
  const existingPatients = await AsyncStorage.getItem(OFFLINE_KEYS.patients);
  if (!existingPatients) {
    await AsyncStorage.setItem(
      OFFLINE_KEYS.patients,
      JSON.stringify(seedPatients)
    );
  }
  const existingDiag = await AsyncStorage.getItem(
    OFFLINE_KEYS.diagnosesByPatient
  );
  if (!existingDiag) {
    await AsyncStorage.setItem(
      OFFLINE_KEYS.diagnosesByPatient,
      JSON.stringify(seedDiagnoses)
    );
  }
  const existingProg = await AsyncStorage.getItem(
    OFFLINE_KEYS.progressByPatient
  );
  if (!existingProg) {
    await AsyncStorage.setItem(
      OFFLINE_KEYS.progressByPatient,
      JSON.stringify(seedProgress)
    );
  }
}

function generateMetrics() {
  // ABCDE-inspired metrics and simple dermoscopic parameters
  const rand = (min, max, digits = 2) =>
    parseFloat((min + Math.random() * (max - min)).toFixed(digits));
  return {
    asymmetryScore: rand(0, 1),
    borderIrregularity: rand(0, 1),
    colorVarIndex: rand(0, 1),
    diameterMM: rand(2, 12, 1),
    evolutionFlag: Math.random() < 0.3,
    pigmentNetworkScore: rand(0, 1),
    blueWhiteVeilScore: rand(0, 1),
    atypicalVesselsScore: rand(0, 1),
  };
}

async function getOfflinePatients() {
  await ensureOfflineSeeds();
  const json = await AsyncStorage.getItem(OFFLINE_KEYS.patients);
  return JSON.parse(json || "[]");
}

async function setOfflinePatients(patients) {
  await AsyncStorage.setItem(OFFLINE_KEYS.patients, JSON.stringify(patients));
}

async function getOfflineDiagnosesMap() {
  await ensureOfflineSeeds();
  const json = await AsyncStorage.getItem(OFFLINE_KEYS.diagnosesByPatient);
  return JSON.parse(json || "{}");
}

async function setOfflineDiagnosesMap(map) {
  await AsyncStorage.setItem(
    OFFLINE_KEYS.diagnosesByPatient,
    JSON.stringify(map)
  );
}

async function getOfflineProgressMap() {
  await ensureOfflineSeeds();
  const json = await AsyncStorage.getItem(OFFLINE_KEYS.progressByPatient);
  return JSON.parse(json || "{}");
}

async function setOfflineProgressMap(map) {
  await AsyncStorage.setItem(
    OFFLINE_KEYS.progressByPatient,
    JSON.stringify(map)
  );
}

// ===== AUTHENTICATION APIs =====
export const authService = {
  // Login with credentials (with offline mode support)
  login: async (email, password, userType) => {
    // Check if offline mode is enabled
    if (CONFIG.APP.offline_mode_enabled) {
      // Offline mode - use mock credentials
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const mockCred = MOCK_CREDENTIALS[userType];
          
          if (mockCred && email === mockCred.email && password === mockCred.password) {
            // Generate a mock token
            const token = `mock-token-${userType}-${Date.now()}`;
            authToken = token;
            currentUser = mockCred.user; // Store user
            
            // Save token to async storage
            AsyncStorage.setItem("authToken", token);
            AsyncStorage.setItem("userType", userType);
            AsyncStorage.setItem("userEmail", email);
            AsyncStorage.setItem("currentUser", JSON.stringify(mockCred.user));
            
            resolve({
              token: token,
              user: mockCred.user,
              message: "Login successful (Offline Mode)",
            });
          } else {
            reject(new Error("Invalid credentials. Please check your email and password."));
          }
        }, 500); // Simulate network delay
      });
    }
    
    // Online mode - try to connect to backend
    try {
      const response = await apiClient.post(CONFIG.ENDPOINTS.auth.login, {
        email,
        password,
        userType,
      });

      // Save token to async storage
      if (response.data.token) {
        authToken = response.data.token;
        await AsyncStorage.setItem("authToken", response.data.token);
      }

      return response.data;
    } catch (error) {
      // If backend is not available, fallback to offline mode
      console.log("Backend unavailable, using offline mode");
      const mockCred = MOCK_CREDENTIALS[userType];
      
      if (mockCred && email === mockCred.email && password === mockCred.password) {
        const token = `mock-token-${userType}-${Date.now()}`;
        authToken = token;
        currentUser = mockCred.user; // Store user
        
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("userType", userType);
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("currentUser", JSON.stringify(mockCred.user));
        
        return {
          token: token,
          user: mockCred.user,
          message: "Login successful (Offline Mode - Backend unavailable)",
        };
      }
      
      throw new Error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  },

  // Sign up new user
  signup: async (email, password, userType, additionalData = {}) => {
    try {
      const response = await apiClient.post(CONFIG.ENDPOINTS.auth.signup, {
        email,
        password,
        userType,
        ...additionalData,
      });

      if (response.data.token) {
        authToken = response.data.token;
        await AsyncStorage.setItem("authToken", response.data.token);
      }

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Sign up failed. Please try again."
      );
    }
  },

  // Logout
  logout: async () => {
    try {
      authToken = null;
      currentUser = null; // Clear user
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("currentUser");
      // Optionally call backend logout endpoint if needed
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Check if user is already logged in
  isAuthenticated: async () => {
    if (!authToken) {
      authToken = await AsyncStorage.getItem("authToken");
    }
    return !!authToken;
  },

  // Get stored token
  getToken: async () => {
    if (!authToken) {
      authToken = await AsyncStorage.getItem("authToken");
    }
    return authToken;
  },

  // Get current user
  getCurrentUser: async () => {
    if (!currentUser) {
      const userJson = await AsyncStorage.getItem("currentUser");
      currentUser = userJson ? JSON.parse(userJson) : null;
    }
    return currentUser;
  },
};

// ===== CLINICIAN APIs =====
export const clinicianService = {
  // Get all patients
  getPatients: async () => {
    if (CONFIG.APP.offline_mode_enabled) {
      const patients = await getOfflinePatients();
      return { patients };
    }
    try {
      const response = await apiClient.get(CONFIG.ENDPOINTS.clinician.patients);
      return response.data;
    } catch (error) {
      // Fallback to offline seed
      const patients = await getOfflinePatients();
      return { patients };
    }
  },

  // Get single patient details
  getPatient: async (patientId) => {
    if (CONFIG.APP.offline_mode_enabled) {
      const patients = await getOfflinePatients();
      const patient = patients.find((p) => p.id === Number(patientId));
      if (!patient) throw new Error("Patient not found");
      const diagMap = await getOfflineDiagnosesMap();
      const progMap = await getOfflineProgressMap();
      return {
        patient,
        diagnoses: diagMap[patient.id] || [],
        progressEntries: progMap[patient.id] || [],
      };
    }
    try {
      const endpoint = CONFIG.ENDPOINTS.clinician.patient_detail.replace(
        ":id",
        patientId
      );
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch patient details"
      );
    }
  },

  // Add new patient
  addPatient: async (patientData) => {
    if (CONFIG.APP.offline_mode_enabled) {
      const patients = await getOfflinePatients();
      const nextId = patients.length
        ? Math.max(...patients.map((p) => p.id)) + 1
        : 1;
      const newPatient = {
        id: nextId,
        name: patientData.name,
        fitzpatrickType: patientData.fitzpatrickType || "III",
        createdAt: new Date().toISOString(),
      };
      const updated = [newPatient, ...patients];
      await setOfflinePatients(updated);
      return { success: true, patient: newPatient };
    }
    try {
      const response = await apiClient.post(
        CONFIG.ENDPOINTS.clinician.patients,
        patientData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to add patient"
      );
    }
  },

  // Save diagnosis
  saveDiagnosis: async (diagnosisData) => {
    if (CONFIG.APP.offline_mode_enabled) {
      // Persist to per-patient diagnoses map and a general cache
      const diagMap = await getOfflineDiagnosesMap();
      const pid = Number(diagnosisData.patientId);
      const entry = {
        diagnosedCondition: diagnosisData.diagnosedCondition,
        riskLevel: diagnosisData.riskLevel || inferRiskFromPrediction(diagnosisData),
        confidence: normalizePercent(diagnosisData.confidence),
        clinicalNotes: diagnosisData.clinicalNotes || "",
        imagePath: diagnosisData.imagePath || "",
        timestamp: new Date().toISOString(),
        metrics: diagnosisData.metrics || generateMetrics(),
        allPredictions: (diagnosisData.allPredictions || []).map((p) => ({
          ...p,
          confidence: normalizePercent(p.confidence),
        })),
      };
      diagMap[pid] = [entry, ...(diagMap[pid] || [])];
      await setOfflineDiagnosesMap(diagMap);

      // Also keep a flat cache for patient view
      await storageService.saveDiagnosis({ patientId: pid, ...entry });
      return { success: true, diagnosis: entry };
    }
    try {
      const response = await apiClient.post(
        CONFIG.ENDPOINTS.clinician.diagnosis,
        diagnosisData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to save diagnosis"
      );
    }
  },

  // Get diagnosis history for patient
  getDiagnosisHistory: async (patientId) => {
    if (CONFIG.APP.offline_mode_enabled) {
      const diagMap = await getOfflineDiagnosesMap();
      return { diagnoses: diagMap[Number(patientId)] || [] };
    }
    try {
      const endpoint = CONFIG.ENDPOINTS.clinician.diagnosis_history.replace(
        ":patientId",
        patientId
      );
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch diagnosis history"
      );
    }
  },

  // Upload images
  uploadImages: async (imageData) => {
    try {
      const response = await apiClient.post(
        CONFIG.ENDPOINTS.clinician.images_upload,
        imageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to upload images"
      );
    }
  },
};

// ===== PATIENT APIs =====
export const patientService = {
  // Get patient's diagnoses
  getDiagnoses: async () => {
    if (CONFIG.APP.offline_mode_enabled) {
      // Get current logged-in patient
      const user = await authService.getCurrentUser();
      const patientId = user?.patientId || 1; // Default to patient 1 if not set
      
      // Use cached saved diagnoses plus seeded ones for this patient
      await ensureOfflineSeeds();
      const cached = await storageService.getDiagnoses();
      // Filter cached by patientId
      const filteredCached = cached
        .filter((d) => d.patientId === patientId)
        .map((d) => ({
          ...d,
          confidence: normalizePercent(d.confidence),
        }));
      
      // Also include seed for this patient if present
      const diagMap = await getOfflineDiagnosesMap();
      const seeded = (diagMap[patientId] || []).map((d) => ({
        ...d,
        confidence: normalizePercent(d.confidence),
      }));
      
      const diagnoses = [...filteredCached, ...seeded];
      return { diagnoses };
    }
    try {
      const response = await apiClient.get(CONFIG.ENDPOINTS.patient.diagnoses);
      return response.data;
    } catch (error) {
      // Fallback to offline cache
      const cached = await storageService.getDiagnoses();
      return { diagnoses: cached };
    }
  },

  // Get patient's progress
  getProgress: async () => {
    if (CONFIG.APP.offline_mode_enabled) {
      // Get current logged-in patient
      const user = await authService.getCurrentUser();
      const patientId = user?.patientId || 1;
      
      await ensureOfflineSeeds();
      const progMap = await getOfflineProgressMap();
      const progressEntries = [...(progMap[patientId] || [])];
      return { progressEntries };
    }
    try {
      const response = await apiClient.get(CONFIG.ENDPOINTS.patient.progress);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch progress"
      );
    }
  },

  // Get patient profile
  getProfile: async () => {
    if (CONFIG.APP.offline_mode_enabled) {
      return {
        profile: {
          id: "patient-001",
          name: "John Doe",
          email: "patient@test.com",
          fitzpatrickType: "III",
          age: 35,
        },
      };
    }
    try {
      const response = await apiClient.get(CONFIG.ENDPOINTS.patient.profile);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  },
};

// Utility: normalize confidence from decimal (0-1) or string to integer percent 0-100
function normalizePercent(value) {
  if (typeof value === "string") {
    const num = parseFloat(value);
    // Heuristic: strings like "85.20" are already percent
    return isNaN(num) ? 0 : Math.round(num);
  }
  if (typeof value === "number") {
    return value <= 1 ? Math.round(value * 100) : Math.round(value);
  }
  return 0;
}

function inferRiskFromPrediction(diagnosisData) {
  // Try to infer from allPredictions top item
  const top = (diagnosisData.allPredictions || [])[0];
  return top?.riskLevel || "Low";
}

// Export API client for custom requests
export default apiClient;
