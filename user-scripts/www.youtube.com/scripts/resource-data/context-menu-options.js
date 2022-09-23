import { cssInlinePropertiesProxyWrapper, waitForSelector } from '../../../@libs/utils-injection.js'

const video = await waitForSelector('ytd-watch-flexy video')


export const copyVideoURL =  {
  id: 'copy-video-url',
  name: 'Copiar URL del video',
  icon: // xml
  `
  <svg height="100%" viewBox="0 0 36 36" width="100%">
      <path fill="currentColor" d="M5.85 18.0c0.0-2.56 2.08-4.65 4.65-4.65h6.0V10.5H10.5c-4.14 .0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5h6.0v-2.85H10.5c-2.56 .0-4.65-2.08-4.65-4.65zM12.0 19.5h12.0v-3.0H12.0v3.0zm13.5-9.0h-6.0v2.85h6.0c2.56 .0 4.65 2.08 4.65 4.65s-2.08 4.65-4.65 4.65h-6.0V25.5h6.0c4.14 .0 7.5-3.36 7.5-7.5s-3.36-7.5-7.5-7.5z"></path>
  </svg>
  `,
  action: ctxItem => {
    const videoId = new URL(location.href).searchParams.get('v')

    if (videoId == null) {
      showPopup(`Copy URL to clipboard filed. URL couldnt be obtained`)
      return
    }

    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${videoId}`)
    .catch(() => {
      showPopup(`Copy URL to clipboard filed.`)
    })
  }
}

export const copyVideoURLTime = {
  id: 'copy-video-url-time',
  name: 'Copiar URL del video a partir del minuto actual',
  icon: // xml
  `
  <svg height="100%" viewBox="0 0 36 36" width="100%">
      <path fill="currentColor" d="M5.85 18.0c0.0-2.56 2.08-4.65 4.65-4.65h6.0V10.5H10.5c-4.14 .0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5h6.0v-2.85H10.5c-2.56 .0-4.65-2.08-4.65-4.65zM12.0 19.5h12.0v-3.0H12.0v3.0zm13.5-9.0h-6.0v2.85h6.0c2.56 .0 4.65 2.08 4.65 4.65s-2.08 4.65-4.65 4.65h-6.0V25.5h6.0c4.14 .0 7.5-3.36 7.5-7.5s-3.36-7.5-7.5-7.5z"></path>
  </svg>
  `,
  action: ctxItem => {
    const videoId = new URL(location.href).searchParams.get('v')
    const time = Math.floor(video.currentTime)

    if (videoId == null) {
      showPopup(`Copy URL to clipboard filed. URL couldnt be obtained`)
      return
    }

    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${videoId}&t=${time}s`)
    .catch(() => {
      showPopup(`Copy URL to clipboard filed.`)
    })
  }
}

export const copyVideoURLEmbed = {
  id: 'copy-video-url-embed',
  name: 'Copiar URL del video embebido',
  icon: // xml
  `
  <svg height="100%" viewBox="0 0 36 36" width="100%">
      <path fill="currentColor" d="M5.85 18.0c0.0-2.56 2.08-4.65 4.65-4.65h6.0V10.5H10.5c-4.14 .0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5h6.0v-2.85H10.5c-2.56 .0-4.65-2.08-4.65-4.65zM12.0 19.5h12.0v-3.0H12.0v3.0zm13.5-9.0h-6.0v2.85h6.0c2.56 .0 4.65 2.08 4.65 4.65s-2.08 4.65-4.65 4.65h-6.0V25.5h6.0c4.14 .0 7.5-3.36 7.5-7.5s-3.36-7.5-7.5-7.5z"></path>
  </svg>
  `,
  action: ctxItem => {
    const videoId = new URL(location.href).searchParams.get('v')

    if (videoId == null) {
      showPopup(`Copy URL to clipboard filed. URL couldnt be obtained`)
      return
    }

    navigator.clipboard.writeText(`https://www.youtube.com/embed/${videoId}`)
    .catch(() => {
      showPopup(`Copy URL to clipboard filed.`)
    })
  }
}

