# Building USSD app with Elarian

In this article, we will build a simple USSD application using [Elarian](https://elarian.com) that allows customers to
subscribe to an ISP. We will also set payment reminders through sms reminding the customer to make the payment.

The final application will look as follows

<img src="https://github.com/jwambugu/elarian_ussd_tutorial/blob/main/_assets/ussd.gif" alt="USSD APP" height="200"/>

## What is Elarian?

According to the [documentation](https://developers.elarian.com/introduction-to-elarian/what-is-elarian),
> Elarian is a Customer Engagement Framework that allows you to build reactive, scalable applications fast. At its core, Elarian is a customer data and automation platform. It helps you organize and work with your customer data, even as you perform actions such as sending messages or handling payments.

In simple terms, Elarian provides an interface
for [customer data management](https://developers.elarian.com/introduction-to-elarian/customer-data-management) through
the following interactions:

- you can issue engagement [commands](https://developers.elarian.com/reference/commands) such as sending messages, add
  or remove reminders to a customer
- query a customer state which provides messages sent, customer sessions and transactions data
- react to customers' data changes through [events](https://developers.elarian.com/reference/events)

### Customer actions

- Can create an account and select a subscription plan if they are new
- Can upgrade or downgrade their current plan
- Can pay for the subscription
- Can get reminders to pay for their subscription
- Can request site visit

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
