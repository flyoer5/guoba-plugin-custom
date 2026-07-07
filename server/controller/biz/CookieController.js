import {Result} from '#guoba.framework'
import {ApiController} from '#guoba.platform'
import {MysUserDB, UserDB} from '../../../../genshin/model/db/index.js'

export default class CookieController extends ApiController {
  constructor(guobaApp) {
    super('/cookie', guobaApp)
  }

  registerRouters() {
    this.get('/list', this.list)
    this.put('/item', this.updateItem)
    this.delete('/item', this.deleteItem)
  }

  maskCookie(ck = '') {
    if (!ck) return ''
    return ck.length <= 18 ? ck.slice(0, 4) + '***' : ck.slice(0, 8) + '***' + ck.slice(-6)
  }

  parseJson(value, def = {}) {
    if (value && typeof value === 'object') return value
    try { return JSON.parse(value || '') || def } catch { return def }
  }

  flattenUids(uids = {}) {
    const list = []
    for (const [game, arr] of Object.entries(uids || {})) {
      if (Array.isArray(arr)) for (const uid of arr) list.push({game, uid: String(uid)})
    }
    return list
  }

  async buildItems() {
    const mysRows = await MysUserDB.findAll({order: [['updatedAt', 'DESC']]})
    const userRows = await UserDB.findAll()
    const ltuidToQQ = new Map()
    for (const user of userRows) {
      const qq = String(user.id || '')
      const ltuids = String(user.ltuids || '').split(',').map(v => v.trim()).filter(Boolean)
      for (const ltuid of ltuids) {
        if (!ltuidToQQ.has(ltuid)) ltuidToQQ.set(ltuid, [])
        ltuidToQQ.get(ltuid).push(qq)
      }
    }
    return mysRows.map(row => {
      const raw = row.get ? row.get({plain: true}) : row
      const ck = raw.ck || ''
      const uids = this.parseJson(raw.uids, {})
      const uidList = this.flattenUids(uids)
      const ltuid = String(raw.ltuid || '')
      const qqList = ltuidToQQ.get(ltuid) || []
      return {
        ltuid,
        qq: qqList.join(', '),
        qqList,
        uid: uidList.map(v => v.uid).join(', '),
        uidList,
        cookie: ck,
        cookieMasked: this.maskCookie(ck),
        device: raw.device || '',
        updatedAt: raw.updatedAt,
      }
    })
  }

  async list(req) {
    const keyword = String(req.query.keyword || '').trim().toLowerCase()
    const pageNo = Math.max(1, Number.parseInt(req.query.pageNo || '1'))
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(req.query.pageSize || '20')))
    let items = await this.buildItems()
    if (keyword) {
      items = items.filter(item => [item.ltuid, item.qq, item.uid, item.cookie, item.device].join(' ').toLowerCase().includes(keyword))
    }
    const total = items.length
    const start = (pageNo - 1) * pageSize
    return Result.ok({ total, pageNo, pageSize, items: items.slice(start, start + pageSize) })
  }

  async updateItem(req) {
    const {ltuid, cookie = '', device = ''} = req.body || {}
    if (!ltuid) return Result.error('ltuid不能为空')
    const row = await MysUserDB.findByPk(ltuid)
    if (!row) return Result.error('记录不存在')
    row.ck = String(cookie || '').trim()
    row.device = String(device || '').trim()
    await row.save()
    return Result.ok({}, '修改成功')
  }

  async deleteItem(req) {
    const {ltuid} = req.body || {}
    if (!ltuid) return Result.error('ltuid不能为空')
    const row = await MysUserDB.findByPk(ltuid)
    if (!row) return Result.error('记录不存在')
    await row.destroy()
    const users = await UserDB.findAll()
    for (const user of users) {
      const list = String(user.ltuids || '').split(',').map(v => v.trim()).filter(Boolean)
      const next = list.filter(v => v !== String(ltuid))
      if (next.length !== list.length) {
        user.ltuids = next.join(',')
        await user.save()
      }
    }
    return Result.ok({}, '删除成功')
  }
}