export const copyVideoURLEmbedNoCookie = {
  id: 'copy-video-url-embed-nocookie',
  name: 'Copiar URL del video embebido con no-cookie',
  icon: // xml
  `
  <svg height="100%" viewBox="0 0 36 36" width="100%">
      <path fill="currentColor" d="M5.85 18.0c0.0-2.56 2.08-4.65 4.65-4.65h6.0V10.5H10.5c-4.14 .0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5h6.0v-2.85H10.5c-2.56 .0-4.65-2.08-4.65-4.65zM12.0 19.5h12.0v-3.0H12.0v3.0zm13.5-9.0h-6.0v2.85h6.0c2.56 .0 4.65 2.08 4.65 4.65s-2.08 4.65-4.65 4.65h-6.0V25.5h6.0c4.14 .0 7.5-3.36 7.5-7.5s-3.36-7.5-7.5-7.5z"></path>
  </svg>
  `,
  action: ctxItem => {
    const videoId = new URL(location.href).searchParams.get('v')

    if (videoId == null) {
      showPopup(`Copy URL to clipboard filed. URL couldnt be obtained`)
      return
    }

    navigator.clipboard.writeText(`https://www.youtube-nocookie.com/embed/${videoId}`)
    .catch(() => {
      showPopup(`Copy URL to clipboard filed.`)
    })
  }
}

export const captureScreenshot = {
  id: 'capture-screenshot',
  name: 'Capturar fotograma actual',
  icon: // html
  `
    <svg viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000">
      <g>
        <path fill="#FFF" d="M908.4,908.4H91.7c-45.2,0-81.7-36.5-81.7-81.7V336.6c0-45,36.5-81.6,81.7-81.6H255v-81.7c0-45.2,36.5-81.7,81.6-81.7h326.7c45.2,0,81.8,36.5,81.8,81.7V255h163.3c45.1,0,81.6,36.5,81.6,81.6v490.1C990,871.9,953.5,908.4,908.4,908.4L908.4,908.4z M132.4,336.6c-22.5,0-40.8,18.4-40.8,40.9s18.4,40.8,40.8,40.8s40.8-18.3,40.8-40.8S155,336.6,132.4,336.6L132.4,336.6z M550,336.6h-92c-114.5,21.6-201.1,121.8-201.1,242.6c0,136.4,110.6,247.1,247.1,247.1c136.5,0,247.1-110.7,247.1-247.1C751.1,458.3,664.6,358.2,550,336.6L550,336.6z M494.1,706.1c-68.2,0-123.7-55.5-123.7-123.7c0-68.3,55.4-123.5,123.7-123.5c68.2,0,123.5,55.2,123.5,123.5C617.5,650.7,562.3,706.1,494.1,706.1L494.1,706.1z"/>
      </g>
    </svg>
  `
  ,
  action: async () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0)

    const blob = await new Promise(resolve => canvas.toBlob(resolve))
    const url = URL.createObjectURL(blob)

    const blobWindow = window.open(url)
    const extensionScripts = document.querySelectorAll('[data-source="Chrome Extension - @all-urls"]')

    blobWindow.addEventListener('beforeunload', event => URL.revokeObjectURL(url))

    await delay(0)

    extensionScripts.forEach(s => {
      if (s instanceof HTMLScriptElement)
        blobWindow.document.head.append(cloneScript(s))
      else
        blobWindow.document.head.append(s.cloneNode(true))
    })

  }
}

const videoStyle = cssInlinePropertiesProxyWrapper(video)
videoStyle['--rotateY'] = '0deg'

