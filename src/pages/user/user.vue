<template>
  <!-- 页面容器 -->
  <view class="profile-container">
    <!-- 全局提示组件 -->
    <van-toast ref="vanToast"></van-toast>

    <!-- 用户信息卡片 -->
    <van-cell-group class="user-card">
      <van-cell :border="false">
        <template #icon>
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img :src="userInfo.avatar || '/static/user.png'" class="avatar-image" @click="showAvatarDialog = true"
                @error="handleAvatarError" />
              <van-tag v-if="userInfo.isVip" type="danger" class="vip-tag">VIP</van-tag>
            </div>
          </div>
        </template>
        <template #title>
          <div class="user-info">
            <div class="nickname-wrapper">
              <span class="nickname">{{ userInfo.nickname }}</span>
              <van-icon name="edit" class="edit-icon" @click="showNicknameDialog = true" />
            </div>
            <div class="user-meta">
              <span class="meta-item">ID: 10086</span>
              <span class="meta-divider">|</span>
              <span class="meta-item">注册2年</span>
            </div>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 功能入口 -->
    <van-cell-group class="function-card">
      <van-grid :column-num="4" class="function-grid">
        <van-grid-item v-for="(item, index) in functions" :key="index" :icon="item.icon" :text="item.title"
          @click="item.handler" />
      </van-grid>
    </van-cell-group>

    <!-- 服务列表 -->
    <van-cell-group title="常用服务" class="service-card">
      <van-cell v-for="(service, index) in services" :key="index" :title="service.name" :icon="service.icon" clickable
        @click="service.handler">
      </van-cell>
    </van-cell-group>

    <!-- 头像选择弹窗 -->
    <van-popup v-model="showAvatarDialog" position="left" round>
      <div class="avatar-popup">
        <van-grid :column-num="3" class="avatar-grid">
          <van-grid-item v-for="(url, index) in avatarUrls" :key="index" @click="selectAvatar(url)">
            <img width="80rpx" height="80rpx" :src="url" :class="{ selected: selectedAvatar === url }" />
          </van-grid-item>
          <van-grid-item @click="uploadLocalImage">
            <van-icon name="plus" size="40rpx" />
            <div class="upload-text">本地图片</div>
          </van-grid-item>
        </van-grid>
        <div class="popup-buttons">
          <van-button plain @click="showAvatarDialog = false">取消</van-button>
          <van-button type="primary" @click="confirmAvatar">确认</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 昵称修改弹窗 -->
    <van-popup v-model="showNicknameDialog" position="right" round :close-on-click-overlay="false">
      <div class="nickname-popup">
        <van-field v-model="tempNickname" label="新昵称" placeholder="请输入2-12个字符" maxlength="12" clearable />
        <div class="popup-buttons">
          <van-button plain @click="showNicknameDialog = false">取消</van-button>
          <van-button type="primary" @click="saveNickname" :disabled="!tempNickname.trim()">保存</van-button>
        </div>
      </div>
    </van-popup>

    <van-share-sheet v-model="showShare" title="立即分享给好友" :options="options" @select="onSelect" />
  </view>
</template>

<script>
import { Toast, Tag, ShareSheet } from 'vant';

