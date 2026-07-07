import fs from 'fs'
import path from 'path'
import {execSync} from 'child_process'
import {Result} from '#guoba.framework'
import {_paths, ApiController} from '#guoba.platform'

export default class CleanupController extends ApiController {
  constructor(guobaApp) {
    super('/cleanup', guobaApp)
  }

  registerRouters() {
    this.get('/scan', this.scan)
  }

  bytesText(size = 0) {
    const units = ['B', 'KB', 'MB', 'GB']
    let v = Number(size) || 0
    let i = 0
    while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
    return `${v.toFixed(v >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
  }

  dirSize(target) {
    try {
      const out = String(execSync(`du -sb ${JSON.stringify(target)} 2>/dev/null | cut -f1`, {encoding: 'utf8'})).trim()
      return Number(out) || 0
    } catch {
      return 0
    }
  }

  scan() {
    const root = _paths.root
    const candidates = [
      { key: 'temp-html', title: '渲染HTML缓存', path: path.join(root, 'temp/html'), safeLevel: 'safe', cleanable: true, note: '渲染生成的临时 HTML，可安全清理' },
      { key: 'temp-puppeteer', title: 'Puppeteer临时目录', path: path.join(root, 'temp/puppeteer'), safeLevel: 'safe', cleanable: true, note: '浏览器临时目录，可安全清理' },
      { key: 'temp-userdata-bak', title: '临时用户备份', path: path.join(root, 'temp/UserDataBAK'), safeLevel: 'safe', cleanable: true, note: '临时备份目录，可按需清理' },
      { key: 'temp-uigf', title: '抽卡导出临时目录', path: path.join(root, 'temp/uigf'), safeLevel: 'caution', cleanable: false, note: 'v1 仅扫描，不执行清理' },
      { key: 'temp-material', title: '材料缓存目录', path: path.join(root, 'temp/material'), safeLevel: 'caution', cleanable: false, note: 'v1 仅扫描，不执行清理' },
      { key: 'temp-strategy', title: '攻略缓存目录', path: path.join(root, 'temp/strategy'), safeLevel: 'caution', cleanable: false, note: 'v1 仅扫描，不执行清理' },
      { key: 'logs', title: '日志文件', path: path.join(root, 'logs'), safeLevel: 'caution', cleanable: false, note: 'v1 仅扫描，不清理运行日志' },
      { key: 'upload-tmp', title: '上传临时目录', path: path.join(root, 'data/upload_tmp'), safeLevel: 'caution', cleanable: false, note: 'v1 仅扫描，不执行清理' },
    ]
    const items = candidates.map(it => {
      const exists = fs.existsSync(it.path)
      const size = exists ? this.dirSize(it.path) : 0
      return { ...it, exists, size, sizeText: this.bytesText(size), relativePath: path.relative(root, it.path) || '.' }
    })
    const totalSize = items.reduce((sum, it) => sum + (it.size || 0), 0)
    return Result.ok({ totalSize, totalSizeText: this.bytesText(totalSize), items })
  }
}
