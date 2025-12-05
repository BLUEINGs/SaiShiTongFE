<template>
    <el-upload class="avatar-uploader" action="#" :show-file-list="false" :on-change="handlePreview"
        :before-remove="handleRemove" :auto-upload="false" accept="image/*">
        <div v-if="imageUrl" class="preview-wrapper">
            <img :src="imageUrl" class="preview-image">
            <div class="preview-mask">
                <i class="el-icon-zoom-in"></i>
                <i class="el-icon-delete" @click.stop="clearPreview"></i>
            </div>
        </div>
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
</template>

<script>
export default {
    props: {
        imageUrl: {
            type: String,
            default: ''
        }
    },
    methods: {
        handlePreview(file) {
            const previewURL = URL.createObjectURL(file.raw);
            this.$emit('update:imageUrl', previewURL);
            this.$emit('update:file', file.raw);
            this.$once('hook:beforeDestroy', () => {
                URL.revokeObjectURL(previewURL);
            });
        },
        clearPreview() {
            URL.revokeObjectURL(this.imageUrl);
            this.$emit('update:imageUrl', '');
            this.$emit('update:file', null);
        },
        handleRemove() {
            return this.$confirm('确定移除该图片？', '提示', {
                type: 'warning'
            });
        }
    }
};
</script>

<style lang="less" scoped>
.avatar-uploader {
    ::v-deep .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        line-height: normal;
        cursor: pointer;
        position: relative;
        overflow: hidden;

        &:hover {
            border-color: #409EFF;
        }
    }

    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }

    .avatar {
        width: 178px;
        height: 178px;
        display: block;
    }
}


.preview-wrapper {
    position: relative;
    width: 100%;
    height: 100%;

    .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* 悬浮遮罩 */
    .preview-mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s;

        i {
            color: white;
            font-size: 20px;
            margin: 0 5px;
            cursor: pointer;

            &:hover {
                color: #409EFF;
            }
        }
    }

    &:hover .preview-mask {
        opacity: 1;
    }
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    display: flex;
    // line-height: normal;
    justify-content: center;
    align-items: center;
    height: 100%;
}
</style>
