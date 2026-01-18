import os
from twilio.rest import Client

def send_sms(phone, message):
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    client = Client(account_sid, auth_token)

    # Ensure phone number has country code
    if not phone.startswith("+"):
        phone = "+91" + phone  # India default

    msg = client.messages.create(
        body=message,
        from_=from_number,
        to=phone
    )

    return {
        "sid": msg.sid,
        "status": msg.status
    }
