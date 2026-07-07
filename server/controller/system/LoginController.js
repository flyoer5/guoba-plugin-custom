import chalk from 'chalk';
import {autowired, Result} from '#guoba.framework';
import {ApiController} from '#guoba.platform'

export class LoginController extends ApiController {

  loginService = autowired('loginService')

  constructor(guobaApp) {
    super('', guobaApp)
  }

  registerRouters() {
    this.post('/login', this.login)
    this.post('/logout', this.logout)
    // 主人快速登录
    this.post('/login/quick', this.quickLogin)
    // 前端固定密码登录（兼容旧 code 接口）
    this.post('/login/code/request', this.codeLoginRequest)
    this.post('/login/code/check', this.codeLoginCheck)
    this.post('/login/password/request', this.codeLoginRequest)
    this.post('/login/password/check', this.codeLoginCheck)
  }

  async login(req) {
    // let {username, password} = req.body
    // if (username === 'admin' && password === 'admin') {
    //   let token = this.loginService.signToken(username)
    //   return Result.ok({token})
    // }
    // return Result.error('用户名或密码错误')
    return Result.error('请使用“#锅巴登录”')
  }

  async logout(req) {
    let {token} = req.body
    this.loginService.logout(token)
    return Result.ok('注销成功')
  }

  async quickLogin(req) {
    let {code} = req.body
    return Result.ok(await this.loginService.getQuickLogin(code))
  }

  async codeLoginRequest() {
    const code = await this.loginService.codeLoginRequest()
    if (code) {
      logger.mark('[Guoba] '
        + chalk.yellow('您正在请求固定密码登录，若没有输出提示，请将日志级别调整为 ')
        + chalk.green('info')
        + chalk.yellow(' 或以上')
      )
      logger.info('#'.repeat(54))
      logger.info('# ' + chalk.green('[Guoba] 固定密码登录请求') + '                             #')
      logger.info('# 请使用已配置的固定登录密码完成登录                 #')
      logger.info('# 登录有效期以 Guoba 配置为准                         #')
      logger.info('# ' + chalk.red('若非本人操作请忽略并考虑是否泄露了登录地址') + '         #')
      logger.info('#'.repeat(54))
      return Result.ok({}, 'password ready')
    }
    return Result.error('password prepare failed')
  }

  async codeLoginCheck(req) {
    let {code} = req.body
    code = typeof code === 'string' ? code.trim() : code
    const token = await this.loginService.codeLoginCheck(code)
    if (token) {
      logger.mark('[Guoba] 固定密码登录成功')
      return Result.ok({token})
    }
    return Result.error('密码错误')
  }

}
