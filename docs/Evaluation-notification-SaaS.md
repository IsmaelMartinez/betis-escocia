Evaluation of Third‑Party Notification Service Options

Before building a custom admin push notification system, it’s important to compare third‑party services that could provide similar functionality with less maintenance. Below is an evaluation of several notification service options, focusing on free usage (around 10,000+ notifications monthly) and key criteria like cost, integration effort, mobile support, reliability, maintenance, and privacy.
Novu (Open‑Source Notifications Platform)

Cost: Novu offers a free tier of 10,000 notifications/events per month on its hosted cloud service
novu.co
. Being open-source, it can also be self-hosted for free (aside from infrastructure costs).

Integration Effort: Novu provides a unified API and SDKs to send notifications across channels (push, email, SMS, etc.) and even an in-app notification inbox component. Integration may require adding the Novu SDK and configuring providers (e.g., FCM for push). There is a learning curve, especially since much of Novu is configured via their CLI or API, and developers need to set up templates and workflows. However, documentation and UI tools are available to simplify integration.

Mobile Support: Supports mobile push notifications (works with APNs for iOS and FCM for Android/Web under the hood) as one of its channels
novu.co
novu.co
. This means admins can receive push notifications on mobile devices. Novu is designed for omnichannel notifications, so it can handle web push for PWA or native app notifications via appropriate providers.

Reliability: Novu’s cloud is built for scale and is used in production by many (with claims of handling millions of notifications)
novu.co
. If self-hosting, reliability depends on your infrastructure. The platform itself is designed to be robust, including features like retries and workflows. As a relatively new open-source project, it’s actively maintained and has growing community adoption.

Maintenance: Using Novu cloud means minimal maintenance (they handle uptime, scaling, etc.). Self-hosting Novu would introduce maintenance overhead (managing a database, servers for the service). The benefit is a simplified notification logic – you offload the complexity of multi-channel notifications to Novu. However, since it’s an additional service, developers must maintain the integration and monitor any breaking changes or upgrades in the Novu platform.

Privacy: Novu’s cloud service is GDPR-compliant and security certified
novu.co
. If using the cloud, you’ll be sending notification data (like user names and message content) to Novu’s servers – typically acceptable for non-sensitive content, but worth considering if the data is sensitive. Self-hosting gives full control over data. Novu supports encryption for credentials and has features to help comply with privacy requirements.
PagerDuty

Cost: PagerDuty is primarily an incident/alert management system. It has a free plan for up to 5 users, which includes unlimited push and email notifications via the PagerDuty mobile app
pagerduty.com
pagerduty.com
. (SMS/phone call alerts are limited to 100/month on free)
pagerduty.com
. For more than 5 users or advanced features, it gets expensive ($21+ per user per month on paid plans). However, if only a small admin team needs notifications, the free tier may suffice.

Integration Effort: Integrating PagerDuty would involve triggering incidents or alerts via their API when a new RSVP or contact submission comes in. This is a bit heavy-weight for simple form submissions – you’d essentially treat each form submission as an “incident”. PagerDuty has many integrations and an API, so technically it’s straightforward to send events to it. But you’d need to configure a service and rules in PagerDuty to route those events to the admins. It’s more complex than a typical push service integration, since PagerDuty is built for on-call rotations, escalation policies, etc.

Mobile Support: PagerDuty’s mobile app will send push notifications to on-call users when an incident (in this case, a form submission event) is triggered. This achieves the goal of notifying admins on mobile even if they aren’t in the web dashboard. Admins would need the PagerDuty app installed and logged in. The notifications are very reliable and near real-time (PagerDuty’s focus is critical alerts).

Reliability: PagerDuty is known for high reliability and speed (it’s used for critical on-call alerts). Push notifications and emails are delivered via their robust infrastructure (they send millions weekly)
pagerduty.com
. You’re unlikely to miss an alert due to service downtime. However, using PagerDuty for this means you rely on an external service’s uptime (which is generally excellent) and your integration correctness.

Maintenance: Using PagerDuty is low-maintenance from a technical perspective (they operate the service). You will have to maintain the mapping of events to PagerDuty incidents and keep your team and routing rules updated. There may be some overhead in managing the on-call schedule or who gets notified if using escalation features, but for a single admin or small team, this is minimal. Overall, less code to maintain in your app, but more configuration in PagerDuty’s dashboard.

