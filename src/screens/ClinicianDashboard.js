// src/screens/ClinicianDashboard.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { clinicianService } from "../services/api";

export default function ClinicianDashboard({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientFitzpatrick, setNewPatientFitzpatrick] = useState("III");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await clinicianService.getPatients();
      setPatients(response.patients || []);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  };

  const addPatient = async () => {
    if (!newPatientName.trim()) {
      Alert.alert("Error", "Enter patient name");
      return;
    }

    try {
      await clinicianService.addPatient({
        name: newPatientName,
        fitzpatrickType: newPatientFitzpatrick,
      });
      setNewPatientName("");
      setShowAddPatient(false);
      fetchPatients();
      Alert.alert("Success", "Patient added successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PatientCard = ({ patient }) => (
    <TouchableOpacity
      style={styles.patientCard}
      activeOpacity={0.7}
      onPress={() => {
        // Navigate to patient details
        navigation.navigate("PatientDetails", { patientId: patient.id });
      }}
    >
      <View style={styles.patientCardLeft}>
        <View style={styles.patientAvatar}>
          <Text style={styles.patientAvatarText}>
            {patient.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <View style={styles.patientMeta}>
            <Text style={styles.patientMetaText}>ID: {patient.id}</Text>
            {patient.fitzpatrickType && (
              <>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.patientMetaText}>
                  Type {patient.fitzpatrickType}
                </Text>
              </>
            )}
          </View>
          {patient.createdAt && (
            <Text style={styles.patientDate}>
              Added {new Date(patient.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.patientCardRight}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>👥</Text>
      <Text style={styles.emptyStateTitle}>No Patients Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? "No patients match your search"
          : "Add your first patient to get started"}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          onPress={() => setShowAddPatient(true)}
          style={styles.emptyStateButton}
        >
          <Text style={styles.emptyStateButtonText}>+ Add Patient</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Patients</Text>
          <Text style={styles.headerSubtitle}>
            {patients.length} {patients.length === 1 ? "patient" : "patients"}{" "}
            total
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Camera")}
          style={styles.scanButton}
        >
          <Text style={styles.scanButtonText}>📷 Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search patients by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Add Patient Toggle */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          onPress={() => setShowAddPatient(!showAddPatient)}
          style={[
            styles.addButton,
            showAddPatient && styles.addButtonActive,
          ]}
        >
          <Text style={styles.addButtonText}>
            {showAddPatient ? "✕ Cancel" : "+ Add New Patient"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Patient Form */}
      {showAddPatient && (
        <View style={styles.addPatientForm}>
          <Text style={styles.formTitle}>New Patient Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              Patient Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              placeholder="Enter full name"
              value={newPatientName}
              onChangeText={setNewPatientName}
              style={styles.formInput}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Fitzpatrick Skin Type</Text>
            <View style={styles.fitzpatrickButtons}>
              {["I", "II", "III", "IV", "V", "VI"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setNewPatientFitzpatrick(type)}
                  style={[
                    styles.fitzpatrickButton,
                    newPatientFitzpatrick === type &&
                      styles.fitzpatrickButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.fitzpatrickButtonText,
                      newPatientFitzpatrick === type &&
                        styles.fitzpatrickButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={addPatient}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>💾 Save Patient</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Patients List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PatientCard patient={item} />}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0ea5e9"
              colors={["#0ea5e9"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

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
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0c4a6e",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  scanButton: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1e293b",
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: "#94a3b8",
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonActive: {
    backgroundColor: "#64748b",
    shadowColor: "#64748b",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  addPatientForm: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e0f2fe",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  formInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1e293b",
  },
  fitzpatrickButtons: {
    flexDirection: "row",
    gap: 8,
  },
  fitzpatrickButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    alignItems: "center",
  },
  fitzpatrickButtonActive: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0ea5e9",
  },
  fitzpatrickButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  fitzpatrickButtonTextActive: {
    color: "#0369a1",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  patientCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  patientCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0ea5e9",
  },
  patientAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0369a1",
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 4,
  },
  patientMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  patientMetaText: {
    fontSize: 12,
    color: "#64748b",
  },
  metaSeparator: {
    fontSize: 12,
    color: "#cbd5e1",
    marginHorizontal: 6,
  },
  patientDate: {
    fontSize: 11,
    color: "#94a3b8",
  },
  patientCardRight: {
    paddingLeft: 12,
  },
  chevron: {
    fontSize: 24,
    color: "#cbd5e1",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
