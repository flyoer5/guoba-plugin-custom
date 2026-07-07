import fs from 'fs'
import os from 'os'
import path from 'path'
import lodash from 'lodash'
import {execSync} from 'child_process'
import {_paths, ApiController} from '#guoba.platform'
import {autowired, Result} from '#guoba.framework'

/**
 * 首页相关查询
 */
export class HomeController extends ApiController {

  botService = autowired('botService')
  oicqService = autowired('oicqService')

  constructor(guobaApp) {
    super('/home', guobaApp)
  }

  registerRouters() {
    this.get('/data', this.getHomeData)
    this.get('/runtime-status', this.getRuntimeStatus)
    this.get('/random-image', this.randomImage)
  }

  /** 获取首页数据 */
  async getHomeData() {
    return Result.ok({
      cookieCount: await this.botService.getCookieCount(),
      friendCount: await this.oicqService.getFriendCount(),
      groupCount: await this.oicqService.getGroupCount(),
    })
  }


  async getRuntimeStatus() {
    const safeExec = (cmd) => {
      try {
        return String(execSync(cmd, { encoding: 'utf8' })).trim()
      } catch {
        return ''
      }
    }
    const mem = process.memoryUsage()
    const rssMB = Math.round(mem.rss / 1024 / 1024)
    const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024)
    const totalMB = Math.round(os.totalmem() / 1024 / 1024)
    const freeMB = Math.round(os.freemem() / 1024 / 1024)
    const load = os.loadavg().map(v => Number(v.toFixed(2)))
    const redisActive = safeExec('redis-cli ping 2>/dev/null') === 'PONG'
    const wsInfo = safeExec("pm2 logs TRSS-Yunzai --lines 40 --nostream 2>/dev/null | tail -80")
    const botConnected = /已连接/.test(wsInfo)
    const listening2536 = safeExec("ss -lntp | grep ':2536' | head -1")
    return Result.ok({
      appTitle: 'Guoba Custom',
      yunzaiOnline: true,
      guobaOnline: true,
      redisOnline: redisActive,
      botConnected,
      botUin: Bot?.uin || '',
      botNickname: Bot?.nickname || '',
      httpPort: 2536,
      mountPath: '/guoba',
      process: {
        pid: process.pid,
        uptimeSec: Math.floor(process.uptime()),
        rssMB,
        heapUsedMB,
      },
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        node: process.version,
        totalMB,
        freeMB,
        load,
        cpuCount: os.cpus()?.length || 0,
      },
      network: {
        listening2536: Boolean(listening2536),
        listeningText: listening2536,
      },
      business: {
        cookieCount: await this.botService.getCookieCount(),
        friendCount: await this.oicqService.getFriendCount(),
        groupCount: await this.oicqService.getGroupCount(),
      }
    })
  }

  // 随机角色图片
  randomImage(req, res) {
    let imgPath = this.getRandomRoleImage()
    if (imgPath != null) {
      res.sendFile(imgPath)
    } else {
      res.sendFile(path.join(_paths.pluginResources, 'images/no-miao.png'))
    }
    return Result.VOID
  }

  // 安装了喵喵插件后，获取随机角色图片
  getRandomRoleImage() {
    if (!this.dirPaths) {
      let miaoPath = path.join(_paths.root, 'plugins', 'miao-plugin')
      this.dirPaths = [
        path.join(miaoPath, 'resources/character-img'),
        path.join(miaoPath, 'resources/miao-res-plus/character-img'),
      ]
      this.dirPaths = this.dirPaths.filter(p => fs.existsSync(p))
    }
    if (this.dirPaths.length === 0) {
      return null
    }
    let dirPath = lodash.sample(this.dirPaths)
    let rolePaths = []
    fs.readdirSync(dirPath).forEach(p => rolePaths.push(path.join(dirPath, p)))
    if (rolePaths.length === 0) {
      return null
    }
    let rolePath = null
    let picPaths = []
    for (let i = 0; i < 10; i++) {
      rolePath = lodash.sample(rolePaths)
      if (fs.statSync(rolePath).isDirectory()) {
        picPaths = []
        fs.readdirSync(rolePath).filter((p) => /\.(jpg|png|jpeg|webp)$/i.test(p)).forEach(p => picPaths.push(path.join(rolePath, p)))
        // 好可怜，居然一张图片都没有，最多尝试10次
        if (picPaths.length > 0) {
          break
        }
      } else {
        rolePath = null
      }
    }
    if (picPaths.length === 0) {
      return null
    }
    return lodash.sample(picPaths)
  }

}
