<template>
    <div class="dialog-wrapper" v-if="visible" :style="{ zIndex: computedStyle.zIndex }">
        <!-- 只在需要时显示遮罩 -->
        <div v-if="useGlobalMask" class="dialog-mask" @click="handleWrapperClick"></div>
        <div class="dialog" :class="{ 'mobile': isMobile }" :style="computedStyle" ref="dialogEl">
            <!-- 移动端拖动条 -->
            <div v-if="isMobile" class="drag-handle" @mousedown="startDrag" @touchstart="startDrag">
                <div class="drag-indicator"></div>
            </div>

            <!-- 标题栏 -->
            <div class="dialog-header">
                <h3 class="title">{{ title }}</h3>
                <div class="header-actions">
                    <!-- 移动端仅显示确认按钮 -->
                    <template v-if="isMobile && !hasFooterSlot">
                        <button class="btn btn-confirm header-confirm" @click="handleConfirm">
                            {{ confirmText }}
                        </button>
                    </template>
                    <button v-else class="close-btn" @click="handleClose">×</button>
                </div>
            </div>

            <!-- 内容区 -->
            <div class="dialog-body" :class="{ 'has-footer': !hasFooterSlot && (!isMobile && !hideDefaultFooter) }">
                <slot></slot>
                <!-- 如果有自定义footer,直接渲染在body末尾 -->
                <template v-if="hasFooterSlot">
                    <div class="custom-footer">
                        <slot name="footer"></slot>
                    </div>
                </template>
            </div>

            <!-- 仅在非移动端且没有自定义footer时显示默认footer -->
            <div v-if="!isMobile && !hasFooterSlot && !hideDefaultFooter" class="dialog-footer">
                <button class="btn btn-cancel" @click="handleCancel">{{ cancelText }}</button>
                <button class="btn btn-confirm" @click="handleConfirm">
                    <span class="confirm-text">{{ confirmText }}</span>
                    <i class="el-icon-circle-check"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
// 全局记录当前打开的弹窗数量
let dialogCounter = 0;

export default {
    name: 'ResponsiveDialog',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        },
        width: {
            type: String,
            default: '500px'
        },
        hideDefaultFooter: {
            type: Boolean,
            default: false
        },
        cancelText: {
            type: String,
            default: '取消'
        },
        confirmText: {
            type: String,
            default: '确定'
        },
        closeOnClickMask: {
            type: Boolean,
            default: true
        },
        zIndex: {
            type: Number,
            default: 0
        },
        useGlobalMask: {
            type: Boolean,
            default: true
        }
    },

    data() {
        return {
            isMobile: false,
            dragStart: null,
            initialY: null,
            currentY: 0,
            currentZIndex: 0,
            dialogLevel: 0
        }
    },

    computed: {
        hasFooterSlot() {
            return !!this.$slots.footer
        },

        dialogStyle() {
            if (this.isMobile) {
                return {}
            }
            return {
                width: this.width
            }
        },

        computedStyle() {
            const style = this.dialogStyle || {};
            // 计算最终的 z-index
            const baseZIndex = 1000; // 降低基础层级，确保不会超过日期时间选择器
            const zIndex = this.zIndex || baseZIndex + (this.dialogLevel * 10);

            return {
                ...style,
                zIndex
            }
        }
    },

    methods: {
        handleClose() {
            this.$emit('update:visible', false)
            this.$emit('close')
        },

        handleCancel() {
            this.$emit('cancel')
            this.handleClose()
        },

        handleConfirm() {
            this.$emit('confirm')
        },

        handleWrapperClick() {
            if (this.closeOnClickMask) {
                this.handleClose()
            }
        },

        checkDevice() {
            this.isMobile = window.innerWidth <= 768
        },

        startDrag(e) {
            if (!this.isMobile) return;

            const touch = e.touches ? e.touches[0] : e;
            this.dragStart = touch.clientY;
            this.initialY = this.currentY;

            document.addEventListener('mousemove', this.onDrag);
            document.addEventListener('mouseup', this.stopDrag);
            document.addEventListener('touchmove', this.onDrag);
            document.addEventListener('touchend', this.stopDrag);
        },

        onDrag(e) {
            if (!this.dragStart) return;

            const touch = e.touches ? e.touches[0] : e;
            const currentPosition = touch.clientY;
            const diff = currentPosition - this.dragStart;

            if (diff > 0) { // 仅允许向下拖动
                this.currentY = this.initialY + diff;
                this.$refs.dialogEl.style.transform = `translateY(${this.currentY}px)`;
            }
        },

        stopDrag() {
            if (this.currentY > 100) { // 如果拖动距离超过100px，则关闭对话框
                this.handleClose();
            } else {
                // 回弹动画
                this.currentY = 0;
                this.$refs.dialogEl.style.transform = '';
            }

            this.dragStart = null;
            this.initialY = null;

            document.removeEventListener('mousemove', this.onDrag);
            document.removeEventListener('mouseup', this.stopDrag);
            document.removeEventListener('touchmove', this.onDrag);
            document.removeEventListener('touchend', this.stopDrag);
        },

        // 修改 updateZIndex 方法
        updateZIndex() {
            // 使用 $nextTick 确保 DOM 已更新
            this.$nextTick(() => {
                if (this.$el && this.visible) {
                    this.$el.style.setProperty('--dialog-z-index', this.computedStyle.zIndex);
                }
            });
        }
    },

    watch: {
        visible(val) {
            if (val) {
                // 打开对话框时
                dialogCounter++;
                this.dialogLevel = dialogCounter;
                document.body.style.overflow = 'hidden';
                // 在显示对话框时更新 z-index
                this.updateZIndex();
            } else {
                // 关闭对话框时
                dialogCounter--;
                if (dialogCounter === 0) {
                    document.body.style.overflow = '';
                }
            }
        },
        // 修改 computedStyle 的监听器
        computedStyle: {
            deep: true,
            handler() {
                if (this.visible) {
                    this.updateZIndex();
                }
            }
        }
    },

    mounted() {
        this.checkDevice()
        window.addEventListener('resize', this.checkDevice)
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.checkDevice)
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.stopDrag);
        document.removeEventListener('touchmove', this.onDrag);
        document.removeEventListener('touchend', this.stopDrag);
    }
}
</script>

