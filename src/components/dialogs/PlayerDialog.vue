<template>
  <responsive-dialog :title="getDialogTitle" :visible.sync="dialogVisible" width="500px" @confirm="submitForm"
    @cancel="$emit('update:visible', false)">
    <div class="dialog-body">
      <el-form :model="playerForm" label-width="80px" :rules="rules" ref="playerForm">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="playerForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="playerForm.gender">
            <el-radio :label="true">男</el-radio>
            <el-radio :label="false">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 添加编号字段,仅在编辑模式下显示 -->
        <el-form-item v-if="isEdit" label="参赛编号" prop="number">
          <el-input v-model="playerForm.number" placeholder="请输入参赛编号">
            <template v-if="isManualNumbering" slot="append">
              <el-tooltip content="当前可能尚未完成自动编号，若手动编号可能会被稍后的自动编号覆盖" placement="top">
                <i class="el-icon-warning-outline" style="color: #E6A23C;"></i>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>

        <!-- 只在非负责人模式下显示项目选择 -->
        <el-form-item v-if="!playerData?.isLeader" label="项目" prop="events">
          <multi-select v-model="playerForm.events" :options="sportEventOptions" :max-limit="maxEvents"
            placeholder="请选择参赛项目" @change="handleEventsChange" />
        </el-form-item>
        <el-form-item label="头像">
          <image-uploader :imageUrl="playerForm.head" @update:imageUrl="updatePlayerImage"
            @update:file="updatePlayerFile" />
        </el-form-item>
      </el-form>
    </div>
  </responsive-dialog>
</template>

<script>
import ResponsiveDialog from '@/components/ResponsiveDialog.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import MultiSelect from '@/components/MultiSelect.vue'
import request from '@/utils/request' // 添加这行

