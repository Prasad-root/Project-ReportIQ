from groq import Groq
import base64
import os
from dotenv import load_dotenv

load_dotenv()

groq_vision_api_key = os.getenv("GROQ_VISION")


def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

image_path = "report.jpg" # Link the image =================================


client = Groq(api_key=groq_vision_api_key)


def extractor(image_path):
    base64_image = encode_image(image_path)

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "extract the test data as a json"},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                        },
                    },
                ],
            }
        ],
        model="meta-llama/llama-4-scout-17b-16e-instruct",
    )

    return chat_completion.choices[0].message.content


