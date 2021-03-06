require('requestidlecallback')

export { Stats } from '~/components/Reusable/Stats.js'
export { Renderer } from '~/components/Reusable/Renderer.js'
export { TCamera } from '~/components/Reusable/TCamera.js'
export { PCamera } from '~/components/Reusable/PCamera.js'
export { makeBase } from '~/components/Reusable/makeBase.js'
export { makeScroller } from '~/components/Reusable/Scroller.js'
export { makeScrollBox } from '~/components/Reusable/ScrollBox.js'
export { visibleHeightAtZDepth, visibleWidthAtZDepth, getScreen } from '~/components/Reusable/Screen.js'

export { makePaintCanvas } from '~/components/Reusable/makePaintCanvas'
export { Tree } from '~/components/Reusable/Tree'
export { PipeBasic } from '~/components/Reusable/PipeBasic'
export { PipeScissor } from '~/components/Reusable/PipeScissor'
export { RayPlay } from '~/components/Reusable/RayPlay'
export { Damper } from '~/components/Reusable/Damper'

export { ShaderCube } from '~/components/Reusable/shaderCube'
export { ShaderCubeRefraction } from '~/components/Reusable/shaderCubeRefraction'
export { ShaderCubeChrome } from '~/components/Reusable/shaderCubeChrome'
export { ShaderCubeSea } from '~/components/Reusable/shaderCubeSea'
export { ShaderCubeChromatics } from '~/components/Reusable/shaderCubeChromatics'

export { ChaseControls } from '~/components/Reusable/ChaseControls'
export { CubeCam } from '~/components/Reusable/CubeCam'

export const idleSleep = () => new Promise((resolve) => { window.requestIdleCallback(resolve) })
export const rafSleep = () => new Promise((resolve) => { window.requestAnimationFrame(resolve) })

export const getID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}
