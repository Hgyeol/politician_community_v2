<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <button class="modal-close" @click="closeModal">×</button>

          <div v-if="politician" class="modal-content">
            <div class="politician-image">
              <img
                v-if="politicianImage"
                :src="politicianImage"
                :alt="politician.의원명"
                @error="handleImageError"
              >
              <div v-else class="no-image">
                사진 없음
              </div>
            </div>

            <div class="politician-info">
              <h2>{{ politician.의원명 }}</h2>
              <div class="info-row">
                <span class="label">지역</span>
                <span class="value">{{ politician.지역 }}</span>
              </div>
              <div class="info-row">
                <span class="label">정당</span>
                <span class="value">{{ politician.정당 }}</span>
              </div>
              <div class="info-row">
                <span class="label">소속위원회</span>
                <span class="value">{{ politician.소속위원회 }}</span>
              </div>
              <div class="info-row">
                <span class="label">당선</span>
                <span class="value">{{ politician.당선횟수 }} ({{ politician.당선방법 }})</span>
              </div>
            </div>
          </div>

          <div v-else class="modal-content">
            <p class="no-data">선택한 지역의 의원 정보를 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: Boolean,
  politician: Object
})

const emit = defineEmits(['close'])

const politicianImage = ref('')
const imageExtensions = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG', 'gif', 'GIF']

watch(() => props.politician, (newPolitician) => {
  if (newPolitician && newPolitician.의원명) {
    // Try different image extensions
    tryLoadImage(newPolitician.의원명)
  }
}, { immediate: true })

async function tryLoadImage(name) {
  politicianImage.value = ''

  for (const ext of imageExtensions) {
    const imagePath = `/image/${name}.${ext}`
    try {
      const response = await fetch(imagePath, { method: 'HEAD' })
      if (response.ok) {
        politicianImage.value = imagePath
        return
      }
    } catch (error) {
      // Continue to next extension
    }
  }
}

function handleImageError() {
  politicianImage.value = ''
}

function closeModal() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.modal-content {
  padding: 40px;
}

.politician-image {
  width: 200px;
  height: 240px;
  margin: 0 auto 30px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.politician-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.politician-info h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
  color: #1a202c;
}

.info-row {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #4a5568;
  min-width: 120px;
  font-size: 15px;
}

.value {
  flex: 1;
  color: #2d3748;
  font-size: 15px;
  line-height: 1.6;
}

.no-data {
  text-align: center;
  color: #718096;
  font-size: 16px;
  padding: 40px 20px;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

@media (max-width: 640px) {
  .modal-content {
    padding: 24px;
  }

  .politician-image {
    width: 160px;
    height: 192px;
  }

  .politician-info h2 {
    font-size: 24px;
  }

  .info-row {
    flex-direction: column;
    gap: 8px;
  }

  .label {
    min-width: auto;
    font-size: 14px;
  }

  .value {
    font-size: 14px;
  }
}
</style>
