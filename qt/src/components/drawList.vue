<template>
  <div class="drawList">
    <div class="addItem" @click="addItem">新增</div>
    <ul class="list">
      <li class="Item" v-for="(item,idx) in list" :key="idx" @click="clickItem(item.parentId)">{{item.drawName}}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      userId:'',
      isActiveItem: '',
      btnIsShow:true,
      color: '', // 颜色控制
      item: {
        style: {
          'z-index': '1',
          color: '#eeeeee',
          left: '0px',
          right: '0px',
          width: '100px',
          height: '100px',
          fontSize: '13px',
          transform: 'rotate(0deg)',
          'border-radius': '0'
        },
        childStyle: {
          'background-color': '#eeeeee',
          'border-radius': '0'
        }
      },
      list: []
    }
  },
  mounted:function () {
    // console.log(this.$store.state.showFooter)
    // this.$store.dispatch('hideFooter',55555)
    this.userId = sessionStorage.getItem('userId')
    if(this.userId){
      this.getList()
    }else{
      this.$router.push('/login')
    }
  },
  methods:{
    getList(){
      var that = this
      this.$axios({
        method: 'get',
        url:this.$baseurl+'/getDrawList?userId=' + this.userId
      }).then((res)=>{
        if(res.data.code == 1){
          that.list = JSON.parse(JSON.stringify(res.data.data))
        }
      })
    },
    clickItem(id1){
      this.$router.push('/drawItem?parentId=' + id1)
    },
    addItem(){
      this.$router.push('/drawItem')
    }
  }
}
</script>
<style scoped  lang="scss">
.index{
  height: 100%;
  width: 100%;
  position: relative;
  .handleList{
    padding-top: 8px; 
    position: absolute;
    right: 10px;
    top: 0;
    z-index: 99999999;
    background-color: rgb(245, 243, 243);
    transition:all 1s ease 0s;
    .switchBtn{
      position: absolute;
      left: 185px;
      top: 5px;
      width: 16px;
      height: 16px;
      transform: rotate(45deg);
      border: 1px solid #666;
      border-radius: 50%;
      z-index: 1;
      cursor: pointer;
      overflow: hidden;
    }
    .switchBtn::before,.switchBtn::after{
      display: block;
      position: absolute;
      left: 7.5px;
      z-index: 1;
      width: 0px;
      border-left: 1px solid #666;
      height: 99%;
      content: " "
    }
    .switchBtn::after{
      transform: rotate(90deg)
    }
    .btn{
      cursor: pointer;
      font-size: 14px;
      border: 1px solid #666;
      border-radius: 3px;
      background-color: white;
      width: 200px;
      height: 30px;
      line-height: 30px;
      margin: 5px;
      overflow: hidden;
    }
  }
  .fadeAway{
    right:-200px;
    .switchBtn{
      position: absolute;
      left: -10px;
      top: 50%;
      width: 20px;
      height: 20px;
      transform: rotate(45deg);
      border-right: none;
      border-top: none;
      z-index: -1;
      cursor: pointer;
       border-radius: 0;
    }
    .switchBtn::before,.switchBtn::after{
      display: block;
      position: absolute;
      left: 7.5px;
      z-index: 1;
      width: 0px;
      border-left: none;
      height: 0;
      content: ""
    }
  }
  .imageList{
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    li{
      position: absolute;
      left: 0;
      top: 0;
      height: 100px;
      width: 100px;
      padding: 2px;
      cursor: se-resize;
      .imgItem{
        cursor: move;
        position: absolute;
        left: 3px;
        right: 3px;
        top: 3px;
        bottom: 3px;
        background-color: rgb(114, 93, 93);
      }
    }
    .active{
      border: 1px solid #666;
    }
  }
}

</style>
