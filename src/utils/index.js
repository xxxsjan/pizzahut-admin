export function generateRandomString() {
  let randomPart = "";
  const characters = "0123456789abcdef";
  for (let i = 0; i < 32; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomPart += characters.charAt(randomIndex);
  }
  return randomPart + "ethirdId";
}
