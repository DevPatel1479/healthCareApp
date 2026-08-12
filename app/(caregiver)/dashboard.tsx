import { useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";

import { Alert, Dimensions, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { uploadImageToServer } from "@/services/uploadImageToServer";
import { styles } from "../../styles/caregiver.styles";
import { apiClient } from "@/api/apiClient";
import { tokenStorage } from "@/api/tokenStorage";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";





type TaskAssignment = {
  assignment_id: number;
  status: "completed" | "pending" | "skipped" | "refused";
  time_done: string | null;
  flag_level: "green" | "yellow" | "red";
  observation: string | null;
  photo_evidence: string | null;
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
    patient_id: number;
    category: string;
    shift: string | null;
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

  const { date: routeDate } =
    useLocalSearchParams<{
      date?: string;
    }>();

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

  const [observationModal, setObservationModal] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<string | null>(null);

  const [imageModal, setImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [caregiverName, setCaregiverName] = useState("Caregiver");

  const cameraRef = useRef<CameraView | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

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

  useEffect(() => {

    if (isHistoricalDate) {
      setModalVisible(false);
    }

  }, [isHistoricalDate]);


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
              disconnectSocket();


              await tokenStorage.remove();
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
    let cancelled = false;

    const initializeSocket = async () => {
      try {
        if (!isCurrentDate) {
          console.log(
            "Historical date selected:",
            selectedDate,
            "Socket disabled"
          );

          disconnectSocket();

          return;
        }


        const referenceId = await AsyncStorage.getItem("reference_id");

        if (!referenceId || cancelled) {
          console.log("Caregiver reference_id not found");
          return;
        }

        console.log(
          "Current date selected:",
          selectedDate,
          "Socket enabled"
        );
        socket = connectSocket(Number(referenceId));

        // 🔥 LISTEN FOR TASK UPDATE
        socket.on("task_updated", (updatedTask: any) => {
          console.log("📡 Task updated via socket:", updatedTask);

          setTasks((prev) =>
            prev.map((t) =>
              t.assignment_id === updatedTask.assignment_id
                ? {
                  ...t,
                  status: updatedTask.status,
                  time_done: updatedTask.time_done,
                  flag_level: updatedTask.flag_level,
                  observation: updatedTask.observation,
                  photo_evidence: updatedTask.photo_evidence,
                }
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
            const formattedTask: TaskAssignment = {
              assignment_id: newTask.assignment_id,

              status: newTask.status,
              time_done: newTask.time_done,

              flag_level: newTask.flag_level,

              observation: newTask.observation,

              photo_evidence: newTask.photo_evidence ?? null,

              caregiver: newTask.caregiver ?? null,

              patient: newTask.patient ?? null,

              selected: false,

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
      cancelled = true;
      if (socket) {
        socket.off("task_updated");
        socket.off("task_assigned");
        socket.off("daily_tasks_regenerated");
      }

      disconnectSocket(); // cleanup
    };

  }, [
    selectedDate,
    isCurrentDate,
  ]);




  // ---------------- FETCH TASKS ----------------
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const referenceId = await AsyncStorage.getItem("reference_id");
      console.log(`Fetched caregiver id ${referenceId}`);
      const res = await apiClient.get(ENDPOINTS.getCaregiverTasks(Number(referenceId)),
        {
          params: {
            date: selectedDate,
          },
        }

      );
      const json = await res.data;

      if (!json.success) throw new Error(json.message || "Failed to load");

      setTasks(json.data);
      setPatientInfo(json.patient ?? null);
    } catch (err: any) {
      const status = err?.response?.status;
      console.log(
        "Caregiver task fetch error:",
        status,
        err?.response?.data
      );
      if (status === 404) {

        // This is an expected state, NOT a page error.
        setTasks([]);
        setPatientInfo(null);
        setError("");

        return;
      }
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong";

      setTasks([]);
      setPatientInfo(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);


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
        "/(caregiver)/dashboard",
      params: {
        date: newDate,
      },
    });
  };


  // ---------------- TOGGLE ----------------
  const handleToggle = (item: TaskAssignment) => {

    if (isHistoricalDate) {
      return;
    }

    if (item.status === "completed") return;



    setSelectedTask(item);
    setModalVisible(true);
  };

  const validateAndSetImage = (selectedImage: ImagePicker.ImagePickerAsset) => {
    // Size validation
    if (
      selectedImage.fileSize &&
      selectedImage.fileSize > 2 * 1024 * 1024
    ) {
      Alert.alert(
        "File Too Large",
        "Please select an image smaller than 2 MB."
      );
      return;
    }

    // Mime type validation
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      selectedImage.mimeType &&
      !allowedTypes.includes(selectedImage.mimeType)
    ) {
      Alert.alert(
        "Invalid File",
        "Only JPG, PNG and WEBP images are allowed."
      );
      return;
    }

    setImage(selectedImage.uri);
  };
  // ---------------- PICK IMAGE ----------------
  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });

      if (result.canceled) return;

      validateAndSetImage(result.assets[0]);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Unable to select image.");
    }
  };

  // const takePhoto = async () => {
  //   try {
  //     console.log("1. Requesting permission");
  //     const permission =
  //       await ImagePicker.requestCameraPermissionsAsync();
  //     console.log("Permission:", permission);
  //     if (!permission.granted) {
  //       Alert.alert(
  //         "Permission Required",
  //         "Camera permission is required."
  //       );
  //       return;
  //     }
  //     console.log("2. Opening camera");

  //     const result = await ImagePicker.launchCameraAsync({
  //       allowsEditing: true,
  //       quality: 0.5,
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     });
  //     console.log("3. Camera returned:", result);

  //     if (result.canceled) return;

  //     validateAndSetImage(result.assets[0]);

  //   } catch (err) {
  //     console.log(err);
  //     Alert.alert("Error", "Unable to open camera.");
  //   }
  // };


  const openCamera = async () => {
    try {
      const current = cameraPermission ?? (await requestCameraPermission());

      if (!current.granted) {
        Alert.alert("Permission Required", "Camera permission is required.");
        return;
      }

      setCameraVisible(true);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Unable to open camera.");
    }
  };

  const capturePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });

      if (!photo?.uri) return;

      setImage(photo.uri);
      setCameraVisible(false);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Unable to capture photo.");
    }
  };


  const handleSubmit = async () => {

    if (isHistoricalDate) {
      return;
    }


    if (!selectedTask) return;

    try {
      setUpdating(true);
      const referenceId = await AsyncStorage.getItem("reference_id");
      let uploadedImageUrl = null;
      if (image) {
        uploadedImageUrl = await uploadImageToServer(
          image
        );
      }
      // 🔥 CALL BACKEND

      const res = await apiClient.patch(ENDPOINTS.updateTasksStatus(), {



        assignment_id: selectedTask.assignment_id,
        caregiver_id: Number(referenceId),
        status: "completed",
        observation: note || null,
        photo_evidence: uploadedImageUrl,

      });

      const json = await res.data;

      if (!json.success) throw new Error(json.message);

      const updatedTask = json.data;

      // 🔥 OPTIMISTIC UI UPDATE (instant)
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.assignment_id === updatedTask.assignment_id
            ? {
              ...t,
              status: updatedTask.status,
              time_done: updatedTask.time_done,
              flag_level: updatedTask.flag_level,
              observation: updatedTask.observation,
              photo_evidence: updatedTask.photo_evidence,
            }
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
      console.log(`err : ${err?.response?.data?.message}`);
      Alert.alert(
        "Upload Failed",
        err.message || "Please try again."
      );
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

  const openImageModal = (uri: string) => {
    setSelectedImage(uri);
    setImageError(null);
    setImageLoading(true);
    setImageModal(true);
  };

  const closeImageModal = () => {
    setImageModal(false);
    setImageLoading(false);
    setImageError(null);
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

                      {(task.observation || task.photo_evidence) && (
                        <View style={styles.observationContainer}>

                          {task.observation && (
                            <TouchableOpacity
                              style={styles.observationBtn}
                              onPress={() => {
                                setSelectedObservation(task.observation);
                                setObservationModal(true);
                              }}
                            >
                              <Ionicons
                                name="document-text-outline"
                                size={16}
                                color="#fff"
                              />

                              <Text style={styles.observationText}>
                                View Observation
                              </Text>
                            </TouchableOpacity>
                          )}

                          {task.photo_evidence && (
                            <TouchableOpacity
                              style={[
                                styles.observationBtn,
                                { marginTop: 10 }
                              ]}
                              onPress={() => openImageModal(task.photo_evidence!)}
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

              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Add Image",
                    "Choose image source",
                    [
                      {
                        text: "Take Photo",
                        onPress: openCamera,
                      },
                      {
                        text: "Choose from Gallery",
                        onPress: pickFromGallery,
                      },
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                    ]
                  );
                }}
                style={styles.buttonPrimary}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {image ? "Change Image" : "Add Image"}
                </Text>
              </TouchableOpacity>

              {image && (
                <>
                  <Image
                    source={{ uri: image }}
                    style={styles.preview}
                  />

                  <TouchableOpacity
                    onPress={() => setImage(null)}
                    style={{
                      marginTop: 10,
                      backgroundColor: "#dc2626",
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                      }}
                    >
                      Remove Image
                    </Text>
                  </TouchableOpacity>
                </>
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
                  No patient assigned
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={observationModal}
        transparent
        animationType="fade"
      >
        <View style={styles.observationModalOverlay}>
          <View style={styles.observationModalCard}>

            <View style={styles.observationHeader}>
              <View style={styles.observationIcon}>
                <Ionicons
                  name="document-text"
                  size={24}
                  color="#2563eb"
                />
              </View>

              <Text style={styles.observationTitle}>
                Caregiver Note
              </Text>
            </View>

            <View style={styles.observationContent}>
              <Text style={styles.observationTextLarge}>
                {selectedObservation}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.observationCloseBtn}
              onPress={() => setObservationModal(false)}
            >
              <Text style={styles.observationCloseText}>
                Close
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>


      <Modal
        visible={imageModal}

        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeImageModal}

      >
        <View style={styles.fullScreenImageContainer}>
          <TouchableOpacity
            style={styles.imageCloseBtn}
            onPress={() => {
              setImageModal(false);
              setImageLoading(false);
              setImageError(null);
            }}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <View style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}>
            {imageLoading && (
              <View style={{ position: "absolute", zIndex: 2, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: "#fff", marginTop: 12 }}>Loading image...</Text>
              </View>
            )}

            {imageError ? (
              <Text style={{ color: "#fff" }}>{imageError}</Text>
            ) : selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullScreenImage}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError("Unable to load image.");
                }}
              />
            ) : null}
          </View>
        </View>
      </Modal>
      <Modal visible={cameraVisible} animationType="slide" onRequestClose={() => setCameraVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
          />

          <View
            style={{
              position: "absolute",
              bottom: 30,
              left: 20,
              right: 20,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => setCameraVisible(false)}
              style={{
                backgroundColor: "#111827",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={capturePhoto}
              style={{
                backgroundColor: "#2563eb",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Capture</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* 🔴 LOGOUT FAB */}

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


