import fs from 'fs'
import path from 'path'
import {Result} from '#guoba.framework'
import {_paths, ApiController} from '#guoba.platform'

export default class UsageStatsController extends ApiController {
  constructor(guobaApp) {
    super('/stats', guobaApp)
  }

  registerRouters() {
    this.get('/usage-hours', this.usageHours)
  }

  stripAnsi(str = '') {
    return String(str).replace(/\x1b\[[0-9;]*m/g, '')
  }

  pad(n) { return String(n).padStart(2, '0') }

  dateKey(d) { return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}` }

  initHours() {
    return Array.from({length: 24}, (_, hour) => ({hour, total: 0, group: 0, private: 0}))
  }

  usageHours() {
    const logsDir = path.join(_paths.root, 'logs')
    const now = new Date()
    const since24 = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const todayKey = this.dateKey(now)
    const todayHours = this.initHours()
    const last24Hours = this.initHours()
    const dailyMap = new Map()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dailyMap.set(this.dateKey(d), {date: this.dateKey(d), total: 0, group: 0, private: 0})
    }

    let total = 0, group = 0, privateCount = 0
    const samples = []
    if (fs.existsSync(logsDir)) {
      const files = fs.readdirSync(logsDir).filter(f => /^command\.\d{4}-\d{2}-\d{2}\.log$/.test(f)).sort()
      for (const file of files) {
        const m = file.match(/command\.(\d{4}-\d{2}-\d{2})\.log/)
        if (!m) continue
        const fileDate = m[1]
        if (!dailyMap.has(fileDate) && fileDate < this.dateKey(since24)) continue
        const text = fs.readFileSync(path.join(logsDir, file), 'utf8')
        for (const raw of text.split(/\r?\n/)) {
          const line = this.stripAnsi(raw)
          const tm = line.match(/^\[(\d{2}):(\d{2}):(\d{2})\.\d{3}\]/)
          if (!tm) continue
          if (!line.includes('[完成')) continue
          if (!line.includes('] [') && !line.includes('][')) continue
          const hour = Number(tm[1])
          const dt = new Date(`${fileDate}T${tm[1]}:${tm[2]}:${tm[3]}+08:00`)
          const isGroup = /\[[^\]]+\([^\)]*\),\s*[^\]]+\([^\)]*\)\]/.test(line)
          const isPrivate = !isGroup && /\[[^\]]*\([^\)]*\)\]/.test(line)
          if (!isGroup && !isPrivate) continue
          const inc = (obj) => { obj.total++; if (isGroup) obj.group++; else if (isPrivate) obj.private++ }
          total++; if (isGroup) group++; else if (isPrivate) privateCount++
          if (fileDate === todayKey) inc(todayHours[hour])
          if (dt >= since24 && dt <= now) inc(last24Hours[hour])
          if (dailyMap.has(fileDate)) inc(dailyMap.get(fileDate))
          if (samples.length < 20) samples.push(line.slice(0, 180))
        }
      }
    }
    return Result.ok({
      total,
      group,
      private: privateCount,
      today: todayHours,
      last24Hours,
      last7Days: Array.from(dailyMap.values()),
      samples,
      note: 'v1 基于 logs/command.*.log 中的插件完成记录统计，非全量聊天消息。',
    })
  }
}
