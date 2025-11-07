import { cart,
  removeFromCart,
  saveQuantityLink,
  UpdateDeliveryDateOption,
  saveToStorage } from "../../data/cart.js";
import { deliveryOptions } from "../../data/deleveryOption.js";
import { products } from "../../data/products.js";
import { formatCurrency } from "../utils/money.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";
import { renderPaymentSummary } from "./paymentSummary.js";


export function renderOrderSummary() {
  let matchingProductHtml = '';
  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    let matchingProduct;
    products.forEach((product) => {
      if (productId === product.id) {
        matchingProduct = product;
      }
    })

    let deliveryOption;
    deliveryOptions.forEach((option) => {
      if (option.id === cartItem.deliveryOptionId) {
        deliveryOption = option
      }
      if (deliveryOption === undefined){
        deliveryOption = deliveryOptions[0]; // default option
      }
    })

    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');

    matchingProductHtml += `
      <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
        <div class="delivery-date">
          Delivery date: ${dateString}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image"
            src="${matchingProduct.image}">

          <div class="cart-item-details">
            <div class="product-name">
              ${matchingProduct.name}
            </div>
            <div class="product-price">
              $${formatCurrency(matchingProduct.priceCents)}
            </div>
            <div class="product-quantity">
              <span>
                Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
              </span>
              <span class="update-quantity-link js-update-quantity-link link-primary" data-product-id="${matchingProduct.id}">
                Update
              </span>

              <span class="save-quantity-link js-save-quantity-link link-primary" data-product-id="${matchingProduct.id}">
                Save
              </span>

              <input class="save-quantity-input js-save-quantity-input-${matchingProduct.id}">

              <span class="delete-quantity-link js-delete-quantity-link link-primary" data-product-id="${matchingProduct.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            
            ${renderDeliveryOption(matchingProduct, cartItem)}
          </div>
        </div>
      </div>
    `
  })
  document.querySelector('.js-order-summary')
    .innerHTML = matchingProductHtml;

  const deleteLink = document.querySelectorAll('.js-delete-quantity-link');
  deleteLink.forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      removeFromCart(productId);
      renderOrderSummary();
      renderPaymentSummary();
    })
  })

  const updateLink = document.querySelectorAll('.js-update-quantity-link')
  updateLink.forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      container.classList.add('is-editing-quantity');
    })
  })

  const saveLink = document.querySelectorAll('.js-save-quantity-link');
  saveLink.forEach((link) => {
    const productId = link.dataset.productId;
    const quantityInput = document.querySelector(`.js-save-quantity-input-${productId}`);
    
    link.addEventListener('click', () => {
      handleSaveQuantityLink(productId, quantityInput)
      renderPaymentSummary();
      saveToStorage();
    })

    quantityInput.addEventListener('keydown', (event) => {
      if(event.key === 'Enter'){
        handleSaveQuantityLink(productId, quantityInput);
        renderPaymentSummary();
        saveToStorage();
      }
    })
  })

  function handleSaveQuantityLink(productId, quantityInput ) {
    const container = document.querySelector(`.js-cart-item-container-${productId}`);
    container.classList.remove('is-editing-quantity');

    const newQuantity = Number(quantityInput.value);

    saveQuantityLink(productId, newQuantity);

    document.querySelector(`.js-quantity-label-${productId}`)
    .innerHTML = newQuantity;
    updateQuantityLabel();

  }
  updateQuantityLabel()

  function updateQuantityLabel() {
    let cartQuantity = 0;
    cart.forEach((cartItem) => {
      cartQuantity += cartItem.quantity
    })
    document.querySelector('.js-return-to-home-link')
      .innerHTML = `${cartQuantity} items`;
  }


  function renderDeliveryOption(matchingProduct, cartItem) {
    let html = '';

    deliveryOptions.forEach((deliveryOption) => {
      const today = dayjs();
      const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
      const dateString = deliveryDate.format('dddd, MMMM D');

      const priceString = deliveryOption.priceCents === 0 ? 'FREE' : formatCurrency(deliveryOption.priceCents)

      const ischecked = deliveryOption.id === cartItem.deliveryOptionId;
      
      html += `<div class="delivery-option js-delivery-option" 
      data-product-id="${matchingProduct.id}"
      data-delivery-option-id="${deliveryOption.id}">
        <input type="radio" ${ischecked ? 'checked' : ''}
          class="delivery-option-input"
          name="delivery-option-${matchingProduct.id}">
        <div>
          <div class="delivery-option-date">
            ${dateString}
          </div>
          <div class="delivery-option-price">
            $${priceString} - SHIPPING
          </div>
        </div>
      </div>
    
    `
    })
    

    return html;
  }

  document.querySelectorAll('.js-delivery-option')
    .forEach((deleveryOption) => {
      deleveryOption.addEventListener('click', () => {
        const {productId, deliveryOptionId} = deleveryOption.dataset;
        UpdateDeliveryDateOption(productId, deliveryOptionId);
        renderOrderSummary();
        renderPaymentSummary();
      })
    })
}
    