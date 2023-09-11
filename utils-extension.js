/**
 * https://stackoverflow.com/questions/33483667/how-to-strip-json-comments-in-javascript/62945875#62945875
 * @param {string} jsonString 
 * @returns {string}
 */
export function removeCommentsInJSON(jsonString) {
  return jsonString.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m)
}

/**
 * 
 * @param {string} jsonString 
 * @returns {string}
 */
export function removeTrailingCommaInJSON(jsonString) {
  return jsonString.replace(/(,)?(?=(\s)*(\]|\}))/g, '')
}

/**
 * 
 * @param {Response} response 
 * @returns {Promise<object>}
 */
export async function parseJSONResponseWithComments(response) {
  let text = await response.text()
  text = removeCommentsInJSON(text)
  text = removeTrailingCommaInJSON(text)

  try {
    return JSON.parse(text)
  } catch (error) {
    console.error(error)
    console.log(text)

    return null
  }
}
