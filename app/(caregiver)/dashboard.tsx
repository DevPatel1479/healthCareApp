import { useEffect, useRef, useState } from "react";

import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import StatsHeader from "@/components/dashboard/StatsHeader";
import TaskCard from "@/components/dashboard/TaskCard";

export default function CaregiverDashboard() {
  const { width, height } = useWindowDimensions();

  const [tasks, setTasks] = useState([
    { id: 1, title: "Give morning medication", completed: true, selected: false },
    { id: 2, title: "Check blood pressure", completed: false, selected: false },
    { id: 3, title: "Prepare lunch", completed: true, selected: false },
    { id: 4, title: "Evening walk", completed: false, selected: false },
    { id: 5, title: "Give evening medicine", completed: false, selected: false },
    { id: 6, title: "Check sugar level", completed: false, selected: false },
    { id: 7, title: "Morning hygiene support", completed: true, selected: false },
    { id: 8, title: "Water reminder", completed: false, selected: false },
    { id: 9, title: "Prepare snacks", completed: true, selected: false },
    { id: 10, title: "Evening medication", completed: false, selected: false },
    { id: 11, title: "Check oxygen level", completed: false, selected: false },
    { id: 12, title: "Night routine prep", completed: false, selected: false },
  ]);

  // 🔥 Toggle selection (not completion)
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

  const completed = tasks.filter((t) => t.completed).length;
  const selectedCount = tasks.filter((t) => t.selected).length;

  // 🔥 FAB Animation
  const fabScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedCount > 0) {
      Animated.spring(fabScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
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
          paddingBottom: height * 0.12,
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
          {/* Stats */}
          <StatsHeader completed={completed} total={tasks.length} />

          {/* Task List */}
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
            />
          ))}
        </View>
      </ScrollView>

      {/* 🔥 Animated Floating Button */}
      {selectedCount > 0 && (
        <Animated.View
          style={[
            styles.fabContainer,
            {
              bottom: height * 0.04,
              right: width * 0.06,
              transform: [{ scale: fabScale }],
              opacity: fabScale,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.fab}
            onPress={handleComplete}
            activeOpacity={0.85}
          >
           <>
  <Text style={styles.fabIcon}>✓</Text>

  {/* Badge */}
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{selectedCount}</Text>
  </View>
</>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  // 🔥 FAB Container
  fabContainer: {
    position: "absolute",
  },

  // 🔥 FAB Button
  fab: {
  height: 64,
  width: 64,
  borderRadius: 32,
  backgroundColor: "#ef4444",

  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#ef4444",
  shadowOpacity: 0.4,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },

  elevation: 8,
},

fabIcon: {
  color: "#fff",
  fontSize: 26,
  fontWeight: "bold",
},

// 🔥 Badge container (separate from icon)
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

  // subtle shadow
  elevation: 3,
},

badgeText: {
  color: "#ef4444",
  fontSize: 11,
  fontWeight: "bold",
},
  fabInner: {
    alignItems: "center",
    justifyContent: "center",
  },

  

  // 🔥 Badge
  fabCount: {
    position: "absolute",
    top: 6,
    right: 8,
    backgroundColor: "#fff",
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
});