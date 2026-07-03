// Garment registry — the single source of truth for the customizer.
//
// All-over mode: the user composes a 2D design that becomes the shirt's texture
// (wrapping the whole garment via its UV map). Adding a garment = config here.

export const products = [
  {
    id: 'tshirt',
    name: 'Classic T-Shirt',
    model3d: {
      // Swap `src` for your own GLB (needs a UV map). `camera` frames it on load.
      src: '/models/tshirt.glb',
      camera: { position: [0, 0.02, 2.15], fov: 26 },
    },
    // The 2D design canvas = the all-over print texture. Square maps to the
    // model's 0..1 UV space. `background` is the default shirt colour.
    design: { background: '#efeae3', textureSize: 1024 },
  },
  // Future garments (hoodie, tote, ...) are added as more entries here.
]

export const defaultProduct = products[0]
