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
          politicians!politician_id (id, name, region, party)
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

      const { data: suggestionData, error } = await query

      if (error) throw error

      if (suggestionData && suggestionData.length > 0) {
        // 2. Extract user IDs
        const userIds = [...new Set(suggestionData.map(s => s.user_id))]

        // 3. Fetch corresponding profiles in a single query
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nickname, region')
          .in('id', userIds)

        if (profilesError) {
          console.error('Failed to fetch profiles for list:', profilesError)
        }

        // 4. Create a lookup map for profiles
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]))

        // 5. Combine suggestions with their profiles
        const combinedData = suggestionData.map(suggestion => ({
          ...suggestion,
          profiles: profilesMap.get(suggestion.user_id) || null
        }))

        suggestions.value.push(...combinedData)
        lastId.value = suggestionData[suggestionData.length - 1].id
        hasMore.value = suggestionData.length === 20 // 20개 미만이면 더 이상 없음
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
      // 1. Fetch suggestion and politician data (this join works)
      const { data: suggestionData, error: suggestionError } = await supabase
        .from('suggestions')
        .select(`
          *,
          politicians!politician_id (id, name, region, party)
        `)
        .eq('id', id)
        .single()

      if (suggestionError) throw suggestionError
      if (!suggestionData) return { data: null, error: new Error('Suggestion not found') }

      // 2. Fetch profile data separately
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, nickname, region')
        .eq('id', suggestionData.user_id)
        .single()

      if (profileError) {
        // It's better to log the error but still return the suggestion
        console.error('Failed to fetch profile for suggestion:', profileError)
      }

      // 3. Combine the data
      const combinedData = {
        ...suggestionData,
        profiles: profileData || null
      }

      // 조회수 증가
      await supabase.rpc('increment_suggestion_view_count', { suggestion_id: id })

      return { data: combinedData, error: null }
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
      const user = useSupabaseUser()

      if (!user.value) {
        throw new Error('로그인이 필요합니다')
      }

      // Supabase user 객체에서 ID는 id 또는 sub 필드에 있을 수 있음
      const userId = user.value.id || user.value.sub

      const insertData = {
        ...suggestion,
        user_id: userId
      }

      // 1. 먼저 건의사항을 삽입하고 새로 생성된 id만 가져옵니다.
      const { data: newSuggestion, error: insertError } = await supabase
        .from('suggestions')
        .insert([insertData])
        .select('id')
        .single()

      if (insertError) throw insertError
      if (!newSuggestion) throw new Error('Failed to get new suggestion ID')

      // 2. getSuggestion 함수를 사용해 전체 데이터를 다시 조회합니다.
      // 이 함수는 조인이 정상적으로 작동하는 것으로 확인되었습니다.
      return await getSuggestion(newSuggestion.id)
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
