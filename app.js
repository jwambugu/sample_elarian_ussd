require("dotenv").config();
const { Elarian } = require("elarian");

const {
  ELARIAN_ORG_ID,
  ELARIAN_APP_ID,
  ELARIAN_API_KEY,
  ELARIAN_SMS_SHORTCODE,
} = process.env;

const plans = [
  { id: 1, name: "Maxi", package: "25Mbps", price: 4000 },
  { id: 2, name: "Midi", package: "10Mbps", price: 3000 },
  { id: 3, name: "Mini", package: "5Mbps", price: 2000 },
];

// getPlan returns the plan with the current id
const getPlan = (id) => {
  return plans.find((plan) => plan.id === id);
};

const plansMenuText = () => {
  let text = `Please select a plan`;
  text += plans.map(
    (plan) => `\n${plan.id}. ${plan.name} ${plan.package} @ KES ${plan.price}`
  );

  return text;
};

const SCREEN_HOME = "SCREEN_HOME";
const SCREEN_CREATE_ACCOUNT = "SCREEN_CREATE_ACCOUNT";
const SCREEN_CONTACT_US = "SCREEN_CONTACT_US";
const SCREEN_MY_ACCOUNT = "SCREEN_MY_ACCOUNT";
const SCREEN_VIEW_PLANS = "SCREEN_VIEW_PLANS";
const SCREEN_PREVIEW_PLAN = "SCREEN_PREVIEW_PLAN";
const SCREEN_CONFIRM_PLAN = "SCREEN_CONFIRM_PLAN";
const SCREEN_UNSUBSCRIBE = "SCREEN_UNSUBSCRIBE";
const SCREEN_CONFIRM_UNSUBSCRIPTION = "SCREEN_CONFIRM_UNSUBSCRIPTION";

const REMINDER_PAYMENT_REMINDER = "REMINDER_PAYMENT_REMINDER";

// sendSMSToCustomer
const sendSMSToCustomer = async (customer, message) => {
  const response = await customer.sendMessage(
    {
      number: ELARIAN_SMS_SHORTCODE,
      channel: "sms",
    },
    {
      body: {
        text: message,
      },
    }
  );

  console.log(response);
  return response;
};

