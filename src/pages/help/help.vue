<template>
	<u-row class="call-container">
		<u-col span="5">
			
			<u-col class="content" span="12">
				<u-col v-for="(item,index) in helpList" :key="index" class="section">
					<u-text type="title" :text="`${index+1}. ${item.title}`"></u-text>
					<u-col class="details">
						<u-text 
							v-for="(detail,i) in item.details" 
							:key="i"
							:type="i===0 ? 'primary' : 'info'"
							:text="detail"
							class="detail-item"
						></u-text>
					</u-col>
				</u-col>
				
				<u-text class="contact" type="warning" text="有问题请联系：12345678912"></u-text>
			</u-col>
		</u-col>
	</u-row>
</template>

<script>
	export default {
		name: 'Call',
		data() {
			return {
				helpList: [
					{
						title: '预约房间',
						details: [
							'点击"房间预约"进入预约界面',
							'选择房间类型、日期、开始时间和结束时间',
							'输入预约人姓名并点击"预约"按钮',
							'预约成功后，系统会跳转到预约详情页面'
						]
					},
					{
						title: '查看预约记录',
						details: [
							'点击"查看预约情况"进入预约列表',
							'预约列表会显示所有预约记录'
						]
					},
					{
						title: '删除预约',
						details: [
							'在预约列表中找到需要删除的预约记录',
							'点击"取消预约"按钮并确认删除'
						]
					},
					{
						title: '修改预约',
						details: [
							'在预约列表中找到需要修改的预约记录',
							'点击"修改预约"按钮并修改相关信息',
							'点击"修改"按钮完成修改'
						]
					},
					{
						title: '前往房间',
						details: [
							'在预约列表中找到需要前往的房间',
							'点击"前往房间"按钮进入房间详情页面',
							'页面会显示房间信息和倒计时',
							'可以通过页面上的按钮控制设备'
						]
					}
				]
			}
		},
		methods: {
			
		}
	}
</script>

<style scoped>
	.call-container {
		padding: 16px;
		height: 100vh;
	}

	.content {
		padding: 0 20rpx;
	}

	.section {
		margin-bottom: 32rpx;
	}

	.details {
		margin-left: 20rpx;
	}

	.detail-item {
		margin-top: 8rpx;
		display: block;
	}

	.contact {
		margin-top: 40rpx;
		padding: 20rpx 0;
	}
</style>
