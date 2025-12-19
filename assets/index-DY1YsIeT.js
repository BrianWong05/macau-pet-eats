import{u as j,a as y,j as e,c as w}from"./index-4AVTqMrf.js";import{g as m,P as h}from"./index-CUr1kYae.js";import{r as z,L as k}from"./react-vendor-7d_4YsRm.js";import{u as L}from"./useFavorites-Xh6cv257.js";import{H as F,t as u,U as g,l as v}from"./ui-vendor-f2-SRabJ.js";const P={sm:16,md:20,lg:24};function $({restaurantId:t,size:p="md",showLabel:i=!1,className:c="",onAuthRequired:l}){const{t:s}=j(["profile","common"]),{user:d}=y(),{isFavorited:n,toggleFavorite:x}=L(),[r,o]=z.useState(!1),a=n(t),b=P[p],N=async f=>{if(f.preventDefault(),f.stopPropagation(),!d){l?l():u.error(s("common:loginRequired"));return}o(!0);try{await x(t),u.success(s(a?"profile:favorites.removed":"profile:favorites.added"))}catch{u.error(s("common:error"))}finally{o(!1)}};return e.jsxs("button",{onClick:N,disabled:r,className:`
        inline-flex items-center gap-1.5 p-2 rounded-full
        transition-all duration-200
        ${a?"bg-red-50 text-red-500 hover:bg-red-100":"bg-neutral-100 text-neutral-400 hover:bg-neutral-200 hover:text-red-400"}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${c}
      `,"aria-label":s(a?"profile:favorites.remove":"profile:favorites.add"),children:[e.jsx(F,{size:b,className:`
          transition-all duration-200
          ${a?"fill-red-500":""}
          ${r?"animate-pulse":""}
        `}),i&&e.jsx("span",{className:"text-sm font-medium pr-1",children:s(a?"profile:favorites.saved":"profile:favorites.save")})]})}function E({restaurant:t}){const{i18n:p}=j(),i=p.language,{getLocalizedName:c}=w(),{id:l,pet_policy:s,image_url:d}=t,n=m(t,"name",i),x=m(t,"description",i),r=m(t,"address",i),o=m(t,"cuisine_type","en");return e.jsxs("div",{className:"relative group",children:[e.jsxs(k,{to:`/restaurant/${l}`,className:`
          block bg-white rounded-xl sm:rounded-2xl overflow-hidden
          shadow-card card-hover
          focus:outline-none focus:ring-4 focus:ring-primary-200
        `,children:[e.jsxs("div",{className:"flex sm:hidden",children:[e.jsxs("div",{className:"relative w-28 h-28 shrink-0",children:[e.jsx("img",{src:d||"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",alt:n,className:"w-full h-full object-cover"}),e.jsx("div",{className:"absolute bottom-1 right-1",children:e.jsxs("span",{className:`
                inline-flex items-center gap-1 px-1.5 py-0.5
                bg-white/90 backdrop-blur-sm
                text-[10px] font-medium text-neutral-700
                rounded-full
              `,children:[e.jsx(g,{size:10}),o.slice(0,1).map(a=>c(a,i)).join("")]})})]}),e.jsxs("div",{className:"flex-1 p-3 flex flex-col justify-center gap-1",children:[e.jsx("h3",{className:"text-base font-semibold text-neutral-900 line-clamp-1",children:n}),e.jsx(h,{policy:s,size:"sm"}),e.jsxs("div",{className:"flex items-center gap-1 text-neutral-500 text-xs",children:[e.jsx(v,{size:10,className:"shrink-0"}),e.jsx("span",{className:"line-clamp-1",children:r})]})]})]}),e.jsxs("div",{className:"hidden sm:block",children:[e.jsxs("div",{className:"relative aspect-[4/3] overflow-hidden",children:[e.jsx("img",{src:d||"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",alt:n,className:`
                w-full h-full object-cover
                group-hover:scale-105 transition-transform duration-500 ease-out
              `}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"}),e.jsx("div",{className:"absolute top-3 left-3",children:e.jsxs("span",{className:`
                inline-flex items-center gap-1.5 px-3 py-1.5
                bg-white/90 backdrop-blur-sm
                text-sm font-medium text-neutral-700
                rounded-full
              `,children:[e.jsx(g,{size:14}),o.map(a=>c(a,i)).join(", ")]})})]}),e.jsxs("div",{className:"p-5 space-y-3",children:[e.jsx("h3",{className:`
              text-xl font-semibold text-neutral-900
              group-hover:text-primary-600 transition-colors
              line-clamp-1
            `,children:n}),e.jsx(h,{policy:s,size:"sm"}),e.jsx("p",{className:"text-neutral-600 text-sm line-clamp-2 leading-relaxed",children:x}),e.jsxs("div",{className:"flex items-center gap-2 text-neutral-500 text-sm pt-1",children:[e.jsx(v,{size:14,className:"shrink-0"}),e.jsx("span",{className:"line-clamp-1",children:r})]})]})]})]}),e.jsx("div",{className:"absolute top-2 right-2 sm:top-3 sm:right-3 z-10",children:e.jsx($,{restaurantId:l,size:"sm"})})]})}export{E as R};
