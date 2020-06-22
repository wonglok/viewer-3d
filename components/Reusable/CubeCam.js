import { Object3D, CubeRefractionMapping, Vector3, Scene, RGBFormat, LinearMipmapLinearFilter, WebGLCubeRenderTarget, CubeCamera  } from 'three'

export class CubeCam {
  constructor ({ renderer, loop, excludeFromScene = new Object3D(), scene = new Scene() }) {
    this.scene = scene
    this.excludeFromScene = excludeFromScene
    this.renderer = renderer

    // Create cube render target
    this.cubeRenderTarget = new WebGLCubeRenderTarget(128, { format: RGBFormat, generateMipmaps: true, minFilter: LinearMipmapLinearFilter });

    this.out = {}
    this.out.envMap = this.cubeRenderTarget.texture
    this.cubeRenderTarget.texture.mapping = CubeRefractionMapping

    // Create cube camera
    var cubeCamera = new CubeCamera(1, 100000, this.cubeRenderTarget)
    scene.add(cubeCamera)

    let pos = new Vector3()
    loop(() => {
      excludeFromScene.visible = false
      excludeFromScene.updateMatrix()
      excludeFromScene.updateMatrixWorld()
      excludeFromScene.updateWorldMatrix()
      pos.setFromMatrixPosition(excludeFromScene.matrixWorld)
      cubeCamera.position.copy(pos)
      cubeCamera.update(renderer, scene)
      excludeFromScene.visible = true
    })
  }
}