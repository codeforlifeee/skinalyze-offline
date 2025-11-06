// src/screens/PatientDashboard.js
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
} from "react-native";
import { patientService } from "../services/api";

export default function PatientDashboard({ navigation }) {
  const [diagnoses, setDiagnoses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("diagnoses");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const diagRes = await patientService.getDiagnoses();
      const progRes = await patientService.getProgress();

      setDiagnoses(diagRes.diagnoses || []);
      setProgress(progRes.progressEntries || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
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
            {diagnosis.lesionType || diagnosis.diagnosedCondition}
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
            <Text style={styles.confidenceText}>
              {diagnosis.confidence}%
            </Text>
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
            })}
          </Text>
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
    </View>
  );

  const MetricItem = ({ label, value }) => (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  const ProgressCard = ({ progressEntry }) => {
    const healingScore = progressEntry.healingScore || 0;
    const scoreColor =
      healingScore >= 70 ? "#10b981" : healingScore >= 40 ? "#f59e0b" : "#ef4444";

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
          <View
            style={[styles.scoreCircle, { borderColor: scoreColor }]}
          >
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
            <Text style={styles.progressNotesText}>
              {progressEntry.notes}
            </Text>
          </View>
        )}
      </View>
    );
  };

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
          ? "Your diagnosis history will appear here once your healthcare provider adds them."
          : "Treatment progress tracking will be shown here as your condition is monitored."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Health Journey</Text>
          <Text style={styles.headerSubtitle}>
            Track your diagnosis and recovery
          </Text>
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
          style={[
            styles.tab,
            activeTab === "progress" && styles.tabActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "progress" && styles.tabTextActive,
            ]}
          >
            📈 Progress
          </Text>
          {progress.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{progress.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading your data...</Text>
        </View>
      ) : (
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
                  <Text style={styles.sectionTitle}>Recent Diagnoses</Text>
                  <Text style={styles.sectionSubtitle}>
                    Your diagnosis history from healthcare providers
                  </Text>
                </View>
                {diagnoses.map((diagnosis, idx) => (
                  <DiagnosisCard key={idx} diagnosis={diagnosis} />
                ))}
              </>
            ) : (
              <EmptyState type="diagnoses" />
            )
          ) : progress.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Healing Progress</Text>
                <Text style={styles.sectionSubtitle}>
                  Track your recovery journey over time
                </Text>
              </View>
              {progress.map((progressEntry, idx) => (
                <ProgressCard key={idx} progressEntry={progressEntry} />
              ))}
            </>
          ) : (
            <EmptyState type="progress" />
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Need Help?</Text>
              <Text style={styles.infoText}>
                Contact your healthcare provider for any questions about your
                diagnosis or treatment plan.
              </Text>
            </View>
          </View>
        </ScrollView>
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
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
    marginBottom: 8,
    gap: 6,
  },
  cardMetaIcon: {
    fontSize: 14,
  },
  cardMetaText: {
    fontSize: 13,
    color: "#64748b",
  },
  notesContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  progressBar: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressNotes: {
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 8,
  },
  progressNotesText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
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
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#dbeafe",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 12,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#0c7792",
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
});
