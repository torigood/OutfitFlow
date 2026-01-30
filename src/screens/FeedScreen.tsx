import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  PanResponder,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { 
  getFeeds, 
  toggleLikePost, 
  deleteFeedPost, 
  updateFeedPostDescription 
} from "../services/feedService";
import { FeedPost } from "../types/feed";
import { colors } from "../theme/colors";

// --- 개별 피드 아이템 컴포넌트 ---
interface FeedItemProps {
  item: FeedPost;
  currentUserId: string;
  onLike: () => void;
  onOpenMenu: () => void;
  isEditing: boolean;
  onFinishEdit: () => void;
}

const FeedItem = ({ 
  item, 
  currentUserId, 
  onLike, 
  onOpenMenu,
  isEditing,
  onFinishEdit
}: FeedItemProps) => {
  const navigation = useNavigation();
  const isLiked = item.likes.includes(currentUserId);
  
  const [editDescription, setEditDescription] = useState(item.description);
  const hasMainImage = !!item.mainImageUrl;

  const handlePress = () => {
    if (isEditing) return;
    // @ts-ignore
    navigation.navigate("PostDetail", { post: item });
  };

  const handleSaveUpdate = async () => {
    if (!editDescription.trim()) return Alert.alert("내용을 입력해주세요.");
    try {
      await updateFeedPostDescription(item.id, editDescription);
      item.description = editDescription;
      onFinishEdit();
    } catch (error) {
      Alert.alert("오류", "게시물 수정 실패");
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.card}>
      {/* 1. 헤더 */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#666" />
          </View>
          <Text style={styles.userName}>{item.userName}</Text>
        </View>

        <TouchableOpacity 
          onPress={onOpenMenu}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
           <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* 2. 메인 이미지 */}
      {hasMainImage ? (
        <View style={styles.mainImageContainer}>
          <Image source={{ uri: item.mainImageUrl }} style={styles.mainImage} />
        </View>
      ) : (
        item.items && item.items.length > 0 && (
          <View style={styles.wardrobeListContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {item.items.map((wardrobeItem, index) => (
                <View key={index} style={styles.wardrobeItemWrapper}>
                  <Image source={{ uri: wardrobeItem.imageUrl }} style={styles.wardrobeThumb} />
                </View>
              ))}
            </ScrollView>
          </View>
        )
      )}

      {/* 3. 하단 액션바 */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={onLike} style={styles.iconBtn}>
           <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={isLiked ? "#FF3B30" : "#000"} />
           {item.likes.length > 0 && <Text style={styles.countText}>{item.likes.length}</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePress} style={styles.iconBtn}>
           <Ionicons name="chatbubble-outline" size={24} color="#000" />
           {item.commentCount !== undefined && item.commentCount > 0 && (
             <Text style={styles.countText}>{item.commentCount}</Text>
           )}
        </TouchableOpacity>
      </View>

      {/* 4. 본문 내용 */}
      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        {isEditing ? (
          <View>
            <TextInput 
              style={styles.editInput}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={onFinishEdit}>
                <Text style={styles.cancelEditText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveUpdate}>
                <Text style={styles.saveEditText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          item.description ? (
            <Text style={styles.description} numberOfLines={3}>
              <Text style={{fontWeight: 'bold'}}>{item.userName} </Text>
              {item.description}
            </Text>
          ) : null
        )}
      </View>
      
      {/* 5. 태그 & 날짜 */}
      <View style={styles.tagContainer}>
          {item.styleTags?.slice(0, 3).map((tag, idx) => (
            <Text key={idx} style={styles.tagText}>#{tag} </Text>
          ))}
      </View>
      <Text style={styles.dateText}>
        {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : "방금 전"}
      </Text>
    </TouchableOpacity>
  );
};

// --- 메인 화면 컴포넌트 ---
export default function FeedScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [menuPost, setMenuPost] = useState<FeedPost | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // --- 드래그 제스처 (PanResponder) ---
  const panY = useRef(new Animated.Value(0)).current;

  // 팝업 열릴 때 위치 초기화
  useEffect(() => {
    if (menuPost) {
      panY.setValue(0);
    }
  }, [menuPost]);

  const closeBottomSheet = () => {
    Animated.timing(panY, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMenuPost(null);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      // 터치 시작 시에는 권한을 가져오지 않음 (내부 버튼 클릭 허용)
      onStartShouldSetPanResponder: () => false,
      // 조금이라도 움직이면 드래그로 인식하여 권한 가져옴
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // 아래로 내리는 동작(양수)만 허용
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // 100px 이상 내렸거나, 빠르게 휙 내렸을 때 닫기
        if (gestureState.dy > 100 || gestureState.vy > 1.0) {
          closeBottomSheet();
        } else {
          // 아니면 다시 원래 위치로 복귀
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  const fetchFeeds = async () => {
    try {
      const data = await getFeeds();
      setFeeds(data);
    } catch (error) {
      console.error("피드 불러오기 실패:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeeds();
    }, [])
  );

  const handleLike = async (post: FeedPost) => {
    if (!user) return;
    const isLiked = post.likes.includes(user.uid);
    const newLikes = isLiked
      ? post.likes.filter((id) => id !== user.uid)
      : [...post.likes, user.uid];

    setFeeds((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, likes: newLikes } : p))
    );
    await toggleLikePost(post.id, user.uid, post.likes);
  };

  const handleEditPress = () => {
    if (menuPost) setEditingPostId(menuPost.id);
    setMenuPost(null);
  };

  const handleDeletePress = () => {
    const targetId = menuPost?.id;
    setMenuPost(null);
    
    if (!targetId) return;

    Alert.alert("게시물 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFeedPost(targetId);
            setFeeds((prev) => prev.filter((item) => item.id !== targetId));
          } catch (error) {
            Alert.alert("오류", "삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const handleReportPress = () => {
    setMenuPost(null);
    setTimeout(() => {
       Alert.alert("신고", "게시물이 신고되었습니다.");
    }, 300);
  };

  const handleSavePress = () => {
    setMenuPost(null);
    setTimeout(() => {
      Alert.alert("저장됨", "게시물이 보관함에 저장되었습니다.");
    }, 300);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.black} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={feeds}
        renderItem={({ item }) => (
          <FeedItem 
            item={item} 
            currentUserId={user?.uid || ""} 
            onLike={() => handleLike(item)}
            onOpenMenu={() => setMenuPost(item)}
            isEditing={editingPostId === item.id}
            onFinishEdit={() => setEditingPostId(null)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFeeds(); }} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: "#999", marginTop: 50 }}>아직 게시물이 없어요.</Text>
            <Text style={{ color: "#999" }}>첫 번째 코디를 공유해보세요!</Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate("CreateFeed" as never)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* --- 하단 팝업 (Bottom Sheet Modal) --- */}
      <Modal
        visible={!!menuPost}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuPost(null)}
      >
        <View style={styles.modalOverlay}>
          {/* 1. 배경 (Backdrop) - 터치 시 닫힘 */}
          <TouchableWithoutFeedback onPress={() => setMenuPost(null)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          {/* 2. 팝업 (Sheet) - 드래그 핸들러 연결 */}
          <Animated.View 
            style={[styles.actionSheetContainer, { transform: [{ translateY: panY }] }]}
            {...panResponder.panHandlers}
          >
            {/* 핸들바 (드래그 영역) */}
            <View style={styles.sheetHandleArea}>
              <View style={styles.sheetHandle} />
            </View>

            {/* --- 메뉴 옵션 --- */}
            <TouchableOpacity style={styles.sheetButton} onPress={handleSavePress}>
              <Ionicons name="bookmark-outline" size={22} color="#000" style={{marginRight: 12}} />
              <Text style={styles.sheetButtonText}>저장</Text>
            </TouchableOpacity>

            <View style={styles.sheetDivider} />

            {menuPost?.userId === user?.uid ? (
              <>
                <TouchableOpacity style={styles.sheetButton} onPress={handleEditPress}>
                  <Ionicons name="create-outline" size={22} color="#000" style={{marginRight: 12}} />
                  <Text style={styles.sheetButtonText}>수정</Text>
                </TouchableOpacity>
                
                <View style={styles.sheetDivider} />
                
                <TouchableOpacity style={styles.sheetButton} onPress={handleDeletePress}>
                  <Ionicons name="trash-outline" size={22} color="#FF3B30" style={{marginRight: 12}} />
                  <Text style={[styles.sheetButtonText, { color: "#FF3B30" }]}>삭제</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.sheetButton} onPress={handleReportPress}>
                <Ionicons name="alert-circle-outline" size={22} color="#FF3B30" style={{marginRight: 12}} />
                <Text style={[styles.sheetButtonText, { color: "#FF3B30" }]}>신고</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 20 }} />
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "white",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 50,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  userName: {
    fontWeight: "600",
    fontSize: 14,
    color: "#262626",
  },
  mainImageContainer: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: "#F5F5F5",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  wardrobeListContainer: {
    paddingVertical: 10,
  },
  wardrobeItemWrapper: {
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  wardrobeThumb: {
    width: 100,
    height: 100,
    backgroundColor: "#f9f9f9",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  countText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    color: "#262626",
  },
  tagContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  tagText: {
    color: "#00376b",
    fontSize: 14,
  },
  dateText: {
    paddingHorizontal: 16,
    color: "#8e8e8e",
    fontSize: 11,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  editInput: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 14,
    minHeight: 60,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelEditText: {
    fontSize: 13,
    color: "#666",
  },
  saveEditText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "bold",
  },

  // --- Bottom Sheet Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  actionSheetContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  sheetHandleArea: {
    width: "100%",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
  },
  sheetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sheetButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  sheetDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 20,
  },
});