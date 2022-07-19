// https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT

export class ZipManager {

  constructor() {
    if (new.target) throw new TypeError(`Cannot instantiate an abstract class.`)
  }

  // Public Static Properties

  /**
   *
   * @param   {Blob} blob
   * @returns {Promise<Object>}
   */
  static async getZipInfoAsObject(blob) {
    const buffer = await blob.arrayBuffer()
    const view   = new Uint8Array(buffer)

    const zip = {view, files: [], directories: []}

    this.readZipData(view, zip)

    return zip
  }


  /**
   *
   * @param   {Object} obj
   * @returns {File}
   */
  static compressZipFromObject(obj) {

  }


  static CENTRAL_DIRECTORY_FILE_HEADER_SIGNATURE    = 'PK\x01\0x2'

  static END_OF_CENTRAL_DIRECTORY_RECORD_SIGNATURE  = 'PK\x05\0x6'

  static LOCAL_FILE_HEADER = {
    LOCAL_FILE_HEADER_SIGNATURE: 'PK\x03\0x4',

    SIGNATURE_OFFSET: 0x00,
    SIGNATURE_BYTES: 4,

    VERSION_OFFSET: 0x04,
    VERSION_BYTES: 2,

    FLAGS_OFFSET: 0x06,
    FLAGS_BYTES: 2,

    COMPRESSION_OFFSET: 0x08,
    COMPRESSION_BYTES: 2,

    MODTIME_OFFSET: 0x0A,
    MODTIME_BYTES: 2,

    MODDATE_OFFSET: 0x0C,
    MODDATE_BYTES: 2,

    CRC32_OFFSET: 0x0E,
    CRC32_BYTES: 4,

    COMPRESSED_SIZE_OFFSET: 0x12,
    COMPRESSED_SIZE_BYTES: 4,

    UNCOMPRESSED_SIZE_OFFSET: 0x16,
    UNCOMPRESSED_SIZE_BYTES: 4,

    FILE_NAME_LENGTH_OFFSET: 0x1A,
    FILE_NAME_LENGTH_BYTES: 2,

    EXTRA_FIELD_LENGTH_OFFSET: 0x1C,
    EXTRA_FIELD_LENGTH_BYTES: 2,

    FILE_NAME_OFFSET: 0x1E,
  }

  static CENTRAL_DIRECTORY = {

  }

  /**
   *
   * @param {Uint8Array} view
   * @param {Object}     obj
   */
  static readZipData(view, obj) {
    let i = 0

    while (true) {
      const localFileHeader = this.getLocalFileHeader(view, i, obj)
      i += localFileHeader.endOffset

      const data = view.slice()
    }
  }

  static numberToBinary(n, bitsLength = 8) {
    const binary = n.toString(2)
    if (bitsLength < binary.length) throw new TypeError(`binary length cannot be bigger than specified bitsLength`)

    const padding = '0'.repeat(bitsLength - binary.length)

    return `${padding}${binary}`
  }

  static getNumberFromBytes(bytes) {
    const bytesAsBinaryNumber = [...bytes].reverse().map(n => this.numberToBinary(n, 8)).join('') || 0
    return parseInt(bytesAsBinaryNumber, 2)
  }

  static isDirectory(name) {
    return name.endsWith('/')
  }

  static getVersion(view) {
    const number = this.getNumberFromBytes(view)
    return number.toString().split('').join('.')
  }

  static getModTime(view) {
    const number = this.getNumberFromBytes(view)
    const binary = this.numberToBinary(number, 16)

    const hours   = parseInt(binary.slice(0, 5),   2).toString().padStart(2, '0')
    const minutes = parseInt(binary.slice(5, 11),  2).toString().padStart(2, '0')
    const seconds = parseInt(binary.slice(11, 16), 2).toString().padStart(2, '0')

    return `${hours}:${minutes}:${seconds * 2}`
  }

  static getModDate(view) {
    const number = this.getNumberFromBytes(view)
    const binary = this.numberToBinary(number, 16)

    const year  = parseInt(binary.slice(0, 7),  2)
    const month = parseInt(binary.slice(7, 11),  2).toString().padStart(2, '0')
    const day   = parseInt(binary.slice(11, 16), 2).toString().padStart(2, '0')

    return `${day}/${month}/${year + 1980}`
  }

