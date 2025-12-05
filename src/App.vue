<template>
  <div id="app">
    <!-- 移动端遮罩层 -->
    <div v-if="mobileMenuVisible" class="mobile-overlay" @click="closeMobileMenu"></div>

    <!-- 不显示导航的路由直接渲染 -->
    <template v-if="$route.meta.noNav">
      <router-view></router-view>
    </template>
    <!-- 其他路由显示正常布局 -->
    <template v-else>
      <template v-if="shouldShowSideNav">
        <div class="layout-container" :class="{
          'collapsed': isCollapsed && !isMobile,
          'mobile': isMobile,
          'menu-visible': mobileMenuVisible
        }">
          <top-title :should-show-side-nav="shouldShowSideNav" @toggle-sidebar="toggleMobileMenu" />
          <div class="side-nav">
            <!-- 仅在非移动端显示折叠按钮 -->
            <div v-if="!isMobile" class="collapse-btn" @click="toggleCollapse">
              <i :class="isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
            </div>
            <!-- 移动端显示关闭按钮 -->
            <div v-else class="collapse-btn" @click="closeMobileMenu">
              <i class="el-icon-close"></i>
            </div>
            <el-menu :default-active="$route.path" class="side-menu" :collapse="isCollapsed && !isMobile"
              @select="handleMenuSelect">
              <template v-for="(route, index) in filteredRoutes">
                <template v-if="route.divider">
                  <el-divider :key="'divider' + index"></el-divider>
                </template>
                <template v-else>
                  <router-link :to="route.path" :key="route.path">
                    <el-menu-item :index="route.path">
                      <i :class="route.icon"></i>
                      <!-- 使用 v-html 允许在路由标题中渲染少量受控 HTML，例如上标 -->
                      <span slot="title" v-html="route.title"></span>
                    </el-menu-item>
                  </router-link>
                </template>
              </template>
              <!-- 添加退出登录选项 -->
              <el-menu-item index="logout" @click="handleLogout">
                <i class="el-icon-switch-button"></i>
                <span slot="title">退出登录</span>
              </el-menu-item>
            </el-menu>
          </div>
          <div class="main-content">
            <router-view></router-view>
          </div>
        </div>
      </template>
      <template v-else>
        <top-title :should-show-side-nav="shouldShowSideNav" @toggle-sidebar="toggleMobileMenu" />
        <top-navbar></top-navbar>
        <div class="main-content-full">
          <router-view></router-view>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import TopNavbar from '@/components/TopNavbar.vue'
import TopTitle from '@/components/TopTitle.vue'
import { menuRoutes } from '@/config/routes'

