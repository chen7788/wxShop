const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/**
 * 封封微信的的request
 */
function request(url, data ={}, method='GET'){
  return new Promise(function(resolve, reject){
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'X-Dts-Token': wx.getStorageSync('token')
      },
      success: function(res){
        if (res.statusCode == 200) {
          if (res.data.errno == 501) {
            //清除登录相关内容
            try {
              wx.removeStorageSync('userInfo')
              wx.removeStorageSync('token')
            } catch (e) {
              
            }
            wx.navigateTo({
              url: '/pages/auth/login/index',
            })
          }else{
            resolve(res.data)
          }
        }else{
          reject(res.data)
        }
      },
      fail: function(err){
        reject(err)
      }
    })
  })
}
function redirect(url) {
  //判断页面是否需要登录
  if (url == '') {
    wx.redirectTo({
      url: '/pages/auth/login/index',
    })
  }else{
    wx.redirectTo({
      url: url,
    })
  }
}
function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}
function jhxLoadShow(message) {
  if (wx.showLoading){ // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.showLoading({
      title: message, 
      mask: true
    });
  }else {    // 低版本采用Toast兼容处理并将时间设为20秒以免自动消失
    wx.showToast({
      title: message, 
      icon: 'loading', 
      mask: true, 
      duration: 20000
    });
  }
}
function jhxLoadHide() {
  if (wx.hideLoading) {    // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.hideLoading();
  } else {
    wx.hideToast();
  }
}

module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast,
  jhxLoadShow,
  jhxLoadHide
}
