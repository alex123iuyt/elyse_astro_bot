export async function POST(req: Request) {
	const body = await req.json();
	const { system, instructions, prompt, active } = body || {};
	return Response.json({ text: `Echo (packs: ${active || '—'}): ${prompt || ''}` });
}















