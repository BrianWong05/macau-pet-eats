import{u as b,a as y,j as e,c as w}from"./index-CCFjVqBI.js";import{g as p,P as g}from"./index-DbodRVV6.js";import{r as z,L as k}from"./react-vendor-7d_4YsRm.js";import{u as L}from"./useFavorites-DuJztAlP.js";import{H as F,t as f,U as v,m as j}from"./ui-vendor-uHOkKSV_.js";const P={sm:16,md:20,lg:24};function $({restaurantId:a,size:x="md",showLabel:u=!1,className:i="",onAuthRequired:l}){const{t:s}=b(["profile","common"]),{user:c}=y(),{isFavorited:d,toggleFavorite:n}=L(),[m,r]=z.useState(!1),t=d(a),o=P[x],N=async h=>{if(h.preventDefault(),h.stopPropagation(),!c){l?l():f.error(s("common:loginRequired"));return}r(!0);try{await n(a),f.success(s(t?"profile:favorites.removed":"profile:favorites.added"))}catch{f.error(s("common:error"))}finally{r(!1)}};return e.jsxs("button",{onClick:N,disabled:m,className:`
        inline-flex items-center gap-1.5 p-2 rounded-full
        transition-all duration-200
        ${t?"bg-red-50 text-red-500 hover:bg-red-100":"bg-neutral-100 text-neutral-400 hover:bg-neutral-200 hover:text-red-400"}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${i}
      `,"aria-label":s(t?"profile:favorites.remove":"profile:favorites.add"),children:[e.jsx(F,{size:o,className:`
          transition-all duration-200
          ${t?"fill-red-500":""}
          ${m?"animate-pulse":""}
        `}),u&&e.jsx("span",{className:"text-sm font-medium pr-1",children:s(t?"profile:favorites.saved":"profile:favorites.save")})]})}function E({restaurant:a,onAuthRequired:x}){const{i18n:u}=b(),i=u.language,{getLocalizedName:l}=w(),{id:s,pet_policy:c,image_url:d}=a,n=p(a,"name",i),m=p(a,"description",i),r=p(a,"address",i),t=p(a,"cuisine_type","en");return e.jsxs("div",{className:"relative group",children:[e.jsxs(k,{to:`/restaurant/${s}`,className:`
          block bg-white rounded-xl sm:rounded-2xl overflow-hidden
          shadow-card card-hover
          focus:outline-none focus:ring-4 focus:ring-primary-200
        `,children:[e.jsxs("div",{className:"flex sm:hidden",children:[e.jsxs("div",{className:"relative w-28 h-28 shrink-0",children:[e.jsx("img",{src:d||"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",alt:n,className:"w-full h-full object-cover"}),e.jsx("div",{className:"absolute bottom-1 right-1",children:e.jsxs("span",{className:`
                inline-flex items-center gap-1 px-1.5 py-0.5
                bg-white/90 backdrop-blur-sm
                text-[10px] font-medium text-neutral-700
                rounded-full
              `,children:[e.jsx(v,{size:10}),t.slice(0,1).map(o=>l(o,i)).join("")]})})]}),e.jsxs("div",{className:"flex-1 p-3 flex flex-col justify-center gap-1",children:[e.jsx("h3",{className:"text-base font-semibold text-neutral-900 line-clamp-1",children:n}),e.jsx(g,{policy:c,size:"sm"}),e.jsxs("div",{className:"flex items-center gap-1 text-neutral-500 text-xs",children:[e.jsx(j,{size:10,className:"shrink-0"}),e.jsx("span",{className:"line-clamp-1",children:r})]})]})]}),e.jsxs("div",{className:"hidden sm:block",children:[e.jsxs("div",{className:"relative aspect-[4/3] overflow-hidden",children:[e.jsx("img",{src:d||"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",alt:n,className:`
                w-full h-full object-cover
                group-hover:scale-105 transition-transform duration-500 ease-out
              `}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"}),e.jsx("div",{className:"absolute top-3 left-3",children:e.jsxs("span",{className:`
                inline-flex items-center gap-1.5 px-3 py-1.5
                bg-white/90 backdrop-blur-sm
                text-sm font-medium text-neutral-700
                rounded-full
              `,children:[e.jsx(v,{size:14}),t.map(o=>l(o,i)).join(", ")]})})]}),e.jsxs("div",{className:"p-5 space-y-3",children:[e.jsx("h3",{className:`
              text-xl font-semibold text-neutral-900
              group-hover:text-primary-600 transition-colors
              line-clamp-1
            `,children:n}),e.jsx(g,{policy:c,size:"sm"}),e.jsx("p",{className:"text-neutral-600 text-sm line-clamp-2 leading-relaxed",children:m}),e.jsxs("div",{className:"flex items-center gap-2 text-neutral-500 text-sm pt-1",children:[e.jsx(j,{size:14,className:"shrink-0"}),e.jsx("span",{className:"line-clamp-1",children:r})]})]})]})]}),e.jsx("div",{className:"absolute top-2 right-2 sm:top-3 sm:right-3 z-10",children:e.jsx($,{restaurantId:s,size:"sm",onAuthRequired:x})})]})}export{E as R};