export default {
  name: 'App',
  components: {
    TopNavbar,
    TopTitle
  },
  data() {
    return {
      isCollapsed: false,
      isMobile: window.innerWidth <= 768,
      userPowerDegree: [], // 确保初始值是空数组
      mobileMenuVisible: false
    }
  },
  computed: {
    shouldShowSideNav() {
      return this.userPowerDegree.includes(2) || this.userPowerDegree.includes(5)
    },
    filteredRoutes() {
      return menuRoutes.filter(route => {
        if (route.divider) return true
        if (route.requireAdmin && !this.userPowerDegree.includes(5)) return false
        if (route.requireJudgeOrAdmin && !this.userPowerDegree.some(degree => [3, 5].includes(degree))) return false
        return true
      })
    }
  },
  watch: {
    // 监听路由变化
    '$route': {
      immediate: true,
      handler() {
        this.updateUserPowerDegree()
      }
    },
    mobileMenuVisible(val) {
      // 添加这个 watch，用于控制body的滚动
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  methods: {
    toggleCollapse() {
      if (!this.isMobile) {
        this.isCollapsed = !this.isCollapsed
      }
    },
    handleCollapseClick() {
      if (this.isMobile) {
        // 移动端时,点击按钮关闭侧边栏
        this.mobileMenuVisible = false
      } else {
        // PC端保持原有的折叠功能  
        this.isCollapsed = !this.isCollapsed
      }
    },
    // 修改菜单选择处理方法
    handleMenuSelect(index) {
      // 如果点击的是当前路由，不进行跳转
      if (index === this.$route.path) {
        return;
      }
      // 如果是退出登录，直接处理
      if (index === 'logout') {
        this.handleLogout();
        return;
      }
      // 其他情况正常跳转
      this.$router.push(index).catch(err => {
        if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationAborted') {
          console.error('导航错误:', err);
        }
      });
    },
    handleLogout() {
      // 删除认证相关信息
      localStorage.removeItem('token')
      localStorage.removeItem('expiredTime')
      localStorage.removeItem('userInfo')

      // 跳转到登录页面
      this.$router.push('/login')
    },
    handleResize() {
      const wasNotMobile = !this.isMobile
      this.isMobile = window.innerWidth <= 768

      // 只在PC端切换时处理折叠状态
      if (!this.isMobile && !wasNotMobile) {
        this.isCollapsed = window.innerWidth <= 1200
      }
      // 移动端时设置导航栏为关闭状态
      if (this.isMobile) {
        this.mobileMenuVisible = false // 确保移动端时侧边栏关闭
      }
    },
    updateUserPowerDegree() {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        // 确保 powerDegree 是数组
        if (typeof userInfo.powerDegree === 'string') {
          this.userPowerDegree = JSON.parse(userInfo.powerDegree || '[]');
        } else if (Array.isArray(userInfo.powerDegree)) {
          this.userPowerDegree = userInfo.powerDegree;
        } else {
          this.userPowerDegree = [];
        }
      } catch (error) {
        console.error('解析用户权限失败:', error);
        this.userPowerDegree = []; // 出错时设置为空数组
      }
    },
    toggleMobileMenu() {
      this.mobileMenuVisible = !this.mobileMenuVisible
    },
    closeMobileMenu() {
      if (this.isMobile) {
        this.mobileMenuVisible = false
      }
    },
    checkTokenExpiration() {
      const expiredTime = localStorage.getItem('expiredTime')
      if (expiredTime) {
        const currentTime = Date.now()
        if (currentTime > Number(expiredTime)) {
          // 清除认证信息
          localStorage.removeItem('token')
          localStorage.removeItem('expiredTime')
          localStorage.removeItem('userInfo')

          // 如果不在登录页面，则跳转并提示
          if (this.$route.path !== '/login') {
            this.$message.warning('当前登录信息已过期')
            this.$router.push('/login')
          }
        }
      }
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()

    // 添加全局事件监听
    window.addEventListener('storage', (e) => {
      if (e.key === 'userInfo') {
        this.updateUserPowerDegree()
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  created() {
    // 添加token过期检查
    this.checkTokenExpiration()

    // 设置定期检查
    setInterval(this.checkTokenExpiration, 60000) // 每分钟检查一次

    // 添加路由错误处理
    this.$router.onError((error) => {
      console.error('路由错误:', error)
      if (error.name === 'NavigationCancelled') {
        console.warn('导航被取消')
        // 可以在这里添加一些用户提示
        this.$message({
          type: 'info',
          message: '页面切换被中断，请稍后重试'
        })
      }
    })
  }
}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  margin: 0;
  padding: 0;

  .layout-container {
    display: flex;
    height: 100vh;

    &.collapsed {
      .side-nav {
        width: 64px; // 减小折叠时的宽度
      }

      .main-content {
        overflow-y: hidden;
        margin-left: 54px; // 对应减小margin
      }
    }

    .side-nav {
      width: 180px; // 减小展开时的宽度
      height: 100%;
      background-color: #304156;
      transition: width 0.3s;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;

      .collapse-btn {
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }

      .side-menu {
        border: none;
        background-color: transparent;

        .el-menu-item {
          color: #bfcbd9;

          &:hover,
          &.is-active {
            background-color: #263445;
            color: #409EFF;
          }

          i {
            color: inherit;
            margin-right: 16px;
          }
        }

        // 添加退出登录按钮样式
        .el-menu-item[index="logout"] {
          color: #f56c6c;
          position: absolute;
          bottom: 0;
          width: 100%;
          border-top: 1px solid #1f2d3d;

          &:hover,
          &.is-active {
            background-color: #263445;
            color: #f56c6c;
          }

          i {
            color: inherit;
          }
        }
      }

      .el-divider {
        background-color: #1f2d3d;
        margin: 4px 0;
      }
    }

    .main-content {
      flex: 1;
      margin-left: 180px; // 对应减小margin
      // padding: 20px;
      box-sizing: border-box;
      transition: margin-left 0.3s;
      // overflow-y: auto;
    }

    &.mobile {
      .side-nav {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      &.menu-visible .side-nav {
        transform: translateX(0);
      }

      &.menu-visible {
        .main-content {
          position: fixed; // 菜单打开时固定主内容区
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      }

      .main-content {
        -webkit-overflow-scrolling: touch; // 添加弹性滚动
        //overflow-y: auto !important; // 强制允许滚动
        padding-bottom: 60px !important; // 为底部导航预留空间
        height: calc(100vh - 50px); // 减去顶部标题栏高度
      }
    }
  }

  .main-content-full {
    padding: 50px 20px 20px;
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
    height: calc(100vh - 110px); // 110px = 顶部导航(50px) + 底部导航(60px)
    padding-bottom: 60px !important;
  }

  // 添加移动端适配
  @media screen and (max-width: 768px) {
    width: 100%; // 100/0.75，确保缩放后内容仍然占满屏幕
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;

    // 移除之前的font-size调整
    // font-size: 14px;

    .layout-container {
      padding-top: 68px; // 为顶部标题栏留出空间

      .main-content {
        padding-top: 0 !important; // 移除内容区域的额外上边距
      }
    }

    .main-content-full {
      padding-top: 65px !important; // 为顶部标题栏留出空间
      padding: 0;
      width: 100%; // 使用100%而不是100vw
      overflow-x: hidden;
    }

    .main-content {
      margin-left: 0 !important;
      // padding-top: 50px !important; // 为顶部标题栏留出空间
      // padding: 10px !important;
    }
  }

  .mobile-menu-btn {
    position: fixed;
    top: 10px;
    left: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1001;

    i {
      font-size: 24px;
      color: #409EFF;
    }
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    overflow: hidden; // 禁止遮罩层滚动
    -webkit-backdrop-filter: blur(2px); // 添加模糊效果
    backdrop-filter: blur(2px);
  }
}

// 去除 router-link 的默认样式
a {
  text-decoration: none;
  color: inherit;
}
</style>
