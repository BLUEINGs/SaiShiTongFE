<template>
  <responsive-dialog :visible="visible" title="添加比赛信息" width="650px" @update:visible="$emit('update:visible', $event)"
    @close="$emit('cancel')" @confirm="submitForm" @cancel="$emit('cancel')">
    <!-- 表单内容 -->
    <div class="match-form-content">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="0px">
        <div class="title-item">
          <label>比赛名称</label>
          <el-form-item prop="title">
            <base-input v-model="form.title" placeholder="例如：清华VS清北" label="比赛名称" />
          </el-form-item>
        </div>

        <!-- 推流信息区 -->
        <div class="title-item">
          <label>现场推流地址</label>
          <el-form-item prop="rtmp">
            <base-input v-model="form.rtmp" placeholder="例如：rtmp://localoost/live/example" label="现场推流地址" />
          </el-form-item>
        </div>
        <!-- 球队信息区 -->
        <div class="input-group dual-col">
          <div class="input-item">
            <label>队伍A名称</label>
            <el-form-item prop="nameA">
              <base-input v-model="form.nameA" placeholder="例如：电信篮球队" label="队伍A名称" />
            </el-form-item>
          </div>
          <div class="input-item">
            <label>队伍B名称</label>
            <el-form-item prop="nameB">
              <base-input v-model="form.nameB" placeholder="例如：电气篮球队" label="队伍B名称" />
            </el-form-item>
          </div>
        </div>

        <!-- 球衣颜色输入区 -->
        <div class="input-group dual-col color-group">
          <div class="input-item">
            <label>A队球衣颜色</label>
            <el-form-item prop="rgbA">
              <rgb-picker v-model="form.rgbA" />
            </el-form-item>
          </div>
          <div class="input-item">
            <label>B队球衣颜色</label>
            <el-form-item prop="rgbB">
              <rgb-picker v-model="form.rgbB" />
            </el-form-item>
          </div>
        </div>

        <!-- 时间输入区 -->
        <div v-for="section in 4" :key="section" class="section-group">
          <div class="section-header">第{{ section }}节</div>

          <div class="input-group dual-col">
            <div class="input-item">
              <label>开始时间</label>
              <el-form-item :prop="`startTime${section}`">
                <date-time-input v-model="form[`startTime${section}`]" :placeholder="`第${section}节开始时间`"
                  :label="`第${section}节开始时间`" />
              </el-form-item>
            </div>
            <div class="input-item">
              <label>结束时间</label>
              <el-form-item :prop="`endTime${section}`">
                <date-time-input v-model="form[`endTime${section}`]" :placeholder="`第${section}节结束时间`"
                  :label="`第${section}节结束时间`" />
              </el-form-item>
            </div>
          </div>
        </div>
      </el-form>
    </div>
  </responsive-dialog>
</template>

<script>
import ResponsiveDialog from './ResponsiveDialog.vue'
import BaseInput from './inputs/BaseInput.vue'
import DateTimeInput from './inputs/DateTimeInput.vue'
import RgbPicker from './inputs/RgbPicker.vue'

export default {
  components: {
    ResponsiveDialog,
    BaseInput,
    DateTimeInput,
    RgbPicker
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    const sections = {};
    for (let i = 1; i <= 4; i++) {
      sections[`startTime${i}`] = '';
      sections[`endTime${i}`] = '';
    }

    return {
      form: {
        nameA: '',
        nameB: '',
        title: '',
        rtmp: '',
        rgbA: '',
        rgbB: '',
        ...sections
      }
    }
  },

  computed: {
    rules() {
      const base = {
        required: true,
        message: '此项为必填',
        trigger: 'change'
      }

      const rules = {
        title: [base],
        rtmp: [base],
        nameA: [base],
        nameB: [base],
        rgbA: [base],
        rgbB: [base]
      }

      for (let i = 1; i <= 4; i++) {
        rules[`startTime${i}`] = [base]
        rules[`endTime${i}`] = [base]
      }

      return rules
    }
  },

  methods: {
    submitForm() {
      // validate before emit
      if (!this.$refs.formRef) {
        this.$emit('submit', this.form);
        return
      }
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$emit('submit', this.form);
        } else {
          this.$message.warning('请完成所有必填项')
        }
      })
    }
  }
  ,
  mounted() {
    // 监听每一节的结束时间变化，自动把下一节开始时间设置为结束时间 + 15 分钟
    for (let i = 1; i <= 3; i++) {
      this.$watch(
        () => this.form[`endTime${i}`],
        (newVal) => {
          if (!newVal) return
          const endTs = Number(newVal)
          if (isNaN(endTs)) return
          const nextKey = `startTime${i + 1}`
          const suggested = endTs + 15 * 60 * 1000
          const currentNext = this.form[nextKey]
          // 如果下一节没有设置开始时间，或者当前开始时间早于建议时间，则覆盖
          if (!currentNext || Number(currentNext) < suggested) {
            this.$set(this.form, nextKey, suggested)
          }
        }
      )
    }
  }
}
</script>

<style lang="less" scoped>
.match-form-content {
  padding: 8px;
}

.input-group {
  margin-bottom: 16px;

  &.dual-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 0 12px;
  }
}

.title-item {
  // width: 100%;
  padding: 0 12px;
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.input-item {
  width: 100%;

  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #555;
    font-size: 14px;
  }

  :deep(.base-input),
  :deep(.datetime-input) {
    width: 100%;
  }
}

.color-group {
  background-color: rgba(182, 203, 236, 0.15);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.section-group {
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafc;
  border-radius: 8px;

  .section-header {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #409eff;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .input-group.dual-col {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .section-group {
    padding: 10px;
  }

  .color-group {
    padding: 10px;
  }
}
</style>