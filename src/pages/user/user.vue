<template>
  <!-- 页面容器 -->
  <view class="profile-container">
    <!-- 全局提示组件 -->
    <u-toast ref="uToast"></u-toast>

    <!-- 用户信息卡片 -->
    <view class="user-card">
      <!-- 头像区域 -->
      <view class="avatar-section">
        <u-avatar 
          :src="userInfo.avatar || '/static/own.png'" 
          size="120"
          class="main-avatar"
          @click="showAvatarDialog = true" 
        ></u-avatar>
        <!-- 更换头像按钮 -->
        <u-button 
          @click="showAvatarDialog = true" 
          shape="circle" 
          type="primary"
          size="mini"
          class="change-btn"
        >更换</u-button>
      </view>
      
      <!-- 用户信息区域 -->
      <view class="info-section">
        <!-- 昵称及编辑按钮 -->
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
          <u-icon name="level" color="#000000" size="18"></u-icon>
          <text>VIP会员</text>
        </view>
      </view>
    </view>

    <!-- 功能入口网格布局 -->
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
      // 用户信息（改为固定值测试显示效果）
      userInfo: {
        nickname: uni.getStorageSync('userNickname') || '新用户',
        avatar: uni.getStorageSync('userAvatar') || '',
        isVip: true // 强制显示VIP标识
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
          icon: 'order', 
          title: '预约', 
          bgColor: '#2979ff', 
          handler: this.goToReservation // 路由跳转方法
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
        },
      ],
      // 服务列表配置
      services: [
        { 
          icon: 'edit-pen', 
          name: '我的评价', 
          color: '#2979ff', 
          handler: this.goToComments // 路由跳转方法
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
      uni.switchTab({ url: '/pages/reservation/reservation' });
    },
    goToRecords() {
      uni.switchTab({ url: '/pages/reservation/check' });
    },
    goToCoupon() {
      uni.switchTab({ url: '/pages/reservation/cost' });
    },
    goToSettings() {
      uni.navigateTo({ url: '/pages/setting/setting' });
    },
    goToComments() {
      uni.navigateTo({ url: '/pages/comment/comment' });
    },
    goToFavorites() {
      uni.navigateTo({ url: '/pages/favorite/favorite' });
    },
    goToHelp() {
      uni.navigateTo({ url: '/pages/help/help' });
    },
    // 选择头像处理
    selectAvatar(url) {
      this.selectedAvatar = url;
      this.showFeedback(`已选择头像${this.avatarUrls.indexOf(url) + 1}`, 'info');
    },
    // 确认更换头像（添加Android文件路径处理）
    async confirmAvatar() {
      if (!this.selectedAvatar) {
        this.showFeedback('请先选择头像', 'warning');
        return;
      }
      
      try {
        uni.showLoading({ title: '更新中...', mask: true });
        
        // 处理Android文件路径前缀
        if (this.selectedAvatar.startsWith('file://')) {
          this.selectedAvatar = this.selectedAvatar.replace('file://', '');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.userInfo.avatar = this.selectedAvatar;
        uni.setStorageSync('userAvatar', this.selectedAvatar);
        this.showAvatarDialog = false;
        this.showFeedback('头像更换成功', 'success');
        
      } catch (error) {
        this.showFeedback('头像更新失败: ' + error.errMsg, 'error');
      } finally {
        uni.hideLoading();
      }
    },
    // 上传本地图片（添加Android权限处理）
    async uploadLocalImage() {
      try {
        // 检查Android权限
        const status = await uni.authorize({
          scope: 'scope.writePhotosAlbum'
        });
        
        const res = await uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          // Android专属配置
          camera: 'back',
          success: (res) => {
            // 处理Android7.0以上文件路径
            res.tempFilePaths = res.tempFilePaths.map(item => {
              return item.replace(/^file:\/\//, '');
            });
          }
        });
        
        if (res.tempFilePaths.length > 0) {
          this.selectedAvatar = res.tempFilePaths[0];
          this.showFeedback('已选择本地图片', 'info');
        }
      } catch (error) {
        this.showFeedback('图片选择失败: ' + error.errMsg, 'error');
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
      uni.setStorageSync('userNickname', this.userInfo.nickname);
      this.showNicknameDialog = false;
      this.showFeedback('昵称修改成功', 'success');
    },
    // 全局提示封装
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
  padding: 30rpx; // 使用小程序响应式单位
  background: #f5f6f8; // 浅灰色背景提升内容可读性
  min-height: 100vh; // 确保容器撑满整个视口高度
}

/* 用户信息卡片样式 */
.user-card {
  background: #fff;
  border-radius: 24rpx; // 大圆角现代设计风格
  padding: 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); // 微阴影增加层次感
  
  /* 头像区域 */
  .avatar-section {
    position: relative; // 为绝对定位按钮提供基准
    margin-right: 40rpx; // 与右侧信息区保持间距
    
    .main-avatar {
      border: 4rpx solid #fff; // 白色边框突出头像
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1); // 立体投影效果
    }
    
    /* 更换按钮定位 */
    .change-btn {
      position: absolute;
      bottom: -16rpx; // 按钮下移半个自身高度
      left: 50%;
      transform: translateX(-50%); // 水平居中
      width: 120rpx; // 固定按钮宽度
    }
  }
  
  /* 用户信息区域 */
  .info-section {
    flex: 1; // 弹性填充剩余空间
    
    .nickname-wrapper {
      display: flex;
      align-items: center;
      gap: 20rpx; // 元素间间隔
    }
    
    .nickname {
      font-size: 40rpx; // 大字号突出显示
      font-weight: 500; // 中等字重
      color: #333; // 主文字颜色
    }
    
    /* 编辑图标样式 */
    .edit-icon {
      padding: 8rpx;
      background: #f5f5f5; // 浅灰背景
      border-radius: 50%; // 圆形按钮
    }
    
    /* VIP标识样式 */
    .vip-badge {
      display: flex;
      align-items: center;
      background: linear-gradient(45deg, #ffeb3b, #ffc107); // 金色渐变背景
      border-radius: 8rpx;
      padding: 8rpx 16rpx;
      width: fit-content; // 根据内容自适应宽度
      
      text {
        font-size: 24rpx;
        color: #333;
        margin-left: 8rpx; // 图标与文字间距
      }
    }
  }
}

