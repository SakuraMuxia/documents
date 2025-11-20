# jQuary

##  jQuary的初体验

**使用jQuary给一个按钮绑定单击事件**

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>

<script type="text/javascript" src="../script/jquery-1.7.2.js"></script>
<script type="text/javascript">

   //使用$()代替window.onload
   $(function(){
      //使用选择器获取按钮对象，随后绑定单击响应函数
      $("#btnId").click(function(){
         //弹出Hello
         alert('Hello');
      });
   });

</script>


</head>
<body>

   <button id="btnId">SayHello</button>

</body>
</html>
```

## 核心函数$

$ 是jQuery 的核心函数，能完成jQuery 的很多功能。$()就是调用$这个函数；

```ts
1、传入参数为[ 函数] 时：
表示页面加载完成之后。相当于window.onload = function(){}


2、传入参数为[ HTML 字符串] 时：
会对我们创建这个html 标签对象


3、传入参数为[ 选择器字符串] 时：
$(“#id 属性值”); id 选择器，根据id 查询标签对象
$(“标签名”); 标签名选择器，根据指定的标签名查询标签对象
$(“.class 属性值”); 类型选择器，可以根据class 属性查询标签对象


4、传入参数为[ DOM 对象] 时：
会把这个dom 对象转换为jQuery 对象
```

## 两者区别

jQuary对象和Dom对象的区分

```ts
Dom 对象

通过getElementById()查询出来的标签对象是Dom 对象
通过getElementsByName()查询出来的标签对象是Dom 对象
通过getElementsByTagName()查询出来的标签对象是Dom 对象
通过createElement() 方法创建的对象，是Dom 对象
DOM 对象Alert 出来的效果是：[object HTML 标签名Element]
```

```ts
jQuery 对象

通过JQuery 提供的API 创建的对象，是JQuery 对象
通过JQuery 包装的Dom 对象，也是JQuery 对象
通过JQuery 提供的API 查询到的对象，是JQuery 对象
jQuery 对象Alert 出来的效果是：[object Object]
```

jQuary对象和Dom对象使用区别

```ts
jQuery对象不能使用Dom对象的属性和方法

Dom对象也不能使用jQuary对象的属性和方法
```

Dom对象和jQuary对象的互相转化

```ts
// dom对象转换成jQuary对象
先有Dom对象
$(DOM对象)就可以转换成jQuary对象

// jQuery对象转为dom对象
先有jQuary对象
jQuary对象【下标】取出对应的DOM对象
```



## 底层本质

jQuary对象的本质是什么

jQuery对象是dom对象的数组+jQuary提供的一系列功能函数。

##  jQuary选择器

### 基本选择器

![image-20251106162204156](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106162204156.png)

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Untitled Document</title>
      <style type="text/css">
         div, span, p {
             width: 140px;
             height: 140px;
             margin: 5px;
             background: #aaa;
             border: #000 1px solid;
             float: left;
             font-size: 17px;
             font-family: Verdana;
         }
         
         div.mini {
             width: 55px;
             height: 55px;
             background-color: #aaa;
             font-size: 12px;
         }
         
         div.hide {
             display: none;
         }
      </style>
      <script type="text/javascript" src="../script/jquery-1.7.2.js"></script>
      <script type="text/javascript">
         
            $(function () {
               //1.选择 id 为 one 的元素 "background-color","#bbffaa"
               $("#btn1").click(function () {
                  // css() 方法 可以设置和获取样式
                  $("#one").css("background-color","#bbffaa");
               });


               //2.选择 class 为 mini 的所有元素
               $("#btn2").click(function () {
                  $(".mini").css("background-color","#bbffaa");
               });

               //3.选择 元素名是 div 的所有元素
               $("#btn3").click(function () {
                  $("div").css("background-color","#bbffaa");
               });

               //4.选择所有的元素
               $("#btn4").click(function () {
                  $("*").css("background-color","#bbffaa");
               });

               //5.选择所有的 span 元素和id为two的元素
               $("#btn5").click(function () {
                  $("span,#two").css("background-color","#bbffaa");
               });
               //6.选择所有的div元素，且元素class为mini
               $("#btn6").click(function () {
                  $("div.mini").css("background-color","#bbffaa");
               })

            });

      </script>
   </head>
   <body>
<!--   <div>
      <h1>基本选择器</h1>
   </div>  -->   
      <input type="button" value="选择 id 为 one 的元素" id="btn1" />
      <input type="button" value="选择 class 为 mini 的所有元素" id="btn2" />
      <input type="button" value="选择 元素名是 div 的所有元素" id="btn3" />
      <input type="button" value="选择 所有的元素" id="btn4" />
      <input type="button" value="选择 所有的 span 元素和id为two的元素" id="btn5" />
      <input type="button" value="选择 所有的 div 元素且class为mini的元素" id="btn6" />

      
      <br>
      <div class="one" id="one">
         id 为 one,class 为 one 的div
         <div class="mini">class为mini</div>
      </div>
      <div class="one" id="two" title="test">
         id为two,class为one,title为test的div
         <div class="mini" title="other">class为mini,title为other</div>
         <div class="mini" title="test">class为mini,title为test</div>
      </div>
      <div class="one">
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini"></div>
      </div>
      <div class="one">
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini" title="tesst">class为mini,title为tesst</div>
      </div>
      <div style="display:none;" class="none">style的display为"none"的div</div>
      <div class="hide">class为"hide"的div</div>
      <div>
         包含input的type为"hidden"的div<input type="hidden" size="8">
      </div>
      <span class="one" id="span">^^span元素^^</span>
   </body>
</html>
```

### 层次选择器

ancestor descendant 后代选择器：在给定的祖先元素下匹配所有的后代元素

![image-20251106162342084](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106162342084.png)

parent > child 子元素选择器：在给定的父元素下匹配所有的子元素

![image-20251106162423588](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106162423588.png)

prev + next 相邻元素选择器：匹配所有紧接在prev 元素后的next 元素

![image-20251106162444711](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106162444711.png)

prev ~ sibings 之后的兄弟元素选择器：匹配prev 元素之后的所有siblings 元素

![image-20251106162557691](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106162557691.png)

### 过滤选择器

#### 基本过滤器

![image-20251106162627475](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106162627475.png)

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Untitled Document</title>
      <style type="text/css">
         div, span, p {
             width: 140px;
             height: 140px;
             margin: 5px;
             background: #aaa;
             border: #000 1px solid;
             float: left;
             font-size: 17px;
             font-family: Verdana;
         }
         
         div.mini {
             width: 55px;
             height: 55px;
             background-color: #aaa;
             font-size: 12px;
         }
         
         div.hide {
             display: none;
         }        
      </style>
      <script type="text/javascript" src="../script/jquery-1.7.2.js"></script>
      <script type="text/javascript">
         $(document).ready(function(){
            function anmateIt(){
               $("#mover").slideToggle("slow", anmateIt);
            }
            anmateIt();
         });
         
         $(document).ready(function(){
            //1.选择第一个 div 元素  
            $("#btn1").click(function(){
               $("div:first").css("background", "#bbffaa");
            });

            //2.选择最后一个 div 元素
            $("#btn2").click(function(){
               $("div:last").css("background", "#bbffaa");
            });

            //3.选择class不为 one 的所有 div 元素
            $("#btn3").click(function(){
               $("div:not(.one)").css("background", "#bbffaa");
            });

            //4.选择索引值为偶数的 div 元素
            $("#btn4").click(function(){
               $("div:even").css("background", "#bbffaa");
            });

            //5.选择索引值为奇数的 div 元素
            $("#btn5").click(function(){
               $("div:odd").css("background", "#bbffaa");
            });

            //6.选择索引值为大于 3 的 div 元素
            $("#btn6").click(function(){
               $("div:gt(3)").css("background", "#bbffaa");
            });

            //7.选择索引值为等于 3 的 div 元素
            $("#btn7").click(function(){
               $("div:eq(3)").css("background", "#bbffaa");
            });

            //8.选择索引值为小于 3 的 div 元素
            $("#btn8").click(function(){
               $("div:lt(3)").css("background", "#bbffaa");
            });

            //9.选择所有的标题元素
            $("#btn9").click(function(){
               $(":header").css("background", "#bbffaa");
            });

            //10.选择当前正在执行动画的所有元素
            $("#btn10").click(function(){
               $(":animated").css("background", "#bbffaa");
            });
            //11.选择没有执行动画的最后一个div
            $("#btn11").click(function(){
               $("div:not(:animated):last").css("background", "#bbffaa");
            });
         });
      </script>
   </head>
   <body>
      <input type="button" value="选择第一个 div 元素" id="btn1" />
      <input type="button" value="选择最后一个 div 元素" id="btn2" />
      <input type="button" value="选择class不为 one 的所有 div 元素" id="btn3" />
      <input type="button" value="选择索引值为偶数的 div 元素" id="btn4" />
      <input type="button" value="选择索引值为奇数的 div 元素" id="btn5" />
      <input type="button" value="选择索引值为大于 3 的 div 元素" id="btn6" />
      <input type="button" value="选择索引值为等于 3 的 div 元素" id="btn7" />
      <input type="button" value="选择索引值为小于 3 的 div 元素" id="btn8" />
      <input type="button" value="选择所有的标题元素" id="btn9" />
      <input type="button" value="选择当前正在执行动画的所有元素" id="btn10" />    
      <input type="button" value="选择没有执行动画的最后一个div" id="btn11" />


      <h3>基本选择器.</h3>
      <br><br>
      <div class="one" id="one">
         id 为 one,class 为 one 的div
         <div class="mini">class为mini</div>
      </div>
      <div class="one" id="two" title="test">
         id为two,class为one,title为test的div
         <div class="mini" title="other">class为mini,title为other</div>
         <div class="mini" title="test">class为mini,title为test</div>
      </div>
      <div class="one">
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini"></div>
      </div>
      <div class="one">
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini" title="tesst">class为mini,title为tesst</div>
      </div>
      <div style="display:none;" class="none">style的display为"none"的div</div>
      <div class="hide">class为"hide"的div</div>
      <div>
         包含input的type为"hidden"的div<input type="hidden" size="8">
      </div>
      <div id="mover">正在执行动画的div元素.</div>
   </body>
</html>
```

#### 内容过滤器

![image-20251106162708033](000-images/13-JQuary/image-20251106162708033.png)

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Untitled Document</title>
      <style type="text/css">
         div, span, p {
             width: 140px;
             height: 140px;
             margin: 5px;
             background: #aaa;
             border: #000 1px solid;
             float: left;
             font-size: 17px;
             font-family: Verdana;
         }
         
         div.mini {
             width: 55px;
             height: 55px;
             background-color: #aaa;
             font-size: 12px;
         }
         
         div.hide {
             display: none;
         }        
      </style>
      <script type="text/javascript" src="../script/jquery-1.7.2.js"></script>
      <script type="text/javascript">
         $(document).ready(function(){
            function anmateIt(){
               $("#mover").slideToggle("slow", anmateIt);
            }
   
            anmateIt();             
         });
         
         /** 
         :contains(text)   
         :empty             
         :has(selector)     
         :parent          
         */
         $(document).ready(function(){
            //1.选择 含有文本 'di' 的 div 元素
            $("#btn1").click(function(){
               $("div:contains('di')").css("background", "#bbffaa");
            });

            //2.选择不包含子元素(或者文本元素) 的 div 空元素
            $("#btn2").click(function(){
               $("div:empty").css("background", "#bbffaa");
            });

            //3.选择含有 class 为 mini 元素的 div 元素
            $("#btn3").click(function(){
               $("div:has(.mini)").css("background", "#bbffaa");
            });

            //4.选择含有子元素(或者文本元素)的div元素
            $("#btn4").click(function(){
               $("div:parent").css("background", "#bbffaa");
            });
         });
      </script>
   </head>
   <body>    
      <input type="button" value="选择 含有文本 'di' 的 div 元素" id="btn1" />
      <input type="button" value="选择不包含子元素(或者文本元素) 的 div 空元素" id="btn2" />
      <input type="button" value="选择含有 class 为 mini 元素的 div 元素" id="btn3" />
      <input type="button" value="选择含有子元素(或者文本元素)的div元素" id="btn4" />
      
      <br><br>
      <div class="one" id="one">
         id 为 one,class 为 one 的div
         <div class="mini">class为mini</div>
      </div>
      <div class="one" id="two" title="test">
         id为two,class为one,title为test的div
         <div class="mini" title="other">class为mini,title为other</div>
         <div class="mini" title="test">class为mini,title为test</div>
      </div>
      <div class="one">
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini"></div>
      </div>
      <div class="one">
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini" title="tesst">class为mini,title为tesst</div>
      </div>
      <div style="display:none;" class="none">style的display为"none"的div</div>
      <div class="hide">class为"hide"的div</div>
      <div>
         包含input的type为"hidden"的div<input type="hidden" size="8">
      </div>
      <div id="mover">正在执行动画的div元素.</div>
   </body>
</html>
```

其中has的用法

![image-20251106162743421](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106162743421.png)

#### 属性过滤器

![image-20251106162758678](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106162758678.png)

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Untitled Document</title>
<style type="text/css">
div,span,p {
   width: 140px;
   height: 140px;
   margin: 5px;
   background: #aaa;
   border: #000 1px solid;
   float: left;
   font-size: 17px;
   font-family: Verdana;
}

div.mini {
   width: 55px;
   height: 55px;
   background-color: #aaa;
   font-size: 12px;
}

div.hide {
   display: none;
}
</style>
<script type="text/javascript" src="../script/jquery-1.7.2.js"></script>
<script type="text/javascript">
   /**
[attribute]          
[attribute=value]     
[attribute!=value]         
[attribute^=value]        
[attribute$=value]        
[attribute*=value]        
[attrSel1][attrSel2][attrSelN]  
   
   
   */
   $(function() {
      //1.选取含有 属性title 的div元素
      $("#btn1").click(function() {
         $("div[title]").css("background", "#bbffaa");
      });
      //2.选取 属性title值等于'test'的div元素
      $("#btn2").click(function() {
         $("div[title='test']").css("background", "#bbffaa");
      });
      //3.选取 属性title值不等于'test'的div元素(*没有属性title的也将被选中)
      $("#btn3").click(function() {
         $("div[title!='test']").css("background", "#bbffaa");
      });
      //4.选取 属性title值 以'te'开始 的div元素
      $("#btn4").click(function() {
         $("div[title^='te']").css("background", "#bbffaa");
      });
      //5.选取 属性title值 以'est'结束 的div元素
      $("#btn5").click(function() {
         $("div[title$='est']").css("background", "#bbffaa");
      });
      //6.选取 属性title值 含有'es'的div元素
      $("#btn6").click(function() {
         $("div[title*='es']").css("background", "#bbffaa");
      });
      
      //7.首先选取有属性id的div元素，然后在结果中 选取属性title值 含有'es'的 div 元素
      $("#btn7").click(function() {
         $("div[id][title*='es']").css("background", "#bbffaa");
      });
      //8.选取 含有 title 属性值, 且title 属性值不等于 test 的 div 元素
      $("#btn8").click(function() {
         $("div[title][title!='test']").css("background", "#bbffaa");
      });
   });
</script>
</head>
<body>
   <input type="button" value="选取含有 属性title 的div元素." id="btn1" style="display: none;"/>
   <input type="button" value="选取 属性title值等于'test'的div元素." id="btn2" />
   <input type="button"
      value="选取 属性title值不等于'test'的div元素(没有属性title的也将被选中)." id="btn3" />
   <input type="button" value="选取 属性title值 以'te'开始 的div元素." id="btn4" />
   <input type="button" value="选取 属性title值 以'est'结束 的div元素." id="btn5" />
   <input type="button" value="选取 属性title值 含有'es'的div元素." id="btn6" />
   <input type="button"
      value="组合属性选择器,首先选取有属性id的div元素，然后在结果中 选取属性title值 含有'es'的 div 元素."
      id="btn7" />
   <input type="button"
      value="选取 含有 title 属性值, 且title 属性值不等于 test 的 div 元素." id="btn8" />

   <br>
   <br>
   <div class="one" id="one">
      id 为 one,class 为 one 的div
      <div class="mini">class为mini</div>
   </div>
   <div class="one" id="two" title="test">
      id为two,class为one,title为test的div
      <div class="mini" title="other">class为mini,title为other</div>
      <div class="mini" title="test">class为mini,title为test</div>
   </div>
   <div class="one">
      <div class="mini">class为mini</div>
      <div class="mini">class为mini</div>
      <div class="mini">class为mini</div>
      <div class="mini"></div>
   </div>
   <div class="one">
      <div class="mini">class为mini</div>
      <div class="mini">class为mini</div>
      <div class="mini">class为mini</div>
      <div class="mini" title="tesst">class为mini,title为tesst</div>
   </div>
   <div style="display: none;" class="none">style的display为"none"的div</div>
   <div class="hide">class为"hide"的div</div>
   <div>
      包含input的type为"hidden"的div<input type="hidden" value="123456789"
         size="8">
   </div>
   <div id="mover">正在执行动画的div元素.</div>
</body>
</html>
```

#### 可见性过滤器

```ts
：hiddle

匹配所有不可见的元素，或者type为hiddle的元素

：visible

匹配所有可见的tr元素
```

#### 表单过滤器

![image-20251106162926301](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106162926301.png)

#### 表单对象属性过滤器

![image-20251106162943341](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106162943341.png)

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Untitled Document</title>
      <script type="text/javascript" src="../script/jquery-1.7.2.js"></script>
      <script type="text/javascript">
         $(function(){
            
            
      /**
      :input        
      :text     
      :password  
      :radio        
      :checkbox  
      :submit    
      :image        
      :reset        
      :button    
      :file     
      :hidden    
      
      表单对象的属性
      :enabled      
      :disabled     
      :checked      
      :selected     
      */

               
            //1.对表单内 可用input 赋值操作
            $("#btn1").click(function(){
               // val()可以操作表单项的value属性值
               // 它可以设置和获取
               $(":text:enabled").val("我是万能的程序员");
            });
            //2.对表单内 不可用input 赋值操作
            $("#btn2").click(function(){
               $(":text:disabled").val("管你可用不可用，反正我是万能的程序员");
            });
            //3.获取多选框选中的个数  使用size()方法获取选取到的元素集合的元素个数
            $("#btn3").click(function(){
               alert( $(":checkbox:checked").length );
            });
            //4.获取多选框，每个选中的value值
            $("#btn4").click(function(){
               // 获取全部选中的复选框标签对象
               var $checkboies = $(":checkbox:checked");
               // 老式遍历
               // for (var i = 0; i < $checkboies.length; i++){
               //     alert( $checkboies[i].value );
               // }

               // each方法是jQuery对象提供用来遍历元素的方法
               // 在遍历的function函数中，有一个this对象，这个this对象，就是当前遍历到的dom对象
               $checkboies.each(function () {
                  alert( this.value );
               });

            });
            //5.获取下拉框选中的内容  
            $("#btn5").click(function(){
               // 获取选中的option标签对象
               var $options = $("select option:selected");
               // 遍历，获取option标签中的文本内容
               $options.each(function () {
                  // 在each遍历的function函数中，有一个this对象。这个this对象是当前正在遍历到的dom对象
                  alert(this.innerHTML);
               });
            });
         }) 
      </script>
   </head>
   <body>
      <h3>表单对象属性过滤选择器</h3>
       <button id="btn1">对表单内 可用input 赋值操作.</button>
       <button id="btn2">对表单内 不可用input 赋值操作.</button><br /><br />
       <button id="btn3">获取多选框选中的个数.</button>
       <button id="btn4">获取多选框选中的内容.</button><br /><br />
         <button id="btn5">获取下拉框选中的内容.</button><br /><br />
       
      <form id="form1" action="#">         
         可用元素: <input name="add" value="可用文本框1"/><br>
         不可用元素: <input name="email" disabled="disabled" value="不可用文本框"/><br>
         可用元素: <input name="che" value="可用文本框2"/><br>
         不可用元素: <input name="name" disabled="disabled" value="不可用文本框"/><br>
         <br>
         
         多选框: <br>
         <input type="checkbox" name="newsletter" checked="checked" value="test1" />test1
         <input type="checkbox" name="newsletter" value="test2" />test2
         <input type="checkbox" name="newsletter" value="test3" />test3
         <input type="checkbox" name="newsletter" checked="checked" value="test4" />test4
         <input type="checkbox" name="newsletter" value="test5" />test5
         
         <br><br>
         下拉列表1: <br>
         <select name="test" multiple="multiple" style="height: 100px" id="sele1">
            <option>浙江</option>
            <option selected="selected">辽宁</option>
            <option>北京</option>
            <option selected="selected">天津</option>
            <option>广州</option>
            <option>湖北</option>
         </select>
         
         <br><br>
         下拉列表2: <br>
         <select name="test2">
            <option>浙江</option>
            <option>辽宁</option>
            <option selected="selected">北京</option>
            <option>天津</option>
            <option>广州</option>
            <option>湖北</option>
         </select>
      </form>       
   </body>
</html>
```

## jQuary元素筛选

```ts
eq() 获取给定索引的元素功能跟:eq()一样
first() 获取第一个元素功能跟:first一样
last()获取最后一个元素能跟:last一样
filter(exp)留下匹配的元素
is(exp)判断是否匹配给定的选择器，只要有一个匹配就返回，true

has(exp) 返回包含有匹配选择器的元素的元素功能跟:has 一样
not(exp) 删除匹配选择器的元素功能跟:not 一样
children(exp)返回匹配给定选择器的子元素功能跟parent>child 一样
find(exp)返回匹配给定选择器的后代元素功能跟ancestor descendant 一样
next()返回当前元素的下一个兄弟元素功能跟prev + next 功能一样
nextAll() 返回当前元素后面所有的兄弟元素功能跟prev ~ siblings 功能一样
nextUntil()返回当前元素到指定匹配的元素为止的后面元素  
parent() 返回父元素
add() 把add 匹配的选择器的元素添加到当前jquery 对象中

```

filter(exp) 案例

![image-20251106163211109](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106163211109.png)

is(exp) 案例

![image-20251106163342277](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106163342277.png)

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>DOM查询</title>
      <style type="text/css">
         div, span, p {
             width: 140px;
             height: 140px;
             margin: 5px;
             background: #aaa;
             border: #000 1px solid;
             float: left;
             font-size: 17px;
             font-family: Verdana;
         }
         
         div.mini {
             width: 55px;
             height: 55px;
             background-color: #aaa;
             font-size: 12px;
         }
         
         div.hide {
             display: none;
         }        
      </style>
      <script type="text/javascript" src="../script/jquery-1.7.2.js"></script>
      <script type="text/javascript">
         $(document).ready(function(){
            function anmateIt(){
               $("#mover").slideToggle("slow", anmateIt);
            }
            anmateIt();
            
   /**
               
   过滤
   eq(index|-index)         
   first()                
   last()                    
   hasClass(class)          
   filter(expr|obj|ele|fn)    
   is(expr|obj|ele|fn)1.6*    
   has(expr|ele)           
   not(expr|ele|fn)         
   slice(start,[end])           
   
   查找
   children([expr])         
   closest(expr,[con]|obj|ele)1.6*   
   find(expr|obj|ele)              
   next([expr])               
   nextall([expr])             
   nextUntil([exp|ele][,fil])1.6*     
   parent([expr])                 
   parents([expr])             
   parentsUntil([exp|ele][,fil])1.6*  
   prev([expr])               
   prevall([expr])             
   prevUntil([exp|ele][,fil])1.6*     
   siblings([expr])            
   
   串联
   add(expr|ele|html|obj[,con])   
                     
   
   */
            
            //(1)eq()  选择索引值为等于 3 的 div 元素
            $("#btn1").click(function(){
               $("div").eq(3).css("background-color","#bfa");
            });
            //(2)first()选择第一个 div 元素
             $("#btn2").click(function(){
                //first()   选取第一个元素
               $("div").first().css("background-color","#bfa");
            });
            //(3)last()选择最后一个 div 元素
            $("#btn3").click(function(){
               //last()  选取最后一个元素
               $("div").last().css("background-color","#bfa");
            });
            //(4)filter()在div中选择索引为偶数的
            $("#btn4").click(function(){
               //filter()  过滤   传入的是选择器字符串
               $("div").filter(":even").css("background-color","#bfa");
            });
             //(5)is()判断#one是否为:empty或:parent
            //is用来检测jq对象是否符合指定的选择器
            $("#btn5").click(function(){
               alert( $("#one").is(":empty") );
            });
            
            //(6)has()选择div中包含.mini的
            $("#btn6").click(function(){
               //has(selector)  选择器字符串    是否包含selector
               $("div").has(".mini").css("background-color","#bfa");
            });
            //(7)not()选择div中class不为one的
            $("#btn7").click(function(){
               //not(selector)  选择不是selector的元素
               $("div").not('.one').css("background-color","#bfa");
            });
            //(8)children()在body中选择所有class为one的div子元素
            $("#btn8").click(function(){
               //children()  选出所有的子元素
               $("body").children("div.one").css("background-color","#bfa");
            });
            
            
            //(9)find()在body中选择所有class为mini的div元素
            $("#btn9").click(function(){
               //find()  选出所有的后代元素
               $("body").find("div.mini").css("background-color","#bfa");
            });
            //(10)next() #one的下一个div
            $("#btn10").click(function(){
               //next()  选择下一个兄弟元素
               $("#one").next("div").css("background-color","#bfa");
            });
            //(11)nextAll() #one后面所有的span元素
            $("#btn11").click(function(){
               //nextAll()   选出后面所有的元素
               $("#one").nextAll("span").css("background-color","#bfa");
            });
            //(12)nextUntil() #one和span之间的元素
            $("#btn12").click(function(){
               //
               $("#one").nextUntil("span").css("background-color","#bfa")
            });
            //(13)parent() .mini的父元素
            $("#btn13").click(function(){
               $(".mini").parent().css("background-color","#bfa");
            });
            //(14)prev() #two的上一个div
            $("#btn14").click(function(){
               //prev()  
               $("#two").prev("div").css("background-color","#bfa")
            });
            //(15)prevAll() span前面所有的div
            $("#btn15").click(function(){
               //prevAll()   选出前面所有的元素
               $("span").prevAll("div").css("background-color","#bfa")
            });
            //(16)prevUntil() span向前直到#one的元素
            $("#btn16").click(function(){
               //prevUntil(exp)   找到之前所有的兄弟元素直到找到exp停止
               $("span").prevUntil("#one").css("background-color","#bfa")
            });
            //(17)siblings() #two的所有兄弟元素
            $("#btn17").click(function(){
               //siblings()    找到所有的兄弟元素，包括前面的和后面的
               $("#two").siblings().css("background-color","#bfa")
            });
            
            
            //(18)add()选择所有的 span 元素和id为two的元素
            $("#btn18").click(function(){
   
               //   $("span,#two,.mini,#one")
               $("span").add("#two").add("#one").css("background-color","#bfa");
                  
               
            });
            


         });
         
         
      </script>
   </head>
   <body>    
      <input type="button" value="eq()选择索引值为等于 3 的 div 元素" id="btn1" />
      <input type="button" value="first()选择第一个 div 元素" id="btn2" />
      <input type="button" value="last()选择最后一个 div 元素" id="btn3" />
      <input type="button" value="filter()在div中选择索引为偶数的" id="btn4" />
      <input type="button" value="is()判断#one是否为:empty或:parent" id="btn5" />
      <input type="button" value="has()选择div中包含.mini的" id="btn6" />
      <input type="button" value="not()选择div中class不为one的" id="btn7" />
      <input type="button" value="children()在body中选择所有class为one的div子元素" id="btn8" />
      <input type="button" value="find()在body中选择所有class为mini的div后代元素" id="btn9" />
      <input type="button" value="next()#one的下一个div" id="btn10" />
      <input type="button" value="nextAll()#one后面所有的span元素" id="btn11" />
      <input type="button" value="nextUntil()#one和span之间的元素" id="btn12" />
      <input type="button" value="parent().mini的父元素" id="btn13" />
      <input type="button" value="prev()#two的上一个div" id="btn14" />
      <input type="button" value="prevAll()span前面所有的div" id="btn15" />
      <input type="button" value="prevUntil()span向前直到#one的元素" id="btn16" />
      <input type="button" value="siblings()#two的所有兄弟元素" id="btn17" />
      <input type="button" value="add()选择所有的 span 元素和id为two的元素" id="btn18" />

      
      <h3>基本选择器.</h3>
      <br /><br />
      文本框<input type="text" name="account" disabled="disabled" />
      <br><br>
      <div class="one" id="one">
         id 为 one,class 为 one 的div
         <div class="mini">class为mini</div>
      </div>
      <div class="one" id="two" title="test">
         id为two,class为one,title为test的div
         <div class="mini" title="other"><b>class为mini,title为other</b></div>
         <div class="mini" title="test">class为mini,title为test</div>
      </div>
      
      <div class="one">
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini"></div>
      </div>
      <div class="one">
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini">class为mini</div>
         <div class="mini" title="tesst">class为mini,title为tesst</div>
      </div>
      <div style="display:none;" class="none">style的display为"none"的div</div>
      <div class="hide">class为"hide"的div</div>
      <span id="span1">^^span元素 111^^</span>
      <div>
         包含input的type为"hidden"的div<input type="hidden" size="8">
      </div>
      <span id="span2">^^span元素 222^^</span>
      <div id="mover">正在执行动画的div元素.</div>
      <p class="selected"></p><p class="selected">我是猪</p>
   </body>
</html>
```

## jQuary的操作

### 属性操作

```ts
注意：不传参数是获取，传递参数的设置

html() 它可以设置和获取起始标签和结束标签中的内容。跟dom 属性innerHTML 一样。

text() 它可以设置和获取起始标签和结束标签中的文本。跟dom 属性innerText 一样。

val() 它可以设置和获取表单项的value 属性值。跟dom 属性value 一样     val属性还可以设置多个表单项的选中状态

attr() 可以设置和获取属性的值，不推荐操作checked、readOnly、selected、disabled等等  attr 方法还可以操作非标准的属性。比如自定义属性：abc,bbj

prop()可以设置和获取属性的值，只推荐操作checked、readOnly、selected、disabled等等
```

![image-20251106163927447](https://2216847528.oss-cn-beijing.aliyuncs.com/asset/image-20251106163927447.png)

```ts
// each方法是jQuery对象提供用来遍历元素的方法
// 在遍历的function函数中，有一个this对象，这个this对象，就是当前遍历到的dom对象
$checkboies.each(function () {
  alert( this.value );
});
```

var方法示例

```html
<!DOCTYPE html>
<html lang="zh_CN">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script type="text/javascript" src="script/jquery-1.7.2.js"></script>
    <script type="text/javascript">
        /* $(function () {
             /!*
             // 批量操作单选
             $(":radio").val(["radio2"]);
             // 批量操作筛选框的选中状态
             $(":checkbox").val(["checkbox3","checkbox2"]);
             // 批量操作多选的下拉框选中状态
             $("#multiple").val(["mul2","mul3","mul4"]);
             // 操作单选的下拉框选中状态
             $("#single").val(["sin2"]);
             *!/
             $("#multiple,#single,:radio,:checkbox").val(["radio2","checkbox1","checkbox3","mul1","mul4","sin3"]
             );
         });*/
        $(function () {
            //批量操作单选
            /*$(":radio").val(["radio2"]);
            //批量操作复选框
            $(":checkbox").val(["checkbox1","checkbox2","checkbox3"]);
            //批量操作下拉框选中状态
            $("#multiple").val(["mul1","mul2","mul3","mul4"]);*/
            //可以一次性操作全部的
            // $(":radio,:checkbox").val(["radio2","checkbox1","checkbox2"])


        });
    </script>
</head>
<body>
<body>
单选：
<input name="radio" type="radio" value="radio1" />radio1
<input name="radio" type="radio" value="radio2" />radio2
<br/>
多选：
<input name="checkbox" type="checkbox" value="checkbox1" />checkbox1
<input name="checkbox" type="checkbox" value="checkbox2" />checkbox2
<input name="checkbox" type="checkbox" value="checkbox3" />checkbox3
<br/>
下拉多选：
<select id="multiple" multiple="multiple" size="4">
    <option value="mul1">mul1</option>
    <option value="mul2">mul2</option>
    <option value="mul3">mul3</option>
    <option value="mul4">mul4</option>
</select>
<br/>
下拉单选：
<select id="single">
    <option value="sin1">sin1</option>
    <option value="sin2">sin2</option>
    <option value="sin3">sin3</option>
</select>
</body>
</body>
</html>
```

### 操作dom

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Untitled Document</title>
<link rel="stylesheet" type="text/css" href="styleB/css.css" />
<script type="text/javascript" src="../../script/jquery-1.7.2.js"></script>
<script type="text/javascript">
   function deletete(){

      var val = $(this).parents("tr").find("td").first().text();
      if (confirm("你确定要删除"+val+"吗")) {

         $(this).parents("tr").remove();
      }
      return false;
      };
   $(function () {
      $("a").click(deletete);
       $("#addEmpButton").click(function () {
          var value = $(":text")[0].value;
          var value1 = $(":text")[1].value;
          var value2 = $(":text")[2].value;
          var $1 = $("<tr><td>"+value+"</td>" +
                "<td>"+value1+"</td>" +
                "<td>"+value2+"</td>" +
                "<td><a href=\"deleteEmp?id=002\">Delete</a></td></tr>");
          $1.find("a").click(
            deletete)
          $1.appendTo($("#employeeTable"));

       })

   })

   
   
</script>
</head>
<body>

   <table id="employeeTable">
      <tr>
         <th>Name</th>
         <th>Email</th>
         <th>Salary</th>
         <th>&nbsp;</th>
      </tr>
      <tr>
         <td>Tom</td>
         <td>tom@tom.com</td>
         <td>5000</td>
         <td><a href="deleteEmp?id=001">Delete</a></td>
      </tr>
      <tr>
         <td>Jerry</td>
         <td>jerry@sohu.com</td>
         <td>8000</td>
         <td><a href="deleteEmp?id=002">Delete</a></td>
      </tr>
      <tr>
         <td>Bob</td>
         <td>bob@tom.com</td>
         <td>10000</td>
         <td><a href="deleteEmp?id=003">Delete</a></td>
      </tr>
   </table>

   <div id="formDiv">
   
      <h4>添加新员工</h4>

      <table>
         <tr>
            <td class="word">name: </td>
            <td class="inp">
               <input type="text" name="empName" id="empName" />
            </td>
         </tr>
         <tr>
            <td class="word">email: </td>
            <td class="inp">
               <input type="text" name="email" id="email" />
            </td>
         </tr>
         <tr>
            <td class="word">salary: </td>
            <td class="inp">
               <input type="text" name="salary" id="salary" />
            </td>
         </tr>
         <tr>
            <td colspan="2" align="center">
               <button id="addEmpButton" value="abc">
                  Submit
               </button>
            </td>
         </tr>
      </table>

   </div>

</body>
</html>
```

### 操作样式

> addClass() 添加样式
>
> removeClass() 删除样式
>
> toggleClass() 有就删除，没有就添加样式。
>
> offset() 获取和设置元素的坐标。

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
<style type="text/css">
   
   div{
      width:100px;
      height:260px;
   }
   
   div.whiteborder{
      border: 2px white solid;
   }
   
   div.redDiv{
      background-color: red;
   }
   
   div.blueBorder{
      border: 5px blue solid;
   }
   
</style>

<script type="text/javascript" src="script/jquery-1.7.2.js"></script>
<script type="text/javascript">
   

   $(function(){
      
      var $divEle = $('div:first');
      
      $('#btn01').click(function(){
         //addClass() - 向被选元素添加一个或多个类
         $divEle.addClass("redDiv blueBorder");
      });
      
      $('#btn02').click(function(){
         //removeClass() - 从被选元素删除一个或多个类 
         $divEle.removeClass("redDiv");
      });
   
      
      $('#btn03').click(function(){
         //toggleClass() - 对被选元素进行添加/删除类的切换操作 
         $divEle.toggleClass('redDiv')
      });
      
      
      $('#btn04').click(function(){
         //offset() - 返回第一个匹配元素相对于文档的位置。
         var pos = $divEle.offset();
         console.log(pos);

         $divEle.offset({
            top:100,
            left:50
         });

      });
   })
</script>
</head>
<body>
   <table align="center">
      <tr>
         <td>
            <div class="border">
            </div>
         </td>
         
         <td>
            <div class="btn">
               <input type="button" value="addClass()" id="btn01"/>
               <input type="button" value="removeClass()" id="btn02"/>
               <input type="button" value="toggleClass()" id="btn03"/>
               <input type="button" value="offset()" id="btn04"/>
            </div>
         </td>
      </tr>
   </table>
   <br /> <br />
   <br /> <br />
</body>
</html>
```

### 事件操作

jQuary和原生js

他们分别是在什么时候触发？

```ts
1.jQuary的页面加载完成之后是浏览器的内核解析完页面的标签创建好DOM对象之后马上执行。
2、原生js的页面加载完成之后，出来要等浏览器内核解析完标签创建好DOM对象，还要等标签显示时需要的内容加载
```

他们触发的顺序？

```ts
1、jQuery页面加载完成之后先执行
2、原生js的页面加载完成之后
```

他们执行的次数？

```ts
1、原生js的页面加载完成之后，只会执行最后一次赋值语句
2、jQuery的页面加载完成之后是全部把注册的function函数，依次顺序全部执行
```

```ts
$(function(){
    $("h5").click(function(){//传function是绑定事件
        alert('h5单击事件 == click方法绑定')
    })
    $("button").click(function(){
        $("h5").click();//不传function是触发事件
        
    })
})
```

事件方法

```ts
click() 它可以绑定单击事件，以及触发单击事件
mouseover() 鼠标移入事件
mouseout() 鼠标移出事件
bind() 可以给元素一次性绑定一个或多个事件。
one() 使用上跟bind 一样。但是one 方法绑定的事件只会响应一次。
unbind() 跟bind 方法相反的操作，解除事件的绑定
live() 也是用来绑定事件。它可以用来绑定选择器匹配的所有元素的事件。哪怕这个元素是后面动态创建出来的也有效
```

事件冒泡

```ts
什么是事件的冒泡？

事件的冒泡是指，父子元素同时监听同一个事件。当触发子元素的事件的时候，同一个事件也被传递到了父元素的事件里去响应。

如何阻止冒泡
在子元素事件函数体内，return false; 可以阻止事件的冒泡传递。
```

事件对象

> 在给元素绑定事件的时候，在事件的function( event ) 参数列表中添加一个参数，这个参数名，我们习惯取名为event。这个event 就是javascript 传递参事件处理函数的事件对象。

```ts
//1.原生javaScript获取事件对象
window.onload = function(){
    document.getElementById("areaDiv").onclick = function(event){
        concole.log(event);
    }
}
//2.jQuery获取事件的对象
$(function () {
	$("#areaDiv").click(function (event) {
		console.log(event);
	});
});
```

使用bind同时对多个事件绑定同一个函数。怎么获取当前操作是什么事件

```ts
$("#areaDiv").bind("mouseover mouseout",function (event) {
    if (event.type == "mouseover") {
        console.log("鼠标移入");
    } else if (event.type == "mouseout") {
        console.log("鼠标移出");
	}
});
```

图片跟随案例

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
<style type="text/css">
   body {
      text-align: center;
   }
   #small {
      margin-top: 150px;
   }
   #showBig {
      position: absolute;
      display: none;
   }
</style>
<script type="text/javascript" src="script/jquery-1.7.2.js"></script>
<script type="text/javascript">
   $(function(){
      $("#small").bind("mouseover mouseout mousemove",function (event) {
         if (event.type == "mouseover") {
            $("#showBig").show();
         } else if (event.type == "mousemove") {
            console.log(event);
            $("#showBig").offset({
               left: event.pageX + 10,
               top: event.pageY + 10//这里加十，是为了和鼠标位置分离，这样才可以真正每次都响应事件，以防止鼠标指着判定为不在当前图像位置上
            });
         } else if (event.type == "mouseout") {
            $("#showBig").hide();
         }
      });
   });
</script>
</head>
<body>

   <img id="small" src="img/small.jpg" />
   
   <div id="showBig">
      <img src="img/big.jpg">
   </div>

</body>
</html>
```



## jQuary动画

```ts
基本动画

show() 将隐藏的元素显示
hide() 将可见的元素隐藏。
toggle() 可见就隐藏，不可见就显示。
以上动画方法都可以添加参数。
1、第一个参数是动画执行的时长，以毫秒为单位
2、第二个参数是动画的回调函数(动画完成后自动调用的函数)

淡入淡出动画
fadeIn() 淡入（慢慢可见）
fadeOut() 淡出（慢慢消失）
fadeTo() 在指定时长内慢慢的将透明度修改到指定的值。
fadeToggle() 淡入/淡出切换
0 透明，1 完成可见，0.5 半透明
```

