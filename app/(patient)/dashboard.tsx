import { useEffect, useState } from "react";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";



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
    FlatList,
    Platform
} from "react-native";

import StatsHeader from "@/components/dashboard/StatsHeader";
import TaskCard from "@/components/dashboard/TaskCard";
import { ENDPOINTS } from "@/api/endpoints";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { connectPatientSocket, disconnectSocket } from "@/services/socket";
import { styles } from "../../styles/patient.styles";
import { apiClient } from "@/api/apiClient";
import { tokenStorage } from "@/api/tokenStorage";



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
    const { date: routeDate } =
        useLocalSearchParams<{
            date?: string;
        }>();
    const { width, height } = useWindowDimensions();
    const [refreshing, setRefreshing] = useState(false);

    const getTodayString = () => {
        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    const formatDateForDisplay = (
        dateString: string
    ) => {
        const [year, month, day] =
            dateString.split("-").map(Number);

        const date = new Date(
            year,
            month - 1,
            day
        );

        return date.toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };


    const todayString = getTodayString();

    const selectedDate =
        typeof routeDate === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(routeDate)
            ? routeDate
            : todayString;


    const isCurrentDate =
        selectedDate === todayString;


    const isHistoricalDate =
        !isCurrentDate;


    const [datePickerVisible, setDatePickerVisible] =
        useState(false);


    const getDateObject = (
        dateString: string
    ) => {
        const [year, month, day] =
            dateString.split("-").map(Number);

        return new Date(
            year,
            month - 1,
            day
        );
    };

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

    const isSelectedDateToday = () => {
        const today = new Date();

        const todayString =
            `${today.getFullYear()}-${String(
                today.getMonth() + 1
            ).padStart(2, "0")}-${String(
                today.getDate()
            ).padStart(2, "0")}`;

        return selectedDate === todayString;
    };
    useEffect(() => {
        if (isSelectedDateToday()) {
            console.log("refreshing caregiver ... ");
            refreshCaregiver();
        }
    }, [selectedDate]);


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

        if (isHistoricalDate) {
            setModalVisible(false);
        }

    }, [isHistoricalDate]);

    useEffect(() => {
        let socket: any;
        let cancelled = false;
        const initializeSocket = async () => {


            // ----------------------------------------
            // HISTORICAL DATE
            // ----------------------------------------
            // Absolutely no socket connection.
            // ----------------------------------------
            if (!isCurrentDate) {
                console.log(
                    "Historical date selected:",
                    selectedDate,
                    "Socket disabled"
                );

                disconnectSocket();

                return;
            }

            // ----------------------------------------
            // CURRENT DATE
            // ----------------------------------------
            const referenceId = await AsyncStorage.getItem("reference_id");
            if (!referenceId || cancelled) {
                console.log("Patient reference_id not found");
                return;
            }
            console.log(
                "Current date selected:",
                selectedDate,
                "Socket enabled"
            );


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
            cancelled = true;


            if (socket) {
                socket.off("task_updated");
                socket.off("daily_tasks_regenerated");
            }
            // VERY IMPORTANT:
            // When changing:
            // today -> yesterday
            // disconnect old socket.

            disconnectSocket();
        };
    }, [
        selectedDate,
        isCurrentDate,
    ]);

    const handleShowQr = async () => {
        try {
            setLoadingQr(true);

            const patientId =
                await AsyncStorage.getItem("reference_id");

            const res = await apiClient.get(
                ENDPOINTS.getPatientQrCode(
                    String(patientId)
                )
            );

            const json = await res.data;


            if (!json.success) {
                throw new Error(
                    json.message || "Failed to load QR"
                );
            }
            console.log(`qr code url : ${json.qr_code_url}`);
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
                        disconnectSocket();


                        await tokenStorage.remove();


                        await AsyncStorage.clear();

                        router.replace("/(auth)/login");
                    },
                },
            ]
        );
    };

    const refreshCaregiver = async () => {
        try {

            const res = await apiClient.get(
                ENDPOINTS.refreshCaregiver()
            );

            const json = res.data;

            if (!json.success) {
                throw new Error(
                    json.message || "Failed to refresh caregiver"
                );
            }



            const updatedCaregiver = json.data?.caregiver;

            console.log(updatedCaregiver);

            if (updatedCaregiver) {
                setCaregiver({
                    name: updatedCaregiver.name,
                    phone: updatedCaregiver.phone_number,
                });
            } else {
                setCaregiver(null);
            }

        } catch (err: any) {
            console.log(
                "Refresh caregiver failed:",
                err?.response?.data || err.message
            );

            throw err;
        }
    };


    // ---------------- FETCH TASKS ----------------
    const fetchTasks = async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            }
            // } else {
            //     setRefreshing(true);
            // }

            setError("");
            const referenceId = await AsyncStorage.getItem("reference_id");

            const res = await apiClient.get(ENDPOINTS.getPatientTasks(String(referenceId)),
                {
                    params: {
                        date: selectedDate,
                    },
                }
            );
            const json = await res.data;

            if (!json.success) {
                throw new Error(json.message || "Failed to fetch tasks");
            }
            console.log(json);
            setTasks(json.data || []);
            // Only if your task API actually returns caregiver
            if (json.caregiver) {
                setCaregiver(json.caregiver);
            }
            // setCaregiver(json.caregiver || null);
        } catch (err: any) {
            const message = err.message || "Something went wrong";

            if (showLoader) {
                setError(message);
            } else {
                Alert.alert("Refresh Failed", message);
            }
        } finally {
            setLoading(false);
            // setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);

        try {
            if (isSelectedDateToday()) {

                // Current date:
                // refresh both tasks and current caregiver
                await Promise.all([
                    fetchTasks(false),
                    refreshCaregiver(),
                ]);
            } else {
                console.log("not calling refresh caregiver");
                // Historical date:
                // ONLY fetch historical tasks.
                // Do NOT call refreshCaregiver because it is
                // current-date based.
                await fetchTasks(false);
            }
        } catch (err: any) {
            console.log(
                "Refresh error:",
                err?.response?.data || err.message
            );

            Alert.alert(
                "Refresh Failed",
                err?.response?.data?.message ||
                err.message ||
                "Unable to refresh dashboard"
            );
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTasks(true);
    }, [selectedDate]);

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
        if (isHistoricalDate) {
            Alert.alert(
                "Historical Date",
                "Tasks cannot be created for a previous date."
            );

            return;
        }
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
            const res = await apiClient.post(
                ENDPOINTS.createPatientTask(),
                {
                    patient_id: Number(referenceId),
                    description: taskInput,

                    scheduled_time: null,

                    // ✅ send enum exactly as backend expects
                    task_category: selectedCategory,

                }
            );

            const json = await res.data;

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
            console.log("STATUS:", err?.response?.status);
            console.log("DATA:", err?.response?.data);
            console.log("MESSAGE:", err?.message);
            Alert.alert(
                "Error",
                err?.response?.data?.message || "Something went wrong"
            );

        } finally {

            setCreating(false);
        }
    };

    const handleDateChange = (
        event: DateTimePickerEvent,
        date?: Date
    ) => {
        if (Platform.OS === "android") {
            setDatePickerVisible(false);
        }

        if (
            event.type === "dismissed" ||
            !date
        ) {
            return;
        }

        const today = getDateObject(todayString);

        today.setHours(0, 0, 0, 0);

        date.setHours(0, 0, 0, 0);

        // Don't allow future dates
        if (date > today) {
            Alert.alert(
                "Invalid Date",
                "You can only select today or a previous date."
            );

            return;
        }

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        const newDate =
            `${year}-${month}-${day}`;

        setDatePickerVisible(false);

        router.replace({
            pathname:
                "/(patient)/dashboard",
            params: {
                date: newDate,
            },
        });
    };


    // ---------------- SOS ----------------
    const handleSOS = async () => {
        try {
            setContactsLoading(true);
            setContactsError("");
            const referenceId = await AsyncStorage.getItem("reference_id");
            const patientId = referenceId!;

            const response = await apiClient.get(
                ENDPOINTS.getFamilyLeadContacts(patientId)
            );

            const data = await response.data;

            if (!data.success) {
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
                            onPress={handleRefresh}

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
                    {/* -------------------------------- */}
                    {/* SELECTED DATE */}
                    {/* -------------------------------- */}

                    <View style={styles.selectedDateCard}>

                        <View style={styles.selectedDateInfo}>

                            <Ionicons
                                name="calendar-outline"
                                size={22}
                                color="#2563eb"
                            />

                            <View
                                style={{
                                    flex: 1,
                                    marginLeft: 10,
                                }}
                            >

                                <Text
                                    style={styles.selectedDateLabel}
                                >
                                    {isHistoricalDate
                                        ? "Historical tasks"
                                        : "Today's tasks"}
                                </Text>

                                <Text
                                    style={styles.selectedDateText}
                                >
                                    {formatDateForDisplay(
                                        selectedDate
                                    )}
                                </Text>

                            </View>

                        </View>


                        <TouchableOpacity
                            style={styles.changeDateButton}
                            onPress={() =>
                                setDatePickerVisible(true)
                            }
                        >
                            <Ionicons
                                name="calendar"
                                size={17}
                                color="#2563eb"
                            />

                            <Text
                                style={styles.changeDateText}
                            >
                                Change
                            </Text>
                        </TouchableOpacity>

                    </View>

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
                                            {(task.observation || task.photo_evidence) && (
                                                <View style={styles.observationContainer}>

                                                    <View style={styles.observationHeader}>
                                                        <Ionicons
                                                            name="document-text-outline"
                                                            size={16}
                                                            color="#0369a1"
                                                        />
                                                        <Text style={styles.observationLabel}>
                                                            Caregiver Details
                                                        </Text>
                                                    </View>

                                                    {/* Observation Button */}
                                                    {task.observation && (
                                                        <TouchableOpacity
                                                            style={styles.observationBtn}
                                                            onPress={() => {
                                                                setSelectedObservation(task.observation!);
                                                                setObservationModal(true);
                                                            }}
                                                        >
                                                            <Ionicons
                                                                name="eye-outline"
                                                                size={16}
                                                                color="#fff"
                                                            />
                                                            <Text style={styles.observationText}>
                                                                View Observation
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}

                                                    {/* Image Button */}
                                                    {task.photo_evidence && (
                                                        <TouchableOpacity
                                                            style={[
                                                                styles.observationBtn,
                                                                task.observation ? { marginTop: 8 } : null,
                                                            ]}
                                                            onPress={() => {
                                                                setSelectedImageUrl(task.photo_evidence!);
                                                                setImageModalError("");
                                                                setImageModalLoading(true);
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
                style={[
                    styles.addFab,
                    isHistoricalDate &&
                    styles.disabledFab,
                ]}
                onPress={() => {

                    if (isHistoricalDate) {
                        return;
                    }

                    setModalVisible(true);
                }}
                disabled={isHistoricalDate}
            >
                <Text
                    style={[
                        styles.addIcon,
                        isHistoricalDate &&
                        styles.disabledFabIcon,
                    ]}
                >
                    ＋
                </Text>
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
                            style={[
                                styles.createTaskBtn,
                                isHistoricalDate &&
                                styles.disabledCreateTaskBtn,
                            ]}
                            disabled={
                                creating ||
                                isHistoricalDate
                            }
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
            {/* -------------------------------- */}
            {/* DATE PICKER */}
            {/* -------------------------------- */}

            {datePickerVisible && (
                <DateTimePicker
                    value={getDateObject(selectedDate)}
                    mode="date"
                    display={
                        Platform.OS === "ios"
                            ? "spinner"
                            : "default"
                    }
                    maximumDate={
                        getDateObject(todayString)
                    }
                    onChange={
                        handleDateChange
                    }
                />
            )}

        </SafeAreaView>
    );
}


