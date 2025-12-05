<template>
    <responsive-dialog :visible.sync="dialogVisible" :title="title" width="720px" @confirm="handleConfirm"
        @cancel="handleCancel">
        <!-- 步骤条 -->
        <div class="steps-wrapper">
            <simple-steps :steps="[
                {
                    title: '基本信息',
                    mobileTitle: '基本',
                    icon: 'el-icon-edit-outline'
                },
                {
                    title: '预赛配置',
                    mobileTitle: '预赛',
                    icon: 'el-icon-tickets',
                    disabled: form.system < 2
                },
                {
                    title: '半决赛配置',
                    mobileTitle: '半决',
                    icon: 'el-icon-time',
                    disabled: form.system !== 3
                },
                {
                    title: form.system > 1 ? '决赛配置' : '完成',
                    mobileTitle: '决赛',
                    icon: 'el-icon-trophy'
                },
                {
                    title: '完成',
                    mobileTitle: '完成',
                    icon: 'el-icon-success',
                    isComplete: true
                }
            ]" :active="currentStep" :showCompleteStep="currentStep === totalSteps" />
        </div>

        <!-- 表单区域 -->
        <div class="forms-container">
            <!-- 基本信息表单 -->
            <transition :name="`slide-${slideDirection}`">
                <el-form v-show="currentStep === 0" :model="form" :rules="rules" ref="baseForm" label-width="120px"
                    class="form-panel">
                    <el-form-item label="赛组名称" prop="name">
                        <el-input v-model="form.name" />
                    </el-form-item>

                    <el-form-item label="比赛类型" required>
                        <el-cascader v-model="form.eventTypes" :options="eventTypeOptions" :props="{
                            expandTrigger: 'hover',
                            value: 'value',
                            label: 'label'
                        }" @change="handleEventTypeChange" :disabled="isEditing" />
                    </el-form-item>

                    <el-form-item label="性别限制" prop="gender">
                        <div class="gender-select-group">
                            <el-select v-model="form.gender" placeholder="请选择性别限制" required style="width: 160px">
                                <el-option :value="true" label="男子项目" />
                                <el-option :value="false" label="女子项目" />
                                <el-option :value="null" label="不限性别" />
                            </el-select>

                            <el-checkbox v-if="!isEditing && form.gender !== null" v-model="createOppositeGender"
                                :label="form.gender ? '同时创建女子赛组' : '同时创建男子赛组'" />
                        </div>
                    </el-form-item>

                    <el-form-item v-if="showSizeInput && isTrackEvent" label="比赛规格" prop="size">
                        <template v-if="isRelayRace">
                            <div class="relay-input">
                                <el-input-number v-model="form.relayCount" :min="2" :max="8" controls-position="right"
                                    style="width: 120px" />
                                <span class="delimiter">×</span>
                                <el-input-number v-model="form.relayDistance" :min="50" :step="50"
                                    controls-position="right" style="width: 120px" />
                                <span class="unit">米</span>
                            </div>
                        </template>
                        <template v-else>
                            <el-input-number v-model="form.distance" :min="50" :step="50" controls-position="right"
                                style="width: 120px" />
                            <span class="unit">米</span>
                        </template>
                    </el-form-item>

                    <el-form-item label="赛制类型" prop="system">
                        <el-tooltip v-if="isEditing" content="技术原因暂不支持修改赛制，后续版本可能开放此功能" placement="top">
                            <span>
                                <el-select v-model="form.system" @change="handleSystemChange" :disabled="isEditing">
                                    <el-option :value="1" label="决赛制" />
                                    <el-option :value="2" label="预赛+决赛" />
                                    <el-option :value="3" label="预赛+半决赛+决赛" />
                                </el-select>
                            </span>
                        </el-tooltip>
                        <el-select v-else v-model="form.system" @change="handleSystemChange">
                            <el-option :value="1" label="决赛制" />
                            <el-option :value="2" label="预赛+决赛" />
                            <el-option :value="3" label="预赛+半决赛+决赛" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="报名开始时间" prop="appTimeStart">
                        <el-date-picker v-model="form.appTimeStart" type="datetime" format="yyyy-MM-dd HH:mm"
                            value-format="timestamp" placeholder="开始时间" :default-time="'08:00:00'" style="width: 100%;"
                            @change="handleTimeChange">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="报名结束时间" prop="appTimeEnd">
                        <el-date-picker v-model="form.appTimeEnd" type="datetime" format="yyyy-MM-dd HH:mm"
                            value-format="timestamp" placeholder="结束时间" :default-time="'18:00:00'" style="width: 100%;"
                            @change="handleTimeChange">
                        </el-date-picker>
                    </el-form-item>

                    <!-- 修改评分规则选择器的实现 -->
                    <el-form-item label="评分规则" prop="rid">
                        <el-select v-model="form.rid" placeholder="选择评分规则" filterable style="width: 100%"
                            :popper-append-to-body="false" popper-class="rule-select-dropdown">
                            <el-option v-for="rule in scoreRules" :key="rule.rid" :label="rule.name" :value="rule.rid">
                                <span style="float: left">{{ rule.name }}</span>
                                <span style="float: right; color: #8492a6; font-size: 13px">
                                    {{ rule.units.join(', ') }}
                                </span>
                            </el-option>
                            <el-divider></el-divider>
                            <el-option value="new">
                                <div @click.stop="handleAddRule" style="color: #409EFF">
                                    <i class="el-icon-plus"></i> 添加新规则
                                </div>
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </transition>

            <!-- 预赛配置表单 -->
            <transition :name="`slide-${slideDirection}`">
                <el-form v-if="currentStep === 1 && form.system >= 2" :model="form.preliminarySettings"
                    ref="preliminaryForm" label-width="120px" class="form-panel phase-config">
                    <h3>预赛配置</h3>
                    <el-form-item label="比赛场地">
                        <el-input v-model="form.preliminarySettings.venue" placeholder="请输入比赛场地" class="short-input" />
                    </el-form-item>

                    <div class="divider-section">
                        <div class="divider-label">自动分组</div>
                        <el-divider></el-divider>
                    </div>

                    <el-form-item>
                        <el-checkbox v-model="form.preliminarySettings.noGrouping"
                            @change="handleNoGroupingChange('preliminary')">
                            不需要分组
                        </el-checkbox>
                    </el-form-item>

                    <el-form-item label="每组人数" v-if="!form.preliminarySettings.noGrouping">
                        <el-input-number v-model="form.preliminarySettings.playersPerGroup" :min="2" />
                    </el-form-item>

                    <div class="divider-section">
                        <div class="divider-label">晋级设置</div>
                        <el-divider></el-divider>
                    </div>

                    <el-form-item label="晋级方式">
                        <el-select v-model="form.preliminarySettings.promotionType">
                            <el-option label="固定名额" value="fixed" />
                            <el-option label="动态分组" value="dynamic" />
                        </el-select>
                    </el-form-item>

                    <el-form-item :label="promotionQuotaLabel('preliminary')">
                        <el-input-number v-model="form.preliminarySettings.promotionQuota" :min="1" />
                    </el-form-item>
                </el-form>
            </transition>

            <!-- 半决赛配置表单 -->
            <transition :name="`slide-${slideDirection}`">
                <el-form v-if="currentStep === 2 && form.system === 3" :model="form.semifinalSettings"
                    ref="semifinalForm" label-width="120px" class="form-panel phase-config">
                    <h3>半决赛配置</h3>
                    <el-form-item label="比赛场地">
                        <el-input v-model="form.semifinalSettings.venue" placeholder="请输入比赛场地" class="short-input" />
                    </el-form-item>

                    <div class="divider-section">
                        <div class="divider-label">自动分组</div>
                        <el-divider></el-divider>
                    </div>

                    <el-form-item>
                        <el-checkbox v-model="form.semifinalSettings.noGrouping"
                            @change="handleNoGroupingChange('semifinal')">
                            不需要分组
                        </el-checkbox>
                    </el-form-item>

                    <el-form-item label="每组人数" v-if="!form.semifinalSettings.noGrouping">
                        <el-input-number v-model="form.semifinalSettings.playersPerGroup" :min="2" />
                    </el-form-item>

                    <div class="divider-section">
                        <div class="divider-label">晋级设置</div>
                        <el-divider></el-divider>
                    </div>

                    <el-form-item label="晋级方式">
                        <el-select v-model="form.semifinalSettings.promotionType">
                            <el-option label="固定名额" value="fixed" />
                            <el-option label="动态分组" value="dynamic" />
                        </el-select>
                    </el-form-item>

                    <el-form-item :label="promotionQuotaLabel('semifinal')">
                        <el-input-number v-model="form.semifinalSettings.promotionQuota" :min="1" />
                    </el-form-item>
                </el-form>
            </transition>

            <!-- 决赛配置表单 -->
            <transition :name="`slide-${slideDirection}`">
                <el-form v-if="currentStep === (form.system === 1 ? 1 : form.system === 2 ? 2 : 3)"
                    :model="form.finalSettings" ref="finalForm" label-width="120px" class="form-panel phase-config">
                    <h3>决赛配置</h3>
                    <el-form-item label="比赛场地">
                        <el-input v-model="form.finalSettings.venue" placeholder="请输入比赛场地" class="short-input" />
                    </el-form-item>

                    <div class="divider-section">
                        <div class="divider-label">自动分组</div>
                        <el-divider></el-divider>
                    </div>

                    <el-form-item>
                        <el-checkbox v-model="form.finalSettings.noGrouping" @change="handleNoGroupingChange('final')">
                            不需要分组
                        </el-checkbox>
                    </el-form-item>

                    <el-form-item label="每组人数" v-if="!form.finalSettings.noGrouping">
                        <el-input-number v-model="form.finalSettings.playersPerGroup" :min="2" />
                    </el-form-item>
                </el-form>
            </transition>
        </div>

        <!-- 底部按钮 -->
        <template #footer>
            <div class="footer-buttons">
                <el-button class="btn" @click="handleCancel">取消</el-button>
                <el-button v-if="currentStep > 0" class="btn" @click="prevStep">上一步</el-button>
                <el-button v-if="currentStep < totalSteps - 1" type="primary" class="btn"
                    @click="nextStep">下一步</el-button>
                <el-button v-if="currentStep === totalSteps - 1" type="primary" class="btn"
                    @click="handleSubmit">发布</el-button>
            </div>
        </template>

        <!-- 修改成功提示遮罩 -->
        <div v-if="form.showSuccess" class="success-overlay">
            <div class="success-content">
                <i class="el-icon-success"></i>
                <div class="success-message" v-html="successMessage"></div>
                <el-button type="primary" size="large" class="confirm-btn" @click="handleConfirmSuccess">
                    我知道了
                </el-button>
            </div>
        </div>
    </responsive-dialog>
