import { useEffect, useRef, useState } from "react";

import {
  Animated,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import StatsHeader from "@/components/dashboard/StatsHeader";
import TaskCard from "@/components/dashboard/TaskCard";

export default function CaregiverDashboard() {
  const { width, height } = useWindowDimensions();

  const [tasks, setTasks] = useState([
    { id: 1, title: "Give morning medication", completed: false, selected: false },
    { id: 2, title: "Check blood pressure", completed: false, selected: false },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState("");

  // 🔥 Toggle selection
  const handleToggle = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, selected: !t.selected } : t
      )
    );
  };

  // 🔥 Complete selected tasks
  const handleComplete = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.selected
          ? { ...t, completed: true, selected: false }
          : t
      )
    );
  };

  // 🔥 Add new task
  const handleAddTask = () => {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask.trim(),
      completed: false,
      selected: false,
    };

    setTasks((prev) => [task, ...prev]);
    setNewTask("");
    setModalVisible(false);
  };

  const completed = tasks.filter((t) => t.completed).length;
  const selectedCount = tasks.filter((t) => t.selected).length;

  // 🔥 FAB animation
  const fabScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedCount > 0) {
      Animated.spring(fabScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fabScale, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedCount]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: height * 0.08,
          paddingBottom: height * 0.14,
        }}
      >
        <View
          style={{
            paddingHorizontal: width * 0.05,
            maxWidth: 500,
            alignSelf: "center",
            width: "100%",
          }}
        >
          <StatsHeader completed={completed} total={tasks.length} />

          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
            />
          ))}
        </View>
      </ScrollView>

      {/* ✅ COMPLETE FAB */}
      {selectedCount > 0 && (
        <Animated.View
          style={[
            styles.completeFabContainer,
            {
              transform: [{ scale: fabScale }],
              opacity: fabScale,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.completeFab}
            onPress={handleComplete}
          >
            <Text style={styles.fabIcon}>✓</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedCount}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/*  ADD TASK FAB */}
      <TouchableOpacity
        style={styles.addFab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addIcon}>＋</Text>
      </TouchableOpacity>

      {/*  ADD TASK MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add New Task</Text>

            <TextInput
              placeholder="Enter task..."
              value={newTask}
              onChangeText={setNewTask}
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddTask}
              >
                <Text style={{ color: "#fff" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 16,
    padding: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
});