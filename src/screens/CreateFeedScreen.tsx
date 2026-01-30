import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image, Alert,
  ActivityIndicator, Modal, SafeAreaView, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../contexts/AuthContext";
import { getClothingItems } from "../services/wardrobeService";
import { createFeedPost } from "../services/feedService";
import { uploadImageToCloudinary } from "../services/cloudinaryService";
import { ClothingItem } from "../types/wardrobe";
import { colors } from "../theme/colors";

export default function CreateFeedScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [mainImageUri, setMainImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false); // 모달 상태

  useEffect(() => {
    async function loadWardrobe() {
      if (!user) return;
      try {
        setWardrobe(await getClothingItems(user.uid));
      } catch (error) { console.error(error); }
    }
    loadWardrobe();
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("권한 필요", "갤러리 권한이 필요합니다.");
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 5], quality: 0.8,
    });

    if (!result.canceled) setMainImageUri(result.assets[0].uri);
  };

  const toggleSelection = (item: ClothingItem) => {
    if (selectedItems.find((i) => i.id === item.id)) {
      setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      if (selectedItems.length >= 5) return Alert.alert("최대 5개까지만 선택 가능해요.");
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleUpload = async () => {
    if (!mainImageUri) return Alert.alert("사진을 선택해주세요!");
    if (!description.trim()) return Alert.alert("내용을 입력해주세요.");
    
    setUploading(true);
    try {
      const uploadedData = await uploadImageToCloudinary(mainImageUri); 
      await createFeedPost(user!.uid, user!.displayName || "User", {
        mainImageUrl: uploadedData.url,
        items: selectedItems,
        description,
        styleTags: ["OOTD", ...selectedItems.map(i => i.category)],
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert("업로드 실패", "다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  };

  // 모달 내 옷장 아이템 렌더링
  const renderWardrobeItem = ({ item }: { item: ClothingItem }) => {
    const isSelected = selectedItems.find((i) => i.id === item.id);
    return (
      <TouchableOpacity 
        style={[styles.modalItem, isSelected && styles.modalItemSelected]} 
        onPress={() => toggleSelection(item)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.modalItemImage} />
        {isSelected && (
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#000" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>새 게시물</Text>
        <TouchableOpacity onPress={handleUpload} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>공유</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 1. 이미지 선택 영역 */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {mainImageUri ? (
            <Image source={{ uri: mainImageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color="#ccc" />
              <Text style={styles.placeholderText}>사진을 추가하세요</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 2. 내용 입력 */}
        <TextInput
          style={styles.input}
          placeholder="오늘의 코디를 설명해주세요..."
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* 3. 옷장 아이템 추가 버튼 및 미리보기 */}
        <View style={styles.wardrobeSection}>
          <TouchableOpacity 
            style={styles.addWardrobeButton} 
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="shirt-outline" size={20} color="#333" />
            <Text style={styles.addButtonText}>옷장 아이템 태그하기</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          
          {/* 선택된 아이템 미리보기 가로 스크롤 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {selectedItems.map((item) => (
              <View key={item.id} style={styles.selectedPreview}>
                <Image source={{ uri: item.imageUrl }} style={styles.previewThumb} />
                <TouchableOpacity 
                  style={styles.removeBtn} 
                  onPress={() => toggleSelection(item)}
                >
                  <Ionicons name="close-circle" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* --- 옷장 선택 모달 (팝업) --- */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>아이템 선택 ({selectedItems.length}/5)</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalDone}>완료</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={wardrobe}
            renderItem={renderWardrobeItem}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={{ padding: 10 }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee"
  },
  cancelText: { fontSize: 16, color: "#666" },
  submitText: { fontSize: 16, fontWeight: "bold", color: "#000" },
  headerTitle: { fontSize: 16, fontWeight: "600" },
  
  content: { padding: 20 },
  imagePicker: { width: "100%", aspectRatio: 4/5, borderRadius: 12, overflow: "hidden", backgroundColor: "#f9f9f9", marginBottom: 20 },
  previewImage: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: { marginTop: 10, color: "#999" },

  input: { fontSize: 16, minHeight: 80, marginBottom: 30 },

  wardrobeSection: { borderTopWidth: 1, borderTopColor: "#f5f5f5", paddingTop: 20 },
  addWardrobeButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12
  },
  addButtonText: { flex: 1, marginLeft: 10, fontSize: 16, color: "#333" },

  selectedPreview: { marginRight: 10, position: "relative" },
  previewThumb: { width: 60, height: 60, borderRadius: 8, backgroundColor: "#eee" },
  removeBtn: { position: "absolute", top: -5, right: -5, backgroundColor: "#fff", borderRadius: 9 },

  // 모달 스타일
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee"
  },
  modalTitle: { fontSize: 16, fontWeight: "bold" },
  modalDone: { fontSize: 16, color: colors.bgPrimary || "blue", fontWeight: "600" },
  modalItem: { flex: 1/3, aspectRatio: 1, margin: 4, borderRadius: 8, overflow: "hidden", backgroundColor: "#f5f5f5" },
  modalItemSelected: { borderWidth: 3, borderColor: "#000" },
  modalItemImage: { width: "100%", height: "100%" },
  checkIcon: { position: "absolute", top: 4, right: 4, backgroundColor: "#fff", borderRadius: 12 },
});