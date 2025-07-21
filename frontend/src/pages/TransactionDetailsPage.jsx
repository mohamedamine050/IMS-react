import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const TransactionDetailsPage = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const getTransaction = async () => {
      try {
        const transactionData = await ApiService.getTransactionById(transactionId);

        if (transactionData.status === 200 && transactionData.transaction) {
          setTransaction(transactionData.transaction);
          setStatus(transactionData.transaction.status);
        } else {
          showMessage("Transaction non trouvée.");
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting a transaction: " + error
        );
      }
    };

    getTransaction();
  }, [transactionId]);

  const handleUpdateStatus = async () => {
    try {
      // Envoie un objet JSON avec le status
      await ApiService.updateTransactionStatus(transactionId, { status });
      showMessage("Statut mis à jour avec succès !");
      navigate("/transaction");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Updating transaction: " + error
      );
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      {message && <p className="message">{message}</p>}
      <div className="transaction-details-page">
        {transaction ? (
          <>
            {/* Transaction info */}
            <div className="section-card">
              <h2>Transaction Information</h2>
              <p>Type: {transaction.transactionType}</p>
              <p>Status: {transaction.status}</p>
              <p>Description: {transaction.description}</p>
              <p>Note: {transaction.note}</p>
              <p>Total Products: {transaction.totalProducts}</p>
              <p>Total Price: {transaction.totalPrice?.toFixed(2)}</p>
              <p>Created At: {new Date(transaction.createdAt).toLocaleString()}</p>
              {transaction.updatedAt && (
                <p>Updated At: {new Date(transaction.updatedAt).toLocaleString()}</p>
              )}
            </div>

            {/* Products list */}
            {transaction.products && transaction.products.length > 0 && (
              <div className="section-card">
                <h2>Products</h2>
                {transaction.products.map((product) => (
                  <div key={product.id} style={{ marginBottom: 10 }}>
                    <p>Name: {product.name}</p>
                    <p>SKU: {product.sku}</p>
                    <p>Price: {product.price?.toFixed(2)}</p>
                    <p>Stock Quantity: {product.stockQuantity}</p>
                    <p>Description: {product.description}</p>
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ maxWidth: "150px" }}
                      />
                    )}
                    <hr />
                  </div>
                ))}
              </div>
            )}

            {/* User info */}
            {transaction.user && (
              <div className="section-card">
                <h2>User Information</h2>
                <p>Name: {transaction.user.name}</p>
                <p>Email: {transaction.user.email}</p>
                <p>Phone Number: {transaction.user.phoneNumber}</p>
                <p>Role: {transaction.user.role}</p>
              </div>
            )}

            {/* Supplier info */}
            {transaction.supplier && (
              <div className="section-card">
                <h2>Supplier Information</h2>
                <p>Name: {transaction.supplier.name}</p>
                <p>Contact Address: {transaction.supplier.contactInfo}</p>
                <p>Address: {transaction.supplier.address}</p>
              </div>
            )}

            {/* Update status */}
            <div className="section-card transaction-status-update">
              <label>Status: </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <button onClick={handleUpdateStatus}>Update Status</button>
            </div>
          </>
        ) : (
          <p>Loading transaction details...</p>
        )}
      </div>
    </Layout>
  );
};

export default TransactionDetailsPage;
