import { supabase } from '../services/supabaseClient';
import fs from 'fs';
import path from 'path';

/**
 * MIGRATION SCRIPT v4 (Fixed for Node Environments)
 * This script bypasses binary require() errors by mocking the extensions.
 */

// Mock binary extensions so Node doesn't try to parse them as JS
['.jpeg', '.jpg', '.png', '.mp4', '.webp'].forEach(ext => {
    (require as any).extensions[ext] = () => 0;
});

const STORAGE_BASE_URL = 'https://njjaasptelgqozpnjfxi.supabase.co/storage/v1/object/public/Place_DB';

async function migrate() {
    console.log('🚀 Starting migration (UUID + Slug)...');

    const placesFilePath = path.resolve(__dirname, '../constants/places.ts');
    const content = fs.readFileSync(placesFilePath, 'utf8');
    
    // Now we can safely require the places file because we mocked the binary extensions
    const { ALL_PLACES } = require('../constants/places');

    for (const place of ALL_PLACES) {
        console.log(`Processing: ${place.title}`);

        // Regex to extract filenames from the original source text
        const placeSectionMatch = content.match(new RegExp(`id: "${place.id}"[\\s\\S]*?},`, 'g'));
        const section = placeSectionMatch ? placeSectionMatch[0] : '';

        const imageMatch = section.match(/image: require\("\.\.\/PlaceDB\/Images\/(.*?)"\)/);
        const videoMatch = section.match(/video: require\("\.\.\/PlaceDB\/Videos\/(.*?)"\)/);
        const galleryMatches = [...section.matchAll(/require\("\.\.\/PlaceDB\/Images\/(.*?)"\)/g)];
        const galleryFilenames = galleryMatches
            .map(m => m[1])
            .filter(name => name !== (imageMatch ? imageMatch[1] : ''));

        const image_url = imageMatch ? `${STORAGE_BASE_URL}/Images/${imageMatch[1]}` : null;
        const video_url = videoMatch ? `${STORAGE_BASE_URL}/Videos/${videoMatch[1]}` : null;
        const gallery_urls = galleryFilenames.map(name => `${STORAGE_BASE_URL}/Images/${name}`);

        const { error } = await supabase
            .from('places')
            .upsert({
                slug: place.id,
                title: place.title,
                category: place.category,
                description: place.description,
                description_short: place.description_short,
                location: place.location,
                lat: place.lat,
                lng: place.lng,
                avg_duration_mins: place.avg_duration_mins,
                opening_time: place.opening_time,
                closing_time: place.closing_time,
                best_visit_time: place.best_visit_time,
                rating: place.rating,
                entry_fee: place.entry_fee,
                image_url: image_url,
                video_url: video_url,
                gallery: gallery_urls
            }, { onConflict: 'slug' });

        if (error) {
            console.error(`❌ Error migrating ${place.title}:`, error.message);
        } else {
            console.log(`✅ Migrated ${place.title}`);
        }
    }

    console.log('🎉 Migration successful with UUIDs and Slugs!');
}

migrate().catch(console.error);
