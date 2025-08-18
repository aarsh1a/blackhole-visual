import * as THREE from 'three'

import GUI from 'lil-gui'
import Time from './Utils/Time.js'
import Sizes from './Utils/Sizes.js'
import Debug from './Debug/Debug.js'

import Resources from './Resources.js'
import Renderer from './Renderer.js'
import Camera from './Camera.js'
import World from './World.js'

import assets from './assets.js'

export default class Experience {
    static instance

    constructor(_options = {}) {
        if (Experience.instance) {
            return Experience.instance
        }
        Experience.instance = this

        // Options
        this.targetElement = _options.targetElement

        if (!this.targetElement) {
            console.warn('Missing \'targetElement\' property')
            return
        }

        this.time = new Time()
        this.sizes = new Sizes()
        this.setConfig()
        this.setDebug()
        this.setScenes()
        this.setCamera()
        this.setRenderer()
        this.setResources()
        this.setWorld()
        this.ui = {}
        this.ui.distance = document.querySelector('#data-distance')
        this.ui.velocity = document.querySelector('#data-velocity')
        this.ui.dilation = document.querySelector('#data-dilation')
        this.lastCameraPosition = new THREE.Vector3()
        this.lastCameraPosition.copy(this.camera.instance.position)
        this.sizes.on('resize', () => {
            this.resize()
        })

        this.update()
    }

    setConfig() {
        this.config = {}

        // Pixel ratio
        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        // Width and height
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height || window.innerHeight
    }

    setDebug() {
        this.debug = new Debug()
    }

    setScenes() {
        this.scenes = {}
        this.scenes.space = new THREE.Scene()
        this.scenes.distortion = new THREE.Scene()
        this.scenes.overlay = new THREE.Scene()
    }

    setCamera() {
        this.camera = new Camera()
    }

    setRenderer() {
        this.renderer = new Renderer({ rendererInstance: this.rendererInstance })

        this.targetElement.appendChild(this.renderer.instance.domElement)
    }

    setResources() {
        this.resources = new Resources(assets)
    }

    setWorld() {
        this.world = new World()
    }

    update() {
        if (this.stats)
            this.stats.update()

        if (this.world)
            this.world.update()

        this.camera.update()

        if (this.renderer)
            this.renderer.update()

        if (this.ui.distance &&
            this.world &&
            this.world.blackHole &&
            typeof this.world.blackHole.eventHorizonRadius === 'number') {
            const cameraPosition = this.camera.instance.position
            const cameraDistance = cameraPosition.length()
            const horizonRadius = this.world.blackHole.eventHorizonRadius

            // 1. Calculate distance to event horizon
            const distanceToHorizon = Math.max(0, cameraDistance - horizonRadius)
            this.ui.distance.textContent = `${distanceToHorizon.toFixed(2)} units`

            // 2. Calculate relative velocity
            const positionDelta = cameraPosition.distanceTo(this.lastCameraPosition)
            const velocity = positionDelta / (this.time.delta / 1000) // units per second
            this.lastCameraPosition.copy(cameraPosition)
            this.ui.velocity.textContent = `${Math.round(velocity)} m/s`

            // 3. Calculate time dilation
            const dilation = Math.min(1, Math.max(0.1, (cameraDistance - horizonRadius) / (20 - horizonRadius)))
            this.ui.dilation.textContent = `${dilation.toFixed(3)}x`
        }
        window.requestAnimationFrame(() => {
            this.update()
        })
    }

    resize() {
        // Config
        const boundings = this.targetElement.getBoundingClientRect()
        this.config.width = boundings.width
        this.config.height = boundings.height

        this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        if (this.camera)
            this.camera.resize()

        if (this.renderer)
            this.renderer.resize()

        if (this.world)
            this.world.resize()
    }

    destroy() {

    }
}
