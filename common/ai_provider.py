from typing import Dict, Any
from openai import OpenAI
from .config import OPENAI_API_KEY, USE_AI
import asyncio


class AIProvider:
    def __init__(self) -> None:
        self.enabled = bool(USE_AI and OPENAI_API_KEY)
        self.client = OpenAI(api_key=OPENAI_API_KEY) if self.enabled else None

    async def generate(self, system_prompt: str, user_prompt: str, model: str = "gpt-4", temperature: float = 0.7, max_tokens: int = 400) -> str:
        if not self.client:
            return "ИИ отключён."
        def _req():
            return self.client.chat.completions.create(
                model=model,
                messages=[{"role":"system","content":system_prompt},{"role":"user","content":user_prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
            )
        resp = await asyncio.to_thread(_req)
        return resp.choices[0].message.content.strip()

ai_provider = AIProvider()











