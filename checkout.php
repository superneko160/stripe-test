<?php
// セッションでデータを受け取ったとする
$data = [
    "amount1" => 2400,
    "amount2" => 7200,
    "amount3" => 13000,
]
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8" />
    <title>決済</title>
    <meta name="description" content="Stripeのデモアプリケーション" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="css/checkout.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script src="js/env.js" defer></script>
    <script>
        'use strict';
        const items = <?=json_encode($data)?>
    </script>
    <script src="js/checkout.js" defer></script>
</head>
<body>
    <form id="payment-form">
        メール：<input type="email" id="email" placeholder="メールアドレスを入力してください" size="32" required>
        <div id="payment-element">
            <!-- ここにStripeの決済フォームが差し込まれる -->
        </div>
        <button id="submit">
            <div class="spinner hidden" id="spinner"></div>
            <span id="button-text">支払う</span>
        </button>
        <div id="payment-message" class="hidden"></div>
    </form>
</body>
</html>
