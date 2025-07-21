import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

const SellPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]); // [{productId, quantity}]
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await ApiService.getAllProducts();
        setProducts(productData.products);
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting Products: " + error
        );
      }
    };
    fetchProducts();
  }, []);

  const handleProductSelect = (productId, checked) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, { productId, quantity: 1 }]);
    } else {
      setSelectedProducts(
        selectedProducts.filter((p) => p.productId !== productId)
      );
    }
  };

  const handleQuantityChange = (productId, value) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.productId === productId
          ? { ...p, quantity: Number(value) }
          : p
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      showMessage("Veuillez sélectionner au moins un produit.");
      return;
    }

    if (selectedProducts.some((p) => !p.quantity || p.quantity <= 0)) {
      showMessage("Veuillez saisir une quantité valide pour chaque produit.");
      return;
    }

    const totalQuantity = selectedProducts.reduce(
      (sum, p) => sum + Number(p.quantity || 0),
      0
    );

    const body = {
      quantity: totalQuantity,
      products: selectedProducts, // [{productId, quantity}]
      description,
      note,
    };

    try {
      await ApiService.sellProduct(body);
      showMessage("Vente enregistrée !");
      resetForm();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Erreur lors de la vente : " + error
      );
    }
  };

  const resetForm = () => {
    setSelectedProducts([]);
    setDescription("");
    setNote("");
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      {message && <div className="message">{message}</div>}
      <div className="purchase-form-page">
        <h1>Sell Product</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Produits à vendre</label>
            {products.map((product) => {
              const selected = selectedProducts.find(
                (p) => p.productId === product.id
              );
              return (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={(e) =>
                      handleProductSelect(product.id, e.target.checked)
                    }
                  />
                  <span style={{ marginLeft: 8, marginRight: 8 }}>
                    {product.name}
                  </span>
                  {selected && (
                    <input
                      type="number"
                      min={1}
                      value={selected.quantity}
                      onChange={(e) =>
                        handleQuantityChange(product.id, e.target.value)
                      }
                      style={{ width: 60 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>

          <button type="submit">Sell Product</button>
        </form>
      </div>
    </Layout>
  );
};

export default SellPage;
