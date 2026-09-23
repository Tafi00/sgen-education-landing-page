export const _ = function(s, i, E) {
  return s().catch(e => {
    console.warn("Preload warning:", e);
    return null;
  });
};
