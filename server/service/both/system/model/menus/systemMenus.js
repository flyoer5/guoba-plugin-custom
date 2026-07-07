// noinspection JSUnusedGlobalSymbols
export const SystemMenus = {
  // 首页菜单
  home: {
    path: '/home',
    name: 'Home',
    component: '/guoba/home/index',
    meta: {
      title: '首页',
      icon: 'bx:bx-home',
    },
  },
  // Cookie用户管理
  account: {
    path: '/account',
    name: 'Account',
    component: '/guoba/system/account/index',
    meta: {
      title: 'Cookie用户管理',
      icon: 'ant-design:user-outlined',
    },
  },
  // 配置管理
  config: {
    path: '/config',
    name: 'Config',
    component: '/guoba/config/index',
    meta: {
      title: '配置管理',
      icon: 'ion:settings-outline',
    },
  },
  // JS插件管理
  jsPlugin: {
    path: '/js-plugin',
    name: 'jsPlugin',
    component: '/guoba/system/account/index',
    meta: {
      title: 'JS插件管理',
      icon: 'mdi:language-javascript',
    },
  },
}