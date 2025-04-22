<template>
    <div class="settings-container">
      <h2>账户设置</h2>
      <div v-for="field in fields" :key="field.key" class="field-row">
        <label :for="field.key">{{ field.label }}</label>
        <input
          :id="field.key"
          :type="field.type"
          v-model="user[field.key]"
          :readonly="!editMode[field.key]"
          :class="[{ editable: editMode[field.key] }, 'field-input']"
        />
        <button @click="toggleEdit(field.key)">
          {{ editMode[field.key] ? '保存' : '编辑' }}
        </button>
      </div>
      <!-- 密码修改单独处理 -->
      <div class="field-row">
        <label for="password">密码</label>
        <div class="password-section">
          <input
            id="password"
            type="password"
            v-model="password"
            :readonly="!editMode.password"
            :class="[{ editable: editMode.password }, 'field-input']"
            placeholder="******"
          />
          <button @click="toggleEdit('password')">
            {{ editMode.password ? '保存' : '编辑' }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        user: {
          phone: '13800138000',
          email: 'user@example.com',
          username: 'user123',
        },
        password: '',
        editMode: {
          phone: false,
          email: false,
          username: false,
          password: false,
        },
        fields: [
          { key: 'phone', label: '手机号', type: 'tel' },
          { key: 'email', label: '邮箱', type: 'email' },
          { key: 'username', label: '用户名', type: 'text' },
        ],
      };
    },
    methods: {
      toggleEdit(key) {
        if (this.editMode[key]) {
          // 保存逻辑：例如调用 API 更新
          this.saveField(key);
        }
        this.$set(this.editMode, key, !this.editMode[key]);
      },
      saveField(key) {
        // TODO: 将 user[key] 或 password 发送到后端
        alert(`保存字段 ${key}:`, key === 'password' ? this.password : this.user[key]);
      },
    },
  };
  </script>
  
  <style scoped>
  .settings-container {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    background-color: white;
    border: 1px solid #7a3b10;
    border-radius: 20px;
    box-sizing: border-box;
  }
  .settings-container h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #8b4513;
  }
  .field-row {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  .field-row label {
    width: 80px;
    color: #5c3317;
  }
  .field-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f2f1e4;
    color: #333;
  }
  .field-input.editable {
    background-color: white;
  }
  .field-row button {
    margin-left: 10px;
    padding: 5px 12px;
    background-color: #8b4513;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .password-section {
    display: flex;
    flex: 1;
  }
  </style>
  