<template>
  <div class="index" @click="isActiveItem = ''">
    <div class="handleList" :class="btnIsShow?'':'fadeAway'">
      <div class="switchBtn" @click="btnIsShow = !btnIsShow"></div>
      <div style="width: 30px;"><colorPicker v-model="color" v-on:change="headleChangeColor" /></div>
      <div class="btn drawName" v-show="btnIsShow">名字：<input type="text" v-model="drawName" style="width:110px;"></div>
      <div class="btn addbtn" @click="addBtn">添加</div>
      <div class="btn addbtn" @click="delBtn">删除</div>
      <div class="btn addbtn" @click="upZIndex">提升高度</div>
      <div class="btn addbtn" @click="downZIndex">降低高度</div>
      <div class="btn addbtn" @click="rotate">旋转</div>
      <div class="btn addbtn" @click="circle">变圆</div>
      <div class="btn"><input type="file" @change="uploadeFile" multiple/></div>
      <div class="btn" @click="saveBtn">保存</div>
    </div>
    <ul class="imageList">
      <li @mousedown="zoom" :data-idx = "idx" v-for="(item,idx) in list" :key="idx" v-bind:style="item.style" :id="'item'+idx" @click="clickItem(idx)" :class="idx === isActiveItem ? 'active' : ''">
        <div class="imgItem" :data-idx = "idx" @mousedown="move" :style="item.childStyle"></div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      userId:'',
      parentId: '',
      drawName: '',
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
          'border-radius': '0',
          'background-image': '' ,
          'background-size': '100% 100%'
        }
      },
      list: []
    }
  },
  mounted:function () {
    this.userId = sessionStorage.getItem('userId')
    if(this.userId && this.$route.query.parentId){
      this.parentId = this.$route.query.parentId
      this.getList()
    }else if(!this.userId){
      this.$router.push('/login')
    }
  },
  methods:{
    uploadeFile(e){
      var that = this
      if(!e){
        return
      }
      let file = e.target.files[0] || e.dataTransfer.files[0];
      var reader = new FileReader();
      // 提交数据到后台
      var oMyForm = new FormData();
      oMyForm.append("file", file);
      var xhr = new XMLHttpRequest();            
      xhr.open('post', that.$baseurl + '/uploade', true);
      xhr.onreadystatechange = function() {
        // readyState == 4说明请求已完成
        if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) { 
          // 从服务器获得数据 
          // fn.call(this, xhr.responseText);  
          if(JSON.parse(xhr.responseText).code == 1){
            const item1 = JSON.parse(JSON.stringify(that.item))
            item1.childStyle['background-image'] = 'url("'+ JSON.parse(xhr.responseText).data.url + '")'
            that.list.push(item1)
          }else{
            alert(JSON.parse(xhr.responseText).msg);
          }
        }
      };
      xhr.send(oMyForm);
      // 加载图片  回显
      reader.onload = () => {
          //this.tradingUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    getList(){
      var that = this
      this.$axios({
        method: 'get',
        url:this.$baseurl+'/getDrawItem?userId=' + this.userId + '&parentId=' + this.$route.query.parentId
      }).then((res)=>{
        if(res.data.code == 1){
          const list = res.data.data
          that.drawName = list[0].drawName
          for(var i=0; i<list.length; i++){
            list[i].style = JSON.parse(list[i].style)
            list[i].childStyle = JSON.parse(list[i].childStyle)
          }
          that.list = JSON.parse(JSON.stringify(res.data.data))
        }
      })
    },
    clickItem(idx){
      this.isActiveItem = idx
      window.event.stopPropagation();
    },
    move(e){
      const that = this
      e=window.event||e;
      if(document.all){  //只有ie识别——————可能有误（document.all主要用来判断是否为ie浏览器）
        e.cancelBubble=true;
      }else{
        e.stopPropagation();
      }
      let odiv = e.target.parentNode;        //获取目标元素 de 父元素
      that.isActiveItem = odiv.dataset.idx // 鼠标move也要标定时第几个元素
      //算出鼠标相对元素的位置
      let disX = e.clientX - odiv.offsetLeft;
      let disY = e.clientY - odiv.offsetTop;
      document.onmousemove = (e)=>{       //鼠标按下并移动的事件
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = e.clientX - disX;    
        let top = e.clientY - disY;
        
        //绑定元素位置到positionX和positionY上面
        this.positionX = top;
        this.positionY = left;
        
        //移动当前元素
        odiv.style.left = left + 'px';
        odiv.style.top = top + 'px';
        that.list[that.isActiveItem].style['left'] = left + 'px'
        that.list[that.isActiveItem].style['top'] = top + 'px'
      };
      document.onmouseup = () => {
          document.onmousemove = null;
          document.onmouseup = null;
      };
    },
    zoom(e){
      const that = this
      let odiv = e.target;        //获取目标元素 
      that.isActiveItem = odiv.dataset.idx // 鼠标zoom也要标定时第几个元素
      //记录鼠标位置
      let disX = e.clientX;
      let disY = e.clientY;
      let width = e.currentTarget.clientWidth
      let height =  e.currentTarget.clientHeight
      document.onmousemove = (e)=>{       //鼠标按下并移动的事件
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = e.clientX - disX;    
        let top = e.clientY - disY;
        
        let width1 = width + left <= 0 ? 0 : width + left
        let height1 = height + top <= 0 ? 0 : height + top
        //绑定元素位置到positionX和positionY上面
        this.positionX = top;
        this.positionY = left;
        
        // //移动当前元素
        odiv.style.width = width1 + 'px';
        odiv.style.height = height1 + 'px';
        that.list[that.isActiveItem].style['width'] = width1 + 'px'
        that.list[that.isActiveItem].style['height'] = height1 + 'px'
      };
      document.onmouseup = () => {
          document.onmousemove = null;
          document.onmouseup = null;
      };
    },
    rotate () {
      window.event.stopPropagation();
      if(this.isActiveItem === ''){ return }
      let elId = 'item' + this.isActiveItem
      let el = document.getElementById(elId)
      let num = el.style.transform.replace(/[^0-9]/ig,"") - 0
      num += 45
      // el.style.transform = 'rotate(' + num + 'deg)'
      this.list[this.isActiveItem].style['transform'] = 'rotate(' + num + 'deg)'
    },
    circle(){
      if(this.isActiveItem === ''){ return }
      this.list[this.isActiveItem].style['border-radius'] = '50%'
      this.list[this.isActiveItem].childStyle['border-radius'] = '50%'
      window.event.stopPropagation();
    },
    addBtn(){
      window.event.stopPropagation();
      const obj = JSON.parse(JSON.stringify(this.item))
      this.list.push(obj)
      this.isActiveItem = ''
    },
    delBtn(){
      if(this.isActiveItem === ''){
        return
      }else{
        this.list.splice(this.isActiveItem,1)
        this.isActiveItem = ''
      }
      window.event.stopPropagation();
    },
    upZIndex(){
       window.event.stopPropagation();
      if(this.isActiveItem === ''){ return }
      let zIndex = this.list[this.isActiveItem].style['z-index'] - 0
      zIndex ++
      this.list[this.isActiveItem].style['z-index'] = zIndex
    },
    downZIndex(){
      window.event.stopPropagation();
      if(this.isActiveItem === ''){ return }
      let zIndex = this.list[this.isActiveItem].style['z-index'] - 0
      zIndex = zIndex - 1 <= 0 ? 0 : zIndex - 1
      this.list[this.isActiveItem].style['z-index'] = zIndex
    },
    headleChangeColor(){
      window.event.stopPropagation();
      this.item.childStyle['background-color'] = this.color
      if(this.isActiveItem === ''){ return }
      this.list[this.isActiveItem].childStyle['background-color'] = this.color
    },
    saveBtn(){
      window.event.stopPropagation();
      if(!this.drawName){
        alert("给取个名字吧")
        return
      }
      if(!this.list || this.list.length == 0){
        alert("没图不给保存")
        return
      }
      const data ={
        parentId: this.parentId,
        userId: this.userId,
        drawName: this.drawName,
        list: this.list
      }
      this.isActiveItem = ''
      this.$axios({
        method: 'post',
        url:this.$baseurl+'/saveList',
        data: this.$qs.stringify(data)
      }).then((res)=>{
        if(res.data.code == 1){
          alert('保存成功')
        }else{
          alert(res.data.msg)
        }
      })
    },
    stopBubbling(e){
      e=window.event||e;
      if(document.all){  //只有ie识别——————可能有误（document.all主要用来判断是否为ie浏览器）
        e.cancelBubble=true;
      }else{
        e.stopPropagation();
      }
    }
  }
}
</script>
<style scoped  lang="scss">
.index{
  height: 100%;
  width: 100%;
  position: relative;
  // .drawName{
  //   position: absolute;
  //   width: 300px;
  //   z-index: 222;
  //   left: 50%;
  //   right: 50%;
  //   transform: translateX(-50%);
  //   transform: translateX(-50%);
  //   -ms-transform: translateX(-50%);
  //   -webkit-transform: translateX(-50%);
  //   -o-transform: translateX(-50%);
  //   -moz-transform: translateX(-50%);
  // }
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
        img{
          width: 100%;
          height: 100%;
        }
      }
    }
    .active{
      border: 1px solid #666;
    }
  }
}

</style>
