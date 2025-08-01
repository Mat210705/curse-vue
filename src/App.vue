.products-section {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}<template>
  <div id="app">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1>🛒 Sistema Mayorista</h1>
        <p>Encuentra productos, compara precios y controla tu presupuesto</p>
      </div>

      <div class="main-content">
        <!-- Sección de Productos -->
        <div class="products-section">
          <!-- Búsqueda y Filtros -->
          <div class="search-section">
            <div class="search-bar">
              <input 
                type="text" 
                class="search-input" 
                placeholder="Buscar productos..." 
                v-model="searchTerm"
              >
              <select class="filter-select" v-model="selectedCategory">
                <option value="">Todas las categorías</option>
                <option value="alimentos">Alimentos</option>
                <option value="limpieza">Limpieza</option>
                <option value="bebidas">Bebidas</option>
                <option value="higiene">Higiene</option>
              </select>
            </div>
            
            <!-- Control de Presupuesto -->
            <div class="budget-control">
              <label>Presupuesto: $</label>
              <input 
                type="number" 
                class="budget-input" 
                v-model="budget" 
                min="0"
              >
              <div :class="budgetStatusClass">{{ budgetStatusText }}</div>
            </div>
          </div>

          <!-- Grid de Productos -->
          <div class="products-grid">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id" 
              class="product-card"
            >
              <div class="product-header">
                <div>
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-brand">{{ product.brand }}</div>
                </div>
                <div :class="getStockClass(product.stock)">
                  {{ getStockText(product) }}
                </div>
              </div>
              
              <div class="price-section">
                <span class="current-price">${{ product.currentPrice.toLocaleString() }}</span>
                <span v-if="product.originalPrice" class="original-price">
                  ${{ product.originalPrice.toLocaleString() }}
                </span>
                <span v-if="product.offer" class="offer-badge">{{ product.offer }}</span>
              </div>
              
              <div class="brand-comparison">
                <strong>Otras marcas:</strong>
                <div v-for="alt in product.alternatives" :key="alt.brand">
                  <strong>{{ alt.brand }}:</strong> ${{ alt.price.toLocaleString() }}
                </div>
              </div>
              
              <div class="add-section">
                <input 
                  type="number" 
                  class="quantity-input" 
                  v-model="product.selectedQuantity" 
                  min="1" 
                  :max="product.stockCount"
                  :disabled="product.stock === 'sin-stock'"
                >
                <button 
                  class="add-btn" 
                  @click="addToCart(product)"
                  :disabled="product.stock === 'sin-stock'"
                >
                  {{ product.stock === 'sin-stock' ? 'Sin Stock' : 'Agregar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar del Carrito -->
        <div class="cart-sidebar">
          <div class="cart-header">
            <h3>🛍️ Mi Compra</h3>
            <div>Productos: {{ totalItems }}</div>
          </div>
          
          <div class="cart-items">
            <div v-if="cart.length === 0" class="empty-cart">
              <p>Tu carrito está vacío</p>
              <p>¡Agrega productos para comenzar!</p>
            </div>
            
            <div v-else>
              <div 
                v-for="item in cart" 
                :key="item.id" 
                class="cart-item"
              >
                <div class="cart-item-info">
                  <div class="cart-item-name">{{ item.name }}</div>
                  <div class="cart-item-details">{{ item.brand }} - Cant: {{ item.quantity }}</div>
                </div>
                <div class="cart-item-price">
                  ${{ (item.currentPrice * item.quantity).toLocaleString() }}
                </div>
                <button class="remove-btn" @click="removeFromCart(item.id)">×</button>
              </div>
            </div>
          </div>

          <div class="cart-total">
            <div class="total-amount">${{ totalAmount.toLocaleString() }}</div>
            <div>Total a pagar</div>
            <button 
              class="checkout-btn" 
              @click="checkout"
              :disabled="cart.length === 0"
            >
              Proceder al Pago
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WholesaleApp',
  data() {
    return {
      searchTerm: '',
      selectedCategory: '',
      budget: 10000,
      cart: [],
      products: [
        {
          id: 1,
          name: "Aceite de Girasol",
          brand: "La Familia",
          category: "alimentos",
          currentPrice: 850,
          originalPrice: 950,
          offer: "10% OFF",
          stock: "disponible",
          stockCount: 50,
          selectedQuantity: 1,
          alternatives: [
            { brand: "Natura", price: 920 },
            { brand: "Cocinero", price: 780 }
          ]
        },
        {
          id: 2,
          name: "Detergente Líquido 3L",
          brand: "Skip",
          category: "limpieza",
          currentPrice: 1200,
          originalPrice: null,
          offer: null,
          stock: "disponible",
          stockCount: 25,
          selectedQuantity: 1,
          alternatives: [
            { brand: "Ariel", price: 1350 },
            { brand: "Ala", price: 1100 }
          ]
        },
        {
          id: 3,
          name: "Coca Cola 2.25L",
          brand: "Coca Cola",
          category: "bebidas",
          currentPrice: 650,
          originalPrice: 750,
          offer: "PROMO",
          stock: "poco-stock",
          stockCount: 8,
          selectedQuantity: 1,
          alternatives: [
            { brand: "Pepsi", price: 620 },
            { brand: "Manaos", price: 450 }
          ]
        },
        {
          id: 4,
          name: "Papel Higiénico x12",
          brand: "Elite",
          category: "higiene",
          currentPrice: 2200,
          originalPrice: null,
          offer: null,
          stock: "sin-stock",
          stockCount: 0,
          selectedQuantity: 1,
          alternatives: [
            { brand: "Higienol", price: 2400 },
            { brand: "Noble", price: 1980 }
          ]
        },
        {
          id: 5,
          name: "Arroz Largo Fino 1kg",
          brand: "Marolio",
          category: "alimentos",
          currentPrice: 480,
          originalPrice: 520,
          offer: "8% OFF",
          stock: "disponible",
          stockCount: 100,
          selectedQuantity: 1,
          alternatives: [
            { brand: "Gallo", price: 550 },
            { brand: "Molinos", price: 510 }
          ]
        },
        {
          id: 6,
          name: "Lavandina 1L",
          brand: "Ayudín",
          category: "limpieza",
          currentPrice: 320,
          originalPrice: null,
          offer: null,
          stock: "disponible",
          stockCount: 75,
          selectedQuantity: 1,
          alternatives: [
            { brand: "Procenex", price: 290 },
            { brand: "Campodónico", price: 340 }
          ]
        },
        {
          id: 7,
          name: "Fideos Spaguetti 500g",
          brand: "Matarazzo",
          category: "alimentos",
          currentPrice: 280,
          originalPrice: 320,
          offer: "12% OFF",
          stock: "disponible",
          stockCount: 80,
          selectedQuantity: 1,
          alternatives: [
            { brand: "Don Vicente", price: 260 },
            { brand: "Lucchetti", price: 310 }
          ]
        },
        {
          id: 8,
          name: "Shampoo Anticaspa 400ml",
          brand: "Head & Shoulders",
          category: "higiene",
          currentPrice: 890,
          originalPrice: null,
          offer: null,
          stock: "poco-stock",
          stockCount: 12,
          selectedQuantity: 1,
          alternatives: [
            { brand: "Sedal", price: 650 },
            { brand: "Pantene", price: 820 }
          ]
        }
      ]
    }
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                             product.brand.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
        return matchesSearch && matchesCategory;
      });
    },
    totalItems() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },
    totalAmount() {
      return this.cart.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
    },
    budgetStatusClass() {
      const percentage = (this.totalAmount / this.budget) * 100;
      return 'budget-status ' + 
        (percentage <= 80 ? 'budget-ok' : 
         percentage <= 100 ? 'budget-warning' : 'budget-danger');
    },
    budgetStatusText() {
      const remaining = this.budget - this.totalAmount;
      return remaining >= 0 ? 
        `Disponible: $${remaining.toLocaleString()}` : 
        `Excedido: $${Math.abs(remaining).toLocaleString()}`;
    }
  },
  methods: {
    addToCart(product) {
      const existingItem = this.cart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += product.selectedQuantity;
      } else {
        this.cart.push({
          ...product,
          quantity: product.selectedQuantity
        });
      }
      
      // Reset selected quantity
      product.selectedQuantity = 1;
    },
    removeFromCart(productId) {
      this.cart = this.cart.filter(item => item.id !== productId);
    },
    getStockClass(stock) {
      return 'stock-indicator ' + 
        (stock === 'disponible' ? 'in-stock' : 
         stock === 'poco-stock' ? 'low-stock' : 'out-stock');
    },
    getStockText(product) {
      if (product.stock === 'disponible') return `En stock (${product.stockCount})`;
      if (product.stock === 'poco-stock') return `Poco stock (${product.stockCount})`;
      return 'Sin stock';
    },
    checkout() {
      alert(`¡Compra procesada! Total: $${this.totalAmount.toLocaleString()}`);
      this.cart = [];
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  background: white;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 100vw;
  height: 100vh;
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  padding: 20px;
  text-align: center;
  width: 100%;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  padding: 20px;
  width: 100%;
}

