import{u as f,c as g,j as s}from"./index-CmKh2cFY.js";import{g as n,P as x}from"./index-C5HAZOLl.js";import{U as h,l as p}from"./ui-vendor-CRea9Wwv.js";import{L as N}from"./react-vendor-B-2HpIm1.js";function z({restaurant:e}){const{i18n:t}=f(),a=t.language,{getLocalizedName:c}=g(),{id:u,pet_policy:r,image_url:d}=e,i=n(e,"name",a),j=n(e,"description",a),m=n(e,"address",a),o=n(e,"cuisine_type","en");return s.jsxs(N,{to:`/restaurant/${u}`,className:`
        group block bg-white rounded-xl sm:rounded-2xl overflow-hidden
        shadow-card card-hover
        focus:outline-none focus:ring-4 focus:ring-primary-200
      `,children:[s.jsxs("div",{className:"flex sm:hidden",children:[s.jsxs("div",{className:"relative w-28 h-28 shrink-0",children:[s.jsx("img",{src:d||"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",alt:i,className:"w-full h-full object-cover"}),s.jsx("div",{className:"absolute bottom-1 right-1",children:s.jsxs("span",{className:`
              inline-flex items-center gap-1 px-1.5 py-0.5
              bg-white/90 backdrop-blur-sm
              text-[10px] font-medium text-neutral-700
              rounded-full
            `,children:[s.jsx(h,{size:10}),o.slice(0,1).map(l=>c(l,a)).join("")]})})]}),s.jsxs("div",{className:"flex-1 p-3 flex flex-col justify-center gap-1",children:[s.jsx("h3",{className:"text-base font-semibold text-neutral-900 line-clamp-1",children:i}),s.jsx(x,{policy:r,size:"sm"}),s.jsxs("div",{className:"flex items-center gap-1 text-neutral-500 text-xs",children:[s.jsx(p,{size:10,className:"shrink-0"}),s.jsx("span",{className:"line-clamp-1",children:m})]})]})]}),s.jsxs("div",{className:"hidden sm:block",children:[s.jsxs("div",{className:"relative aspect-[4/3] overflow-hidden",children:[s.jsx("img",{src:d||"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",alt:i,className:`
              w-full h-full object-cover
              group-hover:scale-105 transition-transform duration-500 ease-out
            `}),s.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"}),s.jsx("div",{className:"absolute top-3 right-3",children:s.jsxs("span",{className:`
              inline-flex items-center gap-1.5 px-3 py-1.5
              bg-white/90 backdrop-blur-sm
              text-sm font-medium text-neutral-700
              rounded-full
            `,children:[s.jsx(h,{size:14}),o.map(l=>c(l,a)).join(", ")]})})]}),s.jsxs("div",{className:"p-5 space-y-3",children:[s.jsx("h3",{className:`
            text-xl font-semibold text-neutral-900
            group-hover:text-primary-600 transition-colors
            line-clamp-1
          `,children:i}),s.jsx(x,{policy:r,size:"sm"}),s.jsx("p",{className:"text-neutral-600 text-sm line-clamp-2 leading-relaxed",children:j}),s.jsxs("div",{className:"flex items-center gap-2 text-neutral-500 text-sm pt-1",children:[s.jsx(p,{size:14,className:"shrink-0"}),s.jsx("span",{className:"line-clamp-1",children:m})]})]})]})]})}function v(){return s.jsxs("div",{className:"bg-white rounded-2xl overflow-hidden shadow-card",children:[s.jsx("div",{className:"aspect-[4/3] animate-shimmer"}),s.jsxs("div",{className:"p-5 space-y-4",children:[s.jsx("div",{className:"h-6 w-3/4 rounded-lg animate-shimmer"}),s.jsx("div",{className:"h-6 w-1/2 rounded-full animate-shimmer"}),s.jsxs("div",{className:"space-y-2",children:[s.jsx("div",{className:"h-4 w-full rounded animate-shimmer"}),s.jsx("div",{className:"h-4 w-2/3 rounded animate-shimmer"})]}),s.jsxs("div",{className:"flex items-center justify-between pt-2",children:[s.jsx("div",{className:"h-4 w-1/3 rounded animate-shimmer"}),s.jsx("div",{className:"h-4 w-1/4 rounded animate-shimmer"})]})]})]})}function C({count:e=6}){return s.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",children:Array.from({length:e}).map((t,a)=>s.jsx(v,{},a))})}export{z as R,C as S};
