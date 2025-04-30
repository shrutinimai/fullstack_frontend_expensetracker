document.addEventListener("DOMContentLoaded", function () {
    const buyBtn = document.getElementById("buyPremiumBtn");

    if (buyBtn) {
        buyBtn.addEventListener("click", async function () {
            let token = localStorage.getItem("token");
            const refreshToken = localStorage.getItem("refreshToken");

            if (!token) {
                alert("Please login to continue.");
                window.location.href = "login.html";  
                return;
            }

            const customerPhone = prompt("Enter your 10-digit phone number:");
            if (!customerPhone || !/^\d{10}$/.test(customerPhone)) {
                alert("Invalid phone number. Please try again.");
                return;
            }

            const userId = localStorage.getItem("externalCustomerId");

            if (!userId) {
                alert("Customer ID not found. Please log in again.");
                window.location.href = "login.html";
                return;
            }

            const makePaymentRequest = async (accessToken) => {
                return await axios.post(
                    "http://localhost:4200/order/create",
                    {
                        orderAmount: 499,
                        customerId: userId,
                        customerPhone: customerPhone,
                    },
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
            };

            try {
                const orderResponse = await makePaymentRequest(token);
                const { payment_session_id,order_id: orderId } = orderResponse.data;

                const cashfree = Cashfree({
                    mode: "sandbox" // or "production" for live environment
                });

                cashfree.checkout({
                    paymentSessionId: payment_session_id,
                    redirectTarget: "_self",  // Can be "_blank" for new window or "_modal" for inline
                    onSuccess: async function () {
                        try {
                          const response = await axios.post("http://localhost:4200/api/order/update", {
                            orderId,
                            status: "SUCCESSFUL"
                          }, {
                            headers: {
                              Authorization: token
                            }
                          });
                    
                          window.location.href = `paymentSuccess.html?orderStatus=successful&order_id=${orderId}`;
                        } catch (error) {
                          console.error("Order update failed:", error);
                        }
                      },
                      onFailure: function () {
                        window.location.href = "paymentFailure.html?orderStatus=failed";
                      }
                    });
                    
              
            } catch (error) {
                if (error.response && error.response.status === 401 && refreshToken) {
                    try {
                        const refreshResponse = await axios.post("http://localhost:4200/user/refresh", { refreshToken });
                        const { token: newToken } = refreshResponse.data;

                        localStorage.setItem("token", newToken);
                        token = newToken;

                        const retryResponse = await makePaymentRequest(newToken);
                        const { payment_session_id ,order_id: orderId } = retryResponse.data;

                        const cashfree = Cashfree({
                            mode: "sandbox" // or "production" for live environment
                        });
                        cashfree.checkout({
                            paymentSessionId: payment_session_id,
                            redirectTarget: "_self",  // Can be "_blank" for new window or "_modal" for inline
                           // onSuccess: function () {
                               // window.location.href = `paymentSuccess.html?orderStatus=successful&order_id=${retryResponse.data.orderId}`;
                           // },
                           onSuccess: async function (data) {
                            try {
                              const response = await axios.post("http://localhost:4200/api/order/update", {
                                orderId,
                                status: "SUCCESSFUL"
                              }, {
                                headers: {
                                  Authorization: token
                                }
                              });
                          
                              window.location.href = `paymentSuccess.html?orderStatus=successful&order_id=${orderId}`;
                            } catch (error) {
                              console.error("Order update failed:", error);
                            }
                          },
                          
                          
                            onFailure: function () {
                                window.location.href = "paymentFailure.html?orderStatus=failed";
                            }
                        });
;

                    } catch (refreshErr) {
                        console.error("Refresh token failed:", refreshErr);
                        alert("Session expired. Please log in again.");
                        localStorage.clear();    
                        window.location.href = "login.html"; 
                    }
                } else {
                    console.error("Payment error:", error);
                    alert("Failed to initiate payment. Please try again later.");
                }
            }
        });
    }
});
