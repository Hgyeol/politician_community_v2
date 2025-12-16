export function useComments(suggestionId: number) {
  const supabase = useSupabaseClient()
  const comments = ref<any[]>([])
  const loading = ref(false)

  // 댓글 목록 조회
  const loadComments = async () => {
    loading.value = true
    try {
      // 1. Fetch comments without profiles join
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .select(`
          *
        `)
        .eq('suggestion_id', suggestionId)
        .order('created_at', { ascending: true })

      if (commentError) throw commentError;
      if (!commentData) {
        comments.value = [];
        return { data: [], error: null };
      }

      // 2. Extract unique user IDs
      const userIds = [...new Set(commentData.map(c => c.user_id))];

      // 3. Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nickname')
        .in('id', userIds);

      if (profilesError) {
        console.error('Failed to fetch profiles for comments:', profilesError);
      }

      // 4. Create a map for quick profile lookup
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

      // 5. Combine comments with their profiles
      const combinedComments = commentData.map(comment => ({
        ...comment,
        profiles: profilesMap.get(comment.user_id) || null
      }));

      comments.value = combinedComments;
      return { data: combinedComments, error: null }
    } catch (error: any) {
      console.error('Failed to load comments:', error)
      return { data: null, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 댓글 작성
  const createComment = async (content: string) => {
    try {
      const user = useSupabaseUser()
      if (!user.value) {
        throw new Error('로그인이 필요합니다')
      }

      // Supabase user 객체에서 ID는 id 또는 sub 필드에 있을 수 있음
      const userId = user.value.id || user.value.sub

      // 1. Insert the comment and get its ID
      const { data: newCommentId, error: insertError } = await supabase
        .from('comments')
        .insert([{
          content,
          suggestion_id: suggestionId,
          user_id: userId
        }])
        .select('id')
        .single()

      if (insertError) throw insertError
      if (!newCommentId) throw new Error('Failed to get new comment ID')

      // 2. Fetch the newly created comment
      const { data: newCommentData, error: fetchCommentError } = await supabase
        .from('comments')
        .select('*')
        .eq('id', newCommentId.id)
        .single()

      if (fetchCommentError) throw fetchCommentError
      if (!newCommentData) throw new Error('Failed to fetch new comment data')

      // 3. Fetch the profile for the new comment's user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, nickname')
        .eq('id', newCommentData.user_id)
        .single()

      if (profileError) {
        console.error('Failed to fetch profile for new comment:', profileError)
      }

      // 4. Combine the data
      const combinedNewComment = {
        ...newCommentData,
        profiles: profileData || null
      }

      // 댓글 목록에 추가
      comments.value.push(combinedNewComment)

      return { data: combinedNewComment, error: null }
    } catch (error: any) {
      console.error('Failed to create comment:', error)
      return { data: null, error: error.message }
    }
  }

  // 댓글 수정
  const updateComment = async (id: number, content: string) => {
    try {
      // 1. Update the comment content
      const { data: updatedCommentResult, error: updateError } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', id)
        .select('*') // Select only the updated comment data
        .single()

      if (updateError) throw updateError
      if (!updatedCommentResult) throw new Error('Failed to update comment or get updated data')

      // 2. Fetch the profile for the updated comment's user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, nickname')
        .eq('id', updatedCommentResult.user_id)
        .single()

      if (profileError) {
        console.error('Failed to fetch profile for updated comment:', profileError)
      }

      // 3. Combine the data
      const combinedUpdatedComment = {
        ...updatedCommentResult,
        profiles: profileData || null
      }

      // 댓글 목록 업데이트
      const index = comments.value.findIndex(c => c.id === id)
      if (index !== -1) {
        comments.value[index] = combinedUpdatedComment
      }

      return { data: combinedUpdatedComment, error: null }
    } catch (error: any) {
      console.error('Failed to update comment:', error)
      return { data: null, error: error.message }
    }
  }

  // 댓글 삭제
  const deleteComment = async (id: number) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)

      if (error) throw error

      // 댓글 목록에서 제거
      comments.value = comments.value.filter(c => c.id !== id)

      return { error: null }
    } catch (error: any) {
      console.error('Failed to delete comment:', error)
      return { error: error.message }
    }
  }

  return {
    comments,
    loading,
    loadComments,
    createComment,
    updateComment,
    deleteComment
  }
}
