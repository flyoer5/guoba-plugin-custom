import {autowired, Result} from '#guoba.framework';
import {ApiController, PluginsMap} from '#guoba.platform'

export default class MiaoPluginController extends ApiController {

  constructor(guobaApp) {
    super('/plugin/miao', guobaApp)
  }

  async registerRouters() {
    // Disabled in this environment: miao-specific web routes may trigger
    // service injection timing issues (pluginService is not found).
    return
  }

  async getMiaoHelpCfg() {
    let setting = await this.miaoService.getHelpSetting()
    let miaoVersion = this.miaoVersion.version
    let yunzaiVersion = this.miaoVersion.yunzai
    return Result.ok({...setting, miaoVersion, yunzaiVersion})
  }

  async saveMiaoHelpCfg(req) {
    this.miaoService.saveHelpSetting(req.body, req.files)
    return Result.ok()
  }

  getHelpThemeBg(req, res) {
    res.sendFile(this.miaoService.getThemeBgPath(req.query))
    return Result.VOID
  }

  getHelpThemeMain(req, res) {
    res.sendFile(this.miaoService.getThemeMainPath(req.query))
    return Result.VOID
  }

  async getHelpThemeList() {
    let list = await this.miaoService.getHelpThemeList()
    return Result.ok(list)
  }

  async getHelpThemeConfig(req, res) {
    let config = await this.miaoService.getHelpThemeConfig(req.query)
    return Result.ok(config)
  }

  async saveHelpThemeConfig(req) {
    await this.miaoService.saveHelpThemeConfig(req.body)
    return Result.ok('保存成功~')
  }

  async deleteHelpTheme(req) {
    await this.miaoService.deleteHelpTheme(req.body)
    return Result.ok('删除成功~')
  }

  async addHelpTheme(req) {
    await this.miaoService.addHelpTheme(req.body, req.files)
    return Result.ok('新增成功~')
  }

  async putHelpTheme(req) {
    await this.miaoService.editHelpTheme(req.body, req.files)
    return Result.ok('修改成功~')
  }

  getHelpIcon(req, res) {
    res.sendFile(this.miaoService.miaoPath.iconPath)
    return Result.VOID
  }

  getBackupList() {
    let {backupList} = this.miaoService.getBackupCfg()
    return Result.ok(backupList)
  }

  addBackup(req) {
    let {remark} = req.body
    this.miaoService.addBackup(remark)
    return Result.ok()
  }

  async restoreBackup(req) {
    let {id} = req.body
    await this.miaoService.restoreBackup(id)
    return Result.ok()
  }

  deleteBackup(req) {
    let {id} = req.body
    this.miaoService.deleteBackup(id)
    return Result.ok()
  }

}
