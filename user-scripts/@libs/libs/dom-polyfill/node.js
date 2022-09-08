const privateConstructorKey = Symbol('#<NodeList> Constructor Key')

class Node extends EventTarget {

  constructor() {
    if (Object.getPrototypeOf(this) === Node.prototype) {
      throw new Error(`Cannot create an instance of an abstract class`)
    }

    this.#childNodes = new NodeList({key: privateConstructorKey})
  }

  static DOCUMENT_POSITION_DISCONNECTED            = 1
  static DOCUMENT_POSITION_PRECEDING               = 2
  static DOCUMENT_POSITION_FOLLOWING               = 4
  static DOCUMENT_POSITION_CONTAINS                = 8
  static DOCUMENT_POSITION_CONTAINED_BY            = 16
  static DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32

  static ELEMENT_NODE                              = 1
  static ATTRIBUTE_NODE                            = 2
  static TEXT_NODE                                 = 3
  static CDATA_SECTION_NODE                        = 4
  /**
   * @deprecated
   */
  static ENTITY_REFERENCE_NODE                     = 5
  /**
   * @deprecated
   */
  static ENTITY_NODE                               = 6
  static PROCESSING_INSTRUCTION_NODE               = 7
  static COMMENT_NODE                              = 8
  static DOCUMENT_NODE                             = 9
  static DOCUMENT_TYPE_NODE                        = 10
  static DOCUMENT_FRAGMENT_NODE                    = 11
  /**
   * @deprecated
   */
  static NOTATION_NODE                             = 12

  DOCUMENT_POSITION_DISCONNECTED            = 1
  DOCUMENT_POSITION_PRECEDING               = 2
  DOCUMENT_POSITION_FOLLOWING               = 4
  DOCUMENT_POSITION_CONTAINS                = 8
  DOCUMENT_POSITION_CONTAINED_BY            = 16
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32

  ELEMENT_NODE                              = 1
  ATTRIBUTE_NODE                            = 2
  TEXT_NODE                                 = 3
  CDATA_SECTION_NODE                        = 4
  /**
   * @deprecated
   */
  ENTITY_REFERENCE_NODE                     = 5
  /**
   * @deprecated
   */
  ENTITY_NODE                               = 6
  PROCESSING_INSTRUCTION_NODE               = 7
  COMMENT_NODE                              = 8
  DOCUMENT_NODE                             = 9
  DOCUMENT_TYPE_NODE                        = 10
  DOCUMENT_FRAGMENT_NODE                    = 11
  /**
   * @deprecated
   */
  NOTATION_NODE                             = 12

  [Symbol.toStringTag] = 'Node'


  // Public Methods

  #childNodes = []

  appendChild(node) {

  }

  cloneNode(deep = false) {

  }

  compareDocumentPosition(other) {

  }

  contains(other) {
    
  }

  getRootNode(options = null) {

  }

  hasChildNodes() {
    
  }

  insertBefore(node, child) {

  }

  isDefaultNamespace(namespaceURI) {

  }

  isEqualNode(otherNode) {

  }

  isSameNode(otherNode) {
    
  }

  lookupNamespaceURI(prefix) {

  }

  lookupPrefix(namespaceURI) {

  }

  normalize() {

  }

  removeChild(child) {

  }

  replaceChild(node, child) {
    
  }


  // Public Accessors

  get baseURI() {
    return
  }

  get childNodes() {
    return
  }

  get firstChild() {
    return
  }

  get isConnected() {
    return
  }

  get lastChild() {
    return
  }

  get nextSibling() {
    return
  }

  get nodeName() {
    return
  }

  get nodeType() {
    return
  }

  get nodeValue() {
    return
  }

  set nodeValue(value) {
    return
  }

  get ownerDocument() {
    return
  }

  get parentElement() {
    return
  }

  get parentNode() {
    return
  }

  get previousSibling() {
    return
  }

  get textContent() {
    return
  }

  set textContent(value) {

  }

}

class NodeList {

  constructor() {
    const {key, collection} = settings

    if (key !== privateConstructorKey) {
      throw new TypeError(`Illegal constructor`)
    }
  }

  [Symbol.iterator] = this.values
  get [Symbol.toStringTag]() { return 'NodeList' }


  // Public Methods

  forEach(callback) {
    
  }

  keys() {
    
  }

  values() {
    
  }
  
  entries() {

  }

  item() {

  }


  // Public Accessors

  #length

  get length() {

  }

}