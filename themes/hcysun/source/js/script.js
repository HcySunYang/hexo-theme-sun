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