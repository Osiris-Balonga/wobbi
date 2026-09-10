export const titleCase=(value)=>value.replace(/(^|[- ])\w/g,s=>s.replace('-',' ').toUpperCase());
