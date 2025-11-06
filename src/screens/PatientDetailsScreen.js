// src/screens/PatientDetailsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { clinicianService } from "../services/api";

export default function PatientDetailsScreen({ route, navigation }) {
  const { patientId } = route.params;
  const [patient, setPatient] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);
  const [progressEntries, setProgressEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("diagnoses");

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const response = await clinicianService.getPatient(patientId);
      setPatient(response.patient);
      setDiagnoses(response.diagnoses || []);
      setProgressEntries(response.progressEntries || []);
    } catch (error) {
      console.error("Error fetching patient details:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPatientDetails();
    setRefreshing(false);
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

  const DiagnosisCard = ({ diagnosis }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle}>
            {diagnosis.diagnosedCondition}
          </Text>
          {diagnosis.riskLevel && (
            <View
              style={[
                styles.riskBadge,
                { backgroundColor: getRiskBgColor(diagnosis.riskLevel) },
              ]}
            >
              <Text
                style={[
                  styles.riskBadgeText,
                  { color: getRiskColor(diagnosis.riskLevel) },
                ]}
              >
                {diagnosis.riskLevel} Risk
              </Text>
            </View>
          )}
        </View>
        {diagnosis.confidence && (
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{diagnosis.confidence}%</Text>
          </View>
        )}
      </View>

      {diagnosis.timestamp && (
        <View style={styles.cardMeta}>
          <Text style={styles.cardMetaIcon}>📅</Text>
          <Text style={styles.cardMetaText}>
            {new Date(diagnosis.timestamp).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      )}

      {diagnosis.imagePath && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: diagnosis.imagePath }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        </View>
      )}

      {diagnosis.clinicalNotes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Clinical Notes:</Text>
          <Text style={styles.notesText}>{diagnosis.clinicalNotes}</Text>
        </View>
      )}

      {/* Clinical Metrics */}
      {diagnosis.metrics && (
        <View style={styles.metricsSection}>
          <Text style={styles.metricsSectionTitle}>
            🧪 Clinical Metrics
          </Text>
          <View style={styles.metricsGrid}>
            <MetricItem
              label="Asymmetry"
              value={
                (diagnosis.metrics.asymmetryScore * 100).toFixed(0) + "%"
              }
            />
            <MetricItem
              label="Border"
              value={
                (diagnosis.metrics.borderIrregularity * 100).toFixed(0) + "%"
              }
            />
            <MetricItem
              label="Color Var."
              value={
                (diagnosis.metrics.colorVarIndex * 100).toFixed(0) + "%"
              }
            />
            <MetricItem
              label="Diameter"
              value={diagnosis.metrics.diameterMM.toFixed(1) + " mm"}
            />
            <MetricItem
              label="Evolution"
              value={diagnosis.metrics.evolutionFlag ? "Present" : "Absent"}
            />
            <MetricItem
              label="Pigment Net"
              value={
                (diagnosis.metrics.pigmentNetworkScore * 100).toFixed(0) + "%"
              }
            />
            <MetricItem
              label="Blue-White"
              value={
                (diagnosis.metrics.blueWhiteVeilScore * 100).toFixed(0) + "%"
              }
            />
            <MetricItem
              label="Vessels"
              value={
                (diagnosis.metrics.atypicalVesselsScore * 100).toFixed(0) +
                "%"
              }
            />
          </View>
        </View>
      )}

      {/* Differential Diagnosis */}
      {diagnosis.allPredictions && diagnosis.allPredictions.length > 1 && (
        <View style={styles.differentialSection}>
          <Text style={styles.differentialTitle}>
            📊 Top Differential Diagnoses
          </Text>
          {diagnosis.allPredictions.slice(0, 3).map((pred, idx) => (
            <View key={idx} style={styles.predictionItem}>
              <View style={styles.predictionRank}>
                <Text style={styles.predictionRankText}>{idx + 1}</Text>
              </View>
              <Text style={styles.predictionClassName}>{pred.className}</Text>
              <Text style={styles.predictionConfidence}>
                {pred.confidence}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const ProgressCard = ({ progressEntry }) => {
    const healingScore = progressEntry.healingScore || 0;
    const scoreColor =
      healingScore >= 70
        ? "#10b981"
        : healingScore >= 40
        ? "#f59e0b"
        : "#ef4444";

    return (
      <View style={styles.card}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressTitle}>Healing Progress</Text>
            {progressEntry.date && (
              <Text style={styles.progressDate}>
                {new Date(progressEntry.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            )}
          </View>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>
              {healingScore}
            </Text>
            <Text style={styles.scoreLabel}>%</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${healingScore}%`, backgroundColor: scoreColor },
            ]}
          />
        </View>

        {progressEntry.notes && (
          <View style={styles.progressNotes}>
            <Text style={styles.progressNotesText}>{progressEntry.notes}</Text>
          </View>
        )}
      </View>
    );
  };

  const MetricItem = ({ label, value }) => (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  const EmptyState = ({ type }) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>
        {type === "diagnoses" ? "🔬" : "📈"}
      </Text>
      <Text style={styles.emptyStateTitle}>
        No {type === "diagnoses" ? "Diagnoses" : "Progress"} Yet
      </Text>
      <Text style={styles.emptyStateText}>
        {type === "diagnoses"
          ? "No diagnosis history for this patient."
          : "No progress tracking entries yet."}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Patient Details</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading patient data...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Patient Details</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Patient Info Card */}
      {patient && (
        <View style={styles.patientInfoCard}>
          <View style={styles.patientAvatar}>
            <Text style={styles.patientAvatarText}>
              {patient.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.patientInfoContent}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <View style={styles.patientMetaRow}>
              <View style={styles.patientMetaItem}>
                <Text style={styles.patientMetaLabel}>Patient ID:</Text>
                <Text style={styles.patientMetaValue}>{patient.id}</Text>
              </View>
              {patient.fitzpatrickType && (
                <View style={styles.patientMetaItem}>
                  <Text style={styles.patientMetaLabel}>Skin Type:</Text>
                  <Text style={styles.patientMetaValue}>
                    Type {patient.fitzpatrickType}
                  </Text>
                </View>
              )}
            </View>
            {patient.createdAt && (
              <Text style={styles.patientDate}>
                Patient since{" "}
                {new Date(patient.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{diagnoses.length}</Text>
          <Text style={styles.statLabel}>Diagnoses</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{progressEntries.length}</Text>
          <Text style={styles.statLabel}>Progress Entries</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {diagnoses.filter((d) => d.riskLevel === "High").length}
          </Text>
          <Text style={styles.statLabel}>High Risk</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab("diagnoses")}
          style={[
            styles.tab,
            activeTab === "diagnoses" && styles.tabActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "diagnoses" && styles.tabTextActive,
            ]}
          >
            🔬 Diagnoses
          </Text>
          {diagnoses.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{diagnoses.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("progress")}
          style={[styles.tab, activeTab === "progress" && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "progress" && styles.tabTextActive,
            ]}
          >
            📈 Progress
          </Text>
          {progressEntries.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{progressEntries.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0ea5e9"
            colors={["#0ea5e9"]}
          />
        }
      >
        {activeTab === "diagnoses" ? (
          diagnoses.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Diagnosis History</Text>
                <Text style={styles.sectionSubtitle}>
                  Complete medical record with metrics
                </Text>
              </View>
              {diagnoses.map((diagnosis, idx) => (
                <DiagnosisCard key={idx} diagnosis={diagnosis} />
              ))}
            </>
          ) : (
            <EmptyState type="diagnoses" />
          )
        ) : progressEntries.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Treatment Progress</Text>
              <Text style={styles.sectionSubtitle}>
                Tracking recovery over time
              </Text>
            </View>
            {progressEntries.map((progressEntry, idx) => (
              <ProgressCard key={idx} progressEntry={progressEntry} />
            ))}
          </>
        ) : (
          <EmptyState type="progress" />
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  patientInfoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  patientAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0ea5e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  patientAvatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  patientInfoContent: {
    flex: 1,
  },
  patientName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 8,
  },
  patientMetaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 6,
  },
  patientMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  patientMetaLabel: {
    fontSize: 13,
    color: "#64748b",
  },
  patientMetaValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0369a1",
  },
  patientDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 12,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  tabActive: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0ea5e9",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#0369a1",
    fontWeight: "bold",
  },
  badge: {
    backgroundColor: "#0ea5e9",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0c4a6e",
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  confidenceBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0369a1",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  cardMetaIcon: {
    fontSize: 14,
  },
  cardMetaText: {
    fontSize: 13,
    color: "#64748b",
  },
  imagePreviewContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    backgroundColor: "#e0f2fe",
  },
  notesContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  metricsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  metricsSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0369a1",
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricItem: {
    width: "23%",
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 4,
    textAlign: "center",
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0c4a6e",
  },
  differentialSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  differentialTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0369a1",
    marginBottom: 8,
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    gap: 10,
  },
  predictionRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },
  predictionRankText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0369a1",
  },
  predictionClassName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  predictionConfidence: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0369a1",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 4,
  },
  progressDate: {
    fontSize: 12,
    color: "#64748b",
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressNotes: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 8,
  },
  progressNotesText: {
    fontSize: 12,
    color: "#64748b",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0c4a6e",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
