<template>
  <view class="profile-container">
    <u-toast ref="uToast"></u-toast>

    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-section">
        <u-avatar 
          :src="userInfo.avatar || 'static/own.png'" 
          size="120"
          class="main-avatar"
          @click="showAvatarDialog = true"
        ></u-avatar>
        <u-button 
          @click="showAvatarDialog = true" 
          shape="circle" 
          type="primary"
          size="mini"
          class="change-btn"
        >更换</u-button>
      </view>
      
      <view class="info-section">
        <view class="nickname-wrapper">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <u-icon 
            name="edit-pen" 
            size="28" 
            color="#666" 
            @click="showNicknameDialog = true"
            class="edit-icon"
          ></u-icon>
        </view>
        <view class="vip-badge" v-if="userInfo.isVip">
          <u-icon name="vip" color="#ffd700" size="18"></u-icon>
          <text>VIP会员</text>
        </view>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="function-grid">
      <view 
        v-for="(item, index) in functions" 
        :key="index" 
        class="grid-item"
        @click="item.handler"
      >
        <view class="icon-wrapper" :style="{ backgroundColor: item.bgColor }">
          <u-icon 
            :name="item.icon" 
            size="28"
            color="#fff"
          ></u-icon>
        </view>
        <text class="grid-text">{{ item.title }}</text>
      </view>
    </view>

    <!-- 服务列表 -->
    <view class="service-card">
      <view class="card-header">
        <text class="card-title">常用服务</text>
      </view>
      <view class="service-list">
        <view 
          v-for="(service, index) in services" 
          :key="index" 
          class="service-item"
          @click="service.handler"
        >
          <u-icon :name="service.icon" size="24" :color="service.color"></u-icon>
          <text class="service-name">{{ service.name }}</text>
          <u-icon name="arrow-right" size="18" color="#999"></u-icon>
        </view>
      </view>
    </view>

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
			  plain 
			  @click="showAvatarDialog = false"
			  class="cancel-btn"
			>取消</u-button>
			<u-button 
            type="primary" 
            @click="confirmAvatar"
            class="confirm-btn"
			>确认</u-button>
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
            placeholder="请输入新昵称（2-12个字符）"
            maxlength="12"
            border="none"
            :focus="showNicknameDialog"
            @confirm="saveNickname"
            class="nickname-input"
          ></u-input>
        </view>
        
        <view class="modal-footer">
          <u-button 
            plain 
            @click="showNicknameDialog = false" 
            class="cancel-btn"
          >取消</u-button>
          <u-button 
            type="primary" 
            @click="saveNickname" 
            :disabled="!tempNickname.trim()"
            class="confirm-btn"
          >保存</u-button>
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
        avatar: localStorage.getItem('userAvatar') || '',
        isVip: false
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
      functions: [
        { 
          icon: 'order', 
          title: '预约', 
          bgColor: '#2979ff', 
          handler: this.goToReservation 
        },
        { 
          icon: 'clock', 
          title: '记录', 
          bgColor: '#19be6b', 
          handler: this.goToRecords 
        },
        { 
          icon: 'coupon', 
          title: '费用',
          bgColor: '#ff9900', 
          handler: this.goToCoupon 
        },
        { 
          icon: 'setting', 
          title: '设置', 
          bgColor: '#909399', 
          handler: this.goToSettings 
        }
      ],
      services: [
        { 
          icon: 'edit-pen', 
          name: '我的评价', 
          color: '#2979ff', 
          handler: this.goToComments 
        },
        { 
          icon: 'heart', 
          name: '我的收藏', 
          color: '#f56c6c', 
          handler: this.goToFavorites 
        },
        { 
          icon: 'question-circle', 
          name: '帮助中心', 
          color: '#19be6b', 
          handler: this.goToHelp 
        }
      ]
    };
  },
  methods: {
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

<style lang="scss" scoped>
.profile-container {
  padding: 30rpx;
  background: #f5f6f8;
  min-height: 100vh;
}

.user-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  
  .avatar-section {
    position: relative;
    margin-right: 40rpx;
    
    .main-avatar {
      border: 4rpx solid #fff;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
    }
    
    .change-btn {
      position: absolute;
      bottom: -16rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 120rpx;
    }
  }
  
  .info-section {
    flex: 1;
    
    .nickname-wrapper {
      display: flex;
      align-items: center;
      gap: 20rpx;
    }
    
    .nickname {
      display: block;
      font-size: 40rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 16rpx;
    }
    
    .edit-icon {
      padding: 8rpx;
      background: #f5f5f5;
      border-radius: 50%;
    }
    
    .vip-badge {
      display: flex;
      align-items: center;
      background: linear-gradient(45deg, #ffeb3b, #ffc107);
      border-radius: 8rpx;
      padding: 8rpx 16rpx;
      width: fit-content;
      
      text {
        font-size: 24rpx;
        color: #333;
        margin-left: 8rpx;
      }
    }
  }
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
  
  .grid-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx 0;
    text-align: center;
    transition: all 0.2s;
    
    &:active {
      transform: scale(0.95);
    }
    
    .icon-wrapper {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20rpx;
    }
    
    .grid-text {
      font-size: 28rpx;
      color: #666;
    }
  }
}

.service-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  
  .card-header {
    margin-bottom: 30rpx;
    
    .card-title {
      font-size: 34rpx;
      font-weight: 500;
      color: #333;
    }
  }
  
  .service-list {
    .service-item {
      display: flex;
      align-items: center;
      padding: 28rpx 0;
      border-bottom: 1rpx solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      .service-name {
        flex: 1;
        font-size: 30rpx;
        color: #666;
        margin: 0 20rpx;
      }
    }
  }
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
  border: 2rpx solid #e4e7ed;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 20rpx 0;
  background: #fff;
}

.modal-footer {
  justify-content: flex-end;
}

.confirm-btn[disabled] {
  opacity: 0.6;
  background-color: #f0f0f0 !important;
  color: #c0c4cc !important;
}
</style>