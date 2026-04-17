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

import StatsHeader from "@/components/dashboard/StatsHeader";
import TaskCard from "@/components/dashboard/TaskCard";

const API_URL = "http://10.148.248.206:3000/api/caregiver/4/tasks";


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

    setTasks((prev) =>
      prev.map((t) =>
        t.assignment_id === item.assignment_id
          ? { ...t, selected: !t.selected }
          : t
      )
    );

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
  const handleSubmit = () => {
    console.log("NOTE:", note);
    console.log("IMAGE:", image);
    console.log("TASK:", selectedTask);

    setModalVisible(false);
    setNote("");
    setImage(null);
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

              <TouchableOpacity onPress={handleSubmit} style={styles.buttonSuccess}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Save Observation
                </Text>
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