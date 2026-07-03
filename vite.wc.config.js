import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Builds the detachable web component into a single self-contained file:
//   dist-wc/folk-designer.js   (React + three + fabric all bundled, CSS inlined)
// Use: <script type="module" src="folk-designer.js"></script>
//      <folk-designer lang="en" model="/models/tshirt.glb"></folk-designer>
export default defineConfig({
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  plugins: [react()],
  build: {
    outDir: 'dist-wc',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/webcomponent.jsx',
      name: 'FolkDesigner',
      formats: ['es'],
      fileName: () => 'folk-designer.js',
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
})
