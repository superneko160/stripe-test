# stripe-test

Stripe Payment Demo

# Versions
  
```
php -v
8.2.12
```

```
composer -v
Composer version 2.7.6
```

# SetUp

```
composer install
```

Create an account and get an API key.  
- [Stripe Dashboard | API key](https://dashboard.stripe.com/test/apikeys)

Secret key are set to ```.env```.
```
touch .env
```

```
STRIPE_SECRET_KEY=""
```

Public key are set to ```js/checkout.js```.
```
const STRIPE_PUBLIC_KEY = "";
```

# Access

```
http://localhost/stripe-test/checkout.html
```

# Test cards
To simulate successful payments, use the test cards listed in the [stripe DOCS](https://stripe.com/docs/testing?locale=ja-JP).


# Reference
- [Quick Start | stripe DOCS](https://stripe.com/docs/payments/quickstart)