</template>

<script>
import ResponsiveDialog from '@/components/ResponsiveDialog.vue'
import SimpleSteps from '@/components/steps/SimpleSteps.vue'
import request from '@/utils/request'

export default {
    name: 'SportDialog',
    components: { ResponsiveDialog, SimpleSteps },

    props: {
        visible: {
            type: Boolean,
            default: false
        },
        sportData: {
            type: Object,
            default: () => ({})
        },
        scoreRules: {
            type: Array,
            default: () => []
        }
    },

    data() {
        return {
            dialogVisible: false,
            isMobile: false,
            activeConfigTab: 'promotion',
            currentStep: 0,
            eventTypeOptions: [
                {
                    value: 1,
                    label: '径赛',
                    children: [
                        { value: 1, label: '个人跑' },
                        { value: 2, label: '接力跑' }
                    ]
                },
                {
                    value: 2,
                    label: '田赛',
                    children: [
                        { value: 1, label: '跳远' },
                        { value: 2, label: '三级跳远' },
                        { value: 3, label: '铅球' },
                        { value: 4, label: '跳高' }
                    ]
                }
            ],
            form: {
                ...this.getInitialForm(),
                gender: null,
                showSuccess: false,
                rid: null, // 移除默认选中第一个规则
            },
            createOppositeGender: false,
            successMessage: '',
            rules: {
                name: [{ required: true, message: '请输入赛组名称', trigger: 'blur' }],
                appTimeStart: [{ required: true, message: '请选择报名开始时间', trigger: 'change' }],
                appTimeEnd: [
                    { required: true, message: '请选择报名结束时间', trigger: 'change' },
                    { validator: this.validateAppTime, trigger: 'change' }
                ],
                eventTypes: [
                    { required: true, message: '请选择比赛类型', trigger: 'change' }
                ],
                size: [
                    {
                        required: true,
                        message: '请输入比赛规格',
                        trigger: 'blur',
                        validator: (rule, value, callback) => {
                            if (!this.isTrackEvent) {
                                callback();
                                return;
                            }
                            if (!value) {
                                callback(new Error('请输入比赛规格'));
                                return;
                            }
                            if (this.isRelayRace) {
                                if (!/^\d+\*\d+$/.test(value)) {
                                    callback(new Error('接力赛格式应为: 人数*距离'));
                                    return;
                                }
                            } else {
                                if (!/^\d+$/.test(value)) {
                                    callback(new Error('请输入有效的距离'));
                                    return;
                                }
                            }
                            callback();
                        }
                    }
                ],
                gender: [{
                    required: false,
                    trigger: 'change',
                    validator: (rule, value, callback) => {
                        if (value === null || value === true || value === false) {
                            callback();
                        } else {
                            callback(new Error('请选择性别'));
                        }
                    }
                }],
                system: [{ required: true, message: '请选择赛制类型', trigger: 'change' }],
                rid: [{ required: true, message: '请选择评分规则', trigger: 'change' }]
            },
            meetingInfo: null,
            slideDirection: 'left',
        }
    },

    created() {
        this.checkMobile();
        window.addEventListener('resize', this.checkMobile);
        this.getMeetingInfo();
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.checkMobile);
    },

    computed: {
        title() {
            return this.sportData && this.sportData.id ? '编辑赛组' : '新建赛组'
        },
        promotionQuotaLabel() {
            return function (phase) {
                const settings = this.form[`${phase}Settings`]
                return settings.promotionType === 'fixed' ? '晋级名额' : '每组晋级名额'
            }
        },
        showSizeInput() {
            return this.form.eventTypes?.length === 2 && this.isTrackEvent;
        },
        isTrackEvent() {
            return this.form.eventTypes?.[0] === 1;
        },
        isRelayRace() {
            return this.isTrackEvent && this.form.eventTypes?.[1] === 2;
        },
        isEditing() {
            return Boolean(this.sportData.id);
        },
        sizePlaceholder() {
            if (this.isTrackEvent) {
                return this.isRelayRace ? '例如: 4*100' : '例如: 100';
            }
            return '输入数字';
        },
        sizeUnit() {
            return this.isTrackEvent ? '米' : '';
        },
        totalSteps() {
            return this.form.system === 3 ? 4 : this.form.system === 2 ? 3 : 2;
        }
    },

    watch: {
        visible(val) {
            this.dialogVisible = val
            if (val) {
                this.initForm()
            }
        },
        dialogVisible(val) {
            if (!val) {
                this.$emit('update:visible', false)
            }
        }
    },

    methods: {
        checkMobile() {
            this.isMobile = window.innerWidth <= 768;
        },

        getInitialForm() {
            return {
                name: '',
                system: 2,
                appTimeStart: '',
                appTimeEnd: '',
                events: [],
                gender: null,
                preliminarySettings: {
                    playersPerGroup: 4,
                    venue: '',
                    promotionType: 'fixed',
                    promotionQuota: 8,
                    noGrouping: false
                },
                semifinalSettings: {
                    playersPerGroup: 4,
                    venue: '',
                    promotionType: 'fixed',
                    promotionQuota: 4,
                    noGrouping: false
                },
                finalSettings: {
                    playersPerGroup: 4,
                    venue: '',
                    noGrouping: true
                },
                eventTypes: [],
                eventType: null,
                subEventType: null,
                size: '',
                relayCount: 4,
                relayDistance: 100,
                distance: 100,
                fieldDistance: 0,
                rid: null // 移除默认选中第一个规则
            }
        },

        async getMeetingInfo() {
            try {
                const res = await request({
                    url: '/getMeetingInfo',
                    method: 'get'
                });
                if (res.code === 1) {
                    this.meetingInfo = res.data;
                }
            } catch (error) {
                console.error('获取比赛信息失败:', error);
            }
        },

        initForm() {
            if (this.sportData.id) {
                const mainSport = this.sportData.sports?.[0] || {};
                this.form = {
                    name: this.sportData.name,
                    system: this.sportData.compSystem,
                    appTimeStart: this.parseISOString(mainSport.appStartTime || this.sportData.appStartTime),
                    appTimeEnd: this.parseISOString(mainSport.appEndTime || this.sportData.appEndTime),
                    eventTypes: [
                        mainSport.eventType || this.sportData.eventType,
                        mainSport.subEventType || this.sportData.subEventType,
                    ],
                    eventType: mainSport.eventType || this.sportData.eventType,
                    subEventType: mainSport.subEventType || this.sportData.subEventType,
                    size: mainSport.size || '',
                    gender: this.sportData.gender,
                    preliminarySettings: this.initPhaseSettings(
                        this.sportData.sports?.find(s => s.compType === 1)
                    ),
                    semifinalSettings: this.initPhaseSettings(
                        this.sportData.sports?.find(s => s.compType === 2)
                    ),
                    finalSettings: this.initPhaseSettings(
                        this.sportData.sports?.find(s => s.compType === 3)
                    ),
                    rid: this.sportData.rid || mainSport.rid || null // 移除默认选中第一个规则
                };

                if (mainSport.size) {
                    if (this.isTrackEvent) {
                        if (this.isRelayRace) {
                            const [count, distance] = mainSport.size.split('*').map(Number);
                            this.form.relayCount = count || 4;
                            this.form.relayDistance = distance || 100;
                        } else {
                            this.form.distance = parseInt(mainSport.size) || 100;
                        }
                    }
                }
            } else {
                this.form = this.getInitialForm();
            }
        },

        initPhaseSettings(sport) {
            if (!sport) {
                return {
                    playersPerGroup: 4,
                    venue: '',
                    promotionType: 'fixed',
                    promotionQuota: 8,
                    noGrouping: false
                };
            }
            return {
                playersPerGroup: sport.countPgp || 4,
                venue: sport.venue || '',
                promotionType: sport.riseType ? 'fixed' : 'dynamic',
                promotionQuota: sport.riseCount || 8,
                noGrouping: !sport.countPgp,
                spId: sport.spId
            };
        },

        parseISOString(isoString) {
            if (!isoString) return null;
            const date = new Date(isoString);
            return date.getTime();
        },

        validateAppTime(rule, value, callback) {
            if (!this.form.appTimeStart) {
                return callback(new Error('请先选择报名开始时间'))
            }
            if (!this.form.appTimeEnd) {
                return callback(new Error('请选择报名结束时间'))
            }
            const startTime = Number(this.form.appTimeStart);
            const endTime = Number(this.form.appTimeEnd);

            if (endTime <= startTime) {
                return callback(new Error('报名结束时间必须晚于开始时间'))
            }

            if (this.meetingInfo?.registrationDeadline) {
                const deadline = new Date(this.meetingInfo.registrationDeadline).getTime();
                if (endTime > deadline) {
                    return callback(new Error(`报名截止时间不能超过运动会总报名截止时间: ${this.formatDateTime(deadline)}`))
                }
            }

            callback()
        },

        handleSystemChange(system) {
            const events = [];
            if (system >= 2) {
                events.push({
                    type: 1,
                    compTime: null,
                    appTime: [this.form.appTimeStart, this.form.appTimeEnd],
                    groups: null,
                    players: [],
                    finished: false,
                    promotionType: 'fixed',
                    promotionQuota: 8,
                    venue: '',
                });
            }

            if (system === 3) {
                events.push({
                    type: 2,
                    compTime: null,
                    appTime: null,
                    groups: null,
                    players: [],
                    finished: false,
                    promotionType: 'fixed',
                    promotionQuota: 4,
                    venue: '',
                });
            }

            events.push({
                type: 3,
                compTime: null,
                appTime: system === 1 ? [this.form.appTimeStart, this.form.appTimeEnd] : null,
                groups: null,
                players: [],
                finished: false,
                venue: '',
            });

            this.$set(this.form, 'events', events);
        },

        handleTimeChange() {
            this.$emit('time-change', [this.form.appTimeStart, this.form.appTimeEnd])
        },

        handleEventTypeChange(value) {
            console.log('Event type changed:', {
                value,
                oldSize: this.form.size
            });

            if (value?.length === 2) {
                this.form.eventType = value[0];
                this.form.subEventType = value[1];

                if (this.isTrackEvent) {
                    if (this.isRelayRace) {
                        this.form.size = `${this.form.relayCount}*${this.form.relayDistance}`;
                        this.$nextTick(() => {
                            this.form.size = `${this.form.relayCount}*${this.form.relayDistance}`;
                        });
                    } else {
                        this.form.size = String(this.form.distance);
                        this.$nextTick(() => {
                            this.form.size = String(this.form.distance);
                        });
                    }
                } else {
                    this.form.size = '';
                }

                console.log('After event type change:', {
                    eventType: this.form.eventType,
                    subEventType: this.form.subEventType,
                    isTrackEvent: this.isTrackEvent,
                    isRelayRace: this.isRelayRace,
                    newSize: this.form.size
                });
            }
        },

        async nextStep() {
            try {
                let formName = 'baseForm';
                if (this.currentStep === 1) formName = 'preliminaryForm';
                if (this.currentStep === 2) formName = 'semifinalForm';
                if (this.currentStep === 3) formName = 'finalForm';

                await this.$refs[formName].validate();
                this.slideDirection = 'left';
                this.currentStep++;
            } catch (error) {
                console.log('表单验证失败');
            }
        },

        prevStep() {
            this.slideDirection = 'right';
            this.currentStep--;
        },

        formatDateTime(timestamp) {
            return new Date(timestamp).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        },

        async handleConfirm() {
            this.handleSubmit();
        },

        async validateAllForms() {
            const promises = ['baseForm'];
            if (this.form.system >= 2) promises.push('preliminaryForm');
            if (this.form.system === 3) promises.push('semifinalForm');
            promises.push('finalForm');

            await Promise.all(promises.map(formName =>
                this.$refs[formName].validate()
            ));
        },

        handleCancel() {
            this.dialogVisible = false
            this.$refs.form?.resetFields()
            this.currentStep = 0;
        },

        updateSizeField() {
            if (this.isTrackEvent) {
                if (this.isRelayRace) {
                    this.form.size = `${this.form.relayCount}*${this.form.relayDistance}`;
                } else {
                    this.form.size = String(this.form.distance);
                }
            } else {
                this.form.size = '';
            }
        },

        handleNoGroupingChange(phase) {
            const settings = this.form[`${phase}Settings`];
            if (settings.noGrouping) {
                settings.playersPerGroup = null;
            } else {
                settings.playersPerGroup = 4;
            }
        },

        async handleSubmit() {
            try {
                // 添加对规则ID的校验
                if (!this.form.rid) {
                    this.$message.error('请选择评分规则');
                    return;
                }

                let currentForm;
                if (this.currentStep === 0) {
                    currentForm = this.$refs.baseForm;
                } else if (this.currentStep === 1 && this.form.system >= 2) {
                    currentForm = this.$refs.preliminaryForm;
                } else if (this.currentStep === 2 && this.form.system === 3) {
                    currentForm = this.$refs.semifinalForm;
                } else {
                    currentForm = this.$refs.finalForm;
                }

                if (!currentForm) {
                    throw new Error('未找到当前表单');
                }

                await currentForm.validate();

                this.updateSizeField();

                const requestData = {
                    name: this.form.name,
                    compSystem: this.form.system,
                    appStartTime: new Date(Number(this.form.appTimeStart)).toISOString(),
                    appEndTime: new Date(Number(this.form.appTimeEnd)).toISOString(),
                    eventType: this.form.eventTypes[0],
                    subEventType: this.form.eventTypes[1],
                    size: this.form.size,
                    gender: this.form.gender,
                    rid: this.form.rid, // 确保rid正确传递
                    sports: []
                };

                if (this.form.system >= 2) {
                    requestData.sports.push({
                        compType: 1,
                        countPgp: this.form.preliminarySettings.noGrouping ? null : this.form.preliminarySettings.playersPerGroup,
                        venue: this.form.preliminarySettings.venue,
                        riseType: this.form.preliminarySettings.promotionType === 'fixed',
                        riseCount: this.form.preliminarySettings.promotionQuota
                    });
                }

                if (this.form.system === 3) {
                    requestData.sports.push({
                        compType: 2,
                        countPgp: this.form.semifinalSettings.noGrouping ? null : this.form.semifinalSettings.playersPerGroup,
                        venue: this.form.semifinalSettings.venue,
                        riseType: this.form.semifinalSettings.promotionType === 'fixed',
                        riseCount: this.form.semifinalSettings.promotionQuota
                    });
                }

                requestData.sports.push({
                    compType: 3,
                    countPgp: this.form.finalSettings.noGrouping ? null : this.form.finalSettings.playersPerGroup,
                    venue: this.form.finalSettings.venue
                });

                if (this.createOppositeGender && !this.isEditing && this.form.gender !== null) {
                    const oppositeData = {
                        ...requestData,
                        gender: !this.form.gender,
                        name: requestData.name,
                        sports: requestData.sports.map(sport => ({ ...sport }))
                    };

                    const [res1, res2] = await Promise.all([
                        request({
                            url: '/addSport',
                            method: 'post',
                            data: requestData,
                            headers: { 'Content-Type': 'application/json' }
                        }),
                        request({
                            url: '/addSport',
                            method: 'post',
                            data: oppositeData,
                            headers: { 'Content-Type': 'application/json' }
                        })
                    ]);

                    if (res1.code === 1 && res2.code === 1) {
                        this.form.showSuccess = true;
                        this.currentStep = this.totalSteps; // 进入完成步骤
                        this.successMessage = `<p>发布成功！</p><p>已同时创建对应性别的赛组</p><p>若要为该比赛分配裁判，请到裁判评分页面分配。</p>`;
                    } else {
                        throw new Error('创建对应性别赛组失败');
                    }
                } else {
                    const res = await request({
                        url: this.isEditing ? '/modifySport' : '/addSport',
                        method: 'post',
                        data: {
                            ...requestData,
                            mainSpId: this.isEditing ?
                                (this.sportData.sports?.[0]?.mainSpId || this.sportData.sports?.[1]?.mainSpId || this.sportData.sports?.[2]?.mainSpId) :
                                undefined
                        },
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (res.code === 1) {
                        this.form.showSuccess = true;
                        this.currentStep = this.totalSteps; // 进入完成步骤
                        this.successMessage = `<p>发布成功！</p><p>若要为该比赛分配裁判，请到裁判评分页面分配。</p>`;
                    } else {
                        throw new Error(res.message || '操作失败');
                    }
                }
            } catch (error) {
                console.error('保存失败:', error);
                this.$message.error(error.message || '保存失败，请检查表单填写是否完整');
            }
        },

        handleAddRule() {
            this.$message.info('请在"裁判评分"页面完成添加/编辑规则的操作')
        },

        handleConfirmSuccess() {
            this.form.showSuccess = false;
            this.dialogVisible = false;
            this.currentStep = 0;
            this.$emit('save', this.isEditing ? this.sportData : null);
        }
    }
}
</script>

<style lang="less">
.steps-wrapper {
    margin: 0 0 10px;
    padding: 10px;
    background: #f8fafe;
    border-radius: 8px;
}

.modern-steps {
    ::v-deep {
        .el-step__head {
            .el-step__icon {
                width: 32px;
                height: 32px;
                border: 2px solid #e4e7ed;
                transition: all 0.3s;

                i {
                    font-size: 16px;
                    color: #909399;
                }
            }

            .el-step__title {
                font-size: 14px;
                color: #909399;
                transition: all 0.3s;
            }

            &.is-process {
                .el-step__icon {
                    border-color: #409EFF;
                    background: #ecf5ff;
                }

                .el-step__title {
                    color: #303133;
                    font-weight: 500;
                }
            }

            &.is-success {
                .el-step__icon {
                    border-color: #67C23A !important;
                    background-color: #67C23A !important;
                    color: #fff;

                    i {
                        color: #fff;
                    }
                }
            }
        }
    }
}

.divider-section {
    position: relative;
    margin: 20px 0;

    .divider-label {
        position: absolute;
        left: 0;
        top: -8px;
        font-size: 12px;
        color: #909399;
        padding: 0 8px;
        background: #fff;
        z-index: 1;
    }

    .el-divider {
        margin: 16px 0;
    }
}

.footer-buttons {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 10px;

    .btn {
        line-height: 18px;
        flex: 1;
        margin: 0;
    }

    @media screen and (max-width: 768px) {
        flex-wrap: nowrap;

        .btn {
            min-width: 80px;
            // padding: 0 15px;
        }
    }
}

.success-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.98);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.3s ease-out;

    .success-content {
        text-align: center;
        transform: translateY(-10%);
        animation: slideDown 0.3s ease-out forwards;

        i {
            font-size: 64px;
            color: #67C23A;
            margin-bottom: 24px;
            display: block;
        }

        .success-message {
            font-size: 18px;
            color: #303133;
            line-height: 1.6;

            p {
                margin: 8px 0;

                &:first-child {
                    font-size: 24px;
                    font-weight: bold;
                    color: #67C23A;
                }
            }
        }

        .confirm-btn {
            margin-top: 24px;
            width: 100%;
            height: 40px;
            font-size: 16px;
        }
    }
}

@keyframes slideDown {
    from {
        transform: translateY(-30%);
        opacity: 0;
    }

    to {
        transform: translateY(-10%);
        opacity: 1;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.forms-container {
    position: relative;
    min-height: 440px;
    overflow: hidden;

    .form-panel {
        width: 100%;
        /* position: absolute;
        top: 0;
        left: 0; */
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backface-visibility: hidden;
    }
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: absolute;
    width: 100%;
    top: 0;
}

.slide-left-enter {
    transform: translateX(100%);
}

.slide-left-leave-to {
    transform: translateX(-100%);
}

.slide-right-enter {
    transform: translateX(-100%);
}

.slide-right-leave-to {
    transform: translateX(100%);
}

// 添加评分规则选择器的样式
::v-deep .rule-select-dropdown {
    margin-top: -270px !important; // 使下拉框向上展开
}

.el-select-dropdown__item {
    padding: 8px 12px;

    span {
        &:first-child {
            display: inline-block;
            width: 60%;
        }

        &:last-child {
            display: inline-block;
            width: 40%;
            text-align: right;
        }
    }
}

.el-popper {
    z-index: 2020 !important;
}
</style>