export const flipVideoHorizontally = {
  id: 'flip-video-horizontally',
  name: 'Voltear video horizontalmente',
  icon: // html
  `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
        <path fill="#fff" d="M25,13C13.44,13,1,16.442,1,24c0,6.689,9.745,10.152,20,10.86v6.185L32.629,32L21,22.955v5.893C11.799,28.141,7,25.131,7,24 c0-1.285,6.189-5,18-5s18,3.715,18,5c0,0.553-1.579,2.211-6.272,3.538L36,27.743v6.174l1.24-0.307C44.823,31.734,49,28.321,49,24 C49,16.442,36.56,13,25,13z"/>
    </svg>
  `,
  action: ctxItem => {
    videoStyle['--rotateY'] = ctxItem.toogleCheck() ? '180deg' : '0deg'
    console.log(ctxItem)
  }
}

export const showCommentsPanel = {
  id: 'show-comments-panel',
  name: 'Mostrar panel de comentarios',
  icon: // xml
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 121.86 122.88">
      <path fill="currentColor" d="M30.28,110.09,49.37,91.78A3.84,3.84,0,0,1,52,90.72h60a2.15,2.15,0,0,0,2.16-2.16V9.82a2.16,2.16,0,0,0-.64-1.52A2.19,2.19,0,0,0,112,7.66H9.82A2.24,2.24,0,0,0,7.65,9.82V88.55a2.19,2.19,0,0,0,2.17,2.16H26.46a3.83,3.83,0,0,1,3.82,3.83v15.55ZM28.45,63.56a3.83,3.83,0,1,1,0-7.66h53a3.83,3.83,0,0,1,0,7.66Zm0-24.86a3.83,3.83,0,1,1,0-7.65h65a3.83,3.83,0,0,1,0,7.65ZM53.54,98.36,29.27,121.64a3.82,3.82,0,0,1-6.64-2.59V98.36H9.82A9.87,9.87,0,0,1,0,88.55V9.82A9.9,9.9,0,0,1,9.82,0H112a9.87,9.87,0,0,1,9.82,9.82V88.55A9.85,9.85,0,0,1,112,98.36Z"></path>
  </svg>
  `,
  action: ctxItem => {
    // Vibility attribute values
    const HIDDEN  = 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN'
    const VISIBLE = 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED'

    const panelsContainer = document.querySelector('ytd-watch-flexy #panels')
    const panels = [...panelsContainer.children]

    panels.forEach(e => e.setAttribute('visibility', HIDDEN))

    const chapterPanel = panelsContainer.querySelector(`[target-id="engagement-panel-comments-section"]`)

    chapterPanel?.setAttribute('visibility', VISIBLE)
  }
}

export const showDescriptionPanel = {
  id: 'show-description-panel',
  name: 'Mostrar panel de descripción',
  icon: // xml
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 460">
      <path fill="currentColor" d="M123.39,391.952h17.284v3.476c0,31.932,28.304,57.902,63.093,57.902h27.983h133.544h12.006H388.6  c34.799,0,63.104-25.971,63.104-57.902V177.952c0-31.923-28.305-57.903-63.104-57.903h-17.283v-3.475  c0-31.935-28.295-57.904-63.094-57.904h-23.305H151.373H123.39c-34.789,0-63.093,25.97-63.093,57.904v217.474  C60.297,365.97,88.601,391.952,123.39,391.952z M388.6,139.004c23.445,0,42.445,17.438,42.445,38.948v217.476  c0,21.509-19,38.949-42.445,38.949h-11.299h-12.006H231.751h-27.983c-23.436,0-42.435-17.44-42.435-38.949v-3.476v-18.955V177.952  c0-21.511,18.999-38.948,42.435-38.948h27.983h118.917h14.627h6.021H388.6z M80.944,116.574c0-21.511,18.999-38.949,42.446-38.949  h27.983h133.545h23.305c23.447,0,42.445,17.438,42.445,38.949v3.475H231.751h-27.983c-34.789,0-63.093,25.98-63.093,57.903v195.045  H123.39c-23.447,0-42.446-17.449-42.446-38.949V116.574z"></path>
      <path fill="currentColor" d="M196.708,198.035c-4.537,0-8.21,3.674-8.21,8.211c0,4.536,3.673,8.21,8.21,8.21h164.228c4.537,0,8.211-3.674,8.211-8.21  c0-4.537-3.674-8.211-8.211-8.211H196.708z"></path>
      <path fill="currentColor" d="M222.655,262.036c0,4.537,3.685,8.211,8.222,8.211H384.77c4.537,0,8.223-3.674,8.223-8.211s-3.686-8.221-8.223-8.221  H230.877C226.34,253.815,222.655,257.499,222.655,262.036z"></path>
      <path fill="currentColor" d="M349.153,317.815c0-4.537-3.676-8.21-8.211-8.21H196.708c-4.537,0-8.21,3.673-8.21,8.21c0,4.536,3.673,8.223,8.21,8.223  h144.234C345.477,326.038,349.153,322.351,349.153,317.815z"></path>
      <path fill="currentColor" d="M384.77,365.395H249.61c-4.536,0-8.21,3.675-8.21,8.212c0,4.536,3.674,8.209,8.21,8.209h135.16  c4.537,0,8.223-3.673,8.223-8.209C392.992,369.07,389.307,365.395,384.77,365.395z"></path>
  </svg>
  `,
  action: ctxItem => {
    // Vibility attribute values
    const HIDDEN  = 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN'
    const VISIBLE = 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED'

    const panelsContainer = document.querySelector('ytd-watch-flexy #panels')
    const panels = [...panelsContainer.children]

    panels.forEach(e => e.setAttribute('visibility', HIDDEN))

    const chapterPanel = panelsContainer.querySelector(`[target-id="engagement-panel-structured-description"]`)

    chapterPanel?.setAttribute('visibility', VISIBLE)
  }
}

