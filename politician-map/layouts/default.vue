<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation Bar -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center space-x-2 group">
            <div class="text-2xl">🏛️</div>
            <span class="text-xl font-bold text-gray-900">
              정치인 커뮤니티
            </span>
          </NuxtLink>

          <!-- Navigation Links -->
          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/suggestions"
              class="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-all"
            >
              건의사항 목록
            </NuxtLink>

            <NuxtLink
              v-if="!isAuthenticated"
              to="/auth/login"
              class="px-6 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all"
            >
              로그인
            </NuxtLink>

            <div v-else class="flex items-center space-x-3">
              <NuxtLink
                v-if="user"
                to="/profile"
                class="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-all"
              >
                {{ user.email }}
              </NuxtLink>
              <button
                @click="handleSignOut"
                class="px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-all"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-600">
          <p class="mb-2">정치인 커뮤니티 - 시민 참여형 건의사항 플랫폼</p>
          <p class="text-sm text-gray-500">Made with Nuxt.js & Supabase</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const { isAuthenticated, user, signOut } = useAuth()
const router = useRouter()

const handleSignOut = async () => {
  await signOut()
  router.push('/')
}
</script>