Privacy: With PagerDuty, details of each RSVP/contact (at least whatever info you put in the incident or notification message) will be stored in PagerDuty’s system (which is SOC2 compliant and used by enterprises). If the content isn’t highly sensitive, this should be fine. Note that PagerDuty is geared towards operational alerts, so using it for customer data (names, contact messages) is an atypical use – ensure that aligns with any privacy policies. The free plan being limited to 5 users might also indicate it’s for internal use only, which fits the admin scenario.
Twilio Notify (Multi-Channel API)

Cost: Twilio’s notification offerings are pay-as-you-go. There is no sustained free tier beyond a small trial credit. Twilio Notify (the dedicated multi-channel notification API) is actually deprecated and will reach end-of-life by Dec 31, 2025
courier.com
. In the past, Twilio charged per notification or per binding (e.g., per device for push, per message for SMS). For example, Twilio’s SMS starts around $0.008 per message and push notifications would incur costs via Twilio’s usage-based model. Without a free plan, using Twilio would likely incur costs for any significant volume (though pure mobile/app pushes might be cheaper than SMS).

Integration Effort: If not using Notify (due to deprecation), you would need to integrate Twilio’s other APIs separately. For SMS or WhatsApp alerts, Twilio works well (but those are out of scope here). For push notifications, Twilio Notify was the service to abstract APNs/FCM – since it’s ending, an alternative is needed (Twilio suggests using a service like Courier or building directly with FCM/APNs). Overall, integrating Twilio for push now would be complex or not recommended. It would require either Twilio’s lower-level APIs or third-party tools. Given the deprecation, integration effort is high and not future-proof.

Mobile Support: Twilio Notify was able to send push to mobile apps (via APNs/FCM). If you had a custom mobile app for admins, Twilio could deliver to it. But for a web admin dashboard, Twilio isn’t directly helpful for web push. Twilio’s strength is SMS/voice; for push notifications you’d still rely on device-specific infrastructure. In short, Twilio can send to native mobile if you have an app (not the case here, since admin uses a web app). It’s not suitable for PWA web push notifications.

Reliability: Twilio is highly reliable for telecom (SMS/voice). For push, they would rely on FCM/APNs which are themselves reliable. However, given the Notify service is ending, reliability of that path is moot. Twilio’s other channels are reliable but again, not directly applicable to web push. Using Twilio just to possibly send SMS to an admin’s phone or an email could be reliable, but that deviates from the push notification goal.

Maintenance: Considering Twilio Notify’s deprecation, choosing Twilio would mean you need to maintain a solution that might involve multiple APIs or a soon-to-be-retired service. That increases maintenance burden significantly. You’d also need to monitor usage costs. Overall, Twilio is not a maintainable solution for push in 2025 (unless the plan was to pivot to SMS or use another Twilio product).

Privacy: Twilio is a third-party platform so any data in the notifications (names, etc.) would be processed by Twilio. Twilio has strong data protection policies, but you should review if sending personal data (like an RSVP name) via their service is okay under your compliance needs. Since Twilio isn’t the best functional fit here, privacy might be a secondary concern.

Note: Given Twilio’s situation, some teams in need of multichannel notifications are migrating to alternatives like Courier or OneSignal. Courier, for instance, is a service Twilio itself chose for notifications and offers 10k free notifications/month
courier.com
, but it wasn’t originally on our list. It could be worth considering if multichannel flexibility is desired.
Firebase Cloud Messaging (FCM)

Cost: Completely free for unlimited usage. Google’s Firebase Cloud Messaging does not charge for sending push notifications. There are no monthly limits on the number of messages (it can handle very high volumes)
knock.app
. This makes FCM very attractive from a cost standpoint – you won’t pay for 10k or even 1M notifications. (FCM is part of Firebase’s free Spark plan by default.)

Integration Effort: Moderate developer effort. To use FCM for web push, you’d add Firebase to your project and include the FCM SDK in the admin frontend to register for notifications. On the server side, you’d use Firebase Admin SDK or call FCM’s HTTP API to send messages. This involves managing server keys and a service worker in your web app to handle incoming messages (Firebase can help generate this). If you’re not already using Firebase, this adds an extra dependency. However, FCM is a well-documented, straightforward solution for push. It abstracts the differences between browsers and devices (it can also send to iOS/Android apps if needed). The integration is a bit more manual than using a service like OneSignal (where much is managed for you).

