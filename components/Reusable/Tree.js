import { Parser } from 'expr-eval'
import { Object3D, Vector3 } from 'three'
import { getScreen } from '~/components/Reusable/index.js'
let parent = (vm) => vm.$parent// || vm.getRootNode().host

// let getVal = (n, key) => n && n[key]

let lookup = (vm, key) => {
  if (vm[key]) {
    return vm[key]
  } else if (parent(vm) && parent(vm)[key]) {
    return parent(vm)[key]
  } else {
    vm = parent(vm)
    if (!vm) {
      return false
    }
    return lookup(vm, key)
  }
}

let castdown = (vm, ev, data) => {
  if (vm && vm.children && vm.children.length > 0) {
    vm.$emit(ev, data)
    vm.children.forEach((kid) => {
      castdown(kid, ev, data)
    })
  }
}

export const Tree = {
  props: {
    animated: {
      default: false
    },
    clicked: {
      default () {
        return () => {}
      }
    },
    canplay: {},
    visible: {},
    layout: {}
  },
  data () {
    return {
      tempVector3: false,
      screen: false,
      child: {
        width: 0.000000000000001,
        height: 0.000000000000001,
        depth: 0.000000000000001,
        radius: 0.000000000000001
      },
      o3d: new Object3D()
    }
  },
  created () {
    this.$on('add', (v) => {
      this.o3d.add(v)
    })
    this.$on('remove', (v) => {
      this.o3d.remove(v)
    })
    this.$on('child', (v) => {
      this.child = v
      this.$emit('syncFormula')
    })
    this.$on('syncFormula', () => {
      this.onSyncFormula()
    })
  },
  watch: {
    visible () {
      this.$emit('syncFormula')
    },
    layout () {
      this.$emit('syncFormula')
    },
    animated () {
      this.$emit('syncFormula')
    },
    screen () {
      this.$emit('syncFormula')
    }
  },
  async mounted () {
    this.$parent.$emit('add', this.o3d)
    this.$emit('o3d', this.o3d)
    this.$emit('syncFormula')

    if (this.animated) {
      this.lookup('base').onLoop(() => {
        this.$emit('syncFormula')
      })
    }
    if (this.lookup('base')) {
      this.screen = await this.getScreen()
      this.lookup('base').onResize(async () => {
        this.$emit('syncFormula')
        this.screen = await this.getScreen()
      })
    }

    console.log('Mounted:', this.$options.name)
    // window.dispatchEvent(new Event('resize'))
    let ray = this.lookup('rayplay')
    if (ray) {
      this.$on('enable-play', (v) => {
        ray.add(v, this.clicked)
      })
      this.$on('disable-play', (v) => {
        console.log(v)
        ray.remove(v)
      })
    }
  },

  beforeDestroy () {
    this.o3d.visible = false
    this.$parent.$emit('remove', this.o3d)
  },

  computed: {
  },

  methods: {
    async waitDoOnce ({ getter = () => {}, fnc = () => {} }) {
      let execute = true
      this.lookup('base').onLoop(() => {
        if (!execute) { return }
        let v = getter()
        if (v) {
          fnc(v)
          execute = false
        }
      })
    },
    // relayout () {
    //   let castDown = ({ lv, ev, data }) => {
    //     lv.$emit(ev, data)
    //     lv.$children.forEach((kid) => {
    //       castDown({ lv: kid, ev, data })
    //     })
    //   }
    //   castDown({ lv: this, ev: 'relayout', data: true })
    // },

    async getScreen () {
      let scene = this.lookup('scene') || await this.lookupWait('scene')
      let camera = this.lookup('camera') || await this.lookupWait('camera')
      if (scene) {
        scene.updateMatrixWorld()
      }
      if (!camera) {
        return
      }
      this.tempVector3 = this.tempVector3 || new Vector3()
      this.tempVector3.setFromMatrixPosition(this.o3d.matrixWorld)
      return getScreen({ camera, depth: this.tempVector3.z })
    },

    castdown (ev, data) {
      return castdown(this, ev, data)
    },
    async waitGet (key) {
      return new Promise(async (resolve) => {
        this.waitDoOnce({
          getter: () => {
            return this[key]
          },
          fnc: (v) => {
            resolve(v)
          }
        })
      })
    },
    // async oneByOneTask (v) {
    //   this.internalTasks.push(v)
    //   let run = async () => {
    //     this.isRunningTask = true
    //     for (var i = 0; i < this.internalTasks.length; i++) {
    //       await this.internalTasks[i]()
    //     }
    //     this.isRunningTask = false
    //   }
    //   if (!this.isRunningTask) {
    //     run()
    //   }
    // },
    async lookupWait (key) {
      return new Promise(async (resolve) => {
        this.waitDoOnce({
          getter: () => {
            return this.lookup(key)
          },
          fnc: (v) => {
            resolve(v)
          }
        })
      })
    },
    lookup (key) {
      return lookup(this, key)
    },

    getLayout () {
      let layoutMap = this.lookup('layouts')
      let layoutName = this.layout
      if (layoutMap && layoutName && layoutMap[layoutName]) {
        return layoutMap[layoutName]
      } else {
        return {}
      }
    },

    onSyncFormula () {
      let run = (fnc) => {
        try {
          fnc()
        } catch (e) {
          if (this.$option) {
            console.log(this.$option.name, e)
          } else {
            console.log(e)
          }
        }
      }

      let layout = this.getLayout()

      if (typeof layout.visible !== 'undefined') {
        run(() => { this.o3d.visible = Number('' + (layout.visible)) })
      }

      if (typeof this.visible !== 'undefined') {
        run(() => { this.o3d.visible = Number('' + (this.visible)) })
      }

      run(() => { this.o3d.rotation.x = Number('' + (layout.rx || '0')) })
      run(() => { this.o3d.rotation.y = Number('' + (layout.ry || '0')) })
      run(() => { this.o3d.rotation.z = Number('' + (layout.rz || '0')) })

      run(() => { this.o3d.scale.x = Number('' + (layout.sx || '1')) })
      run(() => { this.o3d.scale.y = Number('' + (layout.sy || '1')) })
      run(() => { this.o3d.scale.z = Number('' + (layout.sz || '1')) })

      run(() => { this.o3d.position.x = Number('' + (layout.px || '0')) })
      run(() => { this.o3d.position.y = Number('' + (layout.py || '0')) })
      run(() => { this.o3d.position.z = Number('' + (layout.pz || '0')) })
    }
  }
}
