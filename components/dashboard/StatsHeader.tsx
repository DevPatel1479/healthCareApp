import { StyleSheet, Text, View } from "react-native";

export default function StatsHeader({ completed, total }: any) {
  const pending = total - completed;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today’s Care Tasks</Text>

      <View style={styles.row}>
        <View style={styles.box}>
          <Text style={styles.number}>{completed}</Text>
          <Text style={styles.label}>Completed</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.number}>{pending}</Text>
          <Text style={styles.label}>Pending</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  box: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    alignItems: "center",
  },
  number: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ef4444",
  },
  label: {
    color: "#666",
    marginTop: 5,
  },
});