Mobile Support: Yes, FCM can deliver to mobile devices. For Android native apps it’s the standard. For iOS, you’d normally use APNs directly, but FCM can act as an intermediary for APNs as well. Importantly, FCM also supports web push notifications (Chrome, Firefox, etc.) by providing a VAPID public key and using the browser’s push service behind the scenes. So if the admin uses the web dashboard (PWA) on their phone, FCM can send notifications to their mobile browser. If there were a dedicated mobile app in the future, FCM would handle that too. It’s truly cross-platform for push
knock.app
knock.app
.

Reliability: FCM is Google’s production service used by countless apps (it’s the backbone of Android notifications). It’s extremely reliable and fast. Web push messages sent via FCM to Chrome/Android typically arrive near instantly. Google provides high scalability – you won’t have to worry about delivery failures unless the user’s device is offline (in which case FCM queues messages). There are some limitations (e.g. payload size max ~4KB, and storing offline messages up to a limit), but for simple text notifications it’s perfect.

Maintenance: Using FCM requires you to maintain the Firebase integration. This includes keeping the Firebase SDK up to date in your frontend, and protecting your FCM server keys. You also must build the UI/UX for admins to opt-in to notifications (permission prompt) and handle token management (e.g., if an admin’s device gets a new FCM token, update it). The effort to maintain is not too high – FCM doesn’t change often, and the code to send messages is small. There is no third-party UI or service to manage beyond your own code. One consideration: FCM ties you into Google’s ecosystem; if in the future you wanted to move away, you’d have to rework the push integration. But many projects accept this given FCM’s advantages.

Privacy: With FCM, the content of your notifications and device tokens go through Google’s servers. Typically this is fine (push content is usually not extremely sensitive – e.g., “New RSVP from John Doe” is low risk). Google does not store the messages long-term; they are delivered or dropped. If your app has strict privacy/GDPR concerns about user data leaving your environment, this could be a concern, but generally FCM is considered safe and is used even in healthcare and financial apps (with careful wording of notifications). You should also note that using FCM on web means your users will get a prompt that this site wants to show notifications – standard for web push.
OneSignal

Cost: OneSignal has a generous free plan. At $0/month you get unlimited push notifications (mobile and web) and up to 10,000 email sends per month
onesignal.com
. The free plan allows push to an unlimited number of subscribers/devices, but note there’s a cap of 10,000 web push subscribers for a single notification send on free tier
onesignal.com
(and a total device limit of 10k for certain features) – more than enough for an admin use-case (likely only a few admins). In short, OneSignal’s free tier easily covers 10k+ notifications monthly for a small user base.

Integration Effort: Very developer-friendly. OneSignal provides SDKs and a dashboard. For web, integration can be as simple as including a OneSignal script or using their NPM package in the app, and calling a few initialization methods. They handle the service worker file for web push, permission prompts, and subscription management if you use their default setup. On the backend, you can trigger notifications via OneSignal’s REST API or dashboard. Setting up requires creating a OneSignal account and configuring keys (including VAPID or Firebase sender ID under the hood). But overall, it’s one of the easiest ways to add push notifications. You also get features like A/B testing, scheduling, segmentation in their UI – though for admin notifications (all or nothing) those might not be needed.

Mobile Support: OneSignal supports iOS, Android, and web push out of the box
ably.com
ably.com
. If you only have a web app (PWA) for admins, OneSignal will handle push to that. If later a native admin app is created, OneSignal can send to it as well by integrating their mobile SDK. Admins can receive notifications on their phones via the mobile browser or app with reliable delivery. OneSignal also provides a notification inbox UI for in-app notifications if needed, but in this use-case the focus is the push alerts when the app is closed.

Reliability: OneSignal operates a large-scale notification delivery system. They have high uptime and use multiple push networks (FCM for Android/Chrome, APNs for iOS, Safari push, etc.) behind the scenes. Their system ensures duplicate suppression and cross-device sync (they won’t send the same notification twice to the same user on multiple devices if configured that way). Many apps and websites use OneSignal for mission-critical notifications. Because OneSignal is an extra layer on top of native push services, there’s a slight dependency on their infrastructure being up – but they’re proven to be reliable.

