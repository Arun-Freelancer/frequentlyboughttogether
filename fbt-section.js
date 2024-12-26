window.addEventListener("load", (event) => {
    const productCheckboxes = document.querySelectorAll(".add-related-product");
    const totalPriceElement = document.getElementById("total-price");
    const savingPriceElement = document.getElementById("total-saving-price");
    const totalComparePriceElement = document.getElementById(
      "total-compare-price"
    );
  
    // Initial calculation of total prices
    recalculateTotalPrices();
  
    // Event listener for checkbox changes
    productCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        recalculateTotalPrices();
      });
    });
  
    // Function to recalculate total prices
    function recalculateTotalPrices() {
      let total_compare_at_price = 0;
      let total_price = 0;
  
      // Iterate through each checkbox
      productCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          // Fetch price and compare price from data attributes
          const price = parseFloat(
            checkbox.getAttribute("data-price").replace(/[^0-9.-]+/g, "")
          ); // Remove non-numeric characters
          const comparePrice = parseFloat(
            checkbox.getAttribute("data-compare-price").replace(/[^0-9.-]+/g, "")
          ); // Remove non-numeric characters
  
          // Add prices to totals
          total_price += price;
          total_compare_at_price += comparePrice;
        }
      });
  
      // Format and display the total prices
      totalPriceElement.textContent = formatPrice(total_price);
      totalComparePriceElement.textContent = formatPrice(total_compare_at_price);
      // savingPriceElement.textContent = formatPrice(
      //   total_compare_at_price - total_price
      // );
      // savingPriceElement.textContent = (
      //   total_compare_at_price - total_price
      // ).toFixed(0);
      savingPriceElement.textContent = formatPriceWith(
        total_compare_at_price - total_price
      );
    }
  
    // Function to format price
    function formatPriceWith(value) {
      const euros = Math.floor(value / 100);
  
      // Return the formatted price with the currency sign at the end
      return `${euros}€`;
    }
    // Function to format price
    function formatPrice(price) {
      const formattedPrice = price.toFixed().toString(); // Ensuring two decimal places and converting to string
      const parts = formattedPrice.split("."); // Splitting integer and decimal parts
  
      // Formatting integer part
      let integerPart = parts[0];
      if (integerPart.length > 2) {
        integerPart = integerPart.slice(0, -2) + "," + integerPart.slice(-2);
      }
  
      const decimalPart = parts.length > 1 ? "." + parts[0] : ""; // Handling decimal part if exists
      return "€" + integerPart + decimalPart;
    }
  });
  
  // Add to cart
  
  window.addEventListener("load", (event) => {
    const addToCartButton = document.getElementById("add-bundle-to-cart");
    const productCheckboxes = document.querySelectorAll(".add-related-product");
  
    const selectedProducts = [];
    const sellingPlanIds = [];
  
    // Iterate through product checkboxes
    productCheckboxes.forEach((checkbox) => {
      const productId = checkbox.getAttribute("data-product-id");
      const variantId = checkbox.getAttribute("data-variant-id");
      const sellingPlan = checkbox.getAttribute("data-selling-plan") ? checkbox.getAttribute("data-selling-plan") : '';
  
      checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
          selectedProducts.push({ productId, variantId });
        } else {
          const indexToRemove = selectedProducts.findIndex(
            (item) => item.variantId === variantId
          );
          if (indexToRemove !== -1) {
            selectedProducts.splice(indexToRemove, 1);
          }
        }
  
        console.log(selectedProducts);
      });
  
      if (checkbox.checked) {
        selectedProducts.push({ productId, variantId });
        sellingPlanIds.push(sellingPlan);
      }
    });
  
    addToCartButton.addEventListener("click", function (e) {
      e.preventDefault();
  
      const lineItems = selectedProducts.map((product, index) => {
        return {
          id: product.variantId,
          quantity: 1,
          properties:{
            '_checkId': sellingPlanIds[index]
          }
        };
      });
  
      const cartData = {
        cart: {
          items: lineItems,
        },
      };
  
      fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(cartData.cart),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
  
          // Fetch the updated cart data and trigger the cart-update event
          fetch("/cart.js", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
            .then((response) => response.json())
            .then((cart) => {
              window.dispatchEvent(
                new CustomEvent("open-cart", { detail: { open: true } })
              );
              window.dispatchEvent(
                new CustomEvent("cart-update", {
                  detail: { cart: cart, loading: false },
                })
              );
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        })
        .catch((error) => {
          // Handle errors
          console.error(error);
        });
    });
  });
    