
/**
 * update: 2017.12.19
 */


import common from './common.js'

/**
 * 使用方式
 * import mork from '@public/mork.js'
 * let api;
 * sid.aroma.aromaSwtich = { val: 99, keys: NO };
 * sid.aroma.lightMode = { val: 101, keys: 'aromaSwtich' };
 *
 * data() {
 *      return {
 *          mork,
 *      };
 *  },
 *
 * created() {
 *      api = this.apiFn.call( this.mork.services );
 *  },
 */

/**
 * "services": [{
 * 		"ts": "20151212T121212Z",
 * 		"sid": "switch",
 * 		"data": {
 * 				// 0: 关 1: 开
 * 				"on": 1
 * 				}
 * }]
 */

const KEY       = 'hilink';
const METHODS   = 'getDevCacheAll setDeviceInfo modifyTitleStatus modifyTitleBar addMessage removeMessage jumpTo';
const CALLBACK  = 'callback';
const SPACE_RGE = /\s+|,\s*|\|\s*|-\s*/;
const NAME      = 'devCallback';

// 控制是否模拟上报
let isReport    = false;

/**
 * api 接口
 * this === services
 * @param { String } name
 */
export default function ( name ) {
	if ( !common.isArray( this ) ) return null;

	name = name || NAME;

	const hilink = window.hilink;

	let api = {}, services = this;

	let { parse, type, extend, NO } = common, stringify = JSON.stringify;

	// catchFn: trycatch 模拟
	// callbacks: 所有的回调函数
	let catchFn, callbacks, sidKeys = { };

	let sid, data, key, len, sendStr;

	// 缓存上次的值
	// 用来修改下发
	let devOldData = extend( [ ], services );

	Object.assign( api, {
		_name: name || NAME,
		services,
		isReset: false,
		delay: 0,

		/* 获取全局 */
		getDevCacheAll() {
			console.warn( 'getDevCacheAll' );
			catchFn( _ => hilink.getDevCacheAll( '0', '', name + '.getDevCacheAll' + CALLBACK ), null );
		},

		/* 下发状态 */
		setDeviceInfo( data, keys ) {
			// param data: { switch: { on: 1 } }
			sendStr = stringify( api.convertData( data, keys ) );
			console.warn( `下发: ${ sendStr }` );
			catchFn( _ => hilink.setDeviceInfo( '0', sendStr, name + '.setDeviceInfo' + CALLBACK ), data );
		},

		/* 设置标题栏 */
		modifyTitleStatus( data ) {
			// @param data: '热情模式'
			console.warn( `modifyTitleStatus: ${ data }` );
			catchFn( _ => hilink.modifyTitleStatus( data, name + '.modifyTitleStatus' + CALLBACK ), NO );
		},

		/* 设置标题栏颜色 */
		modifyTitleBar( color ) {
			// @param color: #00123456 ( 00 代表透明度 )
			console.warn( `modifyTitleBar: ${ color }` );
			catchFn( _ => hilink.modifyTitleBar( true, color, name + '.modifyTitleBar' + CALLBACK ), NO );
		},

		/* 警告提示 */
		removeMessage( data ) {
			// @param data: { type: 2 }
			console.warn( `removeMessage: ${ stringify( data ) }` );
			catchFn( _ => hilink.removeMessage( stringify( data ), name + '.removeMessage' + CALLBACK ), NO );
		},
		addMessage( data ) {
			// @param data: { type: 2, key: 1, icon: 1, msg: '添加信息' }
			console.warn( 'addMessage:', stringify( data ) );
			catchFn( _ => hilink.addMessage( stringify( data ), name + '.addMessage' + CALLBACK ), NO );
		},

		/* 拉起定时器 */
		jumpTo( url ) {
			// @param url: 'com.huawei.smarthome.timerPage'
			console.warn( 'jumpTo:', url );
			catchFn( _ => hilink.jumpTo( url, name + '.jumpTo' + CALLBACK ), NO );
		},

		/* sid 集合 */
		sid: { },

		/* 单独下发属性 */
		sends: { },

		/* 根据 sid 获去数据对象 */
		getSid( sid, target ) {

			target = target || services;
			return target[ target.findIndex( ele => ele.sid === sid ) ];
		},

		/* 下发成功, errcode === 0 */
		success: undefined,

		/* 下发失败, errcode !== 0 */
		error: undefined,

		/* 提交 */
		commit( source, res ) {

			// 保存旧数据
			extend( devOldData, services );
			// 赋值, 页面更新
			extend( source, res );
		},

		commitAll( data ) {
			services.forEach( ( el, index ) => {
				sid = data.findIndex( ele => ele.sid === el.sid );
				if ( sid === -1 ) return;
				extend( devOldData[ index ], data[ sid ] );
				el.data && extend( el.data, data[ sid ].data );
			} );
		},

		/* 转换下发的数据 */
		convertData( res, keys ) {
			// return { switch: { on: 1 }
			let obj = res.data, data = { };

			if ( keys == null ) {
				// 根据 sid 下发
				for ( key in obj ) {
					data[ key ] = obj[ key ];
				}
			} else {
				// 单独下发属性值
				if ( keys.split ) keys = keys.split( SPACE_RGE );
				for ( key in obj ) {
					if ( keys.some( el => key === el ) ) {
						data[ key ] = obj[ key ];
					}
				}
			}

			return { [ res.sid ]: data };
		},

		/* 获取旧数据 */
		getOldVal() {
			return devOldData;
		}

	} );

	/* 根据单独下发整个 sid */
	api.send = api.getDevCacheAll;

	/* 添加 sid 和 send 属性 */
	services.forEach( ( el, index ) => {
		let val;

		sid   = el.sid;
		data = api.getSid( sid, devOldData );
		val = data.data;

		// api.sid[ sid ] = data.data;

		/* 监听变化, 单独下发 */
		sidKeys[ sid ] = { data:  {}, sid };
		api.sid[ sid ] = { };
		for ( key in val ) {

			sidKeys[ sid ].data[ key ] = val[ key ];

			( ( sid, key ) => {
				Object.defineProperty( api.sid[ sid ], key, {
					get() {
						return sidKeys[ sid ].data[ key ];
					},
					set(val) {

						// TODO: 值没改变不下发
						if ( val.keys ) {
							sidKeys[ sid ].data[ key ] = val.val;
							if ( val.keys === NO || val.keys == null ) return;
							api.setDeviceInfo(  sidKeys[ sid ], key + ' ' + val.keys );
						} else {
							sidKeys[ sid ].data[ key ] = val;
							api.setDeviceInfo(  sidKeys[ sid ], key );
						}
					}
				} );
			} )( sid, key );
		}

		if ( data ) {
			api.send[ sid ] = ( data => _ => api.setDeviceInfo( data ) )( data );
		}
	} );

	/* try catch */
	catchFn = ( fn, data ) => {
		// data: { sid: 'switch', data:{ on: 1 } }
		try {
			fn();
		} catch (error) {
			console.warn('catch:', data ? data.sid || data : 'getDevCacheAll', data ? data : '' );

			if ( isReport ) {		/* 模拟上报 */
				report( data );
			} else {				/* 网页调试 */
				localhostDebugger( data );
			}
		}
	}

	/* 添加全局对象 */
	callbacks = ( window[ name ] = {} );

	/* 设备上报 */
	window[ 'deviceEventCallback' ] = res => {
		data = parse( res );
		console.warn( `设备上报: ${ res }` );
		api.commit( api.getSid( data.sid ), data );
	}

	/* 添加回调函数 */
	METHODS.split(SPACE_RGE).forEach( el => {
		key = el + CALLBACK;

		switch (el) {
			case 'getDevCacheAll':

				callbacks[ key ] = res => {
					console.warn( `Res: ${ res }` );
					data = parse( res );
					// api.commit( services, data.services );
					api.commitAll( data.services );
					api.isReset = true;
				};
				return;
		}

		/* 判断回调是否成功 */
		callbacks[ key ] = res => {
			res      = parse( res );
			let code = res.errcode;

			if ( 0 === code ) { 		// 成功
				console.warn( `下发成功, errorCode: `, res.errcode );
				type( api.success ) === 'function' && api.success( services );
				return;
			} else {					// 失败
				console.warn( `下发失败, errorCode: `, res.errcode );
				type( api.error ) === 'function' && api.error( services );

				switch (code) {
					case 10:			// 设备请求没有响应
						break;
					case 11:			// 设备已离线
						break;
					case 12:			// 设备数据参数校验非法，在设备控制参数校验失败时，返回APP或者云端
						break;
				}
			}
		}
	}, services );


	/* 模拟上报 */
	function report( data ) {

		let error = response => {
			console.dir( response );
			// localhostDebugger( data );
		};

		if ( data && data.sid ) {

			import( '../json/' + data.sid + '.json' ).then( response => {
				console.warn( `模拟上报: ${ stringify( response ) }` );
				api.commit( api.getSid( data.sid ), response );
			}, error );
		} else if ( data == null ) {

			import( '../json/report.json' ).then( response => {
				console.warn( `模拟上报-All: ${ stringify( response.services ) }` );
				api.commitAll( response.services );
				api.isReset = true;
			}, error );
		}
	}

	function localhostDebugger( data ) {
		// 整个 sid 对象覆盖
		window.setTimeout( _ => {
			if ( data == null ) return;
			extend( api.getSid( data.sid ), data );
			api.isReset = true;
		}, api.delay );
	}

	return api;
};