Maintenance: Maintenance is low. OneSignal will handle infrastructure updates (like changes in the push protocols or certificate updates for APNs). You will need to keep the OneSignal SDK up to date and monitor any deprecation notices from them. The initial setup (e.g., ensuring your site’s manifest and service worker are configured for OneSignal) is a one-time effort. After that, sending a notification is a simple API call (which you’d integrate into your form submission handlers). One potential maintenance consideration is that you’ll be managing another third-party account – e.g., making sure your OneSignal app ID and keys remain configured, and possibly dealing with their dashboard for any settings. Overall it’s easy to maintain, especially compared to a fully custom push system.

Privacy: OneSignal will store certain data: device tokens, potentially the content of notifications (for logging/delivery purposes), and any user data you attach (you might not need to attach much beyond maybe an admin user ID or so). They assert GDPR compliance and even highlight that in the free plan
onesignal.com
. Still, you are trusting a third party with your notification content. For admin notifications (like “New RSVP from Alice”), this is likely fine. Ensure your privacy policy can accommodate using an external service for notifications. OneSignal allows some branding customization in paid plans; on free, the notifications might show a OneSignal badge (small) in some cases, but that’s mostly for in-app inbox, not for push. All in all, privacy is standard for a cloud push service – just be mindful of what data you include in the messages.
Pusher Beams

Cost: Pusher Beams offers a free Sandbox tier that supports up to 1,000 subscribers/devices
pusher.com
. This is more than enough if only a handful of admin users need notifications (each browser or device counts as one subscriber). The free tier allows a generous 200k messages per day as well (according to community info), which covers 10k/month easily. Paid plans start at $29/month for 10,000 subscribers
knock.app
(which likely isn’t needed for our scale). So effectively, Pusher Beams can be used free of charge for this use case.

Integration Effort: Pusher Beams is a developer-centric push notification service. You need to integrate their SDKs on each platform. For web, that means including their JavaScript SDK and setting up a Service Worker (they provide guidance for this). You’ll also need to register devices (subscribe) and publish notifications via Pusher’s API from your server (or use one of their server SDKs). The setup is somewhat similar to using FCM directly, but Pusher abstracts the direct dealing with FCM/APNs – you give Pusher your FCM/APNs credentials, and you use Pusher’s API for everything. This simplifies multi-platform handling but is another layer to configure. Pusher’s documentation is generally good, and their integration is moderately easy if you’re comfortable with adding an SDK. It may be a bit more work than OneSignal because you’ll likely implement your own UI for permission prompts and such.

Mobile Support: Beams supports iOS, Android, and web push. It’s specifically made for “transactional” push notifications on multiple platforms
reddit.com
knock.app
. Admins can get mobile push whether they use a mobile web PWA or a future native app (Pusher has native SDKs too). It ensures devices get the push in real-time. However, unlike some services, Pusher is focused purely on push (no SMS/email fallback). That’s fine for our needs.

Reliability: Pusher has been a trusted real-time messaging provider (for websockets) for years, and Beams leverages a globally distributed infrastructure (now under MessageBird). Delivery is reliable – Pusher handles the delivery to FCM/APNs under the hood. They also have features like batching and batch-delivery triggers. Since Beams is used for critical notifications (like in trading apps, etc.), it’s designed to be dependable. On the free tier (Sandbox) there may be some minor rate limits (1,000 subscribers and possibly limited support), but not likely an issue at low volume. Overall reliability is high; using Pusher means your system’s reliability adds one external dependency (Pusher’s uptime, which is generally good).

Maintenance: Pusher Beams will require maintaining your app’s integration with their keys and possibly updating SDK versions occasionally. It’s a fairly “set and forget” service – once it’s working, you mainly just call their API to send notifications. You should monitor if you approach the free subscriber limit (not likely here). If any Pusher configuration changes (like migrating from Sandbox to production tier), that would require adjustments. Another maintenance aspect is that Pusher doesn’t provide a GUI for composing notifications (it’s all via API), but since you’d automate sends from code, that’s fine. Documentation and support on the free tier are community-level (standard docs, no dedicated support), so any troubleshooting might be on the developer to handle. Overall, maintenance is low to moderate, similar to FCM (since Beams is basically a wrapper around push services).

