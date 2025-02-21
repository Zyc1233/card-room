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
            <img width="160rpx" height="160rpx" :src="userInfo.avatar || 'static/own.png'"
              @click="showAvatarDialog = true" @error="handleAvatarError" class="avatar-image" />
            <van-button size="mini" class="change-btn" @click="showAvatarDialog = true">更换</van-button>
          </div>
        </template>
        <template #title>
          <div class="user-info">
            <div class="nickname-wrapper">
              <span class="nickname">{{ userInfo.nickname }}</span>
              <van-icon name="edit" size="16px" @click="showNicknameDialog = true" />
            </div>
            <van-tag v-if="userInfo.isVip" type="warning" mark>VIP会员</van-tag>
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
    <van-popup v-model="showAvatarDialog" position="bottom" round>
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
    <van-popup v-model="showNicknameDialog" position="bottom" round :close-on-click-overlay="false">
      <div class="nickname-popup">
        <van-field v-model="tempNickname" label="新昵称" placeholder="请输入2-12个字符" maxlength="12" clearable />
        <div class="popup-buttons">
          <van-button plain @click="showNicknameDialog = false">取消</van-button>
          <van-button type="primary" @click="saveNickname" :disabled="!tempNickname.trim()">保存</van-button>
        </div>
      </div>
    </van-popup>
  </view>
</template>

<script>
import { Toast, Tag } from 'vant';

export default {
  components: {
    [Tag.name]: Tag,
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
      selectedAvatar: '',
      // 功能入口配置
      functions: [
        {
          icon: 'todo-list',
          title: '预约',
          handler: this.goToReservation // 路由跳转方法
        },
        {
          icon: 'clock',
          title: '记录',
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
      this.$router.push('/pages/reservation/check');
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
  background: linear-gradient(180deg, #f5f7fa 0%, #f0f2f5 100%);
  min-height: 100vh;
}

/* 用户信息卡片样式 */
.user-card {
  margin-bottom: 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.06);
  background: #fff;

  .avatar-section {
    position: relative;
    margin-right: 40rpx;

    .avatar-image {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      border: 4rpx solid #fff;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
    }

    .change-btn {
      bottom: -16rpx;
      min-width: 120rpx;
      height: 56rpx;
      font-size: 24rpx;
      border-radius: 40rpx;
    }
  }

  .user-info {
    .nickname-wrapper {
      margin-bottom: 16rpx;

      .nickname {
        font-size: 36rpx;
        font-weight: 600;
        color: #2c3e50;
        letter-spacing: 0.5rpx;
      }

      .van-icon-edit {
        color: #3498db;
        margin-left: 16rpx;
      }
    }

    .van-tag {
      padding: 8rpx 24rpx;
      font-size: 24rpx;
      border-radius: 40rpx;
    }
  }
}

/* 功能卡片样式 */
.function-card {
  margin: 32rpx 0;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.06);

  .function-grid {
    padding: 20rpx 0;

    ::v-deep .van-grid-item__content {
      padding: 32rpx 0;

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
}

/* 服务列表样式 */
.service-card {
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.06);

  ::v-deep .van-cell {
    padding: 32rpx;
    transition: all 0.3s;

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
}
</style>