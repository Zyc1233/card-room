<template>
	<view class="call-container">
		<view class="header">
			<text class="title">关于应用</text>
		</view>
		<view class="content">
			<text class="section">
				1. 预约房间
				<text class="details">
					- 点击"房间预约"进入预约界面。<br />
					- 选择房间类型、日期、开始时间和结束时间。<br />
					- 输入预约人姓名并点击"预约"按钮。<br />
					- 预约成功后，系统会跳转到预约详情页面。
				</text>
			</text>
			<text class="section">
				2. 查看预约记录
				<text class="details">
					- 点击"查看预约情况"进入预约列表。<br />
					- 预约列表会显示所有预约记录。
				</text>
			</text>
			<text class="section">
				3. 删除预约
				<text class="details">
					- 在预约列表中找到需要删除的预约记录。<br />
					- 点击"取消预约"按钮并确认删除。
				</text>
			</text>
			<text class="section">
				4. 修改预约
				<text class="details">
					- 在预约列表中找到需要修改的预约记录。<br />
					- 点击"修改预约"按钮并修改相关信息。<br />
					- 点击"修改"按钮完成修改。
				</text>
			</text>
			<text class="section">
				5. 前往房间
				<text class="details">
					- 在预约列表中找到需要前往的房间。<br />
					- 点击"前往房间"按钮进入房间详情页面。<br />
					- 页面会显示房间信息和倒计时。<br />
					- 可以通过页面上的按钮控制设备。
				</text>
			</text>
			<text class="contact">有问题请联系：12345678912</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'Call',
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style scoped>
	.call-container {
		padding: 16px;
		background-color: #f8f9fa; /* 背景颜色 */
		height: 100vh; /* 充满整个视口 */
	}

	.header {
		margin-bottom: 20px;
	}

	.title {
		font-size: 24px;
		font-weight: bold;
	}

	.content {
		font-size: 18px;
	}

	.section {
		margin-bottom: 16px;
	}

	.details {
		display: block; /* 使细节部分换行 */
		margin-left: 10px; /* 缩进 */
	}

	.contact {
		margin-top: 20px;
		font-size: 16px;
		color: #333; /* 联系方式颜色 */
	}
</style>
