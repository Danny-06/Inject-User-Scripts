/**
 * 
 * @param {string} jsonString 
 * @returns {string}
 */
export function removeCommentsInJSON(jsonString) {
  return jsonString.replace(/\/\*[^]*?\*\//g, '').replace(/\/\/.*/g, '')
}

/**
 * 
 * @param {Response} response 
 * @returns {Promise<object>}
 */
export function parseJSONResponseWithComments(response) {
  return response.text().then(text => removeCommentsInJSON(text)).then(text => JSON.parse(text))
}
