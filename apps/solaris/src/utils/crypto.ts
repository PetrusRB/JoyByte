export const genCharacters = (tamanho: number) => {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const charLength = caracteres.length; // 52
  const maxByte = Math.floor(256 / charLength) * charLength; // 4 * 52 = 208
  let result = "";
  while (result.length < tamanho) {
    const bytes = new Uint8Array(tamanho - result.length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      // Rejeita bytes que causariam viés para garantir uma distribuição uniforme.
      if (byte < maxByte) {
        result += caracteres[byte % charLength];
      }
    }
  }
  return result;
};
