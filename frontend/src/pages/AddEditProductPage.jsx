import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import "./AddEditProductstyle.css"; // Assure-toi de créer ce fichier pour le style

const AddEditProductPage = () => {
  const { productId } = useParams();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStokeQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await ApiService.getAllCategory();
        setCategories(categoriesData.categories);
      } catch (error) {
        showMessage(
          error.response?.data?.message ||
            "Error Getting all Categories: " + error
        );
      }
    };

    const fetchProductById = async () => {
      if (productId) {
        setIsEditing(true);
        try {
          const productData = await ApiService.getProductById(productId);
          if (productData.status === 200) {
            const p = productData.product;
            setName(p.name);
            setSku(p.sku);
            setPrice(p.price);
            setStokeQuantity(p.stockQuantity);
            setCategoryId(p.categoryId);
            setDescription(p.description);
            setImageUrl(p.imageUrl);
          } else {
            showMessage(productData.message);
          }
        } catch (error) {
          showMessage(
            error.response?.data?.message ||
              "Error Getting a Product by Id: " + error
          );
        }
      }
    };

    fetchCategories();
    if (productId) fetchProductById();
  }, [productId]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("sku", sku);
    formData.append("price", price);
    formData.append("stockQuantity", stockQuantity);
    formData.append("categoryId", categoryId);
    formData.append("description", description);
    if (imageFile) formData.append("imageFile", imageFile);

    try {
      if (isEditing) {
        formData.append("productId", productId);
        await ApiService.updateProduct(formData);
        showMessage("✅ Product successfully updated");
      } else {
        await ApiService.addProduct(formData);
        showMessage("✅ Product successfully saved");
      }
      navigate("/product");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "❌ Error saving product: " + error
      );
    }
  };

  return (
    <Layout>
      <div className="form-container">
        <h1>{isEditing ? "Edit Product" : "Add New Product"}</h1>

        {message && <div className="message">{message}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStokeQuantity(e.target.value)}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Price (€)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">-- Select a category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input type="file" onChange={handleImageChange} accept="image/*" />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="image-preview"
              />
            )}
          </div>

          <div className="form-actions full-width">
            <button
              type="button"
              className="btn cancel-btn"
              onClick={() => navigate("/product")}
            >
              Cancel
            </button>
            <button type="submit" className="btn submit-btn">
              {isEditing ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddEditProductPage;
