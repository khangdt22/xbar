import type { Plugin } from '../plugin'
import { VariableType } from '../constants'

export function formatValue(type: VariableType, value: any) {
    switch (type) {
        case VariableType.String:
        case VariableType.Select:
            return `"${value}"`
        case VariableType.Number:
            return value
        case VariableType.Boolean:
            return value === true ? 'true' : 'false'
        default:
            return value
    }
}

export function buildVariables(plugin: Plugin) {
    const variables: string[] = []

    for (const [name, { type, description, defaultValue, choices }] of Object.entries(plugin.variables)) {
        variables.push(`# <xbar.var>${type}(VAR_${name.toUpperCase()}=${formatValue(type, defaultValue)}): ${description}${choices?.length ? ' [' + choices.join(', ') + ']' : ''}</xbar.var>`)
    }

    return variables.join('\n')
}

export function buildMetadata(plugin: Plugin) {
    const metadata: string[] = []

    if (plugin.title) {
        metadata.push(`# <xbar.title>${plugin.title}</xbar.title>`)
    }

    if (plugin.version) {
        metadata.push(`# <xbar.version>${plugin.version}</xbar.version>`)
    }

    if (plugin.author) {
        metadata.push(`# <xbar.author>${plugin.author}</xbar.author>`)
    }

    if (plugin.github) {
        metadata.push(`# <xbar.author.github>${plugin.github}</xbar.author.github>`)
    }

    if (plugin.description) {
        metadata.push(`# <xbar.desc>${plugin.description}</xbar.desc>`)
    }

    if (plugin.image) {
        metadata.push(`# <xbar.image>${plugin.image}</xbar.image>`)
    }

    if (plugin.dependencies) {
        metadata.push(`# <xbar.dependencies>${plugin.dependencies.join(',')}</xbar.dependencies>`)
    }

    if (plugin.aboutUrl) {
        metadata.push(`# <xbar.abouturl>${plugin.aboutUrl}</xbar.abouturl>`)
    }

    metadata.push(buildVariables(plugin))

    return metadata.join('\n')
}
