export const clamp = (v: number, a: number, b: number) => (a > v ? a : b < v ? b : v);
export const findParentElementByClass = (ele: HTMLElement, className: string) => {
  let MAX_LOOP = 10;
  let dom = ele;
  while ((!(dom && dom.className && dom.className.length) || !dom.className.includes(className)) && --MAX_LOOP >= 0) {
    dom = dom.parentElement!;
  }
  return dom;
};
