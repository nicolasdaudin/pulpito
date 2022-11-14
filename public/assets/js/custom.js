/* eslint-disable no-undef */
(function ($) {
  'use strict';

  // we removed the sticky navigation bar
  // $(window).on('scroll', function () {
  //     if ($(this).scrollTop() > 10) { $('.navbar-area').addClass("is-sticky"); }
  //     else { $('.navbar-area').removeClass("is-sticky"); }
  // });

  $(function () {
    $(window).on('scroll', function () {
      var scrolled = $(window).scrollTop();
      if (scrolled > 600) $('.go-top').addClass('active');
      if (scrolled < 600) $('.go-top').removeClass('active');
    });

    $('.go-top').on('click', function () {
      $('html, body').animate({ scrollTop: '0' }, 500);
    });
  });

  $('.mean-menu').meanmenu({
    meanScreenWidth: '1199',
  });

  $('.others-option-for-responsive .dot-menu').on('click', function () {
    $('.others-option-for-responsive .container .container').toggleClass(
      'active'
    );
  });
  $('.others-options .search-box').on('click', function () {
    $('.search-overlay').toggleClass('search-overlay-active');
  });
  $('.search-overlay-close').on('click', function () {
    $('.search-overlay').removeClass('search-overlay-active');
  });
  $('.language-option').each(function () {
    var each = $(this);
    each
      .find('.lang-name')
      .html(each.find('.language-dropdown-menu a:nth-child(1)').text());
    var allOptions = $('.language-dropdown-menu').children('a');
    each.find('.language-dropdown-menu').on('click', 'a', function () {
      allOptions.removeClass('selected');
      $(this).addClass('selected');
      $(this)
        .closest('.language-option')
        .find('.lang-name')
        .html($(this).text());
    });
  });

  // Service Slider
  $('.promotional_tour_slider').owlCarousel({
    loop: true,
    dots: true,
    autoplayHoverPause: true,
    autoplay: true,
    smartSpeed: 1000,
    margin: 10,
    nav: false,
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 2,
      },
      992: {
        items: 3,
      },
      1200: {
        items: 4,
      },
    },
  });
  // partner_slider_area Slider
  $('.partner_slider_area').owlCarousel({
    loop: true,
    dots: false,
    autoplayHoverPause: true,
    autoplay: true,
    smartSpeed: 1000,
    margin: 10,
    nav: false,
    responsive: {
      0: {
        items: 2,
      },
      768: {
        items: 4,
      },
      992: {
        items: 4,
      },
      1200: {
        items: 8,
      },
    },
  });

  // Slider For category pages / filter price
  if (typeof noUiSlider === 'object') {
    var priceSlider = document.getElementById('price-slider');

    // Check if #price-slider elem is exists if not return
    // to prevent error logs
    if (priceSlider == null) return;

    noUiSlider.create(priceSlider, {
      start: [0, 750],
      connect: true,
      step: 50,
      margin: 200,
      range: {
        min: 0,
        max: 1000,
      },
      tooltips: true,
      format: wNumb({
        decimals: 0,
        prefix: '$',
      }),
    });
  }
})(jQuery);

$(document).ready(function () {
  $('#dashboard_dropdowns').on('click', function () {
    $('#show_dropdown_item').slideToggle('slow');
  });
});

// OTP Input
document.querySelectorAll('.otSc').forEach(function (otpEl) {
  otpEl.addEventListener('keyup', backSp);
  otpEl.addEventListener('keypress', function () {
    var nexEl = this.nextElementSibling;
    nexEl.focus();
  });
});
function backSp(backKey) {
  if (backKey.keyCode == 8) {
    this.previousElementSibling.focus();
  }
}

jQuery(window).on('load', function () {
  jQuery('.preloader').fadeOut(500);
});
