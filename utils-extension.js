/**
 * 
 * @param {string} jsonString 
 * @returns 
 */
export function removeCommentsInJSON(jsonString) {
  return jsonString.replace(/\/\*[^]*?\*\//g, '').replace(/\/\/.*/g, '')
}

/**
 * 
 * @param {Response} response 
 */
export function parseJSONResponseWithComments(response) {
  return response.text().then(text => removeCommentsInJSON(text)).then(text => JSON.parse(text))
}