export default {
  components: {
    [Tag.name]: Tag,
    [ShareSheet.name]: ShareSheet
  },
  data() {
    return {
      // 用户信息（从本地存储读取）
      userInfo: {
        nickname: localStorage.getItem('userNickname') || '新用户', // 默认昵称
        avatar: localStorage.getItem('userAvatar') || '', // 用户头像
        isVip: false // VIP状态
      },
      showAvatarDialog: false, // 头像弹窗显示状态
      showNicknameDialog: false, // 昵称弹窗显示状态
      tempNickname: '', // 临时存储修改的昵称
      avatarUrls: [ // 预设头像列表
        '/static/people.png',
        '/static/image1.png',
        '/static/image2.png',
        '/static/image3.png',
        '/static/image4.png',
        '/static/image8.png',
        '/static/image9.png',
      ],
      showShare: false, // 控制分享面板显示
      options: [
        {
          name: '微信',
          icon: 'https://img.yzcdn.cn/vant/share-sheet-wechat.png',
          openType: 'share'
        },
        {
          name: '微博',
          icon: 'https://img.yzcdn.cn/vant/share-sheet-weibo.png',
          callback: () => Toast('微博分享')
        },
        {
          name: '复制链接',
          icon: 'link',
          callback: () => {
            uni.setClipboardData({
              data: window.location.href,
              success: () => Toast.success('链接已复制')
            })
          }
        },
        {
          name: '分享海报',
          icon: 'https://img.yzcdn.cn/vant/share-sheet-poster.png',
          callback: this.generatePoster
        },
        {
          name: '二维码',
          icon: 'https://img.yzcdn.cn/vant/share-sheet-qrcode.png',
          callback: this.showQrcode
        }
      ],
      selectedAvatar: '',
      // 功能入口配置
      functions: [
        {
          icon: 'todo-list',
          title: '预约',
          handler: this.goToReservation // 路由跳转方法
        },
        {
          icon: 'search',
          title: '搜索',
          handler: this.goToRecords
        },
        {
          icon: 'coupon',
          title: '费用',
          handler: this.goToCoupon
        },
        {
          icon: 'setting',
          title: '设置',
          handler: this.goToSettings
        }
      ],
      // 服务列表配置
      services: [
        {
          icon: 'comment',
          name: '我的评价',
          handler: this.goToComments // 路由跳转方法
        },
        {
          icon: 'star',
          name: '我的收藏',
          handler: this.goToFavorites
        },
        {
          icon: 'service',
          name: '帮助中心',
          handler: this.goToHelp
        },
        {
          icon: 'share',
          name: '分享APP',
          handler: () => this.showShare = true // 直接触发分享面板
        }
      ]
    };
  },
  methods: {
    // 路由跳转方法组
    goToReservation() {
      this.$router.push('/pages/reservation/reservation');
    },
    goToRecords() {
      this.$router.push('/pages/reservation/search');
    },
    goToCoupon() {
      this.$router.push('/pages/reservation/cost');
    },
    goToSettings() {
      this.$router.push('/pages/setting/setting');
    },
    goToComments() {
      this.$router.push('/pages/comment/comment');
    },
    goToFavorites() {
      this.$router.push('/pages/favorite/favorite');
    },
    goToHelp() {
      this.$router.push('/pages/help/help');
    },
    // 选择头像处理
    selectAvatar(url) {
      this.selectedAvatar = url;
      this.showFeedback(`已选择头像${this.avatarUrls.indexOf(url) + 1}`, 'info');
    },
    // 确认更换头像
    async confirmAvatar() {
      if (!this.selectedAvatar) {
        this.showFeedback('请先选择头像', 'warning');
        return;
      }

      try {
        uni.showLoading({ title: '更新中...', mask: true });

        await new Promise(resolve => setTimeout(resolve, 1000));

        this.userInfo.avatar = this.selectedAvatar;
        localStorage.setItem('userAvatar', this.selectedAvatar);
        this.showAvatarDialog = false;
        this.showFeedback('头像更换成功', 'success');

      } catch (error) {
        this.showFeedback('头像更新失败', 'error');
      } finally {
        uni.hideLoading();
      }
    },
    // 上传本地图片
    async uploadLocalImage() {
      try {
        const res = await uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        });

        if (res.tempFilePaths.length > 0) {
          this.selectedAvatar = res.tempFilePaths[0];
          this.showFeedback('已选择本地图片', 'info');
        }
      } catch (error) {
        this.showFeedback('图片选择失败', 'error');
      }
    },
    // 保存昵称
    saveNickname() {
      if (this.tempNickname.trim().length < 2) {
        this.showFeedback('昵称至少需要2个字符', 'warning');
        return;
      }

      if (this.tempNickname.trim().length > 12) {
        this.showFeedback('昵称不能超过12个字符', 'warning');
        return;
      }

      this.userInfo.nickname = this.tempNickname.trim();
      localStorage.setItem('userNickname', this.userInfo.nickname);
      this.showNicknameDialog = false;
      this.showFeedback('昵称修改成功', 'success');
    },
    // 全局提示封装
    showFeedback(message, type = 'success') {
      Toast({
        message,
        position: 'top',
        duration: 2000
      });
    },
    handleAvatarError(e) {
      console.error('头像加载失败', e);
      this.showFeedback('头像加载失败', 'error');
    },
    handleAvatarButtonClick() {
      this.showAvatarDialog = true;
      this.selectedAvatar = this.userInfo.avatar;
    },
    // 新增分享处理方法
    onSelect(option) {
      this.showShare = false;
      if (option.callback) {
        option.callback();
      }
    },
    generatePoster() {
      Toast.loading({
        message: '生成中...',
        forbidClick: true
      });
      // 实际项目需实现海报生成逻辑
      setTimeout(() => {
        Toast.success('海报已保存到相册');
      }, 1500);
    },
    showQrcode() {
      uni.previewImage({
        urls: ['/static/qrcode.png'],
        current: 0
      });
    }
  },
  watch: {
    // 监听弹窗显示状态初始化数据
    showNicknameDialog(newVal) {
      if (newVal) {
        this.tempNickname = this.userInfo.nickname;
      }
    },
    showAvatarDialog(newVal) {
      if (newVal) {
        this.selectedAvatar = this.userInfo.avatar;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/* 页面整体容器样式 */
.profile-container {
  padding: 20rpx 30rpx;
  background: var(--background);
  min-height: 100vh;
}

/* 用户信息卡片样式 */
.user-card {
  margin-bottom: 32rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 24rpx rgba(0, 0, 0, 0.08);
  background: var(--card-bg);

  .avatar-section {
    position: relative;
    margin-right: 40rpx;

    .avatar-wrapper {
      position: relative;
      width: 180rpx;
      height: 180rpx;

      .avatar-image {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 4rpx solid #fff;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
        transition: transform 0.3s;

        &:active {
          transform: scale(0.95);
        }
      }

      .vip-tag {
        position: absolute;
        bottom: 0;
        right: 0;
        transform: translate(30%, -30%);
      }
    }

    .change-btn {
      position: absolute;
      bottom: -16rpx;
      right: 0;
      min-width: 140rpx;
      height: 56rpx;
      font-size: 24rpx;
      border-radius: 40rpx;
      background: linear-gradient(45deg, #3498db, #67a2e0);
      color: white;
      box-shadow: 0 4rpx 12rpx rgba(52, 152, 219, 0.3);
    }
  }

  .user-info {
    .nickname-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

      .nickname {
        font-size: 40rpx;
        font-weight: 600;
        color: var(--text-primary);
        margin-right: 20rpx;
      }

      .edit-icon {
        color: #3498db;
        padding: 8rpx;
        border-radius: 50%;
        background: rgba(52, 152, 219, 0.1);
      }
    }

    .user-meta {
      display: flex;
      align-items: center;
      color: var(--text-secondary);
      font-size: 24rpx;

      .meta-divider {
        margin: 0 20rpx;
        color: #ddd;
      }
    }
  }
}

/* 功能卡片样式 */
.function-card {
  margin: 32rpx 0;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.05);
  background: var(--card-bg);
  border: 1px solid var(--border-color);

  .function-grid {
    padding: 20rpx 0;
	background: var(--background);

    ::v-deep .van-grid-item__content {
      padding: 32rpx 0;
	  background: var(--border-color);

      .van-icon {
        font-size: 64rpx;
        margin-bottom: 16rpx;
        color: #3498db;
      }

      &::after {
        border: none;
      }
    }
  }

  .van-grid-item__text {
    color: var(--text);
  }
}

/* 服务列表样式 */
.service-card {
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.06);

  ::v-deep .van-cell {
    padding: 32rpx;
    transition: all 0.3s;
    background: var(--card-bg);
    color: var(--text);

    &:active {
      background-color: #f8f9fa;
    }

    &::after {
      left: 32rpx;
      right: 32rpx;
    }

    .van-icon {
      font-size: 40rpx;
      margin-right: 24rpx;
      color: #7f8c8d;
    }
  }
}

/* 弹窗通用样式 */
.avatar-popup,
.nickname-popup {
  padding: 20px;

  .popup-buttons {
    display: flex;
    gap: 16px;
    margin-top: 20px;

    .van-button {
      flex: 1;
    }
  }
}

/* 选中状态样式 */
.selected {
  border: 2px solid #07c160;
  box-shadow: 0 2px 6px rgba(7, 193, 96, 0.3);
}

.avatar-image {
  border-radius: 50%;
  display: block;

  &.selected {
    border: 2px solid #07c160;
    box-shadow: 0 2px 6px rgba(7, 193, 96, 0.3);
  }

  &:not([src]) {
    background: var(--button-hover);

    &::after {
      content: "头像加载失败";
      color: var(--text-secondary);
    }
  }
}

.van-button--primary {
  background: var(--primary-color);
  color: var(--text-inverse) !important;
  border-color: var(--primary-color);

  &:active {
    filter: brightness(0.8);
  }
}

.user-header {
  background: var(--card-bg);

  .avatar {
    border: 2px solid var(--primary-color);
  }

  .user-name {
    color: var(--text-primary);
  }
}

.van-cell-group {
  background: transparent;

  .van-cell {
    background: var(--card-bg);
    color: var(--text-primary);

    &__label {
      color: var(--text-secondary);
    }
  }
}
</style>