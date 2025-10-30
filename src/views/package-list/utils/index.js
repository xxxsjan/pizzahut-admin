export const cleanGroupName = (name) => {
  return (name || "").replace(/\d+/g, "");
};
