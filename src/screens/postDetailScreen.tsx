import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { addComment, getComments, deleteFeedPost } from "../services/feedService";
import { FeedPost, Comment } from "../types/feed";
import { colors } from "../theme/colors";

type ParamList = {
  Detail: { post: FeedPost };
};

export default function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, "Detail">>();
  const { post } = route.params;
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    const data = await getComments(post.id);
    setComments(data);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    setLoading(true);
    try {
      await addComment(post.id, user.uid, user.displayName || "User", newComment);
      setNewComment("");
      loadComments(); // 댓글 목록 갱신
    } catch (error) {
      Alert.alert("오류", "댓글을 등록하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert("게시물 삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFeedPost(post.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert("오류", "삭제 중 문제가 발생했습니다.");
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* 헤더 (뒤로가기 + 삭제버튼) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          {user?.uid === post.userId && (
            <TouchableOpacity onPress={handleDeletePost}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>

        {/* 메인 콘텐츠 */}
        <Image source={{ uri: post.mainImageUrl }} style={styles.mainImage} />
        
        <View style={styles.contentContainer}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.date}>
              {post.createdAt instanceof Date ? post.createdAt.toLocaleDateString() : ""}
            </Text>
          </View>

          <Text style={styles.description}>{post.description}</Text>

          {/* 태그된 옷 목록 */}
          {post.items.length > 0 && (
            <View style={styles.wardrobeSection}>
              <Text style={styles.sectionTitle}>착용 아이템</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {post.items.map((item, idx) => (
                  <View key={idx} style={styles.wardrobeItem}>
                    <Image source={{ uri: item.imageUrl }} style={styles.wardrobeImage} />
                    <Text style={styles.wardrobeName} numberOfLines={1}>{item.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 댓글 목록 */}
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>댓글 {comments.length}개</Text>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text style={styles.commentUser}>{comment.userName}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 댓글 입력창 (하단 고정) */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="댓글 달기..."
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity onPress={handleAddComment} disabled={loading}>
          <Ionicons name="arrow-up-circle" size={32} color={colors.bgPrimary || "#000"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, paddingTop: 50, backgroundColor: "#fff"
  },
  mainImage: { width: "100%", height: 500, resizeMode: "cover" },
  contentContainer: { padding: 20 },
  userInfo: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#eee",
    justifyContent: "center", alignItems: "center", marginRight: 8
  },
  userName: { fontWeight: "bold", fontSize: 15, flex: 1 },
  date: { color: "#888", fontSize: 12 },
  description: { fontSize: 16, lineHeight: 24, color: "#333", marginBottom: 24 },
  
  wardrobeSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#888", marginBottom: 12 },
  wardrobeItem: { marginRight: 12, width: 80, alignItems: "center" },
  wardrobeImage: {
    width: 70, height: 70, borderRadius: 12, backgroundColor: "#f5f5f5", marginBottom: 6
  },
  wardrobeName: { fontSize: 11, color: "#333", width: "100%", textAlign: "center" },

  commentSection: { marginTop: 10 },
  commentItem: { marginBottom: 16 },
  commentUser: { fontWeight: "600", fontSize: 13, marginBottom: 2 },
  commentText: { fontSize: 14, color: "#333" },

  inputContainer: {
    flexDirection: "row", alignItems: "center",
    padding: 16, paddingBottom: 30, borderTopWidth: 1, borderTopColor: "#eee", backgroundColor: "#fff"
  },
  input: {
    flex: 1, backgroundColor: "#f5f5f5", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, marginRight: 10
  },
});