Privacy: With Pusher, you will be sending notification content and possibly some user/device identifiers to their servers. Pusher is GDPR compliant and provides a Data Processing Addendum for customers. Since Pusher is now part of MessageBird, they likely adhere to strong privacy/security practices. You won’t have fine-grained control over data location unless on higher enterprise plans. For our purposes (admin alerts), the content is not highly sensitive and using Pusher should be acceptable. Just like other third-party clouds, ensure any personal data in notifications is minimal or okay to transmit via Pusher.
Amazon SNS (Simple Notification Service)

Cost: Extremely low cost. Amazon SNS has a huge free allowance for push notifications. The first 1,000,000 mobile push messages per month are free
aws.amazon.com
. Beyond that, it’s about $0.50 per million messages
knock.app
– effectively $0 for our scale. Even if you also used SNS for SMS or email, those have separate costs, but push itself will be essentially free. AWS does not impose a hard limit at 1M; that’s just when charges would start (very inexpensive at that point). So SNS is effectively free for tens of thousands of notifications monthly.

Integration Effort: High complexity. SNS is a powerful but lower-level service. To use SNS for push, you must: set up an AWS account, configure an SNS “platform application” for each push platform (APNs, FCM, etc.), obtain and upload credentials (like the APNs key, Firebase server key), and then manage device tokens as SNS endpoints. When an admin subscribes, you’d have to call SNS APIs to create an endpoint and subscribe it to a topic. Then, on a new RSVP/contact event, publish a message to the SNS topic which fans out to subscribers. This is a lot of setup compared to other services. There is also no out-of-the-box web push support – SNS supports mobile app endpoints (iOS, Android) but not web browser push using VAPID. (SNS’s “mobile push” is for native apps via APNs/FCM). So if your admin interface is a web PWA, SNS would not directly work, unless you treat it like an Android app by using FCM anyway. In summary, integrating SNS for our scenario would be quite involved and possibly not even viable for web push without a native wrapper. It’s great if you already have AWS infrastructure and perhaps a native app. But for a Next.js web admin, SNS might be more trouble than it’s worth.

Mobile Support: For native mobile apps, SNS can send push notifications to iOS/Android (and even Kindle/Baidu) once set up. If the admins had a custom mobile app, SNS could push to it by device endpoints. However, SNS cannot send to a web browser PWA push service, since browsers like Chrome or Safari aren’t supported “platforms” in SNS. (SNS’s notion of “mobile push” leverages FCM/APNs protocols, which web browsers don’t use in the same way). So mobile support in the sense of mobile devices is there only with a native app. If your admin users will rely on receiving notifications via their mobile web browser, SNS isn’t suitable. SNS could send an SMS or email as a workaround, but that’s out of scope (and not as immediate as a push).

Reliability: As part of AWS, SNS is extremely reliable and scalable. It can handle enormous throughput with very low latency across multiple regions. It’s used for critical message delivery in many systems. If properly configured, SNS delivering to device push endpoints is as reliable as APNs/FCM (it essentially passes the message to those services). AWS’s uptime and redundancy are excellent. You also benefit from the ability to retry or catch delivery feedback (like device unregistration feedback). The reliability is top-notch technically, but you have to manage configuration correctly to achieve that.

Maintenance: Using SNS means maintaining AWS resources. You’ll need to manage credentials for each platform (update Apple push certificates annually, etc.), handle endpoint management (removing stale device tokens when needed), and monitor for delivery errors via AWS logs. There’s also the overhead of AWS itself – ensuring the IAM permissions are correct, the costs are monitored (though likely $0), and possibly writing a bit of backend code (perhaps an AWS Lambda) to simplify publishing. The development team should have AWS expertise to some extent. This is higher maintenance compared to a turnkey service like OneSignal or Pusher. If your stack is already on AWS and you prefer infrastructure-as-code, SNS might fit in, but if not, it’s a lot to maintain just for notifications.

Privacy: SNS will handle content of notifications and device tokens, but within your AWS account’s environment. This is arguably more private than third-party clouds – data isn’t shared with another company since you control the AWS account. AWS is fully compliant with GDPR, ISO, etc., and you can choose regions for data residency if needed. If keeping user data within your own cloud is important, SNS is strong in that aspect. Just be aware that device push notifications still transit through Apple/Google push services as with any solution. Overall, privacy can be well-managed with SNS, at the cost of more setup.
Slack/Discord Webhooks

