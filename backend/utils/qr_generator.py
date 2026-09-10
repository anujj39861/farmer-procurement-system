import io
import base64
import json

def generate_qr_data_url(payload_dict: dict) -> str:
    """
    Generates a Data URI string (data:image/png;base64,...) for a given payload dict.
    Uses qrcode library if installed, otherwise creates a structured JSON data URL.
    """
    payload_str = json.dumps(payload_dict)
    try:
        import qrcode
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=8,
            border=2,
        )
        qr.add_data(payload_str)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    except Exception as e:
        # Fallback to base64 JSON payload image representation
        b64 = base64.b64encode(payload_str.encode()).decode()
        return f"data:application/json;base64,{b64}"
