import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { getFeeds, toggleLikePost } from "../services/feedService";
import { FeedPost } from "../types/feed";
import { colors } from "../theme/colors";

// 개별 피드 아이템 컴포넌트
const FeedItem = ({ item, currentUserId, onLike }: { item: FeedPost; currentUserId: string; onLike: () => void }) => {
  const isLiked = item.likes.includes(currentUserId);
  const navigation = useNavigation();

  // 상세 페이지 이동 핸들러
  const handlePress = () => {
    // @ts-ignore (타입 정의가 복잡할 경우 임시로 ignore 사용)
    navigation.navigate("PostDetail", { post: item });
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.card}>
      {/* 1. 헤더: 작성자 정보 */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#666" />
        </View>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.date}>
          {item.createdAt instanceof Date 
            ? item.createdAt.toLocaleDateString() 
            : "방금 전"}
        </Text>
        {/* 내 글일 경우 옵션 아이콘 (추후 기능 확장용) */}
        {currentUserId === item.userId && (
           <Ionicons name="ellipsis-horizontal" size={20} color="#999" style={{marginLeft: "auto"}} />
        )}
      </View>

      {/* 2. 메인 이미지 (꽉 차게 강조) */}
      <View style={styles.mainImageContainer}>
        <Image source={{ uri: item.mainImageUrl }} style={styles.mainImage} />
      </View>

      {/* 3. 하단 액션바 (좋아요, 댓글 아이콘) */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={onLike} style={styles.iconBtn}>
           <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={isLiked ? "#FF3B30" : "#000"} />
           {item.likes.length > 0 && <Text style={styles.countText}>{item.likes.length}</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePress} style={styles.iconBtn}>
           <Ionicons name="chatbubble-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* 4. 본문 요약 (2줄까지만) */}
      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>
          <Text style={{fontWeight: 'bold'}}>{item.userName} </Text>
          {item.description}
        </Text>
      ) : null}
      
      {/* 5. 태그 정보 */}
      <View style={styles.tagContainer}>
          {item.styleTags?.slice(0, 3).map((tag, idx) => (
            <Text key={idx} style={styles.tagText}>#{tag} </Text>
          ))}
      </View>
    </TouchableOpacity>
  );
};

// 메인 화면 컴포넌트
export default function FeedScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [feeds, setFeeds] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchFeeds();
    }, [])
  );

  const handleLike = async (post: FeedPost) => {
    if (!user) return;
    
    // UI 즉시 반영 (낙관적 업데이트)
    const isLiked = post.likes.includes(user.uid);
    const newLikes = isLiked
      ? post.likes.filter((id) => id !== user.uid)
      : [...post.likes, user.uid];

    setFeeds((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, likes: newLikes } : p))
    );

    // 서버 업데이트
    await toggleLikePost(post.id, user.uid, post.likes);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.black} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feeds}
        renderItem={({ item }) => (
          <FeedItem 
            item={item} 
            currentUserId={user?.uid || ""} 
            onLike={() => handleLike(item)} 
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
      
      {/* 글쓰기 버튼 */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate("CreateFeed" as never)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    marginRight: 8,
  },
  date: {
    color: "#8e8e8e",
    fontSize: 12,
  },
  mainImageContainer: {
    width: "100%",
    aspectRatio: 4 / 5, // 인스타그램 비율
    backgroundColor: "#F5F5F5",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
    paddingHorizontal: 16,
    marginBottom: 6,
    fontSize: 14,
    lineHeight: 18,
    color: "#262626",
  },
  tagContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  tagText: {
    color: "#00376b",
    fontSize: 14,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },
});