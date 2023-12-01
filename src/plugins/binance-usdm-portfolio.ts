import { USDMClient, type FuturesAccountPosition } from 'binance'
import xbar, { separator } from 'xbar'
import { Plugin } from '../plugin'
import type { Variable } from '../types'
import { VariableType } from '../constants'

export default class BinanceUSDMPortfolio extends Plugin {
    public readonly id = 'binance-usdm-portfolio'
    public readonly refreshTime = '5s'

    public override readonly variables: Record<string, Variable> = {
        API_KEY: {
            type: VariableType.String,
            description: 'Binance API key',
            defaultValue: '',
        },
        API_SECRET: {
            type: VariableType.String,
            description: 'Binance API Secret',
            defaultValue: '',
        },
    }

    public async render() {
        const apiKey = this.getVariable('API_KEY')
        const apiSecret = this.getVariable('API_SECRET')

        if (apiKey.length === 0 || apiSecret.length === 0) {
            return xbar([{ text: 'Missing API Key', color: 'red' }])
        }

        const client = new USDMClient({ parseExceptions: true, api_key: apiKey, api_secret: apiSecret })
        const { totalUnrealizedProfit, positions } = await client.getAccountInformation()
        const activePositions = positions.filter((position) => Number(position.positionAmt) !== 0)
        const profit = Number(totalUnrealizedProfit)

        xbar([{ text: `${this.formatPrice(profit)}`, color: this.getColor(profit) }])
        xbar([separator])

        this.renderPosition(activePositions)
    }

    protected renderPosition(positions: FuturesAccountPosition[]) {
        for (const [id, { symbol, unrealizedProfit, positionInitialMargin }] of positions.entries()) {
            const profit = Number(unrealizedProfit)
            const margin = Number(positionInitialMargin)
            const percent = ((profit / margin) * 100).toFixed(2)
            const color = this.getColor(profit)

            xbar([{ text: `${id + 1}.${symbol}    ${this.formatPrice(profit)} ${percent}%`, color }])
        }
    }

    protected getColor(change: number) {
        return change > 0 ? 'green' : 'red'
    }

    protected formatPrice(price: number) {
        return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    }
}
