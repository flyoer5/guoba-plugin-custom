# Guoba Custom

一个基于 `Guoba-Plugin` 定制的**自用精简版后台面板**，面向当前这套 TRSS / Yunzai 使用环境进行收口和优化。

这个版本不追求把锅巴原有能力全部保留，而是只保留当前真正需要用到的管理功能，并对页面与交互进行了简化。

---

## 当前保留功能

- [x] 固定密码登录
- [x] 配置文件管理
- [x] plugin 插件管理
  - [x] plugin 插件配置
  - [x] 安装、卸载 plugin 插件
- [x] Cookie 用户管理
  - [x] Cookie 脱敏显示
  - [x] 修改 Cookie / 设备
  - [x] 删除 Cookie 记录
- [x] JS 插件管理（仅 `plugins/example`）
  - [x] 列表查看
  - [x] 导入
  - [x] 导出
  - [x] 删除

---

## 已移除 / 不保留功能

当前版本已明确移除以下页面入口或功能方向：

- [x] 运行状态
- [x] 使用统计
- [x] 垃圾清理
- [x] 多余的账号管理空页面
- [x] 不需要的登录方式入口

> 说明：这里的“移除”指当前版本不再作为面板入口保留，不代表上游原版锅巴不存在这些能力。

---

## 当前页面说明

### 1. 配置管理
用于管理当前保留的配置项。

### 2. 插件管理
用于查看、安装、卸载和配置支持锅巴的 plugin 插件。

### 3. Cookie 用户管理
当前只展示以下字段：

- QQ
- Cookie（脱敏）
- 设备
- 时间
- 操作

支持：

- 修改 Cookie
- 修改设备
- 删除记录

Cookie 列表默认脱敏显示，例如：

```text
ltoken=v***27610;
```

修改时使用页面内弹窗，不再使用浏览器原生 `prompt`。

### 4. JS 插件管理
只管理：

```text
plugins/example/*.js
```

当前只展示：

- 名字
- 大小
- 时间

支持：

- 导入 `.js` 文件
- 导出单个 `.js` 文件
- 删除单个 `.js` 文件

---

## 登录说明

当前版本已改成固定密码登录方式。

登录页不再保留多余的注册、短信、扫码、忘记密码等流程入口，仅保留当前自用场景需要的方式。

---

## 安装方式

### 1. 克隆仓库

在 Yunzai 根目录下执行：

```bash
git clone --depth=1 https://github.com/flyoer5/guoba-plugin-custom.git ./plugins/Guoba-Plugin/
```

如果你保留的是这个仓库当前 `main` 分支，则直接按上面的方式拉取即可。

### 2. 安装依赖

如果你当前环境使用的是 `pnpm`：

```bash
pnpm install --filter=guoba-plugin
```

如果你使用的是其他包管理方式，请按你自己的运行环境处理依赖安装。

---

## 运行说明

依赖安装完成后，正常启动 Yunzai / TRSS 即可。

启动完成后，在控制台里找到 Guoba 页面地址并使用浏览器访问。

---

## 适用定位

这个仓库不是一个追求“完整复刻上游所有特性”的版本，而是：

```text
更适合自用、精简、保留核心管理能力的 Guoba Custom 版本
```

如果你希望保留锅巴原版完整功能，请使用上游仓库。

---

## 上游项目

- Guoba-Plugin
  - https://github.com/guoba-yunzai/guoba-plugin
- TRSS-Yunzai / Yunzai 相关生态
- 相关 plugin 插件项目（genshin / miao-plugin / xiaoyao-cvs-plugin 等）

---

## 说明

本仓库当前内容已经按实际使用需求做过较大幅度收口，请不要直接按上游 README 的功能范围来理解这个版本。