  /**
   *
   * @param {Uint8Array} view
   * @param {number}     offset
   */
  static getLocalFileHeader(view, offset, obj) {
    const textDecoder = new TextDecoder()
    const LFH = this.LOCAL_FILE_HEADER

    const signature              =      textDecoder.decode(view.slice(offset + LFH.SIGNATURE_OFFSET,          offset + LFH.SIGNATURE_OFFSET          + LFH.SIGNATURE_BYTES))
    const versionNeededToExtract =         this.getVersion(view.slice(offset + LFH.VERSION_OFFSET,            offset + LFH.VERSION_OFFSET            + LFH.VERSION_BYTES))
    const flags                  =                         view.slice(offset + LFH.FLAGS_OFFSET,              offset + LFH.FLAGS_OFFSET              + LFH.FLAGS_BYTES)
    const compression            =                         view.slice(offset + LFH.COMPRESSION_OFFSET,        offset + LFH.COMPRESSION_OFFSET        + LFH.COMPRESSION_BYTES)
    const modTime                =         this.getModTime(view.slice(offset + LFH.MODTIME_OFFSET,            offset + LFH.MODTIME_OFFSET            + LFH.MODTIME_BYTES))
    const modDate                =         this.getModDate(view.slice(offset + LFH.MODDATE_OFFSET,            offset + LFH.MODDATE_OFFSET            + LFH.MODDATE_BYTES))
    const crc32                  =                         view.slice(offset + LFH.CRC32_OFFSET,              offset + LFH.CRC32_OFFSET              + LFH.CRC32_BYTES)
    const compressedSize         = this.getNumberFromBytes(view.slice(offset + LFH.COMPRESSED_SIZE_OFFSET,    offset + LFH.COMPRESSED_SIZE_OFFSET    + LFH.COMPRESSED_SIZE_BYTES))
    const uncompressedSize       = this.getNumberFromBytes(view.slice(offset + LFH.UNCOMPRESSED_SIZE_OFFSET,  offset + LFH.UNCOMPRESSED_SIZE_OFFSET  + LFH.UNCOMPRESSED_SIZE_BYTES))
    const pathLength             = this.getNumberFromBytes(view.slice(offset + LFH.FILE_NAME_LENGTH_OFFSET,   offset + LFH.FILE_NAME_LENGTH_OFFSET   + LFH.FILE_NAME_LENGTH_BYTES))
    const extraFieldLength       = this.getNumberFromBytes(view.slice(offset + LFH.EXTRA_FIELD_LENGTH_OFFSET, offset + LFH.EXTRA_FIELD_LENGTH_OFFSET + LFH.EXTRA_FIELD_LENGTH_BYTES))
    const path                   =      textDecoder.decode(view.slice(offset + LFH.FILE_NAME_OFFSET,          offset + LFH.FILE_NAME_OFFSET          + pathLength))

    const EXTRA_FIELD_OFFSET     = LFH.FILE_NAME_OFFSET + pathLength
    const extraField             =                         view.slice(offset + EXTRA_FIELD_OFFSET,            offset + EXTRA_FIELD_OFFSET            + extraFieldLength)

    const endOffset = offset + EXTRA_FIELD_OFFSET + extraFieldLength

    const paths = path.split('/').slice(0, -1)
    const fileName = paths.slice(-1)[0] + (this.isDirectory(path) ? '/' : '')

    let currentDirectory = obj

    for (let i = 0; i < paths.length; i++) {

      if (!currentDirectory) break

      if (i === paths.length - 1) {
        if (this.isDirectory(fileName)) currentDirectory.directories.push({name: fileName, files: [], directories: []})
        else                            currentDirectory.files.push({name: fileName})
        break
      }

      const directory = currentDirectory.directories.filter(d => d.name === paths[i] + '/')[0]

      if (!directory) {
        const newDirectory = {name: paths[i] + '/', files: [], directories: []}
        currentDirectory.directories.push(newDirectory)
        currentDirectory = newDirectory
      } else {
        currentDirectory = directory
      }

    }

    return {endOffset, signature, versionNeededToExtract, flags, compression, modTime, modDate, crc32, compressedSize, uncompressedSize, pathLength, extraFieldLength, path, extraField}
  }

  static getCentralDirectory(view, offset) {

  }

}

Object.freeze(ZipManager)
