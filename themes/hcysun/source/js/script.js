// 点击搜索按钮
$('.search-box').on('click', function () {
  $('.search-input').toggleClass('active');
  $('.search-mark').toggleClass('active');
  $('.search-input-el input[type=search]').attr('placeholder', 'Search...').focus();
  return false;
})

$('.search-input').on('click', function () {
  return false;
})

$(document).on('click', function () {
  $('.search-input').removeClass('active');
  $('.search-mark').removeClass('active');
})

// 初始化 highlight.js
$(document).ready(function() {
  $('pre code').each(function(i, block) {
    console.log(block)
    hljs.highlightBlock(block)
  });
});