<template>
    <div class="dialog-wrapper" v-if="visible">
        <div class="dialog-mask" @click="handleWrapperClick"></div>
        <div class="dialog" :style="dialogStyle" ref="dialogEl">
            <!-- 标题栏 -->
            <div class="dialog-header">
                <h3 class="title">{{ title }}</h3>
                <div class="header-actions">
                    <button class="close-btn" @click="handleClose">×</button>
                </div>
            </div>

            <!-- 内容区 -->
            <div class="dialog-body">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BaseDialog',
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
        closeOnClickMask: {
            type: Boolean,
            default: true
        }
    },

    computed: {
        dialogStyle() {
            const isMobile = window.innerWidth <= 768;
            return {
                width: isMobile ? '80%' : this.width
            }
        }
    },

    methods: {
        handleClose() {
            this.$emit('update:visible', false)
            this.$emit('close')
        },

        handleWrapperClick() {
            if (this.closeOnClickMask) {
                this.handleClose()
            }
        }
    },

    watch: {
        visible(val) {
            if (val) {
                document.body.style.overflow = 'hidden'
            } else {
                document.body.style.overflow = ''
            }
        }
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
    z-index: 2000;
}

.dialog-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    animation: fadeIn 0.3s;
}

.dialog {
    position: relative;
    background: #fff;
    border-radius: 4px;
    width: 420px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s;
    z-index: 1;
    max-height: 80vh;
}

.dialog-header {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
        margin: 0 auto;
        text-align: center;
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
    overflow-y: auto;
    flex: 1;
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
</style>
