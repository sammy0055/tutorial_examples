# Step-by-Step Guide: How to Set Up Meta WhatsApp API to Manage WhatsApp Business Accounts (WABA) - Part Two

## Welcome back to PART TWO of the tutorial where I will walk you through how to onboard WhatsApp Business Accounts, set up WhatsApp webhooks to receive events and expose you to other WhatsApp endpoints for various needs and use cases.

## note: this tutorial focuses on app that will be used by other businesses, so we are using the Get Started for Tech Providers or Get Started for Solution Partners guides.

## incase you missed part one here is the link for your reference

### Prerequisites

- **Code Editor**: VS Code integrated terminal (preferred)
- **TypeScript/Node.js**: Basic to intermediate knowledge
- **React/Next.js**: Basic knowledge, will only be used to onboard Meta users (WhatsApp)

### Agenda

- **Onboard WhatsApp Business Account**: This is a sigup process to which you get access to the users whatsapp credentials with which you will use to parform actions on behalf of the user.
- **Send whatsapp messages**: send messages on behalf of the user
- **Set-up WhatsApp Webhooks**: here we will setup webhook to listen for incoming messages, and other account activities
- **Explore other whatsapp endpoints**: we will explore other enpoints available for different usecase.

## Onboard WhatsApp Business Account

1. in the previous section (PartOne) we created a configurationId for whatsapp login use the facebook business login App on the developer portal, keep the id safe, if you dont have it checkout (partOne) to learn how to create it.
2. On the developer portal copy `AppId` and `AppSecret` to a safe place.
   ![Keys](./assests/keys.png)
3. create a new nextjs project (`npx create-next-app@latest`)
4. add you configuration keys in `.env.local`

```
META_APP_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
META_APP_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXX
META_APP_WHATSAPP_AUTH_CONFIG=XXXXXXXXXXXXXXXXX
```

5. Create a folder `sever_actions` in the app directory

```
<!--sever_actions/whatsapp  -->

"use server";
import queryString from "query-string";
import { redirect } from "next/navigation";

const AppId = getEnv("META_APP_ID");
const AppSecret = getEnv("META_APP_SECRET");

const whatSappLogin = (redirectUrl = "http://localhost:3000/") => {
    const configId = getEnv("META_APP_WHATSAPP_AUTH_CONFIG");
    const urlParams = queryString.stringify({
      client_id: AppId,
      config_id: configId,
      response_type: "code",
      override_default_response_type: true,
      redirect_uri: redirectUrl,
    });

    const url = `https://www.facebook.com/v18.0/dialog/oauth?${urlParams}`;
    return redirect(url)
};

  exchangeCodeForAccessToken = async ({
    code,
    redirect_uri = "http://localhost:3000/",
  }: WhatSappLoginInput) => {
    const params = {
      client_id: AppId,
      client_secret: AppSecret,
      redirect_uri,
      code,
    };
    const encoded = new URLSearchParams(params);
    const url = `https://graph.facebook.com/v18.0/oauth/access_token?${encoded.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      const errorData: any = await res.json();
      throw new Error(`Error ${res.status}: ${errorData.error}`);
    }

    const data = await res.json();
    return data as { access_token: string; token_type: string };
  };
```

6. create login component

```
<!-- app/components/whatsapp/index.tsx -->

"use client";

import { whatSappLogin } from "../../server_actions/whatsapp";

export const WhatSappLoginButton = () => {
  const handleLogin = () => {
    whatSappLogin();
  };
  return <button onClick={handleLogin}>login to whatsapp</button>;
};

```

7. **use login Component on the page**: when you click the button, you are redirected to mata login for whatsapp signup flow, on success a code will be return to the redirect url via urlQueryParams `localhost:3000/?code="xxxxxxxxxxxxxxxxxx"` extract the code and pass it to `exchangeCodeForAccessToken` method to get `access_token`. save access_token to a secure db

```
<!-- app/page.tsx -->
  import {exchangeCodeForAccessToken} from "../server_actions/whatsapp
    const getCode = async ({code, error}) => {
      if(code){
          const data = await exchangeCodeForAccessToken(code)
          db.add(data)
      }
      if(error) throw new Error("whatsapp onboarding process failed")
    }

export default async function Page({searchParams}){
  await getCode(searchParams)
    return (
        <main>
            <WhatSappLoginButton />
        </main>)
    }
```

8. register the phone number: we need to register the phone number for it to be fully connected. `whatsappId` get whatsapp id from the onboarded user in [Meta Business Suit](https://business.facebook.com/) navigate to accounts, click whatsappAccounts. save the phoneNumber payload to your database.

![Meta Business Suit](./assests/whatsapp_accounts.png)

```
const registerPhoneNumber = async (
    data: Pick<WhatSappAccount, "accessToken" | "whatsappId">
  ) => {
    const url = `https://graph.facebook.com/v20.0/${data.whatsappId}/phone_numbers`;
    const res = await fetch(url, {
      method: "get",
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData: any = await res.json();
      throw new Error(`Error ${res.status}: ${errorData.error.message}`);
    }

    const phone_numbers = (await res.json()) as any;
    if (!phone_numbers.data)
      throw new Error("no phone number was found in your whatsapp account");
    const phone_number = phone_numbers.data[0] as {
      id: string;
      verified_name: string;
      code_verification_status: string;
      display_phone_number: string;
    };


    const MFAPIN = "005500";
    const registrationUrl = `https://graph.facebook.com/v20.0/${phone_number.id}/register`;
    const res = await fetch(registrationUrl, {
      method: "post",
      headers: {
        Authorization: `Bearer ${whatsappData.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        pin: MFAPIN,
      }),
    });
    if (!res.ok) {
      const errorData: any = await res.json();
      throw new Error(`Error ${res.status}: ${errorData.error.message}`);
    }
  };
```

9. send a whatsapp message using the registered phone number, replace `xxxxxxxxxxxxxx` with the recipiant phoneNumber.
    `whatsapp` in the code below represent the dataStorage for our onboarded whatsappUser. when we registered the phoneNumber the response payload was save there as well.


```
sendTestMessage = async (_id: string) => {
    const whatsapp = (await WhatSappAccountEntry.findById(
      _id
    )) as WhatSappAccount;
    const phoneNumberId = whatsapp.phoneNumber.id;
    if (!whatsapp.phoneNumber.isRegistered)
      throw new Error("phone number is not reqistered");

    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: "post",
      headers: {
        Authorization: `Bearer ${whatsapp.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: "xxxxxxxxxxxxxxxx",
        text: { body: "sammy the code finally worked" },
      }),
    });

    if (!res.ok) {
      const errorData: any = await res.json();
      throw new Error(`Error ${res.status}: ${errorData.error.message}`);
    }

    console.log("====================================");
    console.log(await res.json());
    console.log("====================================");
  };

```
