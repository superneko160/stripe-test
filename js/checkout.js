"use strict";

const STRIPE_PUBLIC_KEY = "";
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// The items the customer wants to buy
const items = [{ id: "xl-tshirt" }];

let elements;

initialize();
checkStatus();

document.querySelector("#payment-form").addEventListener("submit", handleSubmit);

// サーバサイドにリクエストを行い新しいPaymentIntentを作成（決済ページが読み込まれたタイミングで作成）
async function initialize() {
    const { clientSecret } = await fetch("create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
    }).then((r) => r.json());

    elements = stripe.elements({ clientSecret });

    const paymentElementOptions = {
        layout: "tabs",
    };

    // PaymentElementを作成
    const paymentElement = elements.create("payment", paymentElementOptions);
    // PaymentElementを決済フォームのプレースホルダ（<div>）にマウント
    paymentElement.mount("#payment-element");
}

async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            // 決済完了後にユーザがリダイレクトするページ
            return_url: "http://localhost/stripe-test/checkout.html",
            receipt_email: document.getElementById("email").value,
        },
    });

    // 即時エラー（顧客のカードが拒否された場合など）
    if (error.type === "card_error" || error.type === "validation_error") {
        showMessage(error.message);
    } else {
        showMessage("An unexpected error occurred.");
    }

    setLoading(false);
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
    const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
    );

    if (!clientSecret) { return; }

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

    switch (paymentIntent.status) {
        case "succeeded":
            showMessage("決済が完了しました");
            break;
        case "processing":
            showMessage("支払い手続き中です");
            break;
        case "requires_payment_method":
            showMessage("決済に失敗しました。再度お試しください");
            break;
        default:
            showMessage("決済に失敗しました");
            break;
    }
}

// ------- UI helpers -------

function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");

    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    setTimeout(function () {
        messageContainer.classList.add("hidden");
        messageContainer.textContent = "";
    }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
    if (isLoading) {
        // Disable the button and show a spinner
        document.querySelector("#submit").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("#submit").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
}