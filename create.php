<?php
require_once 'vendor/autoload.php';

// 設定ファイル（.env）の読み込み
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$stripe = new \Stripe\StripeClient($_ENV["STRIPE_SECRET_KEY"]);

header('Content-Type: application/json');

try {
    // POSTされたJSONデータ取得
    $jsonStr = file_get_contents('php://input');
    $jsonObj = json_decode($jsonStr);

    // PaymentIntentの作成
    $paymentIntent = $stripe->paymentIntents->create([
        'amount' => calculateOrderAmount($jsonObj->items),
        'currency' => 'jpy',
        'automatic_payment_methods' => [
            'enabled' => true,
        ],
    ]);

    $output = [
        'clientSecret' => $paymentIntent->client_secret,
    ];

    echo json_encode($output);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * 注文金額の計算
 * サーバ上で注文の合計を計算することで クライアントで直接金額を操作できないようにする
 * @param array $items 注文された商品データ
 * @return int 注文金額
 */
function calculateOrderAmount(array $items): int {
    // この定数を注文金額の計算で置き換える
    return 1500;
}
