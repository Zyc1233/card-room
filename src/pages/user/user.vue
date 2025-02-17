<template>
  <view class="profile-container">
    <u-toast ref="uToast"></u-toast>

    <div class="profile-header">
      <div class="avatar-wrapper">
        <u-avatar 
          :src="userInfo.avatar || 'static/own.png'" 
          size="150"
          @click="handleAvatarButtonClick"
          class="custom-avatar"
        ></u-avatar>
        <u-button 
          @click="handleAvatarButtonClick" 
          shape="circle" 
          type="primary"
          class="change-avatar-btn"
        >更换头像</u-button>
      </div>

      <u-cell 
        :title="userInfo.nickname" 
        is-link 
        @click="showNicknameDialog = true"
        class="nickname-cell"
        :border="false"
      ></u-cell>
    </div>

    <u-grid :col="4" :border="false" class="buttons-section">
      <u-grid-item 
        v-for="(btn, index) in buttons" 
        :key="index"
        @click="btn.handler"
      >
        <u-image 
          :src="btn.icon" 
          width="50" 
          height="50"
          class="button-icon"
        ></u-image>
        <text class="button-text">{{ btn.text }}</text>
      </u-grid-item>
    </u-grid>

    <!-- 自定义头像选择弹窗 -->
    <view class="custom-modal" v-if="showAvatarDialog">
      <view class="modal-mask" @click="showAvatarDialog = false"></view>
      <view class="modal-container">
        <view class="modal-header">
          <text class="modal-title">选择头像</text>
          <u-icon 
            name="close" 
            size="24" 
            @click="showAvatarDialog = false"
            class="close-icon"
          ></u-icon>
        </view>
        
        <scroll-view class="modal-content" scroll-y>
          <view class="avatar-grid">
            <view class="avatar-item" @click="uploadLocalImage">
              <view class="upload-box">
                <u-icon name="plus" size="40" color="#999"></u-icon>
                <text class="upload-text">本地图片</text>
              </view>
            </view>
            
            <view 
              v-for="(url, index) in avatarUrls" 
              :key="index" 
              class="avatar-item"
              @click="selectAvatar(url)"
            >
              <u-avatar 
                :src="url" 
                size="80"
                :class="['avatar-option', { selected: selectedAvatar === url }]"
              ></u-avatar>
            </view>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <u-button 
            type="primary" 
            @click="confirmAvatar"
            class="confirm-btn"
          >确认</u-button>
          <u-button 
            plain 
            @click="showAvatarDialog = false"
            class="cancel-btn"
          >取消</u-button>
        </view>
      </view>
    </view>

    <!-- 自定义昵称修改弹窗 -->
    <view class="custom-modal" v-if="showNicknameDialog">
      <view class="modal-mask" @click="showNicknameDialog = false"></view>
      <view class="modal-container nickname-modal">
        <view class="modal-header">
          <text class="modal-title">修改昵称</text>
          <u-icon 
            name="close" 
            size="24" 
            @click="showNicknameDialog = false"
            class="close-icon"
          ></u-icon>
        </view>
        
        <view class="modal-content">
          <u-input 
            v-model="tempNickname" 
            placeholder="请输入新昵称"
            maxlength="12"
            border="bottom"
            @confirm="saveNickname"
            class="nickname-input"
          ></u-input>
        </view>
        
        <view class="modal-footer">
          <u-button plain @click="showNicknameDialog = false" class="cancel-btn">取消</u-button>
          <u-button type="primary" @click="saveNickname" class="confirm-btn">确定</u-button>
        </view>
      </view>
    </view>

    <bottom-nav></bottom-nav>
  </view>
</template>

<script>
import BottomNav from '@/pages/BottomNav/BottomNav.vue';

export default {
  components: {
    BottomNav
  },
  data() {
    return {
      userInfo: {
        nickname: localStorage.getItem('userNickname') || '新用户',
        avatar: localStorage.getItem('userAvatar') || ''
      },
      showAvatarDialog: false,
      showNicknameDialog: false,
      tempNickname: '',
      avatarUrls: [
        '/static/people.png',
        '/static/image1.png',
        '/static/image2.png',
		'/static/image3.png',
		'/static/image4.png',
		'/static/image8.png',
		'/static/image9.png',
      ],
      selectedAvatar: '',
      buttons: [
        { icon: 'static/register.png', text: '注册', handler: this.goToRegister },
        { icon: 'static/check.png', text: '记录', handler: this.goToRecords },
        { icon: 'static/call.png', text: '关于', handler: this.goToContact },
        { icon: 'static/setting.png', text: '设置', handler: this.goToSettings }
      ]
    };
  },
  methods: {
    goToRegister() {
      this.$router.push('/pages/login/register');
    },
    goToRecords() {
      this.$router.push('/pages/reservation/check');
    },
    goToContact() {
      this.$router.push('/pages/call/call');
    },
    goToSettings() {
      this.$router.push('/pages/setting/setting');
    },
    selectAvatar(url) {
      this.selectedAvatar = url;
      this.showFeedback(`已选择头像${this.avatarUrls.indexOf(url) + 1}`, 'info');
    },
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
    saveNickname() {
      if (this.tempNickname.trim()) {
        this.userInfo.nickname = this.tempNickname.trim();
        localStorage.setItem('userNickname', this.userInfo.nickname);
        this.showNicknameDialog = false;
        this.showFeedback('昵称修改成功', 'success');
      } else {
        this.showFeedback('昵称不能为空', 'error');
      }
    },
    showFeedback(message, type = 'success') {
      this.$refs.uToast.show({
        title: message,
        type: type,
        duration: 2000
      })
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

<style scoped>
.profile-container {
  padding: 30rpx;
  min-height: 100vh;
  background: #f8f8f8;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 40rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 20rpx;
  margin: 30rpx 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.custom-avatar {
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  margin-right: 20rpx;
}

.button-icon {
  margin-bottom: 16rpx;
}

.button-text {
  font-size: 28rpx;
  color: #666;
}

.nickname-cell {
  flex: 1;
  /deep/ .u-cell__title {
    font-size: 36rpx !important;
    font-weight: 500;
    color: #333;
  }
}

.buttons-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.action-button {
  height: 100px;
  flex-direction: column;
  padding: 10px;
}

.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.modal-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
}

.modal-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 16rpx 16rpx 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.nickname-modal {
  max-height: 40vh;
  top: 30%;
  bottom: auto;
  animation: scaleIn 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #eee;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.modal-content {
  flex: 1;
  padding: 24rpx;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.avatar-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 160rpx;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  border-top: 1rpx solid #eee;
}

.confirm-btn {
  flex: 1;
}

.cancel-btn {
  flex: 1;
  background: #f8f8f8;
}

.avatar-option.selected {
  transform: scale(1.1);
  box-shadow: 0 0 8rpx rgba(0,179,138,0.3);
  border: 2rpx solid #00b38a;
}

.nickname-input {
  border: 1px solid #e4e7ed;
  border-radius: 8rpx;
  padding: 20rpx;
  margin: 20rpx 0;
}

.modal-footer {
  justify-content: flex-end;
}

.confirm-btn {
  order: 2;
  width: 200rpx;
}

.cancel-btn {
  order: 1;
  width: 200rpx;
  margin-right: 20rpx;
}

.nickname-input {
  /* 确保没有以下限制性样式 */
  /* text-transform: uppercase; */
  /* ime-mode: disabled; */
}
</style>