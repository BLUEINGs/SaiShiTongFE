<template>
    <div class="simple-steps">
        <div class="steps-container">
            <div v-for="(step, index) in stepsToShow" :key="index" class="step" :class="{
                'is-active': index === active,
                'is-completed': index < active,
                'is-disabled': step.disabled
            }">
                <!-- 步骤图标 -->
                <div class="step-icon">
                    <i v-if="index < active" class="success-icon">✓</i>
                    <i v-else :class="step.icon"></i>
                </div>

                <!-- 步骤标题 -->
                <div class="step-info">
                    <span class="step-title" :data-mobile-title="step.mobileTitle">
                        {{ step.title }}
                    </span>
                </div>

                <!-- 连接线 -->
                <div v-if="index !== stepsToShow.length - 1" class="step-line"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SimpleSteps',
    props: {
        steps: {
            type: Array,
            required: true
        },
        active: {
            type: Number,
            default: 0
        },
        showCompleteStep: { // 添加是否显示完成步骤的属性
            type: Boolean,
            default: true
        }
    },

    computed: {
        stepsToShow() {
            if (!this.showCompleteStep) {
                // 如果不需要显示完成步骤,则过滤掉最后的完成步骤
                return this.steps.filter(step => !step.isComplete);
            }
            return this.steps;
        }
    }
}
</script>

<style lang="less" scoped>
.simple-steps {
    width: 100%;

    .steps-container {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        position: relative;
        padding: 0 20px;
    }

    .step {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        padding: 0 10px;

        &:last-child .step-line {
            display: none;
        }

        &.is-completed {
            .step-icon {
                background-color: #67C23A;
                border-color: #67C23A;

                i {
                    color: #fff;
                }
            }

            .step-line {
                background-color: #67C23A;
            }

            .step-title {
                color: #67C23A;
            }
        }

        &.is-active {
            .step-icon {
                background-color: #409EFF;
                border-color: #409EFF;

                i {
                    color: #fff;
                }
            }

            .step-title {
                color: #409EFF;
                font-weight: 700;
            }
        }

        &.is-disabled {
            display: none;
            cursor: not-allowed;

            .step-icon {
                background-color: #F5F7FA;
                border-color: #E4E7ED;

                i {
                    color: #C0C4CC;
                }
            }

            .step-title {
                color: #C0C4CC;
            }
        }
    }

    .step-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #DCDFE6;
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
        transition: all 0.3s;

        i {
            font-size: 16px;
            color: #909399;

            &.success-icon {
                font-weight: bold;
            }
        }
    }

    .step-info {
        text-align: center;
    }

    .step-title {
        font-size: 14px;
        color: #909399;
        transition: all 0.3s;
    }

    .step-line {
        position: absolute;
        top: 16px;
        right: calc(-50% + 16px);
        width: calc(100% - 32px);
        height: 2px;
        background-color: #DCDFE6;
        transition: all 0.3s;
    }

    @media screen and (max-width: 768px) {
        .steps-container {
            padding: 0 10px;
        }

        .step-title {
            font-size: 12px;

            &:after {
                content: attr(data-mobile-title);
                display: block;
                font-size: 12px;
            }

            >span {
                display: none;
            }
        }

        .step-line {
            right: calc(-50% + 12px);
            width: calc(100% - 24px);
        }

        .step-icon {
            width: 24px;
            height: 24px;

            i {
                font-size: 12px;
            }
        }
    }
}
</style>
