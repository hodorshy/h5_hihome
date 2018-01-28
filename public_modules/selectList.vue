<template>
  <div class='selectlist'>

        <div ref="mask"  class="selectFixedLayer" @click.stop="chooseIndex(-1)"  v-if="isListShow"></div>

        <transition name="choose-box"  v-if="isListShow">
            <ul class="selectContainer">
                <li v-for="(item,index) in selectList" :key="index" @click.stop="chooseIndex(index)">
                    {{item}}
                </li>
            </ul>
        </transition>
  </div>
</template>
<script>
/**
 * 底部按钮弹出选择框组件
 * 从父组件传值isListShow、selectList
 * isListShow:当前选择框是否显示(bool)
 * selectList:选择框的内容列表(Array)
 * chooseIndex(index): 子组件向父组件传值(index)，index为选中的列表序列号，当index==="return"时，表示点击的是选择框后面的模态框
 */
export default {
  name: "selectlist",
  props: ["isListShow", "selectList"],
  data() {
    return {};
  },
  mounted() {

  },
  methods: {
    chooseIndex(index) {
      this.$emit("chooseIndex", index);
      return false;
    }
  }
};
</script>
<style lang="css" scoped>
.selectFixedLayer {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: transparent;
  z-index: 9;
}
.selectContainer {
  z-index: 99;
  position: absolute;
  padding: 5px 16px;
  max-width: 50%;
  min-width: 80px;
  max-height: 260px;
  overflow: auto;
  left: 50%;
  bottom:150px;
  transform: translate(-50%, 0);
  background-color: #fff;
  border-radius: 8px;
  z-index: 100;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  -webkit-overflow-scrolling: touch;
  /* transition: all 1s; */
}

.selectContainer li {
  font-size: 1.3rem;
  line-height: 3rem;
  text-align: left;
  color: rgba(0, 0, 0, 0.7);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.selectContainer li:last-child {
  border: none;
}

.choose-box-enter-active {
  transition: all 0.5s ease;
}
.choose-box-leave-active {
  transition: all 0.3s ease;
}
.choose-box-enter,
.choose-box-leave-to {
  transform: translate(-50%, 30%);
  opacity: 0;
}
</style>