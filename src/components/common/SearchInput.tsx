import React from "react";
import { View, TextInput, StyleSheet, I18nManager, ViewStyle } from "react-native";
import SearchIcon from "../../assets/icons/SearchIcon";
import { globalTextStyles } from "../../styles/globalStyles";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: ViewStyle;
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder, value, onChangeText, style }) => {
  return (
    <View style={[styles.container, style, I18nManager.isRTL && styles.containerRTL]}>
      <View style={styles.iconContainer}>
        <SearchIcon width={22} height={22} color="#B6E2DF" />
      </View>
      <TextInput
        style={[styles.input, I18nManager.isRTL && styles.inputRTL]}
        placeholder={placeholder}
        placeholderTextColor="#B6E2DF"
        value={value}
        onChangeText={onChangeText}
        textAlign={I18nManager.isRTL ? "right" : "left"}
        underlineColorAndroid="transparent"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, .1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#42bcbe",
    paddingHorizontal: 12,
    height: 44,
    width: "100%",
  },
  containerRTL: {
    flexDirection: "row-reverse",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    ...globalTextStyles.bodyMedium,
    color: "#fff",
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  inputRTL: {
    textAlign: "right",
  },
});

export default SearchInput; 