// pages/category/desc/index.js
var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navList: [],
    goodsList:[],
    id: 0,
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    page: 1,
    size: 10,
    totalPages: 1,
    clickNumber:0,
    canDrag:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    
        if (options.id) {
      that.setData({
        id: parseInt(options.id),
      });
    }

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          scrollHeight: res.windowHeight,
        });
      }
    });
    this.getCategoryInfo();
  },
  getCategoryInfo:function() {
  let that = this
  wx.showNavigationBarLoading({
    success: (res) => {},
  })
  util.request(api.GoodsCategory,{
    id:that.data.id
  }).then(res => {
    wx.stopPullDownRefresh({
      success: (res) => {},
    })
    wx.hideNavigationBarLoading({
      success: (res) => {},
    })
    if (res.errno == 0) {

      this.setData({
        navList:res.data.brotherCategory,
      })
      wx.setNavigationBarTitle({
        title: res.data.parentCategory.name,
      })
  // 当id是L1分类id时，这里需要重新设置成L1分类的一个子分类的id
          if (res.data.parentCategory.id == that.data.id) {
            that.setData({
              id: res.data.currentCategory.id
            });
          }
          res.data.brotherCategory.forEach(element => {
            let obj = new Object()
            obj['id'] = element.id
            obj['isGood'] = false
            obj['page'] = 1
            that.data.goodsList.push(obj)
          });
          //nav位置
          let currentIndex = 0;
          let navListCount = res.data.brotherCategory.length;
          for (let i = 0; i < navListCount; i++) {
            if (that.data.navList[i].id == that.data.id) {
              currentIndex =i;
              that.setData({
                clickNumber:i
              })
              break;
            }
            currentIndex += 1;
          }
          if (currentIndex > navListCount / 2 && navListCount > 5) {
            that.setData({
              scrollLeft: currentIndex * 60
            });
          }
          that.getGoodsList();
        } else {

        }
      }).catch(err => {
        console.log(err)
      })
},
getGoodsList: function() {
  var that = this;
  let isPage = false
 let isgood = that.data.goodsList.some(function(value,index,arr) {
   if(value.id == that.data.id){
      if(value.page == that.data.page && value.isGood){
        isPage = true
      }
   }
   return value.id == that.data.id
  })
  if(isgood && isPage){
    return
  }
  util.request(api.GoodsList, {
      categoryId: that.data.id,
      page: that.data.page,
      size: that.data.size
    })
    .then(function(res) {
      let arr = that.data.goodsList.slice()
      arr.some(function(item,index,array) {
          if (item.id == that.data.id) {
            if(item.page < that.data.page){
              item['goods'] = item['goods'].concat(res.data.goodsList)
            }else{
              item['goods'] = res.data.goodsList
            }
            item['page'] = that.data.page
            item.isGood = true
            return
          }
          return item.id == that.data.id
      })
      that.setData({
        goodsList: arr,
        totalPages: res.data.totalPages
      });
        });
},
switchCate: function(event) {
  if (this.data.id == event.currentTarget.dataset.id) {
    return false;
  }
  var that = this;
  var clientX = event.detail.x;
  var currentTarget = event.currentTarget;
  if (clientX < 60) {
    that.setData({
      scrollLeft: currentTarget.offsetLeft - 60
    });
  } else if (clientX > 330) {
    that.setData({
      scrollLeft: currentTarget.offsetLeft
    });
  }
  let num = 0
  that.data.goodsList.some(function(value,index,arr){
    if (value.id == event.currentTarget.dataset.id) {
      num = index
    }
  })
  this.setData({
    id: event.currentTarget.dataset.id,
    page: 1,
    totalPages: 1,
    clickNumber:num
  });
  this.getGoodsList();
},
swiperTab:function(event){
  if(event.detail.source == "touch"){
    const that = this
  that.checkTab(event)
  }
  
},
checkTab(event){
  const that = this
  that.setData({
    id: that.data.goodsList[event.detail.current].id,
    page: 1,
    totalPages: 1,
  });
  
  if (event.detail.current > 3) {
    that.setData({
      scrollLeft:event.detail.current*130,
      clickNumber:event.detail.current
    })
  }else{
    that.setData({
      scrollLeft:0,
      clickNumber:event.detail.current
    })
  }
  this.getGoodsList();
},
swiperTransition:function(event) {
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.page = 1
    this.getGoodsList(th.data.goodsList[this.data.clickNumber].id);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
   console.log("onReachBottom")
    if (this.data.totalPages > this.data.page) {
      this.setData({
        page: this.data.page + 1
      });
   } else {
      wx.showToast({
            title: '已经到底了!',
            icon: 'none',
            duration: 2000
      });
      return false;
   }
     this.getGoodsList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //页面滑动到底部
 bindDownLoad:function(event){ 
     var that = this;
     if (that.data.totalPages > that.data.page) {
    that.setData({
      page: that.data.page + 1
    });
 } else {
    wx.showToast({
          title: '已经到底了!',
          icon: 'none',
          duration: 2000
    });
    return false;
 }
 that.getGoodsList();
   },
   scroll:function(event){
    //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
  //    this.setData({
  //      scrollTop : event.detail.scrollTop
  //    });
   },
})
