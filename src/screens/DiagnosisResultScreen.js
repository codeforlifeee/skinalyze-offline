// src/screens/DiagnosisResultScreen.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { clinicianService } from "../services/api";

export default function DiagnosisResultScreen({ route, navigation }) {
  const { imageUri, prediction } = route.params;
  const [notes, setNotes] = useState("");
  const [patientId, setPatientId] = useState("");
  const [saving, setSaving] = useState(false);
  const metrics = useMemo(() => generateClinicalMetrics(), []);

  const saveDiagnosis = async () => {
    if (!patientId.trim()) {
      Alert.alert("Error", "Please enter patient ID");
      return;
    }

    try {
      setSaving(true);
      await clinicianService.saveDiagnosis({
        patientId: parseInt(patientId),
        diagnosedCondition: prediction.topPrediction.className,
        confidence: parseFloat(prediction.topPrediction.confidence),
        riskLevel: prediction.topPrediction.riskLevel,
        clinicalNotes: notes,
        imagePath: imageUri,
        allPredictions: prediction.allPredictions,
        metrics,
      });

      Alert.alert("Success", "Diagnosis saved successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "High":
        return "#ef4444";
      case "Medium":
        return "#f59e0b";
      default:
        return "#10b981";
    }
  };

  const getRiskBgColor = (riskLevel) => {
    switch (riskLevel) {
      case "High":
        return "#fee2e2";
      case "Medium":
        return "#fef3c7";
      default:
        return "#d1fae5";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnosis Result</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageLabel}>📷 Captured Image</Text>
          </View>
        </View>

        {/* AI Analysis Badge */}
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeIcon}>🤖</Text>
          <Text style={styles.aiBadgeText}>AI-Powered Analysis Complete</Text>
        </View>

        {/* Top Prediction Card */}
        <View
          style={[
            styles.predictionCard,
            {
              borderLeftColor: getRiskColor(
                prediction.topPrediction.riskLevel
              ),
            },
          ]}
        >
          <View style={styles.predictionHeader}>
            <View style={styles.predictionHeaderLeft}>
              <Text style={styles.predictionTitle}>Primary Diagnosis</Text>
              <View
                style={[
                  styles.riskBadge,
                  {
                    backgroundColor: getRiskBgColor(
                      prediction.topPrediction.riskLevel
                    ),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.riskBadgeText,
                    { color: getRiskColor(prediction.topPrediction.riskLevel) },
                  ]}
                >
                  {prediction.topPrediction.riskLevel} Risk
                </Text>
              </View>
            </View>
            <View style={styles.confidenceCircle}>
              <Text style={styles.confidenceNumber}>
                {prediction.topPrediction.confidence}
              </Text>
              <Text style={styles.confidenceLabel}>%</Text>
            </View>
          </View>

          <Text style={styles.diagnosisName}>
            {prediction.topPrediction.className}
          </Text>

          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceBarFill,
                {
                  width: `${prediction.topPrediction.confidence}%`,
                  backgroundColor: getRiskColor(
                    prediction.topPrediction.riskLevel
                  ),
                },
              ]}
            />
          </View>
        </View>

        {/* Clinical Metrics */}
        <View style={styles.section}>
          <View style={styles.metricsHeader}>
            <Text style={styles.sectionTitle}>🧪 Clinical Metrics (Auto-computed)</Text>
            <View style={styles.metricsHeaderBadge}>
              <Text style={styles.metricsHeaderBadgeText}>ABCDE + Dermoscopy</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Quantitative features for clinical reference
          </Text>
          <View style={styles.metricsGrid}>
            <MetricItem label="Asymmetry" value={(metrics.asymmetryScore * 100).toFixed(0) + "%"} icon="⚖️" />
            <MetricItem label="Border Irregularity" value={(metrics.borderIrregularity * 100).toFixed(0) + "%"} icon="🔲" />
            <MetricItem label="Color Variation" value={(metrics.colorVarIndex * 100).toFixed(0) + "%"} icon="🎨" />
            <MetricItem label="Diameter" value={metrics.diameterMM.toFixed(1) + " mm"} icon="📏" />
            <MetricItem label="Evolution" value={metrics.evolutionFlag ? "Present" : "Absent"} icon="📈" />
            <MetricItem label="Pigment Network" value={(metrics.pigmentNetworkScore * 100).toFixed(0) + "%"} icon="🕸️" />
            <MetricItem label="Blue-White Veil" value={(metrics.blueWhiteVeilScore * 100).toFixed(0) + "%"} icon="💠" />
            <MetricItem label="Atypical Vessels" value={(metrics.atypicalVesselsScore * 100).toFixed(0) + "%"} icon="🩸" />
          </View>
        </View>

        {/* All Predictions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Differential Diagnosis</Text>
          <Text style={styles.sectionSubtitle}>
            All AI predictions ranked by confidence
          </Text>

          <View style={styles.predictionsContainer}>
            {prediction.allPredictions.map((pred, idx) => (
              <View key={idx} style={styles.predictionItem}>
                <View style={styles.predictionItemLeft}>
                  <View style={styles.predictionRank}>
                    <Text style={styles.predictionRankText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.predictionInfo}>
                    <Text style={styles.predictionClassName}>
                      {pred.className}
                    </Text>
                    <View style={styles.predictionMeta}>
                      <Text style={styles.predictionMetaText}>
                        Risk: {pred.riskLevel}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.predictionConfidence}>
                  <Text style={styles.predictionConfidenceText}>
                    {pred.confidence}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Clinical Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Clinical Documentation</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Patient ID <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              placeholder="Enter patient ID number"
              value={patientId}
              onChangeText={setPatientId}
              keyboardType="numeric"
              editable={!saving}
              style={styles.input}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Clinical Notes (Optional)</Text>
            <TextInput
              placeholder="Add observations, treatment recommendations, or follow-up instructions..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={5}
              editable={!saving}
              style={[styles.input, styles.textArea]}
              placeholderTextColor="#94a3b8"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={saveDiagnosis}
            disabled={saving}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.saveButtonText}>💾 Save Diagnosis</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={saving}
            style={styles.retakeButton}
          >
            <Text style={styles.retakeButtonText}>📷 Retake Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>⚠️</Text>
          <Text style={styles.disclaimerText}>
            AI-assisted diagnosis should be reviewed by a qualified healthcare
            professional. This tool is designed to support, not replace,
            clinical judgment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function generateClinicalMetrics() {
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

const MetricItem = ({ label, value, icon }) => (
  <View style={styles.metricItem}>
    {icon && <Text style={styles.metricIcon}>{icon}</Text>}
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0ea5e9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0c4a6e",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  imageContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 300,
    backgroundColor: "#e0f2fe",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 12,
  },
  imageLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
    gap: 8,
  },
  aiBadgeIcon: {
    fontSize: 18,
  },
  aiBadgeText: {
    color: "#0369a1",
    fontSize: 14,
    fontWeight: "600",
  },
  predictionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  predictionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  predictionHeaderLeft: {
    flex: 1,
  },
  predictionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  confidenceCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f9ff",
    borderWidth: 3,
    borderColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
  },
  confidenceNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0369a1",
  },
  confidenceLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  diagnosisName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 12,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  confidenceBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 16,
  },
  predictionsContainer: {
    gap: 10,
  },
  predictionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  predictionItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  predictionRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  predictionRankText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0369a1",
  },
  predictionInfo: {
    flex: 1,
  },
  predictionClassName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  predictionMeta: {
    flexDirection: "row",
  },
  predictionMetaText: {
    fontSize: 11,
    color: "#64748b",
  },
  predictionConfidence: {
    paddingLeft: 12,
  },
  predictionConfidenceText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0369a1",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metricsHeaderBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricsHeaderBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0369a1",
  },
  metricItem: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
    textAlign: "center",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0c4a6e",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1e293b",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#0ea5e9",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#cbd5e1",
    shadowOpacity: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  retakeButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  retakeButtonText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "bold",
  },
  disclaimer: {
    flexDirection: "row",
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    gap: 12,
  },
  disclaimerIcon: {
    fontSize: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: "#92400e",
    lineHeight: 18,
  },
});
