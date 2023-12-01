import * as process from 'node:process'
import type { Variable } from './types'

export abstract class Plugin {
    public abstract readonly id: string
    public abstract readonly refreshTime: string

    public readonly variables: Record<string, Variable> = {}
    public readonly title?: string
    public readonly version?: string
    public readonly author?: string
    public readonly github?: string
    public readonly description?: string
    public readonly image?: string
    public readonly dependencies?: string[]
    public readonly aboutUrl?: string

    public get clone() {
        return Number(process.env[`${this.id.toUpperCase().replace('-', '_')}_CLONE`] ?? 1)
    }

    public abstract render(): void

    protected getVariable(name: string) {
        return process.env[`VAR_${name.toUpperCase()}`] ?? this.variables[name].defaultValue
    }
}
