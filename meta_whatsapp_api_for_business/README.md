# Step-by-Step Guide: How to Set Up Meta WhatsApp API to Manage WhatsApp Business Accounts (WABA) - Part One

## Welcome to a short tutorial where I will walk you through how to set up Meta Business Login to onboard WhatsApp Business Accounts. I will also set up WhatsApp webhooks to receive events and expose you to other WhatsApp endpoints for various needs and use cases.

### Prerequisites
- **Code Editor**: VS Code integrated terminal (preferred)
- **TypeScript/Node.js**: Basic to intermediate knowledge
- **React/Next.js**: Basic knowledge, will only be used to onboard Meta users (WhatsApp)

### Agenda
- **Create Meta Developer Account**: This is your normal Facebook account
- **Create Meta Business Portfolio**: Meta business account for managing your business on Meta, integrated with all of Meta's products like WhatsApp, Facebook Pages, Instagram, etc.
- **Create a Business App**: We will create an app in your developer portal.
- **Set Up Facebook Business Login for WhatsApp**<br>
  *Note: Don't be confused by the name Facebook Business Login, as this Meta product on the developer portal can be used to onboard users from Meta platforms such as WhatsApp, Instagram, etc.*

## Create a Meta Business Portfolio
1. Register or log in to your normal Facebook account.
2. Open a new tab on your browser and go to [Meta Business Manager](https://business.facebook.com/).
3. You should now be on the Business Manager home page. Create a new business portfolio.
   - If you have at least one business portfolio already, click the dropdown icon on the business name in the sidebar, then click on "Create a Business Portfolio" to create a new business portfolio.
   - If your account is new, you will see a button to create a business portfolio. Find it and create a new business portfolio.

## Create a Meta Developer Account
Ensure you are logged in to your normal Facebook account and navigate to [Meta for Developers](https://developers.facebook.com/) to create a Meta developer account. Your normal Facebook account will be automatically used as your Meta developer account.

## Create a Business App on the Developer Portal
1. Navigate to the [Meta Developer Portal](https://developers.facebook.com/).
2. Click on "My Apps".
3. Click on "Create App" to create a new business app.
4. On the "What do you want your app to do?" page, choose "Others" and click "Next".
5. On the "Select an app type" page, choose "Business" and click "Next".
6. Enter the name of the app (any name of your choosing) and contact email. Optionally, you can choose the business portfolio you created earlier and click "Save". Your screen should look like the one below; if not, click on the app you just created.

![Meta Developer Portal Screen](./assets/meta-developer-portal-screen.png)

7. Click on "App Settings/Basic".
8. Copy the app ID and app Secret to your `.env`. For the app domain, use localhost because the app is in development mode.
9. Scroll down to verify the business, choose your business portfolio (if not already chosen), and click "Start Verification".

![Keys](./assets/keys.png)

## Set Up WhatsApp Product on the Developer Portal
1. On the sidebar, click "Add Product", scroll down and locate WhatsApp, then click "Set Up".
2. Complete the "Become a Tech Provider" onboarding process (get it to integration at most).

![WhatsApp Product](./assets/whatsapp-product.png)

## Set Up Facebook Business Login for WhatsApp
1. On the sidebar, click "Add Product", scroll down and locate Facebook Login for Business, then click "Set Up".

![Login Product](./assets/login-product.png)

2. On the sidebar under Facebook Login for Business, click "Configurations".
3. Click on "Create Configuration".
4. Give the configuration a name.
5. Choose "WhatsApp Embedded Signup".
6. Choose access token: System-user access token.
7. Choose permissions: `whatsapp_business_management` and `whatsapp_business_messaging`.
8. Click "Save" and copy the configuration code.

# In the Next Article
- We will onboard WhatsApp Business Accounts with Next.js.
- We will set up webhooks to receive WhatsApp events.
- We will explore other WhatsApp Cloud API endpoints.

Stay tuned for the next article! For questions, you can direct them to this [GitHub repo](https://github.com/sammy0055/tutorial_examples/tree/main/meta_whatsapp_api_for_business): Step-by-Step Guide: How to Set Up Meta WhatsApp API to Manage WhatsApp Business Accounts (WABA) mostly for automation.