@media (min-width: 900px) {
  .main-content {
    grid-template-columns: 1fr 400px;
  }
}

.search-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 25px;
}

.search-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.filter-select {
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  background: white;
  cursor: pointer;
}

.budget-control {
  display: flex;
  gap: 15px;
  align-items: center;
  background: #e8f4f8;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.budget-input {
  padding: 10px;
  border: 2px solid #3498db;
  border-radius: 8px;
  width: 150px;
  font-weight: bold;
}

.budget-status {
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 20px;
  color: white;
}

.budget-ok { background: #27ae60; }
.budget-warning { background: #f39c12; }
.budget-danger { background: #e74c3c; }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.15);
  border-color: #3498db;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 15px;
}

.product-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.product-brand {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.stock-indicator {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.in-stock { background: #d5f4e6; color: #27ae60; }
.low-stock { background: #fef5e7; color: #f39c12; }
.out-stock { background: #fadbd8; color: #e74c3c; }

.price-section {
  margin: 15px 0;
}

.current-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #27ae60;
}

.original-price {
  text-decoration: line-through;
  color: #95a5a6;
  margin-left: 10px;
}

.offer-badge {
  background: #e74c3c;
  color: white;
  padding: 3px 8px;
  border-radius: 15px;
  font-size: 0.8rem;
  margin-left: 10px;
}

.brand-comparison {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  margin: 10px 0;
  font-size: 0.9rem;
}

.add-section {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 15px;
}

.quantity-input {
  width: 60px;
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  text-align: center;
}

.add-btn {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.add-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.cart-sidebar {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.cart-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.cart-header h3 {
  color: #2c3e50;
  font-size: 1.5rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-weight: bold;
  color: #2c3e50;
}

.cart-item-details {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.cart-item-price {
  font-weight: bold;
  color: #27ae60;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  margin-left: 10px;
}

.cart-total {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  text-align: center;
}

.total-amount {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.checkout-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 15px;
  transition: all 0.3s ease;
}

.checkout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
}

.checkout-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.empty-cart {
  text-align: center;
  color: #7f8c8d;
  padding: 40px 20px;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .search-bar {
    flex-direction: column;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
