// app/(patient)/report.tsx

import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ENDPOINTS } from "@/api/endpoints";
import * as Print from "expo-print";


import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
// ADD THIS IMPORT
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams } from "expo-router";

type ReportItem = {
    assignment_id: number;
    task_description: string;
    completed_at: string;
    caregiver: {
        caregiver_id: number;
        full_name: string;
        phone_number: string;
    } | null;
    observation_notes: string | null;
    photo_proof: string | null;
};

// ─── ReportTableRow (outside PatientReportScreen) ───────────────────────────

function ReportTableRow({
    item,
    index,
    isEven,
}: {
    item: ReportItem;
    index: number;
    isEven: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const isLongTask = item.task_description.length > 100;
    const isLongObs =
        item.observation_notes && item.observation_notes.length > 100;



    return (
        <View
            style={[
                styles.tableRowData,
                isEven && styles.tableRowEven,
            ]}
        >
            {/* # */}
            <View style={[styles.cellWrap, { width: 44 }]}>
                <Text style={[styles.tableCell, styles.indexCell]}>
                    {index + 1}
                </Text>
            </View>

            {/* Task */}
            <View style={[styles.cellWrap, { width: 240 }]}>
                <Text
                    style={styles.tableCell}
                    numberOfLines={isLongTask && !expanded ? 3 : undefined}
                >
                    {item.task_description}
                </Text>
                {isLongTask && (
                    <TouchableOpacity
                        onPress={() => setExpanded(!expanded)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                        <Text style={styles.viewMoreText}>
                            {expanded ? "Show less ↑" : "View more ↓"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Completed At */}
            <View style={[styles.cellWrap, { width: 160 }]}>
                <Text style={styles.tableCell}>
                    {new Date(item.completed_at).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </Text>
                <Text style={styles.timeText}>
                    {new Date(item.completed_at).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </Text>
            </View>

            {/* Caregiver */}
            <View style={[styles.cellWrap, { width: 150 }]}>
                <Text style={[styles.tableCell, { width: 180 }]}>
                    {item.caregiver?.full_name ?? "N/A"}
                </Text>
            </View>

            {/* Observation */}
            <View style={[styles.cellWrap, { width: 220 }]}>
                <Text
                    style={[
                        styles.tableCell,
                        !item.observation_notes && styles.naText,
                    ]}
                    numberOfLines={isLongObs && !expanded ? 3 : undefined}
                >
                    {item.observation_notes ?? "N/A"}
                </Text>
            </View>

            {/* Photo */}
            <View style={[styles.cellWrap, { width: 100 }]}>
                {item.photo_proof ? (
                    <TouchableOpacity
                        onPress={() => Linking.openURL(item.photo_proof!)}
                        style={styles.viewImageBtn}
                    >
                        <Ionicons
                            name="image-outline"
                            size={14}
                            color="#2563eb"
                        />
                        <Text style={styles.link}>View</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={[styles.tableCell, styles.naText]}>N/A</Text>
                )}
            </View>
        </View>
    );
}

// ─── Card view for narrow screens ────────────────────────────────────────────

function ReportCard({
    item,
    index,
}: {
    item: ReportItem;
    index: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const isLongTask = item.task_description.length > 120;

    return (
        <View style={styles.card}>
            <View style={styles.cardIndexBadge}>
                <Text style={styles.cardIndexText}>#{index + 1}</Text>
            </View>

            <CardRow label="Task">
                <Text
                    style={styles.cardValue}
                    numberOfLines={isLongTask && !expanded ? 3 : undefined}
                >
                    {item.task_description}
                </Text>
                {isLongTask && (
                    <TouchableOpacity
                        onPress={() => setExpanded(!expanded)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                        <Text style={styles.viewMoreText}>
                            {expanded ? "Show less ↑" : "View more ↓"}
                        </Text>
                    </TouchableOpacity>
                )}
            </CardRow>

            <CardRow label="Completed">
                <Text style={styles.cardValue}>
                    {new Date(item.completed_at).toLocaleString()}
                </Text>
            </CardRow>

            <CardRow label="Caregiver">
                <Text style={styles.cardValue}>{item.caregiver?.full_name}</Text>
            </CardRow>

            <CardRow label="Observation">
                <Text style={styles.cardValue}>
                    {item.observation_notes ?? "N/A"}
                </Text>
            </CardRow>

            <CardRow label="Photo" last>
                {item.photo_proof ? (
                    <TouchableOpacity
                        onPress={() => Linking.openURL(item.photo_proof!)}
                        style={styles.viewImageBtn}
                    >
                        <Ionicons
                            name="image-outline"
                            size={14}
                            color="#2563eb"
                        />
                        <Text style={styles.link}>View Image</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.cardValue}>N/A</Text>
                )}
            </CardRow>
        </View>
    );
}

function CardRow({
    label,
    children,
    last,
}: {
    label: string;
    children: React.ReactNode;
    last?: boolean;
}) {
    return (
        <View style={[styles.cardRow, last && styles.cardRowLast]}>
            <Text style={styles.cardLabel}>{label}</Text>
            <View style={styles.cardValueWrap}>{children}</View>
        </View>
    );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function PatientReportScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // Use card layout below 600 px (phones), table above (tablets / landscape)
    const useTableLayout = width >= 600;

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState<ReportItem[]>([]);
    const { patientName } = useLocalSearchParams<{
        patientName: string;
    }>();

    const clientName = patientName || "Client";
    const formatDate = (date: Date) =>
        date.toISOString().split("T")[0];
    const getSafeFileName = () => {
        const safeName = clientName
            .trim()
            .replace(/[^a-zA-Z0-9]/g, "_")
            .replace(/_+/g, "_");

        const formattedDate = selectedDate
            .toISOString()
            .split("T")[0];

        return `${safeName}_${formattedDate}`;
    };

    const showDownloadOptions = () => {
        Alert.alert(
            "Download Report",
            `${clientName}\n${selectedDate.toLocaleDateString()}`,
            [
                {
                    text: "📄 Export as PDF",
                    onPress: exportToPDF,
                },
                {
                    text: "📊 Export as Excel",
                    onPress: exportToExcel,
                },
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ],
            {
                cancelable: true,
            }
        );
    };

    const getTableData = () => {
        return reports.map((item, index) => [
            index + 1,
            item.task_description,
            new Date(item.completed_at).toLocaleString(),
            item.caregiver?.full_name ?? "N/A",
            item.observation_notes ?? "N/A",
            item.photo_proof?.startsWith("https") ? "Yes" : "No",
        ]);
    };

    const exportToPDF = async () => {
        try {
            const rows = reports
                .map(
                    (item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.task_description}</td>
                    <td>${new Date(item.completed_at).toLocaleString()}</td>
                    <td>${item.caregiver?.full_name ?? "N/A"}</td>
                    <td>${item.observation_notes ?? "N/A"}</td>
                    <td>${item.photo_proof?.startsWith("https")
                            ? "Yes"
                            : "No"
                        }</td>
                </tr>
            `
                )
                .join("");

            const html = `
            <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                        }

                        h1 {
                            text-align: center;
                            margin-bottom: 10px;
                        }

                        h2 {
                            margin-bottom: 25px;
                            font-size: 18px;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }

                        th, td {
                            border: 1px solid #000;
                            padding: 8px;
                            text-align: left;
                            font-size: 12px;
                        }

                        th {
                            background-color: #2563eb;
                            color: white;
                        }
                    </style>
                </head>

                <body>
                    <h1>
                        Client Report as on ${selectedDate.toLocaleDateString()}
                    </h1>

                    <h2>
                        Client Name: ${clientName}
                    </h2>

                    <table>
                        <thead>
                            <tr>
                                <th>Sr. No.</th>
                                <th>Task Description</th>
                                <th>Date & Time</th>
                                <th>Caregiver Name</th>
                                <th>Note</th>
                                <th>Image</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

            const tempPdf = await Print.printToFileAsync({
                html,
                base64: false,
            });
            const fileName = `${getSafeFileName()}.pdf`;
            const finalUri = `${FileSystem.cacheDirectory}${fileName}`;

            await FileSystem.copyAsync({
                from: tempPdf.uri,
                to: finalUri,
            });



            await Sharing.shareAsync(finalUri, {
                mimeType: "application/pdf",
                UTI: "com.adobe.pdf",
                dialogTitle: fileName,
            });
        } catch (error) {
            Alert.alert("Error", "Failed to export PDF");
        }
    };
    const exportToExcel = async () => {
        try {
            const workbook = XLSX.utils.book_new();

            const worksheetData = [
                [`Client Report as on ${selectedDate.toLocaleDateString()}`],
                [`Client Name: ${clientName}`],
                [],
                [
                    "Sr. No.",
                    "Task Description",
                    "Date & Time",
                    "Caregiver Name",
                    "Note",
                    "Image",
                ],
                ...getTableData(),
            ];

            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Patient Report"
            );

            // Generate base64 Excel file
            const base64 = XLSX.write(workbook, {
                type: "base64",
                bookType: "xlsx",
            });
            const fileName = `${getSafeFileName()}.xlsx`;
            const tempUri = `${FileSystem.cacheDirectory}temp_${Date.now()}.xlsx`;
            await FileSystem.writeAsStringAsync(
                tempUri,
                base64,
                {
                    encoding: FileSystem.EncodingType.Base64,
                }
            );

            // Use Expo Sharing directly
            const finalUri = `${FileSystem.cacheDirectory}${fileName}`;

            await FileSystem.copyAsync({
                from: tempUri,
                to: finalUri,
            });

            await Sharing.shareAsync(finalUri, {
                mimeType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                UTI: "org.openxmlformats.spreadsheetml.sheet",
                dialogTitle: fileName,
            });
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to export Excel");
        }
    };
    const fetchReports = async (date: Date) => {
        try {
            setLoading(true);
            const response = await fetch(ENDPOINTS.getPatientReports(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patient_id: 5,
                    date: formatDate(date),
                }),
            });
            const json = await response.json();
            if (!json.success)
                throw new Error(json.message || "Failed to fetch report");
            setReports(json.data || []);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Something went wrong");
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(selectedDate);
    }, []);

    const handleConfirm = (date: Date) => {
        setDatePickerVisible(false);
        setSelectedDate(date);
        fetchReports(date);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={styles.loadingText}>Loading reports…</Text>
                </View>
            );
        }

        if (reports.length === 0) {
            return (
                <View style={styles.center}>
                    <Ionicons
                        name="document-text-outline"
                        size={70}
                        color="#9ca3af"
                    />
                    <Text style={styles.emptyTitle}>No Reports Found</Text>
                    <Text style={styles.emptySubtitle}>
                        No reports available for this date.
                    </Text>
                </View>
            );
        }

        // ── Table layout (tablets / landscape) ──
        if (useTableLayout) {
            return (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                >
                    <View style={styles.tableContainer}>
                        {/* Table header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerCell, { width: 44 }]}>#</Text>
                            <Text style={[styles.headerCell, { width: 240 }]}>Task</Text>
                            <Text style={[styles.headerCell, { width: 160 }]}>Completed</Text>
                            <Text style={[styles.headerCell, { width: 150 }]}>Caregiver</Text>
                            <Text style={[styles.headerCell, { width: 220 }]}>Observation</Text>
                            <Text style={[styles.headerCell, { width: 100 }]}>Photo</Text>
                        </View>

                        {/* Table rows */}
                        {reports.map((item, index) => (
                            <ReportTableRow
                                key={item.assignment_id}
                                item={item}
                                index={index}
                                isEven={index % 2 === 0}
                            />
                        ))}
                    </View>
                </ScrollView>
            );
        }

        // ── Card layout (phones) ──
        return (
            <ScrollView
                contentContainerStyle={styles.cardList}
                showsVerticalScrollIndicator={false}
            >
                {reports.map((item, index) => (
                    <ReportCard
                        key={item.assignment_id}
                        item={item}
                        index={index}
                    />
                ))}
            </ScrollView>
        );
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            {/* Header — padded by status bar height */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Report</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Date Selector */}

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setDatePickerVisible(true)}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={22}
                        color="#2563eb"
                    />
                    <Text style={styles.dateButtonText}>
                        {selectedDate.toDateString()}
                    </Text>
                    <Ionicons
                        name="chevron-down"
                        size={18}
                        color="#6b7280"
                    />
                </TouchableOpacity>

                {reports.length > 0 && (
                    <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={showDownloadOptions}
                        activeOpacity={0.85}
                    >
                        <Ionicons
                            name="download-outline"
                            size={22}
                            color="#ffffff"
                        />
                        <Text style={styles.downloadButtonText}>
                            Download Report
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                date={selectedDate}
                onConfirm={handleConfirm}
                onCancel={() => setDatePickerVisible(false)}
                maximumDate={new Date()}
            />

            {renderContent()}
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    actionContainer: {
        paddingHorizontal: 16,
        gap: 12,
    },

    downloadButton: {
        backgroundColor: "#2563eb",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        elevation: 3,
        shadowColor: "#2563eb",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },

    downloadButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },

    // ── Header ──
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
    },

    // ── Date button ──
    dateButton: {
        margin: 16,
        backgroundColor: "#ffffff",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    dateButtonText: {
        flex: 1,
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },

    // ── Center states ──
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        gap: 12,
    },
    loadingText: {
        marginTop: 8,
        fontSize: 16,
        color: "#6b7280",
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
    },
    emptySubtitle: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
    },

    // ── Table ──
    tableContainer: {
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        marginTop: 4,
        backgroundColor: "#ffffff",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#1e40af",
        paddingVertical: 13,
        paddingHorizontal: 12,
    },
    headerCell: {
        fontSize: 12,
        fontWeight: "700",
        color: "#ffffff",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        paddingRight: 12,
    },
    tableRowData: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        alignItems: "flex-start",
        backgroundColor: "#ffffff",
    },
    tableRowEven: {
        backgroundColor: "#f8fafc",
    },
    cellWrap: {
        paddingRight: 12,
        justifyContent: "flex-start",
    },
    tableCell: {
        fontSize: 13,
        color: "#1e293b",
        lineHeight: 20,
    },
    indexCell: {
        fontWeight: "700",
        color: "#2563eb",
    },
    timeText: {
        fontSize: 11,
        color: "#94a3b8",
        marginTop: 2,
    },
    naText: {
        color: "#94a3b8",
        fontStyle: "italic",
    },
    viewMoreText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#2563eb",
        marginTop: 4,
    },
    viewImageBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#eff6ff",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    link: {
        fontSize: 13,
        fontWeight: "700",
        color: "#2563eb",
    },

    // ── Cards (phone layout) ──
    cardList: {
        padding: 16,
        gap: 14,
        paddingBottom: 32,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 18,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    cardIndexBadge: {
        backgroundColor: "#1e40af",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    cardIndexText: {
        fontSize: 13,
        fontWeight: "800",
        color: "#ffffff",
        letterSpacing: 0.5,
    },
    cardRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        alignItems: "flex-start",
        gap: 12,
    },
    cardRowLast: {
        borderBottomWidth: 0,
    },
    cardLabel: {
        width: 90,
        fontSize: 12,
        fontWeight: "700",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        paddingTop: 2,
    },
    cardValueWrap: {
        flex: 1,
    },
    cardValue: {
        fontSize: 14,
        color: "#1e293b",
        lineHeight: 21,
    },
});