import { defineConfig } from 'tsup'
import { Converter } from './src/utils/converter'

export default defineConfig({
    entry: ['src/plugins/*.ts'],
    format: ['esm'],
    clean: true,
    shims: true,
    sourcemap: true,
    onSuccess: async () => {
        await new Converter().convert()
    },
})
