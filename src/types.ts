import type { VariableType } from './constants'
import type { Plugin as PluginInstance } from './plugin'

export interface Plugin {
    name: string
    path: string
    instance: PluginInstance
}

export interface Variable {
    type: VariableType
    description: string
    defaultValue: string
    choices?: string[]
}
