<?php
require_once 'vendor/autoload.php';
require_once 'Logger/Logger.php';

const PAYMENT_LOG = 'log/create_payment.log';

// アプリケーションの実行
handlePaymentRequest();

/**
 * アプリケーションのメインプロセス
 */
function handlePaymentRequest(): void {
    initializeApplication();

    $stripe = new \Stripe\StripeClient($_ENV['STRIPE_SECRET_KEY']);

    try {
        // POSTされたJSONデータ取得
        $requestDataStr = file_get_contents('php://input');
        // POSTされたJSONデータが文字列になっているのでオブジェクトに変換
        $requestData = json_decode($requestDataStr);

        // PaymentIntentの作成
        $paymentIntent = $stripe->paymentIntents->create([
            'amount' => calculateOrderAmount($requestData->items),
            'currency' => 'jpy',
            'automatic_payment_methods' => [
                'enabled' => true,
            ],
        ]);

        // レスポンス
        echo json_encode([
            'clientSecret' => $paymentIntent->client_secret,
        ]);
    } catch (Exception $e) {
        handleError($e);
    }
}

/**
 * アプリケーションの初期化
 */
function initializeApplication(): void {
    header('Content-Type: application/json');
    loadEnvironmentVariables();
}

/**
 * 環境変数の読み込み
 * @throws RuntimeException
 */
function loadEnvironmentVariables(): void {
    $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();

    if (!isset($_ENV['STRIPE_SECRET_KEY'])) {
        throw new RuntimeException(__FUNCTION__ . ':Stripeのシークレットキーが未設定です。.envファイルに設定してください');
    }
}

/**
 * 注文金額の計算
 * サーバ上で注文の合計を計算することでクライアントで直接金額を操作できないようにする
 * @param array $items 注文された商品データ
 * @return int 注文金額
 */
function calculateOrderAmount(array $items): int {
    $total = 0;
    foreach($items as $item) {
        if ($item->amount === 0 || $item->quantity === 0) {
            throw new InvalidArgumentException(__FUNCTION__ . ':商品の金額か量に0が設定されています');
        }
      $total += $item->amount * $item->quantity;
    }
    return $total;
}

/**
 * エラーハンドリング
 * 処理に失敗した場合ステータスコード500でレスポンス返す
 * @param Exception $e
 */
function handleError(Exception $e): void {
    Logger::dumpLog(PAYMENT_LOG, date('Y/m/d H:i:s') . ' '. $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
