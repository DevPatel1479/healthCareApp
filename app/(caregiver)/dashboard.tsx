import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  Animated,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { connectSocket, getSocket, disconnectSocket } from "@/services/socket";
import StatsHeader from "@/components/dashboard/StatsHeader";
import TaskCard from "@/components/dashboard/TaskCard";
import { ENDPOINTS } from "@/api/endpoints";
import { Ionicons } from "@expo/vector-icons";




type TaskAssignment = {
  assignment_id: number;
  status: "completed" | "pending" | "skipped" | "refused";
  time_done: string | null;
  flag_level: "green" | "yellow" | "red";
  observation: string | null;
  selected?: boolean;
  caregiver?: {
    id: number;
    name: string;
    phone: string;
  } | null;
  patient?: {
    id: number;
    name: string;
    phone: string;
  } | null;
  task: {
    task_id: number;
    description: string;
    task_category: string;
    scheduled_time: string | null;
    clinical_notes: string | null;

  };
};

type GroupedTasks = Record<string, TaskAssignment[]>;


const sortTasks = (tasks: TaskAssignment[]) => {

  const statusPriority: Record<string, number> = {
    pending: 0,
    completed: 1,
    skipped: 1,
    refused: 1,
  };

  return [...tasks].sort((a, b) => {

    // category priority
    const categoryOrder = [
      "Daily_Routine",
      "Unplanned_As_Required",
      "Periodic",
    ];

    const categoryCompare =
      categoryOrder.indexOf(a.task.task_category) -
      categoryOrder.indexOf(b.task.task_category);

    if (categoryCompare !== 0) {
      return categoryCompare;
    }

    // pending first
    const statusCompare =
      statusPriority[a.status] -
      statusPriority[b.status];

    if (statusCompare !== 0) {
      return statusCompare;
    }

    // time sorting
    const timeA = a.task.scheduled_time
      ? new Date(a.task.scheduled_time).getTime()
      : 0;

    const timeB = b.task.scheduled_time
      ? new Date(b.task.scheduled_time).getTime()
      : 0;

    return timeA - timeB;
  });
};

