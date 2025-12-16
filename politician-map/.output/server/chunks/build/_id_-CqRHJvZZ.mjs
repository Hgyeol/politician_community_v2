import { _ as __nuxt_component_0 } from './nuxt-link-C26fPnf3.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createTextVNode, toDisplayString, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderList } from 'vue/server-renderer';
import { b as useRoute, u as useRouter, f as useSupabaseUser } from './server.mjs';
import { u as useAuth } from './useAuth-D5BgWjNS.mjs';
import { u as useSuggestions } from './useSuggestions-BK_q9rrp.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-H06rCZGb.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import '@supabase/ssr';

function useComments(suggestionId) {
  const supabase = useSupabaseClient();
  const comments = ref([]);
  const loading = ref(false);
  const loadComments = async () => {
    loading.value = true;
    try {
      const { data: commentData, error: commentError } = await supabase.from("comments").select(`
          *,
          parent_id
        `).eq("suggestion_id", suggestionId).order("created_at", { ascending: true });
      if (commentError) throw commentError;
      if (!commentData) {
        comments.value = [];
        return { data: [], error: null };
      }
      const userIds = [...new Set(commentData.map((c) => c.user_id))];
      const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("id, nickname").in("id", userIds);
      if (profilesError) {
        console.error("Failed to fetch profiles for comments:", profilesError);
      }
      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]));
      const combinedComments = commentData.map((comment) => ({
        ...comment,
        profiles: profilesMap.get(comment.user_id) || null
      }));
      comments.value = combinedComments;
      return { data: combinedComments, error: null };
    } catch (error) {
      console.error("Failed to load comments:", error);
      return { data: null, error: error.message };
    } finally {
      loading.value = false;
    }
  };
  const createComment = async (content, parentId = null) => {
    try {
      const user = useSupabaseUser();
      if (!user.value) {
        throw new Error("로그인이 필요합니다");
      }
      const userId = user.value.id || user.value.sub;
      const { data: newCommentId, error: insertError } = await supabase.from("comments").insert([{
        content,
        suggestion_id: suggestionId,
        user_id: userId,
        parent_id: parentId
        // Add parent_id here
      }]).select("id").single();
      if (insertError) throw insertError;
      if (!newCommentId) throw new Error("Failed to get new comment ID");
      const { data: newCommentData, error: fetchCommentError } = await supabase.from("comments").select("*").eq("id", newCommentId.id).single();
      if (fetchCommentError) throw fetchCommentError;
      if (!newCommentData) throw new Error("Failed to fetch new comment data");
      const { data: profileData, error: profileError } = await supabase.from("profiles").select("id, nickname").eq("id", newCommentData.user_id).single();
      if (profileError) {
        console.error("Failed to fetch profile for new comment:", profileError);
      }
      const combinedNewComment = {
        ...newCommentData,
        profiles: profileData || null
      };
      comments.value.push(combinedNewComment);
      return { data: combinedNewComment, error: null };
    } catch (error) {
      console.error("Failed to create comment:", error);
      return { data: null, error: error.message };
    }
  };
  const updateComment = async (id, content) => {
    try {
      const { data: updatedCommentResult, error: updateError } = await supabase.from("comments").update({ content }).eq("id", id).select("*").single();
      if (updateError) throw updateError;
      if (!updatedCommentResult) throw new Error("Failed to update comment or get updated data");
      const { data: profileData, error: profileError } = await supabase.from("profiles").select("id, nickname").eq("id", updatedCommentResult.user_id).single();
      if (profileError) {
        console.error("Failed to fetch profile for updated comment:", profileError);
      }
      const combinedUpdatedComment = {
        ...updatedCommentResult,
        profiles: profileData || null
      };
      const index = comments.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        comments.value[index] = combinedUpdatedComment;
      }
      return { data: combinedUpdatedComment, error: null };
    } catch (error) {
      console.error("Failed to update comment:", error);
      return { data: null, error: error.message };
    }
  };
  const deleteComment = async (id) => {
    try {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
      comments.value = comments.value.filter((c) => c.id !== id);
      return { error: null };
    } catch (error) {
      console.error("Failed to delete comment:", error);
      return { error: error.message };
    }
  };
  return {
    comments,
    loading,
    loadComments,
    createComment,
    updateComment,
    deleteComment
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const { user, isAuthenticated } = useAuth();
    useSuggestions();
    const suggestionId = parseInt(route.params.id);
    const { comments } = useComments(suggestionId);
    const suggestion = ref(null);
    const loading = ref(true);
    const error = ref("");
    const newComment = ref("");
    const commentSubmitting = ref(false);
    const editingCommentId = ref(null);
    const editingCommentContent = ref("");
    const replyingToCommentId = ref(null);
    const newReplyContent = ref("");
    ref(null);
    const isOwner = computed(() => {
      const userId = user.value?.id || user.value?.sub;
      return user.value && suggestion.value && userId === suggestion.value.user_id;
    });
    const getCommentNickname = (comment) => {
      return comment.profiles?.nickname || "익명";
    };
    const threadedComments = computed(() => {
      const topLevelComments = comments.value.filter((comment) => !comment.parent_id);
      const replies = comments.value.filter((comment) => comment.parent_id);
      const commentsMap = new Map(comments.value.map((comment) => [comment.id, { ...comment, replies: [] }]));
      replies.forEach((reply) => {
        const parent = commentsMap.get(reply.parent_id);
        if (parent) {
          parent.replies.push(reply);
        }
      });
      topLevelComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      commentsMap.forEach((comment) => {
        if (comment.replies) {
          comment.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }
      });
      return topLevelComments.map((comment) => commentsMap.get(comment.id));
    });
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" }, _attrs))}>`);
      if (loading.value) {
        _push(`<div class="text-center py-16"><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div></div>`);
      } else if (error.value) {
        _push(`<div class="text-center py-16"><p class="text-red-600 text-lg mb-4">${ssrInterpolate(error.value)}</p><button class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"> 돌아가기 </button></div>`);
      } else if (suggestion.value) {
        _push(`<div><div class="mb-6"><div class="flex items-center justify-between mb-4"><button class="text-gray-600 hover:text-gray-900 font-medium"> ← 목록으로 </button>`);
        if (isOwner.value) {
          _push(`<div class="flex gap-2"><button class="px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"> 수정 </button><button class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"> 삭제 </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="bg-white border border-gray-200 rounded-lg p-8 mb-6"><div class="mb-4"><span class="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm font-medium">${ssrInterpolate(suggestion.value.category)}</span></div><h1 class="text-3xl font-bold text-gray-900 mb-6">${ssrInterpolate(suggestion.value.title)}</h1><div class="flex items-center justify-between text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200"><div class="flex items-center space-x-4"><span class="font-medium text-gray-700">${ssrInterpolate(suggestion.value.profiles?.nickname || "익명")}</span><span>→</span>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/politicians/${suggestion.value.politician_id}/suggestions`,
          class: "font-medium text-gray-800 hover:text-blue-800"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(suggestion.value.politicians?.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(suggestion.value.politicians?.name), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span>(${ssrInterpolate(suggestion.value.politicians?.region)})</span></div><div class="flex items-center space-x-4"><span>조회 ${ssrInterpolate(suggestion.value.view_count || 0)}</span><span>${ssrInterpolate(formatDate(suggestion.value.created_at))}</span></div></div><div class="prose max-w-none"><p class="text-gray-800 whitespace-pre-wrap leading-relaxed">${ssrInterpolate(suggestion.value.content)}</p></div></div><div class="bg-white border border-gray-200 rounded-lg p-8"><h2 class="text-2xl font-bold text-gray-900 mb-6"> 댓글 ${ssrInterpolate(unref(comments).length)}</h2>`);
        if (unref(isAuthenticated)) {
          _push(`<div class="mb-8"><textarea rows="3" placeholder="새 댓글을 작성하세요" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2">${ssrInterpolate(newComment.value)}</textarea><div class="flex justify-end"><button${ssrIncludeBooleanAttr(!newComment.value.trim() || commentSubmitting.value) ? " disabled" : ""} class="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"> 댓글 작성 </button></div></div>`);
        } else {
          _push(`<div class="mb-8 p-4 bg-gray-50 rounded-lg text-center"><p class="text-gray-600 mb-2">댓글을 작성하려면 로그인이 필요합니다</p>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/auth/login",
            class: "text-gray-800 hover:text-blue-800 font-medium"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` 로그인하기 → `);
              } else {
                return [
                  createTextVNode(" 로그인하기 → ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        }
        _push(`<div class="space-y-4">`);
        if (unref(comments).length > 0) {
          _push(`<!--[-->`);
          ssrRenderList(threadedComments.value, (comment) => {
            _push(`<div class="border-b border-gray-200 pb-4 last:border-0"><div><div><div class="flex justify-between items-start mb-2"><div class="flex items-center space-x-3"><span class="font-medium text-gray-900">${ssrInterpolate(getCommentNickname(comment))}</span><span class="text-sm text-gray-500">${ssrInterpolate(formatDate(comment.created_at))}</span></div><div class="flex gap-2">`);
            if (unref(isAuthenticated)) {
              _push(`<button class="text-sm text-gray-600 hover:text-blue-700"> 답글 </button>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(user) && (unref(user).id || unref(user).sub) === comment.user_id) {
              _push(`<!--[--><button class="text-sm text-gray-800 hover:text-blue-800"> 수정 </button><button class="text-sm text-red-600 hover:text-red-800"> 삭제 </button><!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
            if (editingCommentId.value === comment.id) {
              _push(`<div><textarea rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2">${ssrInterpolate(editingCommentContent.value)}</textarea><div class="flex justify-end gap-2"><button class="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"> 저장 </button><button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"> 취소 </button></div></div>`);
            } else {
              _push(`<p class="text-gray-700 whitespace-pre-wrap">${ssrInterpolate(comment.content)}</p>`);
            }
            if (unref(isAuthenticated) && replyingToCommentId.value === comment.id) {
              _push(`<div class="mt-4"><textarea rows="3" placeholder="답글을 작성하세요" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2">${ssrInterpolate(newReplyContent.value)}</textarea><div class="flex justify-end gap-2"><button${ssrIncludeBooleanAttr(!newReplyContent.value.trim() || commentSubmitting.value) ? " disabled" : ""} class="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"> 답글 작성 </button><button class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"> 취소 </button></div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
            if (comment.replies && comment.replies.length > 0) {
              _push(`<div class="ml-8 mt-4 space-y-4 border-t border-gray-200 pt-4"><!--[-->`);
              ssrRenderList(comment.replies, (reply) => {
                _push(`<div><div class="flex justify-between items-start mb-2"><div class="flex items-center space-x-3"><span class="font-medium text-gray-900">${ssrInterpolate(getCommentNickname(reply))}</span><span class="text-sm text-gray-500">${ssrInterpolate(formatDate(reply.created_at))}</span></div><div class="flex gap-2">`);
                if (unref(user) && (unref(user).id || unref(user).sub) === reply.user_id) {
                  _push(`<!--[--><button class="text-sm text-gray-800 hover:text-blue-800"> 수정 </button><button class="text-sm text-red-600 hover:text-red-800"> 삭제 </button><!--]-->`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</div></div>`);
                if (editingCommentId.value === reply.id) {
                  _push(`<div><textarea rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-2">${ssrInterpolate(editingCommentContent.value)}</textarea><div class="flex justify-end gap-2"><button class="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"> 저장 </button><button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"> 취소 </button></div></div>`);
                } else {
                  _push(`<p class="text-gray-700 whitespace-pre-wrap">${ssrInterpolate(reply.content)}</p>`);
                }
                _push(`</div>`);
              });
              _push(`<!--]--></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]-->`);
        } else {
          _push(`<div class="text-center py-8 text-gray-500"> 아직 댓글이 없습니다. 첫 댓글을 작성해보세요! </div>`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/suggestions/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-CqRHJvZZ.mjs.map