const ussdSessionEventHandler = async (
  notification,
  customer,
  appData,
  callback
) => {
  const menu = {
    text: null,
    isTerminal: false,
  };

  let screen = SCREEN_HOME;

  const { input } = notification;
  const { text } = input;

  if (appData) {
    screen = appData.screen;
  }

  const customerData = await customer.getMetadata();
  let { name, plan } = customerData;

  if (screen === SCREEN_HOME && text !== "") {
    switch (text) {
      case "1": {
        screen = name ? SCREEN_MY_ACCOUNT : SCREEN_CREATE_ACCOUNT;
        break;
      }
      case "2": {
        screen = SCREEN_VIEW_PLANS;
        break;
      }
      case "3": {
        screen = name ? SCREEN_UNSUBSCRIBE : SCREEN_CONTACT_US;
        break;
      }
      case "4": {
        screen = SCREEN_CONTACT_US;
      }
    }
  }

  switch (screen) {
    case SCREEN_CREATE_ACCOUNT: {
      menu.text = `What's your name?`;
      menu.isTerminal = false;

      callback(menu, {
        screen: SCREEN_VIEW_PLANS,
      });
      break;
    }
    case SCREEN_VIEW_PLANS: {
      if (!name && text !== "") {
        name = text;

        await sendSMSToCustomer(
          customer,
          `Welcome to connectify. Your account has been created.`
        );
      }

      menu.text = plansMenuText();
      menu.isTerminal = false;

      callback(menu, {
        screen: SCREEN_PREVIEW_PLAN,
      });
      break;
    }
    case SCREEN_PREVIEW_PLAN: {
      if (text !== "") {
        plan = getPlan(parseInt(text));
      }

      menu.text = `You have selected ${plan.name}.\n Press 1 to confirm subscription.`;
      menu.isTerminal = false;

      callback(menu, {
        screen: SCREEN_CONFIRM_PLAN,
      });
      break;
    }
    case SCREEN_CONFIRM_PLAN: {
      menu.text = `You have subscribed to ${plan.name}.`;
      menu.isTerminal = true;

      await sendSMSToCustomer(
        customer,
        `You have successfully subscribed to ${plan.name}.`
      );

      await customer.addReminder({
        key: REMINDER_PAYMENT_REMINDER,
        remindAt: (Date.now() + 60000) / 1000,
        payload: "",
        interval: 60,
      });

      callback(menu, {
        screen: SCREEN_HOME,
      });
      break;
    }
    case SCREEN_CONTACT_US: {
      menu.text = `Please contact us on 07xxxxxxxx. We will be happy to help.`;
      menu.isTerminal = true;

      callback(menu, {
        screen: SCREEN_HOME,
      });
      break;
    }
    case SCREEN_UNSUBSCRIBE: {
      if (!plan) {
        menu.text = `You currently don't have an active plan.`;
        menu.isTerminal = true;

        callback(menu, {
          screen: SCREEN_HOME,
        });

        break;
      }

      menu.text = `You will be unsubscribed from ${plan.name}.\n Press 1 to confirm.`;
      menu.isTerminal = false;

      callback(menu, {
        screen: SCREEN_CONFIRM_UNSUBSCRIPTION,
      });
      break;
    }
    case SCREEN_CONFIRM_UNSUBSCRIPTION: {
      if (text !== "" && text === "1") {
        switch (text) {
          case "1": {
            let message = `You have successfully unsubscribed from ${plan.name}.`;
            menu.text = message;
            menu.isTerminal = true;

            await sendSMSToCustomer(customer, message);

            plan = null;
            screen = SCREEN_HOME;
            break;
          }
          default: {
            menu.text = `Invalid option provided.\n Press 1 to confirm unsubscription from ${plan.name}.`;
            menu.isTerminal = false;
            screen = SCREEN_CONFIRM_UNSUBSCRIPTION;
          }
        }
      }

      callback(menu, {
        screen,
      });
      break;
    }
    case SCREEN_MY_ACCOUNT: {
      menu.text = !plan
        ? `You don't have an active subscription.\n1. View plans`
        : `Your current plan is ${plan.name}.\n Thank you for choosing us.`;

      menu.isTerminal = plan;

      screen = !plan ? SCREEN_VIEW_PLANS : SCREEN_HOME;

      callback(menu, { screen });
      break;
    }
    default: {
      const guestMenu = `Welcome to connectify.\n1. Create account\n2. View plans\n3. Contact us`;

      menu.text = !name
        ? guestMenu
        : `Welcome back ${name}.\n1. My account\n2. Upgrade plan\n3. Unsubscribe \n4. Contact us`;
      menu.isTerminal = false;

      callback(menu, {
        screen,
      });
    }
  }

  await customer.updateMetadata({ name, plan });

  console.log(customerData);
};

const receivedPaymentEventHandler = async (payment, customer) => {
  const { value } = payment;
  const { currencyCode, amount } = value;

  await sendSMSToCustomer(
    customer,
    `Payment of ${currencyCode} ${amount} has been successfully received.`
  );

  await customer.cancelReminder(REMINDER_PAYMENT_REMINDER);
};

const reminderEventHandler = async (reminder, customer) => {
  console.log(reminder);

  const { name, plan } = await customer.getMetadata();

  await sendSMSToCustomer(
    customer,
    `Hello ${name}, please remember to make your payment of KES ${plan.price}`
  );
};

const connectToElarian = () => {
  const client = new Elarian({
    orgId: ELARIAN_ORG_ID,
    appId: ELARIAN_APP_ID,
    apiKey: ELARIAN_API_KEY,
  });

  client
    .on("error", (error) => {
      console.log(
        `elarian: connection error - ${error}. Attempting to reconnect..`
      );
    })
    .on("connected", async () => {
      console.log(`elarian: connected successfully`);

      // const customer = new client.Customer({
      //   number: "+254708666389",
      //   provider: "cellular",
      // });
      //
      // const state = await customer.getState();
      // console.log(state);
    })
    .on("ussdSession", ussdSessionEventHandler)
    .on("receivedPayment", receivedPaymentEventHandler)
    .on("reminder", reminderEventHandler)
    .connect();
};

connectToElarian();
