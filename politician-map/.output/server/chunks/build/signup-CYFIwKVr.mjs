import { _ as __nuxt_component_0 } from './nuxt-link-C26fPnf3.mjs';
import { ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
import { u as useAuth } from './useAuth-D5BgWjNS.mjs';
import { u as useRouter } from './server.mjs';
import { u as useHead } from './composables-B3WXHrGz.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './useSupabaseClient-H06rCZGb.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import '@supabase/ssr';

const _sfc_main = {
  __name: "signup",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useRouter();
    const form = ref({
      email: "",
      password: "",
      passwordConfirm: "",
      nickname: "",
      region: ""
    });
    const loading = ref(false);
    const error = ref("");
    useHead({
      title: "회원가입 - 정치인 커뮤니티"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-gray-50 p-4" }, _attrs))}><div class="w-full max-w-md"><div class="bg-white rounded-2xl shadow-2xl p-8"><div class="text-center mb-8"><h1 class="text-3xl font-bold text-gray-900 mb-2">회원가입</h1><p class="text-gray-600">정치인 커뮤니티에 가입하세요</p></div><form class="space-y-5"><div><label for="email" class="block text-sm font-semibold text-gray-700 mb-2"> 이메일 </label><input id="email"${ssrRenderAttr("value", unref(form).email)} type="email" required placeholder="example@email.com" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"></div><div><label for="password" class="block text-sm font-semibold text-gray-700 mb-2"> 비밀번호 </label><input id="password"${ssrRenderAttr("value", unref(form).password)} type="password" required placeholder="최소 6자 이상" minlength="6" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"></div><div><label for="passwordConfirm" class="block text-sm font-semibold text-gray-700 mb-2"> 비밀번호 확인 </label><input id="passwordConfirm"${ssrRenderAttr("value", unref(form).passwordConfirm)} type="password" required placeholder="비밀번호를 다시 입력하세요" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"></div><div><label for="nickname" class="block text-sm font-semibold text-gray-700 mb-2"> 닉네임 </label><input id="nickname"${ssrRenderAttr("value", unref(form).nickname)} type="text" required placeholder="닉네임을 입력하세요" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"></div><div><label for="region" class="block text-sm font-semibold text-gray-700 mb-2"> 거주 지역 <span class="text-gray-400 text-xs">(선택)</span></label><input id="region"${ssrRenderAttr("value", unref(form).region)} type="text" placeholder="예: 서울 강남구" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"></div>`);
      if (unref(error)) {
        _push(`<div class="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">${ssrInterpolate(unref(loading) ? "처리 중..." : "회원가입")}</button></form><div class="mt-6 space-y-3 text-center text-sm"><p class="text-gray-600"> 이미 계정이 있으신가요? `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/auth/login",
        class: "text-gray-800 hover:text-gray-900 font-semibold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` 로그인 `);
          } else {
            return [
              createTextVNode(" 로그인 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p><p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "text-gray-600 hover:text-gray-800 font-medium"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` ← 홈으로 돌아가기 `);
          } else {
            return [
              createTextVNode(" ← 홈으로 돌아가기 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div></div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth/signup.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=signup-CYFIwKVr.mjs.map