export const showChaptersPanel = {
  id: 'show-chapters-panel',
  name: 'Mostrar panel de capitulos',
  icon: // xml
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
      <path fill="currentColor" d="M978.9,225.1c-7.3-7.7-16-13-25-17.4C843.6,153.9,733.3,100.2,623.3,46.1c-35.3-17.4-70.2-35-109.7-36C510,10,506.4,10,502.9,10c-29.6,0-58.8,3.5-86.5,17c-123.5,60-246.7,120.5-370,180.8c-9.7,4.7-18.9,10.4-26.5,18.9c-13.1,14.8-13,30.7-0.1,45.7c9.2,10.6,20.9,16.2,32.6,21.9c56.7,27.8,113.3,55.6,170,83.3c24,11.7,47.9,23.5,71.9,35.2c32.2,15.7,64.4,31.4,96.6,47.4c33.5,16.5,67.3,29.3,96.8,29.3c1.4,0,2.8,0,4.4-0.1c38.9-0.2,68.7-5.6,97.3-19.7c38.7-19,77.5-38,116.4-57c24-11.7,47.9-23.5,72-35.2c57.1-27.9,114.1-55.8,171-83.7c11-5.5,22.2-10.7,31.1-20.6C993.5,257.7,993.4,240.2,978.9,225.1z M562,420c-19,9.4-39.5,18.7-70.5,18.7h-4c-10.7,0-31.4-9.3-69.6-28.2c-18.5-9.2-317.5-159.7-317.5-159.7S353.1,126.1,443.1,82.4c15.3-7.4,33.8-11.2,59.7-11.2l9.2,0.1c25.2,0.7,51.3,13.6,84.3,29.7c81.4,40,303.4,148.3,303.4,148.3S586.7,407.9,562,420z"/>
      <path fill="currentColor" d="M957.9,460.5C934,448.8,843,406.5,843,406.5c-21.9,10.7-43.9,21.4-65.8,32.2c-2.1,1-4,2-6.1,3c0,0,115.7,51.8,128.5,58.2L559.7,666.2c-16.1,7.9-34.9,11.7-61.9,12.4l-3.5,0.1c-25,0-50.7-10.2-84-26.7c-15.4-7.7-310.2-152.1-310.2-152.1c12-6,128.2-58,128.2-58l-71.9-35.2c0,0-88.7,41.1-110.5,51.8c-9.6,4.8-18.9,10.3-26.5,18.9c-12.8,14.9-12.7,31.1,0.4,45.7c8.5,9.6,19.2,15.1,30.1,20.5c56.9,27.9,302.6,148.3,333,163.4c35.8,17.7,71.7,33.1,111.2,33.1c2,0,3.9,0,6-0.1c29.6-0.7,58.7-5,86.4-18.5c40.5-19.8,309.5-151.4,368-180c8.7-4.3,17.2-9.4,24.3-17c14.5-15.3,14.7-32.4,0.5-48C973.2,469.3,965.9,464.4,957.9,460.5z"/>
      <path fill="currentColor" d="M982.2,729.8c-7.1-9.2-16.2-15.1-25.8-19.9C935.2,699.4,844,656.6,844,656.6c-21.7,10.6-43.2,21.1-64.9,31.7c-2.1,1.1-4.3,2.1-6.3,3.1l126.8,58.8c0,0-254.1,123.9-334.9,163.8c-19.7,9.7-41,14.7-67,14.7h-3.2h-0.5c-21,0-43.3-6.8-76.8-23.3c-78.9-39-316.8-155.2-316.8-155.2c11.8-5.8,126.6-58.7,126.6-58.7s-49.7-24.3-71.2-34.9c0,0-90.9,42.8-113.2,53.9c-9.1,4.5-17.5,10.2-24.3,18.7c-10.6,13.2-11,27-0.9,40.9c7.5,10.3,17.6,16.5,28.2,21.7C160.5,848,275.4,903.7,390,960.4c33.4,16.5,67.2,29.6,103.9,29.6c1.4,0,3,0,4.4-0.1c32.3-0.3,63.4-6.1,93.5-20.9c120.7-59.5,241.8-118.2,362.8-177.4c10.8-5.4,21.2-11.7,28.8-22.5C992.5,755.6,992,742.6,982.2,729.8z"/>
  </svg>
  `,
  action: ctxItem => {
    // Vibility attribute values
    const HIDDEN = 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN'
    const VISIBLE     = 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED'

    const panelsContainer = document.querySelector('ytd-watch-flexy #panels')
    const panels = [...panelsContainer.children]

    panels.forEach(e => e.setAttribute('visibility', HIDDEN))

    const chapterPanel = panelsContainer.querySelector(`[target-id="engagement-panel-macro-markers-description-chapters"]`)

    chapterPanel?.setAttribute('visibility', VISIBLE)
  }
}

export const downloadChaptersAsXML = {
  id: 'download-chapters-as-xml',
  name: 'Descargar capítulos como XML',
  icon: // xml
  `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
      <g transform="translate(0.000000,511.000000) scale(0.100000,-0.100000)">
          <path fill="currentColor" d="M2540.6,4972.7c-370.8-88.6-674-366.2-816.3-746.3c-51.3-137.6-53.6-144.6-60.6-1844.8l-7-1709.6h457.1h454.8v1644.3v1644.3l67.6,74.6l67.6,77l1203.5,7l1203.5,7V3006.6c0-1044.9,2.3-1126.5,46.6-1264.1c107.3-354.5,382.5-627.4,746.3-748.7c144.6-49,198.2-51.3,1266.4-60.6l1112.5-9.3v-2306.6c0-2535.2,7-2404.6-139.9-2481.6c-60.6-30.3-382.5-35-2754.4-30.3l-2684.5,7l-67.6,77c-56,60.7-67.6,95.6-67.6,191.3v116.6h-457.1H1652l16.3-184.3c44.3-529.4,375.5-935.2,870-1063.5c202.9-53.6,5550.8-51.3,5756.1,0c417.5,107.3,730,417.5,839.6,830.3c30.3,107.3,35,599.4,35,3122.9v2997L7762.6,3606L6358.6,5010l-1842.5-2.3C3028.1,5005.3,2647.9,5000.7,2540.6,4972.7z M7216.9,1842.8c-795.3-4.7-1058.9,2.3-1098.5,23.3c-119,63-121.3,77-121.3,1201.1v1044.9l1131.2-1131.2l1131.2-1131.2L7216.9,1842.8z"></path>
          <path fill="currentColor" d="M1379.1,91.2c-205.2-63-405.8-242.5-496.8-440.8c-49-107.3-51.3-135.3-51.3-1065.9v-956.2l65.3-133c81.6-165.6,256.6-326.5,426.8-389.5c125.9-49,163.3-49,2726.4-49c2563.2,0,2600.5,0,2726.5,49c170.3,63,345.2,223.9,426.8,389.5l65.3,133v956.2c0,930.6-2.3,958.6-51.3,1065.9c-67.6,146.9-223.9,312.5-368.5,387.2l-116.6,63l-2647.2,4.7C2629.2,107.5,1411.8,100.5,1379.1,91.2z M2624.6-1035.3c86.3-158.6,121.3-205.2,135.3-179.6c11.7,18.7,67.6,114.3,125.9,214.6l105,179.6H3140c84,0,151.6-4.7,151.6-11.7c0-4.7-84-144.6-188.9-307.9c-102.6-160.9-188.9-300.8-191.2-310.2c-2.3-7,86.3-160.9,200.6-340.5c112-179.6,202.9-333.5,202.9-342.9c0-9.3-70-16.3-156.3-16.3h-158.6l-123.6,221.6c-67.6,121.3-126,221.6-130.6,221.6c-4.7,0-67.6-100.3-139.9-221.6L2473-2150.1H2319c-116.6,0-149.3,7-139.9,30.3c7,16.3,95.6,165.6,200.6,326.5c105,163.3,188.9,307.9,188.9,324.2c0,14-84,158.6-186.6,321.9C2279.4-984,2195.4-844,2195.4-834.7c0,7,70,14,158.6,14h156.3L2624.6-1035.3z M4005.3-1319.8c63-275.2,121.3-494.4,128.3-485.1c9.3,9.3,42,137.6,74.6,284.5c32.7,146.9,84,366.2,109.6,485.1l51.3,214.6H4565h195.9v-664.7v-664.7h-128.3h-128.3l-2.3,531.7l-2.3,529.4l-118.9-524.8l-121.3-524.8l-135.3-7c-72.3-4.7-132.9-2.3-132.9,2.3c0,28-237.9,1054.2-247.2,1063.5c-4.7,4.7-9.3-233.2-9.3-531.8v-541.1l-121.3,7l-123.6,7l-7,660l-4.7,657.7h205.2h205.2L4005.3-1319.8z M5297.4-1357.1v-536.4h326.5h326.5v-128.3v-128.3h-466.5h-466.4v664.7v664.7h139.9h139.9V-1357.1z"></path>
      </g>
  </svg>
  `
  ,
  action: ctxItem => {
    const ytChapters  = youtubeUtils.getYTChapters()
    const chaptersXML = youtubeUtils.ytChaptersToXML(ytChapters)

    const file = new File([chaptersXML], 'chapters', {type: 'text/xml'})

    downloadFile(file)
  }
}

export const showTranscriptionPanel = {
  id: 'show-transcription-panel',
  name: 'Mostrar panel de transcripción',
  icon: // xml
  `
  <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
      <path fill="currentColor" d="M5,11h2v2H5V11z M15,15H5v2h10V15z M19,15h-2v2h2V15z M19,11H9v2h10V11z M22,6H2v14h20V6z M3,7h18v12H3V7z"></path>
  </svg>
  `
  ,
  action: ctxItem => {
    // Vibility attribute values
    const HIDDEN = 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN'
    const VISIBLE     = 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED'

    const panelsContainer = document.querySelector('ytd-watch-flexy #panels')
    const panels = [...panelsContainer.children]

    panels.forEach(e => e.setAttribute('visibility', HIDDEN))

    const chapterPanel = panelsContainer.querySelector(`[target-id="engagement-panel-searchable-transcript"]`)

    chapterPanel?.setAttribute('visibility', VISIBLE)
  }
}
