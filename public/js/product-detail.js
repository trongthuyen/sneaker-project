'use strict';
const figures = document.querySelectorAll('.product__small-figure');
const figure_list = document.querySelector('.product__small-figures');
const image_current = document.querySelector('.product__large-figure img');
const quantity_box = document.querySelector('.product__quantity-box');
const quantity = document.querySelector('.product__quantity');
const product__details = document.querySelector('.product__details');

const addProduct = document.querySelector('.icon-add');
const reduceProduct = document.querySelector('.icon-reduce');
const cart_button = document.querySelector('.user__cart');

const cart_popup = document.querySelector('.cart-popup');
const cancel_btns = document.querySelectorAll('.cart-popup__product-cancel');
const product_container = document.querySelector(
  '.cart-popup__product-container'
);
const empty_display = document.querySelector('.cart-popup__empty');

const btn_checkout = document.querySelector('.cart-popup__btn-checkout');
const cart_message = document.querySelector('.user__cart-message');

/////////////////////////////
//ULITIES FUNCTION
const moreProduct = () => {
  let productCount = product_container.dataset.numofproduct;
  if (productCount == 0) {
    product_container.classList.remove('cart-popup__product-container--hidden');
    empty_display.classList.add('cart-popup__empty--hidden');
    cart_message.classList.remove('user__cart-message--hidden');
  }

  productCount++;
  // console.log(productCount);
  product_container.dataset.numofproduct = productCount;

  //Cart message
  cart_message.textContent = productCount;
};

const lessProduct = () => {
  let productCount = product_container.dataset.numofproduct;
  productCount--;
  // console.log(productCount);
  product_container.dataset.numofproduct = productCount;
  cart_message.textContent = productCount;
  if (productCount == 0) {
    product_container.classList.add('cart-popup__product-container--hidden');
    empty_display.classList.remove('cart-popup__empty--hidden');
    cart_message.classList.add('user__cart-message--hidden');
  }
};

////////////////////////////////////////
//Switch current image
figure_list.addEventListener('click', e => {
  if (!e.target.hasAttribute('data-img')) return;
  figures.forEach(el => {
    el.classList.remove('product__small-figure--current');
  });
  e.target
    .closest('.product__small-figure')
    .classList.add('product__small-figure--current');

  const target_img = e.target.dataset.img;
  image_current.setAttribute('src', target_img);
});

//////////////////////////
// Adjust quantity box

quantity_box.addEventListener('click', e => {
  if (!e.target.classList.contains('product__icon-adj-quan')) return;
  if (e.target == addProduct) {
    quantity.value = Number(quantity.value) + 1;
  } else {
    const number = Number(quantity.value);
    quantity.value = number > 1 ? number - 1 : 1;
  }
});

/////////////////////////
// Display cart details

cart_button.addEventListener('click', () => {
  cart_popup.classList.remove('cart-popup--hidden');
  // console.log(cart_popup);
});
document.body.addEventListener('click', e => {
  // console.log(cart_popup.classList.contains("cart-popup--hidden"));
  // console.log(e.target.closest(".cart-popup"));
  if (
    e.target.closest('.cart-popup') != null ||
    e.target.closest('.user__cart') != null ||
    cart_popup.classList.contains('cart-popup--hidden')
  )
    return;

  // console.log("sad");
  cart_popup.classList.add('cart-popup--hidden');
});

////////////////////////////////
///Cancel product

// cancel_btns.forEach((el) => {
//   el.addEventListener("click", function (e) {
//     this.closest(".cart-popup__product").remove();
//     lessProduct();
//     e.stopPropagation();
//   });
// });
cart_popup.addEventListener('click', e => {
  if (!e.target.closest('.cart-popup__product-cancel')) return;
  e.target.closest('.cart-popup__product').remove();
  lessProduct();
  // console.log("das");
  e.stopPropagation();
});
////////////////////////
//Add to cart
const btn_atc = document.querySelector('.btn--atc');
btn_atc.addEventListener('click', function() {
  const product_quantity =
    product__details.querySelector('.product__quantity').value * 1;
  const product_price =
    product__details
      .querySelector('.product__lasted-price')
      .textContent.slice(1, -1) * 1;
  const product_image = figures[0].querySelector('img').src;
  const product_name = product__details.querySelector('.product__name')
    .textContent;
  // console.log(price);
  const html = `<div class="cart-popup__product">
            <figure class="cart-popup__product-img">
              <img src="${product_image}" alt="img" />
            </figure>
            <div class="cart-popup__product-details">
              <p class="cart-popup__product-name">
                ${
                  product_name.length > 25
                    ? product_name.slice(0, 25) + ' ...'
                    : product_name
                }
              </p>
              <div class="cart-popup__product-prices">
                <div class="cart-popup__product-price">
                  ${product_price} &times;
                  <span class="cart-popup__product-quantity">${product_quantity}</span>
                </div>
                <div class="cart-popup__product-total">$${(
                  product_quantity * product_price
                ).toFixed(2)}</div>
              </div>
            </div>
            <div class="cart-popup__product-cancel">
              <svg>
                <use xlink:href="/icomoon/spirite.svg#icon-trash"></use>
              </svg>
            </div>
          </div>`;
  product_container.insertAdjacentHTML('afterbegin', html);
  moreProduct();
});
