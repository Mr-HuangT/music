(function () {
//音乐数据
    //模拟假的音乐数据，随后再用真实的数据替换
 /*   var data= [   {
        src: 'mp3/晴天.m4a',
        song:'晴天',
        singer:'娄艺潇',
        pic: 'https://p2.music.126.net/4wp5kkLC3I1L_b2edsjFHQ==/18867619532813466.jpg?param=34y34'
    },{
        src: 'mp3/模特.m4a',
        song:'模特',
        singer:'李荣浩',
        pic:'https://p1.music.126.net/0uZ_bKtm4E188Uk9LFN1qg==/109951163187393370.jpg?param=34y34'
    },{
        src: 'mp3/沙漠骆驼.m4a',
        song:'沙漠骆驼',
        singer:'展展与罗罗',
        pic: 'https://p1.music.126.net/oov7j64hTKZSm0CEUkRNoQ==/109951163111639178.jpg?param=34y34'
    }, {
        src: 'mp3/绿色.mp3',
        song:'绿色',
        singer:'陈雪凝',
        pic: 'https://p1.music.126.net/R4ZP3AJ9xV0vvw8LX7AbMA==/109951163860425334.jpg?param=34y34'
    },{
        src: 'mp3/老街.m4a',
        song:'老街',
        singer:'李荣浩',
        pic:'https://p1.music.126.net/0uZ_bKtm4E188Uk9LFN1qg==/109951163187393370.jpg?param=34y34'
    }];*/
var data=localStorage.getItem('mList')?
        JSON.parse(localStorage.getItem('mList')) :[];
    var searchData=[];
//获取元素
    var start = document.querySelector('.start');
    var audio = document.querySelector('audio');
    var nowSong = document.querySelector('.ctrl-bars-box p');
    var playListUl = document.querySelector('.play-list ul');
    var logoImg =document.querySelector('.bars img');
    var prev=document.querySelector('.prev');
    var next=document.querySelector('.next');
    var playTimeNow=document.querySelector('.playTimeNow');
    var playTimeTotal=document.querySelector('.playTimeTotal');
    var ctrlBar=document.querySelector('.ctrl-bar');
    var nowTimeBar=document.querySelector('.nowTime');
    var ctrlBtn=document.querySelector('.ctrl-btn');
    var playMode=document.querySelector('.mode');
    var info=document.querySelector('.mode-info');
    var list=document.querySelector('.list');
    var playList=document.querySelector('.play-list');
    var search=document.querySelector('.search');
    var del=document.querySelector('.del');


    var voice=document.querySelector('.voice');


    //变量
    var index=0;//控制当前播放的歌曲
    var rotateDeg=0;//控制专辑封面旋转度数
    var timer=null;//保存定时器

    var modeIndex = 0;//播放模式 0列表循环 1单曲循环 2随机播放
    var infoTimer = null;//控制提示框的定时器
    var flag=false;//标识列表是否弹出

    //更新播放列表方法
function updatePlayList() {
    var str='';//用来拼接播放项

    for(var i=0 ; i<data.length;i++){
        str +='<li>';
        str +='<span class="left"> '+ data[i].name +'</span>';
        str +='<span class="right">';
        for(var j=0;j<data[i].ar.length;j++){
            str +=data[i].ar[j].name + '';
        }
        str +='</span>';
        str +='</li>';
    }
    playListUl.innerHTML=str;
}
   updatePlayList();


// 删除播放列表方法
del.addEventListener('click',function () {
    data=[];
    localStorage.setItem('mList',JSON.stringify(data));
    data = localStorage.getItem('mList')?
        JSON.parse(localStorage.getItem('mList')):[];
    updatePlayList();
    loadListNum();
})





/*//在此处给ul绑定事件
    playListUl.addEventListener('click',function () {
        //我要找到li标签的事件触发
        var el=e.target;
        if(el.tagName === 'span'){
            el =el.parentNode;
        }
        //被点击的那个li播放

    });*/

$(playListUl).on('click','li',function () {
    index=$(this).index();
    init();
    play();
});
 //按Enter键进行搜索
search.addEventListener('keydown',function (e) {
    if(e.keyCode === 13){
        $.ajax({
            url:'https://api.imjad.cn/cloudmusic/',
            data:{
                type:'search',
                s:search.value
            },
            type:'get',
            //请求成功后触发
            success:function (result) {
                searchData=result.result.songs;
                var str='';
                //将搜索成功的数据添加到列表里
                for(var i=0; i<searchData.length;i++){
                   str +='  <li>' ;
                    str +='<span class="left song">'+searchData[i].name+'</span>' ;
                    str +='<span class="right singer">';
                        for(var j=0;j<searchData[i].ar.length;j++){
                            str += searchData[i].ar[j].name + ' ';
                        }
                      str +=  '</span>' ;
                    str += '</li>';
                }
                $('.searchList').html(str);
            },
            error:function (err) {
                console.log(err);
            }
        });
        this.value='';
    }
});
//添加浏览器缓存
$('.searchList').on('click','li',function () {
    var searchIndex=$(this).index();
     data.push(searchData[searchIndex]);
     localStorage.setItem('mList',JSON.stringify(data));

    data=localStorage.getItem('mList')?
        JSON.parse(localStorage.getItem('mList')) :[];
    updatePlayList();
    loadListNum();

});
//搜索列表点击播放
    $('.searchList').on('click','li',function () {
        index=data.length-1;
        init();
        play();
    })

//选中播放列表中播放的歌曲
  function checkPlayList() {
        var lis=document.querySelectorAll('.play-list ul li');
        //先干掉所有其他的，在给自己添加
        for(var i= 0; i<lis.length;i++){
            lis[i].className='';
        }
        lis[index].className='active';
    }

//格式化音乐格式
    function formatTime(time) {
        return time> 9 ? time : '0' + time;
    }

    //取不重复的数
    function getRandomNum(num,arr) {
        var randomNum = Math.floor(Math.random() * arr.length);
   if(randomNum === num){
       randomNum=getRandomNum();

   }
   return randomNum;
    }

    //页面加载初始化方法
    function init(){
        //初始化播放列表
        rotateDeg=0;
        checkPlayList();
        audio.src = 'http://music.163.com/song/media/outer/url?id='+ data[index].id +'.mp3 ';
        logoImg.src = data[index].al.picUrl;
       var str='';
       str += data[index].name + '---';
       for(var i=0;i<data[index].ar.length;i++){
           str+=data[index].ar[i].name + ' ';
       }
       nowSong.innerHTML=str;
    }


    //提示
function modeInfo(str) {

    $(info).fadeIn();
        info.innerHTML = str;
        clearTimeout(infoTimer);
    infoTimer =setTimeout(function () {
        $(info).fadeOut();
    },1000)
}

//加载播放歌曲数量
    function loadListNum() {
        list.innerHTML=data.length;
    }
loadListNum();
    //播放方法
    function play() {
        audio.play();
        start.style.backgroundPositionY='-166px';
        clearInterval(timer);
        timer=setInterval(function () {
            rotateDeg++;
            logoImg.style.transform='rotate('+rotateDeg+'deg)';
        },30);
    }
    init();

    //播放列表显示和隐藏
list.addEventListener('click',function () {
    if(flag){
        $(playList).animate({
            bottom:-200
        },300);
    }else{
        $(playList).animate({
            bottom:46
        },300);
    }
      flag = !flag;

});
    //音量调整
    voice.addEventListener('click',function () {

    })


    
    //点击模式按钮
    playMode.addEventListener('click',function () {
        modeIndex++;
        console.log(modeIndex);
        modeIndex= modeIndex >2 ? 0 : modeIndex;
        switch (modeIndex) {
            case 0:
                playMode.style.backgroundPositionX= - 0 + 'px';
                playMode.style.backgroundPositionY= - 342 + 'px';
                modeInfo('顺序播放');
        break;
            case 1:
                playMode.style.backgroundPositionX= - 63 + 'px';
                playMode.style.backgroundPositionY= - 342 + 'px';
                modeInfo('单曲循环');
        break;
            case 2:

                playMode.style.backgroundPositionX= - 63 + 'px';
                playMode.style.backgroundPositionY= - 246 + 'px';
                modeInfo('随机播放');
       break;
        }
    });
    //暂停播放
    start.addEventListener('click',function () {
        //当歌曲暂停的时候是true
        if(audio.paused){
            play();
        /*    start.style.backgroundPositionY = '-166px';
            setInterval(function () {
                rotateDeg++;
                logoImg.style.transform='rotate('+rotateDeg+'deg)';
            },30)*/

        }else{
            audio.pause();
            clearInterval(timer);

            start.style.backgroundPositionY = '-205px';
        }
    });
//下一曲
    next.addEventListener('click',function () {
        index++;
        index = index>data.length -1 ? 0 : index;
        init();
        play();
    });

    //上一曲
    prev.addEventListener('click',function () {
        index--;
        index = index< 0 ? data.length -1 : index;
        init();
        play();
    });

//让音频文件准备完毕后才能去检测音频的属性
audio.addEventListener('canplay',function () {
    var totalTime= audio.duration;
    var totalBarWidth= ctrlBar.clientWidth;
    var totalM=parseInt(totalTime / 60);
    var totalS=parseInt(totalTime % 60);
    playTimeTotal.innerHTML=formatTime(totalM)+ ':'+formatTime(totalS);

audio.addEventListener('timeupdate',function () {
    var currentTime=audio.currentTime;
    var currentM=parseInt(currentTime / 60);
    var currentS=parseInt(currentTime % 60);
    playTimeNow.innerHTML=formatTime(currentM)+ ':' + formatTime(currentS);
var nowBar = currentTime / totalTime * totalBarWidth;
nowTimeBar.style.width=nowBar + 'px';
ctrlBtn.style.left = nowBar - 7 + 'px';

if(audio.ended){
    //检查我的播放模式
    switch (modeIndex) {
        case 0:
            var e= document.createEvent("MouseEvents");
            e.initEvent("click",true,true);
            next.dispatchEvent(e);
            break;
        case 1:
            init();
            play();
            break;
        case 2:
            //取随机数
            index=getRandomNum(index,data);
            init();
            play();
            break;
    }
}



});

ctrlBar.addEventListener('click',function (e) {
    var mouseX=e.offsetX;
    audio.currentTime= mouseX/ totalBarWidth* totalTime;
});


});


})();