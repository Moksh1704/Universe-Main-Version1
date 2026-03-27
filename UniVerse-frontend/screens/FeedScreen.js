import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, KeyboardAvoidingView, Platform, StatusBar, ScrollView, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/api';
import { MOCK_STUDENT } from '../data/mockData';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

// ─── Comment Bottom Sheet ─────────────────────────────────────────────────────
const CommentsModal = ({ visible, post, comments, onClose, onAddComment }) => {
  const [text, setText] = useState('');
  const user = MOCK_STUDENT;

  const submit = () => {
    if (!text.trim()) return;
    onAddComment(post?.id, text.trim());
    setText('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={cm.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={cm.header}>
          <Text style={cm.headerTitle}>Comments</Text>
          <TouchableOpacity onPress={onClose} style={cm.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Original post preview */}
        {post && (
          <View style={cm.originalPost}>
            <Text style={cm.originalAuthor}>{post.userName || post.user_name}</Text>
            <Text style={cm.originalText} numberOfLines={2}>{post.content || post.text}</Text>
          </View>
        )}

        {/* Comments list */}
        <ScrollView
          style={cm.list}
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {comments.length === 0 ? (
            <View style={cm.empty}>
              <Ionicons name="chatbubbles-outline" size={40} color={COLORS.textMuted} />
              <Text style={cm.emptyText}>No comments yet. Be the first!</Text>
            </View>
          ) : comments.map(c => (
            <View key={c.id} style={cm.comment}>
              <View style={cm.commentAvatar}>
                <Text style={cm.commentAvatarTxt}>{(c.author || c.user_name || 'U')[0]}</Text>
              </View>
              <View style={cm.commentBody}>
                <View style={cm.commentHead}>
                  <Text style={cm.commentAuthor}>{c.author || c.user_name}</Text>
                  <Text style={cm.commentTime}>{c.time || c.created_at || ''}</Text>
                </View>
                <Text style={cm.commentText}>{c.text || c.content}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={cm.inputRow}>
          <View style={cm.inputAvatar}>
            <Text style={cm.inputAvatarTxt}>{user.name[0]}</Text>
          </View>
          <TextInput
            style={cm.input}
            value={text}
            onChangeText={setText}
            placeholder="Add a comment..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
          <TouchableOpacity
            style={[cm.sendBtn, !text.trim() && { opacity: 0.4 }]}
            onPress={submit}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const cm = StyleSheet.create({
  container:         { flex: 1, backgroundColor: COLORS.bgLight },
  header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  headerTitle:       { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary },
  closeBtn:          { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center' },
  originalPost:      { padding: SPACING.md, backgroundColor: COLORS.primary + '08', borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  originalAuthor:    { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary, marginBottom: 3 },
  originalText:      { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  list:              { flex: 1 },
  empty:             { alignItems: 'center', paddingTop: 40, gap: SPACING.sm },
  emptyText:         { fontSize: FONTS.sizes.md, color: COLORS.textMuted },
  comment:           { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  commentAvatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  commentAvatarTxt:  { color: COLORS.secondary, fontWeight: '700', fontSize: FONTS.sizes.sm },
  commentBody:       { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.cardBorder },
  commentHead:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  commentAuthor:     { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },
  commentTime:       { fontSize: 10, color: COLORS.textMuted },
  commentText:       { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 19 },
  inputRow:          { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm, padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.cardBorder, backgroundColor: COLORS.cardBg },
  inputAvatar:       { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  inputAvatarTxt:    { color: COLORS.secondary, fontWeight: '700', fontSize: FONTS.sizes.sm },
  input:             { flex: 1, backgroundColor: COLORS.bgLight, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.cardBorder, paddingHorizontal: SPACING.md, paddingVertical: 10, fontSize: FONTS.sizes.sm, color: COLORS.textPrimary, maxHeight: 90 },
  sendBtn:           { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});

// ─── Post Card ────────────────────────────────────────────────────────────────
const PostCard = ({ post, onDelete, onComment, onRepost, onLike }) => {
  const [liked, setLiked]       = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const userName    = post.userName || post.user_name || 'Unknown';
  const userRole    = post.userRole || post.role || 'Student';
  const timePosted  = post.timePosted || post.created_at || '';
  const body        = post.content || post.text || '';
  const commentCount = post.commentCount ?? post.comments ?? post.comment_count ?? 0;
  const repostCount  = post.repostCount  ?? post.reposts  ?? post.repost_count  ?? 0;
  const initials    = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isRepost    = !!post.repostedBy;

  const handleLike = async () => {
    try {
      await apiRequest(`/posts/${post.id}/like`, 'POST');
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
      onLike && onLike(post.id, !liked);
    } catch (err) {
      console.log('Like error:', err);
    }
  };

  return (
    <View style={[s.card, isRepost && s.repostCard]}>
      {/* Repost indicator */}
      {isRepost && (
        <View style={s.repostBanner}>
          <Ionicons name="repeat" size={13} color={COLORS.primary} />
          <Text style={s.repostBannerTxt}>{post.repostedBy} reposted</Text>
        </View>
      )}

      {/* Post header */}
      <View style={s.postHead}>
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.postName}>{userName}</Text>
          <Text style={s.postMeta}>{userRole} · {timePosted}</Text>
        </View>
        {post.isOwn && (
          <TouchableOpacity
            onPress={() => onDelete(post.id)}
            style={s.delBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={17} color={COLORS.danger} />
          </TouchableOpacity>
        )}
      </View>

      {/* Body */}
      <Text style={s.postBody}>{body}</Text>

      {/* Actions */}
      <View style={s.actions}>
        {/* Like */}
        <TouchableOpacity
          style={s.actionBtn}
          onPress={handleLike}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? COLORS.danger : COLORS.textSecondary}
          />
          <Text style={[s.actionTxt, liked && { color: COLORS.danger }]}>{likeCount}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => onComment(post)}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
          <Text style={s.actionTxt}>{commentCount}</Text>
        </TouchableOpacity>

        {/* Repost */}
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => onRepost(post)}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Ionicons
            name="repeat"
            size={20}
            color={post.repostedByMe ? COLORS.success : COLORS.textSecondary}
          />
          <Text style={[s.actionTxt, post.repostedByMe && { color: COLORS.success }]}>{repostCount}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          style={s.actionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Ionicons name="share-social-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Feed Screen ─────────────────────────────────────────────────────────
export default function FeedScreen() {
  const user = MOCK_STUDENT;

  const [posts, setPosts]               = useState([]);
  const [allComments, setAllComments]   = useState({});
  const [loading, setLoading]           = useState(true);

  // New post modal
  const [newPostModal, setNewPostModal] = useState(false);
  const [newPostText, setNewPostText]   = useState('');

  // Comment modal
  const [commentModal, setCommentModal] = useState(false);
  const [activePost, setActivePost]     = useState(null);

  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // ── Fetch posts from backend ────────────────────────────────────────────────
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await apiRequest('/posts');
        const raw = data.posts || data.data || data;
        // Normalise to the shape the rest of the screen expects
        const normalised = (Array.isArray(raw) ? raw : []).map(p => ({
          ...p,
          userName:      p.userName    || p.user_name    || 'Unknown',
          userRole:      p.userRole    || p.role         || 'Student',
          timePosted:    p.timePosted  || p.created_at   || '',
          content:       p.content     || p.text         || '',
          likes:         p.likes       ?? 0,
          commentCount:  p.commentCount ?? p.comments ?? p.comment_count ?? 0,
          repostCount:   p.repostCount  ?? p.reposts  ?? p.repost_count  ?? 0,
          isLiked:       p.isLiked      ?? false,
          repostedByMe:  p.repostedByMe ?? false,
          isOwn:         p.isOwn        ?? false,
        }));
        setPosts(normalised);
        // Initialise empty comment buckets for each post
        const buckets = {};
        normalised.forEach(p => { buckets[p.id] = []; });
        setAllComments(buckets);
      } catch (err) {
        console.log('Fetch posts error:', err);
        Alert.alert('Error', 'Could not load posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDelete = id => {
    Alert.alert('Delete Post', 'Remove this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/posts/${id}`, 'DELETE');
          } catch (err) {
            console.log('Delete error:', err);
          }
          setPosts(prev => prev.filter(p => p.id !== id));
        },
      },
    ]);
  };

  const handlePost = async () => {
    if (!newPostText.trim()) return;
    try {
      const res = await apiRequest('/posts', 'POST', { content: newPostText.trim() });
      const created = res.post || res.data || res;
      const newPost = {
        id:           created.id          || Date.now().toString(),
        userName:     created.userName    || created.user_name    || user.name,
        userRole:     created.userRole    || created.role         || 'Student',
        timePosted:   created.timePosted  || created.created_at   || 'Just now',
        content:      created.content     || created.text         || newPostText.trim(),
        likes:        0,
        commentCount: 0,
        repostCount:  0,
        isLiked:      false,
        repostedByMe: false,
        isOwn:        true,
      };
      setPosts(prev => [newPost, ...prev]);
      setAllComments(prev => ({ ...prev, [newPost.id]: [] }));
    } catch (err) {
      console.log('Post error:', err);
      // Optimistic fallback — add locally even if API fails
      const newPost = {
        id:           Date.now().toString(),
        userName:     user.name,
        userRole:     'Student',
        timePosted:   'Just now',
        content:      newPostText.trim(),
        likes:        0,
        commentCount: 0,
        repostCount:  0,
        isLiked:      false,
        repostedByMe: false,
        isOwn:        true,
      };
      setPosts(prev => [newPost, ...prev]);
      setAllComments(prev => ({ ...prev, [newPost.id]: [] }));
    }
    setNewPostText('');
    setNewPostModal(false);
  };

  const handleComment = (post) => {
    setActivePost(post);
    setCommentModal(true);
  };

  const handleAddComment = async (postId, text) => {
    try {
      const res = await apiRequest(`/posts/${postId}/comment`, 'POST', { content: text });
      const created = res.comment || res.data || {};
      const newComment = {
        id:     created.id        || Date.now().toString(),
        author: created.author    || created.user_name || user.name,
        text:   created.text      || created.content   || text,
        time:   created.time      || created.created_at || 'Just now',
      };
      setAllComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
    } catch (err) {
      console.log('Comment error:', err);
      // Optimistic fallback
      const newComment = {
        id:     Date.now().toString(),
        author: user.name,
        text,
        time:   'Just now',
      };
      setAllComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
    }
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, commentCount: (p.commentCount ?? 0) + 1 } : p
    ));
  };

  const handleRepost = async (post) => {
    if (post.isOwn) {
      Alert.alert('Cannot Repost', 'You cannot repost your own post.');
      return;
    }
    if (post.repostedByMe) {
      // Undo repost
      try { await apiRequest(`/posts/${post.id}/repost`, 'DELETE'); } catch (e) { console.log(e); }
      setPosts(prev =>
        prev
          .filter(p => !(p.repostId === post.id))
          .map(p => p.id === post.id
            ? { ...p, repostedByMe: false, repostCount: p.repostCount - 1 }
            : p
          )
      );
    } else {
      // Add repost
      try { await apiRequest(`/posts/${post.id}/repost`, 'POST'); } catch (e) { console.log(e); }
      const repostEntry = {
        ...post,
        id:           `rp_${post.id}_${Date.now()}`,
        repostId:     post.id,
        repostedBy:   user.name,
        repostedByMe: false,
        timePosted:   'Just now',
        isOwn:        false,
      };
      setPosts(prev => [
        repostEntry,
        ...prev.map(p =>
          p.id === post.id
            ? { ...p, repostedByMe: true, repostCount: p.repostCount + 1 }
            : p
        ),
      ]);
      Alert.alert('Reposted!', `You reposted ${post.userName}'s post.`);
    }
  };

  const activeComments = activePost ? (allComments[activePost.id] || []) : [];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={[COLORS.primary, COLORS.primaryMid]} style={s.header}>
        <Text style={s.headerTitle}>Campus Feed</Text>
        <Text style={s.headerSub}>Share updates with your campus community</Text>
      </LinearGradient>

      {loading ? (
        <View style={s.loadingWrap}>
          <Text style={s.loadingTxt}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={i => i.id.toString()}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onDelete={handleDelete}
              onComment={handleComment}
              onRepost={handleRepost}
            />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={s.emptyFeed}>No posts yet. Be the first to post!</Text>
          }
        />
      )}

      {/* FAB — new post */}
      <TouchableOpacity style={s.fab} onPress={() => setNewPostModal(true)} activeOpacity={0.88}>
        <LinearGradient colors={[COLORS.accent, COLORS.accentDark]} style={s.fabGrad}>
          <Ionicons name="add" size={28} color={COLORS.primary} />
        </LinearGradient>
      </TouchableOpacity>

      {/* New Post Modal */}
      <Modal visible={newPostModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={s.modal} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalHead}>
            <TouchableOpacity onPress={() => setNewPostModal(false)}>
              <Text style={s.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.modalTitle}>New Post</Text>
            <TouchableOpacity
              onPress={handlePost}
              style={[s.postBtn, !newPostText.trim() && { opacity: 0.5 }]}
              disabled={!newPostText.trim()}
            >
              <Text style={s.postBtnTxt}>Post</Text>
            </TouchableOpacity>
          </View>
          <View style={s.modalBody}>
            <View style={s.modalAvatar}>
              <Text style={s.modalAvatarTxt}>{initials}</Text>
            </View>
            <TextInput
              style={s.postInput}
              multiline
              placeholder="What's happening on campus?"
              placeholderTextColor={COLORS.textMuted}
              value={newPostText}
              onChangeText={setNewPostText}
              autoFocus
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Comments Modal */}
      <CommentsModal
        visible={commentModal}
        post={activePost}
        comments={activeComments}
        onClose={() => { setCommentModal(false); setActivePost(null); }}
        onAddComment={handleAddComment}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.bgLight },
  header:      { paddingTop: 62, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  headerTitle: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.secondary },
  headerSub:   { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  list:        { padding: SPACING.md, paddingBottom: 110 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingTxt:  { fontSize: FONTS.sizes.md, color: COLORS.textMuted },
  emptyFeed:   { textAlign: 'center', color: COLORS.textMuted, paddingTop: 40, fontSize: FONTS.sizes.md },

  // Cards
  card:             { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
  repostCard:       { borderColor: COLORS.primary + '40', borderWidth: 1.5 },
  repostBanner:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: SPACING.sm, paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  repostBannerTxt:  { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '700' },

  postHead:   { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  avatar:     { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  avatarTxt:  { color: COLORS.secondary, fontWeight: '700', fontSize: FONTS.sizes.md },
  postName:   { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  postMeta:   { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  delBtn:     { padding: 4 },
  postBody:   { fontSize: FONTS.sizes.md, color: COLORS.textPrimary, lineHeight: 22, marginBottom: SPACING.md },

  actions:    { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.cardBorder, paddingTop: SPACING.sm, gap: SPACING.lg },
  actionBtn:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 2 },
  actionTxt:  { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },

  // FAB
  fab:     { position: 'absolute', bottom: 100, right: SPACING.lg, borderRadius: 28, overflow: 'hidden', ...SHADOWS.button },
  fabGrad: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },

  // New post modal
  modal:          { flex: 1, backgroundColor: COLORS.cardBg },
  modalHead:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  modalCancel:    { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  modalTitle:     { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  postBtn:        { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8 },
  postBtnTxt:     { color: COLORS.secondary, fontWeight: '700', fontSize: FONTS.sizes.sm },
  modalBody:      { flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm },
  modalAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  modalAvatarTxt: { color: COLORS.secondary, fontWeight: '700', fontSize: FONTS.sizes.md },
  postInput:      { flex: 1, fontSize: FONTS.sizes.lg, color: COLORS.textPrimary, minHeight: 120, textAlignVertical: 'top' },
});