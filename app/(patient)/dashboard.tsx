import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
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
    Linking,
    FlatList
} from "react-native";

import StatsHeader from "@/components/dashboard/StatsHeader";
import TaskCard from "@/components/dashboard/TaskCard";
import { ENDPOINTS } from "@/api/endpoints";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { connectPatientSocket } from "@/services/socket";



type TaskAssignment = {
    assignment_id: number;
    task_id: number;

    status:
    | "completed"
    | "pending"
    | "skipped"
    | "refused";

    time_done?: string | null;

    flag_level?: "green" | "yellow" | "red";

    observation?: string | null;

    photo_evidence?: string | null;

    task: {
        task_id: number;
        description: string;
        task_category: string;
        scheduled_time: string | null;
    };

    patient?: {
        name: string;
    } | null;

    caregiver?: {
        name: string;
        phone: string;
    } | null;
};


type GroupedTasks = Record<string, TaskAssignment[]>;

export default function PatientDashboard() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const [refreshing, setRefreshing] = useState(false);

    const [creating, setCreating] = useState(false);
    const [tasks, setTasks] = useState<TaskAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [observationModal, setObservationModal] = useState(false);
    const [selectedObservation, setSelectedObservation] = useState<string | null>(null);
    // CREATE TASK MODAL
    const [modalVisible, setModalVisible] = useState(false);
    const [taskInput, setTaskInput] = useState("");

    const [caregiverModal, setCaregiverModal] = useState(false);
    const [patientName, setPatientName] = useState("Client");
    const [selectedCategory, setSelectedCategory] = useState(
        "Daily_Routine"
    );
    const [caregiver, setCaregiver] = useState<{
        name: string;
        phone: string;
        shift?: string;
    } | null>(null);
    const categoryOptions = [
        {
            label: "Daily / Routine Task",
            value: "Daily_Routine",
        },
        {
            label: "Unplanned / As and When Required",
            value: "Unplanned_As_Required",
        },
        {
            label: "Periodic",
            value: "Periodic",
        },
    ];
    const [imageModal, setImageModal] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [loadingQr, setLoadingQr] = useState(false);
    const [contactsVisible, setContactsVisible] = useState(false);
    const [contactsLoading, setContactsLoading] = useState(false);
    const [contactsError, setContactsError] = useState("");
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedImageUrl, setSelectedImageUrl] =
        useState<string | null>(null);

    const [imageModalLoading, setImageModalLoading] = useState(false);
    const [imageModalError, setImageModalError] = useState("");

    useEffect(() => {
        const loadPatientName = async () => {
            try {
                const fullName = await AsyncStorage.getItem("full_name");

                if (fullName) {
                    setPatientName(fullName);
                }
            } catch (err) {
                console.log("Failed to load patient name", err);
            }
        };

        loadPatientName();
    }, []);

    useEffect(() => {
        let socket: any;
        const initializeSocket = async () => {
            const referenceId = await AsyncStorage.getItem("reference_id");
            if (!referenceId) {
                console.log("Patient reference_id not found");
                return;
            }



            socket = connectPatientSocket(Number(referenceId)); // 🔥 patient id

            socket.on("task_updated", (updatedTask: any) => {

                console.log("🔥 Patient received update:", updatedTask);

                setTasks((prev) => {

                    const updated = prev.map((task) =>
                        task.assignment_id === updatedTask.assignment_id
                            ? {
                                ...task,
                                status: updatedTask.status,
                                observation: updatedTask.observation,
                                time_done: updatedTask.time_done,
                                flag_level: updatedTask.flag_level,
                                photo_evidence: updatedTask.photo_evidence,
                                task: {
                                    ...task.task,
                                    ...updatedTask.task,
                                },
                            }
                            : task
                    );

                    // ✅ Re-sort after realtime update
                    return [...updated].sort((a, b) => {

                        // CATEGORY ORDER
                        const categoryPriority: Record<string, number> = {
                            Daily_Routine: 0,
                            Unplanned_As_Required: 1,
                            Periodic: 2,
                        };

                        const categoryCompare =
                            categoryPriority[a.task.task_category] -
                            categoryPriority[b.task.task_category];

                        if (categoryCompare !== 0) {
                            return categoryCompare;
                        }

                        // PENDING FIRST
                        const statusPriority: Record<string, number> = {
                            pending: 0,
                            completed: 1,
                            skipped: 1,
                            refused: 1,
                        };

                        const statusCompare =
                            statusPriority[a.status] -
                            statusPriority[b.status];

                        if (statusCompare !== 0) {
                            return statusCompare;
                        }

                        // OPTIONAL TIME SORT
                        const timeA = a.task.scheduled_time
                            ? new Date(a.task.scheduled_time).getTime()
                            : 0;

                        const timeB = b.task.scheduled_time
                            ? new Date(b.task.scheduled_time).getTime()
                            : 0;

                        return timeA - timeB;
                    });
                });
            });
            socket.on("daily_tasks_regenerated", async (data: any) => {

                console.log(
                    "🔄 Patient daily tasks regenerated:",
                    data
                );

                // fetch latest regenerated tasks
                await fetchTasks(false);

                Alert.alert(
                    "Tasks Updated",
                    "New daily tasks are available."
                );
            });
        };
        initializeSocket();

        return () => {
            if (socket) {
                socket.off("task_updated");
                socket.off("daily_tasks_regenerated");
            }
        };
    }, []);

    const handleShowQr = async () => {
        try {
            setLoadingQr(true);

            const patientId =
                await AsyncStorage.getItem("reference_id");

            const res = await fetch(
                ENDPOINTS.getPatientQrCode(
                    String(patientId)
                )
            );

            const json = await res.json();

            if (!json.success) {
                throw new Error(
                    json.message || "Failed to load QR"
                );
            }

            setQrCodeUrl(json.qr_code_url);
            setQrModalVisible(true);

        } catch (err: any) {

            Alert.alert(
                "Error",
                err.message || "Failed to fetch QR code"
            );

        } finally {

            setLoadingQr(false);

        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.clear();

                        router.replace("/(auth)/login");
                    },
                },
            ]
        );
    };
    // ---------------- FETCH TASKS ----------------
    const fetchTasks = async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");
            const referenceId = await AsyncStorage.getItem("reference_id");

            const res = await fetch(ENDPOINTS.getPatientTasks(String(referenceId)));
            const json = await res.json();

            if (!json.success) {
                throw new Error(json.message || "Failed to fetch tasks");
            }
            console.log(json);
            setTasks(json.data || []);
            setCaregiver(json.caregiver || null);
        } catch (err: any) {
            const message = err.message || "Something went wrong";

            if (showLoader) {
                setError(message);
            } else {
                Alert.alert("Refresh Failed", message);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTasks(true);
    }, []);

    // ---------------- GROUP ----------------

    const categoryOrder = [
        "Daily_Routine",
        "Unplanned_As_Required",
        "Periodic",
    ];

    // ---------------- TASK STATUS SORT ----------------
    // Pending first, completed/skipped/refused last
    const statusPriority: Record<string, number> = {
        pending: 0,
        completed: 1,
        skipped: 1,
        refused: 1,
    };

    // ---------------- GROUP + SORT ----------------
    const grouped: GroupedTasks = {};

    // create empty categories in correct order
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

    // sort tasks inside every category
    Object.keys(grouped).forEach((category) => {
        grouped[category].sort((a, b) => {

            // ✅ pending tasks first
            const statusCompare =
                statusPriority[a.status] - statusPriority[b.status];

            if (statusCompare !== 0) {
                return statusCompare;
            }

            // ✅ optional secondary sorting by scheduled time
            const timeA = a.task.scheduled_time
                ? new Date(a.task.scheduled_time).getTime()
                : 0;

            const timeB = b.task.scheduled_time
                ? new Date(b.task.scheduled_time).getTime()
                : 0;

            return timeA - timeB;
        });
    });

    // ---------------- CREATE TASK ----------------
    const handleCreateTask = async () => {

        if (!taskInput.trim()) {

            Alert.alert(
                "Validation",
                "Please enter task description"
            );

            return;
        }

        try {

            setCreating(true);
            const referenceId = await AsyncStorage.getItem("reference_id");
            const res = await fetch(
                ENDPOINTS.createPatientTask(),
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        patient_id: Number(referenceId),
                        description: taskInput,

                        scheduled_time: null,

                        // ✅ send enum exactly as backend expects
                        task_category: selectedCategory,
                    }),
                }
            );

            const json = await res.json();

            if (!json.success) {

                throw new Error(
                    json.message || "Failed to create task"
                );
            }

            // refresh
            await fetchTasks(false);

            // reset
            setModalVisible(false);

            setTaskInput("");

            setSelectedCategory("Daily_Routine");

            Alert.alert(
                "Success",
                "Task created successfully"
            );

        } catch (err: any) {

            Alert.alert(
                "Error",
                err.message || "Something went wrong"
            );

        } finally {

            setCreating(false);
        }
    };
    // ---------------- SOS ----------------
    const handleSOS = async () => {
        try {
            setContactsLoading(true);
            setContactsError("");
            const referenceId = await AsyncStorage.getItem("reference_id");
            const patientId = referenceId!;

            const response = await fetch(
                ENDPOINTS.getFamilyLeadContacts(patientId)
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to fetch emergency contacts"
                );
            }

            setContacts(data.data || []);
            setContactsVisible(true);

        } catch (error: any) {
            console.log("SOS contacts error:", error);

            setContacts([]);
            setContactsError(
                error?.message ||
                "Failed to load emergency contacts"
            );

            setContactsVisible(true);
        } finally {
            setContactsLoading(false);
        }
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
                <TouchableOpacity onPress={() => fetchTasks(true)} style={styles.retryBtn}>
                    <Text style={{ color: "#fff" }}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
    const completedCount = tasks.filter(t => t.status === "completed").length;
    const pendingCount = tasks.filter(t => t.status === "pending").length;
    const totalCount = tasks.length;
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: height * 0.08,
                    paddingBottom: height * 0.14,
                }}
            >
                <View style={styles.topHeader}>
                    <View style={styles.profileCard}>
                        <TouchableOpacity
                            style={styles.profileContent}
                            onPress={() => setCaregiverModal(true)}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="person-circle"
                                size={54}
                                color="#2563eb"
                            />

                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.welcomeText}>
                                    Welcome Back
                                </Text>

                                <Text style={styles.profileName}>
                                    {patientName}
                                </Text>

                                <Text style={styles.viewCaregiverText}>
                                    View Caregiver Details
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.circleBtn}
                            onPress={handleShowQr}
                        >
                            {loadingQr ? (
                                <ActivityIndicator size="small" />
                            ) : (
                                <Ionicons
                                    name="qr-code-outline"
                                    size={22}
                                    color="#111827"
                                />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.circleBtn}
                            onPress={() => fetchTasks(false)}
                            disabled={refreshing}
                        >
                            {refreshing ? (
                                <ActivityIndicator size="small" color="#111827" />
                            ) : (
                                <Ionicons
                                    name="refresh-outline"
                                    size={22}
                                    color="#111827"
                                />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.circleBtn}
                            onPress={handleLogout}
                        >
                            <Ionicons
                                name="log-out-outline"
                                size={22}
                                color="#dc2626"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ paddingHorizontal: width * 0.05 }}>

                    <StatsHeader
                        completed={completedCount}
                        pending={pendingCount}   // 👈 add this
                        total={totalCount}
                        title="Client Dashboard"

                    />
                    <TouchableOpacity
                        style={styles.reportCard}
                        activeOpacity={0.9}
                        onPress={() =>
                            router.push({
                                pathname: "/(patient)/report",
                                params: {
                                    patientName: patientName,
                                },
                            })
                        }

                    >
                        <View style={styles.reportIconContainer}>
                            <Ionicons
                                name="document-text"
                                size={30}
                                color="#2563eb"
                            />
                        </View>

                        <Text style={styles.reportTitle}>
                            View Daily Reports
                        </Text>

                        <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#2563eb"
                        />
                    </TouchableOpacity>
                    {/* GROUPED TASKS */}
                    {categoryOrder
                        .filter((category) => grouped[category]?.length > 0)
                        .map((category) => (
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
                                        <View key={task.assignment_id} style={styles.taskWrapper}>

                                            <TaskCard
                                                task={{
                                                    id: task.assignment_id,
                                                    title: task.task.description,
                                                    completed: task.status === "completed",
                                                    time: task.task.scheduled_time,
                                                }}
                                                onToggle={() => {
                                                    if (task.status !== "completed") return;
                                                }}
                                            />

                                            {/* ✅ OBSERVATION SECTION */}
                                            {task.observation && (
                                                <View style={styles.observationContainer}>

                                                    <View style={styles.observationHeader}>
                                                        <Ionicons name="document-text-outline" size={16} color="#0369a1" />
                                                        <Text style={styles.observationLabel}>Caregiver Note</Text>
                                                    </View>

                                                    <TouchableOpacity
                                                        style={styles.observationBtn}
                                                        onPress={() => {
                                                            setSelectedObservation(task.observation ?? null);
                                                            setObservationModal(true);
                                                        }}
                                                    >
                                                        <Ionicons name="eye-outline" size={16} color="#fff" />
                                                        <Text style={styles.observationText}>
                                                            View Observation
                                                        </Text>
                                                    </TouchableOpacity>
                                                    {task.photo_evidence && (
                                                        <TouchableOpacity
                                                            style={[
                                                                styles.observationBtn,
                                                                { marginTop: 8 }
                                                            ]}
                                                            onPress={() => {
                                                                const url = task.photo_evidence ?? null;
                                                                setSelectedImageUrl(url);
                                                                setImageModalError("");
                                                                setImageModalLoading(!!url);
                                                                setImageModal(true);
                                                            }}
                                                        >
                                                            <Ionicons
                                                                name="image-outline"
                                                                size={16}
                                                                color="#fff"
                                                            />

                                                            <Text style={styles.observationText}>
                                                                View Image
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}

                                                </View>
                                            )}
                                        </View>

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
            <TouchableOpacity
                style={styles.sosBtn}
                onPress={handleSOS}
                disabled={contactsLoading}
            >
                {contactsLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.sosText}>SOS</Text>
                )}
            </TouchableOpacity>

            {/* CREATE TASK MODAL */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
            >

                <View style={styles.modalOverlay}>

                    <View style={styles.createTaskModalBox}>

                        {/* HEADER */}
                        <View style={styles.createTaskHeader}>

                            <Text style={styles.createTaskTitle}>
                                Create New Task
                            </Text>

                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color="#111827"
                                />
                            </TouchableOpacity>

                        </View>

                        {/* TASK INPUT */}
                        <Text style={styles.inputLabel}>
                            Task Description
                        </Text>

                        <TextInput
                            placeholder="Enter task description..."
                            value={taskInput}
                            onChangeText={setTaskInput}
                            returnKeyType="done"
                            multiline
                            onBlur={() => {
                                // treat as "done editing"
                            }}
                            style={styles.createTaskInput}
                            placeholderTextColor="#9ca3af"
                        />

                        {/* CATEGORY */}
                        <Text style={styles.inputLabel}>
                            Task Category
                        </Text>

                        <View style={styles.categoryContainer}>

                            {categoryOptions.map((item) => {

                                const selected =
                                    selectedCategory === item.value;

                                return (

                                    <TouchableOpacity
                                        key={item.value}
                                        activeOpacity={0.85}
                                        style={[
                                            styles.categoryOption,
                                            selected &&
                                            styles.categoryOptionActive
                                        ]}
                                        onPress={() =>
                                            setSelectedCategory(item.value)
                                        }
                                    >

                                        <View
                                            style={[
                                                styles.radioOuter,
                                                selected &&
                                                styles.radioOuterActive
                                            ]}
                                        >
                                            {selected && (
                                                <View
                                                    style={styles.radioInner}
                                                />
                                            )}
                                        </View>

                                        <Text
                                            style={[
                                                styles.categoryOptionText,
                                                selected &&
                                                styles.categoryOptionTextActive
                                            ]}
                                        >
                                            {item.label}
                                        </Text>

                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* CREATE BUTTON */}
                        <TouchableOpacity
                            onPress={handleCreateTask}
                            style={styles.createTaskBtn}
                            disabled={creating}
                            activeOpacity={0.85}
                        >

                            {creating ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons
                                        name="add-circle-outline"
                                        size={20}
                                        color="#fff"
                                    />

                                    <Text style={styles.createTaskBtnText}>
                                        Create Task
                                    </Text>
                                </>
                            )}

                        </TouchableOpacity>

                    </View>

                </View>
            </Modal>
            <Modal visible={caregiverModal} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setCaregiverModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.caregiverModalCard}
                        onPress={() => { }}
                    >
                        <View style={styles.caregiverHeader}>
                            <Ionicons
                                name="medical"
                                size={28}
                                color="#2563eb"
                            />

                            <Text style={styles.caregiverTitle}>
                                Caregiver Details
                            </Text>

                            <TouchableOpacity
                                onPress={() => setCaregiverModal(false)}
                                style={styles.caregiverCloseBtn}
                            >
                                <Ionicons
                                    name="close"
                                    size={22}
                                    color="#6b7280"
                                />
                            </TouchableOpacity>
                        </View>

                        {caregiver ? (
                            <>
                                <View style={styles.caregiverAvatar}>
                                    <Ionicons
                                        name="person"
                                        size={42}
                                        color="#2563eb"
                                    />
                                </View>

                                <View style={styles.infoCard}>
                                    <View style={styles.infoRow}>
                                        <Ionicons
                                            name="person-outline"
                                            size={20}
                                            color="#2563eb"
                                        />
                                        <View style={styles.infoContent}>
                                            <Text style={styles.infoLabel}>Full Name</Text>
                                            <Text style={styles.infoValue}>
                                                {caregiver.name}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoDivider} />

                                    <View style={styles.infoRow}>
                                        <Ionicons
                                            name="call-outline"
                                            size={20}
                                            color="#16a34a"
                                        />
                                        <View style={styles.infoContent}>
                                            <Text style={styles.infoLabel}>Phone Number</Text>
                                            <Text style={styles.infoValue}>
                                                {caregiver.phone}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons
                                    name="person-remove-outline"
                                    size={52}
                                    color="#9ca3af"
                                />
                                <Text style={styles.emptyTitle}>
                                    No Caregiver Assigned
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    A caregiver will appear here once assigned.
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
            <Modal visible={observationModal} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setObservationModal(false)}
                    activeOpacity={1}
                >
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Observation</Text>

                        <Text style={styles.detailText}>
                            {selectedObservation}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal visible={imageModal} transparent animationType="fade" onRequestClose={() => {
                setImageModal(false);
                setImageModalLoading(false);
                setImageModalError("");
            }}>
                <View style={styles.imageModalBackdrop}>
                    <TouchableOpacity
                        style={styles.imageCloseBtn}
                        onPress={() => {
                            setImageModal(false);
                            setImageModalLoading(false);
                            setImageModalError("");
                        }}
                    >
                        <Ionicons name="close" size={32} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.imageModalContent}>
                        {imageModalLoading && (
                            <View style={styles.imageLoaderOverlay}>
                                <ActivityIndicator size="large" color="#fff" />
                                <Text style={styles.imageLoaderText}>Loading image...</Text>
                            </View>
                        )}

                        {imageModalError ? (
                            <Text style={styles.imageErrorText}>{imageModalError}</Text>
                        ) : selectedImageUrl ? (
                            <Image
                                source={{ uri: selectedImageUrl }}
                                style={styles.patientImage}
                                resizeMode="contain"
                                onLoadStart={() => setImageModalLoading(true)}
                                onLoadEnd={() => setImageModalLoading(false)}
                                onError={() => {
                                    setImageModalLoading(false);
                                    setImageModalError("Unable to load image.");
                                }}
                            />
                        ) : null}
                    </View>
                </View>
            </Modal>
            <Modal
                visible={qrModalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.qrOverlay}>

                    <View style={styles.qrModalCard}>

                        <TouchableOpacity
                            style={styles.qrClose}
                            onPress={() => setQrModalVisible(false)}
                        >
                            <Ionicons
                                name="close"
                                size={24}
                                color="#6b7280"
                            />
                        </TouchableOpacity>

                        <Ionicons
                            name="qr-code"
                            size={40}
                            color="#2563eb"
                        />

                        <Text style={styles.qrTitle}>
                            Patient QR Code
                        </Text>

                        <Text style={styles.qrSubtitle}>
                            Show this QR to the caregiver
                        </Text>

                        {qrCodeUrl ? (
                            <Image
                                source={{ uri: qrCodeUrl }}
                                style={styles.qrImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={styles.emptyQrContainer}>
                                <Ionicons
                                    name="alert-circle-outline"
                                    size={40}
                                    color="#ef4444"
                                />

                                <Text style={styles.emptyQrText}>
                                    QR Code Not Available
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.qrButton}
                            onPress={() => setQrModalVisible(false)}
                        >
                            <Text style={styles.qrButtonText}>
                                Close
                            </Text>
                        </TouchableOpacity>

                    </View>

                </View>
            </Modal>
            <Modal
                visible={contactsVisible}
                transparent
                animationType="slide"
                onRequestClose={() =>
                    setContactsVisible(false)
                }
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.bottomSheet}>

                        <View style={styles.sheetHandle} />

                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>
                                Emergency Contacts
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    setContactsVisible(false)
                                }
                            >
                                <Text style={styles.closeText}>
                                    Close
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {contactsError ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorTitle}>
                                    Unable to load contacts
                                </Text>

                                <Text style={styles.errorMessage}>
                                    {contactsError}
                                </Text>
                            </View>
                        ) : contacts.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    No emergency contacts found.
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={contacts}
                                keyExtractor={(_, index) =>
                                    index.toString()
                                }
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <View
                                        style={
                                            styles.contactCard
                                        }
                                    >
                                        <View>
                                            <Text
                                                style={
                                                    styles.contactName
                                                }
                                            >
                                                {item.contact_name ||
                                                    "Family Contact"}
                                            </Text>

                                            <Text
                                                style={
                                                    styles.contactPhone
                                                }
                                            >
                                                {
                                                    item.phone_number
                                                }
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() =>
                                                Linking.openURL(
                                                    `tel:${item.phone_number}`
                                                )
                                            }
                                            style={
                                                styles.callButton
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.callButtonText
                                                }
                                            >
                                                Call
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    imageModalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.95)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    imageCloseBtn: {
        position: "absolute",
        top: 50,
        right: 16,
        zIndex: 10,
    },
    imageModalContent: {
        width: "100%",
        height: "80%",
        justifyContent: "center",
        alignItems: "center",
    },
    patientImage: {
        width: "100%",
        height: "100%",
        maxWidth: 900,
        maxHeight: 700,
    },
    imageLoaderOverlay: {
        position: "absolute",
        zIndex: 2,
        alignItems: "center",
    },
    imageLoaderText: {
        color: "#fff",
        marginTop: 12,
        fontSize: 14,
    },
    imageErrorText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },

    bottomSheet: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 30,
        maxHeight: "70%",
    },

    sheetHandle: {
        alignSelf: "center",
        width: 50,
        height: 5,
        borderRadius: 3,
        backgroundColor: "#D1D5DB",
        marginBottom: 16,
    },

    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    sheetTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },

    closeText: {
        color: "#2563EB",
        fontWeight: "600",
        fontSize: 15,
    },

    contactCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: "#F9FAFB",
        marginBottom: 12,
    },

    contactName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },

    contactPhone: {
        marginTop: 4,
        color: "#6B7280",
        fontSize: 14,
    },

    callButton: {
        backgroundColor: "#10B981",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
    },

    callButtonText: {
        color: "#FFF",
        fontWeight: "700",
    },

    errorContainer: {
        alignItems: "center",
        paddingVertical: 30,
    },

    errorTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
        color: "#DC2626",
    },

    errorMessage: {
        textAlign: "center",
        color: "#6B7280",
    },

    emptyContainer: {
        alignItems: "center",
        paddingVertical: 30,
    },

    emptyText: {
        color: "#6B7280",
        fontSize: 15,
    },
    qrOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.55)",
    },

    qrModalCard: {
        width: "85%",
        maxWidth: 360,

        backgroundColor: "#fff",

        borderRadius: 24,

        padding: 24,

        alignItems: "center",

        elevation: 8,
    },

    qrClose: {
        position: "absolute",
        right: 15,
        top: 15,
    },

    qrTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginTop: 10,
    },

    qrSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 4,
        marginBottom: 18,
    },

    qrImage: {
        width: 240,
        height: 240,
    },

    emptyQrContainer: {
        alignItems: "center",
        paddingVertical: 30,
    },

    emptyQrText: {
        marginTop: 10,
        color: "#ef4444",
        fontWeight: "600",
    },

    qrButton: {
        marginTop: 20,
        backgroundColor: "#2563eb",
        width: "100%",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },

    qrButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },

    topHeader: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },

    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,

        elevation: 4,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,

        marginBottom: 12,
    },

    profileContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    circleBtn: {
        flex: 1,

        backgroundColor: "#fff",

        marginHorizontal: 4,

        height: 52,

        borderRadius: 14,

        justifyContent: "center",
        alignItems: "center",

        elevation: 3,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    createTaskModalBox: {
        width: "100%",
        backgroundColor: "#fff",

        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,

        padding: 22,

        maxHeight: "85%",
    },
    createTaskHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    createTaskTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
    },

    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 10,
        marginTop: 8,
    },

    createTaskInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 16,
        padding: 16,
        minHeight: 110,
        fontSize: 15,
        color: "#111827",
        textAlignVertical: "top",
        backgroundColor: "#f9fafb",
    },

    categoryContainer: {
        marginTop: 6,
        gap: 12,
    },

    categoryOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        backgroundColor: "#fff",
    },

    categoryOptionActive: {
        borderColor: "#2563eb",
        backgroundColor: "#eff6ff",
    },

    categoryOptionText: {
        marginLeft: 12,
        fontSize: 15,
        color: "#374151",
        fontWeight: "500",
        flex: 1,
    },

    categoryOptionTextActive: {
        color: "#2563eb",
        fontWeight: "700",
    },

    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: "#9ca3af",
        alignItems: "center",
        justifyContent: "center",
    },

    radioOuterActive: {
        borderColor: "#2563eb",
    },

    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#2563eb",
    },

    createTaskBtn: {

        marginTop: 24,
        backgroundColor: "#2563eb",
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
    },

    createTaskBtnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    reportCard: {
        backgroundColor: "#ffffff",
        marginTop: 18,
        marginBottom: 6,
        borderRadius: 22,
        paddingVertical: 16,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#e0f2fe",
    },

    reportIconContainer: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },

    reportContent: {
        flex: 1,
    },

    reportTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 4,
    },

    reportSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        lineHeight: 20,
    },

    reportArrow: {
        marginLeft: 12,
    },
    caregiverModalCard: {
        backgroundColor: "#fff",
        borderRadius: 28,
        padding: 24,
        width: "100%",
        maxWidth: 420,
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 12,
    },

    caregiverHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },

    caregiverTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        marginLeft: 12,
    },

    caregiverCloseBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
    },

    caregiverAvatar: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 24,
    },

    infoCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 20,
        padding: 18,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    infoContent: {
        flex: 1,
        marginLeft: 14,
    },

    infoLabel: {
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 4,
    },

    infoValue: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
    },

    infoDivider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 18,
    },

    emptyState: {
        alignItems: "center",
        paddingVertical: 24,
    },

    emptyTitle: {
        marginTop: 16,
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },

    emptySubtitle: {
        marginTop: 8,
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22,
    },
    // profileCard: {
    //     flex: 1,
    //     backgroundColor: "#ffffff",
    //     borderRadius: 20,
    //     marginRight: 12,
    //     shadowColor: "#000",
    //     shadowOpacity: 0.08,
    //     shadowRadius: 10,
    //     elevation: 4,
    // },

    // profileContent: {
    //     flexDirection: "row",
    //     alignItems: "center",
    //     padding: 14,
    // },

    avatarContainer: {
        marginRight: 14,
    },

    profileInfo: {
        flex: 1,
    },

    welcomeText: {
        fontSize: 13,
        color: "#6b7280",
        fontWeight: "500",
    },

    profileName: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
        marginTop: 2,
        flexShrink: 1,
    },

    viewCaregiverText: {
        fontSize: 14,
        color: "#2563eb",
        fontWeight: "600",
        marginTop: 6,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingHorizontal: 16,
    },


    profileSubText: {
        fontSize: 12,
        color: "#2563eb",
        marginTop: 2,
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
    taskWrapper: {
        marginBottom: 14,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },

    observationContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },

    observationHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
    },

    observationLabel: {
        fontSize: 12,
        color: "#0369a1",
        fontWeight: "600",
    },

    observationBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#0284c7",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignSelf: "flex-start",
    },

    observationText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },

    modalCloseBtn: {
        position: "absolute",
        right: 12,
        top: 12,
        zIndex: 10,
        backgroundColor: "#f1f5f9",
        padding: 6,
        borderRadius: 20,
    },
    avatarBtn: {
        backgroundColor: "#f1f5f9",
        padding: 6,
        borderRadius: 20,
    },
    detailText: {
        fontSize: 16,
        marginBottom: 8,
        color: "#111",
    },

    logoutIconBtn: {
        backgroundColor: "#f1f5f9",
        padding: 10,        // 🔥 bigger touch area
        borderRadius: 20,
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111",
    },

    logoutBtn: {
        backgroundColor: "#111",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
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

    // closeText: {
    //     fontSize: 20,
    //     fontWeight: "bold",
    //     color: "#000",
    // },
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
        backgroundColor: "rgba(0,0,0,0.5)",

        justifyContent: "flex-end", // 👈 key fix (NOT center)
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