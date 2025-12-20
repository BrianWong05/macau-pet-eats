import{u as d,d as o,j as n}from"./index-DfEU2ak3.js";import{r as i}from"./react-vendor-7d_4YsRm.js";import{G as m,a3 as f}from"./ui-vendor-f2-SRabJ.js";function h(){const{i18n:t}=d(),[a,r]=i.useState(!1),s=i.useRef(null),l=o.find(e=>e.code===t.language)||o[0];i.useEffect(()=>{function e(c){s.current&&!s.current.contains(c.target)&&r(!1)}return document.addEventListener("mousedown",e),()=>document.removeEventListener("mousedown",e)},[]);const u=e=>{t.changeLanguage(e),r(!1)};return n.jsxs("div",{className:"relative",ref:s,children:[n.jsxs("button",{onClick:()=>r(!a),className:`
          inline-flex items-center gap-2 px-3 py-2
          bg-white/80 hover:bg-white
          border border-neutral-200
          rounded-xl shadow-soft
          text-sm font-medium text-neutral-700
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-300
        `,"aria-label":"Select language",children:[n.jsx(m,{size:16,className:"text-neutral-500"}),n.jsx("span",{children:l.name}),n.jsx(f,{size:14,className:`text-neutral-400 transition-transform ${a?"rotate-180":""}`})]}),a&&n.jsx("div",{className:`
          absolute right-0 mt-2 w-40
          bg-white rounded-xl shadow-elevated
          border border-neutral-100
          py-2 z-50
          animate-fade-in
        `,children:o.map(e=>n.jsx("button",{onClick:()=>u(e.code),className:`
                w-full px-4 py-2.5
                text-left text-sm
                transition-colors
                ${e.code===t.language?"bg-primary-50 text-primary-700 font-medium":"text-neutral-700 hover:bg-neutral-50"}
              `,children:e.name},e.code))})]})}export{h as L};
