
<template>
    <!-- update: 2017.12.29 15.40 by zp-->
    <div>

        <!-- 按钮小于 4 个 -->
        <ul class="bottom-simple" ref="bottomSimple" v-if=" length <= 4 ">

            <li v-for=" ( item, $index ) in data " :key="$index"
                :class="[ 'item', 'item_' + $index ]" @click=" tap( $index ) "
                :style="{ width: 100 / length + '%' }" >
                <slot :name=" 'item_' + $index " :index="$index + 1">
                    <BottomItem :ref=" 'item_' + $index "
                        :class="[ { switch: opt.switchIndex === $index }, { child: opt.childSwitch === $index }, { ungroup: item.ungroup } ]"
                        :word="words[ $index ]"
                        :index="$index + 1"
                        :curIndex.sync="opt.curIndex"
                        :isSwitch=" opt.switchIndex === $index "
                        :isChildSwitch=" opt.childSwitchIndex === $index "
                        :switch="opt.switch"
                        :item="( item.arrow ? item.ungroup = true : '', item )"
                        @childMode="childMode" >

                    </BottomItem>
                </slot>
            </li>
        </ul>

    </div>
</template>

<script>

/*  引用方式:

    <ButtomMenu :opt="bottomList"
                :words="words"
                @bottomCallback="bottomCallback">
        <!-- <div slot="item_2">xxx</div> -->
    </ButtomMenu>
*/

/*  传入的数据格式:

    bottomList: {

        data: [
            { ungroup: false, arrow: false, imgUrl: [ '/src/components/BottomList/images/on.jpg', '/src/components/BottomList/images/off.jpg' ], callback: index => console.log( 'bottomItemCallback:', index ) },
            { ungroup: false, arrow: true, imgUrl: '/src/components/BottomList/images/on.jpg', callback: index => console.log( 'bottomItemCallback:', index ) },
            { ungroup: false, arrow: false, imgUrl: '/src/components/BottomList/images/on.jpg', callback: index => console.log( 'bottomItemCallback:', index ) },
            { ungroup: true, arrow: false, imgUrl: '/src/components/BottomList/images/on.jpg', callback: index => console.log( 'bottomItemCallback:', index ) },
            ],

        arrowUrl: '/src/components/BottomList/images/off.jpg',
        curIndex: -99,
        switchIndex: 0,
        switch: false,
        childSwitchIndex: 3,
        childSwitch: false,
    },

    words() {
        return [ this.index1, this.index2, this.index3, this.index4 ];
    },
*/

