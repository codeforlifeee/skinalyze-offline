// src/services/storageService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storageService = {
  // Save user data
  saveUserData: async (userData) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  },

  // Get user data
  getUserData: async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  },

  // Save recent diagnoses (for offline caching)
  saveDiagnosis: async (diagnosis) => {
    try {
      const diagnoses = await storageService.getDiagnoses();
      diagnoses.push({
        ...diagnosis,
        savedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem("diagnoses", JSON.stringify(diagnoses));
    } catch (error) {
      console.error("Error saving diagnosis:", error);
    }
  },

  // Get cached diagnoses
  getDiagnoses: async () => {
    try {
      const data = await AsyncStorage.getItem("diagnoses");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting diagnoses:", error);
      return [];
    }
  },

  // Clear all local data
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  },
};
