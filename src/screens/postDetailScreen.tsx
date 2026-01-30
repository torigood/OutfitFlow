import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { 
  addComment, 
  getComments, 
  deleteComment, 
  updateComment,
  deleteFeedPost,
  updateFeedPostDescription,
  toggleSaveFeedPost,
  getIsPostSaved
} from "../services/feedService";
import { FeedPost, Comment } from "../types/feed";

type ParamList = {
  PostDetail: {
    post: FeedPost;
  };
};

export default function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, "PostDetail">>();
  const { post: initialPost } = route.params;
  const { user } = useAuth();

  // 게시물 상태
  const [post, setPost] = useState<FeedPost>(initialPost);
  const [isSaved, setIsSaved] = useState(false); // 저장 여부

  // 댓글 및 로딩 상태
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 메뉴(Bottom Sheet) 상태
  const [isMenuVisible, setMenuVisible] = useState(false);
  
  // 수정 관련 상태
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostDescription, setEditPostDescription] = useState(post.description);

  // 댓글 수정 상태
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // --- 드래그 제스처 (Bottom Sheet) ---
  const panY = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      // 터치 시작 시에는 권한을 가져오지 않음 (내부 버튼 클릭 허용)
      onStartShouldSetPanResponder: () => false,
      // 조금이라도 움직이면 드래그로 인식하여 권한 가져옴
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
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

  // 메뉴 열기
  const openMenu = () => {
    panY.setValue(0);
    setMenuVisible(true);
  };

  // 메뉴 닫기 (애니메이션 포함)
  const closeBottomSheet = () => {
    Animated.timing(panY, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  // 초기 데이터 로드 (댓글 + 저장 여부)
  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedComments, savedStatus] = await Promise.all([
          getComments(post.id),
          user ? getIsPostSaved(post.id, user.uid) : Promise.resolve(false)
        ]);
        setComments(fetchedComments);
        setIsSaved(savedStatus);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [post.id, user]);

  // --- 게시물 저장(Save) 핸들러 ---
  const handleSavePress = async () => {
    if (!user) return Alert.alert("로그인 필요", "저장하려면 로그인이 필요합니다.");
    
    // UI 낙관적 업데이트
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);

    try {
      const newStatus = await toggleSaveFeedPost(post, user.uid);
      setIsSaved(newStatus);
    } catch (error) {
      setIsSaved(prevSaved); // 실패 시 롤백
      Alert.alert("오류", "저장에 실패했습니다.");
    }
  };

  // --- 게시물 수정/삭제/신고 ---
  const handleDeletePost = () => {
    setMenuVisible(false);
    Alert.alert("게시물 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFeedPost(post.id);
            navigation.goBack();
          } catch (error) {
            Alert.alert("오류", "게시물 삭제 실패");
          }
        },
      },
    ]);
  };

  const handleUpdatePost = async () => {
    if (!editPostDescription.trim()) return Alert.alert("내용을 입력해주세요.");
    try {
      await updateFeedPostDescription(post.id, editPostDescription);
      setPost({ ...post, description: editPostDescription });
      setIsEditingPost(false);
    } catch (error) {
      Alert.alert("오류", "게시물 수정 실패");
    }
  };

  const handleEditPress = () => {
    setMenuVisible(false);
    setIsEditingPost(true);
    setEditPostDescription(post.description);
  };

  const handleReportPost = () => {
    setMenuVisible(false);
    setTimeout(() => Alert.alert("신고", "게시물이 신고되었습니다."), 300);
  };

  // --- 댓글 작성/수정/삭제 ---
  const handleSendComment = async () => {
    if (!inputText.trim()) return;
    if (!user) return Alert.alert("오류", "로그인이 필요합니다.");

    setSubmitting(true);
    try {
      const newComment = await addComment(post.id, user.uid, user.displayName || "User", inputText);
      setComments((prev) => [...prev, newComment]);
      setInputText("");
    } catch (error) {
      Alert.alert("실패", "댓글 등록 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingText.trim()) return;
    try {
      await updateComment(post.id, commentId, editingText);
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, text: editingText } : c)));
      setEditingCommentId(null);
    } catch (error) {
      Alert.alert("오류", "댓글 수정 실패");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert("삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteComment(post.id, commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
          } catch (error) {
            Alert.alert("오류", "삭제 실패");
          }
        },
      },
    ]);
  };

  // --- 렌더링 ---
  const renderHeader = () => (
    <View style={styles.postContainer}>
      <View style={styles.userInfoHeader}>
        <View style={styles.userInfoLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#666" />
          </View>
          <Text style={styles.userName}>{post.userName}</Text>
        </View>
        
        {/* 메뉴 버튼 */}
        <TouchableOpacity onPress={openMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* 이미지 */}
      {post.mainImageUrl ? (
        <Image source={{ uri: post.mainImageUrl }} style={styles.postImage} />
      ) : null}

      {/* 옷장 아이템 */}
      {(!post.mainImageUrl && post.items && post.items.length > 0) && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeList}>
          {post.items.map((item, index) => (
             <View key={index} style={styles.wardrobeItem}>
               <Image source={{ uri: item.imageUrl }} style={styles.wardrobeImage} />
             </View>
          ))}
        </ScrollView>
      )}

      {/* 본문 & 태그 */}
      <View style={styles.contentSection}>
        {isEditingPost ? (
           <View style={{ marginBottom: 16 }}>
             <TextInput
               style={styles.editInput}
               value={editPostDescription}
               onChangeText={setEditPostDescription}
               multiline
               autoFocus
             />
             <View style={styles.editActions}>
               <TouchableOpacity onPress={() => setIsEditingPost(false)}>
                 <Text style={styles.cancelEditText}>취소</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={handleUpdatePost}>
                 <Text style={styles.saveEditText}>저장</Text>
               </TouchableOpacity>
             </View>
           </View>
        ) : (
           post.description ? <Text style={styles.description}>{post.description}</Text> : null
        )}

        <View style={styles.tagContainer}>
          {post.styleTags?.map((tag, idx) => (
            <Text key={idx} style={styles.tagText}>#{tag} </Text>
          ))}
        </View>
        <Text style={styles.date}>
          {post.createdAt instanceof Date ? post.createdAt.toLocaleDateString() : "최근"}
        </Text>
      </View>
      
      <View style={styles.divider}>
        <Text style={styles.commentCount}>댓글 {comments.length}개</Text>
      </View>
    </View>
  );

  const renderCommentItem = ({ item }: { item: Comment }) => {
    const isEditing = editingCommentId === item.id;
    const isMyComment = item.userId === user?.uid;

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentAvatar}>
          <Ionicons name="person" size={12} color="#fff" />
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentRow}>
            <Text style={styles.commentUser}>{item.userName}</Text>
            {/* 본인 댓글일 때만 수정/삭제 버튼 노출 (작게) */}
            {isMyComment && !isEditing && (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => { setEditingCommentId(item.id); setEditingText(item.text); }}>
                  <Text style={styles.miniActionText}>수정</Text>
                </TouchableOpacity>
                <Text style={styles.miniActionDivider}>|</Text>
                <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                  <Text style={[styles.miniActionText, { color: '#FF3B30' }]}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEditing ? (
            <View>
              <TextInput
                style={styles.editInput}
                value={editingText}
                onChangeText={setEditingText}
                autoFocus
                multiline
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => setEditingCommentId(null)}>
                  <Text style={styles.cancelEditText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleUpdateComment(item.id)}>
                  <Text style={styles.saveEditText}>저장</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.commentText}>{item.text}</Text>
              <Text style={styles.commentDate}>방금 전</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시물</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={comments}
        renderItem={renderCommentItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>첫 번째 댓글을 남겨보세요!</Text> : null
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={styles.inputWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="댓글 달기..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSendComment} 
            disabled={submitting || !inputText.trim()}
            style={styles.sendButton}
          >
             {submitting ? <ActivityIndicator size="small" color="#007AFF" /> : 
               <Ionicons name="arrow-up-circle" size={32} color={inputText.trim() ? "#007AFF" : "#ccc"} />
             }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* --- Bottom Sheet Modal --- */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeBottomSheet}
      >
        <View style={styles.modalOverlay}>
          {/* 1. 배경 (Backdrop) - 터치 시 닫힘 */}
          <TouchableWithoutFeedback onPress={closeBottomSheet}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          {/* 2. 팝업 (Sheet) - 드래그 핸들러 연결 */}
          <Animated.View 
            style={[styles.actionSheetContainer, { transform: [{ translateY: panY }] }]}
            {...panResponder.panHandlers}
          >
            <View style={styles.sheetHandleArea}>
              <View style={styles.sheetHandle} />
            </View>

            {/* 저장 버튼 */}
            <TouchableOpacity style={styles.sheetButton} onPress={handleSavePress}>
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={22} 
                color={isSaved ? "#007AFF" : "#000"} 
                style={{marginRight: 12}} 
              />
              <Text style={[styles.sheetButtonText, isSaved && { color: "#007AFF", fontWeight: "600" }]}>
                {isSaved ? "저장됨 (취소하려면 터치)" : "저장"}
              </Text>
            </TouchableOpacity>

            <View style={styles.sheetDivider} />

            {post.userId === user?.uid ? (
              <>
                <TouchableOpacity style={styles.sheetButton} onPress={handleEditPress}>
                  <Ionicons name="create-outline" size={22} color="#000" style={{marginRight: 12}} />
                  <Text style={styles.sheetButtonText}>수정</Text>
                </TouchableOpacity>
                <View style={styles.sheetDivider} />
                <TouchableOpacity style={styles.sheetButton} onPress={handleDeletePost}>
                  <Ionicons name="trash-outline" size={22} color="#FF3B30" style={{marginRight: 12}} />
                  <Text style={[styles.sheetButtonText, { color: "#FF3B30" }]}>삭제</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.sheetButton} onPress={handleReportPost}>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  postContainer: {
    paddingBottom: 20,
  },
  userInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  userInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  postImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: "#f5f5f5",
  },
  wardrobeList: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  wardrobeItem: {
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  wardrobeImage: {
    width: 80,
    height: 80,
  },
  contentSection: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  tagText: {
    color: "#00376b",
    marginRight: 6,
  },
  date: {
    color: "#999",
    fontSize: 12,
  },
  divider: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fafafa",
  },
  commentCount: {
    fontWeight: "600",
    fontSize: 14,
  },
  commentItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUser: {
    fontWeight: "600",
    fontSize: 13,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  commentDate: {
    fontSize: 11,
    color: "#999",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    marginLeft: 10,
    padding: 4,
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
  miniActionText: {
    fontSize: 11,
    color: "#999",
    marginLeft: 8,
  },
  miniActionDivider: {
    fontSize: 11,
    color: "#ddd",
    marginHorizontal: 4,
  },

  // Bottom Sheet Modal Styles
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