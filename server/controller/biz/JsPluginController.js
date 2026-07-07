import fs from 'fs'
import path from 'path'
import {Result} from '#guoba.framework'
import {_paths, ApiController} from '#guoba.platform'

export default class JsPluginController extends ApiController {
  constructor(guobaApp) {
    super('/js-plugin', guobaApp)
  }

  registerRouters() {
    this.get('/list', this.list)
    this.get('/export', this.exportItem)
    this.put('/import', this.importItem)
    this.delete('/item', this.deleteItem)
  }

  get exampleDir() {
    return path.join(_paths.root, 'plugins', 'example')
  }

  safeName(name = '') {
    name = String(name || '').trim()
    if (!name.endsWith('.js')) name += '.js'
    name = path.basename(name)
    if (!/^[^\/:*?"<>|]+\.js$/.test(name)) return ''
    return name
  }

  async list(req) {
    const keyword = String(req.query.keyword || '').trim().toLowerCase()
    const pageNo = Math.max(1, Number.parseInt(req.query.pageNo || '1'))
    const pageSize = Math.min(200, Math.max(1, Number.parseInt(req.query.pageSize || '100')))
    const items = []
    const dir = this.exampleDir
    if (fs.existsSync(dir)) {
      for (const file of fs.readdirSync(dir, {withFileTypes: true})) {
        if (!file.isFile() || !file.name.endsWith('.js')) continue
        const fullPath = path.join(dir, file.name)
        const stat = fs.statSync(fullPath)
        items.push({
          name: file.name,
          size: stat.size,
          mtime: stat.mtime.toISOString(),
        })
      }
    }
    let rows = items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    if (keyword) rows = rows.filter(it => it.name.toLowerCase().includes(keyword))
    const total = rows.length
    const start = (pageNo - 1) * pageSize
    return Result.ok({ total, pageNo, pageSize, items: rows.slice(start, start + pageSize) })
  }

  exportItem(req, res) {
    const name = this.safeName(req.query.name)
    if (!name) return Result.error('name不合法')
    const file = path.join(this.exampleDir, name)
    if (!fs.existsSync(file)) return Result.error('文件不存在')
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(name)}"`)
    res.send(fs.readFileSync(file, 'utf8'))
    return Result.VOID
  }

  async importItem(req) {
    const name = this.safeName(req.body?.name)
    const content = String(req.body?.content || '')
    if (!name) return Result.error('文件名不合法')
    if (!content.trim()) return Result.error('文件内容不能为空')
    fs.mkdirSync(this.exampleDir, {recursive: true})
    fs.writeFileSync(path.join(this.exampleDir, name), content, 'utf8')
    return Result.ok({}, '导入成功')
  }

  async deleteItem(req) {
    const name = this.safeName(req.body?.name)
    if (!name) return Result.error('文件名不合法')
    const file = path.join(this.exampleDir, name)
    if (!fs.existsSync(file)) return Result.error('文件不存在')
    fs.unlinkSync(file)
    return Result.ok({}, '删除成功')
  }
}