Cost: Both Slack and Discord incoming webhooks are free to use. You might already use Slack or Discord for team communication – sending messages into a channel incurs no cost (Slack’s free plan has some limitations like only 90 days archive, but posting via webhooks is allowed). Discord has no message limit for webhooks beyond rate limits. This approach essentially piggybacks on these chat platforms, which are free for the scale in question.

Integration Effort: Very simple – you would configure an Incoming Webhook URL in Slack or Discord, then your system makes an HTTP POST with a JSON payload whenever a new RSVP or contact form is submitted. The message appears in your channel almost instantly. Slack and Discord have straightforward webhook APIs (just one POST call needed with a formatted message text). You’d need to do a one-time setup to get the webhook URL. No complex SDK integration required. On Slack, for example, you add an “Incoming Webhook” app to your workspace and choose a channel. For Discord, you create a webhook on a channel. The content of the message can include text and basic formatting (and even @ mentions in Slack if you want to alert a specific person or everyone). Note: This is not a push notification in the traditional sense, but it achieves the goal by leveraging Slack/Discord’s own notification on mobile.

Mobile Support: If the admin team uses the Slack or Discord app on their phones, they will get a push notification from Slack/Discord whenever the webhook posts a message in the channel (assuming their notification settings trigger for that message). For Slack, one can configure notifications such that any message in that channel (or ones that mention them) sends a push alert on mobile. Discord similarly will alert if the channel or message meets their notification rules (you can make a dedicated channel and set it to notify for all messages). So yes, mobile push via Slack/Discord app happens, though indirectly. The experience is slightly different – the notification comes from Slack, not from “your app,” and clicking it opens Slack/Discord rather than your admin dashboard. That could be a drawback if you wanted the admin to jump directly into the admin panel on their phone when tapping the notification. Slack and Discord messages can include links, so you could put a URL to your admin dashboard or the specific RSVP detail – but the user would have to tap that link inside Slack.

Reliability: Slack and Discord are quite reliable for message delivery. Slack has high uptime and is used for critical team communications; Discord as well for communities. There could be occasional delays if Slack is under heavy load, but generally messages appear near-instantly. The webhook itself is very reliable as long as Slack/Discord services are up. One consideration: if Slack is down or the internet connection is spotty, notifications might be missed – but that’s true of any solution. There is also a small chance of hitting rate limits if your app sent a burst of messages (Slack’s incoming webhook limit is about 1 message per second sustained
api.slack.com
, which is fine for single RSVPs). In summary, reliability is good; you’re depending on the Slack/Discord infrastructure, which is proven.

Maintenance: Maintenance is minimal. There’s no additional system to maintain aside from ensuring the webhook URL remains valid and secret. Your code to send the POST request is simple and unlikely to break. Slack and Discord rarely change their webhook APIs (any changes would be well-documented and backward compatible). You should keep the webhook URL safe (if it leaks, someone could spam your channel). If you rotate chat channels or want to change how messages look, that’s a small config change. This approach might even be considered a quick stop-gap solution since it’s so easy – and it’s easy to maintain as well.

Privacy: By using this method, you will be sending potentially sensitive info (names of people who RSVP’d, their message subjects, etc.) into a Slack or Discord channel. This data will reside on Slack/Discord servers (and in Slack it will be subject to the 90-day retention if free plan, or more if paid). If your admin team already communicates about these events in Slack/Discord, it may not be a concern. Both Slack and Discord have standard security (Slack especially for business use is quite secure and can be made to comply with many standards if on paid plans). But it’s not as controlled as keeping data within your own app. Also, if the channel has many members or is not carefully permissioned, others might see the notifications. You’d likely use a private channel with just admins. In short, it’s fine for internal operational alerts as long as everyone’s okay with that info living in the chat platform. Always ensure this aligns with your data handling policies (for instance, Slack messages might be considered exported data under GDPR, etc.).
Build-Your-Own (Custom Web Push with VAPID)

(In addition to third-party services, it’s worth noting the option of a custom solution using the Web Push API, since the PRD hints at this.)

Cost: Completely free at runtime. Using the Web Push standard with your own service worker and VAPID keys means you only pay for the minor costs of sending data over your servers and whatever push service the browsers use (which is free). There are no usage fees.

