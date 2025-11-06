// src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { authService } from "../services/api";

export default function LoginScreen({ onLoginSuccess, onUserTypeChange }) {
  const [email, setEmail] = useState("clinician@test.com");
  const [password, setPassword] = useState("password");
  const [userType, setUserType] = useState("clinician");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(email, password, userType);

      if (response && response.token) {
        onUserTypeChange(userType);
        onLoginSuccess(response.user);
      }
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserType = (type) => {
    setUserType(type);
    // Auto-fill demo credentials for convenience
    if (type === "clinician") {
      setEmail("clinician@test.com");
      setPassword("password");
    } else {
      setEmail("patient@test.com");
      setPassword("password");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🔬</Text>
          </View>
          <Text style={styles.appTitle}>SAGAlyze</Text>
          <Text style={styles.appSubtitle}>
            AI-Powered Skin Lesion Diagnosis
          </Text>
          <Text style={styles.tagline}>
            Precision Dermatology at Your Fingertips
          </Text>
          <View style={styles.featureBadges}>
            <View style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>✓ Offline Ready</Text>
            </View>
            <View style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>✓ HIPAA Compliant</Text>
            </View>
          </View>
        </View>

        {/* User Type Selection */}
        <View style={styles.userTypeSection}>
          <Text style={styles.sectionTitle}>Login As:</Text>

          <View style={styles.userTypeButtons}>
            <TouchableOpacity
              onPress={() => toggleUserType("clinician")}
              style={[
                styles.userTypeButton,
                userType === "clinician" && styles.userTypeButtonActive,
              ]}
            >
              <View style={styles.userTypeContent}>
                <Text style={styles.userTypeEmoji}>👨‍⚕️</Text>
                <View>
                  <Text
                    style={[
                      styles.userTypeText,
                      userType === "clinician" && styles.userTypeTextActive,
                    ]}
                  >
                    Clinician
                  </Text>
                  <Text
                    style={[
                      styles.userTypeDescription,
                      userType === "clinician" &&
                        styles.userTypeDescriptionActive,
                    ]}
                  >
                    Healthcare Professional
                  </Text>
                </View>
              </View>
              {userType === "clinician" && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleUserType("patient")}
              style={[
                styles.userTypeButton,
                userType === "patient" && styles.userTypeButtonActive,
              ]}
            >
              <View style={styles.userTypeContent}>
                <Text style={styles.userTypeEmoji}>👤</Text>
                <View>
                  <Text
                    style={[
                      styles.userTypeText,
                      userType === "patient" && styles.userTypeTextActive,
                    ]}
                  >
                    Patient
                  </Text>
                  <Text
                    style={[
                      styles.userTypeDescription,
                      userType === "patient" && styles.userTypeDescriptionActive,
                    ]}
                  >
                    View Your Records
                  </Text>
                </View>
              </View>
              {userType === "patient" && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formSection}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#94a3b8"
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#94a3b8"
                editable={!loading}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Text style={styles.passwordToggleText}>
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.loginButtonContent}>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Text style={styles.loginButtonIcon}>→</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Demo Credentials */}
          <View style={styles.demoCredentials}>
            <View style={styles.demoHeader}>
              <Text style={styles.demoIcon}>ℹ️</Text>
              <Text style={styles.demoTitle}>Demo Credentials</Text>
            </View>
              <View style={styles.demoContent}>
                <View style={styles.demoRow}>
                  <Text style={styles.demoLabel}>Clinician:</Text>
                  <Text style={styles.demoValue}>clinician@test.com / password</Text>
                </View>
                <View style={styles.demoRow}>
                  <Text style={styles.demoLabel}>Patient:</Text>
                  <Text style={styles.demoValue}>patient@test.com / password</Text>
                </View>
              </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Secure • HIPAA Compliant • Encrypted
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 40,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 8,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 16,
    color: "#0c7792",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
  },
  userTypeSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#0c4a6e",
  },
  userTypeButtons: {
    gap: 12,
  },
  userTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userTypeButtonActive: {
    borderColor: "#0ea5e9",
    backgroundColor: "#f0f9ff",
  },
  userTypeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userTypeEmoji: {
    fontSize: 32,
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  userTypeTextActive: {
    color: "#0369a1",
  },
  userTypeDescription: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  userTypeDescriptionActive: {
    color: "#0c7792",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  formSection: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1e293b",
  },
  passwordToggle: {
    padding: 8,
  },
  passwordToggleText: {
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: "#0ea5e9",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0,
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginButtonIcon: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  demoCredentials: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  demoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  demoIcon: {
    fontSize: 18,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400e",
  },
  demoContent: {
    gap: 6,
  },
  demoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  demoLabel: {
    fontSize: 13,
    color: "#92400e",
    fontWeight: "600",
    width: 80,
  },
  demoValue: {
    fontSize: 13,
    color: "#78350f",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
  featureBadges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  featureBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  featureBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#047857",
  },
});
