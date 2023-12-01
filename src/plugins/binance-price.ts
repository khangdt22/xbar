import xbar from 'xbar'
import { Plugin } from '../plugin'
import type { Variable } from '../types'
import { VariableType } from '../constants'

export default class BinancePrice extends Plugin {
    public readonly id = 'binance-price'
    public readonly refreshTime = '1s'

    public override readonly variables: Record<string, Variable> = {
        SYMBOL: {
            type: VariableType.String,
            description: 'Symbol to display price for',
            defaultValue: 'BTCUSDT',
        },
    }

    public async render() {
        const symbol = this.getVariable('SYMBOL')
        const { price, change } = await this.getPrice(symbol)
        const color = change > 0 ? 'green' : 'red'
        const emoji = change > 0 ? '↑' : '↓'

        xbar([{ text: `${this.formatPrice(price)} ${change.toFixed(2)}% ${emoji}`, color }])
    }

    protected async getPrice(symbol: string) {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`).then((r) => r.json())

        const price = Number(response.lastPrice)
        const change = Number(Number(response.priceChangePercent).toFixed(2))

        return { price, change }
    }

    protected formatPrice(price: number) {
        return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    }
}
