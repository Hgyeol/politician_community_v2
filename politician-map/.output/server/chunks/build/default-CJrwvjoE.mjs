import { _ as __nuxt_component_0 } from './nuxt-link-C26fPnf3.mjs';
import { withCtx, createVNode, unref, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import { u as useAuth } from './useAuth-D5BgWjNS.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import '@supabase/ssr';
import './useSupabaseClient-H06rCZGb.mjs';

const _sfc_main = {
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAuthenticated } = useAuth();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><nav class="bg-white border-b border-gray-200 z-50 flex-shrink-0"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center space-x-2 group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="text-2xl"${_scopeId}>🏛️</div><span class="text-xl font-bold text-gray-900"${_scopeId}> 정치인 커뮤니티 </span>`);
          } else {
            return [
              createVNode("div", { class: "text-2xl" }, "🏛️"),
              createVNode("span", { class: "text-xl font-bold text-gray-900" }, " 정치인 커뮤니티 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex items-center space-x-4">`);
      if (!unref(isAuthenticated)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/auth/login",
          class: "px-6 py-2 bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all"
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
      } else {
        _push(`<button class="px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-all"> 로그아웃 </button>`);
      }
      _push(`</div></div></div></nav><main>`);
      ssrRenderSlot(_ctx.$slots, "default", {
        key: _ctx.$route.fullPath
      }, null, _push, _parent);
      _push(`</main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-CJrwvjoE.mjs.map