/**
 * 属性:
 * ungroup: ( 可选: 缺省: false )            代表是否同组互斥关系, 为 true 不同组, 可以单独控制点击状态, 为 false 同组, 有互斥关系;
 * imgUrl: ( 可选 )                          图片路径, 素组或者单个字符串, 如果为数组, 背景图片在 active 变化的时候替换( 0, 1 之间替换 ),
 *                                           没有传入的话默认地址是在 './static/images/item_{{index}}.png', 替换即可
 *                                           开关图片切换是在 switch 变化的时候, 其他都是在 active 变化的时候
 * callback( index, item ): ( 可选 )         回调函数, 每个单独的回调函数, 也可以写在 bottomCallback 事件里, 通过 index 监听( 效果一样 );
 * bottomCallback( index ): ( 可选 )         点击事件
 * arrowCallback( index, item ): ( 可选 )     点击选择框的回调函数, isActive: 当前是否为活动状态, 当按钮处于互动状态是出现
 * activeCallback( isActive, index, item ): ( 可选 )  监听 active 的回调函数
 *
 * // 在组件里面添加的, 传值的时候不用传入
 * isActive: false,    // 控制是否会活动状态
 * isDisable: false,   // 控制是否为不可点击状态
 *
 *
 *  自定义, 里面可以是其他组件
        <BottomItem slot="item_2"
            :word="111111111111"
            :index="3"
            :curIndex.sync="bottomList.curIndex"
            :item="{ arrow: false, imgUrl: ['/src/components/BottomList/images/on.jpg', '/src/components/BottomList/images/off.jpg'] }" >
        </BottomItem>
 *
 * 关于 curIndex:
 *      1. curIndex 是控制第 n 个按钮的活动状态的弱属性, curIndex = 2, 即第二个会变成活动状态, 索引从 1 开始;
 *      2. curIndex 有开关的时候, 并且开关状态为 false 的时候, curIndex 值不能设置成正数, 初始状态是 active, 是错误的状态的;
 *      3. curIndex 不能控制 ungroup: true 的按钮和不继承组件默认行为的;
 *      4: curIndex 默认设置为 负数, 除开关外全部为 非活动状态
 *
 *
 * 关于自定义使用时是否继承默认行为:
 *      1. <BottomItem slot="item_2" :item="{  }"> </BottomItem>
 *          不传入 curIndex 和 index 值时, 是不会继承默认行为的;
 *          想要修改文字的话可以传入 :word="word" 属性, 或者使用 slot 插槽
 *          slot="item_2" 这个代表的是 curIndex = 3 的按钮, curIndex 是从 1 开始计数的;
 *
 *             <BottomItem slot="item_2" :item="{  }">
 *                  <span slot="word">{{ word }}<span>
 *             </BottomItem>
 *
 * 关于自定义控制开关状态 active 与 disable 状态
 *          <BottomItem slot="item_2" :item="{  }">
 *                  <span slot="word">{{ word }}<span>
 *          </BottomItem>
 *      { imgUrl: './static/images/on.jpg', callback: ( index, item ) => {
 *          item.isActive = !item.isActive;
            item.isDisable = !item.isDisable;
 *      } },
 *
 * 关于 select:
 *      1. 使用的时候在 item 里面传入一个 arrow 数组: { arrow: [ { name: 1, src: 'src' } ] }, select 不是本人写的, 格式请遵守;
 *      2. 在点击 select 的时候会触发 arrowCallback 回调函数, 两个参数: 索引, 对象数据 ( index, item )
 *      3. select 的显示与否绑定的是每个对应的 isActive 状态值;
 *
 * 关于注册的点击数函数:
 *      bottomCallback( index ) {   }
 *
 *
 * 注意点:  ================================ !!!!!!!!!!!!!!!!!!!!!!!
 *  1. curIndex 是从 1 开始递增的
 *  2. 童锁关闭, 其他按钮默认保留上次状态;
 *  3. words 数组控制显示内容, 推荐使用 computed;
 *  4. 样式值并未使用媒体查询, 比较坑;
 *  5. isActive 和 isDisable 不用传入;
 *
 */

import BottomItem from './BottomItem.vue'

export default {
    name: 'bottom-menu',
    props: [ 'opt', 'words' ],

    components: {
        BottomItem,
    },

    computed: {
        data() {
            return this.opt.data;
        },
        length() {
            return this.data.length;
        },
    },

    methods: {

        /* 点击事件 */
        tap( $index ) {
            switch ( $index ) {

                case this.opt.switchIndex:              // 开关
                    // this.clickSwitch( this.opt );
                    break;

                case this.opt.childSwitchIndex:         // 童锁
                    this.opt.childSwitch = !this.opt.childSwitch;
                    break;
            }

            // 开关管 || 为 disable 状态
            if ( this.switchIndex != null && ( !this.opt.switch || this.$refs[ 'item_' + $index ][ 0 ].isDisable ) ) return;

            this.$emit( 'bottomCallback', $index );
        },

        /* 开关点击事件 */
        clickSwitch( opt ) {

// TODO: 是否保留上次状态 ungroup
            opt.curIndex = opt.switch ? Math.abs( opt.curIndex ) : ( opt.data.filter( el => el.ungroup ).forEach( el => el.isActive = false ), -opt.curIndex );
            if ( opt.switch && opt.childSwitchIndex >= 0 && opt.childSwitchIndex < this.length ) {
                this.childMode( opt.data[ opt.childSwitchIndex ].isActive = false );
            }
        },

        /* 童锁控制 disable 状态 */
        childMode( isActive ) {
            this.opt.data.forEach( ( el, index ) => {
                !el.custom && index !== this.opt.switchIndex && index !== this.opt.childSwitchIndex && ( el.isDisable = isActive );
            } );
        },
    },

    watch: {
        'opt.switch'( val ) {
            // 切换图片
            let bswitch = this.$refs[ 'item_' + this.opt.switchIndex ][ 0 ];
            bswitch.imgIndex = +!val;
            this.clickSwitch( this.opt );
        },
        'opt': {
            deep: true,
            handler() { },
        },
    },
}
</script>

<style scoped lang="less">

.setHW() {
    width: 100%;
    height: 100%;
}

.bottom-simple {
    .setHW();
    box-sizing: border-box;
    padding: 24px 8px;

    .item {
        height: 100%;
        float: left;
    }
}

</style>

