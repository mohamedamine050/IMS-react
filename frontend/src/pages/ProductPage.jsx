import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";
import { Search, Filter, Download, Plus, Edit, Trash2 } from "lucide-react";
import "./Productstyle.css";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const navigate = useNavigate();

  // Pagination Set-Up
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const getProducts = async () => {
      try {
        const productData = await ApiService.getAllProducts();

        if (productData.status === 200) {
          setProducts(productData.products);
          setFilteredProducts(productData.products);
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting Products: " + error
        );
      }
    };

    getProducts();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "in-stock" && product.stockQuantity > 5) ||
                           (statusFilter === "low-stock" && product.stockQuantity > 0 && product.stockQuantity <= 5) ||
                           (statusFilter === "out-of-stock" && product.stockQuantity === 0);

      const matchesCategory = categoryFilter === "all" || 
                             (product.category && product.category.toLowerCase() === categoryFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesCategory;
    });

    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, products]);

  // Get current page products
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  // Delete a product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this Product?")) {
      try {
        await ApiService.deleteProduct(productId);
        showMessage("Product successfully Deleted");
        window.location.reload();
      } catch (error) {
        showMessage(
          error.response?.data?.message ||
            "Error Deleting product: " + error
        );
      }
    }
  };

  // Get stock status
  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: "Rupture", class: "status-out-of-stock" };
    if (quantity <= 5) return { status: "Stock faible", class: "status-low-stock" };
    return { status: "En stock", class: "status-in-stock" };
  };

  // Method to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  // Export functionality placeholder
  const handleExport = () => {
    showMessage("Export functionality coming soon!");
  };

  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <Layout>
      {message && <div className="message">{message}</div>}

      <div className="product-management">
        {/* Header */}
        <div className="page-header">
          <h1>Gestion des Produits</h1>
          <button 
            className="add-product-btn"
            onClick={() => navigate("/add-product")}
          >
            <Plus size={16} />
            Ajouter un produit
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="controls-bar">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <Filter size={16} />
              <span>Filtres</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="in-stock">En stock</option>
              <option value="low-stock">Stock faible</option>
              <option value="out-of-stock">Rupture</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Toutes catégories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <button onClick={handleExport} className="export-btn">
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>

        {/* Products Table */}
        {getCurrentPageProducts().length > 0 ? (
          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>PRODUIT</th>
                  <th>SKU</th>
                  <th>QUANTITÉ</th>
                  <th>PRIX</th>
                  <th>CATÉGORIE</th>
                  <th>STATUT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageProducts().map((product) => {
                  const stockStatus = getStockStatus(product.stockQuantity);
                  return (
                    <tr key={product.id}>
                      <td className="product-cell">
                        <div className="product-info">
                          <img
                            src={product.imageUrl || "/api/placeholder/40/40"}
                            alt={product.name}
                            className="product-thumbnail"
                          />
                          <span className="product-name">{product.name}</span>
                        </div>
                      </td>
                      <td className="sku-cell">{product.sku}</td>
                      <td className="quantity-cell">{product.stockQuantity}</td>
                      <td className="price-cell">€{product.price}</td>
                      <td className="category-cell">{product.category || "Non classé"}</td>
                      <td className="status-cell">
                        <span className={`status-badge ${stockStatus.class}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => navigate(`/edit-product/${product.id}`)}
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-products">
            <p>Aucun produit trouvé.</p>
          </div>
        )}

        {/* Pagination */}
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </Layout>
  );
};

export default ProductPage;


     
