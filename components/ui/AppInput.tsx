// src/components/ui/AppInput.tsx
import { StyleSheet, TextInput } from "react-native";
import { colors } from "../../constants/theme/colors";

export default function AppInput(props: any) {
  return (
    <TextInput
      placeholderTextColor={colors.textLight}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 15,
  },
});