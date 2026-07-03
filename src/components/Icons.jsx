const base = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const Eye = () => (<svg {...base}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></svg>)
export const EyeOff = () => (<svg {...base}><path d="M9.9 4.2A11 11 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.2 3.2M6.6 6.6A18 18 0 0 0 1 12s4 8 11 8a11 11 0 0 0 5.4-1.4" /><path d="m1 1 22 22" /></svg>)
export const ArrowUp = () => (<svg {...base}><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>)
export const ArrowDown = () => (<svg {...base}><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>)
export const Copy = () => (<svg {...base}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>)
export const Trash = () => (<svg {...base}><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>)
export const Target = () => (<svg {...base}><circle cx="12" cy="12" r="8" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>)
export const Upload = () => (<svg {...base}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 9 5-5 5 5" /><path d="M12 4v12" /></svg>)
