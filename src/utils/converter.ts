import { dirname, join, parse, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chmod, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import fg from 'fast-glob'
import { execa } from 'execa'
import type { Plugin } from '../types'
import { Plugin as PluginInstance } from '../plugin'
import { buildMetadata } from './metadata'

export class Converter {
    protected get rootPath() {
        return resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
    }

    public async convert() {
        const plugins = await this.getPlugins()
        const template = await readFile(resolve(this.rootPath, 'src/templates/plugin.sh'), 'utf8')
        const { stdout: nodePath } = await execa('which', ['node'])
        const outDir = resolve(this.rootPath, 'plugins')

        if (process.env['CLEAN']) {
            await rm(outDir, { recursive: true, force: true })
        }

        if (!existsSync(outDir)) {
            await mkdir(outDir, { recursive: true })
        }

        for (const { name, path, instance } of plugins) {
            console.log('Converting file %s to xbar plugin...', path)

            const metadata = buildMetadata(instance)
            const output = join(outDir, `${name}.${instance.refreshTime}.sh`)

            let content = template

            content = content.replace('${NODE_PATH}', nodePath)
            content = content.replace('${METADATA}', metadata)
            content = content.replace('${ROOT_PATH}', this.rootPath)
            content = content.replace('${FILE_PATH}', path)

            await writeFile(output, content, 'utf8')
            await chmod(output, 0o755)
        }
    }

    protected async getPlugins() {
        const files = await this.getCompiledFiles()
        const plugins: Plugin[] = []

        for (const file of files) {
            const name = parse(file).name
            const instance = await import(file).then((m) => this.getPluginInstance(m.default))

            if (!instance) {
                continue
            }

            for (let i = 0; i < Math.max(instance.clone ?? 1, 1); i++) {
                plugins.push({ name: i === 0 ? name : `${name}-${i}`, path: file, instance })
            }
        }

        return plugins
    }

    protected getPluginInstance(input: any) {
        if (typeof input === 'function') {
            try {
                const instance = new input()

                if (this.isPluginInstance(instance)) {
                    return instance
                }
            } catch {}
        }

        return null
    }

    protected isPluginInstance(input: any): input is PluginInstance {
        return 'render' in input && typeof input.render === 'function' && 'refreshTime' in input
    }

    protected async getCompiledFiles() {
        return fg.glob(join(this.rootPath, 'dist/*.js'), { onlyFiles: true })
    }
}
