export function useAuth() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // 회원가입
  const signUp = async (email: string, password: string, nickname: string, region: string = '') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
            region
          }
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { data: null, error: error.message }
    }
  }

  // 로그인
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { data: null, error: error.message }
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // 로그아웃 후 홈으로 이동
      await navigateTo('/')
      return { error: null }
    } catch (error: any) {
      console.error('Sign out error:', error)
      return { error: error.message }
    }
  }

  // 프로필 정보 가져오기
  const getProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error('Get profile error:', error)
      return { data: null, error: error.message }
    }
  }

  // 프로필 업데이트
  const updateProfile = async (userId: string, updates: { nickname?: string; region?: string }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error('Update profile error:', error)
      return { data: null, error: error.message }
    }
  }

  // 로그인 여부 확인
  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    signUp,
    signIn,
    signOut,
    getProfile,
    updateProfile,
    isAuthenticated
  }
}
