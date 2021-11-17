# Elarian USSD

This is a simple USSD application using [Elarian](https://elarian.com) that allows customers to subscribe to an ISP. It
also sets payment reminders through sms that will be sent if the customer has not made the payment.

This is the final product.

<img src="https://github.com/jwambugu/elarian_ussd_tutorial/blob/main/_assets/ussd.gif" alt="USSD APP" height="400"/>

### Customer actions

- Can create an account and select a subscription plan if they are new
- Can upgrade or downgrade their current plan
- Can pay for the subscription
- Can get reminders to pay for their subscription

### Screens

- New customer
    - Create account
    - View plans
    - Contact us
- Existing customer
    - My account
    - Upgrade plan
    - Unsubscribe
    - Contact us

### Application activity

- New customer receives SMS after creating an account
- Customer receives SMS after upgrading or subscribing to a plan.
- Customer receives SMS after unsubscribing from a plan.
- A reminder is set when a customer subscribes. Current reminder is set to `one minute` after subscription with an
  interval of `60 seconds`
- The payment reminder is set if a customer makes a payment.

### Screenshots

### TODO

- [ ] Keep track of customer payment balance after payment and only cancel the reminder if actual balance is paid
- [ ]

