export function useComments(suggestionId: number) {
  const supabase = useSupabaseClient()
  const comments = ref<any[]>([])
  const loading = ref(false)

  // 댓글 목록 조회
  const loadComments = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (id, nickname)
        `)
        .eq('suggestion_id', suggestionId)
        .order('created_at', { ascending: true })

      if (error) throw error

      comments.value = data || []
      return { data, error: null }
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
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          content,
          suggestion_id: suggestionId
        }])
        .select(`
          *,
          profiles:user_id (id, nickname)
        `)
        .single()

      if (error) throw error

      // 댓글 목록에 추가
      if (data) {
        comments.value.push(data)
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('Failed to create comment:', error)
      return { data: null, error: error.message }
    }
  }

  // 댓글 수정
  const updateComment = async (id: number, content: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', id)
        .select(`
          *,
          profiles:user_id (id, nickname)
        `)
        .single()

      if (error) throw error

      // 댓글 목록 업데이트
      const index = comments.value.findIndex(c => c.id === id)
      if (index !== -1 && data) {
        comments.value[index] = data
      }

      return { data, error: null }
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
