export function useSuggestions() {
  const supabase = useSupabaseClient()
  const suggestions = ref<any[]>([])
  const lastId = ref<number | null>(null)
  const hasMore = ref(true)
  const loading = ref(false)

  // 커서 기반 무한 스크롤로 건의사항 목록 로드
  const loadMore = async (filters: { politician_id?: number; category?: string } = {}) => {
    // 중복 요청 방지
    if (loading.value || !hasMore.value) return

    loading.value = true
    try {
      let query = supabase
        .from('suggestions')
        .select(`
          *,
          profiles:user_id (id, nickname, region),
          politicians:politician_id (id, name, region, party)
        `)
        .order('id', { ascending: false })
        .limit(20)

      // 커서 기반: lastId보다 작은 ID만 조회
      if (lastId.value) {
        query = query.lt('id', lastId.value)
      }

      // 필터 적용
      if (filters.politician_id) {
        query = query.eq('politician_id', filters.politician_id)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      const { data, error } = await query

      if (error) throw error

      if (data && data.length > 0) {
        suggestions.value.push(...data)
        lastId.value = data[data.length - 1].id
        hasMore.value = data.length === 20 // 20개 미만이면 더 이상 없음
      } else {
        hasMore.value = false
      }
    } catch (error: any) {
      console.error('Failed to load suggestions:', error)
    } finally {
      loading.value = false
    }
  }

  // 목록 초기화 (필터 변경 시)
  const reset = () => {
    suggestions.value = []
    lastId.value = null
    hasMore.value = true
  }

  // 건의사항 상세 조회
  const getSuggestion = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select(`
          *,
          profiles:user_id (id, nickname, region),
          politicians:politician_id (id, name, region, party)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // 조회수 증가
      await supabase.rpc('increment_suggestion_view_count', { suggestion_id: id })

      return { data, error: null }
    } catch (error: any) {
      console.error('Failed to get suggestion:', error)
      return { data: null, error: error.message }
    }
  }

  // 건의사항 작성
  const createSuggestion = async (suggestion: {
    title: string
    content: string
    category: string
    politician_id: number
  }) => {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .insert([suggestion])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error('Failed to create suggestion:', error)
      return { data: null, error: error.message }
    }
  }

  // 건의사항 수정
  const updateSuggestion = async (id: number, updates: {
    title?: string
    content?: string
    category?: string
    politician_id?: number
  }) => {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error('Failed to update suggestion:', error)
      return { data: null, error: error.message }
    }
  }

  // 건의사항 삭제
  const deleteSuggestion = async (id: number) => {
    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error('Failed to delete suggestion:', error)
      return { error: error.message }
    }
  }

  return {
    suggestions,
    hasMore,
    loading,
    loadMore,
    reset,
    getSuggestion,
    createSuggestion,
    updateSuggestion,
    deleteSuggestion
  }
}
