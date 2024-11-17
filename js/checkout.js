"use strict";

const stripe = Stripe(STRIPE_PUBLIC_KEY);

// 顧客が購入する商品（ダミーデータ）
const items = [
    {
        id: "A001",
        name: "シャツ Lサイズ" ,
        amount: 500,
        quantity: 2
    },
    {
        id: "F732",
        name: "電子キーボード" ,
        amount: 16000,
        quantity: 1
    }
];

let elements;

initialize();
checkStatus();

document.querySelector("#payment-form").addEventListener("submit", handleSubmit);

/**
 * サーバサイド(create.php)にリクエストを行い新しいPaymentIntentを作成
 * （決済ページが読み込まれたタイミングで作成）
 */
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

/**
 * 支払うボタン押下時
 */
async function handleSubmit(e) {
    e.preventDefault();

    // スピナー表示
    setLoading(true);

    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            // 決済完了後にユーザがリダイレクトするページ（もとのページ）
            return_url: "http://localhost/stripe-test/checkout.html",
            receipt_email: document.getElementById("email").value,
        },
    });

    // 即時エラー（顧客のカードが拒否された場合など）
    if (error.type === "card_error" || error.type === "validation_error") {
        showMessage(error.message);
    } else {
        showMessage("予期せぬエラーが発生しました");
    }

    // スピナー非表示
    setLoading(false);
}

/**
 * 支払後に支払状態のステータスを取得
 */
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

/**
 * メッセージを表示
 * @param {string} messageText 表示メッセ―ジ
 */
function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");

    // メッセージの表示
    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    // メッセージのクリア
    // あまりに早くクリアするとメッセージが読み取れないので5秒経過してからクリア
    setTimeout(function () {
        messageContainer.classList.add("hidden");
        messageContainer.textContent = "";
    }, 5000);
}

/**
 * スピナーの表示を制御
 * @param {bool} isLoading ローディング中の場合true、それ以外の場合false
 */
function setLoading(isLoading) {
    if (isLoading) {
        // ボタンを無効化し、スピナーを表示
        document.querySelector("#submit").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        // ボタンを有効化し、スピナーを非表示
        document.querySelector("#submit").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
}
