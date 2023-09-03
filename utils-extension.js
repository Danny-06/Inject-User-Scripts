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
  return jsonString.replace(/(,)?(?=(\s)*(\]|\}))/, '')
}

/**
 * 
 * @param {Response} response 
 * @returns {Promise<object>}
 */
export function parseJSONResponseWithComments(response) {
  return response.text()
  .then(text => removeCommentsInJSON(text))
  .then(text => removeTrailingCommaInJSON(text))
  .then(text => JSON.parse(text))
  .catch(error => console.error(error))
}
