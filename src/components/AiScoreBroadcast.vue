<template>
  <div v-if="shouldShowBroadcast" class="broadcast-container">
    <span class="broadcast-icon">🎤</span>
    <span class="broadcast-text">{{ randomBroadcast }}</span>
  </div>
</template>

<script>
export default {
  name: 'AiScoreBroadcast',
  props: {
    // 接收分数值（1,2,3）
    score: {
      type: Number,
      required: true,
      // 验证器确保只接收有效分数
      validator: (value) => [1, 2, 3].includes(value)
    },
    // 是否触发播报的标志
    triggerBroadcast: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      randomBroadcast: '' // 存储随机播报内容
    };
  },
  computed: {
    // 计算是否应该显示播报组件
    shouldShowBroadcast() {
      // 需要满足触发条件且有内容
      return this.triggerBroadcast && !!this.randomBroadcast;
    }
  },
  watch: {
    // 监听分数变化（包括初始化）
    score: {
      immediate: true, // 初始化时立即执行
      handler() {
        this.generateBroadcast();
      }
    }
  },
  methods: {
    // 根据分数生成随机播报内容
    generateBroadcast() {
      // 按分数分组的播报内容库
      const broadcastMap = {
        1: [
          '罚球命中! 拿下关键1分',
          '稳稳命中罚球，再添1分',
          '罚球线上轻松收下1分',
          '1分到手，小步扩大优势',
          '冷静罚球命中，再得1分'
        ],
        2: [
          '漂亮的上篮! 轻取2分',
          '急停跳投命中！得到2分',
          '突破得分！2分轻松入账',
          '中距离跳投得分！2分到手',
          '禁区强打得手！拿下2分'
        ],
        3: [
          '三分命中！远射得分！',
          '冷血三分！球应声入网！',
          '三分线外果断出手！球进！',
          '压哨三分！全场沸腾！',
          '超远三分！空心入网！'
        ]
      };

      // 获取当前分数的播报列表
      const broadcastList = broadcastMap[this.score] || [];
      
      // 随机选择一条内容（如果有可用内容）
      if (broadcastList.length > 0) {
        const randomIndex = Math.floor(Math.random() * broadcastList.length);
        this.randomBroadcast = broadcastList[randomIndex];
      } else {
        this.randomBroadcast = ''; // 没有内容则清空
      }
    }
  }
};
</script>

<style scoped>
.broadcast-container {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  animation: fadeIn 0.3s ease-in;
}

.broadcast-icon {
  color: #ffc107;
  font-size: 1.1em;
}

.broadcast-text {
  font-size: 0.85em;
  color: #666;
  line-height: 1.3;
  word-wrap: break-word;
  max-width: 100%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>