let fetch = require('node-fetch')
let WebSocket = require('ws')
let EventEmitter = require('events')

class Emitter extends EventEmitter {}

class CoronaCoin {
  constructor({
    token,
    userToken,
    pollingUrl = '',
    reconnectTimeout = 1000
  }) {
    this.token = token
    this.userToken = userToken

    this.apiUrl = 'https://corona-coin.ru/api/'
    this.reconnectTimeout = reconnectTimeout

    if (pollingUrl) {
      this.wsUrl = this.getWsUrl(pollingUrl)
    }

    this.events = new Emitter()
  }

  getWsUrl(pollingUrl) {
    let query = pollingUrl.split('?')[1]
    let wsLink = `wss://corona-coin.ru/api/?${query}`

    return wsLink
  }

  async request(method, params = {}) {
    params.method = method
    params.token = this.token

    let response = await fetch(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      },
    })

    let json = await response.json()

    if (json.error) {
      return this.request(method, params)
    }

    return json.response
  }

  transfer({ toId, amount } = {}) {
    return this.request('transfer', { to_id: toId, amount })
  }

  score(userIds = []) {
    return this.request('score', { user_ids: userIds })
  }

  history(params = {}) {
    return this.request('history', params)
  }

  getDepositLink({ userId, amount, isFixed } = {}) {
    let link = `https://vk.com/app7349811#merchant${userId}_${amount}`

    if (isFixed) link += '_1'

    return link
  }

  async $getPollingUrl() {
    let result = await (
      await fetch(`https://api.vk.com/method/apps.get?access_token=${this.userToken}&app_id=7349811&v=5.103`)
    ).json()

    if (result.error) {
      throw new Error(
        'Unexpected error. Try another access token'
      )
    }

    let { mobile_iframe_url } = result.response.items[0]

    if (!mobile_iframe_url) {
      throw new Error(
        'Only "Clever" tokens are supported'
      )
    }

    return mobile_iframe_url
  }

  async startPolling() {
    if (!this.wsUrl && !this.userToken) {
      throw new ReferenceError(
        'Either `pollingUrl` or `userToken` are required for polling to work'
      )
    }

    if (!this.wsUrl) {
      this.pollingUrl = await this.$getPollingUrl()
      this.wsUrl = this.getWsUrl(this.pollingUrl)
    }

    let ws = new WebSocket(this.wsUrl)

    ws.on('open', () => {
      console.log('Started socketing')
    })

    ws.on('close', () => {
      return setTimeout(
        this.startPolling,
        this.reconnectTimeout
      )
    })
    
    ws.on('error', () => {})
    
    ws.on('message', (data) => {
      data = JSON.parse(data)

      if (data.event !== 'new_transfer') return

      let { from_id, amount } = data

      this.events.emit('transfer', { from_id, amount })
    })
  }
}

module.exports = CoronaCoin
