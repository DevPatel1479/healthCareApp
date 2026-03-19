import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TaskCard({ task, onToggle }: any) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        task.completed && styles.completedCard,
      ]}
      onPress={() => onToggle(task.id)}
      activeOpacity={0.8}
    >
      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          task.selected && styles.checked,
        ]}
      />

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.text,
            task.completed && styles.doneText,
          ]}
        >
          {task.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  completedCard: {
    opacity: 0.5,
  },
  checkbox: {
    height: 22,
    width: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ef4444",
    marginRight: 12,
  },
  checked: {
    backgroundColor: "#ef4444",
  },
  text: {
    fontSize: 16,
  },
  doneText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
});