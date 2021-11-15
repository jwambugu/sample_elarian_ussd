require("dotenv").config();
const {Elarian} = require("elarian");

const {ELARIAN_ORG_ID, ELARIAN_APP_ID, ELARIAN_API_KEY} = process.env;

const plans = [
  {id: 1, name: "Maxi", package: "25Mbps", price: 4000},
  {id: 2, name: "Midi", package: "10Mbps", price: 3000},
  {id: 3, name: "Mini", package: "5Mbps", price: 2000},
];

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

console.log(plansMenuText());

const SCREEN_HOME = "SCREEN_HOME";
const SCREEN_CREATE_ACCOUNT = "SCREEN_CREATE_ACCOUNT";
const SCREEN_CONTACT_US = "SCREEN_CONTACT_US";
const SCREEN_MY_ACCOUNT = "SCREEN_MY_ACCOUNT";
const SCREEN_VIEW_PLANS = "SCREEN_VIEW_PLANS";
const SCREEN_PREVIEW_PLAN = "SCREEN_PREVIEW_PLAN";
const SCREEN_CONFIRM_PLAN = "SCREEN_CONFIRM_PLAN";
const SCREEN_UNSUBSCRIBE = "SCREEN_UNSUBSCRIBE";

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
  
  const {input} = notification;
  const {text} = input;
  
  if (appData) {
    screen = appData.screen;
  }
  
  // screen = SCREEN_HOME;
  
  const customerData = await customer.getMetadata();
  
  console.log(screen);
  
  if (screen === SCREEN_HOME && text !== "") {
    switch (text) {
      case "1": {
        screen = SCREEN_CREATE_ACCOUNT;
        break;
      }
      case "2": {
        screen = SCREEN_VIEW_PLANS;
        break;
      }
      case "3": {
        screen = SCREEN_CONTACT_US;
        break;
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
      menu.text = plansMenuText();
      menu.isTerminal = false;
      
      callback(menu, {
        screen: SCREEN_PREVIEW_PLAN,
      });
      break;
    }
    case SCREEN_PREVIEW_PLAN: {
      menu.text = `You have selected plan. Press 1 to confirm subscription.`;
      menu.isTerminal = false;
      
      callback(menu, {
        screen: SCREEN_CONFIRM_PLAN,
      });
      break;
    }
    case SCREEN_CONFIRM_PLAN: {
      menu.text = `You have subscribed to plan.`;
      menu.isTerminal = true;
      
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
    default: {
      menu.text = `Welcome to connectify.\n1. Create account\n2. View plans\n3. Contact us`;
      menu.isTerminal = false;
      
      callback(menu, {
        screen,
      });
    }
  }
  //
  // await customer.updateMetadata({ plan: "" });
  //
  // let { name, plan } = customerData;
};

//         "Please select a plan \n1. Maxi - 25Mbps- KES 4000\n2. Midi - 10Mbps- KES 3000\n3. Mini - 5Mbps- KES 2000";

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
      .on("connected", () => console.log(`elarian: connected successfully`))
      .on("ussdSession", ussdSessionEventHandler)
      .connect();
};

connectToElarian();

//  if (screen === SCREEN_HOME && text !== "") {
//     switch (text) {
//       case "1":
//         screen = name ? SCREEN_MY_ACCOUNT : SCREEN_CREATE_ACCOUNT;
//         break;
//       case "2":
//         screen = SCREEN_VIEW_PLANS;
//         break;
//       case "3":
//         screen = SCREEN_CONTACT_US;
//         break;
//     }
//   }
//
//   console.log(screen === SCREEN_MY_ACCOUNT, screen);
//   if (screen === SCREEN_MY_ACCOUNT && text !== "") {
//     switch (text) {
//       case "1":
//         screen = SCREEN_VIEW_PLANS;
//         break;
//       case "2":
//         screen = SCREEN_UNSUBSCRIBE;
//         break;
//     }
//
//     if (screen === SCREEN_VIEW_PLANS && text !== "") {
//       switch (text) {
//         case "1":
//           screen = SCREEN_VIEW_PLANS;
//           break;
//         case "2":
//           screen = SCREEN_UNSUBSCRIBE;
//           break;
//       }
//     }
//   }
//
//   switch (screen) {
//     case SCREEN_CREATE_ACCOUNT:
//       menu.text = "Please enter your name";
//       menu.isTerminal = false;
//
//       callback(menu, {
//         screen: SCREEN_VIEW_PLANS,
//       });
//       break;
//     case SCREEN_VIEW_PLANS:
//       menu.text =
//         "Please select a plan \n1. Maxi - 25Mbps- KES 4000\n2. Midi - 10Mbps- KES 3000\n3. Mini - 5Mbps- KES 2000";
//       menu.isTerminal = false;
//
//       if (!name) {
//         name = text;
//       }
//
//       callback(menu, { screen: SCREEN_CONFIRM_PLAN });
//       break;
//     case SCREEN_CONFIRM_PLAN:
//       plan = getPlan(parseInt(text));
//
//       menu.text = `You have selected ${plan}. Press 1 to confirm subscription.`;
//       menu.isTerminal = false;
//
//       callback(menu, {
//         screen: SCREEN_MY_ACCOUNT,
//       });
//       break;
//     case SCREEN_CONTACT_US:
//       menu.text = `Please contact us on 07xxxxxxxx. We will be happy to help.`;
//       menu.isTerminal = true;
//       callback(menu, {
//         screen: SCREEN_HOME,
//       });
//       break;
//     case SCREEN_MY_ACCOUNT:
//       menu.text = plan
//         ? `Your current plan is ${plan.name}\n1. Upgrade plan\n2. Unsubscribe`
//         : `You don't have an active plan.\n1. View Plans`;
//
//       menu.isTerminal = false;
//       callback(menu, appData);
//       break;
//     case SCREEN_UNSUBSCRIBE:
//       menu.text = `You have successfully unsubscribed from ${plan.name}`;
//       menu.isTerminal = true;
//       plan = null;
//       break;
//     default:
//       menu.text = name
//         ? `Welcome back ${name}.\n1. My account\n2. View plans\n3. Contact support`
//         : `Welcome to connectify.\n1. Create account\n2. View plans\n3. Contact support`;
//       menu.isTerminal = false;
//       callback(menu, { screen });
//       break;
//   }
//
//   console.log(screen, text, { name, plan });
//
//   await customer.updateMetadata({ name, plan });
