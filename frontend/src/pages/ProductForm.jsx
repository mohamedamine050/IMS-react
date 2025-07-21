// src/component/ProductForm.jsx
import React, { useState } from "react";
import "./ProductForm.css";

const ProductForm = ({ onClose, onSubmit, categories = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stockQuantity: "",
    categoryId: "",
    imageFile: null,
    imageUrl: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imageUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "imageUrl") finalData.append(key, value);
    });
    onSubmit(finalData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-form">
        <h2>Ajouter un produit</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Nom du produit" required onChange={handleChange} />
          <input name="sku" placeholder="SKU" required onChange={handleChange} />
          <input name="price" type="number" placeholder="Prix (€)" required onChange={handleChange} />
          <input name="stockQuantity" type="number" placeholder="Quantité" required onChange={handleChange} />
          
          <select name="categoryId" required onChange={handleChange}>
            <option value="">Choisir une catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <input type="file" onChange={handleImageChange} />
          {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="image-preview" />}

          <div className="form-buttons">
            <button type="submit">Ajouter</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
