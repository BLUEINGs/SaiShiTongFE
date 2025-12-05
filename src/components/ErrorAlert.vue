<template>
    <div v-if="visible" class="error-alert">
        <p>{{ message }}</p>
        <button @click="closeAlert">关闭</button>
    </div>
</template>

<script>
export default {
    props: {
        message: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            visible: false
        };
    },
    watch: {
        message(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.showAlert();
            }
        }
    },
    methods: {
        showAlert() {
            this.visible = true;
            setTimeout(this.closeAlert, 3000);
        },
        closeAlert() {
            this.visible = false;
        }
    }
};
</script>

<style scoped>
.error-alert {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f44336;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.error-alert button {
    background: none;
    border: none;
    color: white;
    font-weight: bold;
    cursor: pointer;
    margin-left: 10px;
}
</style>
