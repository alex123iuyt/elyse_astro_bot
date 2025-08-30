"use client";
import { useState } from 'react';
import StoryGrid from '../../components/StoryGrid'
import StoryViewer, { Story } from '../../components/StoryViewer'
import { stories as data } from '../../data/today'

export default function StoriesPage(){
	const stories = data.map(s=>({ id:s.id, title:s.title, image:s.image, text:s.text }));
	const [selectedStory, setSelectedStory] = useState<Story | null>(null);
	
	return (
		<div className="p-4 space-y-6">
			<h1 className="text-xl font-semibold">Stories</h1>
			<StoryGrid stories={stories} />
			            {selectedStory && (
              <StoryViewer 
                story={selectedStory} 
                onClose={() => setSelectedStory(null)}
                stories={stories}
                currentIndex={stories.findIndex(s => s.id === selectedStory.id)}
                onNavigate={(index) => setSelectedStory(stories[index])}
              />
            )}
		</div>
	);
}