export default {
  name: 'PlayerDialog',
  components: {
    ResponsiveDialog,
    ImageUploader,
    MultiSelect
  },
  props: {
    visible: Boolean,
    isEdit: Boolean,
    playerData: Object,
    schoolId: {
      type: Number,
      required: true
    },
    schoolName: {
      type: String,
      required: true
    },
    sportEvents: Array,
    maxEvents: {
      type: Number,
      default: 3
    }
  },

  data() {
    return {
      dialogVisible: false,
      playerForm: {
        id: null,
        name: '',
        gender: null,
        events: [],
        head: null,
        number: null
      },
      playerFile: null,
      rules: {
        name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
      }
    }
  },

  computed: {
    getDialogTitle() {
      const type = this.playerData?.isLeader ? '负责人' : '运动员'
      return this.isEdit ? `编辑${type}` : `添加${type}`
    },
    // 修改 sportEventOptions 计算属性
    sportEventOptions() {
      return this.sportEvents.map(event => {
        const isExistingEvent = this.playerForm.events?.some(e => e.id === event.spId);
        const canSelectByType = (event.compSystem === 1 && event.compType === 3) ||
          (event.compSystem !== 1 && event.compType === 1);

        return {
          id: event.spId,
          name: this.formatEventName(event),
          status: event.status,
          compType: event.compType,
          compSystem: event.compSystem,
          mainSpId: event.mainSpId,
          disabled:
            (event.status !== 1) || // 非报名期禁用
            (event.gender !== null && event.gender !== this.playerForm.gender) || // 性别限制
            (!canSelectByType && !isExistingEvent), // 不符合比赛类型要求且未选择的禁用
          hidden: false
        };
      });
    },
    // 是否为手动编号(原始编号为null时)
    isManualNumbering() {
      return this.isEdit && this.playerData && this.playerData.number === null;
    }
  },

  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val && this.isEdit && this.playerData) {
        this.initEditForm()
      }
      // 对话框打开时重置表单
      if (val && !this.isEdit) {
        this.playerForm = {
          id: Date.now(),
          name: '',
          gender: null,
          events: [],
          head: null,
          number: null // 添加编号字段
        }
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    }
  },

  methods: {
    initEditForm() {
      this.playerForm = {
        id: this.playerData.id,
        pid: this.playerData.pid,
        name: this.playerData.name,
        number: this.playerData.number,  // 添加编号
        gender: this.playerData.gender,
        head: this.playerData.head,
        sports: [...(this.playerData.sports || [])],
        events: this.playerData.events || []
      }
    },

    // 验证选择的项目是否超过限制
    validateEvents(rule, value, callback) {
      if (!value || value.length === 0) {
        callback()
        return
      }
      const uniqueMainSpIds = new Set(value.map(event => event.mainSpId))
      if (uniqueMainSpIds.size > this.maxEvents) {
        callback(new Error(`每名运动员最多可报${this.maxEvents}个不同主项目`))
      } else {
        callback()
      }
    },

    // 修改事件变更处理方法
    handleEventsChange(selectedEvents) {
      const currentEvents = [...this.playerForm.events];
      const removedEvent = currentEvents.find(event =>
        !selectedEvents.find(e => e.id === event.id)
      );

      // 检查是否试图移除不允许移除的项目
      if (removedEvent) {
        const sportEvent = this.sportEvents.find(e => e.spId === removedEvent.id);
        if (sportEvent && sportEvent.status !== 1) {
          this.$message.warning('该项目已过报名期，不能退出');
          this.playerForm.events = currentEvents;
          return;
        }
      }

      // 检查主项目数量限制
      const uniqueMainSpIds = new Set(selectedEvents.map(event => event.mainSpId));
      if (uniqueMainSpIds.size > this.maxEvents) {
        this.$message.warning(`每名运动员最多可报${this.maxEvents}个不同主项目`);
        this.playerForm.events = currentEvents;
        return;
      }

      this.playerForm.events = selectedEvents;
    },

    updatePlayerImage(imageUrl) {
      this.playerForm.head = imageUrl
    },

    updatePlayerFile(file) {
      this.playerFile = file
    },

    formatEventName(event) {
      let prefix = ''
      if (event.gender !== null) {
        prefix = event.gender ? '男子' : '女子'
      }
      const compType = {
        1: '(预赛)',
        2: '(半决赛)',
        3: '(决赛)'
      }[event.compType] || ''
      return `${prefix}${event.name}${compType}`
    },

    async submitForm() {
      try {
        await this.$refs.playerForm.validate()
        const formData = new FormData()
        formData.append('name', this.playerForm.name)
        formData.append('age', 18)
        formData.append('gender', this.playerForm.gender)
        formData.append('pClass', this.schoolName)  // 使用传入的学校名
        formData.append('scId', this.schoolId)      // 添加学校ID

        // 编辑模式时添加编号字段
        if (this.isEdit) {
          formData.append('number', this.playerForm.number || '')
        }

        if (this.isEdit && this.playerForm.pid) {
          formData.append('pid', this.playerForm.pid)
        }

        // 只有非负责人才添加运动项目
        if (!this.playerData?.isLeader) {
          this.playerForm.events.forEach(event => {
            formData.append('sports', event.id)
          })
        }

        if (this.playerFile) {
          formData.append('headFile', this.playerFile)
        }

        // 根据是否为负责人和是否为编辑状态选择不同的请求地址
        let url;
        if (this.playerData?.isLeader) {
          url = this.isEdit ? '/modifyPlayer' : '/addLeader'
        } else {
          url = this.isEdit ? '/modifyPlayer' : '/addPlayer'
        }

        // 如果是负责人，添加userType
        if (this.playerData?.isLeader) {
          formData.append('userType', '2')
        }

        const res = await request({
          url,
          method: 'post',
          data: formData
        })

        if (res.code === 1) {
          const updatedPlayer = {
            ...this.playerForm,
            id: this.isEdit ? this.playerForm.id : res.data,
            isLeader: this.playerData?.isLeader
          }
          this.$emit('success', updatedPlayer)
          this.$message.success(`${this.isEdit ? '修改' : '添加'}成功`)
          this.dialogVisible = false
        }
      } catch (error) {
        console.error(`${this.isEdit ? '修改' : '添加'}失败:`, error)
        this.$message.error(`${this.isEdit ? '修改' : '添加'}失败`)
      }
    }
  }
}
</script>

<style lang="less" scoped>
/* .dialog-body {
  padding: 20px;
  height: 100%;
  overflow-y: auto;

  .el-form {
    max-width: 500px;
    margin: 0 auto;

    .el-form-item {
      margin-bottom: 22px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .el-input {
      width: 100%;
    }

    .el-radio-group {
      width: 100%;
    }
  }
} */
// 添加警告图标样式
::v-deep .el-input-group__append {
  padding: 0 10px;
  cursor: help;

  .el-icon-warning-outline {
    font-size: 16px;
  }
}
</style>