export default function CaregiverDashboard() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [updating, setUpdating] = useState(false);

  const [showBanner, setShowBanner] = useState(false);
  const bannerAnim = useRef(new Animated.Value(-80)).current;
  // const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [error, setError] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<TaskAssignment | null>(null);
  const [image, setImage] = useState<string | null>(null);
  // bottom modal
  const [modalVisible, setModalVisible] = useState(false);
  // const [selectedTask, setSelectedTask] = useState(null);
  const [note, setNote] = useState("");
  const [patientModal, setPatientModal] = useState(false);
  // const [image, setImage] = useState(null);
  const [patientInfo, setPatientInfo] = useState<TaskAssignment["patient"] | null>(null);



  const [caregiverName, setCaregiverName] = useState("Caregiver");
  useEffect(() => {
    const loadCaregiverName = async () => {
      try {
        const fullName = await AsyncStorage.getItem("full_name");

        if (fullName) {
          setCaregiverName(fullName);
        }

      } catch (err) {
        console.log("Failed to load caregiver name", err);
      }
    };

    loadCaregiverName();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace("/(auth)/login");       // ✅ redirect
            } catch (e) {
              console.log("Logout error", e);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  const fabScale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let socket: any;


    const initializeSocket = async () => {
      try {


        const referenceId = await AsyncStorage.getItem("reference_id");

        if (!referenceId) {
          console.log("Caregiver reference_id not found");
          return;
        }


        socket = connectSocket(Number(referenceId));

        // 🔥 LISTEN FOR TASK UPDATE
        socket.on("task_updated", (updatedTask: any) => {
          console.log("📡 Task updated via socket:", updatedTask);

          setTasks((prev) =>
            prev.map((t) =>
              t.assignment_id === updatedTask.assignment_id
                ? { ...t, ...updatedTask }
                : t
            )
          );
        });

        // 🔥 LISTEN FOR NEW TASK ASSIGNMENT
        socket.on("task_assigned", (newTask: any) => {
          console.log("🆕 New task received:", newTask);
          setShowBanner(true);

          Animated.timing(bannerAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();

          // auto hide after 3 sec
          setTimeout(() => {
            Animated.timing(bannerAnim, {
              toValue: -80,
              duration: 300,
              useNativeDriver: true,
            }).start(() => setShowBanner(false));
          }, 3000);
          // ✅ 1. SAFETY FILTER (even though room exists)
          if (newTask.caregiver_id !== Number(referenceId)) return;

          setTasks((prev) => {
            // ✅ 2. PREVENT DUPLICATE
            const exists = prev.some(
              (t) => t.assignment_id === newTask.assignment_id
            );
            if (exists) return prev;

            // ✅ 3. NORMALIZE STRUCTURE (VERY IMPORTANT)
            const formattedTask = {
              assignment_id: newTask.assignment_id,
              status: newTask.status,
              time_done: newTask.time_done,
              flag_level: newTask.flag_level,
              observation: newTask.observation,
              selected: false,

              // 🔥 your UI expects "task"
              task: newTask.task,
            };

            // ✅ 4. ADD + SORT (latest first)
            const updated = [...prev, formattedTask];

            return sortTasks(updated);
          });
        });

        socket.on("daily_tasks_regenerated", async (data: any) => {

          console.log("📡 Daily tasks regenerated:", data);

          // show banner
          setShowBanner(true);

          Animated.timing(bannerAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();

          setTimeout(() => {
            Animated.timing(bannerAnim, {
              toValue: -80,
              duration: 300,
              useNativeDriver: true,
            }).start(() => setShowBanner(false));
          }, 3000);

          // 🔥 IMPORTANT
          await fetchTasks();
        });
      } catch (err) {
        console.log("Socket initialization error:", err);
      }
    };

    initializeSocket();
    return () => {
      if (socket) {
        socket.off("task_updated");
        socket.off("task_assigned");
        socket.off("daily_tasks_regenerated");
      }

      disconnectSocket(); // cleanup
    };

  }, []);




  // ---------------- FETCH TASKS ----------------
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const referenceId = await AsyncStorage.getItem("reference_id");
      console.log(`Fetched caregiver id ${referenceId}`);
      const res = await fetch(ENDPOINTS.getCaregiverTasks(Number(referenceId)));
      const json = await res.json();

      if (!json.success) throw new Error(json.message || "Failed to load");

      setTasks(json.data);
      setPatientInfo(json.patient ?? null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ---------------- GROUP BY CATEGORY ----------------
  // ---------------- CATEGORY ORDER ----------------
  const categoryOrder = [
    "Daily_Routine",
    "Unplanned_As_Required",
    "Periodic",
  ];

  // ---------------- STATUS PRIORITY ----------------
  const statusPriority: Record<string, number> = {
    pending: 0,
    completed: 1,
    skipped: 1,
    refused: 1,
  };

  // ---------------- GROUP + SORT ----------------
  const grouped: GroupedTasks = {};

  // create categories in correct order
  categoryOrder.forEach((category) => {
    grouped[category] = [];
  });

  // group tasks
  tasks.forEach((task) => {
    const category = task.task.task_category;

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(task);
  });

  // sort inside categories
  Object.keys(grouped).forEach((category) => {

    grouped[category].sort((a, b) => {

      // ✅ pending first
      const statusCompare =
        statusPriority[a.status] -
        statusPriority[b.status];

      if (statusCompare !== 0) {
        return statusCompare;
      }

      // ✅ sort by scheduled time
      const timeA = a.task.scheduled_time
        ? new Date(a.task.scheduled_time).getTime()
        : 0;

      const timeB = b.task.scheduled_time
        ? new Date(b.task.scheduled_time).getTime()
        : 0;

      return timeA - timeB;
    });
  });

  // ---------------- TOGGLE ----------------
  const handleToggle = (item: TaskAssignment) => {
    if (item.status === "completed") return;

    setSelectedTask(item);
    setModalVisible(true);
  };

  // ---------------- PICK IMAGE ----------------
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ---------------- COMPLETE (DUMMY) ----------------
  const handleSubmit = async () => {
    if (!selectedTask) return;

    try {
      setUpdating(true);
      const referenceId = await AsyncStorage.getItem("reference_id");
      // 🔥 CALL BACKEND
      const res = await fetch(ENDPOINTS.updateTasksStatus(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignment_id: selectedTask.assignment_id,
          caregiver_id: Number(referenceId),
          status: "completed",
          observation: note || null,
          photo_evidence: image || null,
        }),
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      const updatedTask = json.data;

      // 🔥 OPTIMISTIC UI UPDATE (instant)
      setTasks((prev) => {

        const updated = prev.map((t) =>
          t.assignment_id === updatedTask.assignment_id
            ? { ...t, ...updatedTask }
            : t
        );

        return sortTasks(updated);
      });

      // 🔥 RESET UI
      setModalVisible(false);
      setNote("");
      setImage(null);
      setSelectedTask(null);

    } catch (err: any) {
      console.log("error", err);
      alert(err.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const selectedCount = tasks.filter((t) => t.selected).length;

  useEffect(() => {
    if (selectedCount > 0) {
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true }).start();
    } else {
      Animated.timing(fabScale, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [selectedCount]);

  // ---------------- LOADING UI ----------------
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading tasks...</Text>
      </SafeAreaView>
    );
  }

  // ---------------- ERROR UI ----------------
  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
        <TouchableOpacity onPress={fetchTasks} style={styles.retryBtn}>
          <Text style={{ color: "#fff" }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  const formatCategory = (cat: string) => {
    return cat
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: height * 0.08,
          paddingBottom: height * 0.14,
        }}
      >

        <View style={{ paddingHorizontal: width * 0.05 }}>
          {showBanner && (
            <Animated.View
              style={[
                styles.banner,
                { transform: [{ translateY: bannerAnim }] },
              ]}
            >
              <Text style={styles.bannerText}>🆕 New Task Assigned</Text>
            </Animated.View>
          )}
          <View style={styles.topBar}>
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <Ionicons
                  name="person-circle"
                  size={52}
                  color="#2563eb"
                />
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.welcomeText}>
                  Welcome Back
                </Text>

                <Text style={styles.profileName}>
                  {caregiverName}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    if (!patientInfo) return;
                    setPatientModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewPatientText}>
                    View Patient Details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={fetchTasks}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="refresh-outline"
                  size={24}
                  color="#111827"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color="#dc2626"
                />
              </TouchableOpacity>
            </View>
          </View>
          <StatsHeader

            completed={tasks.filter((t) => t.status === "completed").length}
            total={tasks.length}
            title="Caregiver Dashboard"

          />

          {/* GROUPED TASKS */}
          {categoryOrder
            .filter((category) => grouped[category]?.length > 0)
            .map((category) => (
              <View key={category} style={styles.categoryBlock}>

                {/* CATEGORY HEADER */}
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>
                    {formatCategory(category)}
                  </Text>

                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                      {grouped[category].length}
                    </Text>
                  </View>
                </View>

                {/* TASK LIST */}
                <View style={styles.taskList}>
                  {grouped[category].map((task) => (

                    <View
                      key={task.assignment_id}
                      style={{
                        opacity:
                          task.status === "completed"
                            ? 0.6
                            : 1,
                      }}
                    >

                      <TaskCard
                        task={{
                          id: task.assignment_id,
                          title: task.task.description,
                          completed: task.status === "completed",
                          selected: task.selected,
                          time: task.task.scheduled_time,
                        }}
                        onToggle={() => handleToggle(task)}
                      />

                    </View>
                  ))}
                </View>

              </View>
            ))}

        </View>
      </ScrollView>

      {/* FAB */}
      {selectedCount > 0 && (
        <Animated.View
          style={[
            styles.completeFabContainer,
            { transform: [{ scale: fabScale }] },
          ]}
        >
          <TouchableOpacity style={styles.completeFab}>
            <Text style={{ color: "#fff", fontSize: 18 }}>✓</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              Add Observation (Optional)
            </Text>

            <TextInput
              placeholder="Write notes..."
              value={note}
              onChangeText={setNote}
              style={styles.input}
            />

            <View style={styles.modalButtonContainer}>

              <TouchableOpacity onPress={pickImage} style={styles.buttonPrimary}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Pick Image
                </Text>
              </TouchableOpacity>

              {image && (
                <Image source={{ uri: image }} style={styles.preview} />
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.buttonSuccess}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Save Observation
                  </Text>
                )}
              </TouchableOpacity>

            </View>


          </View>
        </View>
      </Modal>
      <Modal
        visible={patientModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPatientModal(false)}
      >
        <View style={styles.patientModalOverlay}>
          <View style={styles.patientModalCard}>

            <TouchableOpacity
              style={styles.patientCloseBtn}
              onPress={() => setPatientModal(false)}
            >
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>

            <View style={styles.patientHeader}>
              <Ionicons
                name="person-circle"
                size={72}
                color="#2563eb"
              />
              <Text style={styles.patientTitle}>
                Patient Details
              </Text>
              <Text style={styles.patientSubtitle}>
                Assigned Patient Information
              </Text>
            </View>

            {patientInfo ? (
              <>
                <View style={styles.patientInfoCard}>
                  <View style={styles.patientRow}>
                    <Ionicons
                      name="person-outline"
                      size={22}
                      color="#2563eb"
                    />
                    <Text style={styles.patientValue}>
                      {patientInfo.name}
                    </Text>
                  </View>

                  <View style={styles.patientDivider} />

                  <View style={styles.patientRow}>
                    <Ionicons
                      name="call-outline"
                      size={22}
                      color="#16a34a"
                    />
                    <Text style={styles.patientValue}>
                      {patientInfo.phone}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closePatientButton}
                  onPress={() => setPatientModal(false)}
                >
                  <Text style={styles.closePatientButtonText}>
                    Done
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyPatientState}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#9ca3af"
                />
                <Text style={styles.emptyPatientText}>
                  No patient assigned yet
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      {/* 🔴 LOGOUT FAB */}

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
    flexShrink: 1, // allows full name to wrap if needed
  },

  viewPatientText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
    marginTop: 6,
  },
  profileRole: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 4,
    fontWeight: "600",
  },

  patientModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 24,
  },

  patientModalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },

  patientCloseBtn: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 10,
  },

  patientHeader: {
    alignItems: "center",
    marginBottom: 28,
  },

  patientTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginTop: 12,
  },

  patientSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 6,
  },

  patientInfoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },

  patientRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  patientValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 14,
    flex: 1,
  },

  patientDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 18,
  },

  closePatientButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  closePatientButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },

  emptyPatientState: {
    alignItems: "center",
    paddingVertical: 20,
  },

  emptyPatientText: {
    marginTop: 14,
    fontSize: 16,
    color: "#6b7280",
  },
  avatarContainer: {
    marginRight: 12,
  },

  profileInfo: {
    flex: 1,
  },

  welcomeText: {
    fontSize: 12,
    color: "#6b7280",
  },



  profileSubText: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 2,
  },

  profileCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 18,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  topActions: {
    flexDirection: "row",
    gap: 10,
  },

  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconBtn: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  infoModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 380,
    alignSelf: "center",
  },

  infoTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111",
  },

  infoText: {
    fontSize: 17,
    color: "#374151",
    marginBottom: 12,
  },
  logoutFab: {
    position: "absolute",
    bottom: 20,
    left: 20,   // 👈 opposite side of your green FAB
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  logoutText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  modalButtonContainer: {
    marginTop: 10,
    gap: 12,   // 👈 THIS creates spacing between buttons
    alignItems: "center",
  },
  categoryBlock: {
    marginTop: 18,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  taskList: {
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
  },

  countBadge: {
    backgroundColor: "#111",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  closeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 10,
  },
  refreshBtn: {
    backgroundColor: "#111",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  closeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  retryBtn: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 8,
  },

  imageBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,

    alignSelf: "center",   // 👈 prevents full stretch
    minWidth: 140,         // 👈 consistent button size
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  //  COMPLETE FAB
  completeFabContainer: {
    position: "absolute",
    bottom: 90,
    right: 20,
  },

  completeFab: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  fabIcon: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#fff",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "bold",
  },

  //  ADD FAB
  addFab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  addIcon: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },

  //  MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#22c55e",
    padding: 14,
    zIndex: 999,
    alignItems: "center",
  },

  bannerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,

    width: "100%",
    maxWidth: 420,
    alignSelf: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  cancelBtn: {
    padding: 10,
  },

  addBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,

    alignSelf: "center",   // 👈 stops stretch
    minWidth: 120,         // 👈 consistent button size
    alignItems: "center",  // 👈 centers text
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,

    alignSelf: "center",
    minWidth: 160,

    alignItems: "center",
    justifyContent: "center",

    flexDirection: "row",
  },

  buttonSuccess: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,

    alignSelf: "center",
    minWidth: 160,

    alignItems: "center",
    justifyContent: "center",

    flexDirection: "row",
  },
});