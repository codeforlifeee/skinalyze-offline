// EXAMPLE: How to use the Backend Integration Services
// This file demonstrates the usage of api.js and storageService.js

import { authService, clinicianService, patientService } from './src/services/api';
import { storageService } from './src/services/storageService';

// ==================== AUTHENTICATION EXAMPLES ====================

// Example 1: Login as Clinician
async function loginExample() {
  try {
    const userData = await authService.login(
      'doctor@hospital.com',
      'securePassword123',
      'clinician'
    );
    console.log('Login successful:', userData);
    
    // Save user data locally
    await storageService.saveUserData(userData);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}

// Example 2: Check if user is authenticated
async function checkAuthExample() {
  const isAuthenticated = await authService.isAuthenticated();
  console.log('User is authenticated:', isAuthenticated);
}

// Example 3: Logout
async function logoutExample() {
  await authService.logout();
  await storageService.clearAll();
  console.log('User logged out and storage cleared');
}

// ==================== CLINICIAN WORKFLOW EXAMPLES ====================

// Example 4: Get all patients
async function getPatientsExample() {
  try {
    const patients = await clinicianService.getPatients();
    console.log('Patients:', patients);
  } catch (error) {
    console.error('Failed to get patients:', error.message);
  }
}

// Example 5: Add new patient
async function addPatientExample() {
  try {
    const newPatient = await clinicianService.addPatient({
      name: 'John Doe',
      age: 45,
      email: 'john.doe@email.com',
      phone: '+1234567890',
      medicalHistory: 'No known allergies',
    });
    console.log('Patient added:', newPatient);
  } catch (error) {
    console.error('Failed to add patient:', error.message);
  }
}

// Example 6: Save diagnosis after ML prediction
async function saveDiagnosisExample() {
  try {
    const diagnosisData = {
      patientId: 'patient_123',
      imageUri: 'file:///path/to/image.jpg',
      prediction: 'Melanoma',
      confidence: 0.87,
      otherPredictions: [
        { class: 'Basal Cell Carcinoma', confidence: 0.08 },
        { class: 'Benign Keratosis', confidence: 0.05 },
      ],
      notes: 'Recommend biopsy for confirmation',
      timestamp: new Date().toISOString(),
    };

    // Save to backend
    const result = await clinicianService.saveDiagnosis(diagnosisData);
    console.log('Diagnosis saved to backend:', result);

    // Also save locally for offline access
    await storageService.saveDiagnosis(diagnosisData);
    console.log('Diagnosis cached locally');
  } catch (error) {
    console.error('Failed to save diagnosis:', error.message);
    
    // If backend fails, save locally as fallback
    await storageService.saveDiagnosis(diagnosisData);
    console.log('Diagnosis saved locally (offline mode)');
  }
}

// Example 7: Upload image
async function uploadImageExample() {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: 'file:///path/to/lesion.jpg',
      type: 'image/jpeg',
      name: 'lesion.jpg',
    });
    formData.append('patientId', 'patient_123');

    const result = await clinicianService.uploadImages(formData);
    console.log('Image uploaded:', result);
  } catch (error) {
    console.error('Failed to upload image:', error.message);
  }
}

// Example 8: Get diagnosis history for a patient
async function getDiagnosisHistoryExample() {
  try {
    const history = await clinicianService.getDiagnosisHistory('patient_123');
    console.log('Diagnosis history:', history);
  } catch (error) {
    console.error('Failed to get diagnosis history:', error.message);
  }
}

// ==================== PATIENT WORKFLOW EXAMPLES ====================

// Example 9: Get patient's diagnoses
async function getMyDiagnosesExample() {
  try {
    const diagnoses = await patientService.getDiagnoses();
    console.log('My diagnoses:', diagnoses);
  } catch (error) {
    console.error('Failed to get diagnoses:', error.message);
  }
}

// Example 10: Get patient's progress
async function getProgressExample() {
  try {
    const progress = await patientService.getProgress();
    console.log('My progress:', progress);
  } catch (error) {
    console.error('Failed to get progress:', error.message);
  }
}

// ==================== STORAGE EXAMPLES ====================

// Example 11: Get cached diagnoses (for offline viewing)
async function getCachedDiagnosesExample() {
  const cachedDiagnoses = await storageService.getDiagnoses();
  console.log('Cached diagnoses:', cachedDiagnoses);
  console.log('Total cached:', cachedDiagnoses.length);
}

// Example 12: Get user data from local storage
async function getUserDataExample() {
  const userData = await storageService.getUserData();
  console.log('User data:', userData);
}

// ==================== COMPLETE WORKFLOW EXAMPLE ====================

// Example 13: Complete diagnosis workflow
async function completeDiagnosisWorkflow() {
  try {
    // Step 1: Login
    const user = await authService.login('doctor@hospital.com', 'password', 'clinician');
    await storageService.saveUserData(user);
    
    // Step 2: Get patients
    const patients = await clinicianService.getPatients();
    const patient = patients[0];
    
    // Step 3: Capture image and run ML model (not shown here)
    const imageUri = 'file:///captured/image.jpg';
    const mlPrediction = {
      class: 'Melanoma',
      confidence: 0.87,
    };
    
    // Step 4: Save diagnosis
    const diagnosis = {
      patientId: patient.id,
      imageUri,
      prediction: mlPrediction.class,
      confidence: mlPrediction.confidence,
      notes: 'Requires follow-up',
      timestamp: new Date().toISOString(),
    };
    
    await clinicianService.saveDiagnosis(diagnosis);
    await storageService.saveDiagnosis(diagnosis); // Cache locally
    
    console.log('Complete workflow finished successfully!');
  } catch (error) {
    console.error('Workflow error:', error.message);
  }
}

// ==================== OFFLINE MODE EXAMPLE ====================

// Example 14: Handle offline scenario
async function offlineModeExample() {
  try {
    // Try to save to backend
    await clinicianService.saveDiagnosis({
      patientId: 'patient_123',
      prediction: 'Melanoma',
      confidence: 0.85,
    });
  } catch (error) {
    console.log('Backend unavailable, using offline mode');
    
    // Save locally instead
    await storageService.saveDiagnosis({
      patientId: 'patient_123',
      prediction: 'Melanoma',
      confidence: 0.85,
      offline: true,
      needsSync: true,
    });
    
    console.log('Diagnosis saved offline. Will sync when online.');
  }
}

// Export examples for testing
export {
  loginExample,
  checkAuthExample,
  logoutExample,
  getPatientsExample,
  addPatientExample,
  saveDiagnosisExample,
  uploadImageExample,
  getDiagnosisHistoryExample,
  getMyDiagnosesExample,
  getProgressExample,
  getCachedDiagnosesExample,
  getUserDataExample,
  completeDiagnosisWorkflow,
  offlineModeExample,
};