Integration Effort: High initial development effort. You need to implement subscription handling in the frontend (prompt for Notification permission, register service worker, send the subscription endpoint to your backend) and store those subscriptions (endpoints + keys) in your database. On the server, you’d use a library like web-push (as mentioned in PRD) to send notifications to each subscription endpoint. This involves generating payloads encrypted with the subscription’s public key and calling the correct browser push service endpoint (e.g., a Google URL for Chrome users, Mozilla for Firefox, etc. – the library handles this). You also must manage VAPID keys (generate and keep them safe). While there are guides and the web-push library simplifies some parts, it requires careful coding and testing (especially to ensure reliability and no duplicate notifications). You’ll basically be re-building what services like OneSignal provide out of the box.

Mobile Support: This approach uses the native Web Push on supported browsers and devices. Chrome on Android supports web push, and Safari on iOS (as of iOS 16+) supports web push via the system. So PWA users on mobile can get push notifications through this method even when the browser is closed, as long as they allowed notifications. It covers desktop browsers too. If you needed native mobile app notifications down the line, you’d have to implement APNs/FCM separately – the custom web push covers only web/PWA usage.

Reliability: Done correctly, Web Push is quite reliable. However, you’ll be responsible for handling retries, removing invalid subscriptions (e.g., if a device is offline or the subscription expired you get a response and should prune it). The push delivery itself is handled by the browser vendors’ infrastructure, which is solid (Google, Mozilla, Apple push servers). Your server just needs to be up to send the outbound request. Without a third-party in the middle, there are fewer points of failure, but also none of the advanced monitoring or multi-DC redundancy a service might offer. Essentially, reliability will be as good as your implementation – many apps implement web push themselves successfully, but it requires diligence (for example, ensuring your service worker code properly displays the notification even if the app is not open).

Maintenance: You’ll own all the code, so any browser changes to the Push API or web standards, you need to adapt to. Browser push standards are fairly stable, but nuances (like payload encryption or VAPID token expiration) may require updates. You’ll also have to maintain the push credentials (the VAPID keys – though those don’t expire usually – and any tokens if not using VAPID for legacy browsers). The E2E tests need to account for push behavior, meaning you might have to simulate or stub out push in testing which can be tricky. Overall, a custom build is more maintenance long-term because you are responsible for every layer (client, server, database of subscriptions). If the team is comfortable with that and values not having third-party dependencies, it could be worth it, but it does contradict the PRD goal of “minimal complexity.”

Privacy: This is the most private option – all data stays in your system and goes directly to user devices via their browser’s push service. No third-party sees the content (except the push service, which for web push only sees encrypted payloads if you encrypt, or at least does not have context of your app). Using VAPID, your server authenticates to browser push services in a trust-minimized way. If privacy and control are paramount, building in-house wins. Just ensure to comply with notification permission best practices (let admins know why you need permission, etc.).

Summary:
For our admin notification use case (new RSVP/contact alerts on mobile devices), there are trade-offs among these options:

    Novu: Great if you foresee needing a multi-channel notification infrastructure and want an open-source solution. It meets our free-tier needs (10k free)
    novu.co
    and can simplify future expansion (email or in-app notifications). But it adds a new component to our stack and might be overkill purely for push.

    PagerDuty: Very reliable and free for small teams, but designed for incident alerts. It could work in a pinch, yet the integration and user experience (alerts via PagerDuty app) might be too complex for a simple form notification.

    Twilio: Not recommended here – no free tier and their push notification product is ending
    courier.com
    . Unless we considered SMS as an alternative, Twilio doesn’t fit well for web push.

    FCM (Firebase): Highly appealing for pure push. It’s free and robust, and integration is moderate. If we don’t mind adding Firebase to the project, this gives a direct, no-middleman push solution backed by Google. We’d still need to build some surrounding features (UI toggle, etc.) but FCM covers the delivery aspect well.

    OneSignal: Strong option for ease-of-use. Free and unlimited push make it cost-effective
    onesignal.com
    . It offloads a lot of the heavy lifting and provides a nice admin UI if we ever need it. If minimizing development time is crucial, OneSignal is a top choice. The only downside is sending our data through a third-party and possibly an overkill dashboard for a single toggle use-case.

    Pusher Beams: Also a solid choice for developers. It’s like a middle ground – not as UI-driven as OneSignal, but more focused than raw FCM. Free for our scale, and we keep more control than with OneSignal (since we’re mostly using APIs). If our team is comfortable with a bit more coding, Beams could work similarly to FCM but with the benefit of Pusher’s unified API across platforms.

    Amazon SNS: Technically powerful and free for pushes
    aws.amazon.com
    , but likely does not support web push easily. Unless we pivot to creating a native mobile app for admins or accept SMS, SNS isn’t a fit for “browser closed” notifications in a PWA scenario. The development overhead is also high.

    Slack/Discord: Quick win approach. Virtually no development time to implement, and free. It leverages tools the team might already check frequently. This could serve as an interim solution while building a proper push system, or even long-term if the team prefers notifications in Slack. The obvious limitation is that it’s not a true push to the admin app, so it doesn’t bring the admin back into our system directly. It’s more of an alerting workaround.

