// src/screens/CameraScreen.js
import React, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { inferenceEngine } from "../ml/inferenceEngine";
import { mockInference } from "../ml/mockInference";

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState("off");

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <View style={styles.permissionIconContainer}>
            <Text style={styles.permissionIcon}>📷</Text>
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            SAGAlyze needs access to your camera to capture images of skin
            lesions for AI-powered diagnosis.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

  // Run ML inference
  const rawPrediction = await mockInference(photo.uri);
  const prediction = normalizePredictionForUI(rawPrediction);
      // For production: const prediction = await inferenceEngine.predict(photo.uri);

      if (prediction) {
        navigation.navigate("DiagnosisResult", {
          imageUri: photo.uri,
          prediction,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture image: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === "off" ? "on" : "off");
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} flash={flashMode}>
        {/* Top Bar */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.topButton}
          >
            <Text style={styles.topButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Capture Lesion</Text>
          <TouchableOpacity onPress={toggleFlash} style={styles.topButton}>
            <Text style={styles.topButtonText}>
              {flashMode === "off" ? "⚡️" : "💡"}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Camera Guide Overlay */}
        <View style={styles.overlay}>
          <View style={styles.guideFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionTitle}>📋 Capture Guidelines</Text>
            <Text style={styles.instructionText}>
              • Center the lesion in the frame
            </Text>
            <Text style={styles.instructionText}>
              • Ensure good lighting
            </Text>
            <Text style={styles.instructionText}>
              • Keep the camera steady
            </Text>
            <Text style={styles.instructionText}>
              • Fill the frame with the lesion
            </Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomContainer}>
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>
                Analyzing image with AI...
              </Text>
            </View>
          )}

          <View style={styles.captureContainer}>
            <TouchableOpacity
              onPress={takePicture}
              disabled={isProcessing}
              style={[
                styles.captureButton,
                isProcessing && styles.captureButtonDisabled,
              ]}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>

          <Text style={styles.captureHint}>
            {isProcessing ? "Processing..." : "Tap to capture"}
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

// Normalize mock inference output to use percentage numbers expected by UI
function normalizePredictionForUI(pred) {
  const toPercent = (v) => {
    if (typeof v === 'string') {
      const n = parseFloat(v);
      return isNaN(n) ? 0 : Math.round(n);
    }
    return v <= 1 ? Math.round(v * 100) : Math.round(v);
  };
  const allPredictions = (pred.allPredictions || []).map((p) => ({
    ...p,
    confidence: toPercent(p.confidence),
    percentage: `${toPercent(p.confidence)}`,
  }));
  const topPrediction = allPredictions[0]
    ? allPredictions[0]
    : pred.topPrediction
    ? { ...pred.topPrediction, confidence: toPercent(pred.topPrediction.confidence) }
    : null;
  return {
    ...pred,
    topPrediction,
    allPredictions,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  permissionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  permissionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  permissionIcon: {
    fontSize: 50,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 16,
    padding: 12,
  },
  backButtonText: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  topButton: {
    padding: 8,
    minWidth: 60,
  },
  topButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  topTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  guideFrame: {
    width: 280,
    height: 280,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#0ea5e9",
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionsContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  instructionBox: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    padding: 16,
    borderRadius: 12,
    maxWidth: 320,
  },
  instructionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  instructionText: {
    color: "#e0f2fe",
    fontSize: 13,
    marginBottom: 4,
  },
  bottomContainer: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  processingOverlay: {
    position: "absolute",
    top: -80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  processingText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  captureContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
  },
  captureHint: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
  },
});
