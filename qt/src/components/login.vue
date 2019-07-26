<template>
  <div class="hello">
    <div class="header">登录</div>
    <div class="row"><span>账号：</span><input type="text" v-model="userName"></div>
    <div class="row"><span>密码：</span><input type="password" v-model="passWord"></div>
    <div class="btn">
      <div class="login" @click="login">登录</div>
      <div class="register" @click="register">注册</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      userName: '',
      passWord: ''
    }
  },
  methods:{
    login(){
      var that = this
      this.$axios({
        method: 'get',
        url:this.$baseurl+'/login?userName=' + this.userName + '&passWord='+this.passWord
      }).then((res)=>{
        if(res.data.code == 1){
           sessionStorage.setItem('userId',res.data.data.userId)
           alert('登录成功')
           that.$router.push("/drawList")
        }else{
          alert(res.data.msg)
        }
      })
    },
    register(){
      this.$router.push("/register")
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped  lang="scss">
.header{
  height: 100px;
  line-height: 100px;
  font-size: 18px;
}
.row{
  font-size: 14px;
  margin: 10px auto;
}
.btn{
  font-size: 14px;
  width: 300px;
  margin: 40px auto;
  display: flex;
  justify-content: space-around;
  div{
    width: 100px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border-radius: 5px;
    border: 1px solid #eee;
  }
  div:hover{
    background-color: blue;
    color: white;
  }
}

</style>
