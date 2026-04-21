import { useEffect, useState } from "react";
import {
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
} from "react-native";

import StatsHeader from "@/components/dashboard/StatsHeader";
import TaskCard from "@/components/dashboard/TaskCard";

const API_URL = "http://192.168.244.206:3000/api/caregiver/4/tasks";

type TaskAssignment = {
    assignment_id: number;
    status: "completed" | "pending" | "skipped" | "refused";
    task: {
        task_id: number;
        description: string;
        task_category: string;
        scheduled_time: string | null;
    };
};

type GroupedTasks = Record<string, TaskAssignment[]>;

export default function PatientDashboard() {
    const { width, height } = useWindowDimensions();

    const [tasks, setTasks] = useState<TaskAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // CREATE TASK MODAL
    const [modalVisible, setModalVisible] = useState(false);
    const [taskInput, setTaskInput] = useState("");

    // ---------------- FETCH TASKS ----------------
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(API_URL);
            const json = await res.json();

            if (!json.success) throw new Error(json.message);

            // ✅ ONLY COMPLETED TASKS
            const completedOnly = json.data.filter(
                (t: TaskAssignment) => t.status === "completed"
            );

            setTasks(completedOnly);
        } catch (err: any) {
            setError(err.message || "Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // ---------------- GROUP ----------------
    const grouped: GroupedTasks = tasks.reduce((acc, item) => {
        const cat = item.task.task_category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as GroupedTasks);

    // ---------------- CREATE TASK ----------------
    const handleCreateTask = async () => {
        if (!taskInput.trim()) return;

        try {
            console.log("Creating task:", taskInput);

            // 🔴 call your backend here
            // await fetch(...)

            setModalVisible(false);
            setTaskInput("");
        } catch (err) {
            console.log(err);
        }
    };

    // ---------------- SOS ----------------
    const handleSOS = () => {
        console.log("🚨 SOS TRIGGERED");
        // 🔴 integrate API / call / SMS here
    };

    const formatCategory = (cat: string) =>
        cat
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());

    // ---------------- LOADING ----------------
    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    // ---------------- ERROR ----------------
    if (error) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={{ color: "red" }}>{error}</Text>
                <TouchableOpacity onPress={fetchTasks} style={styles.retryBtn}>
                    <Text style={{ color: "#fff" }}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

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
                        completed={tasks.length}
                        total={tasks.length}
                    />

                    {/* GROUPED TASKS */}
                    {Object.keys(grouped).map((category) => (
                        <View key={category} style={styles.categoryBlock}>

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

                            <View style={styles.taskList}>
                                {grouped[category].map((task) => (
                                    <TaskCard
                                        key={task.assignment_id}
                                        task={{
                                            id: task.assignment_id,
                                            title: task.task.description,
                                            completed: true, // always completed
                                            time: task.task.scheduled_time,
                                        }}
                                        onToggle={() => { }} // ❌ disabled
                                    />
                                ))}
                            </View>

                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* ➕ CREATE TASK FAB */}
            <TouchableOpacity
                style={styles.addFab}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.addIcon}>＋</Text>
            </TouchableOpacity>

            {/* 🚨 SOS BUTTON */}
            <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
                <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>

            {/* CREATE TASK MODAL */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>

                        <Text style={styles.modalTitle}>Create Task</Text>

                        <TextInput
                            placeholder="Enter task..."
                            value={taskInput}
                            onChangeText={setTaskInput}
                            style={styles.input}
                        />

                        <TouchableOpacity
                            onPress={handleCreateTask}
                            style={styles.buttonSuccess}
                        >
                            <Text style={{ color: "#fff" }}>Create</Text>
                        </TouchableOpacity>

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
    sosBtn: {
        position: "absolute",
        bottom: 20,
        left: 20,
        height: 70,
        width: 70,
        borderRadius: 35,
        backgroundColor: "#dc2626",
        justifyContent: "center",
        alignItems: "center",
        elevation: 10,
    },

    sosText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },



});