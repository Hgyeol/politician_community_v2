import { _ as __nuxt_component_0 } from './nuxt-link-C26fPnf3.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { _ as _export_sfc, b as useRoute, u as useRouter } from './server.mjs';
import { u as useAuth } from './useAuth-D5BgWjNS.mjs';
import { u as useSuggestions } from './useSuggestions-BK_q9rrp.mjs';
import { u as usePoliticians } from './usePoliticians-DGzWK1_I.mjs';
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
import './useSupabaseClient-H06rCZGb.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "suggestions",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const { isAuthenticated } = useAuth();
    const { suggestions: suggestions2, hasMore, loading } = useSuggestions();
    usePoliticians();
    const politicianId = parseInt(route.params.id);
    const politician = ref(null);
    const politicianLoading = ref(true);
    ref(null);
    const availableImageExtensions = ["jpg", "png", "gif", "jpeg"];
    const currentImageExtensionIndex = ref(0);
    const politicianImageSrc = computed(() => {
      if (!politician.value) return "";
      const name = politician.value.의원명;
      const ext = availableImageExtensions[currentImageExtensionIndex.value];
      return `/image/${name}.${ext}`;
    });
    const imageFailed = ref(false);
    function formatDate(dateString) {
      const date = new Date(dateString);
      const now = /* @__PURE__ */ new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1e3);
      if (diffInSeconds < 60) return "방금 전";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" }, _attrs))} data-v-2b897f62>`);
      if (politicianLoading.value) {
        _push(`<div class="text-center py-16" data-v-2b897f62><div class="inline-block animate-spin h-12 w-12 border-b-2 border-gray-800" data-v-2b897f62></div></div>`);
      } else if (politician.value) {
        _push(`<div data-v-2b897f62><div class="bg-white border border-gray-200 p-8 mb-8" data-v-2b897f62><div class="flex items-center justify-between" data-v-2b897f62><div class="flex-shrink-0 mx-auto mb-8 w-[200px] h-[240px] overflow-hidden border border-gray-200" data-v-2b897f62>`);
        if (!imageFailed.value) {
          _push(`<img${ssrRenderAttr("src", unref(politicianImageSrc))}${ssrRenderAttr("alt", politician.value.의원명)} class="w-full h-full object-cover" data-v-2b897f62>`);
        } else {
          _push(`<div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm" data-v-2b897f62> 사진 없음 </div>`);
        }
        _push(`</div><div class="flex-1 pl-6" data-v-2b897f62><h2 class="text-3xl font-bold text-gray-900 mb-6" data-v-2b897f62>${ssrInterpolate(politician.value.의원명)} 의원</h2><div class="space-y-2" data-v-2b897f62><div class="flex py-4" data-v-2b897f62><span class="font-semibold text-gray-600 min-w-[100px] text-base" data-v-2b897f62>지역</span><span class="flex-1 text-gray-800 text-base leading-relaxed" data-v-2b897f62>${ssrInterpolate(politician.value.지역)}</span></div><div class="flex py-4" data-v-2b897f62><span class="font-semibold text-gray-600 min-w-[100px] text-base" data-v-2b897f62>정당</span><span class="flex-1 text-gray-800 text-base leading-relaxed" data-v-2b897f62>${ssrInterpolate(politician.value.정당)}</span></div><div class="flex py-4" data-v-2b897f62><span class="font-semibold text-gray-600 min-w-[100px] text-base" data-v-2b897f62>소속위원회</span><span class="flex-1 text-gray-800 text-base leading-relaxed" data-v-2b897f62>${ssrInterpolate(politician.value.소속위원회)}</span></div><div class="flex py-4" data-v-2b897f62><span class="font-semibold text-gray-600 min-w-[100px] text-base" data-v-2b897f62>당선</span><span class="flex-1 text-gray-800 text-base leading-relaxed" data-v-2b897f62>${ssrInterpolate(politician.value.당선횟수)}`);
        if (politician.value.당선방법) {
          _push(`<!--[--> (${ssrInterpolate(politician.value.당선방법)})<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</span></div></div></div></div></div><div class="mb-6 flex justify-between items-center" data-v-2b897f62><button class="text-gray-600 hover:text-gray-900 font-medium" data-v-2b897f62> ← 돌아가기 </button>`);
        if (unref(isAuthenticated)) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/suggestions/new?politician_id=${unref(politicianId)}`,
            class: "px-6 py-3 bg-gray-800 text-white font-medium hover:bg-gray-900 transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` 건의사항 작성 `);
              } else {
                return [
                  createTextVNode(" 건의사항 작성 ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/auth/login",
            class: "px-6 py-3 bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` 로그인하여 작성하기 `);
              } else {
                return [
                  createTextVNode(" 로그인하여 작성하기 ")
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        _push(`</div><div class="space-y-4" data-v-2b897f62><!--[-->`);
        ssrRenderList(unref(suggestions2), (suggestion) => {
          _push(`<div class="bg-white border border-gray-200 p-6 cursor-pointer" data-v-2b897f62><div class="flex justify-between items-start mb-3" data-v-2b897f62><h2 class="text-xl font-semibold text-gray-900 flex-1" data-v-2b897f62>${ssrInterpolate(suggestion.title)}</h2><span class="ml-4 px-3 py-1 bg-gray-50 text-gray-700 text-sm font-medium" data-v-2b897f62>${ssrInterpolate(suggestion.category)}</span></div><p class="text-gray-600 mb-4 line-clamp-2" data-v-2b897f62>${ssrInterpolate(suggestion.content)}</p><div class="flex items-center justify-between text-sm text-gray-500" data-v-2b897f62><div class="flex items-center space-x-4" data-v-2b897f62><span class="font-medium" data-v-2b897f62>${ssrInterpolate(suggestion.profiles?.nickname || "익명")}</span></div><div class="flex items-center space-x-4" data-v-2b897f62><span data-v-2b897f62>조회 ${ssrInterpolate(suggestion.view_count || 0)}</span><span data-v-2b897f62>${ssrInterpolate(formatDate(suggestion.created_at))}</span></div></div></div>`);
        });
        _push(`<!--]-->`);
        if (unref(loading)) {
          _push(`<div class="text-center py-8" data-v-2b897f62><div class="inline-block animate-spin h-8 w-8 border-b-2 border-gray-800" data-v-2b897f62></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(hasMore) && !unref(loading)) {
          _push(`<div class="text-center py-8" data-v-2b897f62><button class="px-6 py-3 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors" data-v-2b897f62> 더 보기 </button></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(loading) && unref(suggestions2).length === 0) {
          _push(`<div class="text-center py-16" data-v-2b897f62><p class="text-gray-500 text-lg" data-v-2b897f62>아직 작성된 건의사항이 없습니다</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<div class="text-center py-16" data-v-2b897f62><p class="text-gray-500 text-lg" data-v-2b897f62>정치인 정보를 찾을 수 없습니다</p></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/politicians/[id]/suggestions.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const suggestions = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2b897f62"]]);

export { suggestions as default };
//# sourceMappingURL=suggestions-C2Nebpjq.mjs.map