<style lang="less" scoped>
.dialog-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none; // 重要：允许点击穿透到下层对话框
    z-index: var(--dialog-z-index, 2000); // 添加默认值2000
    overflow: visible;

    .dialog-mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        animation: fadeIn 0.3s;
        pointer-events: auto; // 恢复遮罩的点击事件
    }

    .dialog {
        pointer-events: auto; // 恢复对话框的点击事件
        position: relative;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        animation: slideIn 0.3s;
        z-index: 1;
        overflow: hidden;
        max-height: 90vh; // 添加最大高度限制

        &.mobile {
            overflow: hidden;
            border-radius: 24px 24px 0 0;
            width: 100%;
            height: 85vh; // 改为85vh
            max-height: 100vh;
            animation: slideUp 0.3s;
            position: fixed;
            bottom: 0;
            transition: transform 0.3s ease-out;

            .dialog-header {
                padding: 0 16px;
                height: 56px;

                .header-actions {
                    display: flex;
                    align-items: center;

                    .header-confirm {
                        background-color: #409eff;
                        padding: 6px 16px;
                        font-size: 18px;
                        color: white;
                        border-radius: 4px;
                    }
                }
            }
        }
    }
}

// 添加拖动条样式
.drag-handle {
    width: 100%;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: grab;

    .drag-indicator {
        width: 32px;
        height: 4px;
        background-color: #e0e0e0;
        border-radius: 4px;
    }

    &:active {
        cursor: grabbing;

        .drag-indicator {
            background-color: #c0c0c0;
        }
    }
}

// 修改移动端动画
@keyframes slideUp {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}

@keyframes slideDown {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(100%);
    }
}

// 移动端确认按钮样式
.header-confirm {
    background: transparent;
    border: none;
    color: #409eff;
    font-weight: 500;

    &:active {
        opacity: 0.7;
    }
}

.dialog-header {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
        margin: 0;
        font-size: 24px;
        color: #717c92;
    }

    .close-btn {
        border: none;
        background: none;
        font-size: 20px;
        color: #909399;
        cursor: pointer;
        padding: 0 4px;

        &:hover {
            color: #606266;
        }
    }
}

.dialog-body {
    padding: 16px;
    overflow-y: auto; // 确保内容可滚动
    flex: 1;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: #c0c6d3;
        border-radius: 3px;

        &:hover {
            background: #909399;
        }
    }

    &::-webkit-scrollbar-track {
        background: #f5f7fa;
        border-radius: 3px;
    }

    // 确保在Firefox中也有类似的滚动条样式
    scrollbar-width: thin;
    scrollbar-color: #c0c6d3 #f5f7fa;

    &.has-footer {
        padding-bottom: 16px;
        margin-bottom: 54px; // 为默认footer留出空间
    }

    // 自定义footer不需要margin-bottom，因为它是内嵌的
    .custom-footer {
        margin-top: 24px;
        transition: all 0.3s;
    }
}

.dialog-footer {
    position: absolute; // 改为绝对定位
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: #fff;
    border-top: 1px solid #ebeef5;
    z-index: 1; // 确保footer显示在内容之上
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    .btn {
        padding: 8px 16px;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;

        &.btn-cancel {
            background: #fff;
            color: #606266;

            &:hover {
                color: #409eff;
                border-color: #c6e2ff;
                background-color: #ecf5ff;
            }
        }

        &.btn-confirm {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            min-width: 88px;
            padding: 8px 20px;
            font-weight: 500;

            .confirm-text {
                margin-right: 2px;
            }

            i {
                font-size: 16px;
            }

            &:hover {
                background: #66b1ff;
                border-color: #66b1ff;
                transform: translateY(-1px);
            }

            &:active {
                transform: translateY(0);
            }
        }
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

@keyframes slideIn {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@media screen and (max-width: 768px) {
    .dialog-footer {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 8px;

        .btn {
            width: 100%;
            margin: 0;
        }
    }

    .dialog-body {
        &.has-footer {
            padding-bottom: 70px;
        }

    }

    .dialog-footer {
        .btn-confirm {
            padding: 10px 24px;

            i {
                font-size: 18px;
            }
        }
    }
}
</style>
