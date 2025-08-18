import * as THREE from 'three'
import Experience from './Experience.js'
import StarsParticlesMaterial from './Materials/StarsParticlesMaterial.js'

export default class Stars {
    constructor() {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scenes = this.experience.scenes
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.sizes = this.experience.sizes
        this.camera = this.experience.camera
        this.renderer = this.experience.renderer

        this.setSkybox()
        this.setMinimalStars()
    }

    setSkybox() {
        const textureLoader = new THREE.TextureLoader()
        const texture = textureLoader.load('/space-background.jpg')
        texture.mapping = THREE.EquirectangularReflectionMapping

        const geometry = new THREE.SphereGeometry(800, 64, 64)
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        })

        this.skybox = new THREE.Mesh(geometry, material)
        this.scenes.space.add(this.skybox)

        if (this.debug.active) {
            const folder = this.debug.ui.getFolder('skybox')
            folder.add(material, 'wireframe')
        }
    }

    setMinimalStars() {
        this.particles = {}
        this.particles.count = 5000

        const positionArray = new Float32Array(this.particles.count * 3)
        const sizeArray = new Float32Array(this.particles.count)
        const colorArray = new Float32Array(this.particles.count * 3)

        for (let i = 0; i < this.particles.count; i++) {
            const iStride3 = i * 3

            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1.0)
            const x = Math.cos(theta) * Math.sin(phi) * 300
            const y = Math.sin(theta) * Math.sin(phi) * 300
            const z = Math.cos(phi) * 300

            positionArray[iStride3 + 0] = x
            positionArray[iStride3 + 1] = y
            positionArray[iStride3 + 2] = z

            sizeArray[i] = Math.random() * 1.5 + 0.5

            const hue = 200 + Math.round(40 * Math.random())
            const color = new THREE.Color(`hsl(${hue}, 70%, 90%)`)
            colorArray[iStride3 + 0] = color.r
            colorArray[iStride3 + 1] = color.g
            colorArray[iStride3 + 2] = color.b
        }

        this.particles.geometry = new THREE.BufferGeometry()
        this.particles.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3))
        this.particles.geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizeArray, 1))
        this.particles.geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colorArray, 3))

        this.particles.material = new StarsParticlesMaterial()
        this.particles.material.uniforms.uViewHeight.value = this.renderer.composition.space.height

        this.particles.points = new THREE.Points(
            this.particles.geometry,
            this.particles.material
        )
        this.particles.points.frustumCulled = false

        this.scenes.space.add(this.particles.points)
    }

    resize() {
        if (this.particles && this.particles.material)
            this.particles.material.uniforms.uViewHeight.value = this.sizes.height
    }

    update() {
        if (this.skybox)
            this.skybox.rotation.y += this.time.delta * 0.00001
    }
}