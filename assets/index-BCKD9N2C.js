import{u as h,b as u,j as e}from"./index-D0_Up7zE.js";import{g as n,P as g}from"./index-1tjcqLjQ.js";import{U as j,g as f}from"./ui-vendor-r0va27WY.js";import{L as v}from"./react-vendor-B-2HpIm1.js";function z({restaurant:s}){const{i18n:i}=h(),a=i.language,{getLocalizedName:r}=u(),{id:l,pet_policy:c,image_url:o}=s,t=n(s,"name",a),d=n(s,"description",a),m=n(s,"address",a),p=n(s,"cuisine_type","en");return e.jsxs(v,{to:`/restaurant/${l}`,className:`
        group block bg-white rounded-2xl overflow-hidden
        shadow-card card-hover
        focus:outline-none focus:ring-4 focus:ring-primary-200
      `,children:[e.jsxs("div",{className:"relative aspect-[4/3] overflow-hidden",children:[e.jsx("img",{src:o||"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",alt:t,className:`
            w-full h-full object-cover
            group-hover:scale-105 transition-transform duration-500 ease-out
          `}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"}),e.jsx("div",{className:"absolute top-3 right-3",children:e.jsxs("span",{className:`
            inline-flex items-center gap-1.5 px-3 py-1.5
            bg-white/90 backdrop-blur-sm
            text-sm font-medium text-neutral-700
            rounded-full
          `,children:[e.jsx(j,{size:14}),p.map(x=>r(x,a)).join(", ")]})})]}),e.jsxs("div",{className:"p-5 space-y-3",children:[e.jsx("h3",{className:`
          text-xl font-semibold text-neutral-900
          group-hover:text-primary-600 transition-colors
          line-clamp-1
        `,children:t}),e.jsx(g,{policy:c,size:"sm"}),e.jsx("p",{className:"text-neutral-600 text-sm line-clamp-2 leading-relaxed",children:d}),e.jsxs("div",{className:"flex items-center gap-2 text-neutral-500 text-sm pt-1",children:[e.jsx(f,{size:14,className:"shrink-0"}),e.jsx("span",{className:"line-clamp-1",children:m})]})]})]})}function N(){return e.jsxs("div",{className:"bg-white rounded-2xl overflow-hidden shadow-card",children:[e.jsx("div",{className:"aspect-[4/3] animate-shimmer"}),e.jsxs("div",{className:"p-5 space-y-4",children:[e.jsx("div",{className:"h-6 w-3/4 rounded-lg animate-shimmer"}),e.jsx("div",{className:"h-6 w-1/2 rounded-full animate-shimmer"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("div",{className:"h-4 w-full rounded animate-shimmer"}),e.jsx("div",{className:"h-4 w-2/3 rounded animate-shimmer"})]}),e.jsxs("div",{className:"flex items-center justify-between pt-2",children:[e.jsx("div",{className:"h-4 w-1/3 rounded animate-shimmer"}),e.jsx("div",{className:"h-4 w-1/4 rounded animate-shimmer"})]})]})]})}function C({count:s=6}){return e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",children:Array.from({length:s}).map((i,a)=>e.jsx(N,{},a))})}export{z as R,C as S};
