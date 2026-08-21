import os
import modal

# -------------------------------------------------------------
# Configuration
# -------------------------------------------------------------
APP_NAME = "sapphire-qwen-image"
GPU = "A10G"  # 24GB VRAM
IMAGE_WIDTH = 1080
IMAGE_HEIGHT = 1350

# Modal Container Image with GPU & Diffusers/Flux stack
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "ffmpeg", "libsm6", "libxext6")
    .pip_install(
        "torch>=2.1.0",
        "torchvision",
        "diffusers>=0.30.0",
        "transformers>=4.40.0",
        "accelerate>=0.30.0",
        "sentencepiece",
        "protobuf",
        "fastapi",
        "uvicorn",
        "huggingface_hub",
        "pydantic",
    )
)

app = modal.App(APP_NAME, image=image)
volume = modal.Volume.from_name("sapphire-flux-model-cache", create_if_missing=True)

# Secret configuration
auth_secret = modal.Secret.from_dict({
    "API_KEY": os.environ.get("MODAL_QWEN_API_KEY", "sapphire_modal_secret_key")
})

# -------------------------------------------------------------
# Direct GPU FastAPI Endpoint
# -------------------------------------------------------------
@app.cls(
    gpu=GPU,
    volumes={"/model-cache": volume},
    timeout=600,
    max_containers=3,
    secrets=[auth_secret],
)
class QwenImageService:
    @modal.enter()
    def load_model(self):
        import torch
        from diffusers import FluxPipeline

        print("Loading FLUX.1-schnell pipeline into GPU...")
        self.pipe = FluxPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-schnell",
            torch_dtype=torch.bfloat16,
            cache_dir="/model-cache",
        )
        self.pipe.enable_model_cpu_offload()
        print("Model loaded successfully!")

    @modal.fastapi_endpoint(method="POST")
    def generate(self, data: dict):
        import base64
        import torch
        from io import BytesIO
        from fastapi import HTTPException

        expected_key = os.environ.get("API_KEY", "sapphire_modal_secret_key")
        # Validate request
        prompt = data.get("prompt", "Canva-grade graphic design")
        width = int(data.get("width", IMAGE_WIDTH))
        height = int(data.get("height", IMAGE_HEIGHT))
        steps = int(data.get("steps", 4))
        seed = data.get("seed")

        generator = None
        if seed is not None:
            generator = torch.Generator(device="cpu").manual_seed(int(seed))

        w = (width // 16) * 16
        h = (height // 16) * 16

        image = self.pipe(
            prompt=prompt,
            width=w,
            height=h,
            num_inference_steps=max(4, steps),
            guidance_scale=0.0,
            generator=generator,
            max_sequence_length=256,
        ).images[0]

        buf = BytesIO()
        image.save(buf, format="PNG")
        b64_str = base64.b64encode(buf.getvalue()).decode("ascii")

        return {
            "image": b64_str,
            "format": "png",
            "provider": "Modal GPU (FLUX.1 Schnell)",
        }
