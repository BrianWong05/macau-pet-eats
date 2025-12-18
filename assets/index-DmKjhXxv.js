import{u as h,j as s}from"./index-Dm09gJhD.js";import{g as n,P as u}from"./index-D6J1BYw9.js";import{U as g,g as j}from"./ui-vendor-r0va27WY.js";import{L as f}from"./react-vendor-B-2HpIm1.js";function k({restaurant:e}){const{t:r,i18n:a}=h(),i=a.language,{id:o,pet_policy:c,image_url:d}=e,l=n(e,"name",i),m=n(e,"description",i),p=n(e,"address",i),x=n(e,"cuisine_type",i);return s.jsxs(f,{to:`/restaurant/${o}`,className:`
        group block bg-white rounded-2xl overflow-hidden
        shadow-card card-hover
        focus:outline-none focus:ring-4 focus:ring-primary-200
      `,children:[s.jsxs("div",{className:"relative aspect-[4/3] overflow-hidden",children:[s.jsx("img",{src:d||"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",alt:l,className:`
            w-full h-full object-cover
            group-hover:scale-105 transition-transform duration-500 ease-out
          `}),s.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"}),s.jsx("div",{className:"absolute top-3 right-3",children:s.jsxs("span",{className:`
            inline-flex items-center gap-1.5 px-3 py-1.5
            bg-white/90 backdrop-blur-sm
            text-sm font-medium text-neutral-700
            rounded-full
          `,children:[s.jsx(g,{size:14}),x.map(t=>a.exists(`cuisineTypes.${t.toLowerCase()}`)?r(`cuisineTypes.${t.toLowerCase()}`):t).join(", ")]})})]}),s.jsxs("div",{className:"p-5 space-y-3",children:[s.jsx("h3",{className:`
          text-xl font-semibold text-neutral-900
          group-hover:text-primary-600 transition-colors
          line-clamp-1
        `,children:l}),s.jsx(u,{policy:c,size:"sm"}),s.jsx("p",{className:"text-neutral-600 text-sm line-clamp-2 leading-relaxed",children:m}),s.jsxs("div",{className:"flex items-center gap-2 text-neutral-500 text-sm pt-1",children:[s.jsx(j,{size:14,className:"shrink-0"}),s.jsx("span",{className:"line-clamp-1",children:p})]})]})]})}function v(){return s.jsxs("div",{className:"bg-white rounded-2xl overflow-hidden shadow-card",children:[s.jsx("div",{className:"aspect-[4/3] animate-shimmer"}),s.jsxs("div",{className:"p-5 space-y-4",children:[s.jsx("div",{className:"h-6 w-3/4 rounded-lg animate-shimmer"}),s.jsx("div",{className:"h-6 w-1/2 rounded-full animate-shimmer"}),s.jsxs("div",{className:"space-y-2",children:[s.jsx("div",{className:"h-4 w-full rounded animate-shimmer"}),s.jsx("div",{className:"h-4 w-2/3 rounded animate-shimmer"})]}),s.jsxs("div",{className:"flex items-center justify-between pt-2",children:[s.jsx("div",{className:"h-4 w-1/3 rounded animate-shimmer"}),s.jsx("div",{className:"h-4 w-1/4 rounded animate-shimmer"})]})]})]})}function C({count:e=6}){return s.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",children:Array.from({length:e}).map((r,a)=>s.jsx(v,{},a))})}export{k as R,C as S};