/* 功能入口网格布局 */
.function-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150rpx, 1fr)); // 自适应列布局
  gap: 10rpx 10rpx; // 行列间距
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05); // 统一阴影样式
  
  .grid-item {
    padding: 20rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s; // 平滑过渡动画
    
    &:active {
      transform: scale(0.95); // 点击缩放效果
    }
    
    /* 图标容器 */
    .icon-wrapper {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%; // 圆形背景
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20rpx; // 与文字间距
    }
    
    .grid-text {
      font-size: 26rpx;
      color: #666; // 次要文字颜色
      text-align: center;
      line-height: 1.4; // 行高优化可读性
    }
  }
}

/* 服务列表样式 */
.service-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  
  .card-header {
    margin-bottom: 30rpx; // 标题与列表间距
    
    .card-title {
      font-size: 34rpx;
      font-weight: 500; // 中等字重标题
      color: #333;
    }
  }
  
  .service-list {
    .service-item {
      display: flex;
      align-items: center;
      padding: 28rpx 0;
      border-bottom: 1rpx solid #eee; // 分割线
      
      &:last-child {
        border-bottom: none; // 最后项去除边框
      }
      
      .service-name {
        flex: 1; // 占据剩余空间
        font-size: 30rpx;
        color: #666;
        margin: 0 20rpx; // 左右留白
      }
    }
  }
}

/* 弹窗通用样式 */
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999; // 确保在最顶层
  
  .modal-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5); // 半透明遮罩层
  }
  
  .modal-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-radius: 16rpx 16rpx 0 0; // 顶部圆角
    max-height: 70vh; // 最大高度限制
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease; // 上滑动画
  }
}

/* 头像选择弹窗特定样式 */
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); // 三列布局
  gap: 24rpx; // 项间距
}

.avatar-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 160rpx; // 固定项高度
}

/* 选中状态样式 */
.avatar-option.selected {
  transform: scale(1.1); // 放大突出选中
  border: 2rpx solid #00b38a; // 品牌绿色边框
  box-shadow: 0 0 8rpx rgba(0,179,138,0.3); // 发光效果
}

/* 昵称修改弹窗 */
.nickname-modal {
  max-height: 40vh; // 较小的高度
  top: 30%; // 垂直居中定位
  bottom: auto;
  animation: scaleIn 0.3s ease; // 缩放动画
}

/* 弹窗底部操作区 */
.modal-footer {
  display: flex;
  gap: 20rpx; // 按钮间距
  padding: 24rpx;
  border-top: 1rpx solid #eee; // 顶部分割线
  justify-content: flex-end; // 右对齐按钮
  
  .confirm-btn {
    flex: 1; // 等宽按钮
  }
  
  .cancel-btn {
    flex: 1;
    background: #f8f8f8; // 取消按钮背景
  }
}

/* 输入框样式 */
.nickname-input {
  border: 2rpx solid #e4e7ed; // 浅灰色边框
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 20rpx 0; // 上下间距
  background: #fff;
}

/* 禁用状态样式 */
.confirm-btn[disabled] {
  opacity: 0.6; // 降低透明度
  background-color: #f0f0f0 !important; // 灰色背景
  color: #c0c4cc !important; // 灰色文字
}

/* 动画定义 */
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
</style>