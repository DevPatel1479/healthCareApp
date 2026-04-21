import { useEffect, useRef, useState } from "react";
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

const API_URL = "https://f2b1-103-250-137-91.ngrok-free.app/api/caregiver/4/tasks";
const UPDATE_API = "https://f2b1-103-250-137-91.ngrok-free.app/api/tasks/update-status";


type TaskAssignment = {
  assignment_id: number;
  status: "completed" | "pending" | "skipped" | "refused";
  time_done: string | null;
  flag_level: "green" | "yellow" | "red";
  observation: string | null;
  selected?: boolean;
  task: {
    task_id: number;
    description: string;
    task_category: string;
    scheduled_time: string | null;
    clinical_notes: string | null;
  };
};

type GroupedTasks = Record<string, TaskAssignment[]>;

export default function CaregiverDashboard() {
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
  // const [image, setImage] = useState(null);

  const fabScale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const caregiverId = 4; // 🔥 replace with logged-in user later

    const socket = connectSocket(caregiverId);

    // 🔥 LISTEN FOR TASK UPDATE
    socket.on("task_updated", (updatedTask) => {
      console.log("📡 Task updated via socket:", updatedTask);

      setTasks((prev) =>
        prev.map((t) =>
          t.assignment_id === updatedTask.assignment_id
            ? { ...t, ...updatedTask }
            : t
        )
      );
    });
    const CAREGIVER_ID = 4;
    // 🔥 LISTEN FOR NEW TASK ASSIGNMENT
    socket.on("task_assigned", (newTask) => {
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
      if (newTask.caregiver_id !== CAREGIVER_ID) return;

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

        return updated.sort(
          (a, b) =>
            new Date(b.time_done || 0).getTime() -
            new Date(a.time_done || 0).getTime()
        );
      });
    });
    return () => {
      socket.off("task_updated");
      socket.off("task_assigned");
      disconnectSocket(); // cleanup
    };
  }, []);




  // ---------------- FETCH TASKS ----------------
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL);
      const json = await res.json();

      if (!json.success) throw new Error(json.message || "Failed to load");

      setTasks(json.data);
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
  const grouped: GroupedTasks = tasks.reduce((acc, item) => {
    const cat = item.task.task_category;

    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);

    return acc;
  }, {} as GroupedTasks);

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

      // 🔥 CALL BACKEND
      const res = await fetch(UPDATE_API, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignment_id: selectedTask.assignment_id,
          caregiver_id: 4,
          status: "completed",
          observation: note || null,
          photo_evidence: image || null,
        }),
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      const updatedTask = json.data;

      // 🔥 OPTIMISTIC UI UPDATE (instant)
      setTasks((prev) =>
        prev.map((t) =>
          t.assignment_id === updatedTask.assignment_id
            ? { ...t, ...updatedTask }
            : t
        )
      );

      // 🔥 RESET UI
      setModalVisible(false);
      setNote("");
      setImage(null);
      setSelectedTask(null);

    } catch (err: any) {
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
          <TouchableOpacity onPress={fetchTasks} style={styles.refreshBtn}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Refresh Tasks
            </Text>
          </TouchableOpacity>
          <StatsHeader
            completed={tasks.filter((t) => t.status === "completed").length}
            total={tasks.length}
          />

          {/* GROUPED TASKS */}
          {Object.keys(grouped).map((category) => (
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
                  <TaskCard
                    key={task.assignment_id}
                    task={{
                      id: task.assignment_id,
                      title: task.task.description,
                      completed: task.status === "completed",
                      selected: task.selected,
                      time: task.task.scheduled_time,
                    }}
                    onToggle={() => handleToggle(task)}
                  />
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

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

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