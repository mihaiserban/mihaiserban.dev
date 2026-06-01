---
slug: how-to-handle-aws-ses-bounces-and-complaints
title: How to handle AWS SES bounces and complaints
description: "If you’re thinking of implementing AWS Simple Email Service for your product, you might find out that you need a flow to handle email…"
date: "2018-11-02T00:00+02:00"
hidden: false
tags:
  - AWS
---

If you’re thinking of implementing AWS Simple Email Service for your product, you might find out that you need a flow to handle email bounces and complaints before AWS approves your service quota increase and take your SES account out of sandbox mode.

This requirement assures SES maintains a high reputation for only delivering mail people want and thereby maintaining a high deliverability for legitimate mail.

What exactly are email bounces and complaints?

**Bounce** email happens when an is returned to the sender because it cannot be delivered for some reason.

**Complaints** are reports made by email recipients against emails they don’t want in their inbox. Mark as SPAM for example triggers such a report. Email Service Providers (ESPs), have what is called a “feedback loop” with all of the major Internet Service Provides (ISPs).

In case your API receives a Bounce/Complaint you should take steps to make sure it doesn’t happen again. Easiest way is to not send emails to that user, unless he agrees to receive it.

#### Overview of the sending process

The following figure shows the process of sending an email via [AWS SES](http://aws.amazon.com/ses/).

![AWS SES diagram](/images/blog/1_pEz2kdAeiT6ljb32F6J9fw.png)

If the sender request to SES succeds then it can expect one of the following outcomes:

*   **success**
*   **bounce**
*   **complaint**

#### Overview of handling of bounce/complaints

The following figure shows the process of handling bounce/complaints by using [AWS SNS](https://aws.amazon.com/sns) service.

![AWS SES flow diagram](/images/blog/1_-eRHvZt-9R_R_7f6f0yCvw.png)

Bounce and complaint notifications are available by email or through Amazon Simple Notification Service (Amazon SNS). By default, these notifications are sent to you via email by a feature called _email feedback forwarding_.

#### 1. Setup AWS SNS topics for bounce and complaints

Create the following topics in [AWS SNS](https://docs.aws.amazon.com/sns/latest/dg/sns-http-https-endpoint-as-subscriber.html#SendMessageToHttp.prepare):

*   ses-bounces-topic-prod
*   ses-complaints-topic-prod
*   ses-deliveries-topic-prod (optional)

![AWS SES create topic](/images/blog/1_JZ8CVlRWquIv20SKnUIjHg.png)

After creating each topic, you’ll receive a identity id is called **ARN,** which we need in the next step of creating a SNS subscription.

![AWS SES topics](/images/blog/1_sWjh8Qxn-o5wyqvI5Ipe3Q.png)

Head to **SNS Subscriptions** and create a SNS subscription for the bounce and complaint topics you’ve previously created.

This is where we need to specify a Endpoint where we’ll receive notifications from each topic. Endpoint must be a **POST** method on your backend.

![AWS SES create subscription](/images/blog/1__Bnw9nIcRwC4LjH9hd3Mow.png)

Each Subscription needs to be confirmed, after creation they are in a **PendingConfirmation** state.

To confirm our subscription, we need to implement the endpoints in our backend, and call Request confirmations from the SNS dashboard.

In the body received on our server we’ll find the SubscribeURL or Token which we can use to confirm.

Call sns.confirmSubscription() with the Token or copy pasting SubscribeURL into SNS Dashboard.

![AWS SES confirm subscription url](/images/blog/1_T_bSIOjMnaOaHs9PwEevnw.png)

> **I’ve provided the code to subscribe and confirm each endpoint on** [**Github**](https://gist.github.com/mihaiserban/8a03fd28e54cac8856dbdfebd95bd7b3)**.**

> **TIP: Make sure your IAM User has access to SNS**

#### 2. Configure SES to publish notifications to each created SNS topic

Go to the SES Managment Console -> Email Addresses -> Select email address, and open Notifications.

Edit configuration and select the SNS topic for each type of notification.

![AWS SES notifications configuration](/images/blog/1_k4fHq6CgGYUeXZjNmyXOLA.png)

#### 3. Testing using [AWS Mailbox Simulator](https://aws.amazon.com/blogs/aws/mailbox-simulator-for-the-amazon-simple-email-service/)

The AWS mailbox simulator can be found in SES Managment Console and provides a way to test the way your implementation handles scenarios like bounces and complaints.

![AWS SES test email](/images/blog/1_Pydm3yb5aGuuRerVw6mxcQ.png)

Mail sent to **success@simulator.amazonses.com** will be treated as delivered successfully.

Mail sent to **bounce@simulator.amazonses.com** will be rejected with an SMTP 550 (“Unknown User”) response code. Amazon SES will send you a bounce notification by email or by SNS notification.

Mail sent to **ooto@simulator.amazonses.com** will be treated as delivered successfully.

Mail sent to **complaint@simulator.amazonses.com** will simulate the case in which the recipient clicks **Mark as Spam** within their email application and the ISP sends a complaint response to Amazon SES.

Mail sent to **blacklist@simulator.amazonses.com** will cause Amazon SES to block the send attempt and return a [MessageRejected](http://docs.amazonwebservices.com/ses/latest/DeveloperGuide/Troubleshooting.MessageRejected.html) error containing an “Address Blacklisted” error message.

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://x.com/MihaiSerban), and share this with your friends 😀🙏🏻