Considering the above, OneSignal and FCM stand out as the most straightforward ways to meet the requirements with minimal complexity and cost. OneSignal requires less custom code (faster to implement), whereas FCM keeps everything under our control (no third-party UI) but needs a bit more coding. Novu is appealing if we want a unified notification system and possibly to support other channels down the line, but if push notifications are the only need, its complexity might not be justified.

Ultimately, if the priority is speed of implementation and reliability, a service like OneSignal would allow us to turn on mobile push notifications quickly with a toggle for admins, and it’s free for our usage range
onesignal.com
. If the priority is control and avoiding external dependencies, implementing Firebase Cloud Messaging or even a custom Web Push solution with VAPID are viable – with FCM offering a nice balance of low cost (free) and reduced maintenance (Google handles the push infrastructure)
knock.app
knock.app
.
Citations

Novu - Open-source notifications infrastructure for devs and product teams
<https://novu.co/>

Novu - Open-source notifications infrastructure for devs and product teams
<https://novu.co/>

Novu - Open-source notifications infrastructure for devs and product teams
<https://novu.co/>

Novu - Open-source notifications infrastructure for devs and product teams
<https://novu.co/>

Novu - Open-source notifications infrastructure for devs and product teams
<https://novu.co/>

Incident Management Pricing | PagerDuty
<https://www.pagerduty.com/pricing/incident-management/>

Incident Management Pricing | PagerDuty
<https://www.pagerduty.com/pricing/incident-management/>

Incident Management Pricing | PagerDuty
<https://www.pagerduty.com/pricing/incident-management/>

Twilio Notify Shuts Down: Why Migrate to Courier over Knock or One Signal
<https://www.courier.com/blog/what-you-need-to-know-about-twilio-notifys-end-of-life>

Twilio Notify Shuts Down: Why Migrate to Courier over Knock or One Signal
<https://www.courier.com/blog/what-you-need-to-know-about-twilio-notifys-end-of-life>

The top 6 push notification providers in 2025 | Knock
<https://knock.app/blog/evaluating-the-best-push-notifications-providers>

The top 6 push notification providers in 2025 | Knock
<https://knock.app/blog/evaluating-the-best-push-notifications-providers>

The top 6 push notification providers in 2025 | Knock
<https://knock.app/blog/evaluating-the-best-push-notifications-providers>

Pricing - OneSignal
<https://onesignal.com/pricing>

Pricing - OneSignal
<https://onesignal.com/pricing>

OneSignal vs Twilio: which should you choose in 2025?
<https://ably.com/compare/onesignal-vs-twilio>

OneSignal vs Twilio: which should you choose in 2025?
<https://ably.com/compare/onesignal-vs-twilio>

Pricing - OneSignal
<https://onesignal.com/pricing>

Pusher Beams | Pricing
<https://pusher.com/beams/pricing/>

What options for push notifications service other than firebase? (With ...
<https://www.reddit.com/r/node/comments/12oemth/what_options_for_push_notifications_service_other/>

The top 6 push notification providers in 2025 - Knock
<https://knock.app/blog/evaluating-the-best-push-notifications-providers>

AWS End User Messaging Pricing
<https://aws.amazon.com/end-user-messaging/pricing/>

Rate Limits - Slack API
<https://api.slack.com/apis/rate-limits>

The top 6 push notification providers in 2025 | Knock
<https://knock.app/blog/evaluating-the-best-push-notifications-providers>
All Sources
novu
pagerduty
courier
knock
onesignal
ably
pusher
reddit
aws.amazon
api.slack
