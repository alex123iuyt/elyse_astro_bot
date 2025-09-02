"use client";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export type Story = { id:string; title:string; image:string; text?:string; };

export default function StoryGrid({stories}:{stories:Story[]}) {
	const r = useRouter();
	return (
		<div className="grid grid-cols-3 gap-3">
			{stories.map(s=> (
				<button key={s.id} onClick={()=>r.push(`/stories?open=${s.id}`)}
					className="relative aspect-[9/16] overflow-hidden rounded-xl border border-white/10">
					<Image src={s.image} alt={s.title} fill className="object-cover" />
					<div className="absolute inset-x-0 bottom-0 p-2 text-left text-sm bg-gradient-to-t from-black/60 to-transparent">
						{s.title}
					</div>
				</button>
			))}
		</div>
	);
}















