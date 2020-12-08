export const readingTime = (text) => {
  const wordsPerMinute = 200; // Average case.
  let result = "";

  let textLength = length.split(" ").length; // Split by words
  if (textLength > 0) {
    let value = Math.ceil(textLength / wordsPerMinute);
    result = `~${value} min read`;
  }
  return result;
};
